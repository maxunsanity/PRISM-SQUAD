import * as THREE from 'three';
import type { GameData, GameState, SkillConfig } from './data';
import { bossPatternList, bossPatternNum } from './data';
import type { Renderer3D } from '../three/Renderer3D';
import { PlayerMesh } from '../three/PlayerMesh';
import { InputController } from './InputController';
import { EnemySystem, type ChaseMode } from './EnemySystem';
import { SkillSystem } from './SkillSystem';
import { DropSystem } from './DropSystem';
import { BossController } from './BossController';
import { VfxSystem } from './VfxSystem';
import { ArenaWallSystem } from '../three/ArenaWallSystem';
import { hudStore, type SkillCardData, type LuckyTrainSkillItem } from './hudExternalStore';
import type { EnemyId, FormationSpawnConfig, RushConfig, ShopBoxGradeConfig } from './data';
import { fmtKrw, pickEnemyIdFromRates, pickWeighted } from './shopUtils';
import type { EventBridge } from '../eventSystem/tycoonSeason/host/EventBridge';
import type { SalesRewardLine } from '../eventSystem/sales/types';
import { focusPrismGameShell, getActiveMinigameIframe, resumeEventMinigame } from './eventMinigameHost';
import { archeryOnEnemyKill, syncArcheryHud } from './archeryMeta';
import { refreshEventRedDots } from './eventRedDots';

export class GameCore {
  private data: GameData;
  private renderer: Renderer3D;
  private input: InputController;
  private player: PlayerMesh;
  private bossArrow: THREE.Mesh;
  private ninjaScrollMesh: THREE.Mesh | null = null;
  private ninjaScrollAngle = 0;
  private magnetRingMesh: THREE.Mesh | null = null;
  private magnetRingTimer = 0;

  /* 플레이어 월드 좌표 / 상태 */
  private px = 0;
  private py = 0;
  private hp: number;
  private maxHp: number;    // 영구 특성 hp 보너스 반영된 실효 최대 HP
  private invincTimer = 0;  // 무적 타이머 (초)
  private debuffTimer = 0;  // 디버프 타이머 (초)

  /* XP / 레벨 */
  private xp = 0;
  private totalXpEarned = 0;
  private level = 1;
  private xpMult = 1.0;     // ninjaScroll 패시브
  private speedMult = 1.0;  // elasticShoes 패시브
  private gold = 0;
  private killCount = 0;
  private killAccumForTicket = 0;

  /* 스킬 장착 현황: skillId → level */
  private equippedSkills: Map<string, number> = new Map();

  /* 타이머 */
  private elapsedSec = 0;
  private stageElapsedSec = 0;
  private currentStage = 1;
  private gameState: GameState = 'PAUSED';

  /* 라바 퀘스트 모드 */
  public lavaQuestMode = false;
  public lavaQuestLevel = 1;
  public lavaQuestIsLast = false;
  public lavaQuestDurationSec = 60;
  public lavaQuestElapsed = 0;
  private lavaQuestBossCfg: import('./data').BossConfig | null = null;

  /* 맵 경계 */
  private mapHalfW: number;
  private mapHalfH: number;

  /* 서브시스템 */
  private enemySystem: EnemySystem;
  private skillSystem: SkillSystem;
  private dropSystem: DropSystem;
  private bossCtrl: BossController;
  private vfxSystem: VfxSystem;

  /* 웨이브 스폰 */
  private spawnTimer = 0;
  private bossSpawned = false;
  private bossWarningShown = false;
  private spawnedMiniBossIds = new Set<string>();
  private arenaSystem!: ArenaWallSystem;
  private arenaCenterX = 0;
  private arenaCenterY = 0;
  private triggeredRushIds = new Set<number>();
  private triggeredFormationIds = new Set<number>();
  private miniBossCycleSec = 100;
  private nextMiniBossCycleSec = 100;
  private miniBossCycleIndex = 0;
  private rushCycleSec = 50;
  private nextRushCycleSec = 50;
  private rushCycleId = 10000;
  // 미니보스 인스턴스 추적
  private nexusEnemy: import('./EnemySystem').EnemyInstance | null = null;
  private nexusMissileTimer = 0;
  private nexusPatternIndex = 0; // 0=집중사격, 1=회전산탄
  private movingMiniBoss: import('./EnemySystem').EnemyInstance | null = null;

  // 에너지(번개) 배수 시스템 — 입장 시 번개 소모, 소모량 비례 보상 배수
  private metaEnergy: number;
  private ticketMultiplier = 1;           // 이번 판 적용 배수
  private selectedMult = 1;               // 선택 중인 배수
  private readonly multOptions: number[];

  // 영구 특성 (talent_id → 현재 레벨)
  private talentLevels: Record<string, number> = {};
  private metaGold: number;
  // 장비 (slot_id → 현재 레벨)
  private equipLevels: Record<string, number> = {};
  // 장착 중인 슬롯 (장착/해제 토글)
  private equippedSlots = new Set<string>();

  // 모험 레벨 (아웃게임 EXP 누적)
  private metaGems: number;
  /** 상점 구매 테스트 — 캐시 DB (원화, 미저장) */
  private metaCashKrw: number;
  private supplyKeys = 0;
  private defensePity = 0;
  /** 보석 패키지 첫 구매 여부 (첫 구매만 두배 보너스) */
  private purchasedGemPacks = new Set<string>();
  private adventureExp = 0;
  private adventureLevel = 1;
  // 도전 (클리어한 challenge_id)
  private clearedChallenges = new Set<number>();
  private activeChallengeId = 0;          // 현재 도전 중 (0=일반 전투)
  private challengeHpMult = 1;
  private challengeDmgMult = 1;
  // 진화 (해금한 evo_id)
  private unlockedEvolutions = new Set<number>();
  private armorReduction = 0;             // 진화 armor 합산 (피해 감소율)
  private metaDna: number;
  private predatorHealRatio: number;
  // 특수진화 인게임 효과
  private predatorHealChance = 0;         // 처치 시 회복 확률
  private magnetRangeBonus = 0;
  private itemDropChance: number;
  private selectedPlayerId = 'default';   // 현재 선택/장착된 캐릭터 ID
  /* 진화 완료된 스킬 ID 세트 */
  private evolvedSkills: Set<string> = new Set();
  private transitionTimer: number | null = null;
  private bossDeathTimer: number | null = null;
  private bossDeathPending = false;
  private bossSpawnInvulnTimer = 0;
  private pendingStageAdvance = false;
  private eventBridge: EventBridge | null = null;

  attachEventBridge(bridge: EventBridge | null) {
    this.eventBridge = bridge;
  }

  constructor(data: GameData, renderer: Renderer3D, container: HTMLElement) {
    this.data = data;
    this.multOptions = data.ticketMultSteps.length ? data.ticketMultSteps : [1, 2, 5, 10, 50, 100];
    this.renderer = renderer;
    const { meta, shopTest } = data;
    this.metaGold = meta.initialGold;
    this.metaGems = meta.initialGems;
    this.metaCashKrw = shopTest.testCashKrw;
    this.metaEnergy = meta.initialEnergy;
    this.metaDna = meta.initialDna;
    this.predatorHealRatio = meta.predatorHealRatio;
    this.itemDropChance = meta.itemDropChance;

    /* 특성 레벨 초기화 (0) */
    for (const t of this.data.talents) {
      this.talentLevels[t.talent_id] = 0;
    }
    /* 장비 레벨 초기화 — 기본 지급(Lv.1). 무기는 1종만 장착(상호 배타), 나머지 슬롯은 장착 */
    let firstWeaponEquipped = false;
    for (const eq of this.data.equipment) {
      this.equipLevels[eq.slot_id] = 1;
      const isWeapon = !!eq.skill_id;
      if (isWeapon) {
        if (!firstWeaponEquipped) { this.equippedSlots.add(eq.slot_id); firstWeaponEquipped = true; }
      } else {
        this.equippedSlots.add(eq.slot_id);
      }
    }
    /* 영구 데이터 로드 (메타 골드 + 특성 + 장비 레벨 + 아바타 ID) */
    this._loadMeta();
    syncArcheryHud();
    refreshEventRedDots();

    const activeChar = this.data.players.find(p => p.player_id === this.selectedPlayerId) || this.data.player;
    this.maxHp = activeChar.max_hp;
    this.hp = this.maxHp;
    this.mapHalfW = data.map.map_width  / 2 - activeChar.radius;
    this.mapHalfH = data.map.map_height / 2 - activeChar.radius;

    /* 플레이어 메쉬 */
    this.player = new PlayerMesh(activeChar, renderer.scene, data.playerVisual);
    this.player.setPosition(0, 0);
    this.player.setHp(this.hp);
    this.player.setWeaponEquipped(this._hasWeaponEquipped());
    this.player.setWeaponType(this._equippedWeaponKind());

    /* 입력 컨트롤러 */
    this.input = new InputController(container, data.control);

    /* 서브시스템 초기화 */
    this.arenaSystem = new ArenaWallSystem(renderer.scene, data.bossPatterns);
    this.enemySystem = new EnemySystem(renderer.scene, data);
    this.skillSystem = new SkillSystem(renderer.scene, data);
    this.dropSystem  = new DropSystem(renderer.scene, data);
    this.bossCtrl    = new BossController(renderer.scene, data.finalBoss, data.bossPatterns);
    this.vfxSystem   = new VfxSystem(renderer.scene, data.vfx);
    this._resetSpawnSchedule();

    /* ── 보스 오프스크린 포인터 화살표 생성 ── */
    const arrowShape = new THREE.Shape();
    const size = 6;
    arrowShape.moveTo(size * 1.5, 0);
    arrowShape.lineTo(-size * 0.8, size * 0.9);
    arrowShape.lineTo(-size * 0.2, 0);
    arrowShape.lineTo(-size * 0.8, -size * 0.9);
    arrowShape.closePath();
    const arrowGeo = new THREE.ShapeGeometry(arrowShape);
    const arrowMat = new THREE.MeshStandardMaterial({
      color: 0xFF3300,
      emissive: 0xFF1100,
      emissiveIntensity: 2.0,
      transparent: true,
      opacity: 0.95,
      side: THREE.DoubleSide
    });
    this.bossArrow = new THREE.Mesh(arrowGeo, arrowMat);
    this.bossArrow.position.set(0, 0, 20);
    this.bossArrow.visible = false;
    renderer.scene.add(this.bossArrow);

    /* 무기 비주얼만 동기화 (스킬 장착은 게임 시작 시점에 수행) */
    this.skillSystem.basicSkillId = this._equippedWeaponSkill();

    /* 게임 루프 연결 */
    renderer.setOnFrame(dt => this._tick(dt));

    /* 이벤트 바인딩 */
    window.addEventListener('prism:action', this._onAction);
    window.addEventListener('prism:skillSelect', this._onSkillSelect);
    window.addEventListener('luckyTrain:select', this._onLuckyTrainSelect);
    window.addEventListener('luckyTrain:buy', this._onLuckyTrainBuy);
    window.addEventListener('luckyTrain:close', this._onLuckyTrainClose);
    window.addEventListener('lobby:cycleMult', this._onLobbyCycleMult);
    window.addEventListener('energy:buy', this._onEnergyBuy);
    window.addEventListener('energy:close', this._onEnergyClose);
    window.addEventListener('energy:open', this._onEnergyOpen);
    window.addEventListener('lobby:selectStage', this._onLobbySelectStage);
    window.addEventListener('lobby:openTalent', this._onOpenTalent);
    window.addEventListener('talent:upgrade', this._onTalentUpgrade);
    window.addEventListener('talent:close', this._onTalentClose);
    window.addEventListener('lobby:openEquip', this._onOpenEquip);
    window.addEventListener('equip:upgrade', this._onEquipUpgrade);
    window.addEventListener('equip:toggle', this._onEquipToggle);
    window.addEventListener('equip:equip', this._onEquipEquip);
    window.addEventListener('equip:unequip', this._onEquipUnequip);
    window.addEventListener('equip:close', this._onEquipClose);
    window.addEventListener('advUp:close', this._onAdvUpClose);
    window.addEventListener('lobby:toast', this._onLobbyToast);
    window.addEventListener('lobby:openChallenge', this._onOpenChallenge);
    window.addEventListener('challenge:start', this._onChallengeStart);
    window.addEventListener('challenge:close', this._onChallengeClose);
    window.addEventListener('lobby:openEvolution', this._onOpenEvolution);
    window.addEventListener('evolution:unlock', this._onEvolutionUnlock);
    window.addEventListener('evolution:close', this._onEvolutionClose);
    window.addEventListener('lobby:openAvatar', this._onOpenAvatar);
    window.addEventListener('avatar:select', this._onAvatarSelect);
    window.addEventListener('avatar:close', this._onAvatarClose);
    window.addEventListener('lobby:openShop', this._onOpenShop);
    window.addEventListener('shop:close', this._onShopClose);
    window.addEventListener('shop:buyGem', this._onShopBuyGem);
    window.addEventListener('shop:buyGold', this._onShopBuyGold);
    window.addEventListener('shop:openBox', this._onShopOpenBox);
    window.addEventListener('shop:resetCash', this._onShopResetCash);
    window.addEventListener('prism:quickSkill', this._onQuickSkill);

    hudStore.set('/lobby/visible', true);
    this._syncLobbyInfo();
    this._setGameState('PAUSED');
  }

  /** 게임 시작 / 리셋 시 기본 공격 스킬 장착 */
  private _equipStartSkill() {
    /* 장착 무기가 있으면 해당 auto_* 스킬, 없으면 auto_basic */
    const weaponSkillId = this._equippedWeaponSkill();
    const isAutoSkill = weaponSkillId.startsWith('auto_');
    const skillId = isAutoSkill ? weaponSkillId : 'auto_basic';
    this.skillSystem.basicSkillId = skillId;
    this.equippedSkills.set(skillId, 1);
    this.skillSystem.equipSkill(skillId, 1);
    this._syncActiveSkillSlots();
  }

  /** 무기 그룹 중 하나라도 장착돼 있는지 (인게임 총 표시용) */
  private _hasWeaponEquipped(): boolean {
    return this.data.equipment.some(eq => eq.skill_id && this.equippedSlots.has(eq.slot_id));
  }

  /** 장착 무기의 인게임 총 모양 종류 (weapon_visual_config.csv 기반) */
  private _equippedWeaponKind(): string {
    const skill = this._equippedWeaponSkill();
    return this.data.weaponVisuals.get(skill)?.weapon_kind ?? 'revolver';
  }

  /** 전투 튜닝 값 조회 (combat_tuning.csv) */
  private _ct(key: string, def: number): number {
    const v = this.data.combatTuning.get(key);
    return v === undefined ? def : v;
  }

  private _hostPat(key: string, def: number): number {
    return bossPatternNum(this.data.bossPatterns, 'host', key, def);
  }

  private _bossPat(bossId: string, key: string, def: number): number {
    return bossPatternNum(this.data.bossPatterns, bossId, key, def);
  }

  /** 현재 장착된 무기 아이템의 기본 공격 스킬 ID */
  private _equippedWeaponSkill(): string {
    const eqW = this.data.equipment.find(eq => eq.skill_id && this.equippedSlots.has(eq.slot_id));
    const fallback = this.data.equipment.find(eq => eq.skill_id);
    return eqW?.skill_id ?? fallback?.skill_id ?? 'kunai';
  }

  /** 장착 상태 변경 후 손무기 표시/모양 동기화 */
  private _syncWeaponVisual(): void {
    this.player.setWeaponEquipped(this._hasWeaponEquipped());
    this.player.setWeaponType(this._equippedWeaponKind());
  }



  private _syncActiveSkillSlots() {
    const ids = [...this.equippedSkills.keys()];
    const activeIds = ids.filter((id) => {
      if (this.data.skills.get(id)?.skill_type === 'ACTIVE') return true;
      return this.data.evolutions.some((e) => e.result_skill_id === id);
    });
    const passiveIds = ids.filter((id) => this.data.skills.get(id)?.skill_type === 'PASSIVE');
    hudStore.setMany({
      '/hud/activeSkillSlots': activeIds,
      '/hud/passiveSkillSlots': passiveIds,
    });
  }

  private _resetSpawnSchedule() {
    this.miniBossCycleSec = Math.max(10, Math.floor(this._ct('mini_boss_cycle_sec', 100)));
    this.rushCycleSec = Math.max(10, Math.floor(this._ct('rush_cycle_sec', 50)));
    this.nextMiniBossCycleSec = this.miniBossCycleSec;
    this.nextRushCycleSec = this.rushCycleSec;
    this.miniBossCycleIndex = 0;
    this.rushCycleId = 10000;
  }

  private _isWithinBossRushBlockWindow(t: number, bossTime: number): boolean {
    const before = Math.max(0, this._ct('boss_rush_block_before_sec', 40));
    const after = Math.max(0, this._ct('boss_rush_block_after_sec', 20));
    return t >= bossTime - before && t <= bossTime + after;
  }

