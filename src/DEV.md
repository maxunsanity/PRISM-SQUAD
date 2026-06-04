---
identity:
  name: PRISM SQUAD
  doc_type: DEV
  scope: "기술 명세 — 스택·파일구조·CSV 스키마·Anti-Patterns"
---

# PRISM SQUAD — DEV.md

> **대상**: 개발자 · AI 에이전트  
> **게임 기획**: `src/GAME.md`  
> **비주얼 시스템**: `src/DESIGN.md`  
> **이벤트 시스템**: `src/eventSystem/EVENT_MANAGEMENT.md`

---

## 1. 스택

| 항목 | 값 |
|------|-----|
| 빌드 | Vite + TypeScript |
| UI | React 18 (`useSyncExternalStore`) |
| 3D | Three.js (WebGLRenderer, OrthographicCamera) |
| UI 선언 | json-render 패턴 (Spec → Catalog → Registry) |
| 상태 | External Store (React context 없음) |
| 데이터 | CSV (public/) — 런타임 fetch |

---

## 2. 파일 구조

```
src/
├── App.tsx                    ← 유일한 진입점. Three.js + React 초기화
├── main.tsx
├── style.css                  ← 전역 CSS + keyframe 애니메이션
├── GAME.md / DESIGN.md / DEV.md
│
├── game/
│   ├── GameCore.ts            ← 메인 게임 루프, 스테이지 관리, EventBridge 연결
│   ├── EnemySystem.ts         ← 적 AI, 이동, 접촉 데미지
│   ├── SkillSystem.ts         ← 스킬 장착/발사/투사체 전체
│   ├── BossController.ts      ← 보스 AI, BOSS_INTRO 연출
│   ├── DropSystem.ts          ← XP/아이템 드롭, 자석 픽업
│   ├── VfxSystem.ts           ← 파티클 VFX
│   ├── InputController.ts     ← 조이스틱(터치) + WASD(PC)
│   ├── hudExternalStore.ts    ← HUD $state 브릿지 (/hud/*, /lobby/* 등)
│   ├── shopUtils.ts
│   └── data.ts                ← CSV 파싱 + 타입 정의
│
├── three/
│   ├── Renderer3D.ts          ← WebGLRenderer, OrthographicCamera, 루프
│   ├── EnemyMesh.ts           ← InstancedMesh 기반 적 렌더러 (4종)
│   ├── PlayerMesh.ts          ← 플레이어 메쉬
│   └── ArenaWallSystem.ts     ← 맵 벽
│
├── jsonRender/
│   ├── prismHudSpec.ts        ← HUD Spec 주문서 ($state 바인딩)
│   ├── registry.tsx           ← React 구현 (컴포넌트 등록)
│   ├── catalog.ts             ← Spec 유효성 검증
│   ├── operationalUi.ts       ← 게임 UI 컴포넌트 (모달·버튼·바)
│   ├── equipUi.tsx            ← 장비 화면
│   ├── ShopScreen.tsx         ← 상점 화면
│   ├── ToastOverlay.tsx       ← 토스트 알림
│   ├── NavTabBar.tsx          ← 하단 탭바
│   ├── stubsAndMaterials.ts   ← 더미/머티리얼 헬퍼
│   └── shared.ts
│
└── eventSystem/               ← 이벤트 시스템 (독립 모듈, EVENT_MANAGEMENT.md 참조)

public/
├── *.csv                      ← 게임 데이터 (SSoT, CSV_PATHS)
└── event/tycoonSeason/*.csv   ← 이벤트 데이터
```

---

## 3. json-render 패턴

UI 추가/수정 시 항상 **3종 세트 동시 패치**:

```
prismHudSpec.ts  ← $state 바인딩 선언
    ↓
catalog.ts       ← 타입 유효성 검증
    ↓
registry.tsx     ← React 컴포넌트 구현
```

**규칙**:
- `visible` 제어는 Spec이 아닌 `hudStore`의 `/xxx/visible` 상태로
- `props: {}` 반드시 명시 (생략 시 catalog 오류)
- 타입 import는 파일 상단 `import type` 으로만

---

## 4. 상태 관리

### hudExternalStore (게임)

