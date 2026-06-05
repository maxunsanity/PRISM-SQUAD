/**
 * BossController.ts — 라바 퀘스트 보스 (보스별 고유 패턴)
 * 수치 SSoT: boss_config.csv + boss_pattern_config.csv
 */
import * as THREE from 'three';
import type { BossConfig, BossPatternTable } from './data';
import { bossPatternList, bossPatternNum } from './data';
import { createBossMesh, createPuddleMesh, type EnemyMeshHandle } from '../three/EnemyMesh';

type BossKind = 'titan' | 'crusher' | 'nexus';

interface Puddle {
  x: number; y: number; radius: number;
  dmg: number; life: number; tickTimer: number;
  mesh: THREE.Mesh;
}

/** GameCore가 읽어서 EnemySystem.fireHomingMissile()로 처리 */
export interface PendingMissile {
  sx: number; sy: number; angle: number;
  speed: number; turnRate: number; maxRange: number; dmg: number;
}

export class BossController {
  private scene: THREE.Scene;
  cfg: BossConfig;
  private patterns: BossPatternTable;
  private kind: BossKind = 'titan';

  private handle: EnemyMeshHandle | null = null;
  private puddles: Puddle[] = [];
  private puddleTimer = 0;
  private skillSpinTimer = 0;
  private phase = 1;

  private missileTimer = 0;
  private chargeTimer = 0;
  private charging = false;
  private chargeVx = 0;
  private chargeVy = 0;

  hp: number;
  maxHp: number;
  x = 0;
  y = 0;
  alive = false;

  frameDmg = 0;
  contactTimer = 0;

  readonly pendingMissiles: PendingMissile[] = [];

  constructor(scene: THREE.Scene, cfg: BossConfig, patterns: BossPatternTable) {
    this.scene = scene;
    this.cfg = cfg;
    this.patterns = patterns;
    this.hp = cfg.hp;
    this.maxHp = cfg.hp;
    this.kind = this._resolveKind(cfg);
  }

  private _bp(key: string, def: number): number {
    return bossPatternNum(this.patterns, this.cfg.boss_id, key, def);
  }

  private _bpList(key: string, def: number[]): number[] {
    return bossPatternList(this.patterns, this.cfg.boss_id, key, def);
  }

  private _resolveKind(cfg: BossConfig): BossKind {
    if (cfg.boss_id === 'crusher') return 'crusher';
    if (cfg.boss_id === 'nexus') return 'nexus';
    return 'titan';
  }

  reconfigure(cfg: BossConfig) {
    this.cfg = cfg;
    this.hp = cfg.hp;
    this.maxHp = cfg.hp;
    this.kind = this._resolveKind(cfg);
  }

  start(spawnX: number, spawnY: number) {
    this.x = spawnX; this.y = spawnY;
    this.hp = this.maxHp;
    this.alive = true;
    this.phase = 1;
    this.puddleTimer = 0;
    this.skillSpinTimer = 0;
    this.contactTimer = 0;
    this.missileTimer = this.kind === 'nexus' ? 1.0 : 0;
    const crusherIntro = this._bp('intro_charge_delay_sec', 1.5);
    this.chargeTimer = this.kind === 'crusher'
      ? -(crusherIntro + Math.random())
      : -(this._bp('phase3_intro_charge_delay_sec', 3) + Math.random() * 2);
    this.charging = false;
    this.pendingMissiles.length = 0;
    this.handle = createBossMesh(this.cfg, this.scene);
    this.handle.group.position.set(spawnX, spawnY, 0);
  }