  private _isMiniBossCycleTime(t: number, bossTime: number): boolean {
    if (t >= bossTime || t < this.miniBossCycleSec) return false;
    const mod = t % this.miniBossCycleSec;
    return mod < 0.01 || this.miniBossCycleSec - mod < 0.01;
  }

  /* ════════════════════════════════════════
     메인 틱
  ════════════════════════════════════════ */
  private _tick(dt: number) {
    if (this.gameState !== 'PLAYING') return;

    this.eventBridge?.tick(dt);
    this._updatePlayer(dt);
    this._updateTimer(dt);
    this._updateWaveSpawn(dt);
    this._updateSkills(dt);   // 스킬 → hitResults 채움
    this._updateEnemies(dt);  // 적 AI + hitResults 처리
    this._updateBoss(dt);
    this._updateBossArrow();
    this._updateMiniBossHud();
    this._updateDrops(dt);
    this._updateNinjaScrollVfx(dt);
    this._updateMagnetRing(dt);
    this.arenaSystem.tick(dt);
    this._updateNexusMissiles(dt);
    this.player.tick(dt);

    const { shakeX, shakeY } = this.vfxSystem.tick(dt);
    this.renderer.followPlayer(this.px + shakeX, this.py + shakeY);
  }

  /* ── 플레이어 이동 ── */
  private _updatePlayer(dt: number) {
    const cfg = this.data.player;
    
    let finalSpeedMult = this.speedMult;
    if (this.debuffTimer > 0) {
      this.debuffTimer -= dt;
      finalSpeedMult *= this._ct('debuff_speed_mult', 0.6); // 디버프 중 속도 저하
      this.player.setDebuffState(true);
    } else {
      this.player.setDebuffState(false);
    }

    // 무적 상태이거나 자석 연출 링이 활성화되어 있으면 버프 VFX 활성화
    const isBuffActive = this.invincTimer > 0 || this.magnetRingMesh !== null;
    this.player.setBuffState(isBuffActive);

    const speed = cfg.base_speed * finalSpeedMult;
    const vx = this.input.vx;
    const vy = this.input.vy;

    if (Math.abs(vx) > 0.01 || Math.abs(vy) > 0.01) {
      this.px = Math.max(-this.mapHalfW, Math.min(this.mapHalfW, this.px + vx * speed * 60 * dt));
      this.py = Math.max(-this.mapHalfH, Math.min(this.mapHalfH, this.py + vy * speed * 60 * dt));
      // 아레나 봉쇄 벽 충돌 (이동형 보스 전투 중)
      if (this.arenaSystem.isActive) {
        const clamped = this.arenaSystem.clampPlayer(this.px, this.py, this.arenaCenterX, this.arenaCenterY, this.data.player.radius);
        this.px = clamped.x;
        this.py = clamped.y;
      }
      this.player.setPosition(this.px, this.py);
      this.player.setDirection(vx, vy);
    } else {
      this.player.setDirection(0, 0);
    }

    if (this.invincTimer > 0) this.invincTimer -= dt;
  }

  /* ── 타이머 HUD ── */
  private _updateTimer(dt: number) {
    this.elapsedSec += dt;
    this.stageElapsedSec += dt;

    /* 라바 퀘스트: 정방향 카운트. 보스 처치까지 진행 (시간 만료 종료 없음) */
    if (this.lavaQuestMode && this.gameState === 'PLAYING') {
      this.lavaQuestElapsed += dt;
      const mins = Math.floor(this.lavaQuestElapsed / 60);
      const secs = Math.floor(this.lavaQuestElapsed % 60);
      hudStore.set('/hud/timer', `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`);
      return;
    }

    const mins = Math.floor(this.stageElapsedSec / 60);
    const secs = Math.floor(this.stageElapsedSec % 60);
    hudStore.set('/hud/timer', `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`);
  }

  /* ── 웨이브 스폰 ── */
  private _updateWaveSpawn(dt: number) {
    /* 보스 사망 연출 중 스폰 억제 */
    if (this.bossDeathPending) return;

    const bossTime = this.lavaQuestMode && this.lavaQuestBossCfg
      ? this.lavaQuestBossCfg.spawn_time_seconds
      : this.data.finalBoss.spawn_time_seconds;

    const rushOverlapDelay = Math.max(1, this._ct('rush_overlap_delay_sec', 20));

    /* ── 대규모 러시 웨이브 (50초 주기) ── */
    while (this.stageElapsedSec >= this.nextRushCycleSec && this.nextRushCycleSec < bossTime) {
      if (this._isWithinBossRushBlockWindow(this.nextRushCycleSec, bossTime)) {
        this.nextRushCycleSec += this.rushCycleSec;
        continue;
      }
      if (this._isMiniBossCycleTime(this.nextRushCycleSec, bossTime)) {
        this.nextRushCycleSec += rushOverlapDelay;
        continue;
      }
      this._triggerRushWave(this._buildCycleRushWave(this.nextRushCycleSec));
      this.nextRushCycleSec += this.rushCycleSec;
    }

    /* ── 미니보스 스폰 (100초 주기, 보스 교대) ── */
    const miniBosses = this.data.bosses.filter(b => b.is_mini_boss);
    while (miniBosses.length > 0 && this.stageElapsedSec >= this.nextMiniBossCycleSec && this.nextMiniBossCycleSec < bossTime) {
      const idx = this.miniBossCycleIndex % miniBosses.length;
      this._spawnMiniBoss(miniBosses[idx]);
      this.miniBossCycleIndex += 1;
      this.nextMiniBossCycleSec += this.miniBossCycleSec;
    }

    /* ── 종대 스폰 (formation_spawn_config.csv) ── */
    for (const formation of this.data.formationSpawns) {
      if (formation.start_time_seconds >= bossTime) continue;
      if (this.triggeredFormationIds.has(formation.formation_id)) continue;
      if (this.stageElapsedSec < formation.start_time_seconds) continue;
      this.triggeredFormationIds.add(formation.formation_id);
      this._spawnFormationColumn(formation);
    }

    /* 최종 보스 등장 — BOSS_INTRO 2단계 연출 시작 */
    if (!this.bossSpawned && !this.bossWarningShown && this.stageElapsedSec >= bossTime) {
      this.bossWarningShown = true;
      this._startBossIntro();
      return;
    }

    /* 현재 웨이브 — 이 스테이지 전용 웨이브만 필터링 후 가장 최근 시작한 것 */
    const wave = this.data.waves
      .filter(w => w.stage === this.currentStage)
      .slice()
      .reverse()
      .find(w => this.stageElapsedSec >= w.start_time_seconds);
    if (!wave) return;

    /* 최종 보스 전투 중 일반 스폰 중단 — boss_config.suppress_wave_spawn */
    if (this.bossSpawned && this.data.finalBoss.suppress_wave_spawn) return;

    /* 최대 적 수 초과 시 스킵 — stage_config.csv 참조 */
    const stageCfg = this.data.stages[this.currentStage - 1];
    const stageMaxEnemies = Math.floor(wave.max_enemies * (stageCfg?.max_enemies_scale ?? 1));
    const minFrames = stageCfg?.spawn_interval_min_frames ?? 6;
    const spawnInterval = Math.max(minFrames, Math.floor(wave.spawn_interval_frames * (stageCfg?.spawn_interval_scale ?? 1))) / 60;

    if (this.enemySystem.liveCount >= stageMaxEnemies) return;

    this.spawnTimer -= dt;
    if (this.spawnTimer > 0) return;
    this.spawnTimer = spawnInterval;

    const enemyId = pickEnemyIdFromRates(wave.rate_basic, wave.rate_dog, wave.rate_bloater, wave.rate_spitter);
    const { x, y } = this._waveSpawnPos(enemyId);
    /* 스테이지 적 스탯 배율 적용 */
    const hpMult    = (stageCfg?.enemy_hp_mult ?? 1.0) * this.challengeHpMult;
    const speedMult = stageCfg?.enemy_speed_mult  ?? 1.0;
    const dmgMult   = stageCfg?.enemy_dmg_mult    ?? 1.0;
    this.enemySystem.spawn(enemyId, x, y, hpMult, speedMult, dmgMult, this._chaseSpawnMeta(enemyId, x, y));
  }

  /** 웨이브 스폰 — basic/bloater는 이동 방향 기준 뒤·측면 위주 */
  private _waveSpawnPos(enemyId: EnemyId): { x: number; y: number } {
    const { spawn_radius_min: rMin, spawn_radius_max: rMax, map_width: mw, map_height: mh } = this.data.map;
    const vx = this.input.vx;
    const vy = this.input.vy;
    const pSpeed = Math.hypot(vx, vy);
    let angle: number;

    const isBasic = enemyId === 'basic' || enemyId === 'bloater';
    const moveThresh = this._ct('spawn_move_speed_threshold', 0.12);
    if (isBasic && pSpeed > moveThresh) {
      const moveAng = Math.atan2(vy, vx);
      const behindW = this._ct('spawn_move_behind_weight', 0.55);
      const sideW = this._ct('spawn_move_side_weight', 0.30);
      const r = Math.random();
      if (r < behindW) {
        angle = moveAng + Math.PI + (Math.random() - 0.5) * (Math.PI * 0.85);
      } else if (r < behindW + sideW) {
        const side = Math.random() < 0.5 ? 1 : -1;
        angle = moveAng + side * (Math.PI / 2) + (Math.random() - 0.5) * (Math.PI / 3);
      } else {
        angle = moveAng + (Math.random() - 0.5) * (Math.PI * 0.7);
      }
    } else {
      angle = Math.random() * Math.PI * 2;
    }

    const dist = rMin + Math.random() * (rMax - rMin);
    const x = Math.max(-mw / 2 + 20, Math.min(mw / 2 - 20, this.px + Math.cos(angle) * dist));
    const y = Math.max(-mh / 2 + 20, Math.min(mh / 2 - 20, this.py + Math.sin(angle) * dist));
    return { x, y };
  }

  /** 스폰 위치 기반 결정론적 추적 패턴 — 몬스터마다 스폰 시 1회 고정 */
  private _chaseSpawnMeta(enemyId: EnemyId, x: number, y: number): { chaseMode?: ChaseMode; flankSign?: 1 | -1 } {
    if (enemyId !== 'basic' && enemyId !== 'bloater') return {};
    const seed = Math.abs(Math.floor(x * 3.7 + y * 5.3)) % 100;
    const directCut = enemyId === 'basic'
      ? Math.floor(this._ct('chase_basic_direct_pct', 30))
      : Math.floor(this._ct('chase_bloater_direct_pct', 50));
    const interceptCut = directCut + (enemyId === 'basic'
      ? Math.floor(this._ct('chase_basic_intercept_pct', 40))
      : Math.floor(this._ct('chase_bloater_intercept_pct', 30)));
    let chaseMode: ChaseMode;
    if (seed < directCut) chaseMode = 'direct';
    else if (seed < interceptCut) chaseMode = 'intercept';
    else chaseMode = 'flank';
    const flankSign = (Math.sin(Math.atan2(y - this.py, x - this.px)) >= 0 ? 1 : -1) as 1 | -1;
    return { chaseMode, flankSign };
  }

  /* ── 스킬 자동 발사 (hitResults 채움) ── */
  private _updateSkills(dt: number) {
    this.skillSystem.tick(
      dt,
      this.px, this.py,
      this.input.vx, this.input.vy,
      this.enemySystem.enemies,
      { alive: this.bossCtrl.alive, x: this.bossCtrl.x, y: this.bossCtrl.y, radius: this.bossCtrl.cfg.radius },
    );
    /* 총을 최근 발사 방향으로 조준 회전 */
    this.player.setWeaponAngle(this.skillSystem.lastFireAngle);
    /* 기본 공격 탄창 용량 동기화 */
    if (this.skillSystem.magazineCapacity > 0) this.player.setMagazineCapacity(this.skillSystem.magazineCapacity);
    /* 기본 공격 탄창(쿨타임) 표시 갱신 */
    this.player.setBasicCooldown(this.skillSystem.basicCooldownPct);
  }

  /* ── 적 AI + 충돌 + 스킬 피격 처리 ── */
  private _updateEnemies(dt: number) {
    const contactDmg = this.enemySystem.tick(dt, this.px, this.py, this.data.player.radius);
    if (contactDmg > 0) this._takeDamage(contactDmg, this.enemySystem.playerHitByMissile);

    for (const [enemyId, dmgVal, element] of this.skillSystem.hitResults) {
      const killed = this.enemySystem.hit(enemyId, dmgVal);
      /* 속성 상태효과 부여 (살아있을 때만) */
      if (!killed && element) {
        const elemCfg = this.data.elements.get(element);
        if (elemCfg) this.enemySystem.applyElement(enemyId, elemCfg);
      }
      if (killed) this._onEnemyDeath(enemyId);
    }
  }

  /* ── 보스 틱 ── */
  private _updateBoss(dt: number) {
    if (!this.bossCtrl.alive) return;

    const contactDmg = this.bossCtrl.tick(dt, this.px, this.py, this.data.player.radius);
    if (contactDmg > 0) this._takeDamage(contactDmg, false);

    /* TITAN pendingMissiles → EnemySystem 발사 */
    for (const m of this.bossCtrl.pendingMissiles) {
      this.enemySystem.fireHomingMissile(m.sx, m.sy, m.angle, m.speed, m.turnRate, m.maxRange, m.dmg);
    }

    if (this.bossSpawnInvulnTimer > 0) {
      this.bossSpawnInvulnTimer -= dt;
      hudStore.set('/hud/bossHpPct', 100);
    } else {
      /* 스킬 → 보스 충돌 (SkillSystem.checkBossHit 사용) */
      const skillDmg = this.skillSystem.checkBossHit(
        this.bossCtrl.x, this.bossCtrl.y, this.bossCtrl.cfg.radius,
      );
      if (skillDmg > 0) {
        const killed = this.bossCtrl.hit(skillDmg);
        if (killed) { this._onBossDeath(); return; }
      }
      hudStore.set('/hud/bossHpPct', this.bossCtrl.getHpPct() * 100);
    }
  }

  /* ── 보스 오프스크린 방향 지시 화살표 업데이트 ── */
  private _updateBossArrow() {
    if (!this.bossCtrl.alive) {
      this.bossArrow.visible = false;
      return;
    }

    const bx = this.bossCtrl.x;
    const by = this.bossCtrl.y;
    const br = this.bossCtrl.cfg.radius;

    const camera = this.renderer.camera;
    const cx = camera.position.x;
    const cy = camera.position.y;

    const vw = (camera.right - camera.left) / 2;
    const vh = (camera.top - camera.bottom) / 2;

    const minX = cx - vw;
    const maxX = cx + vw;
    const minY = cy - vh;
    const maxY = cy + vh;

    // 보스가 화면 안에 보이는지 판정
    const isVisible = (bx + br >= minX && bx - br <= maxX && by + br >= minY && by - br <= maxY);

    if (isVisible) {
      this.bossArrow.visible = false;
    } else {
      this.bossArrow.visible = true;

      const dx = bx - cx;
      const dy = by - cy;

      // 화면 가장자리 여백 마진
      const margin = 12;
      const limitX = vw - margin;
      const limitY = vh - margin;

      const ratioX = limitX / (Math.abs(dx) || 0.001);
      const ratioY = limitY / (Math.abs(dy) || 0.001);
      const t = Math.min(ratioX, ratioY);

      // 교점 계산
      const ax = cx + dx * t;
      const ay = cy + dy * t;

      this.bossArrow.position.set(ax, ay, 20);
      this.bossArrow.rotation.z = Math.atan2(dy, dx);
    }
  }

  /* ── 닌자 스크롤 패시브 획득 시 공전 이펙트 업데이트 ── */
  private _updateNinjaScrollVfx(dt: number) {
    const hasScroll = this.equippedSkills.has('ninjaScroll');
    if (!hasScroll) {
      if (this.ninjaScrollMesh) {
        this.renderer.scene.remove(this.ninjaScrollMesh);
        this.ninjaScrollMesh.geometry.dispose();
        if (Array.isArray(this.ninjaScrollMesh.material)) {
          this.ninjaScrollMesh.material.forEach(m => m.dispose());
        } else {
          this.ninjaScrollMesh.material.dispose();
        }
        this.ninjaScrollMesh = null;
      }
      return;
    }

    if (!this.ninjaScrollMesh) {
      // 닌자 스크롤 비주얼: 실린더를 눕힌 노란색 네온 롤 두루마리
      const geo = new THREE.CylinderGeometry(1.3, 1.3, 6, 8);
      geo.rotateX(Math.PI / 2);
      const mat = new THREE.MeshStandardMaterial({
        color: 0xFFCC00,
        emissive: 0xFFCC00,
        emissiveIntensity: 1.5,
      });
      this.ninjaScrollMesh = new THREE.Mesh(geo, mat);
      this.renderer.scene.add(this.ninjaScrollMesh);
    }

    this.ninjaScrollAngle += dt * 2.8; // 부드럽게 공전
    const r = 24; // 콤팩트한 궤도 반경
    const sx = this.px + Math.cos(this.ninjaScrollAngle) * r;
    const sy = this.py + Math.sin(this.ninjaScrollAngle) * r;
    this.ninjaScrollMesh.position.set(sx, sy, 3);
    this.ninjaScrollMesh.rotation.z = this.ninjaScrollAngle + Math.PI / 2;
  }

