/**
 * DropSystem.ts — XP/아이템 드롭 + 자동 픽업
 * 적 사망 시 spawnXp(), 매 프레임 tick()
 */
import * as THREE from 'three';
import type { GameData, DropType } from './data';

interface DropInstance {
  type: DropType;
  value: number;
  radius: number;
  x: number;
  y: number;
  mesh: THREE.Mesh;
  pulling?: boolean;
  pullTimer?: number;
  magnetPull?: boolean;
}

export class DropSystem {
  private scene: THREE.Scene;
  private data: GameData;
  private drops: DropInstance[] = [];

  constructor(scene: THREE.Scene, data: GameData) {
    this.scene = scene;
    this.data = data;
  }

  /**
   * 적 사망 시 XP 드롭
   * @param valueScale 스테이지별 XP 배율 (stage_config.xp_mult), 초기 산포 시 1.0 고정
   */
  spawnXp(x: number, y: number, dropType: string, valueScale = 1.0) {
    const dropId =
      dropType === 'small'  ? 'xp_small'  :
      dropType === 'medium' ? 'xp_medium' : 'xp_large';

    const cfg = this.data.drops.find(d => d.drop_id === dropId);
    if (!cfg) return;

    // 작은 XP는 유지, 중/대형만 축소해 몬스터와 실루엣 구분 강화
    const baseSize =
      dropType === 'small'  ? cfg.size_small  :
      dropType === 'medium' ? cfg.size_medium : cfg.size_large;
    const size =
      dropType === 'small'  ? baseSize :
      dropType === 'medium' ? baseSize * 0.72 : baseSize * 0.6;

    const mesh = this._createDropMesh(cfg.geometry_type, cfg.color_hex, size);

    /* 약간 랜덤 오프셋 */
    const ox = (Math.random() - 0.5) * 20;
    const oy = (Math.random() - 0.5) * 20;
    mesh.position.set(x + ox, y + oy, 0);

    this.drops.push({
      type: 'xp',
      value: cfg.effect_value * valueScale,  // 스테이지 XP 배율 적용
      radius: cfg.pickup_radius + 15,
      x: x + ox,
      y: y + oy,
      mesh,
    });
  }

  /** 랜덤 아이템 드롭 (heal/magnet/bomb) */
  spawnRandomItem(x: number, y: number) {
    const pool = this.data.drops.filter(d => d.drop_weight > 0);
    const totalW = pool.reduce((s, d) => s + d.drop_weight, 0);
    let rnd = Math.random() * totalW;
    let chosen = pool[pool.length - 1];
    for (const d of pool) {
      rnd -= d.drop_weight;
      if (rnd <= 0) { chosen = d; break; }
    }

    const mesh = this._createDropMesh(chosen.geometry_type, chosen.color_hex, 6);
    mesh.position.set(x, y, 0);
    this.drops.push({
      type: chosen.drop_type as DropType,
      value: chosen.effect_value,
      radius: chosen.pickup_radius + 15,
      x,
      y,
      mesh,
    });
  }

  /**
   * 매 프레임 픽업 체크
   * @returns { xpGained, magnetXpGained, healGained, magnetTriggered, bombTriggered }
   * screenBounds: 자석 발동 시 화면 안 XP만 끌어당기기 위해 사용
   */
  tick(
    px: number,
    py: number,
    dt = 0.016,
    screenBounds?: { minX: number; maxX: number; minY: number; maxY: number },
  ): { xpGained: number; magnetXpGained: number; healGained: number; magnetTriggered: boolean; bombTriggered: boolean } {
    let xpGained = 0;
    let magnetXpGained = 0;
    let healGained = 0;
    let magnetTriggered = false;
    let bombTriggered = false;

    const toRemove: number[] = [];

    /* magnet 발동 여부 1차 확인 */
    for (let i = 0; i < this.drops.length; i++) {
      const d = this.drops[i];
      const dx = px - d.x;
      const dy = py - d.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < d.radius && d.type === 'magnet') {
        magnetTriggered = true;
        toRemove.push(i);
      }
    }

    /* magnet 발동 시 화면 안 XP만 pulling 활성화 */
    if (magnetTriggered) {
      for (const d of this.drops) {
        if (d.type !== 'xp') continue;
        /* 화면 bounds가 있으면 화면 안만, 없으면 전체 */
        if (screenBounds) {
          const inScreen =
            d.x >= screenBounds.minX && d.x <= screenBounds.maxX &&
            d.y >= screenBounds.minY && d.y <= screenBounds.maxY;
          if (!inScreen) continue;
        }
        d.pulling = true;
        d.magnetPull = true;
        d.pullTimer = 0;
      }
    }

