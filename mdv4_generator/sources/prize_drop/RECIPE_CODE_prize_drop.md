# Prize Drop Arcade — Recipe Code

> 이 파일이 있으면 코드를 그대로 사용한다. 임의 수정 금지.
> 이 파일이 없으면 RECIPE.md 설명을 보고 직접 구현한다.

---

## R-01. json-render Provider 래핑

```tsx
// src/main.tsx
import {
  StateProvider,
  ActionProvider,
  VisibilityProvider,
} from '@json-render/react';
import { hudStore } from './game/hudExternalStore';
import { overlayActionHandlers } from './jsonRender/GameJsonHud';

ReactDOM.createRoot(document.getElementById('prize-drop-root')!).render(
  <React.StrictMode>
    <StateProvider store={hudStore}>
      <ActionProvider handlers={overlayActionHandlers}>
        <VisibilityProvider>
          <GameJsonHud />
        </VisibilityProvider>
      </ActionProvider>
    </StateProvider>
  </React.StrictMode>
);
// ValidationProvider 없음 — 이 게임은 3개 Provider만
```

---

## R-02. $state 3곳 동시 패치

```typescript
// 1. src/game/hudExternalStore.ts
import { createStateStore } from '@json-render/core';

export const hudStore = createStateStore({
  hud: {
    ball_count: 10,
    multiplier: 1,
    show_warning: false,
    session_lightning: 0,
    milestone_step: 0,
    milestone_progress: 0,
    milestone_thresholds: [100, 200, 300, 400, 500],
    last_gain: 0,
    show_gain: false,
    cycle_count: 0,
    modal_visible: false,
    modal_type: '',
    modal_step: 0,
    modal_reward_amount: 0,
    modal_reward_type: '',
    modal_remaining: 0,
    modal_cycle_count: 0,
  },
});
```

```typescript
// 2. 공급원 update — gameStore.ts 예시
export class GameStore {
  private _ballCount = 10;

  setBallCount(n: number) {
    this._ballCount = n;
    hudStore.update('/hud/ball_count', n); // ✅ hudStore push
  }
}
```

```tsx
// 3. GameJsonHud.tsx — Spec $state 바인딩
const mainHudSpec = {
  root: 'prizedrop-hud-root',
  elements: {
    ball_count_el: {
      type: 'BallCountDisplay',
      props: { count: { $state: '/hud/ball_count' } }, // ✅ $state 경로
      visible: true,
    },
    // ...
  },
};
```

---

## R-03. getSnapshot() 캐시 패턴

```typescript
// src/game/gameStore.ts
export class GameStore {
  private _state = { ball_count: 10, multiplier: 1 };
  private _listeners = new Set<() => void>();

  // ✅ 화살표 함수 필드 — this 유실 방지
  getSnapshot = () => this._state;

  subscribe = (cb: () => void) => {
    this._listeners.add(cb);
    return () => this._listeners.delete(cb);
  };

  private _notify(partial: Partial<typeof this._state>) {
    // ✅ 변경 시에만 새 참조 생성
    this._state = { ...this._state, ...partial };
    this._listeners.forEach(cb => cb());
  }

  setBallCount(n: number) {
    this._notify({ ball_count: n });
    hudStore.update('/hud/ball_count', n);
  }
}
```

---

## R-04. Three.js OrthographicCamera

```typescript
// src/game/PrizeDrop.ts
function initRenderer(viewport: HTMLElement) {
  const viewWidth = viewport.clientWidth;   // 360
  const viewHeight = viewport.clientHeight; // 396

  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(viewWidth, viewHeight, false);
  viewport.appendChild(renderer.domElement);

  // ✅ OrthographicCamera — PerspectiveCamera 절대 금지
  const camera = new THREE.OrthographicCamera(
    0,          // left
    viewWidth,  // right
    viewHeight, // top (Y축: 위가 viewHeight)
    0,          // bottom
    -1000,
    1000
  );
  camera.position.set(0, 0, 500);

  const scene = new THREE.Scene();
  scene.background = new THREE.Color('#f0f0e8');
  scene.add(new THREE.AmbientLight(0xffffff, 1));
  // DirectionalLight 없음 — MeshBasicMaterial 사용

  return { renderer, camera, scene };
}
```

---

## R-05. bankPlayer Y-flip

```typescript
// src/game/bankPlayer.ts
import { BOARD_CONSTANTS } from './boardBuilder';

export class BankPlayer {
  private playKeyframe(kf: Keyframe) {
    // ✅ BOARD_CONSTANTS.HEIGHT(396) 사용 — viewHeight(≈390) 금지
    const threeY = BOARD_CONSTANTS.HEIGHT - kf.y;
    this.ballMesh.position.set(kf.x, threeY, 10);
  }

  // ❌ 잘못된 구현 — viewHeight 사용
  // const threeY = this.viewHeight - kf.y;
  // viewHeight ≈ 390 ≠ BOARD_CONSTANTS.HEIGHT = 396
  // → 공이 핀 뚫고 지나감
}
```

