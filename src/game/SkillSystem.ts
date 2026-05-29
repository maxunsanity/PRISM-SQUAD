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
  tickTimer: number;
  mesh: THREE.Mesh;
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
  private flames: FlameZone[] = [];
  private guardians: GuardianBlade[] = [];
  private drones: DroneUnit[] = [];
  private guardianAngle = 0;
  private pendingClusters: ClusterSpawn[] = [];
  private dronePhase: 'active' | 'rest' = 'active';
  private dronePhaseTimer = 0;
  private droneFireTimer = 0;
  private debuffAuras: { mesh: THREE.Mesh; life: number; maxLife: number; radius: number; dmg: number; tickTimer: number }[] = [];

  /** 패시브 배율 — GameCore에서 setPassive()로 설정 */
  private areaMult = 1.0;   // highFuel: 화염/폭발 반경
  private lifeMult = 1.0;   // exoskeleton: 투사체 수명

  /** 적 피격 결과: [enemyId, dmg][] — tick() 후 GameCore가 읽음 */
  readonly hitResults: [number, number][] = [];

  constructor(scene: THREE.Scene, data: GameData) {
    this.scene = scene;
    this.data = data;
  }

  /* ── 패시브 효과 주입 ── */
  setPassive(key: 'areaMult' | 'lifeMult', value: number) {
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
    const levelCfg = levels.find(l => l.level === level) ?? levels[levels.length - 1] ?? levels[0];
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
      if (skillId === 'drone') {
        this._rebuildDrones(levelCfg.level);
      }
    } else {
      this.equipped.set(skillId, { cfg: evoCfg, levelCfg, cooldownTimer: 0 });
      if (skillId === 'guardian' || skillId === 'eternal_guardian') {
        this._rebuildGuardians(evoCfg, levelCfg, skillId === 'eternal_guardian');
      }
      if (skillId === 'drone') {
        this._rebuildDrones(levelCfg.level);
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

    for (const [id, eq] of this.equipped) {
      if (eq.cfg.skill_type !== 'ACTIVE') continue;
      if (id === 'drone') {
        this._tickDroneWeapon(dt, eq.levelCfg.level, eq, enemies, px, py, boss);
        continue;
      }
      if (eq.cooldownTimer > 0) { eq.cooldownTimer -= dt; continue; }
      const cooldown = (eq.cfg.base_cooldown_frames / 60) * (1 - eq.levelCfg.cooldown_reduce_rate);
      eq.cooldownTimer = cooldown;
      this._fire(id, eq, px, py, vx, vy, enemies);
    }

    this._tickProjectiles(dt, px, py, enemies);
    this._tickFlames(dt, enemies);
    this._tickGuardians(dt, px, py, enemies);
    this._tickDrones(dt, px, py);
    this._tickDebuffAuras(dt, px, py, enemies);
  }

  private _getDroneCycle(level: number): { activeSec: number; restSec: number } {
    const activeSec = 3;
    const restSec = Math.max(0, 7 - (level - 1)); // Lv1=7, Lv2=6 ... Lv5=3
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
        this.droneFireTimer += 0.18; // 기관총 느낌 연사
        this._fireDrone(
          px, py,
          eq.cfg.base_dmg_mult * eq.levelCfg.dmg_mult_scale * 10,
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
          this._spawnFlame(p.x, p.y, p.radius * 3 * this.areaMult, p.dmg * 0.8, 0.6);
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
    const dmg = eq.cfg.base_dmg_mult * eq.levelCfg.dmg_mult_scale * 10;
    const spd = eq.cfg.projectile_speed;
    const r   = eq.cfg.projectile_radius;

    switch (id) {
      case 'kunai':           this._fireKunai(px, py, dmg, spd, r, enemies); break;
      case 'boomerang':       this._fireBoomerang(px, py, vx, vy, dmg, spd, r); break;
      case 'molotov':         this._fireMolotov(eq, dmg, enemies); break;
      case 'rocket':          this._fireRocket(px, py, dmg, spd, r, enemies); break;
      case 'drone':           this._fireDrone(px, py, dmg, spd, r, enemies); break;
      case 'soccer_ball':     this._fireSoccerBall(px, py, vx, vy, dmg, spd, r); break;
      case 'drill_shot':      this._fireDrillShot(px, py, vx, vy, dmg, spd, r); break;
      case 'dimensional_blade': this._fireDimensionalBlade(px, py, vx, vy, dmg, r); break;
      case 'debuff_aura':       this._fireDebuffAura(px, py, dmg, r); break;
      /* ── 진화 스킬 ── */
      case 'ghost_shuriken':  this._fireGhostShuriken(px, py, dmg, spd, r, enemies); break;
      case 'twin_boomerang':  this._fireTwinBoomerang(px, py, vx, vy, dmg, spd, r); break;
      case 'napalm':          this._fireNapalm(eq, dmg, enemies); break;
      case 'eternal_guardian': break; /* 리빌드는 equipSkill에서 처리 */
      case 'cluster_rocket':  this._fireClusterRocket(px, py, dmg, spd, r, enemies); break;
      case 'quantum_ball':    this._fireQuantumBall(px, py, vx, vy, dmg, spd, r); break;
      case 'whistling_arrow': this._fireWhistlingArrow(px, py, dmg, spd, r, enemies); break;
      case 'void_slash':      this._fireVoidSlash(px, py, dmg, r); break;
      default: break;
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

    this.debuffAuras.push({
      mesh,
      life: 1.5 * this.lifeMult,
      maxLife: 1.5 * this.lifeMult,
      radius,
      dmg,
      tickTimer: 0.1
    });
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
      const currentScale = 0.4 + ratio * 0.6;
      aura.mesh.scale.set(currentScale, currentScale, 1);
      aura.mesh.rotation.z += dt * 3;
      
      const mat = aura.mesh.material as THREE.MeshBasicMaterial;
      mat.opacity = 0.3 + Math.sin(performance.now() * 0.015) * 0.25;

      aura.tickTimer -= dt;
      if (aura.tickTimer <= 0) {
        aura.tickTimer = 0.15;
        const r2 = (aura.radius * currentScale) * (aura.radius * currentScale);
        for (const e of enemies) {
          if (e.dead) continue;
          const dx = e.x - px;
          const dy = e.y - py;
          if (dx * dx + dy * dy <= r2) {
            e.slowTimer = 0.4;
            this.hitResults.push([e.id, aura.dmg * 0.15]);
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

  private _fireMolotov(eq: EquippedSkill, dmg: number, enemies: EnemyInstance[]) {
    const baseRadius = eq.cfg.projectile_radius * this.areaMult;
    let fx: number, fy: number;
    const alive = enemies.filter(e => !e.dead);
    if (alive.length > 0) {
      const t = alive[Math.floor(Math.random() * alive.length)];
      fx = t.x + (Math.random() - 0.5) * 40;
      fy = t.y + (Math.random() - 0.5) * 40;
    } else {
      fx = (Math.random() - 0.5) * 200;
      fy = (Math.random() - 0.5) * 200;
    }
    this._spawnFlame(fx, fy, baseRadius, dmg * 0.5, 3.0 * this.lifeMult);
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
        this._spawnProjectile(
          'drone', sx, sy,
          (dx / d) * spd * 1.2, (dy / d) * spd * 1.2,
          dmg * 0.55, r * 0.6, 3.2 * this.lifeMult,
          false, 0xff533d,
          alive.length > 0, alive.length > 0 ? alive[i % alive.length].id : undefined, 0.08,
        );
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
      const d = Math.sqrt(dx * dx + dy * dy) || 1;
      this._spawnProjectile(
        'drone',
        sx, sy,
        (dx / d) * spd * 1.35,
        (dy / d) * spd * 1.35,
        dmg * 0.55,
        r * 0.6,
        3.2 * this.lifeMult,
        false,
        0xff533d,
        alive.length > 0,
        targetId,
        0.08,
      );
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
    const spawnOffset = 18;
    /* 세 방향: 정면, ±22.5° */
    for (const offset of [0, Math.PI / 8, -Math.PI / 8]) {
      const a = baseAngle + offset;
      this._spawnProjectile(
        'ghost_shuriken',
        px + Math.cos(a) * spawnOffset, py + Math.sin(a) * spawnOffset,
        Math.cos(a) * spd * 1.3, Math.sin(a) * spd * 1.3,
        dmg * 0.8, r, 3.0 * this.lifeMult, true, 0xAAEEFF,
      );
    }
  }

  /** twin_boomerang: 전방 + 후방 동시 발사, 고속 */
  private _fireTwinBoomerang(px: number, py: number, vx: number, vy: number, dmg: number, spd: number, r: number) {
    let nx = vx, ny = vy;
    if (Math.abs(nx) < 0.01 && Math.abs(ny) < 0.01) { nx = 1; ny = 0; }
    const len = Math.sqrt(nx * nx + ny * ny);
    nx /= len; ny /= len;
    const fastSpd = spd * 1.6;
    const life = 1.6 * this.lifeMult;

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
    const baseRadius = eq.cfg.projectile_radius * this.areaMult * 2.0;
    let fx: number, fy: number;
    const alive = enemies.filter(e => !e.dead);
    if (alive.length > 0) {
      const t = alive[Math.floor(Math.random() * alive.length)];
      fx = t.x + (Math.random() - 0.5) * 30;
      fy = t.y + (Math.random() - 0.5) * 30;
    } else {
      fx = (Math.random() - 0.5) * 200;
      fy = (Math.random() - 0.5) * 200;
    }
    this._spawnNapalm(fx, fy, baseRadius, dmg * 0.6, 9.0 * this.lifeMult);
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
      dmg, r, 3.5 * this.lifeMult, false, 0xFF4400,
    );
  }

  /* ── 투사체 틱 ── */
  private _tickProjectiles(dt: number, px: number, py: number, enemies: EnemyInstance[]) {
    const toRemove: number[] = [];

    for (let i = 0; i < this.projectiles.length; i++) {
      const p = this.projectiles[i];
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
            speed = Math.min(22.0, speed + dt * 18);
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
          /* 드론 미사일: 타겟 사망 시 처리 */
          if (p.lockX !== undefined && p.lockY !== undefined) {
            /* 마지막 위치로 직진 후 도착 시 폭발 */
            const lx = p.lockX - p.x;
            const ly = p.lockY - p.y;
            const ld = Math.sqrt(lx * lx + ly * ly);
            if (ld < 20) {
              /* 목표 위치 도착 → 폭발 */
              this._spawnFlame(p.x, p.y, p.radius * 3.5 * this.areaMult, p.dmg * 0.8, 0.5);
              toRemove.push(i);
              continue;
            }
            /* 목표 방향으로 속도 재설정하고 homing 해제 (이후 직선 비행) */
            const speed = Math.sqrt(p.vx * p.vx + p.vy * p.vy) || (8.0 * 1.35);
            p.vx = (lx / ld) * speed;
            p.vy = (ly / ld) * speed;
            p.homing = false;
          } else {
            /* 처음부터 타겟이 없었던 경우 → 즉시 폭발 */
            this._spawnFlame(p.x, p.y, p.radius * 3.5 * this.areaMult, p.dmg * 0.8, 0.5);
            toRemove.push(i);
            continue;
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
              const newSpeed = Math.min(22.0, speed + dt * 18);
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

      p.x += p.vx * 60 * dt;
      p.y += p.vy * 60 * dt;

      // 1) 드릴샷 맵 경계 반사 체크
      if (p.skillId === 'drill_shot' || p.skillId === 'whistling_arrow') {
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

      // 2) 축구공류 화면 크기 기준 반사 체크 (맵 기준으로 넓게)
      if (p.skillId === 'soccer_ball' || p.skillId === 'quantum_ball' || p.skillId === 'quantum_mini') {
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
        p.mesh.rotation.z += dt * 18.0;
      }

      // 드릴샷: 회전 없이 진행 방향만 유지
      if (p.skillId === 'drill_shot') {
        p.mesh.rotation.z = Math.atan2(p.vy, p.vx);
      }

      // 휘파람 화살: 유도탄이라 진행 방향 정렬 위주
      if (p.skillId === 'whistling_arrow') {
        p.mesh.rotation.z = Math.atan2(p.vy, p.vx);
        p.mesh.rotation.y += dt * 14.0;
      }

      if (p.skillId === 'dimensional_blade' || p.skillId === 'void_slash') {
        p.mesh.rotation.z += dt * 7.5;
        const maxLife = p.skillId === 'void_slash' ? (0.8 * this.lifeMult) : (0.45 * this.lifeMult);
        const scale = 1.0 + (1.0 - Math.max(0, p.life) / maxLife) * 0.35; // 팽창 배율 완화
        p.mesh.scale.set(scale, scale, 1);
      }

      for (const e of enemies) {
        if (e.dead) continue;
        if (p.hitIds.has(e.id)) continue;
        const dx = e.x - p.x;
        const dy = e.y - p.y;
        const minD = e.cfg.radius + p.radius;
        if (dx * dx + dy * dy < minD * minD) {
          this.hitResults.push([e.id, p.dmg]);
          p.hitIds.add(e.id);

          if (p.skillId === 'rocket') {
            this._spawnFlame(p.x, p.y, p.radius * 3 * this.areaMult, p.dmg * 0.8, 0.6);
          }
          if (p.skillId === 'cluster_rocket') {
            this._spawnFlame(p.x, p.y, p.radius * 3 * this.areaMult, p.dmg * 0.8, 0.6);
            this.pendingClusters.push({ x: p.x, y: p.y, dmg: p.dmg * 0.45 });
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
              this._spawnQuantumMini(p.x, p.y, p.dmg * 0.45, speed * 1.15, p.radius * 0.55);
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
    for (const c of this.pendingClusters) {
      for (let i = 0; i < 3; i++) {
        const angle = (i / 3) * Math.PI * 2 + Math.random() * 0.5;
        this._spawnProjectile(
          'cluster_mini', c.x, c.y,
          Math.cos(angle) * 10, Math.sin(angle) * 10,
          c.dmg, 4, 1.4 * this.lifeMult, false, 0xFF9933,
        );
      }
    }
    this.pendingClusters.length = 0;
  }

  /* ── 화염 장판 틱 ── */
  private _tickFlames(dt: number, enemies: EnemyInstance[]) {
    const toRemove: number[] = [];

    for (let i = 0; i < this.flames.length; i++) {
      const f = this.flames[i];
      f.life -= dt;
      if (f.life <= 0) { toRemove.push(i); continue; }

      f.tickTimer -= dt;
      if (f.tickTimer <= 0) {
        f.tickTimer = 0.5;
        for (const e of enemies) {
          if (e.dead) continue;
          const dx = e.x - f.x;
          const dy = e.y - f.y;
          if (dx * dx + dy * dy <= f.radius * f.radius) {
            this.hitResults.push([e.id, f.dmg]);
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

  /* ── 가디언 공전 틱 ── */
  private _tickGuardians(dt: number, px: number, py: number, enemies: EnemyInstance[]) {
    if (this.guardians.length === 0) return;
    this.guardianAngle += dt * 2.5;

    for (let g = 0; g < this.guardians.length; g++) {
      const blade = this.guardians[g];
      const angle = this.guardianAngle + (g / this.guardians.length) * Math.PI * 2;
      const bx = px + Math.cos(angle) * blade.orbitRadius;
      const by = py + Math.sin(angle) * blade.orbitRadius;
      blade.mesh.position.set(bx, by, 2);
      blade.mesh.rotation.z = angle;

      blade.tickTimer -= dt;
      if (blade.tickTimer <= 0) {
        blade.tickTimer = 0.3;
        blade.hitIds.clear();
      }

      for (const e of enemies) {
        if (e.dead || blade.hitIds.has(e.id)) continue;
        const dx = e.x - bx;
        const dy = e.y - by;
        const minD = e.cfg.radius + 8;
        if (dx * dx + dy * dy < minD * minD) {
          this.hitResults.push([e.id, blade.dmg]);
          blade.hitIds.add(e.id);
        }
      }
    }
  }

  private _rebuildDrones(level: number) {
    for (const d of this.drones) this.scene.remove(d.mesh);
    this.drones.length = 0;
    void level;
    // 요청사항: 드론은 1개만, 캐릭터보다 작은 네모 형태
    const geo = new THREE.BoxGeometry(9, 9, 4);
    const mat = new THREE.MeshBasicMaterial({ color: 0xFF6B2B });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.set(0, 0, 8);
    this.scene.add(mesh);
    this.drones.push({
      bobPhase: Math.random() * Math.PI * 2,
      offsetX: 30,
      offsetY: 24,
      mesh,
    });
    // 레벨 상승 시 즉시 사이클 규칙 재적용
    this.dronePhase = 'active';
    this.dronePhaseTimer = 0;
    this.droneFireTimer = 0;
  }

  private _tickDrones(dt: number, px: number, py: number) {
    if (this.drones.length === 0) return;
    for (const d of this.drones) {
      d.bobPhase += dt * 4.0;
      const x = px + d.offsetX;
      const y = py + d.offsetY;
      const z = 8 + Math.sin(d.bobPhase) * 1.0;
      d.mesh.position.set(x, y, z);
      d.mesh.rotation.z = 0.15 + Math.sin(d.bobPhase * 0.6) * 0.08;
    }
  }

  /* ── 가디언 블레이드 재구성 ── */
  private _rebuildGuardians(cfg: SkillConfig, levelCfg: SkillLevelConfig, eternal = false) {
    for (const b of this.guardians) this.scene.remove(b.mesh);
    this.guardians.length = 0;

    /* eternal: 블레이드 수 최대 5, 더 큰 궤도, 높은 데미지 */
    // 레벨업마다 체감되게 1개씩 증가 (최대 5)
    const count  = eternal ? 5 : Math.min(5, Math.max(1, levelCfg.level));
    const dmg    = cfg.base_dmg_mult * levelCfg.dmg_mult_scale * (eternal ? 14 : 8);
    // 오빠 피드백 반영: 공전 반경 10% 추가 확장
    const orbitR = ((eternal ? 74 : 52) + levelCfg.level * (eternal ? 4 : 3)) * 1.1;
    // 피아 식별을 위해 색상을 네온 골드로 고정
    const color  = 0xFFD600;

    for (let i = 0; i < count; i++) {
      // 블레이드 3D 메쉬 크기
      const geo  = new THREE.BoxGeometry(eternal ? 19 : 14, 5, 2.5);
      const mat  = new THREE.MeshBasicMaterial({ color });
      const mesh = new THREE.Mesh(geo, mat);
      this.scene.add(mesh);
      this.guardians.push({ angle: (i / count) * Math.PI * 2, orbitRadius: orbitR, dmg, tickTimer: 0.3, hitIds: new Set(), mesh });
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
    const p: Projectile = {
      skillId, x, y, vx, vy, dmg, radius, life, piercing, hitIds: new Set(), mesh,
      homing, targetId, homingTurnRate,
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

  private _spawnFlame(x: number, y: number, radius: number, dmg: number, life: number) {
    const geo  = new THREE.CircleGeometry(radius, 12);
    const mat  = new THREE.MeshBasicMaterial({ color: 0xFF4400, transparent: true, opacity: 0.5, side: THREE.DoubleSide });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.set(x, y, 0.5);
    this.scene.add(mesh);
    this.flames.push({ x, y, radius, dmg, life, tickTimer: 0, mesh });
  }

  /** napalm 전용: 더 선명한 오렌지 불꽃 */
  private _spawnNapalm(x: number, y: number, radius: number, dmg: number, life: number) {
    const geo  = new THREE.CircleGeometry(radius, 16);
    const mat  = new THREE.MeshBasicMaterial({ color: 0xFF7700, transparent: true, opacity: 0.65, side: THREE.DoubleSide });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.set(x, y, 0.5);
    this.scene.add(mesh);
    this.flames.push({ x, y, radius, dmg, life, tickTimer: 0, mesh });
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

    const proj = this._spawnProjectile('soccer_ball', px, py, nx * spd, ny * spd, dmg, r, 4.0 * this.lifeMult, false, 0x39FF14);
    proj.bounces = 6;
  }

  private _fireDrillShot(px: number, py: number, vx: number, vy: number, dmg: number, spd: number, r: number) {
    let nx = vx, ny = vy;
    if (Math.abs(nx) < 0.01 && Math.abs(ny) < 0.01) { nx = 1; ny = 0; }
    const len = Math.sqrt(nx * nx + ny * ny);
    nx /= len; ny /= len;

    // 드릴 크기 1.5배 상향하여 식별력 극대화, 탕탕특공대의 청록 네온 적용
    const slowSpd = spd * 0.5;
    this._spawnDrill('drill_shot', px, py, nx * slowSpd, ny * slowSpd, dmg, r * 2.8, 5.0 * this.lifeMult, true, 0x00FFFF);
  }

  private _fireDimensionalBlade(px: number, py: number, vx: number, vy: number, dmg: number, r: number) {
    let nx = vx, ny = vy;
    if (Math.abs(nx) < 0.01 && Math.abs(ny) < 0.01) { nx = 1; ny = 0; }
    const len = Math.sqrt(nx * nx + ny * ny);
    nx /= len; ny /= len;

    const baseAngle = Math.atan2(ny, nx);
    const speed = 5.5; // 속도를 상향하여 시원하게 관통

    // 3연발 콤팩트한 부채꼴 네온 핑크 참격
    for (const angleOffset of [-0.22, 0, 0.22]) {
      const angle = baseAngle + angleOffset;
      const rx = Math.cos(angle);
      const ry = Math.sin(angle);

      // 크기와 수명을 조절하여 과도하게 화면을 가리는 현상 해결 및 휜 네온 참격(RingGeometry) 구현
      const R = r * 2.2;
      const width = 2.0;
      const geo = new THREE.RingGeometry(R - width/2, R + width/2, 16, 1, -Math.PI / 6, Math.PI / 3);
      geo.translate(-R, 0, 0); // 로컬 원점을 참격 본체 중심으로 이동

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
        dmg: dmg * 0.85,
        radius: r * 0.8,
        life: 0.45 * this.lifeMult, // 수명 0.45초로 짧게
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

    const fastSpd = spd * 1.5;
    const proj = this._spawnProjectile('quantum_ball', px, py, nx * fastSpd, ny * fastSpd, dmg * 1.1, r * 1.1, 5.0 * this.lifeMult, false, 0xFF007F);
    proj.bounces = 9;
  }

  private _spawnQuantumMini(x: number, y: number, dmg: number, speed: number, r: number) {
    for (let i = 0; i < 2; i++) {
      const angle = Math.random() * Math.PI * 2;
      const vx = Math.cos(angle) * speed;
      const vy = Math.sin(angle) * speed;
      const proj = this._spawnProjectile('quantum_mini', x, y, vx, vy, dmg, r, 2.5 * this.lifeMult, false, 0xCC55FF);
      proj.bounces = 3;
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
      (dx / d) * spd * 1.4, (dy / d) * spd * 1.4,
      dmg * 0.9, r * 1.3, 6.0 * this.lifeMult,
      true, 0xFFD700,
      true, nearest.id, 0.22,
    );
  }

  private _fireVoidSlash(px: number, py: number, dmg: number, r: number) {
    const count = 12;
    const speed = 3.2;
    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2 + (Math.random() - 0.5) * 0.15;
      const nx = Math.cos(angle);
      const ny = Math.sin(angle);

      // 차원 참격 크기 및 진행 길이 조율 및 휜 네온 참격(RingGeometry) 구현
      const R = r * 3.5;
      const width = 3.2;
      const geo = new THREE.RingGeometry(R - width/2, R + width/2, 16, 1, -Math.PI / 6, Math.PI / 3);
      geo.translate(-R, 0, 0); // 로컬 원점을 참격 본체 중심으로 이동

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
        dmg: dmg * 1.35,
        radius: r * 1.2,
        life: 0.8 * this.lifeMult,
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
    this.projectiles.length = 0;
    this.flames.length = 0;
    this.guardians.length = 0;
    this.drones.length = 0;
    this.debuffAuras.length = 0;
    this.dronePhase = 'active';
    this.dronePhaseTimer = 0;
    this.droneFireTimer = 0;
    this.equipped.clear();
  }
}