  tick(dt: number, px: number, py: number, playerRadius: number): number {
    if (!this.alive || !this.handle) return 0;
    this.frameDmg = 0;
    this.pendingMissiles.length = 0;

    const dx = px - this.x;
    const dy = py - this.y;
    const dist = Math.sqrt(dx * dx + dy * dy);

    if (this.kind === 'crusher') return this._tickCrusher(dt, px, py, playerRadius, dx, dy, dist);
    if (this.kind === 'nexus') return this._tickNexus(dt, px, py, playerRadius, dx, dy, dist);

    const hpPct = this.hp / this.maxHp;
    const phase2Pct = this._bp('phase2_hp_pct', 0.7);
    const phase3Pct = this._bp('phase3_hp_pct', 0.4);

    if (this.phase === 1 && hpPct < phase2Pct) {
      this.phase = 2;
      this.missileTimer = this._bp('phase2_intro_missile_delay_sec', 2);
      const flashN = Math.floor(this._bp('phase2_flash_count', 3));
      const flashMs = this._bp('phase2_flash_interval_ms', 200);
      for (let f = 0; f < flashN; f++) {
        window.setTimeout(() => this.handle?.flashHit(), f * flashMs);
      }
    }
    if (this.phase === 2 && hpPct < phase3Pct) {
      this.phase = 3;
      this.chargeTimer = -(this._bp('phase3_intro_charge_delay_sec', 1.5) + Math.random());
      const flashN = Math.floor(this._bp('phase3_flash_count', 5));
      const flashMs = this._bp('phase3_flash_interval_ms', 150);
      for (let f = 0; f < flashN; f++) {
        window.setTimeout(() => this.handle?.flashHit(), f * flashMs);
      }
    }

    const speedMult = this.phase === 3 ? this._bp('phase3_speed_mult', 1.5) : 1.0;
    const chargeEnd = this._bp('charge_end_sec', -0.35);
    const chargePrep = this._bp('charge_prep_sec', -0.25);
    const chargeCoolMin = this._bp('charge_cool_min_sec', 1.3);
    const chargeCoolRand = this._bp('charge_cool_rand_sec', 1.4);
    const chargeSpdMult = this._bp('charge_speed_mult', 4);

    if (this.phase === 3) {
      this.chargeTimer -= dt;
      if (this.charging) {
        const chargeSpd = this.cfg.speed * speedMult * chargeSpdMult * 60 * dt;
        this.x += this.chargeVx * chargeSpd;
        this.y += this.chargeVy * chargeSpd;
        this.handle.group.position.set(this.x, this.y, 0);
        if (this.chargeTimer < chargeEnd) {
          this.charging = false;
          this.chargeTimer = -(chargeCoolMin + Math.random() * chargeCoolRand);
        }
      } else if (this.chargeTimer <= 0 && this.chargeTimer > chargePrep) {
        /* 예비동작 */
      } else if (this.chargeTimer <= chargePrep) {
        if (dist > 0.5) {
          this.chargeVx = dx / dist;
          this.chargeVy = dy / dist;
        }
        this.charging = true;
        this.chargeTimer = 0;
      } else if (!this.charging && dist > 0.5) {
        const nx = dx / dist, ny = dy / dist;
        const spd = this.cfg.speed * speedMult * 60 * dt;
        this.x += nx * spd; this.y += ny * spd;
        this.handle.group.position.set(this.x, this.y, 0);
      }
    } else if (dist > 1) {
      const nx = dx / dist, ny = dy / dist;
      const spd = this.cfg.speed * 60 * dt;
      this.x += nx * spd; this.y += ny * spd;
      this.handle.group.position.set(this.x, this.y, 0);
    }

    const contactDist = this.cfg.radius + playerRadius;
    if (dist < contactDist) {
      if (this.contactTimer <= 0) {
        this.frameDmg += this.cfg.contact_dmg;
        this.contactTimer = this.cfg.contact_dmg_interval_frames / 60;
      }
    }
    if (this.contactTimer > 0) this.contactTimer -= dt;

    const puddleFreqMult = this.phase === 3 ? this._bp('phase3_puddle_freq_mult', 2) : 1;
    const puddleInterval = (this.cfg.puddle_interval_frames / 60) / puddleFreqMult;
    this.puddleTimer -= dt;
    if (this.puddleTimer <= 0) {
      this.puddleTimer = puddleInterval;
      this._spawnPuddle(this.x, this.y, px, py);
      this.skillSpinTimer = this._bp('skill_spin_sec', 0.35);
    }

    const toRemove: number[] = [];
    for (let i = 0; i < this.puddles.length; i++) {
      const p = this.puddles[i];
      p.life -= dt;
      if (p.life <= 0) { toRemove.push(i); continue; }
      p.tickTimer -= dt;
      if (p.tickTimer <= 0) {
        p.tickTimer = this.cfg.puddle_dmg_interval_frames / 60;
        const pdx = px - p.x, pdy = py - p.y;
        if (pdx * pdx + pdy * pdy < p.radius * p.radius) {
          this.frameDmg += p.dmg;
        }
      }
    }
    for (let i = toRemove.length - 1; i >= 0; i--) {
      this.scene.remove(this.puddles[toRemove[i]].mesh);
      this.puddles.splice(toRemove[i], 1);
    }

    if (this.phase >= 2) {
      this.missileTimer -= dt;
      if (this.missileTimer <= 0) {
        this.missileTimer = this.phase === 3
          ? this._bp('phase3_missile_interval_sec', 1.7)
          : this._bp('phase2_missile_interval_sec', 2.8);
        const baseAngle = Math.atan2(dy, dx);
        const offsets = this._bpList('missile_volley_offsets', [-0.25, 0, 0.25]);
        for (const off of offsets) {
          this.pendingMissiles.push({
            sx: this.x, sy: this.y,
            angle: baseAngle + off,
            speed: this._bp('missile_speed', 4.2),
            turnRate: this._bp('missile_turn_rate', 2),
            maxRange: this._bp('missile_max_range', 500),
            dmg: this.cfg.contact_dmg * this._bp('missile_dmg_ratio', 0.6),
          });
        }
        this.skillSpinTimer = this._bp('missile_spin_sec', 0.5);
      }
    }

    const spinRate = this._bp('skill_spin_rate', 4.2);
    if (this.skillSpinTimer > 0) {
      this.skillSpinTimer -= dt;
      this.handle.tick(dt * spinRate);
    } else {
      this.handle.tick(dt);
    }

    return this.frameDmg;
  }