---

## R-06. bank fallback 패턴

```typescript
// src/game/bankPlayer.ts
private findBankPaths(targetSlot: number, dropPosition: number): BankPath[] {
  // 1. 정확한 키 시도
  let paths = this.banks.get(bankKey(targetSlot, dropPosition));
  if (paths && paths.length > 0) return paths;

  // 2. ✅ 같은 슬롯 다른 drop_position fallback
  for (let fallbackDrop = 0; fallbackDrop < 5; fallbackDrop++) {
    if (fallbackDrop === dropPosition) continue;
    const fbPaths = this.banks.get(bankKey(targetSlot, fallbackDrop));
    if (fbPaths && fbPaths.length > 0) return fbPaths;
  }

  // 3. 임의 슬롯 fallback
  for (const [, bankPaths] of this.banks) {
    if (bankPaths.length > 0) return bankPaths;
  }

  return [];
}

get isReady(): boolean {
  return this.banks.size > 0;
}
```

---

## R-07. 보상 모달 큐 패턴

```typescript
// src/game/rewardModalStore.ts
export class RewardModalStore {
  private queue: ModalItem[] = [];
  private showing = false;

  // ✅ enqueue — show() 직접 호출 금지
  enqueue(step: number, reward: RewardConfig) {
    this.queue.push({ step, reward });
    if (!this.showing) this._showNext();
  }

  dismiss() {
    this.showing = false;
    hudStore.update('/hud/modal_visible', false);

    // ✅ 180ms 후 다음 모달 자동 표시
    setTimeout(() => {
      if (this.queue.length > 0) this._showNext();
    }, 180);
  }

  private _showNext() {
    const item = this.queue.shift();
    if (!item) return;

    this.showing = true;
    hudStore.update('/hud/modal_visible', true);
    hudStore.update('/hud/modal_step', item.step);
    hudStore.update('/hud/modal_reward_amount', item.reward.amount);
    hudStore.update('/hud/modal_reward_type', item.reward.type);
    hudStore.update('/hud/modal_remaining', this.queue.length);
  }
}
```

---

## R-08. BOARD_CONSTANTS 동기화

```typescript
// src/game/boardBuilder.ts
export const BOARD_CONSTANTS = {
  WIDTH: 360,
  HEIGHT: 396,     // ⚠️ simulationRunner.mjs B.HEIGHT와 반드시 동일
  PIN_RADIUS: 5,
  BALL_RADIUS: 9,
  SLOT_COUNT: 7,
  CENTER_X: 180,
};
```

```javascript
// scripts/simulationRunner.mjs
const B = {
  WIDTH: 360,
  HEIGHT: 396,     // ⚠️ boardBuilder.ts BOARD_CONSTANTS.HEIGHT와 반드시 동일
  PIN_RADIUS: 5,
  BALL_RADIUS: 9,
  SLOT_COUNT: 7,
  CENTER_X: 180,
};
// 하나라도 다르면 bank 경로와 실제 보드 불일치 → 공이 핀 뚫음
```

---

## R-09. SlotLabels CSV 기반 렌더

```tsx
// src/jsonRender/GameJsonHud.tsx
function SlotLabelsImpl({ element }: ComponentRenderProps) {
  // ✅ CSV 데이터 기반 렌더 — 하드코딩 금지
  const slots = (element.props as any).slots as SlotConfig[];
  const sorted = [...slots].sort((a, b) => a.slot_index - b.slot_index);

  return (
    <div id="slot-labels" style={{ display: 'flex', height: '50px' }}>
      {sorted.map((slot) => (
        <div key={slot.slot_index} className="slot-item">
          <div className="slot-val">{slot.reward_lightning}</div>
          {slot.is_jackpot && <div className="slot-jackpot">⚡</div>}
        </div>
      ))}
    </div>
  );

  // ❌ 잘못된 구현 — 하드코딩 시 CSV 수정이 화면에 반영 안 됨
  // const labels = [1, 10, 20, 100, 20, 10, 1];
}
```

---

## R-10. RewardCircle 충돌 감지

