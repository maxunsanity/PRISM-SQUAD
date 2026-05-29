/**
 * BossController.ts — 보스 스폰 + 패턴 (웅덩이 생성)
 * GameCore에서 elapsedSec >= boss.spawn_time_seconds 이 됐을 때 start()
 */
import * as THREE from 'three';
import type { BossConfig } from './data';
import { createBossMesh, createPuddleMesh, type EnemyMeshHandle } from '../three/EnemyMesh';

interface Puddle {
  x: number;
  y: number;
  radius: number;
  dmg: number;
  life: number;
  tickTimer: number;
  mesh: THREE.Mesh;
}

export class BossController {
  private scene: THREE.Scene;
  readonly cfg: BossConfig;

  private handle: EnemyMeshHandle | null = null;
  private puddles: Puddle[] = [];
  private puddleTimer = 0;
  private skillSpinTimer = 0;

  hp: number;
  maxHp: number;
  x = 0;
  y = 0;
  alive = false;

  /** 이번 프레임 플레이어에 가한 데미지 */
  frameDmg = 0;
  contactTimer = 0;

  constructor(scene: THREE.Scene, cfg: BossConfig) {
    this.scene = scene;
    this.cfg   = cfg;
    this.hp    = cfg.hp;
    this.maxHp = cfg.hp;
  }

  start(spawnX: number, spawnY: number) {
    this.x = spawnX;
    this.y = spawnY;
    this.hp = this.maxHp;
    this.alive = true;
    this.puddleTimer = 0;
    this.skillSpinTimer = 0;
    this.contactTimer = 0;
    this.handle = createBossMesh(this.cfg, this.scene);
    this.handle.group.position.set(spawnX, spawnY, 0);
  }

  tick(dt: number, px: number, py: number, playerRadius: number): number {
    if (!this.alive || !this.handle) return 0;
    this.frameDmg = 0;

    /* AI: 플레이어 추적 */
    const dx = px - this.x;
    const dy = py - this.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist > 1) {
      const nx = dx / dist;
      const ny = dy / dist;
      const spd = this.cfg.speed * 60 * dt;
      this.x += nx * spd;
      this.y += ny * spd;
      this.handle.group.position.set(this.x, this.y, 0);
    }

    /* 접촉 데미지 */
    const contactDist = this.cfg.radius + playerRadius;
    if (dist < contactDist) {
      if (this.contactTimer <= 0) {
        this.frameDmg += this.cfg.contact_dmg;
        this.contactTimer = this.cfg.contact_dmg_interval_frames / 60;
      }
    }
    if (this.contactTimer > 0) this.contactTimer -= dt;

    /* 웅덩이 생성 */
    this.puddleTimer -= dt;
    if (this.puddleTimer <= 0) {
      this.puddleTimer = this.cfg.puddle_interval_frames / 60;
      this._spawnPuddle(this.x, this.y, px, py);
      this.skillSpinTimer = 0.45;
    }

    /* 웅덩이 틱 */
    const toRemove: number[] = [];
    for (let i = 0; i < this.puddles.length; i++) {
      const p = this.puddles[i];
      p.life -= dt;
      if (p.life <= 0) { toRemove.push(i); continue; }

      p.tickTimer -= dt;
      if (p.tickTimer <= 0) {
        p.tickTimer = this.cfg.puddle_dmg_interval_frames / 60;
        const pdx = px - p.x;
        const pdy = py - p.y;
        if (pdx * pdx + pdy * pdy < p.radius * p.radius) {
          this.frameDmg += p.dmg;
        }
      }
    }
    for (let i = toRemove.length - 1; i >= 0; i--) {
      const idx = toRemove[i];
      this.scene.remove(this.puddles[idx].mesh);
      this.puddles.splice(idx, 1);
    }

    if (this.skillSpinTimer > 0) {
      this.skillSpinTimer -= dt;
      this.handle.tick(dt * 4.2); // 스킬 시전 중 회전 가속
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
    if (this.hp <= 0) {
      this.alive = false;
      return true;
    }
    return false;
  }

  getHpPct(): number { return this.hp / this.maxHp; }

  private _spawnPuddle(x: number, y: number, px: number, py: number) {
    const r = this.cfg.puddle_radius;
    const mesh = createPuddleMesh(r, this.scene);
    /* 절반 확률로 플레이어 근처, 절반은 보스 주변 */
    const targetPlayer = Math.random() < 0.55;
    let px2: number;
    let py2: number;
    if (targetPlayer) {
      const a = Math.random() * Math.PI * 2;
      const d = 18 + Math.random() * 44;
      px2 = px + Math.cos(a) * d;
      py2 = py + Math.sin(a) * d;
    } else {
      const angle = Math.random() * Math.PI * 2;
      const dist  = 20 + Math.random() * 40;
      px2 = x + Math.cos(angle) * dist;
      py2 = y + Math.sin(angle) * dist;
    }
    mesh.position.set(px2, py2, -0.5);
    this.puddles.push({
      x: px2, y: py2,
      radius: r,
      dmg: this.cfg.puddle_dmg,
      life: this.cfg.puddle_life_frames / 60,
      tickTimer: 0,
      mesh,
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
