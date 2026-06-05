/**
 * SkillSystem.ts — 스킬 장착 + 자동 발사 + 투사체 이동 + 충돌
 *
 * 지원 스킬:
 *   kunai     — 가장 가까운 적에게 유도 투사체
 *   boomerang — 이동 방향으로 발사, 관통 왕복
 *   molotov   — 랜덤 위치 화염 장판
 *   guardian  — 플레이어 주위 공전 블레이드
 *   rocket    — 최근접 적에게 폭발 투사체
 *
 * 패시브 효과 (GameCore에서 setPassive로 주입):
 *   highFuel    → areaMult (폭발/화염 반경 배율)
 *   exoskeleton → lifeMult (투사체 수명 배율)
 */
import * as THREE from 'three';
import type { GameData, SkillConfig, SkillLevelConfig } from './data';
import type { EnemyInstance } from './EnemySystem';

/* ── 투사체 ── */
interface Projectile {
  skillId: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  dmg: number;
  radius: number;
  life: number;
  piercing: boolean;
  hitIds: Set<number>;
  mesh: THREE.Mesh;
  returning?: boolean;
  originX?: number;
  originY?: number;
  homing?: boolean;
  targetId?: number;
  homingTurnRate?: number;
  bounces?: number;
  isMini?: boolean;
  /** 드론 미사일 전용: 타겟 마지막 위치 (타겟 사망 후 이 위치로 직진) */
  lockX?: number;
  lockY?: number;
  /** 최대 사거리 (0=무제한). 초과 시 소멸 */
  maxRange?: number;
  traveled?: number;
  /* ── 테이블 구동 플래그 (projectile_config) ── */
  bounceEnemy?: boolean;   // 적에 튕김
  bounceScreen?: boolean;  // 화면 가장자리에 튕김
  explodeRadius?: number;  // 명중/소멸 시 폭발 반경 (0=없음)
  gravity?: number;        // >0 = 포물선(로브). 목표 지점 도달 시 폭발/소멸
  destX?: number;          // 포물선 착지 목표
  destY?: number;
}

/* ── 클러스터 스폰 대기열 ── */
interface ClusterSpawn {
  x: number;
  y: number;
  dmg: number;
}

/* ── 화염 장판 ── */
interface FlameZone {
  x: number;
  y: number;
  radius: number;
  dmg: number;
  life: number;
  maxLife: number;
  tickTimer: number;
  mesh: THREE.Mesh;
  zoneType: 'fire' | 'napalm' | 'explosion';
  pulseTimer: number;
}

/* ── 지뢰 ── */
interface Mine {
  x: number;
  y: number;
  radius: number;
  dmg: number;
  life: number;
  mesh: THREE.Mesh;
  pulseTimer: number;
  triggered: boolean;
}

/* ── 메테오 ── */
interface Meteor {
  tx: number;
  ty: number;
  curY: number;
  speed: number;
  dmg: number;
  hitRadius: number;
  mesh: THREE.Mesh;
  warningMesh: THREE.Mesh;
  life: number;
  impacted: boolean;
  flashTimer: number;
}

/* ── 가디언 블레이드 ── */
interface GuardianBlade {
  angle: number;
  orbitRadius: number;
  dmg: number;
  tickTimer: number;
  hitIds: Set<number>;
  mesh: THREE.Mesh;
}

interface EquippedSkill {
  cfg: SkillConfig;
  levelCfg: SkillLevelConfig;
  cooldownTimer: number;
}

interface DroneUnit {
  bobPhase: number;
  offsetX: number;
  offsetY: number;
  mesh: THREE.Mesh;
  /** 'a'=우상단(오렌지), 'b'=좌상단(청록) */
  side: 'a' | 'b';
  /** 이 드론의 독립 사이클 상태 */
  phase: 'active' | 'rest';
  phaseTimer: number;
  fireTimer: number;
}

interface BossTargetInfo {
  alive: boolean;
  x: number;
  y: number;
  radius: number;
}

export class SkillSystem {
  private scene: THREE.Scene;
  private data: GameData;

  private equipped: Map<string, EquippedSkill> = new Map();
  private projectiles: Projectile[] = [];
  /** 최근 투사체 발사 각도 (라디안) — 인게임 총 조준 회전용 */
  lastFireAngle = 0;
  /** 기본 공격 쿨타임 진행도 0→1 (단발 방식) or 탄수/탄창 비율 (탄창 방식) */
  basicCooldownPct = 1;
  /** 기본 공격으로 쓰이는 스킬 ID */
  basicSkillId = 'kunai';

  /* ── 탄창 시스템 상태 ── */
  /** 현재 남은 탄수 */
  private ammoCount = 0;
  /** 탄창 용량 (0 = 탄창 방식 아님) */
  magazineCapacity = 0;
  /** 연사 타이머 (프레임 단위) */
  private burstTimer = 0;
  /** 재장전 타이머 (프레임 단위, 0 = 완료) */
  private reloadTimer = 0;
  /** 재장전 총 시간 (프레임) — 진행도 계산용 */
  private flames: FlameZone[] = [];
  private guardians: GuardianBlade[] = [];
  private drones: DroneUnit[] = [];
  private guardianAngle = 0;
  private pendingClusters: ClusterSpawn[] = [];
  private dronePhase: 'active' | 'rest' = 'active';
  private dronePhaseTimer = 0;
  private droneFireTimer = 0;
  private debuffAuras: { mesh: THREE.Mesh; life: number; maxLife: number; radius: number; dmg: number; tickTimer: number }[] = [];
  private lightningVfx: { line: THREE.Line; life: number }[] = [];
  /** 사거리 초과/소멸 시 표시되는 버스트 링 VFX */
  private expireBursts: { mesh: THREE.Mesh; life: number; maxLife: number; baseR: number }[] = [];
  private mines: Mine[] = [];
  private meteors: Meteor[] = [];

  /** 패시브 배율 — GameCore에서 setPassive()로 설정 */
  private areaMult = 1.0;   // highFuel: 화염/폭발 반경
  private lifeMult = 1.0;   // exoskeleton: 투사체 수명
  private globalDmgMult = 1.0; // 영구 특성 power: 전체 데미지 배율
  private cooldownMult = 1.0;   // energyCube 패시브: 쿨타임 배율 (작을수록 빠름)
  private reloadSpeedMult = 1.0; // ammoBooster 패시브: 재장전 속도 배율 (작을수록 빠름)

  /** 적 피격 결과: [enemyId, dmg, element][] — tick() 후 GameCore가 읽음 */
  readonly hitResults: [number, number, string][] = [];

  /** 스킬 ID → 속성 (진화 스킬은 베이스로 역매핑) */
  private _elementOf(skillId: string): string {
    const baseIdMap: Record<string, string> = {
      ghost_shuriken: 'kunai', twin_boomerang: 'boomerang',
      napalm: 'molotov', eternal_guardian: 'guardian', cluster_rocket: 'rocket',
    };
    const id = baseIdMap[skillId] ?? skillId;
    return this.data.skills.get(id)?.element ?? '';
  }

  constructor(scene: THREE.Scene, data: GameData) {
    this.scene = scene;
    this.data = data;
    this._keepLegacyMethodsReferenced();
  }

  /** skill_runtime_config.csv */
  private _sr(key: string, def: number): number {
    const v = this.data.skillRuntime.get(key);
    return v === undefined || Number.isNaN(v) ? def : v;
  }

  /** guardian_runtime_config.csv */
  private _gr(key: string, def: number): number {
    const v = this.data.guardianRuntime.get(key);
    return v === undefined || Number.isNaN(v) ? def : v;
  }

  private _srl(key: string, def: number[]): number[] {
    return this.data.skillRuntimeLists.get(key) ?? def;
  }

  /**
   * 과거 전용 발사기/리빌드 함수는 현재 테이블 구동 경로로 대체되었지만,
   * 향후 회귀 비교를 위해 코드 보관 중이다. TS6133 방지용 참조.
   */
  private _keepLegacyMethodsReferenced() {
    void this._tickDroneWeapon;
    void this._fireShotgun;
    void this._fireKunai;
    void this.__fireMolotov;
    void this._fireRocket;
    void this._rebuildDrones;
    void this._fireSoccerBall;
    void this._fireDrillShot;
  }

  /* ── 패시브 효과 주입 ── */
  setPassive(key: 'areaMult' | 'lifeMult' | 'globalDmgMult' | 'cooldownMult' | 'reloadSpeedMult', value: number) {
    this[key] = value;
  }

  /* ── 스킬 장착/레벨업 ── */
  equipSkill(skillId: string, level: number) {
    /* 진화 스킬은 베이스 스킬 설정을 재활용하거나 더미 cfg를 만든다 */
    const baseIdMap: Record<string, string> = {
      ghost_shuriken:   'kunai',
      twin_boomerang:   'boomerang',
      napalm:           'molotov',
      eternal_guardian: 'guardian',
      cluster_rocket:   'rocket',
    };
    const lookupId = baseIdMap[skillId] ?? skillId;

    const cfg = this.data.skills.get(lookupId);
    if (!cfg) return;
    const levels = this.data.skillLevels.get(lookupId) ?? [];
    /* 진화 스킬은 레벨5 설정 사용 (풀 강화 상태) */
    const levelCfg = levels.find(l => l.level === level) ?? levels[levels.length - 1] ?? levels[0]
      ?? (cfg.skill_type === 'AUTO'
        ? {
            skill_id: lookupId,
            level,
            dmg_mult_scale: 1,
            cooldown_reduce_rate: 0,
            passive_bonus_value: 0,
          }
        : undefined);
    if (!levelCfg) return;

    /* 베이스 스킬이 장착되어 있으면 제거 (진화로 교체) */
    if (skillId !== lookupId && this.equipped.has(lookupId)) {
      /* 가디언 블레이드 제거 */
      if (lookupId === 'guardian') {
        for (const b of this.guardians) this.scene.remove(b.mesh);
        this.guardians.length = 0;
      }
      this.equipped.delete(lookupId);
    }

    /* 진화 스킬 cfg는 베이스 id를 skill_id로 유지하되 skill_id를 진화 id로 교체 */
    const evoCfg = { ...cfg, skill_id: skillId };

    if (this.equipped.has(skillId)) {
      const eq = this.equipped.get(skillId)!;
      eq.cfg = evoCfg;
      eq.levelCfg = levelCfg;
      if (skillId === 'guardian' || skillId === 'eternal_guardian') {
        this._rebuildGuardians(evoCfg, levelCfg, skillId === 'eternal_guardian');
      }
      if (skillId === 'drone' || skillId === 'drone_b') {
        this._rebuildDroneUnit(skillId === 'drone_b' ? 'b' : 'a', levelCfg.level);
      }
    } else {
      this.equipped.set(skillId, { cfg: evoCfg, levelCfg, cooldownTimer: 0 });
      if (skillId === 'guardian' || skillId === 'eternal_guardian') {
        this._rebuildGuardians(evoCfg, levelCfg, skillId === 'eternal_guardian');
      }
      if (skillId === 'drone' || skillId === 'drone_b') {
        this._rebuildDroneUnit(skillId === 'drone_b' ? 'b' : 'a', levelCfg.level);
      }
    }
  }