```
/hud/timer, /hud/hpPct, /hud/level, /hud/expPct, /hud/killCount, /hud/gold
/hud/bossHpPct, /hud/bossName, /hud/bossVisible, /hud/bossWarningVisible
/hud/activeSkillSlots
/lobby/visible, /shop/visible, /equip/visible, /challenge/visible
/evolution/visible, /talent/visible, /energy/visible, /avatar/visible
/result/visible, /pause/visible, /modal/visible, /battle/visible
/scene/transitionVisible, /scene/transitionText
/bossIntro/phase
/luckyTrain/visible
/advUp/visible
```

### eventExternalStore (이벤트)

`/event/*` 경로만. `hudExternalStore`와 완전 분리. → `src/eventSystem/tycoonSeason/store/eventExternalStore.ts`

---

## 5. Three.js 규칙

### z-레이어 (절대 변경 금지)

| 오브젝트 | z |
|----------|---|
| 바닥 | -2.0 ~ -1.2 |
| 적 InstancedMesh | 0.5 |
| 화염장판/오라 | 0.5 |
| 스킬 투사체 | **1.0** ← 반드시 |
| 가디언 블레이드 | 2.0 |
| 드론 본체 | 8.0 |

카메라: z=500, -Z 방향 → z 클수록 앞에 표시

### 머티리얼 정책

- **MeshBasicMaterial 전용** (조명 없음)
- `MeshStandardMaterial` 사용 금지

### InstancedMesh 규칙

- 적 4종 각 InstancedMesh 1개 (draw call 4개 고정)
- `MAX_INSTANCES = 512` per type
- **`frustumCulled = false` 필수** (없으면 적 안 보임)
- 인스턴스 숨김: `scale=0` + `z=-9999`

---

## 6. CSV 스키마 (SSoT)

모든 수치는 CSV만 수정. 코드 하드코딩 금지. 경로는 `data.ts` `CSV_PATHS` 단일 관리.

| 파일 | 주요 필드 | 담당 |
|------|-----------|------|
| `player_config.csv` | hp, speed, radius, invincible_frames | 밸런스 |
| `enemy_config.csv` | enemy_id, hp, speed, contact_dmg, exp_drop_type, gold_drop | 밸런스 |
| `boss_config.csv` | boss_id, hp, speed, spawn_time_seconds, is_mini_boss | 밸런스 |
| `wave_config.csv` | wave_id, enemy_rates(합=1.0), spawn_count, stage_range | 밸런스 |
| `skill_config.csv` | skill_id, damage, cooldown_ms, projectile_speed, element | 밸런스 |
| `skill_level_config.csv` | skill_id, level, stat_delta | 밸런스 |
| `skill_evolution_config.csv` | active_id, passive_id, evo_id | 기획 |
| `drop_config.csv` | drop_type, effect_value (xp_small=1/medium=5/large=22) | 밸런스 |
| `level_config.csv` | level, exp_required, exp_scale_rate=1.145 | 밸런스 |
| `map_config.csv` | map_id, width, height, bg_asset | 기획 |
| `stage_config.csv` | stage_id, xp_mult, initial_xp_small | 밸런스 |
| `vfx_config.csv` | vfx_id, particle_count, bloom_strength | 아트 |
| `talent_config.csv` | talent_id, stat_key, value_per_level | 기획 |
| `talent_cost_config.csv` | level, cost | 밸런스 |
| `control_config.csv` | joystick_maxDist, deadzone | 기획 |
| `lucky_train_config.csv` | gold_threshold, skill_cost_formula | 밸런스 |
| `combat_tuning.csv` | key, value (DOT·스피터·보스연출·러시 등) | 밸런스 |
| `element_config.csv` | effect_type, duration_sec, tick_interval_sec | 밸런스 |
| `player_visual_config.csv` | key, value (PlayerMesh 연출) | 아트/체감 |
| `renderer_config.csv` | key, value (Renderer3D 카메라·격자) | 아트 |
| `skill_runtime_config.csv` | key, value (스킬 런타임) | 밸런스 |
| `boss_pattern_config.csv` | boss_id, key, value | 밸런스 |

**wave_config 필수 제약**: 같은 wave_id의 enemy rate 합 = **정확히 1.0**

---

## 7. gameState 전이

GameState 타입 = `PLAYING | LEVELUP | PAUSED | BOSS_INTRO | GAMEOVER` (**5종, VICTORY 없음**).

```
PAUSED(초기/로비) → PLAYING ↔ LEVELUP
PLAYING → PAUSED(일시정지/행운열차) → PLAYING
PLAYING → BOSS_INTRO(600초) → PLAYING(보스전)
PLAYING → GAMEOVER  ── 승/패 공통 수렴
```