```typescript
// src/game/PrizeDrop.ts — 렌더 루프 내
private checkRewardCircleCollisions(now: number) {
  const ballRadius = BOARD_CONSTANTS.BALL_RADIUS; // 9

  this.rewardMeshes.forEach(rm => {
    let isHit = false;

    this.activeBalls.forEach(ball => {
      const dx = ball.position.x - rm.mesh.position.x;
      const dy = ball.position.y - rm.mesh.position.y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      // ✅ 거리 기반 충돌 감지
      if (dist < rm.originalRadius + ballRadius + 2) {
        isHit = true;
      }
    });

    // 150ms 내 중복 트리거 방지
    if (isHit && now - rm.lastHitTime > 150) {
      rm.lastHitTime = now;
    }

    // bounce + ripple 애니메이션
    const elapsed = now - rm.lastHitTime;
    if (elapsed < 400) {
      if (elapsed < 300) {
        const s = elapsed < 80
          ? 1 + (elapsed / 80) * 0.12
          : 1.12 - ((elapsed - 80) / 220) * 0.12;
        rm.mesh.scale.set(s, s, 1);
        rm.outline.scale.set(s, s, 1);
      } else {
        rm.mesh.scale.set(1, 1, 1);
        rm.outline.scale.set(1, 1, 1);
      }

      // ripple
      rm.ripples.forEach((ripple, idx) => {
        const rElapsed = elapsed - idx * 120;
        if (rElapsed > 0 && rElapsed < 280) {
          ripple.visible = true;
          const p = rElapsed / 280;
          ripple.scale.set(1 - p, 1 - p, 1);
          (ripple.material as THREE.MeshBasicMaterial).opacity = (1 - p) * 0.6;
        } else {
          ripple.visible = false;
        }
      });
    }
  });
}
```

---

## R-11. 드롭 버튼 중심 X 고정

```typescript
// src/jsonRender/GameJsonHud.tsx — DropButtonsImpl
const DROP_CENTER_X = [30, 105, 180, 255, 330]; // ✅ 고정값. simulationRunner와 동기화.

function DropButtonsImpl() {
  return (
    <div id="jr-overlay-buttons">
      {DROP_CENTER_X.map((cx, i) => (
        <div key={i} className="drop-launcher" style={{ left: cx - 16 }}>
          <button
            className="btn-drop"
            onClick={() => dispatchGameAction('prizedropDropBall', i)}
          />
          <div className="launcher-spout" />
        </div>
      ))}
    </div>
  );
}
```

```javascript
// scripts/simulationRunner.mjs
function dropX(posIndex) {
  const margin = (B.WIDTH - 300) / 2; // 30
  return margin + posIndex * (300 / 4); // 30/105/180/255/330
  // ⚠️ GameJsonHud.tsx DROP_CENTER_X와 반드시 동일
}
```

---

## R-12. bank 생성 절차 (simulationRunner.mjs 핵심)

```javascript
// scripts/simulationRunner.mjs 핵심 구조
import Matter from 'matter-js';
import fs from 'fs';

const B = { WIDTH: 360, HEIGHT: 396, PIN_RADIUS: 5, BALL_RADIUS: 9, SLOT_COUNT: 7, CENTER_X: 180 };
const PATHS_PER_COMBO = parseInt(process.argv[2] || '20');

async function runSimulation(targetSlot, dropPosition, pathCount) {
  const engine = Matter.Engine.create();
  const world = engine.world;
  engine.gravity.y = 1;

  // CSV 기반 장애물 생성 (boardBuilder와 동일 로직)
  const obstacles = buildObstaclesFromCSV(world);

  const paths = [];
  for (let i = 0; i < pathCount; i++) {
    const path = await simulateSingleDrop(engine, world, targetSlot, dropPosition);
    if (path) paths.push(path);
    Matter.Engine.clear(engine);
  }
  return paths;
}

// 슬롯 0~6 × 드롭 위치 0~4 = 35개 파일
for (let slot = 0; slot < B.SLOT_COUNT; slot++) {
  for (let drop = 0; drop < 5; drop++) {
    const paths = await runSimulation(slot, drop, PATHS_PER_COMBO);
    const filename = `game_data/bank/bank_slot${slot}_drop${drop}.json`;
    fs.writeFileSync(filename, JSON.stringify(paths, null, 2));
    console.log(`✓ ${filename} (${paths.length}개 경로)`);
  }
}
```


---

## R-13. 에셋 교체 시스템 (sprite_url 분기)

### 코드 1

```typescript
const SlotLightningSchema = z.object({
  // ... 기존 필드 ...
  sprite_url: z.string().optional(),
});
const BoardObstacleSchema = z.object({
  // ... 기존 필드 ...
  sprite_url: z.string().optional(),
});
```

### 코드 2

```typescript
if (cfg.sprite_url) {
  const tex = new THREE.TextureLoader().load(cfg.sprite_url);
  mat = new THREE.MeshBasicMaterial({ map: tex, transparent: true, alphaTest: 0.1, depthWrite: false });
} else {
  mat = new THREE.MeshBasicMaterial({ color: cfg.slot_color });
}
```

### 코드 3

```
public/assets/
  slots/      normal.png, jackpot.png
  obstacles/  pin.png, reward.png
  bg/         default.png
  fx/         particle.png
```

### 코드 4

```bash
node scripts/gen_sprites.mjs
```