  /* ── 매 프레임 ── */
  tick(
    dt: number,
    px: number,
    py: number,
    vx: number,
    vy: number,
    enemies: EnemyInstance[],
    boss?: BossTargetInfo,
  ) {
    this.hitResults.length = 0;
    const hasAnyAutoOrActive = [...this.equipped.values()].some(
      (eq) => eq.cfg.skill_type === 'ACTIVE' || eq.cfg.skill_type === 'AUTO',
    );
    if (!hasAnyAutoOrActive) {
      // 런타임 안전장치: 어떤 이유로 시작 스킬 장착이 누락돼도 기본 공격은 항상 유지
      const fallbackId = this.data.skills.has(this.basicSkillId) ? this.basicSkillId : 'auto_basic';
      this.equipSkill(fallbackId, 1);
    }

    for (const [id, eq] of this.equipped) {
      if (eq.cfg.skill_type !== 'ACTIVE' && eq.cfg.skill_type !== 'AUTO') continue;
      if (id === 'drone' || id === 'drone_b') continue;
      /* 탄창 방식 스킬은 아래 탄창 블록에서 직접 발사 — 쿨타임 루프 스킵 */
      if (eq.cfg.magazine_capacity > 0) continue;
      if (eq.cooldownTimer > 0) { eq.cooldownTimer -= dt; continue; }
      const cooldown = (eq.cfg.base_cooldown_frames / 60) * (1 - eq.levelCfg.cooldown_reduce_rate) * this.cooldownMult;
      eq.cooldownTimer = cooldown;
      this._fire(id, eq, px, py, vx, vy, enemies);
    }

    /* 기본 공격 탄창/쿨타임 진행도 갱신 */
    const basic = this.equipped.get(this.basicSkillId)
      ?? this.equipped.get('auto_basic') ?? this.equipped.get('auto_revolver')
      ?? this.equipped.get('auto_shotgun') ?? this.equipped.get('auto_drill')
      ?? this.equipped.get('kunai') ?? this.equipped.get('ghost_shuriken');
    const hasTarget = enemies.some(e => !e.dead) || Boolean(boss?.alive);

    if (basic && basic.cfg.magazine_capacity > 0) {
      /* ── 탄창 방식 ── */
      const cap = basic.cfg.magazine_capacity;
      /* cooldownMult(에너지큐브)와 reloadSpeedMult(탄약추진기) 둘 다 적용 */
      const speedMult = this.cooldownMult * this.reloadSpeedMult;
      const burstInt = Math.max(2, Math.round(basic.cfg.burst_interval_frames * speedMult));
      const reloadF  = Math.max(10, Math.round(basic.cfg.reload_frames * speedMult));

      /* 첫 장착 시 탄창 초기화 */
      if (this.magazineCapacity !== cap) {
        this.magazineCapacity = cap;
        this.ammoCount = cap;
        this.burstTimer = 0;
        this.reloadTimer = 0;
      }

      if (this.reloadTimer > 0) {
        /* 재장전 중 */
        this.reloadTimer -= dt * 60;
        if (this.reloadTimer <= 0) {
          this.reloadTimer = 0;
          this.ammoCount = cap;
        }
        /* 재장전 진행도: 탄이 0개에서 순서대로 채워지는 느낌으로 표시 */
        const reloadPct = 1 - Math.max(0, this.reloadTimer) / reloadF;
        this.basicCooldownPct = reloadPct;
      } else if (this.ammoCount > 0 && hasTarget) {
        /* 연사 가능 */
        this.burstTimer -= dt * 60;
        if (this.burstTimer <= 0) {
          this.burstTimer = burstInt;
          /* 탄창 방식 스킬은 tick()의 일반 쿨타임 루프를 우회해서 직접 발사 */
          this._fire(basic.cfg.skill_id, basic, px, py, vx, vy, enemies);
          this.ammoCount = Math.max(0, this.ammoCount - 1);
          if (this.ammoCount === 0) {
            /* 탄 소진 → 재장전 시작 */
            this.reloadTimer = reloadF;
          }
        }
        this.basicCooldownPct = this.ammoCount / cap;
      } else if (!hasTarget) {
        this.basicCooldownPct = this.ammoCount / cap;
      }

    } else if (basic && hasTarget) {
      /* ── 단발 쿨타임 방식 (기존) ── */
      const cd = (basic.cfg.base_cooldown_frames / 60) * (1 - basic.levelCfg.cooldown_reduce_rate) * this.cooldownMult;
      this.basicCooldownPct = cd > 0 ? Math.max(0, Math.min(1, 1 - basic.cooldownTimer / cd)) : 1;
    } else {
      this.basicCooldownPct = 1;
    }

    this._tickProjectiles(dt, px, py, enemies);
    this._tickFlames(dt, enemies);
    this._tickMines(dt, enemies);
    this._tickMeteors(dt, enemies);
    this._tickGuardians(dt, px, py, enemies);
    this._tickDrones(dt, px, py, enemies, boss);
    this._tickDebuffAuras(dt, px, py, enemies);
    this._tickExpireBursts(dt);

    /* 번개 VFX 라인 수명 처리 */
    for (let i = this.lightningVfx.length - 1; i >= 0; i--) {
      const lv = this.lightningVfx[i];
      lv.life -= dt;
      if (lv.life <= 0) {
        this.scene.remove(lv.line);
        lv.line.geometry.dispose();
        (lv.line.material as THREE.Material).dispose();
        this.lightningVfx.splice(i, 1);
      }
    }
  }

  private _getDroneCycle(level: number): { activeSec: number; restSec: number } {
    const activeSec = this._sr('drone_active_sec', 3);
    const restMax = this._sr('drone_rest_sec_max', 7);
    const restPerLv = this._sr('drone_rest_sec_per_level', 1);
    const restSec = Math.max(0, restMax - (level - 1) * restPerLv);
    return { activeSec, restSec };
  }

  private _tickDroneWeapon(
    dt: number,
    level: number,
    eq: EquippedSkill,
    enemies: EnemyInstance[],
    px: number,
    py: number,
    boss?: BossTargetInfo,
  ) {
    const { activeSec, restSec } = this._getDroneCycle(level);
    if (this.dronePhaseTimer <= 0) {
      this.dronePhase = 'active';
      this.dronePhaseTimer = activeSec;
      this.droneFireTimer = 0;
    }

    if (this.dronePhase === 'active') {
      this.dronePhaseTimer -= dt;
      this.droneFireTimer -= dt;
      while (this.droneFireTimer <= 0) {
        this.droneFireTimer += this._sr('drone_burst_interval', 0.18);
        this._fireDrone(
          px, py,
          eq.cfg.base_dmg_mult * eq.levelCfg.dmg_mult_scale * this._sr('skill_dmg_scale', 10),
          eq.cfg.projectile_speed,
          eq.cfg.projectile_radius,
          enemies,
          boss,
        );
      }
      if (this.dronePhaseTimer <= 0) {
        this.dronePhase = 'rest';
        this.dronePhaseTimer = restSec;
      }
      return;
    }

    this.dronePhaseTimer -= dt;
    if (this.dronePhaseTimer <= 0) {
      this.dronePhase = 'active';
      this.dronePhaseTimer = activeSec;
      this.droneFireTimer = 0;
    }
  }

  /**
   * 보스 충돌 체크 — EnemySystem 외부 대상
   * @returns 이번 프레임 보스에게 가한 총 데미지
   */
  checkBossHit(bx: number, by: number, br: number): number {
    let totalDmg = 0;
    const BOSS_ID = -1;

    /* 투사체 */
    for (const p of this.projectiles) {
      if (p.hitIds.has(BOSS_ID)) continue;
      const dx = p.x - bx;
      const dy = p.y - by;
      const minD = p.radius + br;
      if (dx * dx + dy * dy < minD * minD) {
        totalDmg += p.dmg;
        p.hitIds.add(BOSS_ID);

        /* 로켓 계열: 폭발 장판 */
        if (p.skillId === 'rocket' || p.skillId === 'cluster_rocket') {
          this._spawnFlameExplosion(p.x, p.y, p.radius * 3 * this.areaMult, p.dmg * 0.8, 0.5);
        }
        if (p.skillId === 'cluster_rocket') {
          this.pendingClusters.push({ x: p.x, y: p.y, dmg: p.dmg * 0.45 });
        }

        // 축구공 보스 반사
        if (p.skillId === 'soccer_ball' || p.skillId === 'quantum_ball' || p.skillId === 'quantum_mini') {
          const dist = Math.sqrt(dx * dx + dy * dy) || 0.001;
          const speed = Math.sqrt(p.vx * p.vx + p.vy * p.vy) || 2.0;
          p.vx = (-dx / dist) * speed;
          p.vy = (-dy / dist) * speed;
          p.bounces = (p.bounces ?? 5) - 1;
          if (p.bounces <= 0) p.life = 0;

          if (p.skillId === 'quantum_ball' && !p.isMini) {
            this._spawnQuantumMini(p.x, p.y, p.dmg * 0.45, speed * 1.15, p.radius * 0.55);
          }
        } else if (!p.piercing) {
          p.life = 0;
        }
      }
    }

    /* 화염 장판 */
    for (const f of this.flames) {
      const dx = bx - f.x;
      const dy = by - f.y;
      if (dx * dx + dy * dy <= (f.radius + br) * (f.radius + br)) {
        if (f.tickTimer <= 0) {
          totalDmg += f.dmg;
          /* tickTimer 리셋은 _tickFlames에서 처리됨 */
        }
      }
    }

    /* 가디언 블레이드 */
    for (const blade of this.guardians) {
      if (blade.hitIds.has(BOSS_ID)) continue;
      const bpx = blade.mesh.position.x;
      const bpy = blade.mesh.position.y;
      const dx = bpx - bx;
      const dy = bpy - by;
      const minD = 8 + br;
      if (dx * dx + dy * dy < minD * minD) {
        totalDmg += blade.dmg;
        blade.hitIds.add(BOSS_ID);
      }
    }

    return totalDmg;
  }

  /* ── 발사 ── */
  private _fire(
    id: string,
    eq: EquippedSkill,
    px: number, py: number,
    vx: number, vy: number,
    enemies: EnemyInstance[],
  ) {
    const dmg = eq.cfg.base_dmg_mult * eq.levelCfg.dmg_mult_scale * this._sr('skill_dmg_scale', 10) * this.globalDmgMult;
    const spd = eq.cfg.projectile_speed;
    const r   = eq.cfg.projectile_radius;

    switch (id) {
      case 'kunai':           this._fireFromTable(id, eq, px, py, vx, vy, enemies); break;
      case 'boomerang':       this._fireBoomerang(px, py, vx, vy, dmg, spd, r); break;
      case 'molotov':         this._fireParabola(eq, px, py, dmg, enemies); break;
      case 'rocket':          this._fireFromTable(id, eq, px, py, vx, vy, enemies); break;
      case 'drone':           this._fireDrone(px, py, dmg, spd, r, enemies); break;
      case 'soccer_ball':     this._fireFromTable(id, eq, px, py, vx, vy, enemies); break;
      case 'drill_shot':      this._fireFromTable(id, eq, px, py, vx, vy, enemies); break;
      case 'dimensional_blade': this._fireDimensionalBlade(px, py, vx, vy, dmg, r); break;
      case 'debuff_aura':       this._fireDebuffAura(px, py, dmg, r); break;
      case 'lightning':         this._fireLightning(px, py, dmg, r, enemies); break;
      case 'mine':              this._fireMine(px, py, dmg, r); break;
      case 'shotgun':           this._fireFromTable(id, eq, px, py, vx, vy, enemies); break;
      /* ── 진화 스킬 ── */
      case 'ghost_shuriken':  this._fireGhostShuriken(px, py, dmg, spd, r, enemies); break;
      case 'twin_boomerang':  this._fireTwinBoomerang(px, py, vx, vy, dmg, spd, r); break;
      case 'napalm':          this._fireNapalm(eq, dmg, enemies); break;
      case 'eternal_guardian': break; /* 리빌드는 equipSkill에서 처리 */
      case 'cluster_rocket':  this._fireClusterRocket(px, py, dmg, spd, r, enemies); break;
      case 'quantum_ball':    this._fireQuantumBall(px, py, vx, vy, dmg, spd, r); break;
      case 'whistling_arrow': this._fireWhistlingArrow(px, py, dmg, spd, r, enemies); break;
      case 'void_slash':      this._fireVoidSlash(px, py, dmg, r); break;
      /* ── 기본 공격 (무기별 AUTO 타입) ── */
      case 'auto_basic':    this._fireAutoBasic(px, py, dmg, spd, r, enemies); break;
      case 'auto_revolver': this._fireAutoRevolver(px, py, dmg, spd, r, enemies); break;
      case 'auto_shotgun':  this._fireAutoShotgun(px, py, vx, vy, dmg, spd, r, enemies); break;
      case 'auto_drill':    this._fireAutoDrill(px, py, vx, vy, dmg, spd, r, enemies); break;
      default: break;
    }
  }

