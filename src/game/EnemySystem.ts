/**
 * EnemySystem.ts — 적 인스턴스 관리 + AI + 충돌
 * GameCore._tick() 에서 매 프레임 tick() 호출
 */
import * as THREE from 'three';
import type { EnemyConfig, EnemyId, GameData } from './data';
import { createEnemyMesh, clearEnemyInstancer, type EnemyMeshHandle } from '../three/EnemyMesh';
export interface EnemyInstance {
  id: number;
  cfg: EnemyConfig;
  handle: EnemyMeshHandle;
  hp: number;
  maxHp: number;
  x: number;
  y: number;
  /** 접촉 데미지 쿨다운 (초) */
  contactTimer: number;
  dead: boolean;
  fireTimer?: number;
  slowTimer?: number;
  /** 스테이지 속도 배율 */
  speedMult: number;
  /** 스테이지 데미지 배율 */
  dmgMult: number;
}

export interface EnemyProjectile {
  x: number;
  y: number;
  vx: number;
  vy: number;
  dmg: number;
  radius: number;
  mesh: THREE.Object3D;
  life: number;
}

let _nextId = 1;

export class EnemySystem {
  private scene: THREE.Scene;
  private data: GameData;
  readonly enemies: EnemyInstance[] = [];
  readonly projectiles: EnemyProjectile[] = [];

  constructor(scene: THREE.Scene, data: GameData) {
    this.scene = scene;
    this.data = data;
  }

  spawn(
    enemyId: EnemyId,
    x: number,
    y: number,
    hpMult = 1.0,
    speedMult = 1.0,
    dmgMult = 1.0,
  ): EnemyInstance {
    const cfg = this.data.enemies.get(enemyId)!;
    const handle = createEnemyMesh(cfg, this.scene);
    handle.setPosition(x, y);
    const scaledHp = Math.round(cfg.hp * hpMult);
    const inst: EnemyInstance = {
      id: _nextId++,
      cfg,
      handle,
      hp: scaledHp,
      maxHp: scaledHp,
      x,
      y,
      contactTimer: 0,
      dead: false,
      fireTimer: enemyId === 'spitter' ? 0.5 + Math.random() * 1.5 : undefined,
      speedMult,
      dmgMult,
    };
    this.enemies.push(inst);
    return inst;
  }

  /**
   * 매 프레임 AI 이동 + 메쉬 동기화 + 접촉 데미지 판정
   * @returns 이번 프레임 플레이어에게 가한 데미지 합
   */
  tick(dt: number, px: number, py: number, playerRadius: number): number {
    let totalDmg = 0;
    const toRemove: number[] = [];

    for (let i = 0; i < this.enemies.length; i++) {
      const e = this.enemies[i];
      if (e.dead) {
        toRemove.push(i);
        continue;
      }

      /* AI: 플레이어 방향 직선 추적 */
      const dx = px - e.x;
      const dy = py - e.y;
      const distSq = dx * dx + dy * dy;
      const dist = Math.sqrt(distSq);

      const isSpitter = e.cfg.enemy_id === 'spitter';
      const keepDistance = isSpitter && dist < 85;

      let enemySpeed = e.cfg.speed * e.speedMult;
      if (e.slowTimer !== undefined && e.slowTimer > 0) {
        e.slowTimer -= dt;
        enemySpeed *= 0.5;
      }

      if (dist > 0.5 && !keepDistance) {
        const nx = dx / dist;
        const ny = dy / dist;
        const spd = enemySpeed * 60 * dt;
        e.x += nx * spd;
        e.y += ny * spd;
        e.handle.setPosition(e.x, e.y);
        e.handle.updateDirection(nx, ny);
      } else if (keepDistance) {
        const nx = dx / dist;
        const ny = dy / dist;
        e.handle.updateDirection(nx, ny);
      }

      /* 접촉 데미지 */
      const contactDist = e.cfg.radius + playerRadius;
      if (dist < contactDist) {
        if (e.contactTimer <= 0) {
          totalDmg += e.cfg.contact_dmg * e.dmgMult;
          e.contactTimer = e.cfg.contact_dmg_interval_frames / 60;
        }
      }
      if (e.contactTimer > 0) e.contactTimer -= dt;

      /* 스피터 사격 AI */
      if (isSpitter && e.fireTimer !== undefined) {
        e.fireTimer -= dt;
        if (e.fireTimer <= 0 && dist < 180) {
          e.fireTimer = 3.5; // 3.5초 주기 발사 (성능 최적화)
          this._fireMissile(e.x, e.y, dx, dy, dist);
        }
      }

      e.handle.tick(dt);
    }

    /* 역순 제거 (인덱스 안전) */
    for (let i = toRemove.length - 1; i >= 0; i--) {
      const idx = toRemove[i];
      this.enemies[idx].handle.dispose(this.scene);
      this.enemies.splice(idx, 1);
    }

    /* 적군 투사체 업데이트 */
    const projToRemove: number[] = [];
    for (let i = 0; i < this.projectiles.length; i++) {
      const p = this.projectiles[i];
      p.life -= dt;
      if (p.life <= 0) {
        projToRemove.push(i);
        continue;
      }
      p.x += p.vx * 60 * dt;
      p.y += p.vy * 60 * dt;
      p.mesh.position.set(p.x, p.y, 1);

      // 플레이어 충돌 검사
      const pdx = px - p.x;
      const pdy = py - p.y;
      const pDist = Math.sqrt(pdx * pdx + pdy * pdy);
      if (pDist < p.radius + playerRadius) {
        totalDmg += p.dmg;
        projToRemove.push(i);
      }
    }

    const sortedProj = [...new Set(projToRemove)].sort((a, b) => b - a);
    for (const idx of sortedProj) {
      this.scene.remove(this.projectiles[idx].mesh);
      this.projectiles.splice(idx, 1);
    }

    return totalDmg;
  }

