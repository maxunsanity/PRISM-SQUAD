# Archery Arena — Recipe Code

> 이 파일이 있으면 코드를 그대로 사용한다. 임의 수정 금지.
> 이 파일이 없으면 RECIPE.md 설명을 보고 직접 구현한다.

---

## R-01. json-render Provider 래핑

```tsx
// src/jsonRender/GameJsonArchery.tsx
import {
  StateProvider,
  ActionProvider,
  VisibilityProvider,
} from '@json-render/react';
import { hudExternalStore } from '../game/hudExternalStore';
import { overlayActionHandlers } from '../game/gameControlBridge';

export function GameJsonArchery() {
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
    scoreText: '0',
    rankText: '50위',
    diceText: '🎲 20',
    timerText: '01:00',
    diceDisabled: false,
    screen: 'entry',
  },
};
export const hudExternalStore = createStateStore(initialState);
```

```typescript
// 2. src/game/syncArcheryHud.ts
import { hudExternalStore } from './hudExternalStore';
import type { ArcherySnapshot } from './types';

export function syncArcheryHud(snapshot: ArcherySnapshot) {
  hudExternalStore.set('/hud/scoreText', String(snapshot.targetScore));
  hudExternalStore.set('/hud/rankText', `${snapshot.rankCurrent}위`);
  hudExternalStore.set('/hud/diceText', `🎲 ${snapshot.diceCount}`);
  hudExternalStore.set('/hud/diceDisabled', snapshot.diceCount <= 0);
  hudExternalStore.set('/hud/screen', snapshot.screen);
}
```

```tsx
// 3. src/jsonRender/GameJsonArchery.tsx — Spec
const playSpec = {
  root: 'jrRoot',
  elements: {
    scoreEl: {
      type: 'HudScoreBlock',
      props: { value: { $state: '/hud/scoreText' } },
      visible: true,
    },
    rankEl: {
      type: 'HudRankBlock',
      props: { value: { $state: '/hud/rankText' } },
      visible: true,
    },
    diceEl: {
      type: 'HudDiceBlock',
      props: {
        value: { $state: '/hud/diceText' },
        disabled: { $state: '/hud/diceDisabled' },
      },
      visible: true,
    },
  },
};
```

---

## R-03. getSnapshot() 캐시 패턴

```typescript
// src/game/ArcheryGame.ts
export class ArcheryGame {
  private diceCount = 20;
  private targetScore = 0;
  private rankCurrent = 50;
  private subscribers = new Set<() => void>();
  private _snapshot!: ArcherySnapshot;

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
    syncArcheryHud(this._snapshot);
  }

  getSnapshot = (): ArcherySnapshot => this._snapshot;

  private _buildSnapshot(): ArcherySnapshot {
    return {
      diceCount: this.diceCount,
      targetScore: this.targetScore,
      rankCurrent: this.rankCurrent,
      screen: this.currentScreen,
    };
  }
}
```

---

## R-04. Three.js 렌더러 크기 — container 기준

```typescript
// src/three/setup.ts
export function initArcheryScene(
  canvasContainer: HTMLElement,
  canvas: HTMLCanvasElement
) {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
  const camera = new THREE.PerspectiveCamera(38);

  function resize() {
    // ✅ container 기준 — window 금지
    const { width, height } = canvasContainer.getBoundingClientRect();
    renderer.setSize(width, height, false); // false 필수
    camera.aspect = width / height;
    camera.updateProjectionMatrix(); // ✅ 항상 호출
  }

  const ro = new ResizeObserver(resize);
  ro.observe(canvasContainer);
  resize();

  return {
    renderer, camera,
    dispose: () => {
      ro.disconnect();
      renderer.dispose();
    },
  };
}
```

---

## R-05. flashRing — 색 lerp만