  /**
   * 테이블 구동 범용 발사기 — skill_config(fire_pattern/target_mode/count/spread/projectile_id)
   * + projectile_config(shape/speed/size/life/pierce/bounce/homing) 값으로 비행 투사체 발사.
   * 지원: homing / directional / spread. (parabola/orbit/aura/chain 등은 전용 핸들러)
   */
  private _fireFromTable(
    id: string, eq: EquippedSkill,
    px: number, py: number, vx: number, vy: number,
    enemies: EnemyInstance[],
  ) {
    const pcfg = this.data.projectiles.get(eq.cfg.projectile_id);
    if (!pcfg) return;
    const dmg   = eq.cfg.base_dmg_mult * eq.levelCfg.dmg_mult_scale * this._sr('skill_dmg_scale', 10) * this.globalDmgMult;
    const spd   = eq.cfg.projectile_speed * pcfg.speed_mult;
    const r     = eq.cfg.projectile_radius * pcfg.size_mult;
    const life  = pcfg.life_seconds * this.lifeMult;
    const color = parseInt(pcfg.color_hex.replace('#', ''), 16);
    const count = Math.max(1, eq.cfg.projectile_count || 1);
    const homing = pcfg.homing_turn_rate > 0;
    const isCone = pcfg.shape === 'cone';

    /* 기준 조준각 + 타겟 */
    let baseAng = 0;
    let targetId: number | undefined;
    if (eq.cfg.target_mode === 'joystick') {
      let nx = vx, ny = vy;
      if (Math.abs(nx) < 0.01 && Math.abs(ny) < 0.01) { nx = 1; ny = 0; }
      baseAng = Math.atan2(ny, nx);
    } else {
      const near = this._nearestEnemy(px, py, enemies);
      if (near) { baseAng = Math.atan2(near.y - py, near.x - px); targetId = near.id; }
    }

    const spreadRad = (eq.cfg.spread_deg || 0) * Math.PI / 180;
    for (let i = 0; i < count; i++) {
      const t = count > 1 ? (i / (count - 1) - 0.5) : 0;   // -0.5 ~ 0.5
      const ang = baseAng + t * spreadRad;
      const offset = homing ? 18 : 0;                       // 유도탄 근접 적 즉시충돌 방지
      const sx = px + Math.cos(ang) * offset;
      const sy = py + Math.sin(ang) * offset;
      const dvx = Math.cos(ang) * spd, dvy = Math.sin(ang) * spd;
      const proj = isCone
        ? this._spawnDrill(id, sx, sy, dvx, dvy, dmg, r, life, pcfg.pierce, color, homing, targetId, pcfg.homing_turn_rate || 0.18)
        : this._spawnProjectile(id, sx, sy, dvx, dvy, dmg, r, life, pcfg.pierce, color, homing, targetId, pcfg.homing_turn_rate || 0.18);
      proj.bounceEnemy = pcfg.bounce_enemy;
      proj.bounceScreen = pcfg.bounce_screen;
      proj.explodeRadius = eq.cfg.explode_radius;
      if (pcfg.bounce_count) proj.bounces = pcfg.bounce_count;
    }
  }

  private _fireDebuffAura(px: number, py: number, dmg: number, r: number) {
    const radius = r * this.areaMult;
    const geo = new THREE.RingGeometry(radius - 1.5, radius + 1.5, 32);
    const mat = new THREE.MeshBasicMaterial({
      color: 0x9900ff,
      transparent: true,
      opacity: 0.85,
      side: THREE.DoubleSide
    });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.set(px, py, 0.5);
    this.scene.add(mesh);

    const auraLife = this._sr('debuff_aura_life_sec', 1.5) * this.lifeMult;
    this.debuffAuras.push({
      mesh,
      life: auraLife,
      maxLife: auraLife,
      radius,
      dmg,
      tickTimer: this._sr('debuff_aura_tick_init', 0.1),
    });
  }

  /* ── 번개 발사기 → 메테오: 하늘에서 떨어지는 운석 ── */
  private _fireLightning(px: number, py: number, dmg: number, r: number, enemies: EnemyInstance[]) {
    const alive = enemies.filter(e => !e.dead);
    if (alive.length === 0) return;
    const inRange = alive.filter(e => {
      const dx = e.x - px, dy = e.y - py;
      const pickR = this._sr('lightning_pick_range', 360);
      return dx * dx + dy * dy <= pickR * pickR;
    });
    const targets = inRange.length > 0 ? inRange : alive;

    /* 1차 타겟 메테오 */
    const primary = targets[Math.floor(Math.random() * targets.length)];
    this._spawnMeteor(primary.x, primary.y, dmg, r);

    /* 연쇄: 주변 최대 3체에 추가 메테오 (약간 지연) */
    const chainR = r * this._sr('lightning_chain_radius_mult', 6);
    const chainMax = Math.floor(this._sr('lightning_chain_max', 3));
    const chainDmg = this._sr('lightning_chain_dmg_ratio', 0.6);
    const chainHitR = this._sr('lightning_chain_hit_radius_ratio', 0.75);
    let chained = 0;
    for (const e of alive) {
      if (e.id === primary.id || chained >= chainMax) continue;
      const dx = e.x - primary.x, dy = e.y - primary.y;
      if (dx * dx + dy * dy <= chainR * chainR) {
        this._spawnMeteor(e.x, e.y, dmg * chainDmg, r * chainHitR);
        chained++;
      }
    }
  }

  private _spawnMeteor(tx: number, ty: number, dmg: number, hitRadius: number) {
    const startY = ty + this._sr('meteor_start_offset_y', 300);
    const speed = this._sr('meteor_speed', 420);

    /* 낙하 운석 메쉬 (빨간 삼각형) */
    const shape = new THREE.Shape();
    shape.moveTo(0, 10); shape.lineTo(-7, -8); shape.lineTo(7, -8); shape.closePath();
    const geo = new THREE.ShapeGeometry(shape);
    const mat = new THREE.MeshBasicMaterial({ color: 0xFF4400 });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.set(tx, startY, 1.5);
    this.scene.add(mesh);

    /* 착지 경고 원 */
    const warnInner = this._sr('meteor_warn_ring_inner_ratio', 0.6);
    const warnGeo = new THREE.RingGeometry(hitRadius * warnInner, hitRadius, 20);
    const warnMat = new THREE.MeshBasicMaterial({
      color: 0xFF8800, transparent: true, opacity: this._sr('meteor_warn_opacity', 0.6), side: THREE.DoubleSide,
    });
    const warningMesh = new THREE.Mesh(warnGeo, warnMat);
    warningMesh.position.set(tx, ty, 0.3);
    this.scene.add(warningMesh);

    this.meteors.push({
      tx, ty, curY: startY, speed, dmg, hitRadius,
      mesh, warningMesh,
      life: (startY - ty) / speed + this._sr('meteor_impact_life_pad', 0.3),
      impacted: false, flashTimer: 0,
    });
  }

  /* ── 지뢰: 바닥에 점멸 마커 설치, 적 접근 시 폭발 ── */
  private _fireMine(px: number, py: number, dmg: number, r: number) {
    const angle = Math.random() * Math.PI * 2;
    const dist = this._sr('mine_spawn_dist_min', 40) + Math.random() * this._sr('mine_spawn_dist_rand', 60);
    const mx = px + Math.cos(angle) * dist;
    const my = py + Math.sin(angle) * dist;
    const mineR = r * this.areaMult;

    /* 지뢰 마커: 노란 십자 + 외곽 링 (FX만 축소) */
    const fxR = mineR * this._sr('skill_fx_vis_scale', 2 / 3);
    const group = new THREE.Group();
    const ringGeo = new THREE.RingGeometry(fxR * 0.55, fxR * 0.75, 20);
    const ringMat = new THREE.MeshBasicMaterial({ color: 0xFFDD00, transparent: true, opacity: 0.9, side: THREE.DoubleSide });
    group.add(new THREE.Mesh(ringGeo, ringMat));

    const barH = new THREE.Mesh(new THREE.PlaneGeometry(fxR * 0.8, fxR * 0.2), new THREE.MeshBasicMaterial({ color: 0xFF4400 }));
    const barV = new THREE.Mesh(new THREE.PlaneGeometry(fxR * 0.2, fxR * 0.8), new THREE.MeshBasicMaterial({ color: 0xFF4400 }));
    group.add(barH, barV);
    group.position.set(mx, my, 0.4);
    this.scene.add(group);

    this.mines.push({
      x: mx, y: my, radius: mineR, dmg,
      life: this._sr('mine_life_sec', 12),
      mesh: group as unknown as THREE.Mesh,
      pulseTimer: 0,
      triggered: false,
    });
  }

  /* ── 샷건: 전방 부채꼴 산탄 5발 ── */
  private _fireShotgun(px: number, py: number, vx: number, vy: number, dmg: number, spd: number, r: number, enemies: EnemyInstance[]) {
    let nx = vx, ny = vy;
    if (Math.abs(nx) < 0.01 && Math.abs(ny) < 0.01) {
      /* 입력 없으면 최근접 적 방향 */
      const near = this._nearestEnemy(px, py, enemies);
      if (near) { nx = near.x - px; ny = near.y - py; }
      else { nx = 1; ny = 0; }
    }
    const len = Math.sqrt(nx * nx + ny * ny) || 1;
    nx /= len; ny /= len;
    const baseAngle = Math.atan2(ny, nx);
    const SPREAD = this._sr('shotgun_extra_spread_rad', 0.18);
    for (let i = -2; i <= 2; i++) {
      const a = baseAngle + i * SPREAD;
      this._spawnProjectile('shotgun',
        px + Math.cos(a) * 16, py + Math.sin(a) * 16,
        Math.cos(a) * spd, Math.sin(a) * spd,
        dmg, r, 2.0 * this.lifeMult, false, 0xFFDD55);
    }
  }

  private _tickDebuffAuras(dt: number, px: number, py: number, enemies: EnemyInstance[]) {
    const toRemove: number[] = [];
    for (let i = 0; i < this.debuffAuras.length; i++) {
      const aura = this.debuffAuras[i];
      aura.life -= dt;
      if (aura.life <= 0) {
        toRemove.push(i);
        continue;
      }

      aura.mesh.position.set(px, py, 0.5);
      
      const ratio = 1 - aura.life / aura.maxLife;
      const currentScale = this._sr('debuff_aura_scale_min', 0.4) + ratio * this._sr('debuff_aura_scale_range', 0.6);
      aura.mesh.scale.set(currentScale, currentScale, 1);
      aura.mesh.rotation.z += dt * this._sr('debuff_aura_rot_speed', 3);
      
      const mat = aura.mesh.material as THREE.MeshBasicMaterial;
      mat.opacity = 0.3 + Math.sin(performance.now() * 0.015) * 0.25;

      aura.tickTimer -= dt;
      if (aura.tickTimer <= 0) {
        aura.tickTimer = this._sr('debuff_aura_dmg_tick_sec', 0.15);
        const r2 = (aura.radius * currentScale) * (aura.radius * currentScale);
        const auraDmgRatio = this._sr('debuff_aura_dmg_ratio', 0.15);
        for (const e of enemies) {
          if (e.dead) continue;
          const dx = e.x - px;
          const dy = e.y - py;
          if (dx * dx + dy * dy <= r2) {
            this.hitResults.push([e.id, aura.dmg * auraDmgRatio, 'ice']);
          }
        }
      }
    }

    const sorted = [...new Set(toRemove)].sort((a, b) => b - a);
    for (const idx of sorted) {
      this.scene.remove(this.debuffAuras[idx].mesh);
      this.debuffAuras[idx].mesh.geometry.dispose();
      (this.debuffAuras[idx].mesh.material as THREE.Material).dispose();
      this.debuffAuras.splice(idx, 1);
    }
  }

  private _fireKunai(px: number, py: number, dmg: number, spd: number, r: number, enemies: EnemyInstance[]) {
    const nearest = this._nearestEnemy(px, py, enemies);
    if (!nearest) return;
    const dx = nearest.x - px;
    const dy = nearest.y - py;
    const d = Math.sqrt(dx * dx + dy * dy) || 1;
    const nx = dx / d;
    const ny = dy / d;
    // 플레이어 위치에서 18px 앞에서 스폰 → 근접 적과 즉시 충돌 방지
    const spawnOffset = 18;
    this._spawnProjectile('kunai',
      px + nx * spawnOffset, py + ny * spawnOffset,
      nx * spd, ny * spd,
      dmg, r, 2.5 * this.lifeMult, false, 0xFF88AA);
  }

  private _fireBoomerang(px: number, py: number, vx: number, vy: number, dmg: number, spd: number, r: number) {
    let nx = vx, ny = vy;
    if (Math.abs(nx) < 0.01 && Math.abs(ny) < 0.01) { nx = 1; ny = 0; }
    const len = Math.sqrt(nx * nx + ny * ny);
    nx /= len; ny /= len;
    const life = 1.8 * this.lifeMult;
    const proj = this._spawnProjectile('boomerang', px, py, nx*spd, ny*spd, dmg, r, life, true, 0x00A0FF);
    proj.returning = false;
    proj.originX   = px;
    proj.originY   = py;
  }

