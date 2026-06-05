import * as THREE from 'three';
import { BOARD_CONSTANTS } from './boardBuilder';

interface Keyframe {
  x: number;
  y: number;
  t: number;
}

interface BankPath {
  drop_position: number;
  target_slot: number;
  duration_ms: number;
  keyframes: Keyframe[];
}

export type OnLandCallback = (slotIndex: number) => void;
export type OnCollisionCallback = (x: number, y: number) => void;

export class BankPlayer {
  private banks = new Map<string, BankPath[]>();
  private scene: THREE.Scene;
  private activeBalls = new Set<THREE.Object3D>();

  constructor(scene: THREE.Scene, _viewHeight: number) {
    this.scene = scene;
  }

  async loadAll(): Promise<void> {
    const loads: Promise<void>[] = [];
    for (let slot = 0; slot < BOARD_CONSTANTS.SLOT_COUNT; slot++) {
      for (let drop = 0; drop < 5; drop++) {
        loads.push(this.loadBank(slot, drop));
      }
    }
    await Promise.all(loads);
    console.log(`BankPlayer: ${this.banks.size}개 뱅크 로드 완료`);
  }

  private async loadBank(slot: number, drop: number): Promise<void> {
    const key = bankKey(slot, drop);
    try {
      const res = await fetch(`./game_data/bank/bank_${key}.json`);
      if (!res.ok) return;
      const data: BankPath[] = await res.json();
      this.banks.set(key, data);
    } catch {
      // 뱅크 없음 — 경고 없이 skip
    }
  }

  play(params: {
    targetSlot: number;
    dropPosition: number;
    onCollision?: OnCollisionCallback;
    onLand?: OnLandCallback;
  }): boolean {
    const key = bankKey(params.targetSlot, params.dropPosition);
    let paths = this.banks.get(key);

    // fallback: 같은 슬롯의 다른 drop_position 뱅크 사용
    if (!paths || paths.length === 0) {
      for (let fallbackDrop = 0; fallbackDrop < 5; fallbackDrop++) {
        const fbKey = bankKey(params.targetSlot, fallbackDrop);
        const fbPaths = this.banks.get(fbKey);
        if (fbPaths && fbPaths.length > 0) {
          paths = fbPaths;
          break;
        }
      }
    }

    if (!paths || paths.length === 0) {
      console.warn(`BankPlayer: 뱅크 없음 — slot${params.targetSlot}_drop${params.dropPosition}`);
      return false;
    }

    const path = paths[Math.floor(Math.random() * paths.length)];
    const ball = createBallMesh();
    this.scene.add(ball);
    this.activeBalls.add(ball);

    const first = path.keyframes[0];
    ball.position.set(first.x, BOARD_CONSTANTS.HEIGHT - first.y, 10);

    const startTime = performance.now();
    let kfIndex = 0;
    let landed = false;

    const tick = () => {
      if (landed) return;

      const elapsed = performance.now() - startTime;
      const kfs = path.keyframes;

      // 착지 완료
      if (elapsed >= path.duration_ms) {
        const last = kfs[kfs.length - 1];
        const landX = last.x;
        const landY = BOARD_CONSTANTS.HEIGHT - last.y;
        ball.position.set(landX, landY, 10);
        landed = true;
        params.onLand?.(params.targetSlot);

        // 공이 슬롯 안으로 완전히 들어가는 애니메이션
        const sinkStart = performance.now();
        const sinkDur = 280;
        const sink = () => {
          const p = Math.min((performance.now() - sinkStart) / sinkDur, 1);
          const ease = p * p; // ease-in (가속)
          ball.position.y = landY - ease * 48;
          if (p < 1) {
            requestAnimationFrame(sink);
          } else {
            this.scene.remove(ball);
            this.activeBalls.delete(ball);
          }
        };
        requestAnimationFrame(sink);
        return;
      }

      // 현재 위치에 해당하는 keyframe 구간 탐색
      while (kfIndex < kfs.length - 2 && kfs[kfIndex + 1].t <= elapsed) {
        kfIndex++;
      }

      const a = kfs[kfIndex];
      const b = kfs[Math.min(kfIndex + 1, kfs.length - 1)];
      const t = b.t > a.t ? Math.min((elapsed - a.t) / (b.t - a.t), 1) : 1;

      const cx = a.x + (b.x - a.x) * t;
      const cy = a.y + (b.y - a.y) * t;
      ball.position.set(cx, BOARD_CONSTANTS.HEIGHT - cy, 10);

      requestAnimationFrame(tick);
    };

    requestAnimationFrame(tick);
    return true;
  }

  getActiveBalls(): THREE.Object3D[] {
    return Array.from(this.activeBalls);
  }
}

// ── 헬퍼 ──────────────────────────────────────────────────────
function bankKey(slot: number, drop: number) {
  return `slot${slot}_drop${drop}`;
}

function createBallMesh(): THREE.Group {
  const group = new THREE.Group();

  const ballGeo = new THREE.CircleGeometry(BOARD_CONSTANTS.BALL_RADIUS, 32);
  const ballMat = new THREE.MeshBasicMaterial({ color: '#e8e8e0' });
  group.add(new THREE.Mesh(ballGeo, ballMat));

  const outlineGeo = new THREE.RingGeometry(
    BOARD_CONSTANTS.BALL_RADIUS - 1.5,
    BOARD_CONSTANTS.BALL_RADIUS + 0.5,
    32
  );
  const outlineMat = new THREE.MeshBasicMaterial({ color: '#1a1a1a', side: THREE.DoubleSide });
  const outline = new THREE.Mesh(outlineGeo, outlineMat);
  outline.position.z = 0.1;
  group.add(outline);

  return group;
}