  /* 공유 미사일 지오메트리/재질 (한 번만 생성) */
  private static _missileHeadGeo = new THREE.CircleGeometry(4.5, 5);
  private static _missileHeadMat = new THREE.MeshBasicMaterial({ color: 0xCC1111 });
  private static _missileTailGeo = new THREE.CircleGeometry(2.8, 4);
  private static _missileTailMat = new THREE.MeshBasicMaterial({ color: 0x444444 });

  private _fireMissile(sx: number, sy: number, dx: number, dy: number, dist: number) {
    if (dist <= 0) return;
    const speed = 2.4;
    const radius = 4.5;
    const vx = (dx / dist) * speed;
    const vy = (dy / dist) * speed;

    /* 공유 Geo+Mat 재사용 — GPU 오브젝트 추가 생성 없음 */
    const head = new THREE.Mesh(EnemySystem._missileHeadGeo, EnemySystem._missileHeadMat);
    const tail = new THREE.Mesh(EnemySystem._missileTailGeo, EnemySystem._missileTailMat);
    tail.position.set(-radius * 1.5, 0, 0);

    const group = new THREE.Group();
    group.add(head, tail);
    group.rotation.z = Math.atan2(vy, vx);
    group.position.set(sx, sy, 1);
    this.scene.add(group);

    this.projectiles.push({
      x: sx,
      y: sy,
      vx,
      vy,
      dmg: 3,
      radius,
      mesh: group,
      life: 3.0, // 수명 단축 (4→3초) — 화면에 잔류하는 미사일 수 감소
    });
  }

  /** 적 피격. 사망 시 dead=true 마킹 후 true 반환 */
  hit(enemyId: number, dmg: number): boolean {
    const e = this.enemies.find(en => en.id === enemyId);
    if (!e || e.dead) return false;
    e.hp = Math.max(0, e.hp - dmg);
    e.handle.flashHit();
    e.handle.updateHp(e.hp / e.maxHp);
    if (e.hp <= 0) {
      e.dead = true;
      return true;
    }
    return false;
  }

  /** 지정 좌표에서 가장 가까운 살아있는 적 */
  findNearest(x: number, y: number): EnemyInstance | null {
    let nearest: EnemyInstance | null = null;
    let minD2 = Infinity;
    for (const e of this.enemies) {
      if (e.dead) continue;
      const dx = e.x - x;
      const dy = e.y - y;
      const d2 = dx * dx + dy * dy;
      if (d2 < minD2) { minD2 = d2; nearest = e; }
    }
    return nearest;
  }

  /** 원 범위 내 모든 살아있는 적 */
  findInRadius(x: number, y: number, radius: number): EnemyInstance[] {
    const r2 = radius * radius;
    return this.enemies.filter(e => {
      if (e.dead) return false;
      const dx = e.x - x;
      const dy = e.y - y;
      return dx * dx + dy * dy <= r2;
    });
  }

  applySlowInRadius(x: number, y: number, radius: number, duration: number) {
    const r2 = radius * radius;
    for (const e of this.enemies) {
      if (e.dead) continue;
      const dx = e.x - x;
      const dy = e.y - y;
      if (dx * dx + dy * dy <= r2) {
        e.slowTimer = duration;
      }
    }
  }

  get liveCount(): number {
    return this.enemies.filter(e => !e.dead).length;
  }

  clear() {
    for (const e of this.enemies) {
      e.handle.dispose(this.scene);
    }
    this.enemies.length = 0;

    for (const p of this.projectiles) {
      this.scene.remove(p.mesh);
    }
    this.projectiles.length = 0;

    /* InstancedMesh 슬롯 전부 반납 + 숨김 */
    clearEnemyInstancer();
  }

}