  /** 포물선 투척 (테이블 fire_pattern=parabola). 목표에 곡선으로 날아가 착지 시 화염 장판 생성 */
  private _fireParabola(eq: EquippedSkill, px: number, py: number, dmg: number, enemies: EnemyInstance[]) {
    const projId = eq.cfg.projectile_id || 'p_flask';
    const pcfg = this.data.projectiles.get(projId);
    const flameRadius = eq.cfg.projectile_radius * this.areaMult;
    const count = Math.max(1, eq.cfg.projectile_count || 1);
    const spd = (eq.cfg.projectile_speed || 6.5) * (pcfg?.speed_mult ?? 1);
    const color = parseInt((pcfg?.color_hex ?? '#FF7A1A').slice(1), 16);
    const size = (pcfg?.size_mult ?? 1) * 6;
    const alive = enemies.filter(e => !e.dead);

    const maxThrow = eq.cfg.max_range > 0 ? eq.cfg.max_range : 180;

    for (let i = 0; i < count; i++) {
      let tx: number, ty: number;
      if (alive.length > 0) {
        const t = alive[Math.floor(Math.random() * alive.length)];
        tx = t.x + (Math.random() - 0.5) * 40;
        ty = t.y + (Math.random() - 0.5) * 40;
      } else {
        const ang = Math.random() * Math.PI * 2;
        tx = px + Math.cos(ang) * (60 + Math.random() * 80);
        ty = py + Math.sin(ang) * (60 + Math.random() * 80);
      }
      /* 최대 사거리 클램핑 */
      const rawDx = tx - px, rawDy = ty - py;
      const rawD = Math.sqrt(rawDx * rawDx + rawDy * rawDy) || 1;
      if (rawD > maxThrow) {
        tx = px + (rawDx / rawD) * maxThrow;
        ty = py + (rawDy / rawD) * maxThrow;
      }
      const dx = tx - px, dy = ty - py;
      const d = Math.sqrt(dx * dx + dy * dy) || 1;

      // 플라스크 메쉬 (작은 원 + 네온)
      const geo = new THREE.CircleGeometry(size, 12);
      const mat = new THREE.MeshBasicMaterial({ color, transparent: true });
      const mesh = new THREE.Mesh(geo, mat);
      mesh.position.set(px, py, 1.5);
      this.scene.add(mesh);

      this.projectiles.push({
        skillId: 'molotov',
        x: px, y: py,
        vx: (dx / d) * spd, vy: (dy / d) * spd,
        dmg, radius: flameRadius,
        life: (d / spd) / 60 + 0.05,   // 목표 도달까지의 수명
        piercing: true, hitIds: new Set(), mesh,
        gravity: pcfg?.gravity ?? 0.45,
        destX: tx, destY: ty, originX: px, originY: py,
      });
    }
  }

  private __fireMolotov(eq: EquippedSkill, dmg: number, enemies: EnemyInstance[]) {
    const baseRadius = eq.cfg.projectile_radius * this.areaMult;
    const alive = enemies.filter(e => !e.dead);
    const count = Math.max(2, eq.cfg.projectile_count || 1);   // 처음부터 2개
    for (let i = 0; i < count; i++) {
      let fx: number, fy: number;
      if (alive.length > 0) {
        const t = alive[Math.floor(Math.random() * alive.length)];
        fx = t.x + (Math.random() - 0.5) * 60;
        fy = t.y + (Math.random() - 0.5) * 60;
      } else {
        fx = (Math.random() - 0.5) * 220;
        fy = (Math.random() - 0.5) * 220;
      }
      this._spawnFlame(fx, fy, baseRadius, dmg * 0.5, 3.0 * this.lifeMult);
    }
  }

  private _fireRocket(px: number, py: number, dmg: number, spd: number, r: number, enemies: EnemyInstance[]) {
    const nearest = this._nearestEnemy(px, py, enemies);
    if (!nearest) return;
    const dx = nearest.x - px;
    const dy = nearest.y - py;
    const d = Math.sqrt(dx * dx + dy * dy);
    this._spawnProjectile('rocket', px, py, (dx/d)*spd, (dy/d)*spd, dmg, r, 3.5 * this.lifeMult, false, 0xFF6633);
  }

  /** drone: 캐릭터 우상단 드론에서 유도탄 발사 */
  private _fireDrone(
    px: number,
    py: number,
    dmg: number,
    spd: number,
    r: number,
    enemies: EnemyInstance[],
    boss?: BossTargetInfo,
  ) {
    const alive = enemies.filter((e) => !e.dead);
    const hasBossTarget = Boolean(boss?.alive);
    if (alive.length === 0 && !hasBossTarget) return;
    const launchers = this.drones.length > 0 ? this.drones : [];
    if (launchers.length === 0) {
      for (let i = 0; i < 2; i++) {
        const sx = px + (i === 0 ? -10 : 10);
        const sy = py - 6;
        const tx = alive.length > 0 ? alive[i % alive.length].x : (boss?.x ?? px);
        const ty = alive.length > 0 ? alive[i % alive.length].y : (boss?.y ?? py);
        const dx = tx - sx;
        const dy = ty - sy;
        const d = Math.sqrt(dx * dx + dy * dy) || 1;
        const mp = this._spawnProjectile(
          'drone', sx, sy,
          (dx / d) * spd * 1.2 * 0.7, (dy / d) * spd * 1.2 * 0.7,
          dmg * 0.55, r * 1.2, 3.2 * this.lifeMult,
          false, 0xff533d,
          alive.length > 0, alive.length > 0 ? alive[i % alive.length].id : undefined, 0.08,
        );
        mp.lockX = tx; mp.lockY = ty;
      }
      return;
    }

    for (const drone of launchers) {
      const sx = drone.mesh.position.x;
      const sy = drone.mesh.position.y;
      let targetX = boss?.x ?? sx;
      let targetY = boss?.y ?? sy;
      let targetId: number | undefined = undefined;
      if (alive.length > 0) {
        let minD2 = Infinity;
        for (const e of alive) {
          const d2 = (e.x - sx) ** 2 + (e.y - sy) ** 2;
          if (d2 < minD2) {
            minD2 = d2;
            targetX = e.x;
            targetY = e.y;
            targetId = e.id;
          }
        }
      }
      const dx = targetX - sx;
      const dy = targetY - sy;
      const baseAngle = Math.atan2(dy, dx);
      const droneSpd = spd * 1.35 * 0.7;   // 속도 30% 감소
      // 2발씩 발사 (좌우로 살짝 벌려 동시 발사)
      for (const off of [-0.13, 0.13]) {
        const a = baseAngle + off;
        const dp = this._spawnProjectile(
          'drone',
          sx, sy,
          Math.cos(a) * droneSpd,
          Math.sin(a) * droneSpd,
          dmg * 0.55,
          r * 1.2,
          3.2 * this.lifeMult,
          false,
          0xff533d,
          alive.length > 0,
          targetId,
          0.08,
        );
        dp.lockX = targetX; dp.lockY = targetY;
      }
    }
  }

  /* ── 진화 스킬 발사 ── */

  /** ghost_shuriken: 무한 관통 + 3방향 동시 발사 */
  private _fireGhostShuriken(px: number, py: number, dmg: number, spd: number, r: number, enemies: EnemyInstance[]) {
    const nearest = this._nearestEnemy(px, py, enemies);
    if (!nearest) return;
    const dx = nearest.x - px;
    const dy = nearest.y - py;
    const baseAngle = Math.atan2(dy, dx);
    const spawnOffset = this._sr('ghost_spawn_offset', 18);
    const spreads = this._srl('ghost_spread_rad', [0, Math.PI / 8, -Math.PI / 8]);
    for (const offset of spreads) {
      const a = baseAngle + offset;
      this._spawnProjectile(
        'ghost_shuriken',
        px + Math.cos(a) * spawnOffset, py + Math.sin(a) * spawnOffset,
        Math.cos(a) * spd * this._sr('ghost_speed_mult', 1.3), Math.sin(a) * spd * this._sr('ghost_speed_mult', 1.3),
        dmg * this._sr('ghost_dmg_ratio', 0.8), r, this._sr('ghost_life_mult', 3) * this.lifeMult, true, 0xAAEEFF,
      );
    }
  }

  /** twin_boomerang: 전방 + 후방 동시 발사, 고속 */
  private _fireTwinBoomerang(px: number, py: number, vx: number, vy: number, dmg: number, spd: number, r: number) {
    let nx = vx, ny = vy;
    if (Math.abs(nx) < 0.01 && Math.abs(ny) < 0.01) { nx = 1; ny = 0; }
    const len = Math.sqrt(nx * nx + ny * ny);
    nx /= len; ny /= len;
    const fastSpd = spd * this._sr('twin_speed_mult', 1.6);
    const life = this._sr('twin_life_mult', 1.6) * this.lifeMult;

    for (const [dvx, dvy] of [[nx, ny], [-nx, -ny]]) {
      const p = this._spawnProjectile(
        'twin_boomerang', px, py,
        dvx * fastSpd, dvy * fastSpd,
        dmg, r, life, true, 0x00FFFF,
      );
      p.returning = false;
      p.originX = px;
      p.originY = py;
    }
  }

  /** napalm: 화염 반경 2배 + 지속 3배 */
  private _fireNapalm(eq: EquippedSkill, dmg: number, enemies: EnemyInstance[]) {
    const baseRadius = eq.cfg.projectile_radius * this.areaMult * this._sr('napalm_radius_mult', 2);
    let fx: number, fy: number;
    const alive = enemies.filter(e => !e.dead);
    const jitter = this._sr('napalm_target_jitter', 30);
    if (alive.length > 0) {
      const t = alive[Math.floor(Math.random() * alive.length)];
      fx = t.x + (Math.random() - 0.5) * jitter;
      fy = t.y + (Math.random() - 0.5) * jitter;
    } else {
      const spread = this._sr('napalm_fallback_spread', 200);
      fx = (Math.random() - 0.5) * spread;
      fy = (Math.random() - 0.5) * spread;
    }
    this._spawnNapalm(fx, fy, baseRadius, dmg * this._sr('napalm_dmg_ratio', 0.6), this._sr('napalm_life_mult', 9) * this.lifeMult);
  }

  /** cluster_rocket: 폭발 시 소형 로켓 3발 추가 */
  private _fireClusterRocket(px: number, py: number, dmg: number, spd: number, r: number, enemies: EnemyInstance[]) {
    const nearest = this._nearestEnemy(px, py, enemies);
    if (!nearest) return;
    const dx = nearest.x - px;
    const dy = nearest.y - py;
    const d = Math.sqrt(dx * dx + dy * dy) || 1;
    this._spawnProjectile(
      'cluster_rocket', px, py,
      (dx/d) * spd, (dy/d) * spd,
      dmg, r, this._sr('cluster_rocket_life_mult', 3.5) * this.lifeMult, false, 0xFF4400,
    );
  }