  private _tickCrusher(dt: number, _px: number, _py: number, playerRadius: number, dx: number, dy: number, dist: number): number {
    if (!this.handle) return 0;
    this.chargeTimer -= dt;
    const chargeEnd = this._bp('charge_end_sec', -0.4);
    const chargePrep = this._bp('charge_prep_sec', -0.3);
    const chargeCoolMin = this._bp('charge_cool_min_sec', 1.1);
    const chargeCoolRand = this._bp('charge_cool_rand_sec', 1.2);
    const chargeSpdMult = this._bp('charge_speed_mult', 4.5);
    const chargeDmgMult = this._bp('charge_contact_dmg_mult', 1.5);
    const warnSpin = this._bp('charge_warn_spin_sec', 0.3);

    if (this.charging) {
      const chargeSpd = this.cfg.speed * chargeSpdMult * 60 * dt;
      this.x += this.chargeVx * chargeSpd;
      this.y += this.chargeVy * chargeSpd;
      this.handle.group.position.set(this.x, this.y, 0);
      if (this.chargeTimer < chargeEnd) {
        this.charging = false;
        this.chargeTimer = -(chargeCoolMin + Math.random() * chargeCoolRand);
      }
    } else if (this.chargeTimer <= 0 && this.chargeTimer > chargePrep) {
      if (this.skillSpinTimer <= 0) { this.handle.flashHit(); this.skillSpinTimer = warnSpin; }
    } else if (this.chargeTimer <= chargePrep) {
      if (dist > 0.5) { this.chargeVx = dx / dist; this.chargeVy = dy / dist; }
      this.charging = true;
      this.chargeTimer = 0;
    } else if (dist > 1) {
      const nx = dx / dist, ny = dy / dist;
      const spd = this.cfg.speed * 60 * dt;
      this.x += nx * spd; this.y += ny * spd;
      this.handle.group.position.set(this.x, this.y, 0);
    }

    const contactDist = this.cfg.radius + playerRadius;
    if (dist < contactDist && this.contactTimer <= 0) {
      this.frameDmg += this.cfg.contact_dmg * (this.charging ? chargeDmgMult : 1);
      this.contactTimer = this.cfg.contact_dmg_interval_frames / 60;
    }
    if (this.contactTimer > 0) this.contactTimer -= dt;
    if (this.skillSpinTimer > 0) this.skillSpinTimer -= dt;
    this.handle.tick(dt);
    return this.frameDmg;
  }