  /* ── 드롭 픽업 ── */
  private _updateDrops(dt: number) {
    /* 화면 bounds 계산 (자석·폭탄 공통) */
    const cam = this.renderer.camera;
    const screenBounds = {
      minX: cam.position.x + cam.left,
      maxX: cam.position.x + cam.right,
      minY: cam.position.y + cam.bottom,
      maxY: cam.position.y + cam.top,
    };
    const isOnScreen = (x: number, y: number, r = 0) =>
      x + r >= screenBounds.minX && x - r <= screenBounds.maxX &&
      y + r >= screenBounds.minY && y - r <= screenBounds.maxY;

    const { xpGained, magnetXpGained, healGained, magnetTriggered, bombTriggered } =
      this.dropSystem.tick(this.px, this.py, dt, screenBounds);

    if (xpGained > 0)       this._addXp(xpGained);
    if (magnetXpGained > 0) this._addXpMagnet(magnetXpGained);
    if (healGained > 0)     this._heal(healGained);

    /* 자석(magnet) 아이템 작동 */
    if (magnetTriggered) {
      this.vfxSystem.play('player_hit', this.px, this.py);
      this._spawnMagnetRing();
    }

    /* 폭탄(bomb) 아이템 작동 — 기본 공격 데미지(10), 체력 많은 적은 생존 */
    if (bombTriggered) {
      this.vfxSystem.play('bomb_use', this.px, this.py, undefined, 2 / 3);
      const BOMB_DMG = this._ct('bomb_damage', 10);

      const aliveEnemies = this.enemySystem.enemies.filter(e => !e.dead);
      for (const e of aliveEnemies) {
        if (!isOnScreen(e.x, e.y, e.cfg.radius)) continue;
        const killed = this.enemySystem.hit(e.id, BOMB_DMG);
        if (killed) this._onEnemyDeath(e.id);
      }

      /* 보스: 데미지만, 폭탄으로 즉사 없음 */
      if (this.bossCtrl.alive && this.bossSpawnInvulnTimer <= 0 && isOnScreen(this.bossCtrl.x, this.bossCtrl.y, this.bossCtrl.cfg.radius)) {
        const killed = this.bossCtrl.hit(BOMB_DMG);
        if (killed) this._onBossDeath();
      }
    }
  }

  /* ── 데미지 수신 ── */
  private _takeDamage(dmg: number, applySlow = false) {
    if (this.invincTimer > 0) return;
    /* 도전 적 데미지 배율 + 진화 armor 피해 감소 */
    const effDmg = dmg * this.challengeDmgMult * (1 - this.armorReduction);
    this.hp = Math.max(0, this.hp - effDmg);
    this.player.setHp(this.hp);
    hudStore.set('/hud/hpPct', (this.hp / this.maxHp) * 100);

    /* 피격 VFX */
    this.vfxSystem.play('player_hit', this.px, this.py);

    /* 미사일 계열 피격일 때만 이동속도 디버프 적용 */
    if (applySlow) {
      this.debuffTimer = this._ct('player_debuff_sec', 2.0);
    }

    if (this.hp <= 0) {
      this._gameOver();
      return;
    }

    this.invincTimer = this.data.player.invincible_frames / 60;
    this.player.startInvincible(this.data.player.invincible_frames);
  }

  private _heal(amount: number) {
    this.hp = Math.min(this.maxHp, this.hp + amount);
    this.player.setHp(this.hp);
    hudStore.set('/hud/hpPct', (this.hp / this.maxHp) * 100);
  }

  /* ── 적 사망 ── */
  private _onEnemyDeath(enemyId: number) {
    this.killCount++;
    hudStore.set('/hud/killCount', this.killCount);

    const dead = this.enemySystem.enemies.find(e => e.id === enemyId && e.dead);
    if (!dead) return;

    /* 사망 VFX */
    this.vfxSystem.play('enemy_death', dead.x, dead.y);

    this.gold += dead.cfg.gold_drop;
    hudStore.set('/hud/gold', this.gold);

    /* 특수진화 포식자: 처치 시 확률 회복 (최대 HP의 2%) */
    if (this.predatorHealChance > 0 && Math.random() < this.predatorHealChance) {
      this._heal(Math.max(1, Math.round(this.maxHp * this.predatorHealRatio)));
    }

    /* 스테이지 XP 배율 적용 — stage_config.csv xp_mult */
    const stageXpMult = this.data.stages[this.currentStage - 1]?.xp_mult ?? 1.0;
    this.dropSystem.spawnXp(dead.x, dead.y, dead.cfg.exp_drop_type, stageXpMult);

    if (Math.random() < this.itemDropChance) {
      this.dropSystem.spawnRandomItem(dead.x, dead.y);
    }

    this.eventBridge?.onEnemyKilled(dead.cfg.enemy_id, this.ticketMultiplier);
    archeryOnEnemyKill();
    refreshEventRedDots();

    /* 이벤트 재화 — 30킬마다 티켓/볼 +1 */
    this.killAccumForTicket++;
    if (this.killAccumForTicket >= this._ct('kill_per_event_ticket', 30)) {
      this.killAccumForTicket = 0;
      this._addEventCurrency(1, 1);
    }
  }

  /* ── 보스 사망 ── */
  private _onBossDeath() {
    this.eventBridge?.onEnemyKilled('final_boss', this.ticketMultiplier);
    this._addEventCurrency(1, 1); // 보스 처치 보너스
    const bossX = this.bossCtrl.x;
    const bossY = this.bossCtrl.y;
    const bossName = this.bossCtrl.cfg.boss_name;
    this.bossCtrl.dispose();

    hudStore.setMany({
      '/hud/bossVisible': false,
      '/hud/bossWarningVisible': false,
      '/bossIntro/phase': 0,
      '/rushWave/visible': false,
      '/bossDeath/bossName': bossName,
    });

    this.pendingStageAdvance = this.currentStage < this.maxStages;
    this.bossDeathPending = true;
    this.invincTimer = this._ct('boss_death_invuln_sec', 5);

    /* Phase 1: 폭발 플래시 (0ms) */
    hudStore.set('/bossDeath/phase', 1);
    this.vfxSystem.play('boss_spawn', bossX, bossY);

    /* Phase 1 연속 폭발 */
    window.setTimeout(() => this.vfxSystem.play('boss_spawn', bossX + 30, bossY - 20), this._hostPat('boss_death_vfx2_ms', 200));
    window.setTimeout(() => this.vfxSystem.play('boss_spawn', bossX - 25, bossY + 30), this._hostPat('boss_death_vfx3_ms', 380));
    window.setTimeout(() => this.vfxSystem.play('boss_spawn', bossX, bossY), this._hostPat('boss_death_vfx4_ms', 550));

    window.setTimeout(() => {
      hudStore.set('/bossDeath/phase', 2);
    }, this._hostPat('boss_death_phase2_ms', 700));

    window.setTimeout(() => {
      hudStore.set('/bossDeath/phase', 3);
    }, this._hostPat('boss_death_phase3_ms', 2200));

    /* 결과창 (3500ms) */
    this.bossDeathTimer = window.setTimeout(() => {
      hudStore.set('/bossDeath/phase', 0);
      this.bossDeathPending = false;
      this.bossDeathTimer = null;
      this._stageClear();
    }, this._ct('boss_death_result_delay_ms', 3500));
  }

  /* ── 보스 스폰 ── */
  /* ── 미니보스 스폰 (웨이브 중단 없음, BossController 미사용) ── */
  /* ── 러시 웨이브: 경고 후 플레이어 포위 원형 스폰 ── */
  private _triggerRushWave(rush: RushConfig) {
    const warnMs = Math.max(0, rush.warning_sec) * 1000;
    hudStore.set('/rushWave/visible', true);
    window.setTimeout(() => {
      hudStore.set('/rushWave/visible', false);
      this._spawnRushRing(rush);
    }, warnMs);
  }

  private _buildCycleRushWave(startSec: number): RushConfig {
    const tpl = this.data.rushCycleTemplate;
    if (tpl) {
      return { ...tpl, rush_id: this.rushCycleId++, start_time_seconds: startSec };
    }
    return {
      rush_id: this.rushCycleId++,
      start_time_seconds: startSec,
      warning_sec: 1,
      spawn_count_base: 48,
      spawn_count_per_stage: 6,
      spawn_count_max: 120,
      ring_radius: 320,
      ring_radius_jitter: 80,
      rate_dog: 0.6,
      rate_basic: 0.25,
      rate_spitter: 0.15,
      formation: 'ring',
      respect_max_enemies: false,
      enabled: true,
    };
  }

  private _spawnRushRing(rush: RushConfig) {
    const stageCfg = this.data.stages[this.currentStage - 1];
    const hpMult = (stageCfg?.enemy_hp_mult ?? 1.0) * this.challengeHpMult;
    const speedMult = stageCfg?.enemy_speed_mult ?? 1.0;
    const dmgMult = stageCfg?.enemy_dmg_mult ?? 1.0;
    const { map_width: mw, map_height: mh } = this.data.map;

    let count = Math.min(
      rush.spawn_count_max,
      rush.spawn_count_base + this.currentStage * rush.spawn_count_per_stage,
    );
    if (rush.formation === 'column') {
      const colMin = Math.floor(this._ct('rush_column_count_min', 10));
      const colMax = Math.floor(this._ct('rush_column_count_max', 20));
      count = Math.max(colMin, Math.min(colMax, count));
    }

    if (rush.respect_max_enemies) {
      const wave = this.data.waves
        .filter(w => w.stage === this.currentStage)
        .slice()
        .reverse()
        .find(w => this.stageElapsedSec >= w.start_time_seconds);
      if (wave) {
        const cap = Math.floor(wave.max_enemies * (stageCfg?.max_enemies_scale ?? 1));
        count = Math.min(count, Math.max(0, cap - this.enemySystem.liveCount));
      }
    }
    if (count <= 0) return;

    const squadId = rush.formation === 'column' ? this.rushCycleId++ : undefined;
    for (let i = 0; i < count; i++) {
      let x: number, y: number;

      if (rush.formation === 'column') {
        /* 종대: 2열 군진 (열 유지하며 이동/사격 반복) */
        const cols = 2;
        const col = i % cols;
        const row = Math.floor(i / cols);
        const colSpacing = this._ct('rush_column_col_spacing', 30);
        const rowSpacing = this._ct('rush_column_row_spacing', 26);
        const startX = this.px + (col === 0 ? -colSpacing * 0.5 : colSpacing * 0.5);
        const startY = this.py + rush.ring_radius + row * rowSpacing;
        x = Math.max(-mw / 2 + 20, Math.min(mw / 2 - 20, startX));
        y = Math.max(-mh / 2 + 20, Math.min(mh / 2 - 20, startY));
      } else {
        const angle = (Math.PI * 2 * i) / count + Math.random() * 0.1;
        const ringRadius = rush.ring_radius + (rush.ring_radius_jitter > 0 ? Math.random() * rush.ring_radius_jitter : 0);
        x = Math.max(-mw / 2 + 20, Math.min(mw / 2 - 20, this.px + Math.cos(angle) * ringRadius));
        y = Math.max(-mh / 2 + 20, Math.min(mh / 2 - 20, this.py + Math.sin(angle) * ringRadius));
      }

      const enemyId = pickEnemyIdFromRates(rush.rate_basic, rush.rate_dog, 0, rush.rate_spitter);
      const chaseMeta = this._chaseSpawnMeta(enemyId, x, y);
      if (rush.formation === 'column' && enemyId === 'spitter' && squadId !== undefined) {
        this.enemySystem.spawn(enemyId, x, y, hpMult, speedMult, dmgMult, {
          squadId,
          squadCol: i % 2,
          squadRow: Math.floor(i / 2),
          ...chaseMeta,
        });
      } else {
        this.enemySystem.spawn(enemyId, x, y, hpMult, speedMult, dmgMult, chaseMeta);
      }
    }
  }

  private _spawnFormationColumn(cfg: FormationSpawnConfig) {
    const stageCfg = this.data.stages[this.currentStage - 1];
    const hpMult = (stageCfg?.enemy_hp_mult ?? 1.0) * this.challengeHpMult;
    const speedMult = stageCfg?.enemy_speed_mult ?? 1.0;
    const dmgMult = stageCfg?.enemy_dmg_mult ?? 1.0;
    const { map_width: mw, map_height: mh } = this.data.map;
    const count = Math.max(10, Math.min(20, Math.floor(cfg.count)));
    const cols = 2;
    const squadId = cfg.formation_id;
    for (let i = 0; i < count; i++) {
      const col = i % cols;
      const row = Math.floor(i / cols);
      const startX = this.px + (col === 0 ? -cfg.col_spacing * 0.5 : cfg.col_spacing * 0.5);
      const startY = this.py + cfg.start_offset_y + row * cfg.row_spacing;
      const x = Math.max(-mw / 2 + 20, Math.min(mw / 2 - 20, startX));
      const y = Math.max(-mh / 2 + 20, Math.min(mh / 2 - 20, startY));
      this.enemySystem.spawn(cfg.enemy_id, x, y, hpMult, speedMult, dmgMult, {
        squadId,
        squadCol: col,
        squadRow: row,
        squadMoveSec: cfg.move_sec,
        squadFireSec: cfg.fire_sec,
        squadColSpacing: cfg.col_spacing,
        squadRowSpacing: cfg.row_spacing,
        squadMarchSpeedMult: cfg.march_speed_mult,
      });
    }
  }

  private _spawnMiniBoss(cfg: import('./data').BossConfig) {
    const stageCfg = this.data.stages[this.currentStage - 1];
    const hpMult = (stageCfg?.boss_hp_mult ?? 1.0) * this.challengeHpMult;
    const scaledHp = Math.floor(cfg.hp * hpMult);

    let spawnY: number;
    if (cfg.boss_type === 'stationary_missile') {
      /* 고정형: 아레나 상단 근처에 고정 배치 (플레이어는 아레나 안에서 회피) */
      spawnY = this.py + cfg.arena_size_h * 0.32;
    } else {
      spawnY = this.py + Math.min(cfg.spawn_offset_y, 200);
    }
    const inst = this.enemySystem.spawnMiniBoss(cfg, scaledHp, this.px, spawnY);

    /* 고정형 보스(stationary_missile) — 아레나 벽 생성 + 인스턴스 추적 */
    if (cfg.boss_type === 'stationary_missile') {
      this.nexusEnemy = inst;
      this.nexusMissileTimer = 0;
      if (cfg.arena_size_w > 0 && cfg.arena_size_h > 0) {
        this.arenaCenterX = this.px;
        this.arenaCenterY = this.py;
        this.arenaSystem.activate(this.arenaCenterX, this.arenaCenterY, cfg.arena_size_w, cfg.arena_size_h, cfg.glow_color_hex);
      }
    } else {
      /* 이동형 미니보스 (CRUSHER 등) 추적 */
      this.movingMiniBoss = inst;
    }

    /* 미니보스 등장 시 보스 HUD 표시 */
    hudStore.setMany({
      '/hud/bossVisible': true,
      '/hud/bossName': cfg.boss_name,
      '/hud/bossHpPct': 100,
      '/hud/bossWarningVisible': true,
    });
    setTimeout(
      () => hudStore.set('/hud/bossWarningVisible', false),
      this._hostPat('miniboss_warning_visible_ms', 2000),
    );
  }

  /* ── 미니보스 HP HUD 동기화 ── */
  private _updateMiniBossHud() {
    /* 최종 보스가 살아있으면 미니보스 HUD 갱신 안 함 */
    if (this.bossCtrl.alive) return;

    /* 이동형 미니보스 (CRUSHER) */
    if (this.movingMiniBoss) {
      if (this.movingMiniBoss.dead) {
        this.movingMiniBoss = null;
        hudStore.set('/hud/bossVisible', false);
      } else {
        const pct = this.movingMiniBoss.hp / this.movingMiniBoss.maxHp;
        hudStore.set('/hud/bossHpPct', pct * 100);
      }
      return;
    }

    /* 고정형 미니보스 (NEXUS) */
    if (this.nexusEnemy) {
      if (this.nexusEnemy.dead) {
        hudStore.set('/hud/bossVisible', false);
      } else {
        const pct = this.nexusEnemy.hp / this.nexusEnemy.maxHp;
        hudStore.set('/hud/bossHpPct', pct * 100);
      }
    }
  }