  /* ── 투사체 틱 ── */
  private _tickProjectiles(dt: number, px: number, py: number, enemies: EnemyInstance[]) {
    const toRemove: number[] = [];

    for (let i = 0; i < this.projectiles.length; i++) {
      const p = this.projectiles[i];

      /* ── 포물선(parabola) 투척: 목표로 곡선 비행 → 착지 시 화염 ── */
      if (p.gravity && p.gravity > 0 && p.destX !== undefined && p.destY !== undefined) {
        p.life -= dt;
        p.x += p.vx * 60 * dt;
        p.y += p.vy * 60 * dt;
        const dToDest = Math.hypot(p.destX - p.x, p.destY - p.y);
        const dFromOrigin = Math.hypot(p.x - (p.originX ?? p.x), p.y - (p.originY ?? p.y));
        const prog = dFromOrigin / (dFromOrigin + dToDest + 0.001);
        const s = 1 + Math.sin(prog * Math.PI) * 0.9;   // 곡선 느낌(떴다가 떨어짐)
        p.mesh.scale.set(s, s, 1);
        p.mesh.position.set(p.x, p.y, 1.5);
        p.mesh.rotation.z += dt * this._sr('molotov_arc_rot_speed', 12);
        if (dToDest < 14 || p.life <= 0) {
          this._spawnFlame(p.x, p.y, p.radius, p.dmg * 0.5, 3.0 * this.lifeMult);
          toRemove.push(i);
        }
        continue;
      }

      p.life -= dt;
      if (p.life <= 0) { toRemove.push(i); continue; }

      /* 부메랑 귀환 (boomerang / twin_boomerang 공통) */
      if ((p.skillId === 'boomerang' || p.skillId === 'twin_boomerang') && p.originX !== undefined) {
        const halfLife = p.skillId === 'twin_boomerang'
          ? (1.6 * this.lifeMult) / 2
          : (1.8 * this.lifeMult) / 2;
        if (!p.returning && p.life < halfLife) p.returning = true;
        if (p.returning) {
          const dx = px - p.x;
          const dy = py - p.y;
          const d = Math.sqrt(dx * dx + dy * dy) || 0.001;
          if (d < 12) { toRemove.push(i); continue; }
          const spd = Math.sqrt(p.vx * p.vx + p.vy * p.vy);
          p.vx = (dx / d) * spd;
          p.vy = (dy / d) * spd;
        }
      }

      if (p.homing) {
        let target = (p.targetId !== undefined)
          ? enemies.find((e) => e.id === p.targetId && !e.dead)
          : null;

        if (target) {
          /* 드론 미사일: 타겟 생존 중 → 마지막 위치 갱신 */
          if (p.skillId === 'drone') {
            p.lockX = target.x;
            p.lockY = target.y;
          }
          const tx = target.x - p.x;
          const ty = target.y - p.y;
          const td = Math.sqrt(tx * tx + ty * ty) || 1;
          const desiredVx = tx / td;
          const desiredVy = ty / td;
          let speed = Math.sqrt(p.vx * p.vx + p.vy * p.vy) || 0.001;
          if (p.skillId === 'drone') {
            const baseSpeed = 8.0 * 1.35;
            const maxSpeed = baseSpeed * 2.2;
            speed = Math.min(maxSpeed, speed + dt * 34);
          }
          if (p.skillId === 'whistling_arrow') {
            speed = Math.min(this._sr('homing_speed_cap', 22), speed + dt * this._sr('homing_accel_per_sec', 18));
          }
          const turn = p.homingTurnRate ?? 0.18;
          const curNx = p.vx / speed;
          const curNy = p.vy / speed;
          const nx = curNx + (desiredVx - curNx) * turn;
          const ny = curNy + (desiredVy - curNy) * turn;
          const nd = Math.sqrt(nx * nx + ny * ny) || 1;
          p.vx = (nx / nd) * speed;
          p.vy = (ny / nd) * speed;
        } else if (p.skillId === 'drone') {
          /* 드론 미사일: 타겟 사망 시 가장 가까운 다른 적으로 재탐색 (즉시 폭발 금지) */
          const next = this._nearestEnemy(p.x, p.y, enemies);
          if (next) {
            p.targetId = next.id;
            p.lockX = next.x;
            p.lockY = next.y;
            const tx = next.x - p.x;
            const ty = next.y - p.y;
            const td = Math.sqrt(tx * tx + ty * ty) || 1;
            const speed = Math.sqrt(p.vx * p.vx + p.vy * p.vy) || (8.0 * 1.35);
            const turn = p.homingTurnRate ?? 0.18;
            const nx = (p.vx / speed) + (tx / td - p.vx / speed) * turn;
            const ny = (p.vy / speed) + (ty / td - p.vy / speed) * turn;
            const nd = Math.sqrt(nx * nx + ny * ny) || 1;
            p.vx = (nx / nd) * speed;
            p.vy = (ny / nd) * speed;
          } else {
            /* 적이 전혀 없으면 직진 비행 (사거리/수명 다하면 버스트로 소멸) */
            p.homing = false;
          }
        } else {
          /* 드론 외 유도탄: 타겟 사망 시 가장 가까운 적으로 재탐색 */
          target = this._nearestEnemy(p.x, p.y, enemies);
          p.targetId = target?.id;
          if (target) {
            const tx = target.x - p.x;
            const ty = target.y - p.y;
            const td = Math.sqrt(tx * tx + ty * ty) || 1;
            const desiredVx = tx / td;
            const desiredVy = ty / td;
            const speed = Math.sqrt(p.vx * p.vx + p.vy * p.vy) || 0.001;
            if (p.skillId === 'whistling_arrow') {
              const newSpeed = Math.min(this._sr('homing_speed_cap', 22), speed + dt * this._sr('homing_accel_per_sec', 18));
              const turn = p.homingTurnRate ?? 0.18;
              const nx = (p.vx / speed) + (desiredVx - p.vx / speed) * turn;
              const ny = (p.vy / speed) + (desiredVy - p.vy / speed) * turn;
              const nd = Math.sqrt(nx * nx + ny * ny) || 1;
              p.vx = (nx / nd) * newSpeed;
              p.vy = (ny / nd) * newSpeed;
            }
          }
        }
      }

      const _mdx = p.vx * 60 * dt;
      const _mdy = p.vy * 60 * dt;
      p.x += _mdx;
      p.y += _mdy;

      // max_range 누적 체크 (유도 스킬 사거리 제한) — 부메랑 등 returning 투사체는 제외
      if (p.maxRange && p.maxRange > 0 && !p.returning) {
        p.traveled = (p.traveled ?? 0) + Math.sqrt(_mdx * _mdx + _mdy * _mdy);
        if (p.traveled >= p.maxRange) {
          // 사거리 초과로 소멸 → 버스트 효과 표시
          this._spawnExpireBurst(p.x, p.y, (p.mesh.material as THREE.MeshBasicMaterial).color?.getHex?.() ?? 0xffffff, p.radius * 3);
          p.life = 0;
        }
      }

      // 1) 휘파람 화살 맵 경계 반사 체크
      if (p.skillId === 'whistling_arrow') {
        const halfW = this.data.map.map_width / 2;
        const halfH = this.data.map.map_height / 2;
        if (p.x < -halfW || p.x > halfW) {
          p.vx = -p.vx;
          p.x = Math.max(-halfW, Math.min(halfW, p.x));
        }
        if (p.y < -halfH || p.y > halfH) {
          p.vy = -p.vy;
          p.y = Math.max(-halfH, Math.min(halfH, p.y));
        }
      }

      // 2) 축구공류 + 드릴샷: 화면 가장자리 기준 반사 (관통하며 화면 안에서 계속 튕김)
      if (p.skillId === 'soccer_ball' || p.skillId === 'quantum_ball' || p.skillId === 'quantum_mini' || p.skillId === 'drill_shot') {
        const rx = p.x - px;
        const ry = p.y - py;
        // 화면 절반보다 2배 넓게 → 화면 끝 가까이 가도록
        const screenHalfW = 160;
        const screenHalfH = 240;
        if (rx < -screenHalfW || rx > screenHalfW) {
          p.vx = -p.vx;
          p.x = px + Math.max(-screenHalfW, Math.min(screenHalfW, rx));
        }
        if (ry < -screenHalfH || ry > screenHalfH) {
          p.vy = -p.vy;
          p.y = py + Math.max(-screenHalfH, Math.min(screenHalfH, ry));
        }
      }

      p.mesh.position.set(p.x, p.y, 1);

      // 부메랑 자전 회전 효과 추가
      if (p.skillId === 'boomerang' || p.skillId === 'twin_boomerang') {
        p.mesh.rotation.z += dt * this._sr('homing_mesh_rot_speed', 18);
      }

      // 드릴샷: 회전 없이 진행 방향만 유지
      if (p.skillId === 'drill_shot') {
        p.mesh.rotation.z = Math.atan2(p.vy, p.vx);
      }

      // 휘파람 화살: 유도탄이라 진행 방향 정렬 위주
      if (p.skillId === 'whistling_arrow') {
        p.mesh.rotation.z = Math.atan2(p.vy, p.vx);
        p.mesh.rotation.y += dt * this._sr('whistling_arrow_spin_y', 14);
      }

      if (p.skillId === 'dimensional_blade' || p.skillId === 'void_slash') {
        p.mesh.rotation.z += dt * 7.5;
        const maxLife = p.skillId === 'void_slash'
          ? (this._sr('void_slash_life_mult', 0.8) * this.lifeMult)
          : (this._sr('dimensional_life_mult', 0.45) * this.lifeMult);
        const scale = 1.0 + (1.0 - Math.max(0, p.life) / maxLife) * this._sr('molotov_expand_ratio', 0.35);
        p.mesh.scale.set(scale, scale, 1);
      }

      for (const e of enemies) {
        if (e.dead) continue;
        if (p.hitIds.has(e.id)) continue;
        const dx = e.x - p.x;
        const dy = e.y - p.y;
        const minD = e.cfg.radius + p.radius;
        if (dx * dx + dy * dy < minD * minD) {
          this.hitResults.push([e.id, p.dmg, this._elementOf(p.skillId)]);
          p.hitIds.add(e.id);

          const boomR = p.radius * this._sr('rocket_explosion_radius_mult', 3) * this.areaMult;
          const boomLife = this._sr('cluster_explosion_flame_life', 0.5);
          const boomDmg = p.dmg * this._sr('cluster_explosion_dmg_ratio', 0.8);
          if (p.skillId === 'rocket') {
            this._spawnFlameExplosion(p.x, p.y, boomR, boomDmg, boomLife);
          }
          if (p.skillId === 'cluster_rocket') {
            this._spawnFlameExplosion(p.x, p.y, boomR, boomDmg, boomLife);
            this.pendingClusters.push({ x: p.x, y: p.y, dmg: p.dmg * this._sr('cluster_pending_dmg_ratio', 0.45) });
          }

          // 축구공 물리 반사
          if (p.skillId === 'soccer_ball' || p.skillId === 'quantum_ball' || p.skillId === 'quantum_mini') {
            const dist = Math.sqrt(dx * dx + dy * dy) || 0.001;
            const rx = -dx / dist;
            const ry = -dy / dist;
            const speed = Math.sqrt(p.vx * p.vx + p.vy * p.vy) || 2.0;

            const angleOffset = (Math.random() - 0.5) * 0.4;
            const cos = Math.cos(angleOffset);
            const sin = Math.sin(angleOffset);
            p.vx = (rx * cos - ry * sin) * speed;
            p.vy = (rx * sin + ry * cos) * speed;

            p.bounces = (p.bounces ?? 5) - 1;
            if (p.bounces <= 0) {
              p.life = 0;
            }

            if (p.skillId === 'quantum_ball' && !p.isMini) {
              this._spawnQuantumMini(
                p.x, p.y,
                p.dmg * this._sr('quantum_mini_dmg_ratio', 0.45),
                speed * this._sr('quantum_mini_speed_mult', 1.15),
                p.radius * this._sr('quantum_mini_radius_ratio', 0.55),
              );
            }
          }

          if (!p.piercing && p.skillId !== 'soccer_ball' && p.skillId !== 'quantum_ball' && p.skillId !== 'quantum_mini') {
            toRemove.push(i);
            break;
          }
        }
      }
    }

    const sorted = [...new Set(toRemove)].sort((a, b) => b - a);
    for (const idx of sorted) {
      this.scene.remove(this.projectiles[idx].mesh);
      this.projectiles.splice(idx, 1);
    }

    /* 클러스터 로켓 소형 로켓 3발 스폰 */
    const childN = Math.floor(this._sr('cluster_child_count', 3));
    const childSpd = this._sr('cluster_child_speed', 10);
    const childR = this._sr('cluster_child_radius', 4);
    const childLife = this._sr('cluster_child_life_mult', 1.4) * this.lifeMult;
    for (const c of this.pendingClusters) {
      for (let i = 0; i < childN; i++) {
        const angle = (i / childN) * Math.PI * 2 + Math.random() * 0.5;
        this._spawnProjectile(
          'cluster_mini', c.x, c.y,
          Math.cos(angle) * childSpd, Math.sin(angle) * childSpd,
          c.dmg, childR, childLife, false, 0xFF9933,
        );
      }
    }
    this.pendingClusters.length = 0;
  }

  /* ── 사거리 초과/소멸 버스트 VFX (피해 없음, 시각 효과만) ── */
  private _spawnExpireBurst(x: number, y: number, color: number, radius: number) {
    const geo = new THREE.RingGeometry(radius * 0.4, radius * 0.7, 20);
    const mat = new THREE.MeshBasicMaterial({
      color, transparent: true, opacity: 0.9, side: THREE.DoubleSide,
      depthWrite: false, blending: THREE.AdditiveBlending,
    });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.set(x, y, 1.2);
    this.scene.add(mesh);
    const burstLife = this._sr('expire_burst_life_sec', 0.28);
    this.expireBursts.push({ mesh, life: burstLife, maxLife: burstLife, baseR: 1 });
  }