- `PAUSED`: 초기 상태(게임 시작 전 로비) + 인게임 일시정지/행운열차
- `BOSS_INTRO`: 최종보스 600초 등장. phase1 WARNING(~1300ms) → phase2 암전+등장(~1000ms) → phase3 충격파(800ms) 후 PLAYING(보스전)
- 보스 등장 후에도 `PLAYING` 유지 (별도 enum 없음)
- ⚠️ **VICTORY는 독립 gameState가 아님**: 보스 처치(승)·HP0(패) 모두 `GAMEOVER`로 수렴. 결과창은 `/result/isVictory` 불린으로 승("클리어!")/패("실패") 구분.

> 화면별 트리거($state·gameState)·구성요소는 `DESIGN.md §10`, 전체 유저 플로우는 `GAME.md ## User Flow`.

---

## 8. 게임 핵심 수치 (기획 확정, 수정 시 GAME.md와 동기화)

| 항목 | 값 |
|------|-----|
| 게임 시간 | 10분 (600초) |
| 최종보스 등장 | 600초 (`boss_config.spawn_time_seconds`) |
| 미니보스 주기 | 100초마다 CRUSHER ↔ NEXUS 교대 |
| 러시 주기 | 50초마다 |
| 대각선 이동 | `vx=+1, vy=-1` → √2배 (의도된 스펙, 수정 금지) |
| 조이스틱 maxDist | 40px, 동적 생성(터치 지점 Pivot) |

---

## 9. 이벤트 연동 계약 (코어↔이벤트 3계층) — 재현 SSoT

> 코어(GameCore)는 이벤트에 **약결합**. `EventBridge`를 `import type`(런타임 의존 없음)으로만 참조하고 `null` 가능 필드로 보유 → **코어 단독 동작 보장**. 계층별 연동 방식이 다르므로 정확히 구분할 것.

### 9.1 계층 ③ — 타이쿤·시즌 (EventBridge, 인게임 킬 적립)

`src/eventSystem/tycoonSeason/host/EventBridge.ts` 실제 시그니처:

```ts
class EventBridge {
  constructor(data: EventData)
  onRewardGranted?: (bundleId: string) => void  // 마일스톤/순위 보상 콜백
  dispose(): void
  syncTicketMultiplier(ticketMultiplier: number): void  // 입장 배수 확정 시 UI 칩 동기화
  onEnemyKilled(enemyId: string, ticketMultiplier: number): void
  tick(dt: number): void
  getTycoonPoints(): number
  getSeasonCoins(): number
}
```

⚠️ **`onBossKilled` / `onGameTick` / `onGameEnd` 메서드는 없다.** 보스 사망 = `onEnemyKilled('final_boss', mult)`, 틱 = `tick(dt)`, 종료 = 코어가 `getTycoonPoints()`를 **pull**(전용 종료 메서드 없음).

GameCore 내 호출 지점(전부):
```ts
this.eventBridge?.tick(dt);                                          // 메인 루프
this.eventBridge?.onEnemyKilled(dead.cfg.enemy_id, this.ticketMultiplier); // 일반 적 사망
this.eventBridge?.onEnemyKilled('final_boss', this.ticketMultiplier);      // 보스 사망(_onBossDeath)
this.eventBridge?.getTycoonPoints() ?? <폴백>                         // 결과창 tycoonEarned
this.eventBridge?.syncTicketMultiplier(mult);                        // 배수 토글/입장/전투시작
```
결과창 적립: `getTycoonPoints()`(EventController 누적, `event_kill_reward_config.csv` 기반). **EventBridge 미부착(코어 단독) 시에만** 폴백 `(killCount + result_clear_bonus_kills) * ticketMultiplier`.

### 9.2 계층 ① — iframe 미니게임 (lava / prize / archery)

postMessage 브릿지. 코어→iframe 진입, iframe→코어 보상.