  /* ── NEXUS 미사일 업데이트 ── */
  private _updateNexusMissiles(dt: number) {
    if (!this.nexusEnemy || this.nexusEnemy.dead) {
      if (this.nexusEnemy?.dead) {
        // 넥서스 처치 → 아레나 해제
        this.arenaSystem.startFadeOut();
        this.nexusEnemy = null;
      }
      return;
    }

    const cfg = this.data.bosses.find(b => b.boss_id === 'nexus');
    if (!cfg) return;

    this.nexusMissileTimer += 60 * dt;
    if (this.nexusMissileTimer < cfg.missile_interval_frames) return;
    this.nexusMissileTimer = 0;

    const dx = this.px - this.nexusEnemy.x;
    const dy = this.py - this.nexusEnemy.y;
    const baseAngle = Math.atan2(dy, dx);
    const dmg = cfg.contact_dmg > 0
      ? cfg.contact_dmg
      : this._bossPat('nexus', 'miniboss_fallback_contact_dmg', 5);

    if (this.nexusPatternIndex === 0) {
      const spreadRad = (cfg.missile_spread_angle * Math.PI) / 180;
      const mults = bossPatternList(
        this.data.bossPatterns, 'nexus', 'miniboss_pattern_a_spread_mults',
        [-2, -1, 0, 1, 2],
      );
      const speedMult = this._bossPat('nexus', 'miniboss_pattern_a_speed_mult', 1.1);
      for (const m of mults) {
        this.enemySystem.fireHomingMissile(
          this.nexusEnemy.x, this.nexusEnemy.y,
          baseAngle + spreadRad * m,
          cfg.missile_speed * speedMult, 0, cfg.missile_max_range, dmg,
        );
      }
    } else {
      const rayCount = Math.floor(this._bossPat('nexus', 'miniboss_pattern_b_ray_count', 12));
      const speedMult = this._bossPat('nexus', 'miniboss_pattern_b_speed_mult', 0.85);
      const dmgMult = this._bossPat('nexus', 'miniboss_pattern_b_dmg_mult', 0.65);
      for (let i = 0; i < rayCount; i++) {
        const angle = (Math.PI * 2 * i) / rayCount;
        this.enemySystem.fireHomingMissile(
          this.nexusEnemy.x, this.nexusEnemy.y,
          angle, cfg.missile_speed * speedMult, 0, cfg.missile_max_range, dmg * dmgMult,
        );
      }
    }

    /* 패턴 교대 */
    this.nexusPatternIndex = 1 - this.nexusPatternIndex;
  }

  /* ── BOSS_INTRO 2단계 연출 ──
   * Phase1: 일반 적 전멸 + 빨간 WARNING (0.9초)
   * Phase2: 퍼플 암전 + 보스 등장 연출 (0.7초) → 전투 시작 */
  private _startBossIntro() {
    this._setGameState('BOSS_INTRO');

    if (this.data.finalBoss.clear_minions_on_intro) {
      this.enemySystem.clear();
      this.nexusEnemy = null;
      this.arenaSystem.deactivate();
    }

    /* Phase 1: WARNING */
    hudStore.set('/bossIntro/phase', 1);

    window.setTimeout(() => {
      /* Phase 2: 암전 + 보스 등장 */
      hudStore.set('/bossIntro/phase', 2);
      this.renderer.startBossAmbient(
        this.data.map.boss_ambient_color,
        this.data.map.boss_ambient_transition_seconds,
      );

      window.setTimeout(() => {
        /* Phase 3: 보스 실제 스폰 + 충격 연출 */
        this._spawnBoss();
        hudStore.set('/bossIntro/phase', 3);
        window.setTimeout(() => {
          hudStore.set('/bossIntro/phase', 0);
        }, this._ct('boss_intro_phase3_ms', 800));
      }, this._ct('boss_intro_phase2_ms', 1000));
    }, this._ct('boss_intro_phase1_ms', 1300));
  }

  private _spawnBoss() {
    this.bossSpawned = true;

    /* 보스 등장 VFX */
    this.vfxSystem.play('boss_spawn', this.px, this.py);

    /* (암전은 _startBossIntro Phase2에서 이미 시작됨) */

    /* 활성 보스 cfg — 라바 퀘스트면 단계별 보스, 아니면 최종보스 */
    const activeBoss = this.lavaQuestMode && this.lavaQuestBossCfg
      ? this.lavaQuestBossCfg
      : this.data.finalBoss;

    /* 보스 체력 — 라바 퀘스트는 CSV hp 그대로, 일반 모드는 boss_hp_mult */
    if (this.lavaQuestMode) {
      this.bossCtrl.reconfigure(activeBoss);   // hp = cfg.hp 그대로
    } else {
      const stageCfgBoss = this.data.stages[this.currentStage - 1];
      this.bossCtrl.maxHp = Math.floor(this.data.finalBoss.hp * (stageCfgBoss?.boss_hp_mult ?? 3.0));
      this.bossCtrl.hp = this.bossCtrl.maxHp;
    }

    const spawnY = this.py + activeBoss.spawn_offset_y;
    this.bossCtrl.start(this.px, spawnY);
    this.bossSpawnInvulnTimer = this._ct('boss_spawn_invuln_sec', 1.2);
    // 요청사항: 보스 연출씬 없이 즉시 전투 지속
    this._setGameState('PLAYING');

    hudStore.setMany({
      '/hud/bossVisible': true,
      '/hud/bossName':    activeBoss.boss_name,
      '/hud/bossHpPct':   100,
    });

  }

  private _advanceToNextStage() {
    if (this.bossDeathTimer !== null) {
      window.clearTimeout(this.bossDeathTimer);
      this.bossDeathTimer = null;
    }
    this.bossDeathPending = false;
    this.currentStage += 1;
    this.stageElapsedSec = 0;
    this.spawnTimer = 0;
    this.bossSpawned = false;
    this.bossWarningShown = false;
    this.spawnedMiniBossIds.clear();
    this.triggeredRushIds.clear();
    this.triggeredFormationIds.clear();
    this._resetSpawnSchedule();
    this.arenaSystem.deactivate();
    this.nexusEnemy = null;
    this.movingMiniBoss = null;
    this.nexusMissileTimer = 0;
    this.nexusPatternIndex = 0;
    this.bossSpawnInvulnTimer = 0;

    /* HP / XP / 레벨 초기화 — 스테이지 새로 시작 */
    this.hp = this.maxHp;
    this.xp = 0;
    this.level = 1;
    this.totalXpEarned = 0;
    this.gold = 0;
    this.killCount = 0;
    this.invincTimer = 0;
    this.debuffTimer = 0;
    this.player.setHp(this.hp);
    this.player.setPosition(0, 0);
    this.px = 0; this.py = 0;

    // 스테이지 전환 정책: 이전에 획득한 스킬/진화/패시브 효과 초기화
    this.equippedSkills.clear();
    this.evolvedSkills.clear();
    this.xpMult = 1.0;
    this.speedMult = 1.0;
    this.player.setExoskeletonLevel(0);
    this.skillSystem.dispose();
    this.skillSystem = new SkillSystem(this.renderer.scene, this.data);
    this._equipStartSkill();

    this.enemySystem.clear();
    this.dropSystem.clear();
    this.bossCtrl.dispose();
    this.bossArrow.visible = false;

    hudStore.setMany({
      '/hud/timer':            '00:00',
      '/hud/stage':            this.currentStage,
      '/hud/hpPct':            100,
      '/hud/expPct':           0,
      '/hud/level':            1,
      '/hud/killCount':        0,
      '/hud/gold':             0,
      '/hud/bossVisible':      false,
      '/hud/bossWarningVisible': false,      '/bossIntro/phase': 0, '/bossDeath/phase': 0,      '/rushWave/visible': false,
      '/pause/visible':        false,
      '/modal/visible':        false,
      '/result/visible':       false,
      '/luckyTrain/visible':   false,
      '/battle/visible':       false,
      '/energy/visible':       false,
      '/challenge/visible':    false,
      '/evolution/visible':    false,
      '/scene/transitionText': `STAGE ${this.currentStage}`,
      '/scene/transitionVisible': false,
      '/lobby/visible':        true,
      '/vfx/flashOpacity':     0,
      '/vfx/flashColor':       '#ffffff',
    });

    this._setGameState('PAUSED');
  }

  /** 인게임 최대 레벨 (level_config 행 수 + 1). 그 이상은 EXP바만 100% */
  private _maxCombatLevel(): number {
    return this.data.levels.length + 1;
  }

  /** 다음 레벨까지 필요 EXP — CSV 행 없으면 exp_scale_rate로 외삽 */
  private _expRequiredForLevel(level: number): number {
    const rows = this.data.levels;
    const row = rows[level - 1];
    if (row) return row.exp_required;
    const base = rows[0]?.exp_required ?? 30;
    const rate = rows[0]?.exp_scale_rate ?? 1.145;
    return Math.round(base * Math.pow(rate, level - 1));
  }

  private _syncExpBar() {
    const req = this._expRequiredForLevel(this.level);
    if (this.level >= this._maxCombatLevel()) {
      hudStore.set('/hud/expPct', 100);
      return;
    }
    hudStore.set('/hud/expPct', (this.xp / req) * 100);
  }

  /* ── XP / 레벨업 (프레임당 최대 1회 — 모달 중복 방지) ── */
  private _addXp(amount: number) {
    const gained = amount * this.xpMult;
    this.xp += gained;
    this.totalXpEarned += gained;
    if (this.level >= this._maxCombatLevel()) {
      this._syncExpBar();
      return;
    }
    const req = this._expRequiredForLevel(this.level);
    if (this.xp >= req) {
      this.xp -= req;
      this.level += 1;
      hudStore.set('/hud/level', this.level);
      this._onLevelUp();
    } else {
      this._syncExpBar();
    }
  }

  /* ── 자석 XP — 한 레벨 분량만 인정 ── */
  private _addXpMagnet(amount: number) {
    if (this.level >= this._maxCombatLevel()) return;
    const req = this._expRequiredForLevel(this.level);
    const xpToNextLevel = Math.max(0, req - this.xp);
    const toAdd = Math.min(amount * this.xpMult, xpToNextLevel);
    if (toAdd <= 0) return;
    this.xp += toAdd;
    this.totalXpEarned += toAdd;
    if (this.xp >= req) {
      this.xp -= req;
      this.level += 1;
      hudStore.set('/hud/level', this.level);
      this._onLevelUp();
    } else {
      this._syncExpBar();
    }
  }

  /* ── 레벨업 → 스킬 선택 모달 ── */
  private _onLevelUp() {
    /* 레벨업 VFX */
    this.vfxSystem.play('level_up', this.px, this.py);

    this._setGameState('LEVELUP');
    const cards = this._buildSkillCards();
    hudStore.setMany({ '/modal/visible': true, '/modal/cards': cards });
  }

  private _buildSkillCards(): SkillCardData[] {
    /* ── 진화 후보 먼저 수집 ── */
    const evolutionCards: SkillCardData[] = [];
    for (const evo of this.data.evolutions) {
      /* 이미 진화했으면 스킵 */
      if (this.evolvedSkills.has(evo.result_skill_id)) continue;
      /* 진화 결과 스킬이 이미 장착되어 있으면 스킵 */
      if (this.equippedSkills.has(evo.result_skill_id)) continue;

      const activeLv  = this.equippedSkills.get(evo.active_skill_id) ?? 0;
      const passiveLv = this.equippedSkills.get(evo.passive_skill_id) ?? 0;
      const activeCfg = this.data.skills.get(evo.active_skill_id);
      if (!activeCfg) continue;

      /* 액티브 스킬이 최대 레벨 + 패시브 스킬 장착 여부 */
      if (activeLv >= activeCfg.max_level && passiveLv > 0) {
        const passiveCfg = this.data.skills.get(evo.passive_skill_id);
        evolutionCards.push({
          skill_id:      evo.result_skill_id,
          skill_name:    evo.result_skill_name,
          icon:          '⚡',
          description:   evo.result_description,
          current_level: activeLv,
          max_level:     activeCfg.max_level,
          is_new:        false,
          is_evolution:  true,
          evo_recipe: {
            active_icon:  activeCfg.icon,
            active_name:  activeCfg.skill_name,
            passive_icon: passiveCfg?.icon ?? '?',
            passive_name: passiveCfg?.skill_name ?? '',
          },
        });
      }
    }

    /* ── 일반 스킬 후보 ── */
    const candidates: SkillConfig[] = [];
    for (const cfg of this.data.skills.values()) {
      /* AUTO 타입(기본공격)은 레벨업 카드에 표시하지 않음 */
      if (cfg.skill_type === 'AUTO') continue;
      const curLv = this.equippedSkills.get(cfg.skill_id) ?? 0;
      /* 이미 진화로 교체된 스킬은 제외 */
      const wasEvolved = [...this.data.evolutions].some(e => e.active_skill_id === cfg.skill_id && this.evolvedSkills.has(e.result_skill_id));
      if (!wasEvolved && curLv < cfg.max_level) candidates.push(cfg);
    }

    const rules = this.data.levelUpRules;
    const evoSlot = evolutionCards.length > 0
      ? (rules.evoRandomPick
        ? [evolutionCards[Math.floor(Math.random() * evolutionCards.length)]]
        : evolutionCards.slice(0, rules.maxEvoCards))
      : [];
    const remainSlots = Math.max(0, rules.cardCount - evoSlot.length);

    const shuffled = (rules.normalShuffle
      ? [...candidates].sort(() => Math.random() - 0.5)
      : candidates
    ).slice(0, remainSlots);
    const normalCards: SkillCardData[] = shuffled.map(cfg => {
      const curLv = this.equippedSkills.get(cfg.skill_id) ?? 0;
      return {
        skill_id:      cfg.skill_id,
        skill_name:    cfg.skill_name,
        icon:          cfg.icon,
        description:   cfg.description,
        current_level: curLv,
        max_level:     cfg.max_level,
        is_new:        curLv === 0,
      };
    });

    return rules.evoFirstInList ? [...evoSlot, ...normalCards] : [...normalCards, ...evoSlot];
  }

  /* ── 게임오버 ── */
  /** 인게임 획득 골드/EXP를 메타에 적립 + 모험 레벨업 처리 + 저장 */
  private _bankGold() {
    this.metaGold += this.gold;
    this._bankAdventureExp(Math.floor(this.totalXpEarned));
    this._saveMeta();
  }

  private _gameOver() {
    /* 라바 퀘스트 모드: 일반 결과창 대신 LQ 실패 처리 */
    if (this.lavaQuestMode) {
      this._onLavaQuestEnd(false);
      return;
    }
    this._bankGold();
    this._addEventCurrency(1, 1); // 게임 클리어 보너스
    this._setGameState('GAMEOVER');
    const mins = Math.floor(this.elapsedSec / 60);
    const secs = Math.floor(this.elapsedSec % 60);
    hudStore.setMany({
      '/result/visible':      true,
      '/result/isVictory':    false,
      '/result/killCount':    this.killCount,
      '/result/survivalTime': `${String(mins).padStart(2,'0')}:${String(secs).padStart(2,'0')}`,
      '/result/finalLevel':   this.level,
      '/result/totalXpEarned': Math.floor(this.totalXpEarned),
      '/result/goldEarned':   this.gold,
      '/result/ticketMultiplier': this.ticketMultiplier,
      '/result/tycoonEarned': this.eventBridge?.getTycoonPoints() ?? this.killCount * this.ticketMultiplier,
    });
  }

  /* ── 스테이지 클리어 ── */
  /* ── 라바 퀘스트 모드 시작 (App.tsx에서 호출) ── */
  startLavaQuestMode(level: number, isLast: boolean) {
    this.lavaQuestMode = true;
    this.lavaQuestLevel = level;
    this.lavaQuestIsLast = isLast;
    this.lavaQuestElapsed = 0;

    const hostRule = this.data.lavaQuestHost.find(
      r => level >= r.level_min && level <= r.level_max,
    ) ?? this.data.lavaQuestHost[this.data.lavaQuestHost.length - 1];
    const bossId = hostRule?.boss_id ?? 'titan';
    const bossCfg = this.data.bosses.find(b => b.boss_id === bossId) ?? this.data.finalBoss;
    const spawnOverride = hostRule?.boss_spawn_sec_override ?? 50;
    (bossCfg as { spawn_time_seconds: number }).spawn_time_seconds = spawnOverride;
    this.lavaQuestBossCfg = bossCfg;
    this.bossCtrl.reconfigure(bossCfg);

    this.ticketMultiplier = 1;
    this._resetSpawnSchedule();
    this._equipStartSkill();
    this._applyTalents();
    hudStore.set('/lobby/visible', false);
    hudStore.set('/game/lavaQuestActive', true);
    hudStore.setMany({
      '/scene/transitionText': `LAVA QUEST  Lv.${level}`,
      '/scene/transitionVisible': true,
      '/hud/stage': level,
      '/lobby/stageName': '라바 퀘스트',
      '/hud/hpPct': 100,
      '/pause/visible': false,
    });
    this._setGameState('PAUSED');
    focusPrismGameShell();
    if (this.transitionTimer !== null) window.clearTimeout(this.transitionTimer);
    this.transitionTimer = window.setTimeout(() => {
      hudStore.setMany({
        '/scene/transitionVisible': false,
        '/pause/visible': false,
      });
      this._spawnInitialXp();
      this._setGameState('PLAYING');
      focusPrismGameShell();
      this.transitionTimer = null;
    }, this._ct('scene_transition_ms', 3400));
  }