  private _tickExpireBursts(dt: number) {
    for (let i = this.expireBursts.length - 1; i >= 0; i--) {
      const b = this.expireBursts[i];
      b.life -= dt;
      if (b.life <= 0) {
        this.scene.remove(b.mesh);
        b.mesh.geometry.dispose();
        (b.mesh.material as THREE.Material).dispose();
        this.expireBursts.splice(i, 1);
        continue;
      }
      const t = 1 - b.life / b.maxLife;       // 0 → 1
      const scale = 1 + t * 1.8;              // 팽창
      b.mesh.scale.set(scale, scale, 1);
      (b.mesh.material as THREE.MeshBasicMaterial).opacity = 0.9 * (1 - t);
    }
  }

  /* ── 화염 장판 틱 ── */
  private _tickFlames(dt: number, enemies: EnemyInstance[]) {
    const toRemove: number[] = [];

    for (let i = 0; i < this.flames.length; i++) {
      const f = this.flames[i];
      f.life -= dt;
      if (f.life <= 0) { toRemove.push(i); continue; }

      /* 타입별 시각 애니메이션 */
      f.pulseTimer += dt;
      const mat = f.mesh.material as THREE.MeshBasicMaterial;
      const lifeRatio = f.life / f.maxLife;
      if (f.zoneType === 'explosion') {
        /* 폭발: 흰-노랑 링이 빠르게 확장 + 페이드아웃 */
        const t = 1 - lifeRatio;
        f.mesh.scale.set(1 + t * 1.8, 1 + t * 1.8, 1);
        mat.opacity = lifeRatio * 0.95;
      } else if (f.zoneType === 'napalm') {
        /* 나팜: 느리게 회전 + 강한 주황 맥박 */
        mat.opacity = 0.55 + Math.sin(f.pulseTimer * this._sr('flame_napalm_pulse_freq', 4)) * 0.22;
        f.mesh.rotation.z -= dt * this._sr('flame_napalm_rot_speed', 0.6);
      } else {
        /* fire (molotov): 빠른 회전 + 빨간 링 맥박 */
        mat.opacity = 0.45 + Math.sin(f.pulseTimer * 10) * 0.25;
        f.mesh.rotation.z += dt * this._sr('flame_fire_rot_speed', 2.2);
      }

      if (f.zoneType === 'explosion') continue; // 폭발은 데미지 없음

      f.tickTimer -= dt;
      if (f.tickTimer <= 0) {
        f.tickTimer = this._sr('flame_tick_sec', 0.5);
        for (const e of enemies) {
          if (e.dead) continue;
          const dx = e.x - f.x;
          const dy = e.y - f.y;
          if (dx * dx + dy * dy <= f.radius * f.radius) {
            this.hitResults.push([e.id, f.dmg, 'fire']);
          }
        }
      }
    }

    const sorted = [...new Set(toRemove)].sort((a, b) => b - a);
    for (const idx of sorted) {
      this.scene.remove(this.flames[idx].mesh);
      this.flames.splice(idx, 1);
    }
  }

  /* ── 지뢰 틱: 점멸 + 적 감지 → 폭발 ── */
  private _tickMines(dt: number, enemies: EnemyInstance[]) {
    for (let i = this.mines.length - 1; i >= 0; i--) {
      const m = this.mines[i];
      m.life -= dt;
      m.pulseTimer += dt;

      if (m.triggered || m.life <= 0) {
        this.scene.remove(m.mesh);
        this.mines.splice(i, 1);
        continue;
      }

      /* 점멸 애니메이션 — 수명 적을수록 빠르게 */
      const blinkSpeed = m.life > 6 ? 4 : m.life > 3 ? 7 : 14;
      const blink = Math.sin(m.pulseTimer * blinkSpeed) > 0;
      (m.mesh as unknown as THREE.Group).visible = blink;

      /* 적 근접 감지 */
      for (const e of enemies) {
        if (e.dead) continue;
        const dx = e.x - m.x, dy = e.y - m.y;
        if (dx * dx + dy * dy <= m.radius * m.radius) {
          m.triggered = true;
          /* 폭발: burst VFX + 주변 적 즉시 피해 */
          const fxScale = this._sr('skill_fx_vis_scale', 2 / 3);
          this._spawnExpireBurst(m.x, m.y, 0xFFDD00, m.radius * 2.5 * fxScale);
          this._spawnFlameExplosion(m.x, m.y, m.radius * 1.4 * fxScale, m.dmg, 0.5);
          for (const e2 of enemies) {
            if (e2.dead) continue;
            const dx2 = e2.x - m.x, dy2 = e2.y - m.y;
            if (dx2 * dx2 + dy2 * dy2 <= (m.radius * 1.6) ** 2) {
              this.hitResults.push([e2.id, m.dmg, 'fire']);
            }
          }
          break;
        }
      }
    }
  }

  /* ── 메테오 틱: 낙하 → 착지 데미지 ── */
  private _tickMeteors(dt: number, enemies: EnemyInstance[]) {
    for (let i = this.meteors.length - 1; i >= 0; i--) {
      const m = this.meteors[i];
      m.life -= dt;

      if (!m.impacted) {
        m.curY -= m.speed * dt;
        m.mesh.position.set(m.tx, m.curY, 1.5);
        m.mesh.rotation.z += dt * this._sr('meteor_fall_rot_speed', 8);

        /* 경고 원 점멸 */
        const warnMat = m.warningMesh.material as THREE.MeshBasicMaterial;
        warnMat.opacity = 0.3 + Math.abs(Math.sin(m.life * 12)) * 0.5;

        if (m.curY <= m.ty) {
          /* 착지 */
          m.impacted = true;
          m.flashTimer = 0.35;
          this.scene.remove(m.warningMesh);
          this.scene.remove(m.mesh);

          /* 임팩트 VFX */
          this._spawnExpireBurst(m.tx, m.ty, 0xFF6600, m.hitRadius * 3);
          this._spawnFlameExplosion(m.tx, m.ty, m.hitRadius * 1.2, 0, 0.4);

          /* 범위 내 적 즉시 피해 */
          for (const e of enemies) {
            if (e.dead) continue;
            const dx = e.x - m.tx, dy = e.y - m.ty;
            if (dx * dx + dy * dy <= (m.hitRadius * 1.5) ** 2) {
              this.hitResults.push([e.id, m.dmg, 'electric']);
            }
          }
        }
      }

      if (m.impacted && m.life <= 0) {
        this.meteors.splice(i, 1);
      }
    }
  }

  /* ── 가디언 공전 틱 ── */
  private _tickGuardians(dt: number, px: number, py: number, enemies: EnemyInstance[]) {
    if (this.guardians.length === 0) return;
    this.guardianAngle += dt * this._gr('guardian_orbit_speed', 2.5);

    for (let g = 0; g < this.guardians.length; g++) {
      const blade = this.guardians[g];
      const angle = this.guardianAngle + (g / this.guardians.length) * Math.PI * 2;
      const bx = px + Math.cos(angle) * blade.orbitRadius;
      const by = py + Math.sin(angle) * blade.orbitRadius;
      blade.mesh.position.set(bx, by, 2);
      blade.mesh.rotation.z = angle;

      blade.tickTimer -= dt;
      if (blade.tickTimer <= 0) {
        blade.tickTimer = this._gr('guardian_hit_tick_sec', 0.3);
        blade.hitIds.clear();
      }

      for (const e of enemies) {
        if (e.dead || blade.hitIds.has(e.id)) continue;
        const dx = e.x - bx;
        const dy = e.y - by;
        const minD = e.cfg.radius + this._gr('guardian_hit_radius_pad', 8);
        if (dx * dx + dy * dy < minD * minD) {
          this.hitResults.push([e.id, blade.dmg, '']);
          blade.hitIds.add(e.id);
        }
      }
    }
  }

