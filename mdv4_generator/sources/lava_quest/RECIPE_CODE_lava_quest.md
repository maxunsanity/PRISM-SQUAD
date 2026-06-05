# Lava Quest — Recipe Code

> 이 파일이 있으면 코드를 그대로 사용한다. 임의 수정 금지.
> 이 파일이 없으면 RECIPE.md 설명을 보고 직접 구현한다.

---

## R-01. json-render Provider 래핑

```tsx
// src/jsonRender/GameJsonLava.tsx
import {
  StateProvider,
  ActionProvider,
  VisibilityProvider,
} from '@json-render/react';
import { hudExternalStore } from '../game/hudExternalStore';
import { overlayActionHandlers } from '../game/gameControlBridge';

export function GameJsonLava() {
  return (
    <StateProvider store={hudExternalStore}>
      <ActionProvider handlers={overlayActionHandlers}>
        <VisibilityProvider>
          <Renderer spec={playSpec} registry={registry} />
        </VisibilityProvider>
      </ActionProvider>
    </StateProvider>
  );
}
```

---

## R-02. $state 3곳 동시 패치

```typescript
// 1. src/game/hudExternalStore.ts
import { createStateStore } from '@json-render/react';

const initialState = {
  hud: {
    levelText: '레벨 1',
    playersText: '100명',
    timerText: '00:00',
    phase: 'MATCHING',
    busyDisabled: false,
  },
};
export const hudExternalStore = createStateStore(initialState);
```

```typescript
// 2. src/game/syncLavaHud.ts
import { hudExternalStore } from './hudExternalStore';
import type { LavaSnapshot } from './types';

export function syncLavaHud(snapshot: LavaSnapshot) {
  hudExternalStore.set('/hud/levelText', `레벨 ${snapshot.clearsCompleted + 1}`);
  hudExternalStore.set('/hud/playersText', `${snapshot.playersAlive}명`);
  hudExternalStore.set('/hud/timerText', snapshot.timerText);
  hudExternalStore.set('/hud/phase', snapshot.phase);
  hudExternalStore.set('/hud/busyDisabled', snapshot.busy);
}
```

```tsx
// 3. src/jsonRender/GameJsonLava.tsx — Spec
const playSpec = {
  root: 'jrRoot',
  elements: {
    levelEl: {
      type: 'HudLevelBlock',
      props: { value: { $state: '/hud/levelText' } },
      visible: true,
    },
    playersEl: {
      type: 'HudPlayersBlock',
      props: { value: { $state: '/hud/playersText' } },
      visible: true,
    },
    timerEl: {
      type: 'HudTimerBlock',
      props: { value: { $state: '/hud/timerText' } },
      visible: true,
    },
  },
};
```

---

## R-03. getSnapshot() 캐시 패턴

```typescript
// src/game/LavaQuestGame.ts
export class LavaQuestGame {
  private clearsCompleted = 0;
  private playersAlive = 100;
  private busy = false;
  private subscribers = new Set<() => void>();
  private _snapshot!: LavaSnapshot;

  constructor() {
    this._snapshot = this._buildSnapshot();
  }

  subscribe = (fn: () => void) => {
    this.subscribers.add(fn);
    return () => this.subscribers.delete(fn);
  };

  private notify(): void {
    this._snapshot = this._buildSnapshot();
    this.subscribers.forEach((fn) => fn());
    syncLavaHud(this._snapshot);
  }

  getSnapshot = (): LavaSnapshot => this._snapshot;

  private _buildSnapshot(): LavaSnapshot {
    return {
      clearsCompleted: this.clearsCompleted,
      playersAlive: this.playersAlive,
      busy: this.busy,
      phase: this.phase,
      timerText: this.timerText,
    };
  }
}
```

---

## R-04. Three.js 카메라 설정