  /* 라바 퀘스트 결과 처리 — 호스트 역할 */
  private _onLavaQuestEnd(success: boolean) {
    if (!this.lavaQuestMode) return;
    this.lavaQuestMode = false;

    /* 최종 보상은 Lava iframe → event:grant (lq_stage_reward level 7) */

    if (this.lavaQuestBossCfg) {
      const orig = this.data.bosses.find(b => b.boss_id === this.lavaQuestBossCfg!.boss_id);
      if (orig) {
        (this.lavaQuestBossCfg as { spawn_time_seconds: number }).spawn_time_seconds =
          orig.spawn_time_seconds;
      }
      this.lavaQuestBossCfg = null;
    }
    /* bossCtrl을 최종보스로 원복 (일반 모드 대비) */
    this.bossCtrl.reconfigure(this.data.finalBoss);

    /* 1.2초 후 iframe 복원 + 결과 전달 (플레이어가 결과 볼 시간) */
    this._setGameState('PAUSED');
    hudStore.set('/hud/bossVisible', false);
    window.setTimeout(() => {
      // 1.2초 뒤, 트랜지션 애니메이션 시작
      hudStore.setMany({
        '/scene/transitionText': success ? 'VICTORY' : 'DEFEAT',
        '/scene/transitionVisible': true,
      });

      // 850ms 뒤(화면이 완전히 가려진 순간) 로비 복원 및 리셋
      window.setTimeout(() => {
        hudStore.set('/game/lavaQuestActive', false);
        resumeEventMinigame();
        this._reset(true);
        this._syncLobbyInfo();
        window.setTimeout(() => {
          const iframe = getActiveMinigameIframe();
          iframe?.contentWindow?.postMessage({ type: 'lq:result', success }, '*');
        }, 100);
      }, 850);

      // 2650ms 뒤 트랜지션 해제
      window.setTimeout(() => {
        hudStore.set('/scene/transitionVisible', false);
      }, 2650);
    }, 1200);
  }

  /* 이벤트 재화 적립 — localStorage + hudStore 동시 업데이트 */
  private _addEventCurrency(lavaTickets: number, prizeBalls: number) {
    const curLava  = Number(hudStore.get('/lobby/lavaTickets') ?? 0);
    const curPrize = Number(hudStore.get('/lobby/prizeBalls') ?? 0);
    hudStore.setMany({
      '/lobby/lavaTickets': curLava  + lavaTickets,
      '/lobby/prizeBalls':  curPrize + prizeBalls,
    });
  }

  /* ── 이벤트 보상 실지급 (App.tsx event:grant 수신 → 호출) ──
   * rewards: [{ kind: 'gold'|'gem'|'lightning'|'equip', amount?, slotId? }] */
  /** 장비 상세 팝업용 HUD 동기화 (iframe 보상 설명) */
  refreshEquipHud() {
    this._syncEquipItems();
  }

  grantReward(rewards: Array<{ kind: string; amount?: number; slotId?: string }>) {
    for (const r of rewards) {
      const amt = Number(r.amount ?? 0);
      switch (r.kind) {
        case 'gold':      this.metaGold += amt; break;
        case 'gem':       this.metaGems += amt; break;
        case 'lightning': this.metaEnergy += amt; break;
        case 'equip': {
          const slot = r.slotId?.trim();
          if (!slot) break;
          const eq = this.data.equipment.find(e => e.slot_id === slot);
          if (!eq) break;
          const cur = this.equipLevels[slot] ?? 0;
          if (cur < eq.max_level) {
            this.equipLevels[slot] = cur > 0 ? cur + 1 : 1;
            if (cur === 0) this.equippedSlots.add(slot);
          }
          break;
        }
      }
    }
    this._saveMeta();
    /* 로비 HUD 재화 + 장비 목록 동기화 */
    hudStore.setMany({
      '/lobby/gems': this.metaGems,
      '/lobby/metaGold': this.metaGold,
      '/lobby/entryTickets': this.metaEnergy,
    });
    this._syncEquipItems();
  }

  private _stageClear() {
    /* 라바 퀘스트 모드: 일반 결과창 대신 LQ 성공 처리 */
    if (this.lavaQuestMode) {
      this._onLavaQuestEnd(true);
      return;
    }
    /* 도전 클리어 시 잠금해제 + 보상(보석/골드) */
    if (this.activeChallengeId > 0 && !this.clearedChallenges.has(this.activeChallengeId)) {
      const c = this.data.challenges.find(x => x.challenge_id === this.activeChallengeId);
      if (c) {
        this.clearedChallenges.add(c.challenge_id);
        this.metaDna += c.reward_dna;
        this.metaGold += c.reward_gold;
      }
    }
    this._bankGold();
    this._setGameState('GAMEOVER');
    const mins = Math.floor(this.elapsedSec / 60);
    const secs = Math.floor(this.elapsedSec % 60);
    hudStore.setMany({
      '/result/visible':      true,
      '/result/isVictory':    true,
      '/result/killCount':    this.killCount,
      '/result/survivalTime': `${String(mins).padStart(2,'0')}:${String(secs).padStart(2,'0')}`,
      '/result/finalLevel':   this.level,
      '/result/totalXpEarned': Math.floor(this.totalXpEarned),
      '/result/goldEarned':   this.gold,
      '/result/ticketMultiplier': this.ticketMultiplier,
      '/result/tycoonEarned': this.eventBridge?.getTycoonPoints() ?? (this.killCount + this._ct('result_clear_bonus_kills', 50)) * this.ticketMultiplier,
    });
  }

  /* ── 게임 상태 전환 ── */
  private _setGameState(state: GameState) {
    this.gameState = state;
    this.input.setGameState(state);
  }

  /* ── 이벤트: 액션 (pause / retry) ── */
  private _onAction = (e: Event) => {
    const action = (e as CustomEvent<string>).detail;
    if (action === 'START_GAME') {
      /* 일반 전투 — 도전 배율 초기화 */
      this.activeChallengeId = 0;
      this.challengeHpMult = 1;
      this.challengeDmgMult = 1;
      this._startFromLobbyMult();
      return;
    }
    if (action === 'TOGGLE_PAUSE') {
      if (this.gameState === 'PLAYING') {
        this._setGameState('PAUSED');
        hudStore.set('/pause/visible', true);
      } else if (this.gameState === 'PAUSED' && hudStore.get('/pause/visible')) {
        hudStore.set('/pause/visible', false);
        this._setGameState('PLAYING');
      }
    }
    if (action === 'RETRY') {
      this._reset();
    }
    if (action === 'OPEN_LUCKY_TRAIN') {
      this._openLuckyTrain();
      return;
    }
    if (action === 'GIVE_UP') {
      /* 인게임 포기 — 패배 결과 화면으로 (그동안 획득물 정산) */
      if (this.gameState === 'PLAYING' || this.gameState === 'PAUSED' || this.gameState === 'LEVELUP') {
        hudStore.setMany({ '/pause/visible': false, '/modal/visible': false });
        this._gameOver();
      }
      return;
    }
    if (action === 'EXIT') {
      if (this.pendingStageAdvance) {
        this.pendingStageAdvance = false;
        this._advanceToNextStage();
        return;
      }
      // 트랜지션 시작
      hudStore.setMany({
        '/scene/transitionText': 'RETURN TO LOBBY',
        '/scene/transitionVisible': true,
      });
      // 850ms 뒤 로비 리셋 실행
      window.setTimeout(() => {
        this._reset(true);
      }, 850);
      // 2650ms 뒤 트랜지션 해제
      window.setTimeout(() => {
        hudStore.set('/scene/transitionVisible', false);
      }, 2650);
    }
    if (action === 'RESET_SESSION') {
      try {
        localStorage.removeItem(GameCore._SAVE_KEY);
      } catch {
        // ignore storage errors
      }
      window.location.reload();
      return;
    }
  };

  /* ── 이벤트: 스킬 선택 ── */
  private _onSkillSelect = (e: Event) => {
    const skillId = (e as CustomEvent<string>).detail;

    /* ── 진화 스킬 선택 처리 ── */
    const evo = this.data.evolutions.find(ev => ev.result_skill_id === skillId);
    if (evo) {
      /* 베이스 액티브 스킬을 진화 스킬로 교체 */
      const activeLevel = this.equippedSkills.get(evo.active_skill_id) ?? 5;
      this.equippedSkills.delete(evo.active_skill_id);
      this.equippedSkills.set(skillId, activeLevel);
      this.evolvedSkills.add(skillId);
      this.skillSystem.equipSkill(skillId, activeLevel);
      this._syncActiveSkillSlots();

      hudStore.set('/modal/visible', false);
      this._setGameState('PLAYING');
      return;
    }

    /* ── 일반 스킬 선택 ── */
    const curLv   = this.equippedSkills.get(skillId) ?? 0;
    const newLv   = curLv + 1;
    this.equippedSkills.set(skillId, newLv);

    const skillCfg = this.data.skills.get(skillId);
    if (skillCfg) {
      if (skillCfg.skill_type === 'ACTIVE') {
        this.skillSystem.equipSkill(skillId, newLv);
      } else {
        this._applyPassive(skillId, newLv);
      }
      this._syncActiveSkillSlots();
    }

    hudStore.set('/modal/visible', false);
    this._setGameState('PLAYING');
  };

  /* ── 이벤트: 숫자키 빠른 스킬 선택 (1/2/3) ── */
  private _onQuickSkill = (e: Event) => {
    if (this.gameState !== 'LEVELUP') return;
    const slot = (e as CustomEvent<number>).detail;
    const cards = hudStore.get('/modal/cards') as SkillCardData[] | undefined;
    if (!cards || slot < 1 || slot > cards.length) return;
    const picked = cards[slot - 1];
    if (!picked) return;
    window.dispatchEvent(new CustomEvent('prism:skillSelect', { detail: picked.skill_id }));
  };

  /* ── 행운 열차: 열기 ── */
  private _openLuckyTrain() {
    if (this.gameState !== 'PLAYING') return;

    const items: LuckyTrainSkillItem[] = [];
    this.data.luckyTrain.forEach((cfg, skillId) => {
      const skillCfg = this.data.skills.get(skillId);
      if (!skillCfg) return;
      items.push({
        skill_id: skillId,
        skill_name: skillCfg.skill_name,
        icon: skillCfg.icon,
        description: skillCfg.description,
        skill_type: skillCfg.skill_type,
        gold_cost: cfg.gold_cost,
        owned_level: this.equippedSkills.get(skillId) ?? 0,
      });
    });

    const firstUnowned = items.find(i => i.owned_level === 0);
    hudStore.setMany({
      '/luckyTrain/visible': true,
      '/luckyTrain/gold': this.gold,
      '/luckyTrain/skills': items,
      '/luckyTrain/selectedId': firstUnowned?.skill_id ?? items[0]?.skill_id ?? '',
    });
    this._setGameState('PAUSED');
  }

  private _onLuckyTrainSelect = (e: Event) => {
    const skillId = (e as CustomEvent<string>).detail;
    hudStore.set('/luckyTrain/selectedId', skillId);
  };

  private _onLuckyTrainBuy = (e: Event) => {
    const skillId = (e as CustomEvent<string>).detail;
    const cfg = this.data.luckyTrain.get(skillId);
    if (!cfg) return;
    if (this.gold < cfg.gold_cost) return;
    if ((this.equippedSkills.get(skillId) ?? 0) > 0) return;

    this.gold -= cfg.gold_cost;

    const skillCfg = this.data.skills.get(skillId);
    if (skillCfg) {
      this.equippedSkills.set(skillId, 1);
      if (skillCfg.skill_type === 'ACTIVE') {
        this.skillSystem.equipSkill(skillId, 1);
      } else {
        this._applyPassive(skillId, 1);
      }
      this._syncActiveSkillSlots();
    }

    hudStore.setMany({
      '/hud/gold': this.gold,
      '/luckyTrain/visible': false,
    });
    this._setGameState('PLAYING');
  };

  private _onLuckyTrainClose = () => {
    hudStore.set('/luckyTrain/visible', false);
    this._setGameState('PLAYING');
  };

  private get maxStages(): number {
    return this.data.stages.length || 10;
  }

  private get maxEnergy(): number {
    return this.data.meta.maxEnergy;
  }

  private _stageName(stage: number): string {
    return this.data.stages.find(s => s.stage === stage)?.stage_name ?? `STAGE ${stage}`;
  }

  /* ── 로비 정보 동기화 ── */
  private _syncLobbyInfo() {
    const stageCfg = this.data.stages[this.currentStage - 1];
    /* 모험 레벨 진행도 */
    const curReq = this._advExpForLevel(this.adventureLevel);
    const nextReq = this._advExpForLevel(this.adventureLevel + 1);
    const advPct = nextReq === Infinity ? 100
      : Math.max(0, Math.min(100, ((this.adventureExp - curReq) / (nextReq - curReq)) * 100));
    
    const activeChar = this.data.players.find(p => p.player_id === this.selectedPlayerId) || this.data.player;
    const affordable = this.multOptions.filter(m => this._energyForMult(m) <= this.metaEnergy);
    if (!affordable.includes(this.selectedMult)) {
      this.selectedMult = affordable.length ? affordable[affordable.length - 1]! : 1;
    }

    if (hudStore.getSnapshot()['/lobby/visible']) {
      this.eventBridge?.syncTicketMultiplier(this.selectedMult);
    }

    this._syncEquipItems();
    this._syncEvolutionItems();

    hudStore.setMany({
      '/lobby/selectedStage': this.currentStage,
      '/lobby/maxStages': this.maxStages,
      '/lobby/stageEnemyMult': stageCfg?.enemy_hp_mult ?? 1.0,
      '/lobby/ticketSummary': '',
      '/lobby/advLevel': this.adventureLevel,
      '/lobby/advExpPct': advPct,
      '/lobby/gems': this.metaGems,
      '/lobby/metaGold': this.metaGold,
      '/lobby/entryTickets': this.metaEnergy,
      '/lobby/selectedMult': this.selectedMult,
      '/lobby/multEnergyCost': this._energyForMult(this.selectedMult),
      '/lobby/stageName': this._stageName(this.currentStage),
      '/lobby/bestTime': '--:--',
      '/lobby/selectedPlayerId': this.selectedPlayerId,
      '/lobby/selectedPlayerColorHex': activeChar.color_hex,
    });
  }

  private _onLobbySelectStage = (e: Event) => {
    const s = (e as CustomEvent<number>).detail;
    if (s < 1 || s > this.maxStages) return;
    this.currentStage = s;        // 자유 선택
    this._syncLobbyInfo();
  };

  /* ── 영구 특성 시스템 ── */
  private static _TALENT_ICON: Record<string, string> = {
    power: '⚔️', hp: '❤️', speed: '👟', exp_boost: '⬡',
  };

  /** 특성 효과 문자열 포맷 (퍼센트형 vs 절대값형) */
  private _formatTalentEffect(talentId: string, effectPerLevel: number, level: number): string {
    const total = effectPerLevel * level;
    // hp는 절대값(+50), 나머지는 퍼센트
    if (talentId === 'hp') return level > 0 ? `+${total}` : '+0';
    return level > 0 ? `+${Math.round(total * 100)}%` : '+0%';
  }

  private _onOpenTalent = () => {
    this._syncTalentItems();
    hudStore.set('/talent/visible', true);
  };

  private _syncTalentItems() {
    const items = this.data.talents.map(t => {
      const lv = this.talentLevels[t.talent_id] ?? 0;
      const costs = this.data.talentCosts.get(t.talent_id) ?? [];
      const nextCostRow = costs.find(c => c.level === lv + 1);
      return {
        talent_id: t.talent_id,
        talent_name: t.talent_name,
        description: t.description,
        icon: GameCore._TALENT_ICON[t.talent_id] ?? '🌟',
        current_level: lv,
        max_level: t.max_level,
        current_effect: this._formatTalentEffect(t.talent_id, t.effect_per_level, lv),
        next_effect: this._formatTalentEffect(t.talent_id, t.effect_per_level, lv + 1),
        next_cost: (lv >= t.max_level || !nextCostRow) ? 0 : nextCostRow.gold_cost,
      };
    });
    hudStore.setMany({
      '/talent/items': items,
      '/talent/gold': this.metaGold,
    });
  }