```ts
// 보상 환류 (App.tsx: window 'message' → core.grantReward)
grantReward(rewards: Array<{ kind: string; amount?: number; slotId?: string }>)
//  kind: 'gold'→metaGold / 'gem'→metaGems / 'lightning'→metaEnergy / 'equip'→equipLevels[slotId]
//  (slotId = equipment_config.slot_id, 예: prize_crown)
//  보상 라인 없이 bundleId만 오면 archeryBundleToGrant(bundleId)로 변환
```
- 등록: `src/game/eventMinigameRegistry.ts`(`EventMinigameId='lava'|'prize'|'archery'` union + FALLBACK 내장) + `public/event_minigame_host_config.csv`(`id,label,emoji,tab_bg,src,ticket_path,ticket_cost,ticket_unit,show_flag_key,persist_keys,enabled`)
- 입장 차감(`eventMinigameHost.openEventMinigame`): `ticket_cost>0`이면 `ticket_path`에서 차감(lava=`/lobby/lavaTickets` 1, prize=`/lobby/prizeBalls` 1, archery=0)
- Lava만 코어 전투 진입형: iframe "도전 시작" → `lq:start_attempt` → `startLavaQuestMode` → 전투(라바 호스트) → `_onLavaQuestEnd` → iframe 복귀

### 9.3 계층 ② — 세일 오버레이 (mallMarvels / driversJoy)

`SalesHostBridge`(`src/eventSystem/sales/createPrismSalesHost.ts`) → 코어 직접 메서드:
```ts
grantRewards:   lines => core.grantSalesRewards(lines)   // reward_type: energy|meta_gold|gems|supply_key|dna|open_box|equip_lv
trySpendCashKrw: a => core.trySpendSalesCashKrw(a)        // metaCashKrw 차감
trySpendGems:    a => core.trySpendSalesGems(a)
getWallet:      () => core.getSalesWallet()               // {cashKrw,gems,gold,energy}
```

### 9.4 빌드 스코프 (이벤트 포함/제외) — 핵심 메커니즘

- **코어 단독화 = `App.tsx`의 `eventData null 가드 + attachEventBridge(null)`.** 이벤트 CSV 로드 실패/부재 → `setEventData(null)` → bridge 미생성 → 코어 옵셔널 체이닝으로 전부 no-op.
- 게임 데이터·이벤트 데이터·세일 데이터는 `loadAllGameData`/`loadAllEventData`/`loadAllSalesEventData`로 **독립 로드**("이벤트 실패해도 게임 무영향").
- 런타임 ON/OFF: 로비 햄버거 메뉴(`/lobby/show*` 토글) → `EventMiniCards`가 show 플래그로 필터.
- CSV OFF(계층①): `event_minigame_host_config.csv` `enabled=0`/행 삭제. 단 `eventMinigameRegistry.ts` `FALLBACK`에 3종 하드코딩이 있어 **완전 제외엔 FALLBACK·union도 정리** 필요.
- ❌ `EventManager.ts` / 루트 `event_board_config.csv`는 **코드에 없음**(문서 선행 설계). 실제 board_config는 `public/event/tycoonSeason/event_board_config.csv`(tycoon 전용)만 존재.

> 재현 절차: 코어 구현 전 **사용자에게 "6 이벤트 포함 통합 빌드 / 코어만 / 일부"를 질문**(기본=통합). 상세는 `GAME.md ## 이벤트 연동 (3계층) + 빌드 스코프 결정` + `ATTACH_MODULES_v4.md`.

---

## 10. 빌드 & 배포

```bash
cd "/Users/max/minigame_make/PRISM SQUAD v2"
npm run build          # tsc -b && vite build
# dist/ 폴더 생성
zip -r ~/Desktop/PRISM_SQUAD_v2.zip dist/
```

---

## Anti-Patterns

### [CRITICAL] 투사체 z 값 임의 변경
z=1.0이 아닌 투사체는 적 레이어(0.5) 아래로 숨어 보이지 않는다.

### [CRITICAL] MeshStandardMaterial 사용
조명 계산으로 성능 저하 + 비주얼 불일치. `MeshBasicMaterial`만.

### [CRITICAL] frustumCulled = true (기본값 방치)
InstancedMesh에서 카메라 밖 적이 사라진다. 반드시 `false`.

### wave_config rate 합 != 1.0
스폰 가중치 계산 오류 → 특정 적이 절대 안 나오거나 넘침.

### hudStore에 이벤트 키 추가
이벤트 상태는 `eventStore (/event/*)` 전용. 두 스토어 혼용 금지.

### 3종 세트 중 하나만 수정
Spec만 수정하면 registry에서 컴포넌트 못 찾음. catalog만 수정하면 Spec 오류 무시. 항상 3개 동시.

### 같은 trigger 안에서 변수 선언 후 즉시 사용
LLE 연동 시 해당. 코어 게임 로직은 무관.