```typescript
// src/three/target.ts
export function flashRing(ring: THREE.Mesh, hitColor: THREE.Color) {
  const originalColor = ring.material.color.clone();
  let t = 0;
  const duration = visualConfig.hit_ring_pulse_ms;
  const start = performance.now();

  function animate() {
    const elapsed = performance.now() - start;
    t = Math.min(elapsed / duration, 1);

    // ✅ 색 lerp만 — scale 변경 금지
    ring.material.color.lerpColors(hitColor, originalColor, t);

    if (t < 1) requestAnimationFrame(animate);
  }

  requestAnimationFrame(animate);

  // ❌ 금지
  // ring.scale.set(1.2, 1.2, 1);
}
```

---

## R-06. 봇 타이머 — 재귀 setTimeout

```typescript
// src/game/ranking.ts
let sessionEnded = false;

export function startBotLoop(config: EventConfig) {
  sessionEnded = false;

  function botTick() {
    if (sessionEnded) return; // ✅ 정지 조건

    updateBotScores();
    recalculateRanks();

    // ✅ 재귀 setTimeout — setInterval 금지
    const delay = randBetween(config.bot_tick_min_ms, config.bot_tick_max_ms);
    setTimeout(botTick, delay);
  }

  const initialDelay = randBetween(config.bot_tick_min_ms, config.bot_tick_max_ms);
  setTimeout(botTick, initialDelay);
}

export function stopBotLoop() {
  sessionEnded = true;
}

function randBetween(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
```

---

## R-07. 봇 초기 점수 — v2-gold-balance-v5

```typescript
// src/game/ranking.ts
export function generateBotInitialScores(count: number = 49): number[] {
  // v2-gold-balance-v5 스키마
  // 1등 봇: SET5 3~4회 완벽 적중 수준 (약 1500~2000점)
  // 2~10등: 중간 분포 (500~1500점)
  // 11~49등: 낮은 분포 (0~500점)

  const scores: number[] = [];

  // 상위 1명
  scores.push(randBetween(1500, 2000));

  // 상위 2~10등 (9명)
  for (let i = 0; i < 9; i++) {
    scores.push(randBetween(500, 1500));
  }

  // 나머지 (39명)
  for (let i = 0; i < 39; i++) {
    scores.push(randBetween(0, 500));
  }

  return scores.sort((a, b) => b - a);
}
```

---

## R-08. SET3/SET5 순차 연출

```typescript
// src/game/ArcheryGame.ts
async attempt(attemptType: AttemptType) {
  if (this.diceCount < attemptConfig.cost_dice) return;

  // ✅ 즉시 차감
  this.diceCount -= attemptConfig.cost_dice;
  this.notify();

  const count = attemptType === 'SET5' ? 5 : attemptType === 'SET3' ? 3 : 1;
  const results = Array.from({ length: count }, () => rollResult());

  // ✅ 순차 연출 — count만큼 반복
  for (let i = 0; i < count; i++) {
    await shootArrow(results[i]);
    if (i < count - 1) await delay(300); // 발 간격
  }

  const totalScore = results.reduce((sum, r) => sum + r.score, 0);
  this.targetScore += totalScore;
  this.updateRanking();
  this.notify();

  // ❌ 1회만 실행 금지
  // await shootArrow(results[0]);
}

function delay(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
```

---

## R-09. localStorage 버전 체크

```typescript
// src/game/gameData.ts
const SAVE_VERSION = 2;

export function loadPlayerState(): PlayerState {
  const raw = localStorage.getItem('aa_player_state');
  if (!raw) return defaultState();

  try {
    const saved = JSON.parse(raw);
    // ✅ 버전 체크 — 불일치 시 초기화
    if (saved.version !== SAVE_VERSION) {
      localStorage.removeItem('aa_player_state');
      return defaultState(); // dice_count: 20
    }
    return saved;
  } catch {
    return defaultState();
  }
}

function defaultState(): PlayerState {
  return {
    version: SAVE_VERSION,
    dice_count: 20,
    target_score: 0,
    rank_current: 50,
    combo_count: 0,
    total_attempts: 0,
    daily_free_used: false,
  };
}
```

---

## R-10. dispose 타이밍