  private _tickNexus(dt: number, _px: number, _py: number, playerRadius: number, dx: number, dy: number, dist: number): number {
    if (!this.handle) return 0;

    this.missileTimer -= dt;
    if (this.missileTimer <= 0) {
      const interval = this.cfg.missile_interval_frames > 0
        ? this.cfg.missile_interval_frames / 60
        : this._bp('missile_fallback_interval_sec', 1.5);
      this.missileTimer = interval;
      const count = Math.max(
        Math.floor(this._bp('missile_min_count', 3)),
        this.cfg.missile_count || 8,
      );
      const baseAngle = Math.atan2(dy, dx);
      const spread = (this.cfg.missile_spread_angle || 360) * Math.PI / 180;
      const speed = this.cfg.missile_speed > 0 ? this.cfg.missile_speed : 3.8;
      const turn = this.cfg.missile_turn_rate || 0;
      const range = this.cfg.missile_max_range > 0 ? this.cfg.missile_max_range : 500;
      const fallbackDmg = this._bp('miniboss_fallback_contact_dmg', 6);
      const dmg = this.cfg.contact_dmg > 0 ? this.cfg.contact_dmg : fallbackDmg;
      for (let i = 0; i < count; i++) {
        const angle = spread >= Math.PI * 1.9
          ? (Math.PI * 2 * i) / count
          : baseAngle + (spread * (i / (count - 1) - 0.5));
        this.pendingMissiles.push({
          sx: this.x, sy: this.y, angle,
          speed, turnRate: turn, maxRange: range, dmg,
        });
      }
      this.skillSpinTimer = this._bp('skill_spin_sec', 0.4);
    }

    const contactDist = this.cfg.radius + playerRadius;
    if (dist < contactDist && this.contactTimer <= 0) {
      const fallbackDmg = this._bp('miniboss_fallback_contact_dmg', 6);
      this.frameDmg += this.cfg.contact_dmg > 0 ? this.cfg.contact_dmg : fallbackDmg;
      this.contactTimer = this._bp('contact_interval_sec', 1);
    }
    if (this.contactTimer > 0) this.contactTimer -= dt;

    const spinRate = this._bp('skill_spin_rate', 4.2);
    if (this.skillSpinTimer > 0) {
      this.skillSpinTimer -= dt;
      this.handle.tick(dt * spinRate);
    } else {
      this.handle.tick(dt);
    }
    return this.frameDmg;
  }

  hit(dmg: number): boolean {
    if (!this.alive || !this.handle) return false;
    this.hp = Math.max(0, this.hp - dmg);
    this.handle.flashHit();
    this.handle.updateHp(this.hp / this.maxHp);
    if (this.hp <= 0) { this.alive = false; return true; }
    return false;
  }

  getHpPct(): number { return this.hp / this.maxHp; }

  private _spawnPuddle(x: number, y: number, px: number, py: number) {
    const r = this.cfg.puddle_radius;
    const mesh = createPuddleMesh(r, this.scene);
    const targetPlayer = Math.random() < this._bp('puddle_target_player_chance', 0.55);
    let px2: number, py2: number;
    if (targetPlayer) {
      const a = Math.random() * Math.PI * 2;
      const d = this._bp('puddle_dist_player_min', 18) + Math.random() * this._bp('puddle_dist_player_rand', 44);
      px2 = px + Math.cos(a) * d; py2 = py + Math.sin(a) * d;
    } else {
      const a = Math.random() * Math.PI * 2;
      const d = this._bp('puddle_dist_boss_min', 20) + Math.random() * this._bp('puddle_dist_boss_rand', 40);
      px2 = x + Math.cos(a) * d; py2 = y + Math.sin(a) * d;
    }
    mesh.position.set(px2, py2, -0.5);
    this.puddles.push({
      x: px2, y: py2, radius: r, dmg: this.cfg.puddle_dmg,
      life: this.cfg.puddle_life_frames / 60, tickTimer: 0, mesh,
    });
  }

  dispose() {
    if (this.handle) this.handle.dispose(this.scene);
    for (const p of this.puddles) this.scene.remove(p.mesh);
    this.puddles.length = 0;
    this.alive = false;
    this.handle = null;
  }
}