  /** 드론 큐브 캔버스 텍스처 생성 (캐릭터 스타일, 색상 파라미터) */
  private _makeDroneCanvas(color: string): THREE.CanvasTexture {
    const canvas = document.createElement('canvas');
    canvas.width = 128; canvas.height = 128;
    const ctx = canvas.getContext('2d')!;
    const toRgba = (hex: string, a: number) => {
      const c = hex.replace('#', '');
      return `rgba(${parseInt(c.slice(0,2),16)},${parseInt(c.slice(2,4),16)},${parseInt(c.slice(4,6),16)},${a})`;
    };
    // 아이소메트릭 큐브 3면
    ctx.fillStyle = toRgba(color, 0.35);
    ctx.beginPath(); ctx.moveTo(35,52); ctx.lineTo(64,70); ctx.lineTo(64,105); ctx.lineTo(35,87); ctx.closePath(); ctx.fill();
    ctx.fillStyle = color;
    ctx.beginPath(); ctx.moveTo(64,70); ctx.lineTo(93,52); ctx.lineTo(93,87); ctx.lineTo(64,105); ctx.closePath(); ctx.fill();
    ctx.fillStyle = toRgba(color, 0.75);
    ctx.beginPath(); ctx.moveTo(64,35); ctx.lineTo(35,52); ctx.lineTo(64,70); ctx.lineTo(93,52); ctx.closePath(); ctx.fill();
    // 네온 엣지
    ctx.strokeStyle = color; ctx.lineWidth = 3;
    ctx.shadowColor = color; ctx.shadowBlur = 8;
    ctx.beginPath(); ctx.moveTo(64,35); ctx.lineTo(35,52); ctx.lineTo(35,87); ctx.lineTo(64,105); ctx.lineTo(93,87); ctx.lineTo(93,52); ctx.closePath(); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(64,35); ctx.lineTo(64,70); ctx.moveTo(64,70); ctx.lineTo(35,52); ctx.moveTo(64,70); ctx.lineTo(93,52); ctx.stroke();
    // 작은 눈 2개
    ctx.shadowBlur = 0;
    ctx.fillStyle = '#111';
    ctx.beginPath(); ctx.arc(72, 78, 2.5, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(82, 72, 2.5, 0, Math.PI * 2); ctx.fill();
    return new THREE.CanvasTexture(canvas);
  }

  /** 단일 드론 유닛 생성/교체 (side: 'a'=우상단 오렌지, 'b'=좌상단 청록) */
  private _rebuildDroneUnit(side: 'a' | 'b', level: number) {
    /* 같은 side 기존 드론 제거 */
    for (let i = this.drones.length - 1; i >= 0; i--) {
      if (this.drones[i].side === side) {
        this.scene.remove(this.drones[i].mesh);
        this.drones.splice(i, 1);
      }
    }
    const color = side === 'a' ? '#FF6B2B' : '#00E5FF';
    const tex = this._makeDroneCanvas(color);
    const meshSize = this._sr('drone_mesh_size', 18);
    const geo = new THREE.PlaneGeometry(meshSize, meshSize);
    const mat = new THREE.MeshBasicMaterial({ map: tex, transparent: true, alphaTest: 0.05 });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.set(0, 0, 8);
    this.scene.add(mesh);

    /* 레벨에 따라 휴식 시간 줄어듦 */
    const restSec = Math.max(0, 7 - (level - 1));
    this.drones.push({
      side,
      bobPhase: Math.random() * Math.PI * 2,
      offsetX: side === 'a' ? this._sr('drone_offset_x', 16) : -this._sr('drone_offset_x', 16),
      offsetY: this._sr('drone_offset_y', 14),
      mesh,
      phase: 'active',
      phaseTimer: this._sr('drone_active_sec', 3),
      fireTimer: 0,
    });
    void restSec;
  }

  /** 하위 호환용 (레벨업 시 드론 A 갱신) */
  private _rebuildDrones(level: number) {
    this._rebuildDroneUnit('a', level);
  }

  private _tickDrones(dt: number, px: number, py: number, enemies?: EnemyInstance[], boss?: BossTargetInfo) {
    if (this.drones.length === 0) return;
    for (const d of this.drones) {
      d.bobPhase += dt * this._sr('drone_bob_speed', 4);
      const x = px + d.offsetX;
      const y = py + d.offsetY;
      const z = 8 + Math.sin(d.bobPhase) * this._sr('drone_bob_amplitude', 1.2);
      d.mesh.position.set(x, y, z);
      d.mesh.rotation.z = this._sr('drone_tilt', 0.1) * (d.side === 'a' ? 1 : -1)
        + Math.sin(d.bobPhase * this._sr('drone_tilt_wobble_freq', 0.6)) * this._sr('drone_tilt_wobble', 0.08);

      if (!enemies) continue;

      /* 드론별 독립 공격/휴식 사이클 */
      const eq = this.equipped.get(d.side === 'a' ? 'drone' : 'drone_b');
      if (!eq) continue;
      const { activeSec, restSec } = this._getDroneCycleForLevel(eq.levelCfg.level);

      if (d.phase === 'active') {
        d.phaseTimer -= dt;
        d.fireTimer -= dt;
        while (d.fireTimer <= 0) {
          d.fireTimer += 0.18;
          this._fireDroneUnit(d, eq, enemies, boss);
        }
        if (d.phaseTimer <= 0) { d.phase = 'rest'; d.phaseTimer = restSec; }
      } else {
        d.phaseTimer -= dt;
        if (d.phaseTimer <= 0) { d.phase = 'active'; d.phaseTimer = activeSec; d.fireTimer = 0; }
      }
    }
  }

  private _getDroneCycleForLevel(level: number) {
    return this._getDroneCycle(level);
  }

  private _fireDroneUnit(d: DroneUnit, eq: EquippedSkill, enemies: EnemyInstance[], boss?: BossTargetInfo) {
    const alive = enemies.filter(e => !e.dead);
    const hasBoss = Boolean(boss?.alive);
    if (alive.length === 0 && !hasBoss) return;

    const sx = d.mesh.position.x;
    const sy = d.mesh.position.y;
    const dmg = eq.cfg.base_dmg_mult * eq.levelCfg.dmg_mult_scale * this._sr('skill_dmg_scale', 10) * this.globalDmgMult * 0.55;
    const spd = eq.cfg.projectile_speed * 1.35 * 0.7;
    const r = eq.cfg.projectile_radius * 1.2;

    let targetX = boss?.x ?? sx, targetY = boss?.y ?? sy;
    let targetId: number | undefined;
    if (alive.length > 0) {
      let minD2 = Infinity;
      for (const e of alive) {
        const d2 = (e.x - sx) ** 2 + (e.y - sy) ** 2;
        if (d2 < minD2) { minD2 = d2; targetX = e.x; targetY = e.y; targetId = e.id; }
      }
    }
    const baseAng = Math.atan2(targetY - sy, targetX - sx);
    for (const off of [-0.13, 0.13]) {
      const a = baseAng + off;
      const p = this._spawnProjectile(
        'drone', sx, sy, Math.cos(a) * spd, Math.sin(a) * spd,
        dmg, r, 3.2 * this.lifeMult, false, d.side === 'a' ? 0xFF533D : 0x00DDFF,
        alive.length > 0, targetId, 0.08,
      );
      p.lockX = targetX; p.lockY = targetY;
    }
  }

  /* ── 가디언 블레이드 재구성 ── */
  private _rebuildGuardians(cfg: SkillConfig, levelCfg: SkillLevelConfig, eternal = false) {
    for (const b of this.guardians) this.scene.remove(b.mesh);
    this.guardians.length = 0;

    const countMin = Math.floor(this._gr('guardian_count_min', 2));
    const countMax = Math.floor(this._gr('guardian_count_max', 5));
    const countPerLv = Math.floor(this._gr('guardian_count_per_level', 1));
    const eternalMax = Math.floor(this._gr('eternal_count', 5));
    const count = eternal
      ? eternalMax
      : Math.min(countMax, Math.max(countMin, countMin + (levelCfg.level - 1) * countPerLv));
    const dmgMult = eternal ? this._gr('eternal_dmg_mult', 14) : this._gr('guardian_dmg_mult', 8);
    const dmg = cfg.base_dmg_mult * levelCfg.dmg_mult_scale * dmgMult;
    const orbitBase = eternal ? this._gr('eternal_orbit_base', 74) : this._gr('guardian_orbit_base', 52);
    const orbitPerLv = eternal ? this._gr('eternal_orbit_per_level', 4) : this._gr('guardian_orbit_per_level', 3);
    const orbitR = (orbitBase + levelCfg.level * orbitPerLv) * this._gr('guardian_orbit_scale', 1.1);
    const color = Math.floor(this._gr('guardian_color', 0xFFD600));
    const bladeW = eternal ? this._gr('eternal_blade_w', 19) : this._gr('guardian_blade_w', 14);
    const bladeH = this._gr('guardian_blade_h', 5);
    const bladeD = this._gr('guardian_blade_d', 2.5);
    const hitTick = this._gr('guardian_hit_tick_sec', 0.3);

    for (let i = 0; i < count; i++) {
      const geo = new THREE.BoxGeometry(bladeW, bladeH, bladeD);
      const mat = new THREE.MeshBasicMaterial({ color });
      const mesh = new THREE.Mesh(geo, mat);
      this.scene.add(mesh);
      this.guardians.push({
        angle: (i / count) * Math.PI * 2, orbitRadius: orbitR, dmg,
        tickTimer: hitTick, hitIds: new Set(), mesh,
      });
    }
  }

  /* ── 유틸 ── */
  private _spawnProjectile(
    skillId: string,
    x: number, y: number, vx: number, vy: number,
    dmg: number, radius: number, life: number,
    piercing: boolean, color: number,
    homing = false,
    targetId?: number,
    homingTurnRate = 0.18,
  ): Projectile {
    // 발사 방향 기록 (인게임 총 조준 회전용)
    if (Math.abs(vx) > 0.01 || Math.abs(vy) > 0.01) {
      this.lastFireAngle = Math.atan2(vy, vx);
    }
    // 베이스 스킬 ID 역매핑 (진화 스킬 → 베이스)
    const baseIdMap: Record<string, string> = {
      ghost_shuriken: 'kunai', twin_boomerang: 'boomerang',
      napalm: 'molotov', eternal_guardian: 'guardian', cluster_rocket: 'rocket',
    };
    const lookupId = baseIdMap[skillId] ?? skillId;
    const spriteUrl = this.data.skills.get(lookupId)?.projectile_sprite_url ?? '';

    let geo: THREE.BufferGeometry;
    let mat: THREE.MeshBasicMaterial;

    if (spriteUrl) {
      geo = new THREE.PlaneGeometry(radius * 2.2, radius * 2.2);
      const tex = new THREE.TextureLoader().load(spriteUrl);
      mat = new THREE.MeshBasicMaterial({ map: tex, transparent: true, alphaTest: 0.1 });
    } else if (skillId === 'kunai' || skillId === 'ghost_shuriken') {
      const shape = new THREE.Shape();
      const hw = radius * 0.6;
      const hl = radius * 1.8;
      shape.moveTo( hl,   0);
      shape.lineTo(  0,  hw);
      shape.lineTo(-hl,   0);
      shape.lineTo(  0, -hw);
      shape.closePath();
      geo = new THREE.ShapeGeometry(shape);
      mat = new THREE.MeshBasicMaterial({ color });
    } else if (skillId === 'boomerang') {
      const shape = new THREE.Shape();
      const w = radius * 0.4;
      const l = radius * 1.9;
      shape.moveTo(-w, -l);
      shape.lineTo(w, -l);
      shape.lineTo(w, -w);
      shape.lineTo(l, -w);
      shape.lineTo(l,  w);
      shape.lineTo(-w,  w);
      shape.closePath();
      geo = new THREE.ShapeGeometry(shape);
      mat = new THREE.MeshBasicMaterial({ color });
    } else if (skillId === 'twin_boomerang') {
      geo = new THREE.TorusGeometry(radius * 0.75, radius * 0.28, 4, 12);
      geo.rotateX(Math.PI / 2);
      mat = new THREE.MeshBasicMaterial({ color });
    } else if (skillId === 'rocket' || skillId === 'cluster_rocket' || skillId === 'cluster_mini') {
      geo = new THREE.CylinderGeometry(radius * 0.35, radius * 0.65, radius * 2.0, 5);
      geo.rotateX(Math.PI / 2);
      mat = new THREE.MeshBasicMaterial({ color });
    } else {
      geo = new THREE.SphereGeometry(radius * 0.85, 8, 8);
      mat = new THREE.MeshBasicMaterial({ color });
    }

    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.set(x, y, 1);
    
    // 날아가는 방향을 바라보게 정렬
    if (skillId !== 'soccer_ball' && skillId !== 'quantum_ball' && skillId !== 'quantum_mini') {
      mesh.rotation.z = Math.atan2(vy, vx);
    }
    
    this.scene.add(mesh);
    const maxRange = this.data.skills.get(lookupId)?.max_range ?? 0;
    const p: Projectile = {
      skillId, x, y, vx, vy, dmg, radius, life, piercing, hitIds: new Set(), mesh,
      homing, targetId, homingTurnRate,
      maxRange, traveled: 0,
    };
    this.projectiles.push(p);
    return p;
  }

  private _spawnDrill(
    skillId: string,
    x: number, y: number, vx: number, vy: number,
    dmg: number, radius: number, life: number,
    piercing: boolean, color: number,
    homing = false,
    targetId?: number,
    homingTurnRate = 0.18,
  ): Projectile {
    let geo: THREE.BufferGeometry;
    if (skillId === 'whistling_arrow') {
      // 휘파람 화살은 날렵하고 기하학적인 화살촉 (ShapeGeometry)
      const shape = new THREE.Shape();
      shape.moveTo(radius * 1.8, 0);
      shape.lineTo(-radius * 1.0, radius * 0.8);
      shape.lineTo(-radius * 0.4, 0);
      shape.lineTo(-radius * 1.0, -radius * 0.8);
      shape.closePath();
      geo = new THREE.ShapeGeometry(shape);
    } else {
      // 드릴 비주얼: 삼각뿔(3면), 체감 크기 상향
      geo = new THREE.ConeGeometry(radius * 1.28, radius * 4.4, 3);
      geo.rotateX(Math.PI / 2);
    }
    const mat = new THREE.MeshBasicMaterial({ color });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.set(x, y, 1);
    mesh.rotation.z = Math.atan2(vy, vx);
    this.scene.add(mesh);

    const p: Projectile = {
      skillId, x, y, vx, vy, dmg, radius, life, piercing, hitIds: new Set(), mesh,
      homing, targetId, homingTurnRate,
    };
    this.projectiles.push(p);
    return p;
  }

  /** 화염장판 (molotov): 빈 링 → "위험 구역" 느낌 */
  private _spawnFlame(x: number, y: number, radius: number, dmg: number, life: number) {
    const geo = new THREE.RingGeometry(radius * 0.55, radius, 24);
    const mat = new THREE.MeshBasicMaterial({ color: 0xFF5500, transparent: true, opacity: 0.7, side: THREE.DoubleSide });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.set(x, y, 0.5);
    this.scene.add(mesh);
    this.flames.push({ x, y, radius, dmg, life, maxLife: life, tickTimer: 0, mesh, zoneType: 'fire', pulseTimer: 0 });
  }

  /** 폭발 flash (데미지 없음): 흰-노랑 확장 링 */
  private _spawnFlameExplosion(x: number, y: number, radius: number, _dmg: number, life: number) {
    const geo = new THREE.RingGeometry(radius * 0.3, radius, 20);
    const mat = new THREE.MeshBasicMaterial({ color: 0xFFEE44, transparent: true, opacity: 0.95, side: THREE.DoubleSide, depthWrite: false, blending: THREE.AdditiveBlending });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.set(x, y, 0.7);
    this.scene.add(mesh);
    this.flames.push({ x, y, radius, dmg: 0, life, maxLife: life, tickTimer: 999, mesh, zoneType: 'explosion', pulseTimer: 0 });
  }

  /** napalm: 더 넓은 두꺼운 링 + 보라-주황 색상으로 구분 */
  private _spawnNapalm(x: number, y: number, radius: number, dmg: number, life: number) {
    const geo = new THREE.RingGeometry(radius * 0.35, radius, 28);
    const mat = new THREE.MeshBasicMaterial({ color: 0xFF8800, transparent: true, opacity: 0.75, side: THREE.DoubleSide });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.set(x, y, 0.5);
    this.scene.add(mesh);
    this.flames.push({ x, y, radius, dmg, life, maxLife: life, tickTimer: 0, mesh, zoneType: 'napalm', pulseTimer: 0 });
  }

  /* ── 기본 공격 핸들러 (AUTO 타입) ── */

  /** 기본(무기 없음): 소형 총알 최근접 직진 */
  private _fireAutoBasic(px: number, py: number, dmg: number, spd: number, r: number, enemies: EnemyInstance[]) {
    const near = this._nearestEnemy(px, py, enemies);
    const ang = near ? Math.atan2(near.y - py, near.x - px) : 0;
    this._spawnProjectile('auto_basic', px, py, Math.cos(ang) * spd, Math.sin(ang) * spd,
      dmg, r, 1.8 * this.lifeMult, false, 0xAAAAFF);
  }

  /** 리볼버: 크고 묵직한 총알, 약한 유도 */
  private _fireAutoRevolver(px: number, py: number, dmg: number, spd: number, r: number, enemies: EnemyInstance[]) {
    const near = this._nearestEnemy(px, py, enemies);
    const ang = near ? Math.atan2(near.y - py, near.x - px) : 0;
    const p = this._spawnProjectile('auto_revolver', px + Math.cos(ang) * 14, py + Math.sin(ang) * 14,
      Math.cos(ang) * spd, Math.sin(ang) * spd,
      dmg, r, 2.2 * this.lifeMult, false, 0xFFDD88,
      true, near?.id, 0.06);
    p.maxRange = 320;
  }

  /** 샷건: 전방 3방향 부채꼴 — 약한 데미지, 근거리 범위 */
  private _fireAutoShotgun(px: number, py: number, vx: number, vy: number, dmg: number, spd: number, r: number, enemies: EnemyInstance[]) {
    let nx = vx, ny = vy;
    if (Math.abs(nx) < 0.01 && Math.abs(ny) < 0.01) {
      const near = this._nearestEnemy(px, py, enemies);
      if (near) { nx = near.x - px; ny = near.y - py; }
      else { nx = 1; ny = 0; }
    }
    const len = Math.sqrt(nx * nx + ny * ny) || 1;
    const baseAng = Math.atan2(ny / len, nx / len);
    for (const off of [-0.35, 0, 0.35]) {
      const a = baseAng + off;
      this._spawnProjectile('auto_shotgun',
        px + Math.cos(a) * 12, py + Math.sin(a) * 12,
        Math.cos(a) * spd, Math.sin(a) * spd,
        dmg, r, 1.4 * this.lifeMult, false, 0xFFB347);
    }
  }

  /** 드릴건: 전방 직진 관통, 튕김 없음 */
  private _fireAutoDrill(px: number, py: number, vx: number, vy: number, dmg: number, spd: number, r: number, enemies: EnemyInstance[]) {
    let nx = vx, ny = vy;
    if (Math.abs(nx) < 0.01 && Math.abs(ny) < 0.01) {
      const near = this._nearestEnemy(px, py, enemies);
      if (near) { nx = near.x - px; ny = near.y - py; }
      else { nx = 1; ny = 0; }
    }
    const len = Math.sqrt(nx * nx + ny * ny) || 1;
    nx /= len; ny /= len;
    this._spawnDrill('auto_drill', px, py, nx * spd, ny * spd,
      dmg, r, 2.5 * this.lifeMult, true, 0x00DDFF);
  }

  private _nearestEnemy(x: number, y: number, enemies: EnemyInstance[]): EnemyInstance | null {
    let nearest: EnemyInstance | null = null;
    let minD2 = Infinity;
    for (const e of enemies) {
      if (e.dead) continue;
      const dx = e.x - x;
      const dy = e.y - y;
      const d2 = dx * dx + dy * dy;
      if (d2 < minD2) { minD2 = d2; nearest = e; }
    }
    return nearest;
  }

  private _fireSoccerBall(px: number, py: number, vx: number, vy: number, dmg: number, spd: number, r: number) {
    let nx = vx, ny = vy;
    if (Math.abs(nx) < 0.01 && Math.abs(ny) < 0.01) { nx = 1; ny = 0; }
    const len = Math.sqrt(nx * nx + ny * ny);
    nx /= len; ny /= len;

    const base = Math.atan2(ny, nx);
    for (const off of [-0.18, 0.18]) {   // 처음부터 2개 (좌우로 벌려 발사)
      const a = base + off;
      const proj = this._spawnProjectile('soccer_ball', px, py, Math.cos(a) * spd, Math.sin(a) * spd, dmg, r, 4.0 * this.lifeMult, false, 0x39FF14);
      proj.bounces = 6;
    }
  }

  private _fireDrillShot(px: number, py: number, vx: number, vy: number, dmg: number, spd: number, r: number) {
    let nx = vx, ny = vy;
    if (Math.abs(nx) < 0.01 && Math.abs(ny) < 0.01) { nx = 1; ny = 0; }
    const len = Math.sqrt(nx * nx + ny * ny);
    nx /= len; ny /= len;

    // 드릴 크기 1.5배 상향하여 식별력 극대화, 탕탕특공대의 청록 네온 적용
    const slowSpd = spd * this._sr('drill_speed_mult', 0.5);
    const base = Math.atan2(ny, nx);
    for (const off of this._srl('drill_shot_offsets', [-0.16, 0.16])) {
      const a = base + off;
      this._spawnDrill('drill_shot', px, py, Math.cos(a) * slowSpd, Math.sin(a) * slowSpd, dmg, r * this._sr('drill_radius_mult', 2.8), this._sr('drill_life_mult', 5) * this.lifeMult, true, 0x00FFFF);
    }
  }

  private _fireDimensionalBlade(px: number, py: number, vx: number, vy: number, dmg: number, r: number) {
    let nx = vx, ny = vy;
    if (Math.abs(nx) < 0.01 && Math.abs(ny) < 0.01) { nx = 1; ny = 0; }
    const len = Math.sqrt(nx * nx + ny * ny);
    nx /= len; ny /= len;

    const baseAngle = Math.atan2(ny, nx);
    const speed = this._sr('dimensional_speed', 5.5);

    for (const angleOffset of this._srl('dimensional_angle_offsets', [-0.22, 0, 0.22])) {
      const angle = baseAngle + angleOffset;
      const rx = Math.cos(angle);
      const ry = Math.sin(angle);

      // 크기와 수명을 조절하여 과도하게 화면을 가리는 현상 해결 및 휜 네온 참격(RingGeometry) 구현
      const R = r * this._sr('dimensional_radius_mult', 2.2);
      const width = this._sr('dimensional_blade_width', 2);
      const geo = new THREE.RingGeometry(R - width/2, R + width/2, 16, 1, -Math.PI / 6, Math.PI / 3);
      geo.translate(-R, 0, 0);

      const mat = new THREE.MeshBasicMaterial({
        color: 0xFF1493,
        side: THREE.DoubleSide,
      });
      const mesh = new THREE.Mesh(geo, mat);
      mesh.position.set(px, py, 1);
      mesh.rotation.z = angle;
      this.scene.add(mesh);

      this.projectiles.push({
        skillId: 'dimensional_blade',
        x: px, y: py,
        vx: rx * speed, vy: ry * speed,
        dmg: dmg * this._sr('dimensional_dmg_ratio', 0.85),
        radius: r * this._sr('dimensional_hit_radius_ratio', 0.8),
        life: this._sr('dimensional_life_mult', 0.45) * this.lifeMult,
        piercing: true,
        hitIds: new Set(),
        mesh,
      });
    }
  }

  private _fireQuantumBall(px: number, py: number, vx: number, vy: number, dmg: number, spd: number, r: number) {
    let nx = vx, ny = vy;
    if (Math.abs(nx) < 0.01 && Math.abs(ny) < 0.01) { nx = 1; ny = 0; }
    const len = Math.sqrt(nx * nx + ny * ny);
    nx /= len; ny /= len;

    const fastSpd = spd * this._sr('quantum_speed_mult', 1.5);
    const proj = this._spawnProjectile(
      'quantum_ball', px, py, nx * fastSpd, ny * fastSpd,
      dmg * this._sr('quantum_dmg_ratio', 1.1), r * this._sr('quantum_radius_mult', 1.1),
      this._sr('quantum_life_mult', 5) * this.lifeMult, false, 0xFF007F,
    );
    proj.bounces = Math.floor(this._sr('quantum_bounce_count', 9));
  }

  private _spawnQuantumMini(x: number, y: number, dmg: number, speed: number, r: number) {
    const miniN = Math.floor(this._sr('quantum_mini_spawn_count', 2));
    for (let i = 0; i < miniN; i++) {
      const angle = Math.random() * Math.PI * 2;
      const vx = Math.cos(angle) * speed;
      const vy = Math.sin(angle) * speed;
      const proj = this._spawnProjectile(
        'quantum_mini', x, y, vx, vy,
        dmg * this._sr('quantum_mini_dmg_ratio', 0.45), r * this._sr('quantum_mini_radius_ratio', 0.55),
        this._sr('quantum_mini_life_mult', 2.5) * this.lifeMult, false, 0xCC55FF,
      );
      proj.bounces = Math.floor(this._sr('quantum_mini_bounce_count', 3));
      proj.isMini = true;
    }
  }

  private _fireWhistlingArrow(px: number, py: number, dmg: number, spd: number, r: number, enemies: EnemyInstance[]) {
    const nearest = this._nearestEnemy(px, py, enemies);
    if (!nearest) return;
    const dx = nearest.x - px;
    const dy = nearest.y - py;
    const d = Math.sqrt(dx * dx + dy * dy) || 1;

    // 휘파람 화살도 원뿔 드릴 형태로 큼직하게 렌더링
    this._spawnDrill(
      'whistling_arrow', px, py,
      (dx / d) * spd * this._sr('whistling_speed_mult', 1.4), (dy / d) * spd * this._sr('whistling_speed_mult', 1.4),
      dmg * this._sr('whistling_dmg_ratio', 0.9), r * this._sr('whistling_radius_mult', 1.3),
      this._sr('whistling_life_mult', 6) * this.lifeMult,
      true, 0xFFD700,
      true, nearest.id, this._sr('whistling_turn_rate', 0.22),
    );
  }

  private _fireVoidSlash(px: number, py: number, dmg: number, r: number) {
    const count = Math.floor(this._sr('void_slash_count', 12));
    const speed = this._sr('void_slash_speed', 3.2);
    const jitter = this._sr('void_slash_angle_jitter', 0.15);
    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2 + (Math.random() - 0.5) * jitter;
      const nx = Math.cos(angle);
      const ny = Math.sin(angle);

      // 차원 참격 크기 및 진행 길이 조율 및 휜 네온 참격(RingGeometry) 구현
      const R = r * this._sr('void_slash_radius_mult', 3.5);
      const width = this._sr('void_slash_width', 3.2);
      const geo = new THREE.RingGeometry(R - width/2, R + width/2, 16, 1, -Math.PI / 6, Math.PI / 3);
      geo.translate(-R, 0, 0);

      const mat = new THREE.MeshBasicMaterial({
        color: 0xCC55FF,
        side: THREE.DoubleSide,
      });
      const mesh = new THREE.Mesh(geo, mat);
      mesh.position.set(px, py, 1);
      mesh.rotation.z = angle;
      this.scene.add(mesh);

      this.projectiles.push({
        skillId: 'void_slash',
        x: px, y: py,
        vx: nx * speed, vy: ny * speed,
        dmg: dmg * this._sr('void_slash_dmg_ratio', 1.35),
        radius: r * this._sr('void_slash_hit_radius_ratio', 0.6),
        life: this._sr('void_slash_life_mult', 0.8) * this.lifeMult,
        piercing: true,
        hitIds: new Set(),
        mesh,
      });
    }
  }

  dispose() {
    for (const p of this.projectiles) this.scene.remove(p.mesh);
    for (const f of this.flames)      this.scene.remove(f.mesh);
    for (const b of this.guardians)   this.scene.remove(b.mesh);
    for (const d of this.drones)      this.scene.remove(d.mesh);
    for (const a of this.debuffAuras) this.scene.remove(a.mesh);
    for (const b of this.expireBursts) this.scene.remove(b.mesh);
    for (const m of this.mines)       this.scene.remove(m.mesh);
    for (const m of this.meteors)     { this.scene.remove(m.mesh); this.scene.remove(m.warningMesh); }
    this.expireBursts.length = 0;
    this.projectiles.length = 0;
    this.flames.length = 0;
    this.guardians.length = 0;
    this.drones.length = 0;
    this.debuffAuras.length = 0;
    this.mines.length = 0;
    this.meteors.length = 0;
    this.dronePhase = 'active';
    this.dronePhaseTimer = 0;
    this.droneFireTimer = 0;
    this.equipped.clear();
  }
}