  private _onTalentUpgrade = (e: Event) => {
    const id = (e as CustomEvent<string>).detail;
    const t = this.data.talents.find(x => x.talent_id === id);
    if (!t) return;
    const lv = this.talentLevels[id] ?? 0;
    if (lv >= t.max_level) return;
    const costRow = (this.data.talentCosts.get(id) ?? []).find(c => c.level === lv + 1);
    if (!costRow || this.metaGold < costRow.gold_cost) return;

    this.metaGold -= costRow.gold_cost;
    this.talentLevels[id] = lv + 1;
    this._saveMeta();
    this._syncTalentItems();
  };

  private _onTalentClose = () => {
    hudStore.set('/talent/visible', false);
  };

  /* ── 장비 시스템 ── */
  private _equipNextCost(eq: import('./data').EquipmentConfig, level: number): number {
    if (level >= eq.max_level) return 0;
    return Math.round(eq.base_gold_cost * Math.pow(eq.gold_cost_scale, level - 1));
  }

  private _equipStatLabel(eq: import('./data').EquipmentConfig, level: number): string {
    const total = eq.effect_per_level * level;
    if (eq.stat_type === 'hp') return `HP +${total}`;
    if (eq.stat_type === 'speed') return `이속 +${Math.round(total * 100)}%`;
    return `ATK +${Math.round(total * 100)}%`; // power
  }

  /** 장비 누적 스탯 합산 (stat_type별) */
  private _equipBonus(statType: string): number {
    let sum = 0;
    for (const eq of this.data.equipment) {
      if (eq.stat_type !== statType) continue;
      if (!this.equippedSlots.has(eq.slot_id)) continue;   // 장착된 슬롯만 반영
      sum += eq.effect_per_level * (this.equipLevels[eq.slot_id] ?? 0);
    }
    return sum;
  }

  private _onOpenEquip = () => {
    this._syncEquipItems();
    hudStore.set('/equip/visible', true);
    window.dispatchEvent(new CustomEvent('redDot:markSeen', { detail: 'nav_equip_new' }));
    refreshEventRedDots();
  };

  private _syncEquipItems() {
    const items = this.data.equipment.map(eq => {
      const lv = this.equipLevels[eq.slot_id] ?? 1;
      return {
        slot_id: eq.slot_id,
        slot_name: eq.slot_name,
        item_name: eq.item_name,
        icon: eq.icon,
        grade: eq.grade,
        stat_type: eq.stat_type as 'power' | 'hp' | 'speed',
        current_level: lv,
        max_level: eq.max_level,
        current_stat: this._equipStatLabel(eq, lv),
        next_cost: this._equipNextCost(eq, lv),
        description: eq.description,
        equipped: this.equippedSlots.has(eq.slot_id),
        skill_id: eq.skill_id,
      };
    });
    hudStore.setMany({
      '/equip/items': items,
      '/equip/gold': this.metaGold,
      '/equip/atk': this._equipBonus('power'),
      '/equip/hp': this._equipBonus('hp'),
      '/equip/spd': this._equipBonus('speed'),
    });
  }

  private _onEquipUpgrade = (e: Event) => {
    const id = (e as CustomEvent<string>).detail;
    const eq = this.data.equipment.find(x => x.slot_id === id);
    if (!eq) return;
    const lv = this.equipLevels[id] ?? 1;
    if (lv >= eq.max_level) return;
    const cost = this._equipNextCost(eq, lv);
    if (this.metaGold < cost) return;
    this.metaGold -= cost;
    this.equipLevels[id] = lv + 1;
    this._saveMeta();
    this._syncEquipItems();
    refreshEventRedDots();
    window.dispatchEvent(new CustomEvent('equip:upgradeSuccess', {
      detail: { slotId: id, level: lv + 1 },
    }));
    window.dispatchEvent(new CustomEvent('lobby:toast', { detail: '레벨업!' }));
  };

  /** 무기 아이템 장착 (상호 배타: 같은 무기 그룹의 다른 무기는 자동 해제) */
  private _equipWeapon(id: string) {
    for (const eq of this.data.equipment) {
      if (eq.skill_id && eq.slot_id !== id) this.equippedSlots.delete(eq.slot_id);
    }
    this.equippedSlots.add(id);
    this.skillSystem.basicSkillId = this._equippedWeaponSkill();
  }

  private _onEquipToggle = (e: Event) => {
    const id = (e as CustomEvent<string>).detail;
    const eq = this.data.equipment.find(x => x.slot_id === id);
    if (!eq) return;
    if (eq.skill_id) {
      /* 무기는 토글 대신 교체(항상 1종 장착 유지) */
      this._equipWeapon(id);
    } else {
      if (this.equippedSlots.has(id)) this.equippedSlots.delete(id);
      else this.equippedSlots.add(id);
    }
    this._syncWeaponVisual();
    this._saveMeta();
    this._syncEquipItems();
  };

  private _onEquipEquip = (e: Event) => {
    const id = (e as CustomEvent<string>).detail;
    const eq = this.data.equipment.find(x => x.slot_id === id);
    if (!eq) return;
    if (this.equippedSlots.has(id)) return;
    if (eq.skill_id) this._equipWeapon(id);     // 무기 교체(상호 배타)
    else this.equippedSlots.add(id);
    this._syncWeaponVisual();
    this._saveMeta();
    this._syncEquipItems();
    window.dispatchEvent(new CustomEvent('lobby:toast', { detail: '장착 완료' }));
  };

  private _onEquipUnequip = (e: Event) => {
    const id = (e as CustomEvent<string>).detail;
    const eq = this.data.equipment.find(x => x.slot_id === id);
    if (eq?.skill_id) {
      /* 무기는 항상 1종 장착 유지 → 해제 불가 */
      window.dispatchEvent(new CustomEvent('lobby:toast', { detail: '무기는 최소 1개 장착해야 합니다' }));
      return;
    }
    if (!this.equippedSlots.has(id)) return;
    this.equippedSlots.delete(id);
    this._saveMeta();
    this._syncEquipItems();
    window.dispatchEvent(new CustomEvent('lobby:toast', { detail: '장비 해제' }));
  };

  private _onEquipClose = () => {
    hudStore.set('/equip/visible', false);
  };

  /* ── 모험 레벨 시스템 ── */
  private pendingAdvUp: { level: number; gem: number; gold: number } | null = null;

  /** 모험 레벨업에 필요한 누적 EXP (다음 레벨) */
  private _advExpForLevel(level: number): number {
    const row = this.data.adventure.find(a => a.level === level);
    return row?.exp_required ?? Infinity;
  }

  /** 전투 EXP를 모험 EXP에 누적 + 레벨업 처리 (보상 보석/골드) */
  private _bankAdventureExp(xp: number) {
    this.adventureExp += xp;
    const maxLevel = this.data.adventure[this.data.adventure.length - 1]?.level ?? 1;
    let gainedGem = 0, gainedGold = 0, newLevel = this.adventureLevel;
    while (newLevel < maxLevel && this.adventureExp >= this._advExpForLevel(newLevel + 1)) {
      newLevel++;
      const row = this.data.adventure.find(a => a.level === newLevel);
      if (row) { gainedGem += row.reward_gem; gainedGold += row.reward_gold; }
    }
    if (newLevel > this.adventureLevel) {
      this.adventureLevel = newLevel;
      this.metaGems += gainedGem;
      this.metaGold += gainedGold;
      /* 로비 복귀 시 띄울 팝업 예약 (마지막 도달 레벨 기준) */
      this.pendingAdvUp = { level: newLevel, gem: gainedGem, gold: gainedGold };
    }
  }

  /** 로비 진입 시 예약된 모험 레벨업 팝업 표시 */
  private _showPendingAdvUp() {
    if (!this.pendingAdvUp) return;
    const p = this.pendingAdvUp;
    this.pendingAdvUp = null;
    hudStore.setMany({
      '/advUp/visible': true,
      '/advUp/level': p.level,
      '/advUp/rewardGem': p.gem,
      '/advUp/rewardGold': p.gold,
    });
  }

  private _onAdvUpClose = () => {
    hudStore.set('/advUp/visible', false);
  };

  /* ── 준비중 토스트 ── */
  private toastTimer: number | null = null;
  private _onLobbyToast = (e: Event) => {
    const text = (e as CustomEvent<string>).detail || '준비 중입니다';
    hudStore.setMany({ '/toast/visible': true, '/toast/text': text });
    if (this.toastTimer !== null) window.clearTimeout(this.toastTimer);
    this.toastTimer = window.setTimeout(() => {
      hudStore.set('/toast/visible', false);
      this.toastTimer = null;
    }, 1600);
  };

  /* ── 상점 (구매 테스트) ── */
  private _closeLobbySubScreens() {
    hudStore.setMany({
      '/equip/visible': false,
      '/challenge/visible': false,
      '/evolution/visible': false,
      '/talent/visible': false,
      '/shop/visible': false,
    });
  }

  private _syncShopHud() {
    const { shopTest, shopGemPacks, shopGoldPacks, shopBoxes } = this.data;
    hudStore.setMany({
      '/shop/cashKrw': this.metaCashKrw,
      '/shop/gems': this.metaGems,
      '/shop/metaGold': this.metaGold,
      '/shop/energy': this.metaEnergy,
      '/shop/supplyKeys': this.supplyKeys,
      '/shop/defensePity': this.defensePity,
      '/shop/purchasedGemIds': [...this.purchasedGemPacks],
      '/shop/gemPacks': shopGemPacks.map(p => ({
        pack_id: p.pack_id,
        label: p.label,
        gems: p.gems,
        bonus_gems: p.bonus_gems,
        price_krw: p.price_krw,
      })),
      '/shop/goldPacks': shopGoldPacks.map(p => ({
        pack_id: p.pack_id,
        label: p.label,
        sublabel: p.sublabel,
        gold: p.gold,
        gem_cost: p.gem_cost,
        is_free: p.is_free,
      })),
      '/shop/boxes': shopBoxes.map(b => ({
        box_id: b.box_id,
        label: b.label,
        subtitle: b.subtitle,
        gem_cost: b.gem_cost,
        key_cost: b.key_cost,
        pity_max: b.pity_max,
        banner_title: b.banner_title,
        banner_desc: b.banner_desc,
      })),
      '/shop/maxEnergy': this.maxEnergy,
      '/shop/showResetButton': shopTest.showResetButton,
      '/shop/testCashKrw': shopTest.testCashKrw,
    });
  }

  private _shopToast(msg: string) {
    window.dispatchEvent(new CustomEvent('lobby:toast', { detail: msg }));
  }

  private _ensureTestGemsFloor() {
    const floor = this.data.shopTest.testResetGems;
    if (this.metaGems < floor) this.metaGems = floor;
  }

  private _onOpenShop = () => {
    this._closeLobbySubScreens();
    this._ensureTestGemsFloor();
    this._syncShopHud();
    hudStore.set('/shop/visible', true);
    this._syncLobbyInfo();
    window.dispatchEvent(new CustomEvent('redDot:markSeen', { detail: 'nav_shop_new' }));
    refreshEventRedDots();
  };

  private _onShopClose = () => {
    hudStore.set('/shop/visible', false);
  };

  private _onShopResetCash = () => {
    const { shopTest } = this.data;
    this.metaCashKrw = shopTest.testCashKrw;
    this.metaGems = shopTest.testResetGems;
    this.purchasedGemPacks.clear();
    this._saveMeta();
    this._syncShopHud();
    this._syncLobbyInfo();
    this._shopToast(`캐시 ${fmtKrw(shopTest.testCashKrw)} · 💎${shopTest.testResetGems} · 첫구매 초기화`);
  };

  private _onShopBuyGem = (e: Event) => {
    const id = (e as CustomEvent<string>).detail;
    const pack = this.data.shopGemPacks.find(p => p.pack_id === id);
    if (!pack) return;
    if (this.metaCashKrw < pack.price_krw) {
      this._shopToast(`캐시 부족 (보유 ${fmtKrw(this.metaCashKrw)})`);
      return;
    }
    const isFirst = this.data.meta.firstPurchaseDouble && !this.purchasedGemPacks.has(pack.pack_id);
    this.metaCashKrw -= pack.price_krw;
    const gained = pack.gems + (isFirst ? pack.bonus_gems : 0);
    this.metaGems += gained;
    if (isFirst) this.purchasedGemPacks.add(pack.pack_id);
    this._saveMeta();
    this._syncShopHud();
    this._syncLobbyInfo();
    const bonusNote = isFirst ? ' (첫구매 두배)' : '';
    this._shopToast(`${fmtKrw(pack.price_krw)} 결제 · 💎 ${gained.toLocaleString()} 획득${bonusNote}`);
  };

  private _onShopBuyGold = (e: Event) => {
    const id = (e as CustomEvent<string>).detail;
    const pack = this.data.shopGoldPacks.find(p => p.pack_id === id);
    if (!pack) return;
    if (pack.is_free) {
      this.metaGold += pack.gold;
      this._saveMeta();
      this._syncShopHud();
      this._syncLobbyInfo();
      this._shopToast(`무료 골드 🪙 ${pack.gold.toLocaleString()} 획득`);
      return;
    }
    if (this.metaGems < pack.gem_cost) {
      this._shopToast(`보석 부족 (필요 💎${pack.gem_cost})`);
      return;
    }
    this.metaGems -= pack.gem_cost;
    this.metaGold += pack.gold;
    this._saveMeta();
    this._syncShopHud();
    this._syncLobbyInfo();
    this._shopToast(`💎${pack.gem_cost} 사용 · 🪙 ${pack.gold.toLocaleString()} 획득`);
  };

  private _boxGradeTable(boxId: string): ShopBoxGradeConfig[] {
    return this.data.shopBoxGrades.get(boxId) ?? [];
  }

  private _grantBoxEquipment(equipmentGrade: string, fallbackGold: number): string {
    const pool = this.data.equipment.filter(e => e.grade === equipmentGrade);
    const list = pool.length ? pool : this.data.equipment;
    const target = list[Math.floor(Math.random() * list.length)];
    const cur = this.equipLevels[target.slot_id] ?? 1;
    if (cur < target.max_level) {
      this.equipLevels[target.slot_id] = cur + 1;
      this._syncEquipItems();
      return `${target.item_name} Lv.${cur + 1}`;
    }
    this.metaGold += fallbackGold;
    this._syncEquipItems();
    return `만렙 · 🪙${fallbackGold.toLocaleString()}`;
  }

  private _onShopOpenBox = (e: Event) => {
    const boxId = (e as CustomEvent<string>).detail;
    const box = this.data.shopBoxes.find(b => b.box_id === boxId);
    if (!box) return;
    const grades = this._boxGradeTable(boxId);
    if (!grades.length) return;

    if (boxId === 'defense') {
      let paid = false;
      if (this.supplyKeys > 0) {
        this.supplyKeys -= 1;
        paid = true;
      } else if (this.metaGems >= box.gem_cost) {
        this.metaGems -= box.gem_cost;
        paid = true;
      }
      if (!paid) {
        this._shopToast(`열쇠 또는 💎${box.gem_cost} 필요`);
        return;
      }
      this.defensePity += 1;
      const forceGrade = box.pity_max > 0 && this.defensePity >= box.pity_max
        ? box.pity_force_grade
        : undefined;
      const grade = pickWeighted(grades, r => r.equipment_grade, forceGrade || undefined);
      const row = grades.find(g => g.equipment_grade === grade) ?? grades[0];
      if (box.pity_force_grade && grade === box.pity_force_grade) this.defensePity = 0;
      if (box.key_bonus_chance > 0 && Math.random() < box.key_bonus_chance) this.supplyKeys += 1;
      const msg = this._grantBoxEquipment(grade, row.grant_fallback_gold);
      this._saveMeta();
      this._syncShopHud();
      this._syncLobbyInfo();
      this._shopToast(`${box.label} · ${msg}${forceGrade ? ' (천장)' : ''}`);
      return;
    }

    if (this.metaGems < box.gem_cost) {
      this._shopToast(`보석 부족 (필요 💎${box.gem_cost})`);
      return;
    }
    this.metaGems -= box.gem_cost;
    const grade = pickWeighted(grades, r => r.equipment_grade);
    const row = grades.find(g => g.equipment_grade === grade) ?? grades[0];
    const msg = this._grantBoxEquipment(grade, row.grant_fallback_gold);
    this._saveMeta();
    this._syncShopHud();
    this._syncLobbyInfo();
    this._shopToast(`${box.label} · ${msg}`);
  };

  /* ── 세일 이벤트 (드라이버 / 쇼핑몰) — 상점 테스트 캐시·보석·grant 재사용 ── */
  getSalesWallet() {
    return {
      cashKrw: this.metaCashKrw,
      gems: this.metaGems,
      gold: this.metaGold,
      energy: this.metaEnergy,
    };
  }