```typescript
// src/three/setup.ts
export function createLavaTopViewBasics(container: HTMLElement) {
  const { width, height } = container.getBoundingClientRect();
  const aspect = width / height;
  const frustumHalfH = 32;
  const halfW = frustumHalfH * aspect;

  const camera = new THREE.OrthographicCamera(
    -halfW, halfW, frustumHalfH, -frustumHalfH, 0.4, 220
  );

  const lookWorld = new THREE.Vector3(0, -2.95, -8); // Z 음수 = 화면 상단
  const cameraLiftY = 72;

  camera.up.set(0, 1, 0); // ✅ (0,0,-1) 절대 금지
  camera.position.copy(lookWorld).add(new THREE.Vector3(0, cameraLiftY, 0));
  camera.lookAt(lookWorld);

  // ...

  // ❌ camera.up.set(0, 0, -1) → NaN 크래시
}
```

---

## R-05. ResizeObserver + disposeScene

```typescript
// src/three/setup.ts
export function createLavaTopViewBasics(container: HTMLElement) {
  const renderer = new THREE.WebGLRenderer({ antialias: true });
  let ro: ResizeObserver;

  function resize() {
    // ✅ container 기준 — window 금지
    const { width, height } = container.getBoundingClientRect();
    renderer.setSize(width, height, false);
    const aspect = width / height;
    camera.left = -frustumHalfH * aspect;
    camera.right = frustumHalfH * aspect;
    camera.updateProjectionMatrix();
  }

  ro = new ResizeObserver(resize);
  ro.observe(container);
  resize();

  return {
    renderer, camera,
    dispose: () => {
      ro.disconnect(); // ✅ disconnect 필수 — 누락 시 씬 교체 후 크래시
      renderer.dispose();
    },
  };
}
```

---

## R-06. 씬 마운트 타이밍

```typescript
// 로비 진입 시
async function enterLobby() {
  showScreen('screen-lobby');
  await frameWait(2); // ✅ DOM 렌더 대기 — 없으면 getBoundingClientRect() = 0
  lobbyScene = mountLavaScene(
    document.getElementById('canvas-container')!,
    csvData
  );
}

function frameWait(n: number): Promise<void> {
  return new Promise(resolve => {
    let count = 0;
    function tick() {
      if (++count >= n) resolve();
      else requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  });
}

// ❌ 즉시 마운트 — getBoundingClientRect() = 0
// showScreen('screen-lobby');
// mountLavaScene(container, csvData); // 높이 0
```

---

## R-07. 탈락 연출 타이밍 — 차이값 × PACE

```typescript
// src/three/lavaScene.ts
const PACE = 0.52; // 고정. 임의 변경 금지.

async function runEliminationSequence(elimPlan: ElimStep[]) {
  let prevScheduled = 0;

  for (const step of elimPlan) {
    // ✅ 차이값 × PACE — 절대 지연 금지
    const waitMs = Math.floor((step.delay_ms - prevScheduled) * PACE);
    prevScheduled = step.delay_ms;
    await delay(Math.max(0, waitMs));

    const botIdx = botIdToIndex(step.bot_id);
    if (botIdx !== null) {
      eliminateBot(botIdx);
    }
  }

  // ❌ 잘못된 구현 — 절대 지연 (3배 이상 느림)
  // await delay(step.delay_ms);
}
```

---

## R-08. 마커 생성 — CircleGeometry + depthTest:false

```typescript
// src/three/players.ts
export function worldUnitsPerPixel(cam: THREE.OrthographicCamera, canvasHeightPx: number) {
  return (cam.top - cam.bottom) / Math.max(canvasHeightPx, 1);
}

export function createPlayerSprites(
  worldRoot: THREE.Group,
  count: number,
  markerRadiusWorld: number
): THREE.Group[] {
  const meshes: THREE.Group[] = [];

  for (let i = 0; i < count; i++) {
    const group = new THREE.Group();
    group.position.y = i * 0.001; // Z-fighting 방지

    // 외곽선
    const outline = new THREE.Mesh(
      new THREE.CircleGeometry(markerRadiusWorld * 1.1, 48), // ✅ CircleGeometry(2D)
      new THREE.MeshBasicMaterial({
        color: 0x000000,
        depthTest: false, // ✅ 필수
        depthWrite: false
      })
    );
    group.add(outline);

    // 본체
    const mesh = new THREE.Mesh(
      new THREE.CircleGeometry(i === 0 ? markerRadiusWorld * 1.1 : markerRadiusWorld, 48),
      new THREE.MeshBasicMaterial({
        color: i === 0 ? 0x00ffff : 0xffffff, // 플레이어: 사이언, 봇: 흰색
        depthTest: false,
        depthWrite: false,
      })
    );
    group.add(mesh);

    group.rotation.x = -Math.PI / 2; // ✅ 눕힘 필수
    group.visible = false;
    worldRoot.add(group);
    meshes.push(group);
  }

  return meshes;
}

// 마커 크기 동적 계산
// const wpp = worldUnitsPerPixel(ctx.camera, ctx.renderer.domElement.height);
// const markerWorldR = wpp * 3.85; // ✅ wpp × 3.85

// ❌ SphereGeometry — 탑뷰에서 안 보임
// new THREE.SphereGeometry(0.3, 16, 16)

// ❌ 고정 크기
// const markerSize = 0.28
```