    for (let i = 0; i < this.drops.length; i++) {
      const d = this.drops[i];
      if (toRemove.includes(i)) continue;

      const dx = px - d.x;
      const dy = py - d.y;
      const dist = Math.sqrt(dx * dx + dy * dy) || 0.001;

      if (dist < d.radius || d.pulling) {
        d.pulling = true;
      }

      if (d.pulling) {
        d.pullTimer = (d.pullTimer ?? 0) + dt;
        /* 자석 발동 XP: 거리와 무관하게 시간 기반 가속 (distance 음수 방지)
         * 일반 근접 픽업: 기존 거리 기반 가속 유지 */
        let speed: number;
        if (d.magnetPull) {
          // 0.1초 후 130 → 최대 420 px/s까지 가속
          speed = Math.min(420, 130 + (d.pullTimer ?? 0) * 400);
        } else {
          // 근접 픽업: dist < radius 보장이므로 항상 양수
          speed = Math.min(520, 200 + Math.max(0, d.radius - dist) * 4.2);
        }
        const nx = dx / dist;
        const ny = dy / dist;
        const moveDist = speed * dt;

        if (moveDist >= dist - 12) {
          d.x = px;
          d.y = py;
        } else {
          d.x += nx * moveDist;
          d.y += ny * moveDist;
        }
        d.mesh.position.set(d.x, d.y, 0);

        const newDx = px - d.x;
        const newDy = py - d.y;
        const newDist = Math.sqrt(newDx * newDx + newDy * newDy);
        const magnetReady = !d.magnetPull || (d.pullTimer ?? 0) > 0.1;
        if (newDist < 15 && magnetReady) {
          switch (d.type) {
            case 'xp':
              /* 자석으로 끌린 XP와 일반 수집 XP 구분 */
              if (d.magnetPull) magnetXpGained += d.value;
              else              xpGained       += d.value;
              break;
            case 'heal':   healGained += d.value; break;
            case 'magnet': magnetTriggered = true; break;
            case 'bomb':   bombTriggered = true; break;
          }
          toRemove.push(i);
        }
      }
    }

    /* 역순 제거 */
    const sorted = [...new Set(toRemove)].sort((a, b) => b - a);
    for (const idx of sorted) {
      const d = this.drops[idx];
      this.scene.remove(d.mesh);
      this.drops.splice(idx, 1);
    }

    return { xpGained, magnetXpGained, healGained, magnetTriggered, bombTriggered };
  }

  clear() {
    for (const d of this.drops) {
      this.scene.remove(d.mesh);
    }
    this.drops.length = 0;
  }

  private _createDropMesh(geomType: string, colorHex: string, size: number): THREE.Mesh {
    let geo: THREE.BufferGeometry;
    const col = new THREE.Color(colorHex);

    if (geomType === 'OctahedronGeometry') {
      // 경험치 보석용 정팔면체 (다이아몬드)
      geo = new THREE.OctahedronGeometry(size * 1.1, 0); // 다이아몬드 형태로 보이기 위해 크기 약간 보정
    } else if (geomType === 'CrossGeometry') {
      // 힐용 크로스 메쉬
      geo = new THREE.BoxGeometry(size * 1.5, size * 0.5, size * 0.5);
      const group = new THREE.Group();
      const b1 = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ color: col }));
      const b2 = new THREE.Mesh(new THREE.BoxGeometry(size * 0.5, size * 1.5, size * 0.5), new THREE.MeshBasicMaterial({ color: col }));
      group.add(b1, b2);
      const baseMesh = new THREE.Mesh(new THREE.BufferGeometry(), new THREE.MeshBasicMaterial({ visible: false }));
      baseMesh.add(group);
      this.scene.add(baseMesh);
      return baseMesh;
    } else if (geomType === 'HalfTorusGeometry') {
      // 자석용 말굽 Torus (빨강/파랑 투톤)
      const baseMesh = new THREE.Mesh(new THREE.BufferGeometry(), new THREE.MeshBasicMaterial({ visible: false }));
      const torusGeo = new THREE.TorusGeometry(size * 0.9, size * 0.32, 5, 12, Math.PI); // 반원 Torus
      
      const redMat  = new THREE.MeshBasicMaterial({ color: 0xFF3300 });
      const blueMat = new THREE.MeshBasicMaterial({ color: 0x00A0FF });
      
      const redMesh = new THREE.Mesh(torusGeo, redMat);
      redMesh.rotation.z = Math.PI / 2; // 빨간 반원 회전
      const blueMesh = new THREE.Mesh(torusGeo, blueMat);
      blueMesh.rotation.z = -Math.PI / 2; // 파란 반원 회전
      
      baseMesh.add(redMesh, blueMesh);
      this.scene.add(baseMesh);
      return baseMesh;
    } else if (geomType === 'IcosahedronGeometry') {
      // 폭탄용 정이십면체 (뾰족한 스파이크 구체)
      geo = new THREE.IcosahedronGeometry(size, 0);
    } else {
      geo = new THREE.SphereGeometry(size, 8, 8);
    }

    const mat = new THREE.MeshBasicMaterial({ color: col });
    const mesh = new THREE.Mesh(geo, mat);
    this.scene.add(mesh);
    return mesh;
  }
}

