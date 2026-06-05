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
  /** 진화 자석 패시브 등 — 영구 픽업 반경 배율 */
  private basePickupRadiusMult = 1;
  /** 자석 아이템 효과 — 남은 시간(초). 0이면 비활성 */
  private magnetEffectTimer = 0;
  /** 자석 효과 중 반경 배율 */
  private readonly MAGNET_RADIUS_MULT = 8;
  /** 자석 효과 지속 시간(초) — drop_config effect_value 로 덮어씀 */
  private magnetEffectDuration = 4;

  get pickupRadiusMult(): number {
    return this.magnetEffectTimer > 0
      ? this.basePickupRadiusMult * this.MAGNET_RADIUS_MULT
      : this.basePickupRadiusMult;
  }

  get magnetActive(): boolean { return this.magnetEffectTimer > 0; }

  constructor(scene: THREE.Scene, data: GameData) {
    this.scene = scene;
    this.data = data;
    /* effect_value를 지속 시간(초)으로 사용 */
    const cfg = data.drops.find(d => d.drop_type === 'magnet');
    if (cfg && cfg.effect_value > 0) this.magnetEffectDuration = cfg.effect_value;
  }

  setPickupRadiusMult(bonus: number) {
    this.basePickupRadiusMult = 1 + Math.max(0, bonus);
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

    const size =
      dropType === 'small'  ? cfg.size_small  :
      dropType === 'medium' ? cfg.size_medium : cfg.size_large;

    const mesh = this._createDropMesh(cfg.geometry_type, cfg.color_hex, size, cfg.sprite_url, true);

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

    const mesh = this._createDropMesh(chosen.geometry_type, chosen.color_hex, 6, chosen.sprite_url, false);
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
    _screenBounds?: { minX: number; maxX: number; minY: number; maxY: number },
  ): { xpGained: number; magnetXpGained: number; healGained: number; magnetTriggered: boolean; bombTriggered: boolean } {
    let xpGained = 0;
    let magnetXpGained = 0;
    let healGained = 0;
    let magnetTriggered = false;
    let bombTriggered = false;

    /* 자석 효과 타이머 갱신 */
    if (this.magnetEffectTimer > 0) {
      this.magnetEffectTimer = Math.max(0, this.magnetEffectTimer - dt);
    }

    const toRemove: number[] = [];

    for (let i = 0; i < this.drops.length; i++) {
      const d = this.drops[i];
      if (toRemove.includes(i)) continue;

      const dx = px - d.x;
      const dy = py - d.y;
      const dist = Math.sqrt(dx * dx + dy * dy) || 0.001;
      const pickR = d.radius * this.pickupRadiusMult;

      /* 자석 효과 활성 중이면 범위 안 XP 자동으로 pulling */
      if (this.magnetEffectTimer > 0 && d.type === 'xp' && dist < pickR && !d.pulling) {
        d.pulling = true;
        d.magnetPull = true;
        d.pullTimer = 0;
      }

      if (dist < pickR || d.pulling) {
        d.pulling = true;
      }

      if (d.pulling) {
        d.pullTimer = (d.pullTimer ?? 0) + dt;
        let speed: number;
        if (d.magnetPull) {
          // 자석 효과: 부드럽게 가속 (150 → 최대 480 px/s)
          speed = Math.min(480, 150 + (d.pullTimer ?? 0) * 450);
        } else {
          // 근접 픽업: 거리 기반 가속
          speed = Math.min(520, 200 + Math.max(0, pickR - dist) * 4.2);
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
        if (d.type === 'xp') {
          d.mesh.rotation.z += dt * 2.2;
          const bob = Math.sin((d.pullTimer ?? 0) * 5 + d.x * 0.02) * 0.35;
          d.mesh.position.z = bob;
        }

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
            case 'magnet':
              /* 자석 아이템 픽업 — 반경 확대 효과를 duration 동안 적용 */
              this.magnetEffectTimer = this.magnetEffectDuration;
              magnetTriggered = true;
              break;
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

  private _createDropMesh(
    geomType: string,
    colorHex: string,
    size: number,
    spriteUrl = '',
    isXp = false,
  ): THREE.Mesh {
    if (geomType === 'XpGemBillboard' || (isXp && spriteUrl)) {
      const url = spriteUrl || '';
      const geo = new THREE.PlaneGeometry(size * 1.55, size * 1.55);
      const col = new THREE.Color(colorHex);
      let mat: THREE.MeshBasicMaterial;
      if (url) {
        const tex = new THREE.TextureLoader().load(url);
        mat = new THREE.MeshBasicMaterial({
          map: tex,
          transparent: true,
          alphaTest: 0.06,
          depthWrite: false,
          color: col,
        });
      } else {
        mat = new THREE.MeshBasicMaterial({
          color: col,
          transparent: true,
          opacity: 0.85,
          depthWrite: false,
        });
      }
      const mesh = new THREE.Mesh(geo, mat);
      mesh.position.z = 0.15;
      mesh.renderOrder = 1;
      this.scene.add(mesh);
      return mesh;
    }

    if (spriteUrl) {
      const tex = new THREE.TextureLoader().load(spriteUrl);
      const geo = new THREE.PlaneGeometry(size * 2.2, size * 2.2);
      const mat = new THREE.MeshBasicMaterial({ map: tex, transparent: true, alphaTest: 0.1 });
      const mesh = new THREE.Mesh(geo, mat);
      this.scene.add(mesh);
      return mesh;
    }

    let geo: THREE.BufferGeometry;
    const col = new THREE.Color(colorHex);

    if (geomType === 'CrossGeometry') {
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