---

## R-09. 탈락 연출 — X축 튕겨남

```typescript
// src/three/players.ts
export function xzScatterDelta(botIndex: number, slot: number): THREE.Vector3 {
  const u = ((((botIndex + 911) >>> 3) ^ (slot * 17489) ^ (botIndex * 31337)) >>> 0) % 9973 / 9973;
  const v = ((((botIndex * 7919 + slot * 793) >>> 0) ^ 9277)) % 9833 / 9833;

  return new THREE.Vector3(
    (-12 + u * 24) * 1.05, // ✅ X축 넓게 (-12~+12)
    -0.1 - v * 0.24,
    (v - 0.5) * 4.8 * 0.32 // Z는 좁게
  );
}

// 탈락 후 처리
function eliminateBot(idx: number, mesh: THREE.Group) {
  // ✅ 회색으로 변경. 완전 제거 금지.
  const body = mesh.children.find(c => c instanceof THREE.Mesh) as THREE.Mesh;
  if (body) (body.material as THREE.MeshBasicMaterial).color.set(0x6a6a6a);

  alive.delete(idx);
  frozenOnField.add(idx);
}

// ❌ Y축 포물선 낙하 — 탑뷰에서 전혀 안 보임
// tweenParabolicFall(marker, pushDir, durationMs)
```

---

## R-10. 실패 연출 임시 씬

```typescript
// src/game/LavaQuestGame.ts
async function playFailAnimation() {
  // ✅ JS로 임시 생성 — index.html 고정 배치 금지
  const fxMount = document.createElement('div');
  fxMount.className = 'lq-fx-mount';
  document.body.appendChild(fxMount);

  const tempScene = mountLavaScene(fxMount, csvData);

  try {
    await tempScene.animateSelfEliminate();
  } finally {
    tempScene.disposeScene(); // ✅ cleanup
    fxMount.remove();         // ✅ DOM 제거
  }

  // ❌ index.html에 고정 배치 금지
  // <div id="lq-fx-mount" class="lq-fx-mount"></div>
  // → WebGL이 항상 화면을 덮어 마커 연출 차단
}
```

---

## R-11. busy 가드

```typescript
// 모든 async 핸들러
async function onBtnSuccess() {
  if (this.busy) return; // ✅ 중복 탭 차단
  this.busy = true;
  this.notify();

  try {
    await this.resolveSuccess();
  } finally {
    this.busy = false; // ✅ 항상 해제
    this.notify();
  }
}
```


---

## R-12. 에셋 교체 시스템 (sprite_url 분기)

### 코드 1

```javascript
// createPlayerSprites() 내 분기
const spriteUrl = bots[i]?.sprite_url ?? '';
if (spriteUrl) {
  const size = markerRadiusWorld * 2;
  const tex = loader.load(spriteUrl);
  const planeMat = new THREE.MeshBasicMaterial({ map: tex, transparent: true, alphaTest: 0.1, depthTest: false, depthWrite: false });
  const sprite = new THREE.Mesh(new THREE.PlaneGeometry(size, size), planeMat);
  group.add(sprite);
} else {
  // 기존 CircleGeometry 원형 마커
}
```

### 코드 2

```
public/assets/
  avatars/    player.png, bot.png
  bg/         lava.png, bridge.png
  fx/         dust.png
```

### 코드 3

```bash
node scripts/gen_sprites.mjs
```

### 코드 4

```csv
bot_001,무장윤씨1,🔥,-3.8,/assets/avatars/character_01.png
```