  trySpendSalesCashKrw(amount: number): boolean {
    if (amount <= 0) return true;
    if (this.metaCashKrw < amount) return false;
    this.metaCashKrw -= amount;
    this._saveMeta();
    this._syncShopHud();
    this._syncLobbyInfo();
    return true;
  }

  trySpendSalesGems(amount: number): boolean {
    if (amount <= 0) return true;
    if (this.metaGems < amount) return false;
    this.metaGems -= amount;
    this._saveMeta();
    this._syncShopHud();
    this._syncLobbyInfo();
    return true;
  }

  private _grantSalesBoxFree(boxId: string): string {
    const box = this.data.shopBoxes.find(b => b.box_id === boxId);
    if (!box) return '상자 정보 없음';
    const grades = this._boxGradeTable(boxId);
    if (!grades.length) return '상자 등급 없음';

    if (boxId === 'defense') {
      this.defensePity += 1;
      const forceGrade = box.pity_max > 0 && this.defensePity >= box.pity_max
        ? box.pity_force_grade
        : undefined;
      const grade = pickWeighted(grades, r => r.equipment_grade, forceGrade || undefined);
      const row = grades.find(g => g.equipment_grade === grade) ?? grades[0];
      if (box.pity_force_grade && grade === box.pity_force_grade) this.defensePity = 0;
      if (box.key_bonus_chance > 0 && Math.random() < box.key_bonus_chance) this.supplyKeys += 1;
      return `${box.label} · ${this._grantBoxEquipment(grade, row.grant_fallback_gold)}`;
    }

    const grade = pickWeighted(grades, r => r.equipment_grade);
    const row = grades.find(g => g.equipment_grade === grade) ?? grades[0];
    return `${box.label} · ${this._grantBoxEquipment(grade, row.grant_fallback_gold)}`;
  }

  grantSalesRewards(lines: SalesRewardLine[]): string {
    const parts: string[] = [];
    for (const line of lines) {
      switch (line.reward_type) {
        case 'energy':
          this.metaEnergy += line.reward_qty;
          parts.push(`⚡${line.reward_qty}`);
          break;
        case 'meta_gold':
          this.metaGold += line.reward_qty;
          parts.push(`🪙${line.reward_qty.toLocaleString()}`);
          break;
        case 'gems':
          this.metaGems += line.reward_qty;
          parts.push(`💎${line.reward_qty}`);
          break;
        case 'supply_key':
          this.supplyKeys += line.reward_qty;
          parts.push(`🔑+${line.reward_qty}`);
          break;
        case 'dna':
          this.metaDna += line.reward_qty;
          parts.push(`🧬+${line.reward_qty}`);
          break;
        case 'open_box': {
          const boxId = line.reward_param || 'resource';
          parts.push(this._grantSalesBoxFree(boxId));
          break;
        }
        case 'equip_lv': {
          const grades = this._boxGradeTable('resource');
          const grade = grades.length
            ? pickWeighted(grades, r => r.equipment_grade)
            : 'NORMAL';
          const row = grades.find(g => g.equipment_grade === grade) ?? grades[0];
          const fb = row?.grant_fallback_gold ?? 500;
          parts.push(this._grantBoxEquipment(grade, fb));
          break;
        }
        default:
          break;
      }
    }
    this._saveMeta();
    this._syncShopHud();
    this._syncLobbyInfo();
    return parts.filter(Boolean).join(' · ') || '보상 수령';
  }

  /* ── 도전(Challenge) 시스템 ── */
  private _onOpenChallenge = () => {
    this._syncChallengeItems();
    /* 로비와 동일 — 보유 번개·배수 HUD 동기화 (별도 배수 팝업 없음) */
    const affordable = this.multOptions.filter(m => this._energyForMult(m) <= this.metaEnergy);
    this.selectedMult = affordable.length ? affordable[affordable.length - 1]! : 1;
    this._syncLobbyInfo();
    hudStore.set('/challenge/visible', true);
  };

  private _isChallengeUnlocked(c: import('./data').ChallengeConfig): boolean {
    return c.prereq_id === 0 || this.clearedChallenges.has(c.prereq_id);
  }

  private _syncChallengeItems() {
    const items = this.data.challenges.map(c => {
      const prereq = c.prereq_id
        ? this.data.challenges.find(x => x.challenge_id === c.prereq_id)
        : undefined;
      const prereqLabel = prereq
        ? `${this._stageName(prereq.stage)} · ${prereq.difficulty_name}`
        : '';
      return {
        challenge_id: c.challenge_id,
        stage: c.stage,
        stage_name: this._stageName(c.stage),
        difficulty: c.difficulty,
        difficulty_name: c.difficulty_name,
        enemy_hp_mult: c.enemy_hp_mult,
        enemy_dmg_mult: c.enemy_dmg_mult,
        reward_dna: c.reward_dna,
        reward_gold: c.reward_gold,
        prereq_id: c.prereq_id,
        prereq_label: prereqLabel,
        cleared: this.clearedChallenges.has(c.challenge_id),
        unlocked: this._isChallengeUnlocked(c),
      };
    });
    hudStore.set('/challenge/items', items);
  }

  private _onChallengeStart = (e: Event) => {
    const id = (e as CustomEvent<number>).detail;
    const c = this.data.challenges.find(x => x.challenge_id === id);
    if (!c || !this._isChallengeUnlocked(c)) return;
    this.activeChallengeId = id;
    this.challengeHpMult = c.enemy_hp_mult;
    this.challengeDmgMult = c.enemy_dmg_mult;
    this.currentStage = c.stage;
    hudStore.set('/challenge/visible', false);
    /* 로비와 동일 — 모달에서 고른 배수로 번개 소모 후 입장 */
    this._startFromLobbyMult();
  };

  private _onChallengeClose = () => {
    hudStore.set('/challenge/visible', false);
  };

  /* ── 진화(Evolution) 시스템 — 영구 강화 트리 ── */
  private _onOpenEvolution = () => {
    this._syncEvolutionItems();
    hudStore.set('/evolution/visible', true);
    window.dispatchEvent(new CustomEvent('redDot:markSeen', { detail: 'nav_evolution_new' }));
    refreshEventRedDots();
  };

  private _evoEffectLabel(n: import('./data').EvolutionNodeConfig): string {
    switch (n.ability_type) {
      case 'hp': return `HP +${n.effect_value}`;
      case 'armor': return `피해감소 +${Math.round(n.effect_value * 100)}%`;
      case 'speed': return `이속 +${Math.round(n.effect_value * 100)}%`;
      case 'cooldown': return `쿨타임 -${Math.round(n.effect_value * 100)}%`;
      case 'predator': return `처치 시 ${Math.round(n.effect_value * 100)}% 회복`;
      case 'magnet': return `수집범위 +${Math.round(n.effect_value * 100)}%`;
      default: return `공격력 +${Math.round(n.effect_value * 100)}%`; // power
    }
  }

  private _isEvoUnlockable(n: import('./data').EvolutionNodeConfig): boolean {
    return n.prereq_id === 0 || this.unlockedEvolutions.has(n.prereq_id);
  }

  private _syncEvolutionItems() {
    const items = [...this.data.evolutionTree]
      .sort((a, b) => a.order - b.order)
      .map(n => {
        const unlocked = this.unlockedEvolutions.has(n.evo_id);
        const available = !unlocked && this._isEvoUnlockable(n);
        const have = n.cost_type === 'dna' ? this.metaDna : this.metaGold;
        return {
          evo_id: n.evo_id,
          order: n.order,
          branch: n.branch,
          node_name: n.node_name,
          node_title: n.node_title,
          node_description: n.node_description,
          icon: n.icon,
          ability_type: n.ability_type,
          effect_label: this._evoEffectLabel(n),
          cost_type: n.cost_type,
          cost_amount: n.cost_amount,
          unlocked,
          affordable: have >= n.cost_amount,
          available,
        };
      });
    hudStore.setMany({ '/evolution/items': items, '/evolution/gold': this.metaGold, '/evolution/dna': this.metaDna });
  }

  private _onEvolutionUnlock = (e: Event) => {
    const id = (e as CustomEvent<number>).detail;
    const n = this.data.evolutionTree.find(x => x.evo_id === id);
    if (!n) return;
    if (this.unlockedEvolutions.has(id)) return;
    if (!this._isEvoUnlockable(n)) return;
    if (n.cost_type === 'dna') {
      if (this.metaDna < n.cost_amount) return;
      this.metaDna -= n.cost_amount;
    } else {
      if (this.metaGold < n.cost_amount) return;
      this.metaGold -= n.cost_amount;
    }
    this.unlockedEvolutions.add(id);
    this._saveMeta();
    this._syncEvolutionItems();
    refreshEventRedDots();
  };

  private _onEvolutionClose = () => {
    hudStore.set('/evolution/visible', false);
  };

  /** 진화 노드 능력 합산 (ability_type별) */
  private _evolutionBonus(statType: string): number {
    let sum = 0;
    for (const n of this.data.evolutionTree) {
      if (n.ability_type !== statType) continue;
      if (this.unlockedEvolutions.has(n.evo_id)) sum += n.effect_value;
    }
    return sum;
  }

  /* ── 영구 데이터 저장/로드 (localStorage) ── */
  private static _SAVE_KEY = 'prism_squad_save_v1';

  private _loadMeta() {
    try {
      const raw = localStorage.getItem(GameCore._SAVE_KEY);
      if (!raw) return;
      const data = JSON.parse(raw) as { metaGold?: number; talentLevels?: Record<string, number>; equipLevels?: Record<string, number>; metaGems?: number; supplyKeys?: number; defensePity?: number; purchasedGemPacks?: string[]; adventureExp?: number; adventureLevel?: number; clearedChallenges?: number[]; unlockedEvolutions?: number[]; metaDna?: number; metaEnergy?: number; selectedPlayerId?: string; equippedSlots?: string[] };
      if (typeof data.metaGold === 'number') this.metaGold = data.metaGold;
      if (typeof data.supplyKeys === 'number') this.supplyKeys = data.supplyKeys;
      if (typeof data.defensePity === 'number') this.defensePity = data.defensePity;
      if (Array.isArray(data.purchasedGemPacks)) {
        this.purchasedGemPacks = new Set(data.purchasedGemPacks);
      }
      if (typeof data.metaEnergy === 'number') this.metaEnergy = data.metaEnergy;
      if (this.metaEnergy < 500) this.metaEnergy = 500;
      if (typeof data.metaGems === 'number') this.metaGems = data.metaGems;
      if (typeof data.adventureExp === 'number') this.adventureExp = data.adventureExp;
      if (typeof data.adventureLevel === 'number') this.adventureLevel = data.adventureLevel;
      if (typeof data.metaDna === 'number') this.metaDna = data.metaDna;
      if (typeof data.selectedPlayerId === 'string') this.selectedPlayerId = data.selectedPlayerId;
      if (Array.isArray(data.clearedChallenges)) this.clearedChallenges = new Set(data.clearedChallenges);
      if (Array.isArray(data.unlockedEvolutions)) this.unlockedEvolutions = new Set(data.unlockedEvolutions);
      if (data.talentLevels) {
        for (const t of this.data.talents) {
          const lv = data.talentLevels[t.talent_id];
          if (typeof lv === 'number') this.talentLevels[t.talent_id] = Math.min(lv, t.max_level);
        }
      }
      if (data.equipLevels) {
        for (const eq of this.data.equipment) {
          const lv = data.equipLevels[eq.slot_id];
          if (typeof lv === 'number') this.equipLevels[eq.slot_id] = Math.min(Math.max(lv, 1), eq.max_level);
        }
      }
      if (Array.isArray(data.equippedSlots)) {
        this.equippedSlots = new Set(
          data.equippedSlots.filter(id => this.data.equipment.some(eq => eq.slot_id === id)),
        );
      }
      /* 무기 그룹은 정확히 1종만 장착 유지 (저장 손상/구버전 대비) */
      const weaponIds = this.data.equipment.filter(eq => eq.skill_id).map(eq => eq.slot_id);
      const equippedWeapons = weaponIds.filter(id => this.equippedSlots.has(id));
      if (equippedWeapons.length === 0 && weaponIds.length > 0) {
        this.equippedSlots.add(weaponIds[0]);
      } else if (equippedWeapons.length > 1) {
        for (const id of equippedWeapons.slice(1)) this.equippedSlots.delete(id);
      }
    } catch { /* 손상된 저장 무시 */ }
    /* 캐시 DB는 저장하지 않음 — 리셋/새 접속 시 항상 테스트 금액 */
    this.metaCashKrw = this.data.shopTest.testCashKrw;
    this._ensureTestGemsFloor();
  }

  private _saveMeta() {
    try {
      localStorage.setItem(GameCore._SAVE_KEY, JSON.stringify({
        metaGold: this.metaGold,
        talentLevels: this.talentLevels,
        equipLevels: this.equipLevels,
        metaGems: this.metaGems,
        supplyKeys: this.supplyKeys,
        defensePity: this.defensePity,
        purchasedGemPacks: [...this.purchasedGemPacks],
        adventureExp: this.adventureExp,
        adventureLevel: this.adventureLevel,
        clearedChallenges: [...this.clearedChallenges],
        unlockedEvolutions: [...this.unlockedEvolutions],
        equippedSlots: [...this.equippedSlots],
        metaDna: this.metaDna,
        metaEnergy: this.metaEnergy,
        selectedPlayerId: this.selectedPlayerId,
      }));
    } catch { /* 저장 실패 무시 */ }
  }

  /** 영구 특성 누적 보너스 계산 */
  private _talentBonus(talentId: string): number {
    const t = this.data.talents.find(x => x.talent_id === talentId);
    const lv = this.talentLevels[talentId] ?? 0;
    return t ? t.effect_per_level * lv : 0;
  }

  /** 전투 시작 시 영구 특성 + 장비 + 진화를 인게임 스탯에 반영 */
  private _applyTalents() {
    const activeChar = this.data.players.find(p => p.player_id === this.selectedPlayerId) || this.data.player;
    // hp: 특성 + 장비 + 진화 합산
    this.maxHp = activeChar.max_hp + this._talentBonus('hp') + this._equipBonus('hp') + this._evolutionBonus('hp');
    this.hp = this.maxHp;
    // power: 특성 + 장비 + 진화 데미지 배율
    this.skillSystem.setPassive('globalDmgMult', 1.0 + this._talentBonus('power') + this._equipBonus('power') + this._evolutionBonus('power'));
    // speed: 특성 + 장비 + 진화
    this.speedMult = 1.0 + this._talentBonus('speed') + this._equipBonus('speed') + this._evolutionBonus('speed');
    this.xpMult = 1.0 + this._talentBonus('exp_boost');
    // armor: 진화 피해 감소율 (최대 80%)
    const { meta } = this.data;
    this.armorReduction = Math.min(meta.armorCap, this._evolutionBonus('armor'));
    this.skillSystem.setPassive('cooldownMult', Math.max(meta.cooldownMultMin, 1.0 - this._evolutionBonus('cooldown')));
    this.predatorHealChance = this._evolutionBonus('predator');
    this.magnetRangeBonus = this._evolutionBonus('magnet');
    this.dropSystem.setPickupRadiusMult(this.magnetRangeBonus);
  }

  /* ── 번개 배수 선택 시스템 ── */
  private _energyForMult(mult: number): number {
    return this.data.meta.energyPerMult * mult;
  }

  private _onLobbyCycleMult = () => {
    const affordable = this.multOptions.filter(m => this._energyForMult(m) <= this.metaEnergy);
    if (affordable.length === 0) {
      this.selectedMult = 1;
      this._syncLobbyInfo();
      return;
    }
    const idx = affordable.indexOf(this.selectedMult);
    const next = idx < 0 ? affordable[0]! : affordable[(idx + 1) % affordable.length]!;
    this.selectedMult = next;
    this.eventBridge?.syncTicketMultiplier(this.selectedMult);
    this._syncLobbyInfo();
  };

  /** 로비 배수 토글 확정 후 바로 입장 (모노 GO식) */
  private _startFromLobbyMult() {
    const need = this._energyForMult(this.selectedMult);
    if (this.metaEnergy < need) {
      this._openEnergyShop();
      return;
    }
    this.metaEnergy -= need;
    this.ticketMultiplier = this.selectedMult;
    this._saveMeta();
    this.eventBridge?.syncTicketMultiplier(this.ticketMultiplier);
    this._syncLobbyInfo();
    this._beginBattle();
  }

  /* ── 에너지(번개) 충전 상점 ── */
  private _openEnergyShop() {
    hudStore.setMany({ '/energy/visible': true, '/energy/cur': this.metaEnergy, '/energy/max': this.maxEnergy, '/energy/gems': this.metaGems });
  }

