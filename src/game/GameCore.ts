import * as THREE from 'three';
import type { GameData, GameState, EnemyId, SkillConfig } from './data';
import type { Renderer3D } from '../three/Renderer3D';
import { PlayerMesh } from '../three/PlayerMesh';
import { InputController } from './InputController';
import { EnemySystem } from './EnemySystem';
import { SkillSystem } from './SkillSystem';
import { DropSystem } from './DropSystem';
import { BossController } from './BossController';
import { VfxSystem } from './VfxSystem';
import { hudStore, type SkillCardData } from './hudExternalStore';

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

  /* 스킬 장착 현황: skillId → level */
  private equippedSkills: Map<string, number> = new Map();

  /* 타이머 */
  private elapsedSec = 0;
  private stageElapsedSec = 0;
  private currentStage = 1;
  private readonly MAX_STAGES = 10;
  private gameState: GameState = 'PAUSED';

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

  /* 아이템 랜덤 드롭 확률 */
  private readonly ITEM_DROP_CHANCE = 0.03;

  /* 진화 완료된 스킬 ID 세트 */
  private evolvedSkills: Set<string> = new Set();
  private transitionTimer: number | null = null;
  private bossDeathTimer: number | null = null;
  private bossDeathPending = false;
  private bossSpawnInvulnTimer = 0;
  private pendingStageAdvance = false;

  constructor(data: GameData, renderer: Renderer3D, container: HTMLElement) {
    this.data = data;
    this.renderer = renderer;
    this.hp = data.player.max_hp;
    this.mapHalfW = data.map.map_width  / 2 - data.player.radius;
    this.mapHalfH = data.map.map_height / 2 - data.player.radius;

    /* 플레이어 메쉬 */
    this.player = new PlayerMesh(data.player, renderer.scene);
    this.player.setPosition(0, 0);
    this.player.setHp(this.hp);

    /* 입력 컨트롤러 */
    this.input = new InputController(container, data.control);

    /* 서브시스템 초기화 */
    this.enemySystem = new EnemySystem(renderer.scene, data);
    this.skillSystem = new SkillSystem(renderer.scene, data);
    this.dropSystem  = new DropSystem(renderer.scene, data);
    this.bossCtrl    = new BossController(renderer.scene, data.boss);
    this.vfxSystem   = new VfxSystem(renderer.scene, data.vfx);

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

    /* 시작 스킬 장착 (kunai Lv1) */
    this._equipStartSkill();

    /* 게임 루프 연결 */
    renderer.setOnFrame(dt => this._tick(dt));

    /* 이벤트 바인딩 */
    window.addEventListener('prism:action', this._onAction);
    window.addEventListener('prism:skillSelect', this._onSkillSelect);

    hudStore.set('/lobby/visible', true);
    this._setGameState('PAUSED');
  }

  /** 게임 시작 / 리셋 시 기본 스킬 1개 장착 */
  private _equipStartSkill() {
    this.equippedSkills.set('kunai', 1);
    this.skillSystem.equipSkill('kunai', 1);
    this._syncActiveSkillSlots();
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

  /* ════════════════════════════════════════
     메인 틱
  ════════════════════════════════════════ */
  private _tick(dt: number) {
    if (this.gameState !== 'PLAYING') return;

    this._updatePlayer(dt);
    this._updateTimer(dt);
    this._updateWaveSpawn(dt);
    this._updateSkills(dt);   // 스킬 → hitResults 채움
    this._updateEnemies(dt);  // 적 AI + hitResults 처리
    this._updateBoss(dt);
    this._updateBossArrow();
    this._updateDrops(dt);
    this._updateNinjaScrollVfx(dt);
    this._updateMagnetRing(dt);
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
      finalSpeedMult *= 0.6; // 디버프 중 속도 40% 저하
      this.player.setDebuffState(true);
    } else {
      this.player.setDebuffState(false);
    }

    const speed = cfg.base_speed * finalSpeedMult;
    const vx = this.input.vx;
    const vy = this.input.vy;

    if (Math.abs(vx) > 0.01 || Math.abs(vy) > 0.01) {
      this.px = Math.max(-this.mapHalfW, Math.min(this.mapHalfW, this.px + vx * speed * 60 * dt));
      this.py = Math.max(-this.mapHalfH, Math.min(this.mapHalfH, this.py + vy * speed * 60 * dt));
      this.player.setPosition(this.px, this.py);
      this.player.setDirection(vx, vy);
    }

    if (this.invincTimer > 0) this.invincTimer -= dt;
  }

  /* ── 타이머 HUD ── */
  private _updateTimer(dt: number) {
    this.elapsedSec += dt;
    this.stageElapsedSec += dt;
    const mins = Math.floor(this.stageElapsedSec / 60);
    const secs = Math.floor(this.stageElapsedSec % 60);
    hudStore.set('/hud/timer', `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`);
  }

  /* ── 웨이브 스폰 ── */
  private _updateWaveSpawn(dt: number) {
    /* 보스 사망 연출 중 스폰 억제 */
    if (this.bossDeathPending) return;

    /* 보스 경고 (스폰 3초 전 — 팝업이 사라질 때 보스 등장) */
    const bossTime = this.data.boss.spawn_time_seconds;
    if (!this.bossWarningShown && this.stageElapsedSec >= bossTime - 3) {
      this.bossWarningShown = true;
      hudStore.set('/hud/bossWarningVisible', true);
      setTimeout(() => hudStore.set('/hud/bossWarningVisible', false), 3000);
    }

    /* 보스 스폰 */
    if (!this.bossSpawned && this.stageElapsedSec >= bossTime) {
      this._spawnBoss();
    }

    /* 현재 웨이브 — 이 스테이지 전용 웨이브만 필터링 후 가장 최근 시작한 것 */
    const wave = this.data.waves
      .filter(w => w.stage === this.currentStage)
      .slice()
      .reverse()
      .find(w => this.stageElapsedSec >= w.start_time_seconds);
    if (!wave) return;

    /* 최대 적 수 초과 시 스킵 — stage_config.csv 참조 */
    const stageCfg = this.data.stages[this.currentStage - 1];
    const stageMaxEnemies = Math.floor(wave.max_enemies * (stageCfg?.max_enemies_scale ?? 1));
    const minFrames = stageCfg?.spawn_interval_min_frames ?? 6;
    const spawnInterval = Math.max(minFrames, Math.floor(wave.spawn_interval_frames * (stageCfg?.spawn_interval_scale ?? 1))) / 60;

    if (this.enemySystem.liveCount >= stageMaxEnemies) return;

    this.spawnTimer -= dt;
    if (this.spawnTimer > 0) return;
    this.spawnTimer = spawnInterval;

    const enemyId = this._pickEnemyId(wave.rate_basic, wave.rate_dog, wave.rate_bloater, wave.rate_spitter);
    const { x, y } = this._randomSpawnPos();
    /* 스테이지 적 스탯 배율 적용 */
    const hpMult    = stageCfg?.enemy_hp_mult    ?? 1.0;
    const speedMult = stageCfg?.enemy_speed_mult  ?? 1.0;
    const dmgMult   = stageCfg?.enemy_dmg_mult    ?? 1.0;
    this.enemySystem.spawn(enemyId, x, y, hpMult, speedMult, dmgMult);
  }

  private _pickEnemyId(rBasic: number, rDog: number, rBloater: number, _rSpitter: number): EnemyId {
    const r = Math.random();
    let acc = 0;
    if ((acc += rBasic)   > r) return 'basic';
    if ((acc += rDog)     > r) return 'dog';
    if ((acc += rBloater) > r) return 'bloater';
    return 'spitter';
  }

  private _randomSpawnPos(): { x: number; y: number } {
    const { spawn_radius_min: rMin, spawn_radius_max: rMax, map_width: mw, map_height: mh } = this.data.map;
    const angle = Math.random() * Math.PI * 2;
    const dist  = rMin + Math.random() * (rMax - rMin);
    const x = Math.max(-mw / 2 + 20, Math.min(mw / 2 - 20, this.px + Math.cos(angle) * dist));
    const y = Math.max(-mh / 2 + 20, Math.min(mh / 2 - 20, this.py + Math.sin(angle) * dist));
    return { x, y };
  }

  /* ── 스킬 자동 발사 (hitResults 채움) ── */
  private _updateSkills(dt: number) {
    this.skillSystem.tick(
      dt,
      this.px, this.py,
      this.input.vx, this.input.vy,
      this.enemySystem.enemies,
      { alive: this.bossCtrl.alive, x: this.bossCtrl.x, y: this.bossCtrl.y, radius: this.data.boss.radius },
    );
  }

  /* ── 적 AI + 충돌 + 스킬 피격 처리 ── */
  private _updateEnemies(dt: number) {
    const contactDmg = this.enemySystem.tick(dt, this.px, this.py, this.data.player.radius);
    if (contactDmg > 0) this._takeDamage(contactDmg);

    for (const [enemyId, dmgVal] of this.skillSystem.hitResults) {
      const killed = this.enemySystem.hit(enemyId, dmgVal);
      if (killed) this._onEnemyDeath(enemyId);
    }
  }

  /* ── 보스 틱 ── */
  private _updateBoss(dt: number) {
    if (!this.bossCtrl.alive) return;

    const contactDmg = this.bossCtrl.tick(dt, this.px, this.py, this.data.player.radius);
    if (contactDmg > 0) this._takeDamage(contactDmg);

    if (this.bossSpawnInvulnTimer > 0) {
      this.bossSpawnInvulnTimer -= dt;
      hudStore.set('/hud/bossHpPct', 100);
    } else {
      /* 스킬 → 보스 충돌 (SkillSystem.checkBossHit 사용) */
      const skillDmg = this.skillSystem.checkBossHit(
        this.bossCtrl.x, this.bossCtrl.y, this.data.boss.radius,
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
    const br = this.data.boss.radius;

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
      this.vfxSystem.play('boss_spawn', this.px, this.py);
      const BOMB_DMG = 10;

      const aliveEnemies = this.enemySystem.enemies.filter(e => !e.dead);
      for (const e of aliveEnemies) {
        if (!isOnScreen(e.x, e.y, e.cfg.radius)) continue;
        const killed = this.enemySystem.hit(e.id, BOMB_DMG);
        if (killed) this._onEnemyDeath(e.id);
      }

      /* 보스: 데미지만, 폭탄으로 즉사 없음 */
      if (this.bossCtrl.alive && this.bossSpawnInvulnTimer <= 0 && isOnScreen(this.bossCtrl.x, this.bossCtrl.y, this.data.boss.radius)) {
        const killed = this.bossCtrl.hit(BOMB_DMG);
        if (killed) this._onBossDeath();
      }
    }
  }

  /* ── 데미지 수신 ── */
  private _takeDamage(dmg: number) {
    if (this.invincTimer > 0) return;
    this.hp = Math.max(0, this.hp - dmg);
    this.player.setHp(this.hp);
    hudStore.set('/hud/hpPct', (this.hp / this.data.player.max_hp) * 100);

    /* 피격 VFX */
    this.vfxSystem.play('player_hit', this.px, this.py);

    /* 피격 시 디버프 2초 동안 작동 */
    this.debuffTimer = 2.0;

    if (this.hp <= 0) {
      this._gameOver();
      return;
    }

    this.invincTimer = this.data.player.invincible_frames / 60;
    this.player.startInvincible(this.data.player.invincible_frames);
  }

  private _heal(amount: number) {
    this.hp = Math.min(this.data.player.max_hp, this.hp + amount);
    this.player.setHp(this.hp);
    hudStore.set('/hud/hpPct', (this.hp / this.data.player.max_hp) * 100);
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

    /* 스테이지 XP 배율 적용 — stage_config.csv xp_mult */
    const stageXpMult = this.data.stages[this.currentStage - 1]?.xp_mult ?? 1.0;
    this.dropSystem.spawnXp(dead.x, dead.y, dead.cfg.exp_drop_type, stageXpMult);

    if (Math.random() < this.ITEM_DROP_CHANCE) {
      this.dropSystem.spawnRandomItem(dead.x, dead.y);
    }
  }

  /* ── 보스 사망 ── */
  private _onBossDeath() {
    /* 보스 위치 저장 후 메쉬/패턴 정리 */
    const bossX = this.bossCtrl.x;
    const bossY = this.bossCtrl.y;
    this.bossCtrl.dispose();

    hudStore.setMany({
      '/hud/bossVisible': false,
      '/hud/bossWarningVisible': false,
    });

    this.pendingStageAdvance = this.currentStage < this.MAX_STAGES;
    this.bossDeathPending = true;
    this.invincTimer = 4;  // 연출 동안 플레이어 무적

    /* 보스 사망 VFX — 큰 폭발 연출 2연타 */
    this.vfxSystem.play('boss_spawn', bossX, bossY);
    window.setTimeout(() => this.vfxSystem.play('boss_spawn', bossX, bossY), 400);

    /* 2.5초 후 결과창 표시 */
    this.bossDeathTimer = window.setTimeout(() => {
      this.bossDeathPending = false;
      this.bossDeathTimer = null;
      this._stageClear();
    }, 2500);
  }

  /* ── 보스 스폰 ── */
  private _spawnBoss() {
    this.bossSpawned = true;

    /* 보스 등장 VFX */
    this.vfxSystem.play('boss_spawn', this.px, this.py);

    this.renderer.startBossAmbient(
      this.data.map.boss_ambient_color,
      this.data.map.boss_ambient_transition_seconds,
    );

    /* 보스 체력 — stage_config.csv boss_hp_mult 참조 */
    const stageCfgBoss = this.data.stages[this.currentStage - 1];
    this.bossCtrl.maxHp = Math.floor(this.data.boss.hp * (stageCfgBoss?.boss_hp_mult ?? 3.0));
    this.bossCtrl.hp = this.bossCtrl.maxHp;

    const spawnYOffset = Math.min(this.data.boss.spawn_offset_y, 180);
    const spawnY = this.py + spawnYOffset;
    this.bossCtrl.start(this.px, spawnY);
    this.bossSpawnInvulnTimer = 1.2;
    // 요청사항: 보스 연출씬 없이 즉시 전투 지속
    this._setGameState('PLAYING');

    hudStore.setMany({
      '/hud/bossVisible': true,
      '/hud/bossName':    this.data.boss.boss_name,
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
    this.bossSpawnInvulnTimer = 0;

    /* HP / XP / 레벨 초기화 — 스테이지 새로 시작 */
    this.hp = this.data.player.max_hp;
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
      '/hud/bossWarningVisible': false,
      '/modal/visible':        false,
      '/result/visible':       false,
      '/scene/transitionText': `STAGE ${this.currentStage}`,
      '/scene/transitionVisible': false,
      '/lobby/visible':        true,
      '/vfx/flashOpacity':     0,
      '/vfx/flashColor':       '#ffffff',
    });

    this._setGameState('PAUSED');
  }

  /* ── XP / 레벨업 ── */
  private _addXp(amount: number) {
    const gained = amount * this.xpMult;
    this.xp += gained;
    this.totalXpEarned += gained;

    /* 현재 레벨 요구 XP */
    const levelCfg = this.data.levels[this.level - 1];
    if (!levelCfg) return;

    if (this.xp >= levelCfg.exp_required) {
      this.xp -= levelCfg.exp_required;
      this.level = Math.min(this.level + 1, this.data.levels.length);
      hudStore.set('/hud/level', this.level);
      this._onLevelUp();
    } else {
      hudStore.set('/hud/expPct', (this.xp / levelCfg.exp_required) * 100);
    }
  }

  /* ── 자석 XP — 한 레벨 분량만 인정 ── */
  private _addXpMagnet(amount: number) {
    const levelCfg = this.data.levels[this.level - 1];
    if (!levelCfg) return;
    /* 이번 레벨에서 다음 레벨까지 남은 XP까지만 적용, 초과분 버림 */
    const xpToNextLevel = Math.max(0, levelCfg.exp_required - this.xp);
    const toAdd = Math.min(amount * this.xpMult, xpToNextLevel);
    if (toAdd <= 0) return;
    this.xp += toAdd;
    this.totalXpEarned += toAdd;
    if (this.xp >= levelCfg.exp_required) {
      this.xp -= levelCfg.exp_required;
      this.level = Math.min(this.level + 1, this.data.levels.length);
      hudStore.set('/hud/level', this.level);
      this._onLevelUp();
    } else {
      hudStore.set('/hud/expPct', (this.xp / levelCfg.exp_required) * 100);
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
        evolutionCards.push({
          skill_id:      evo.result_skill_id,
          skill_name:    evo.result_skill_name,
          icon:          '⚡',
          description:   evo.result_description,
          current_level: activeLv,
          max_level:     activeCfg.max_level,
          is_new:        false,
          is_evolution:  true,
        });
      }
    }

    /* ── 일반 스킬 후보 ── */
    const candidates: SkillConfig[] = [];
    for (const cfg of this.data.skills.values()) {
      const curLv = this.equippedSkills.get(cfg.skill_id) ?? 0;
      /* 이미 진화로 교체된 스킬은 제외 */
      const wasEvolved = [...this.data.evolutions].some(e => e.active_skill_id === cfg.skill_id && this.evolvedSkills.has(e.result_skill_id));
      if (!wasEvolved && curLv < cfg.max_level) candidates.push(cfg);
    }

    /* 진화 카드가 있으면 최대 1장만 보여주고 나머지 슬롯 일반 스킬로 채움 */
    const evoSlot = evolutionCards.length > 0
      ? [evolutionCards[Math.floor(Math.random() * evolutionCards.length)]]
      : [];
    const remainSlots = 3 - evoSlot.length;

    const shuffled = candidates.sort(() => Math.random() - 0.5).slice(0, remainSlots);
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

    /* 진화 카드를 항상 첫 번째로 배치 */
    return [...evoSlot, ...normalCards];
  }

  /* ── 게임오버 ── */
  private _gameOver() {
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
    });
  }

  /* ── 스테이지 클리어 ── */
  private _stageClear() {
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
      hudStore.set('/lobby/visible', false);
      hudStore.setMany({
        '/scene/transitionText': `STAGE ${this.currentStage}`,
        '/scene/transitionVisible': true,
        '/hud/stage': this.currentStage,
      });
      this._setGameState('PAUSED');
      if (this.transitionTimer !== null) window.clearTimeout(this.transitionTimer);
      this.transitionTimer = window.setTimeout(() => {
        hudStore.set('/scene/transitionVisible', false);
        this._spawnInitialXp();
        this._setGameState('PLAYING');
        this.transitionTimer = null;
      }, 850);
      return;
    }
    if (action === 'TOGGLE_PAUSE') {
      if (this.gameState === 'PLAYING') {
        this._setGameState('PAUSED');
      } else if (this.gameState === 'PAUSED') {
        this._setGameState('PLAYING');
      }
    }
    if (action === 'RETRY') {
      this._reset();
    }
    if (action === 'EXIT') {
      if (this.pendingStageAdvance) {
        this.pendingStageAdvance = false;
        this._advanceToNextStage();
        return;
      }
      this._reset(true);
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

  /* ── 패시브 효과 적용 ── */
  private _applyPassive(skillId: string, level: number) {
    const levels = this.data.skillLevels.get(skillId);
    const lv     = levels?.find(l => l.level === level);
    if (!lv) return;
    switch (skillId) {
      case 'ninjaScroll':
        this.xpMult = 1.0 + lv.passive_bonus_value; break;
      case 'elasticShoes':
        this.speedMult = 1.0 + lv.passive_bonus_value; break;
      case 'highFuel':
        /* 폭발/화염 반경 +passive_bonus_value px → 배율로 변환 */
        this.skillSystem.setPassive('areaMult', 1.0 + lv.passive_bonus_value / 40); break;
      case 'exoskeleton':
        /* 투사체 수명 +passive_bonus_value 배율 */
        this.skillSystem.setPassive('lifeMult', 1.0 + lv.passive_bonus_value);
        this.player.setExoskeletonLevel(level);
        break;
    }
  }

  /* ── 리셋 ── */
  private _reset(toLobby = false) {
    this.px = 0; this.py = 0;
    this.elapsedSec = 0;
    this.stageElapsedSec = 0;
    this.currentStage = 1;
    this.hp = this.data.player.max_hp;
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
    this.equippedSkills.clear();
    this.evolvedSkills.clear();
    this.bossArrow.visible = false;
    this.pendingStageAdvance = false;
    if (this.bossDeathTimer !== null) {
      window.clearTimeout(this.bossDeathTimer);
      this.bossDeathTimer = null;
    }
    this.bossDeathPending = false;

    this.player.setPosition(0, 0);
    this.player.setHp(this.hp);

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
      '/hud/bossWarningVisible': false,
      '/hud/passiveSkillSlots':  [],
      '/modal/visible':        false,
      '/result/visible':       false,
      '/result/totalXpEarned': 0,
      '/lobby/visible':        toLobby,
      '/scene/transitionVisible': false,
      '/scene/transitionText': 'STAGE 1',
      '/vfx/flashOpacity':     0,
      '/vfx/flashColor':       '#ffffff',
    });
    this._syncActiveSkillSlots();
    if (!toLobby) this._spawnInitialXp();
    this._setGameState(toLobby ? 'PAUSED' : 'PLAYING');
  }

  /* ── 게임 시작 시 바닥 XP 산포 (초반 밸런스용) ── */
  private _spawnInitialXp() {
    /* 스테이지별 산포량 — stage_config.csv initial_xp_small 참조
     * XP 배율은 적용 안 함 (산포는 항상 기본값 — 2레벨업 보장 목적)  */
    const stageCfg = this.data.stages[this.currentStage - 1];
    const count = stageCfg?.initial_xp_small ?? 8;
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const dist  = 40 + Math.random() * 100;  // 반경 40~140 (더 가깝게)
      this.dropSystem.spawnXp(Math.cos(angle) * dist, Math.sin(angle) * dist, 'small');
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
}