```typescript
// src/screens/Shooting.tsx
async function handleShotResult(result: ShotResult) {
  if (result.isBullseye) {
    // ✅ BULLSEYE: 즉시 dispose → 화면 전환
    disposeArcheryThree();
    showScreen('screen-bullseye');
  } else {
    // ✅ 일반: 확인 버튼 클릭 후 dispose
    showHitHud(result);

    document.getElementById('btn-shooting-next')!
      .addEventListener('click', () => {
        disposeArcheryThree(); // ✅ 확인 후 dispose
        showScreen('screen-lobby');
      }, { once: true });
  }

  // ❌ 잘못된 구현 — 확인 전 즉시 dispose → 과녁 사라짐
  // disposeArcheryThree();
  // showHitHud(result);
}
```


---

## R-11. 에셋 교체 시스템 (sprite_url 분기)

### 코드 1

```javascript
// buildTargetRings(scene, colors, zoneSprites = {}) — 3번째 파라미터 추가
export function buildTargetRings(scene, colors, zoneSprites = {}) {
  // backdrop
  const backdropUrl = zoneSprites['backdrop'] || '';
  if (backdropUrl) {
    const tex = new THREE.TextureLoader().load(backdropUrl);
    scene.add(new THREE.Mesh(new THREE.PlaneGeometry(size, size),
      new THREE.MeshBasicMaterial({ map: tex, transparent: true })));
  } else {
    // 기존 CircleGeometry + MeshPhong
  }
  // 각 링(OUTER/MIDDLE/CENTER/BULLSEYE)도 동일 분기
}
```

### 코드 2

```
public/assets/
  target/   backdrop.png, outer.png, middle.png, center.png, bullseye.png
  arrows/   arrow.png
  bg/       default.png
  fx/       particle.png
```

### 코드 3

```bash
node scripts/gen_sprites.mjs
```

### 코드 4

```csv
# aa_visual_config.csv
backdrop_sprite_url,outer_sprite_url,...
/assets/target/backdrop.png,/assets/target/outer.png,...
```

---

## R-11. gameEntry dynamic import

```javascript
// src/gameEntry.js
import './style.css';
import { loadAllData } from './data.js';

async function boot() {
  const loaded = await loadAllData();
  const { startGame } = await import('./game.js');
  startGame(loaded);
}

boot().catch((err) => {
  console.error(err);
  const app = document.getElementById('app');
  if (app) app.innerHTML = `<p style="padding:16px">데이터 로드 실패: ${err?.message ?? err}</p>`;
});
```

```tsx
// src/main.tsx — HUD 후 게임 부트
void import('./gameEntry.js');
```

---

## R-12. shootingBusy 상단 선언

```javascript
// src/game.js — startGame() 내부 최상단 (installHostBridge 이전)
let shootingBusy = false;
let selectedType = null;

installHostBridge(() => {
  queueMicrotask(() => {
    player.dice_count = getHostBowStands();
    refreshRank();
  });
});
```

---

## R-13. runRound(n) + autoAdvance (1발=1재화, 1~5발 선택)

```javascript
// 선택 발수 n(1~5)만큼 발사. 소비는 requestConsumeBow(n)이 선행(지갑 계약).
async function runRound(shots) {
  const n = Math.max(1, Math.floor(shots) || 1);
  let totalGain = 0;
  for (let i = 0; i < n; i++) {
    player.combo_count += 1;
    const result = calculateScore(attemptRow, player.combo_count, eventRow);
    totalGain += result.score;
    await runShootingScene(result, rankBefore, rankBefore, {
      autoAdvance: true,
      shotIndex: i + 1,
      shotTotal: n,
    });
  }
  player.target_score += totalGain;
  // … persistRanking, toast, goLobby
}

// btn-attempt: balance 충분 시 N발 소비 후 라운드
if (getHostBowStands() >= selectedShots && requestConsumeBow(selectedShots)) {
  // requestConsumeBow → balance -= N + aa:walletChanged{balance} → onConsumed(N) → runRound(N)
}
```

---

## R-14. resolveCsvUrl

```javascript
// src/data.js
export function resolveCsvUrl(filename) {
  const base = import.meta.env?.BASE_URL ?? './';
  return new URL(filename, new URL(base, window.location.href)).href;
}
```