  private _onEnergyBuy = (e: Event) => {
    /* detail: 'gem'(보석100→15) | 'ad'(무료→5) */
    const kind = (e as CustomEvent<string>).detail;
    if (kind === 'gem') {
      if (this.metaGems < 100) return;
      this.metaGems -= 100;
      this.metaEnergy = Math.min(this.maxEnergy + 15, this.metaEnergy + 15);
    } else {
      this.metaEnergy = Math.min(this.maxEnergy + 5, this.metaEnergy + 5);
    }
    this._saveMeta();
    hudStore.setMany({ '/energy/cur': this.metaEnergy, '/energy/gems': this.metaGems });
    this._syncLobbyInfo();
  };

  private _onEnergyClose = () => {
    hudStore.set('/energy/visible', false);
  };

  private _onEnergyOpen = () => {
    this._openEnergyShop();
  };

  /* 실제 전투 시작 (배수 확정 후) */
  private _beginBattle() {
    this.eventBridge?.syncTicketMultiplier(this.ticketMultiplier);
    this._resetSpawnSchedule();
    /* 기본 공격 스킬 장착 (첫 판 진입 시) */
    this._equipStartSkill();
    /* 영구 특성 → 인게임 스탯 반영 (HP/데미지/이속/경험치) */
    this._applyTalents();
    hudStore.set('/lobby/visible', false);
    hudStore.setMany({
      '/scene/transitionText': `STAGE ${this.currentStage}`,
      '/scene/transitionVisible': true,
      '/hud/stage': this.currentStage,
      '/hud/hpPct': 100,
    });
    this._setGameState('PAUSED');
    if (this.transitionTimer !== null) window.clearTimeout(this.transitionTimer);
    this.transitionTimer = window.setTimeout(() => {
      hudStore.set('/scene/transitionVisible', false);
      this._spawnInitialXp();
      this._setGameState('PLAYING');
      this.transitionTimer = null;
    }, this._ct('scene_transition_ms', 3400));
  }

  /* ── 패시브 효과 적용 ── */
  private _applyPassive(skillId: string, level: number) {
    const levels = this.data.skillLevels.get(skillId);
    const lv     = levels?.find(l => l.level === level);
    if (!lv) return;
    switch (skillId) {
      case 'ninjaScroll':
        /* 영구 특성(exp_boost) 보너스와 합산 */
        this.xpMult = 1.0 + this._talentBonus('exp_boost') + lv.passive_bonus_value; break;
      case 'elasticShoes':
        this.speedMult = 1.0 + this._talentBonus('speed') + this._equipBonus('speed') + lv.passive_bonus_value; break;
      case 'highFuel':
        /* 폭발/화염 반경 +passive_bonus_value px → 배율로 변환 */
        this.skillSystem.setPassive('areaMult', 1.0 + lv.passive_bonus_value / 40); break;
      case 'exoskeleton':
        /* 투사체 수명 +passive_bonus_value 배율 */
        this.skillSystem.setPassive('lifeMult', 1.0 + lv.passive_bonus_value);
        this.player.setExoskeletonLevel(level);
        break;
      case 'energyCube':
        /* 쿨타임 감소 (passive_bonus_value = 감소율) */
        this.skillSystem.setPassive('cooldownMult', Math.max(0.2, 1.0 - lv.passive_bonus_value));
        break;
      case 'ammoBooster':
        /* 탄약 추진기 — 재장전 속도 증가 (passive_bonus_value = 감소율) */
        this.skillSystem.setPassive('reloadSpeedMult', Math.max(0.2, 1.0 - lv.passive_bonus_value));
        break;
      case 'fitnessGuide': {
        /* 최대 HP 증가 (절대값). 현재 HP도 비율 유지하며 증가 */
        const ratio = this.maxHp > 0 ? this.hp / this.maxHp : 1;
        const activeChar = this.data.players.find(p => p.player_id === this.selectedPlayerId) || this.data.player;
        this.maxHp = activeChar.max_hp + this._talentBonus('hp') + this._equipBonus('hp') + lv.passive_bonus_value;
        this.hp = Math.round(this.maxHp * ratio);
        hudStore.set('/hud/hpPct', (this.hp / this.maxHp) * 100);
        break;
      }
    }
  }

  /* ── 리셋 ── */
  private _reset(toLobby = false) {
    this.px = 0; this.py = 0;
    this.elapsedSec = 0;
    this.stageElapsedSec = 0;
    this.currentStage = 1;
    this.hp = this.maxHp;
    this.xp = 0; this.level = 1;
    this.totalXpEarned = 0;
    this.xpMult = 1.0; this.speedMult = 1.0;
    this.player.setExoskeletonLevel(0);
    this.gold = 0; this.killCount = 0;
    this.invincTimer = 0;
    this.bossSpawnInvulnTimer = 0;
    this.debuffTimer = 0;
    this.spawnTimer = 0;
    this.bossSpawned = false;
    this.bossWarningShown = false;
    this.spawnedMiniBossIds.clear();
    this.triggeredRushIds.clear();
    this.triggeredFormationIds.clear();
    this._resetSpawnSchedule();
    this.arenaSystem.deactivate();
    this.nexusEnemy = null;
    this.nexusMissileTimer = 0;
    this.equippedSkills.clear();
    this.evolvedSkills.clear();
    this.bossArrow.visible = false;
    this.pendingStageAdvance = false;
    if (this.bossDeathTimer !== null) {
      window.clearTimeout(this.bossDeathTimer);
      this.bossDeathTimer = null;
    }
    this.bossDeathPending = false;

    const activeChar = this.data.players.find(p => p.player_id === this.selectedPlayerId) || this.data.player;
    this.maxHp = activeChar.max_hp;
    this.hp = this.maxHp;

    this.player.dispose(this.renderer.scene);
    this.player = new PlayerMesh(activeChar, this.renderer.scene, this.data.playerVisual);
    this.player.setPosition(0, 0);
    this.player.setHp(this.hp);
    this.player.setWeaponEquipped(this._hasWeaponEquipped());
    this.player.setWeaponType(this._equippedWeaponKind());

    this.enemySystem.clear();
    this.skillSystem.dispose();
    this.dropSystem.clear();
    this.vfxSystem.dispose();
    this.bossCtrl.dispose();

    if (this.ninjaScrollMesh) {
      this.renderer.scene.remove(this.ninjaScrollMesh);
      this.ninjaScrollMesh.geometry.dispose();
      if (Array.isArray(this.ninjaScrollMesh.material)) {
        this.ninjaScrollMesh.material.forEach(m => m.dispose());
      } else {
        this.ninjaScrollMesh.material.dispose();
      }
      this.ninjaScrollMesh = null;
    }

    this._removeMagnetRing();

    /* SkillSystem / DropSystem / VfxSystem 재생성 (상태 초기화) */
    this.skillSystem = new SkillSystem(this.renderer.scene, this.data);
    this.dropSystem  = new DropSystem(this.renderer.scene, this.data);
    this.vfxSystem   = new VfxSystem(this.renderer.scene, this.data.vfx);

    /* 시작 스킬 재장착 */
    this._equipStartSkill();

    hudStore.setMany({
      '/hud/timer':            '00:00',
      '/hud/stage':            1,
      '/hud/hpPct':            100,
      '/hud/killCount':        0,
      '/hud/gold':             0,
      '/hud/expPct':           0,
      '/hud/level':            1,
      '/hud/bossVisible':      false,
      '/hud/bossWarningVisible': false,      '/bossIntro/phase': 0, '/bossDeath/phase': 0,      '/rushWave/visible': false,
      '/hud/passiveSkillSlots':  [],
      '/modal/visible':        false,
      '/result/visible':       false,
      '/result/totalXpEarned': 0,
      '/lobby/visible':        toLobby,
      '/scene/transitionVisible': hudStore.get('/scene/transitionVisible') || false,
      '/scene/transitionText': hudStore.get('/scene/transitionText') || 'STAGE 1',
      '/vfx/flashOpacity':     0,
      '/vfx/flashColor':       '#ffffff',
    });
    this._syncActiveSkillSlots();
    if (!toLobby) this._spawnInitialXp();
    if (toLobby) { this._syncLobbyInfo(); this._showPendingAdvUp(); }
    this._setGameState(toLobby ? 'PAUSED' : 'PLAYING');
  }

  /** 시작 바닥 XP — Lv1→3 필요량(스킬 선택 2회)을 gem 조합으로 맞춤 */
  private _buildInitialXpGemPlan(): Array<'small' | 'medium' | 'large'> {
    const dropVal = (id: string) =>
      this.data.drops.find(d => d.drop_id === id)?.effect_value ?? 0;
    const smallV = dropVal('xp_small') || 1;
    const medV = dropVal('xp_medium') || 5;
    const largeV = dropVal('xp_large') || 22;

    const budget =
      this._expRequiredForLevel(1) + this._expRequiredForLevel(2);
    const stageCfg = this.data.stages[this.currentStage - 1];
    const minSmall = stageCfg?.initial_xp_small ?? 8;

    const plan: Array<'small' | 'medium' | 'large'> = [];
    let remaining = budget;

    const smallCount = Math.min(minSmall, Math.floor(remaining / smallV));
    for (let i = 0; i < smallCount; i++) plan.push('small');
    remaining -= smallCount * smallV;

    while (remaining >= largeV) {
      plan.push('large');
      remaining -= largeV;
    }
    while (remaining >= medV) {
      plan.push('medium');
      remaining -= medV;
    }
    for (let i = 0; i < remaining; i += smallV) plan.push('small');

    return plan;
  }

  /* ── 게임 시작 시 바닥 XP 산포 — 수집만으로 스킬 2회(Lv3) ── */
  private _spawnInitialXp() {
    const plan = this._buildInitialXpGemPlan();
    for (let i = 0; i < plan.length; i++) {
      const angle = Math.random() * Math.PI * 2;
      const dist = 40 + Math.random() * 100;
      const x = Math.cos(angle) * dist;
      const y = Math.sin(angle) * dist;
      const dropType = plan[i];
      this.dropSystem.spawnXp(x, y, dropType);
    }
  }

  dispose() {
    if (this.transitionTimer !== null) {
      window.clearTimeout(this.transitionTimer);
      this.transitionTimer = null;
    }
    if (this.bossDeathTimer !== null) {
      window.clearTimeout(this.bossDeathTimer);
      this.bossDeathTimer = null;
    }
    this.bossDeathPending = false;
    window.removeEventListener('prism:action', this._onAction);
    window.removeEventListener('prism:skillSelect', this._onSkillSelect);
    window.removeEventListener('luckyTrain:select', this._onLuckyTrainSelect);
    window.removeEventListener('luckyTrain:buy', this._onLuckyTrainBuy);
    window.removeEventListener('luckyTrain:close', this._onLuckyTrainClose);
    window.removeEventListener('lobby:cycleMult', this._onLobbyCycleMult);
    window.removeEventListener('energy:buy', this._onEnergyBuy);
    window.removeEventListener('energy:close', this._onEnergyClose);
    window.removeEventListener('energy:open', this._onEnergyOpen);
    window.removeEventListener('lobby:selectStage', this._onLobbySelectStage);
    window.removeEventListener('lobby:openTalent', this._onOpenTalent);
    window.removeEventListener('talent:upgrade', this._onTalentUpgrade);
    window.removeEventListener('talent:close', this._onTalentClose);
    window.removeEventListener('lobby:openEquip', this._onOpenEquip);
    window.removeEventListener('equip:upgrade', this._onEquipUpgrade);
    window.removeEventListener('equip:toggle', this._onEquipToggle);
    window.removeEventListener('equip:equip', this._onEquipEquip);
    window.removeEventListener('equip:unequip', this._onEquipUnequip);
    window.removeEventListener('equip:close', this._onEquipClose);
    window.removeEventListener('advUp:close', this._onAdvUpClose);
    window.removeEventListener('lobby:toast', this._onLobbyToast);
    window.removeEventListener('lobby:openChallenge', this._onOpenChallenge);
    window.removeEventListener('challenge:start', this._onChallengeStart);
    window.removeEventListener('challenge:close', this._onChallengeClose);
    window.removeEventListener('lobby:openEvolution', this._onOpenEvolution);
    window.removeEventListener('evolution:unlock', this._onEvolutionUnlock);
    window.removeEventListener('evolution:close', this._onEvolutionClose);
    window.removeEventListener('lobby:openShop', this._onOpenShop);
    window.removeEventListener('shop:close', this._onShopClose);
    window.removeEventListener('shop:buyGem', this._onShopBuyGem);
    window.removeEventListener('shop:buyGold', this._onShopBuyGold);
    window.removeEventListener('shop:openBox', this._onShopOpenBox);
    window.removeEventListener('shop:resetCash', this._onShopResetCash);
    window.removeEventListener('prism:quickSkill', this._onQuickSkill);
    this.input.dispose();
    this.player.dispose(this.renderer.scene);
    this.enemySystem.clear();
    this.skillSystem.dispose();
    this.dropSystem.clear();
    this.vfxSystem.dispose();
    if (this.bossCtrl.alive) this.bossCtrl.dispose();

    // bossArrow 리소스 해제
    this.renderer.scene.remove(this.bossArrow);
    this.bossArrow.geometry.dispose();
    if (Array.isArray(this.bossArrow.material)) {
      this.bossArrow.material.forEach(m => m.dispose());
    } else {
      this.bossArrow.material.dispose();
    }

    // ninjaScrollMesh 리소스 해제
    if (this.ninjaScrollMesh) {
      this.renderer.scene.remove(this.ninjaScrollMesh);
      this.ninjaScrollMesh.geometry.dispose();
      if (Array.isArray(this.ninjaScrollMesh.material)) {
        this.ninjaScrollMesh.material.forEach(m => m.dispose());
      } else {
        this.ninjaScrollMesh.material.dispose();
      }
      this.ninjaScrollMesh = null;
    }
    this._removeMagnetRing();
  }

  private _spawnMagnetRing() {
    this._removeMagnetRing();

    const geo = new THREE.RingGeometry(22, 24, 32);
    const col = new THREE.Color('#9900FF');
    const mat = new THREE.MeshBasicMaterial({
      color: col,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 1.0,
      blending: THREE.AdditiveBlending
    });

    this.magnetRingMesh = new THREE.Mesh(geo, mat);
    this.magnetRingMesh.position.set(this.px, this.py, 1);
    this.renderer.scene.add(this.magnetRingMesh);
    this.magnetRingTimer = 0.35;
  }

  private _removeMagnetRing() {
    if (this.magnetRingMesh) {
      this.renderer.scene.remove(this.magnetRingMesh);
      this.magnetRingMesh.geometry.dispose();
      if (Array.isArray(this.magnetRingMesh.material)) {
        this.magnetRingMesh.material.forEach(m => m.dispose());
      } else {
        this.magnetRingMesh.material.dispose();
      }
      this.magnetRingMesh = null;
    }
  }

  private _updateMagnetRing(dt: number) {
    if (!this.magnetRingMesh) return;

    this.magnetRingTimer -= dt;
    if (this.magnetRingTimer <= 0) {
      this._removeMagnetRing();
      return;
    }

    const progress = (0.35 - this.magnetRingTimer) / 0.35;
    const scaleVal = 1 + progress * 11;
    this.magnetRingMesh.scale.set(scaleVal, scaleVal, 1);
    this.magnetRingMesh.position.set(this.px, this.py, 1);

    const mat = this.magnetRingMesh.material as THREE.MeshBasicMaterial;
    mat.opacity = 1 - progress;
  }

  private _onOpenAvatar = () => {
    this._syncAvatarPopup();
    hudStore.set('/avatar/visible', true);
  };

  private _onAvatarClose = () => {
    hudStore.set('/avatar/visible', false);
  };

  private _onAvatarSelect = (e: Event) => {
    const id = (e as CustomEvent<string>).detail;
    const activeChar = this.data.players.find(p => p.player_id === id);
    if (!activeChar) return;

    this.selectedPlayerId = id;
    this._saveMeta();
    this._syncAvatarPopup();
    this._syncLobbyInfo();

    // 3D 메쉬 실시간 교체 반영
    if (this.player) {
      const px = this.px;
      const py = this.py;
      const hp = this.hp;
      this.player.dispose(this.renderer.scene);
      this.player = new PlayerMesh(activeChar, this.renderer.scene, this.data.playerVisual);
      this.player.setPosition(px, py);
      this.player.setHp(hp);
      this.player.setWeaponEquipped(this._hasWeaponEquipped());
    this.player.setWeaponType(this._equippedWeaponKind());
    }
  };

  private _syncAvatarPopup() {
    const list = this.data.players.slice(0, this.data.meta.avatarProfileLimit).map(p => ({
      player_id: p.player_id,
      max_hp: p.max_hp,
      base_speed: p.base_speed,
      color_hex: p.color_hex,
      unlocked: true, // 오빠 요구사항: 해금은 다 풀어줘
      selected: p.player_id === this.selectedPlayerId,
    }));
    hudStore.setMany({
      '/avatar/players': list,
      '/avatar/selectedId': this.selectedPlayerId,
    });
  }
}
