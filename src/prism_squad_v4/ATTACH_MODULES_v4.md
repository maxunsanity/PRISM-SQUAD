---
doc_generation: mdv4
condense_policy: forbidden
scope: "코어 스퀘어에 선택 모듈을 붙이는 계약 — 있으면 붙임, 없으면 생략"
---

# PRISM SQUAD — 선택 모듈 조립 (ATTACH_MODULES v4)

> **코어만:** 이 문서·이벤트 md **읽지 않음**. `src/prism_squad_v4/GAME_*` · `DEV_*` · `public/*.csv` 만.  
> **「타이쿤 붙여줘」:** 아래 표에서 해당 행의 **v4 mdv4 경로 전부** + **호스트 연동 절** 추가 구현.

---

## 1. 모듈 카탈로그 (SSoT)

| module_id | 유형 | v4 문서 (백화점) | 배포 CSV | 호스트 연결 | 없으면 |
|-----------|------|------------------|----------|-------------|--------|
| `core` | 필수 | `src/prism_squad_v4/` | `public/*.csv` | `App.tsx` · `GameCore` | — |
| `tycoon_season` | 인게임 HUD | `src/eventSystem/tycoonSeason/mdv4/` | `public/event/tycoonSeason/` | `EventBridge` · `loadAllEventData` | `eventData=null` → HUD 없음 |
| `lava` | iframe | `src/eventSystem/Lava Quest _game_end/mdv4/` | `public/event/lavaQuest/` | `eventMinigameHost` · `lq:start_attempt` | `showLavaQuest=false` 또는 미등록 |
| `prize` | iframe | `src/eventSystem/prize-drop_end/mdv4/` | `public/event/prizeDrop/game_data/` | iframe · `event:grant` | `showPrizeDrop=false` |
| `archery` | iframe | `src/eventSystem/Archery Arena_game_end/mdv4/` | `public/event/archeryArena/` | postMessage `aa:*` | `showArcheryArena=false` |
| `mall_marvels` | 세일 React | `src/eventSystem/mallMarvels/mdv4/` | `public/event/mallMarvels/` | `SalesHostBridge` · `loadAllSalesEventData` | CSV 필수 (코드 폴백 없음) |
| `drivers_joy` | 세일 React | `src/eventSystem/driversJoy/mdv4/` | `public/event/driversJoy/` | 동일 sales | 동일 |

**성공 md (이벤트):** 라바·퍼즐·양궁 mdv3 → **mdv4에 전량 복제됨**. 코어는 **mdv4에서 처음 정리 중**.

---

## 2. 「스퀘어만」 구현 절차

1. `src/prism_squad_v4/GAME_prism_squad_v4.md`
2. `DESIGN_prism_squad_v4.md` (+ `src/style.css` 전문 §Quick Start)
3. `DEV_prism_squad_v4.md` (§6-bis CSV 인덱스, §14·15 CSV 전문)
4. `RECIPE_prism_squad.md` · `RECIPE_CODE_prism_squad.md`
5. `public/*.csv` fetch — `src/game/data.ts` `CSV_PATHS`
6. **구현:** `App.tsx`에서 `loadAllEventData` / `EventBridge` / `SalesEventOverlay` / `EventMinigameOverlay` **제거 가능** (단독 빌드 시)

---

## 3. 모듈별 붙이기 절차

### 3-A. 타이쿤·시즌 (`tycoon_season`)

**전제:** `public/event/tycoonSeason/event_board_config.csv` 에 `enabled=1` 행 존재.

| 단계 | 작업 |
|------|------|
| 1 | `tycoonSeason/mdv4/` GAME·DEV·DESIGN·RECIPE·RECIPE_CODE 읽기 |
| 2 | `App.tsx`: `loadAllEventData()` → `eventCatalog.validate(eventHudSpec)` → `setEventData` |
| 3 | `useEffect`: `new EventBridge(eventData)` → `core.attachEventBridge(bridge)` |
| 4 | JSX: `EventDataProvider` + `EventHudRenderer` slot=mileage/tournament/modal |
| 5 | `showEventHud = shouldShowEventHud && !iframeOpen` (라바 호스트 전투 중에도 표시) |
| 6 | `GameCore` 킬: `eventBridge.onEnemyKilled(id, ticketMultiplier)` |

**금지:** `eventStore` 키를 `hudStore`에 넣기 · mall CSV와 공유.

### 3-B. iframe 미니게임 (`lava` | `prize` | `archery`)

**전제:** `src/game/eventMinigameRegistry.ts` 에 id 등록 + `public/event/<id>/index.html` 빌드 산출.

| 단계 | 작업 |
|------|------|
| 1 | 해당 `…/mdv4/DEV_*` §4 json-render · §postMessage |
| 2 | `EventMinigameOverlay` + `openEventMinigame(id)` |
| 3 | 로비 `EventMiniCards` — `EVENT_MINIGAME_ORDER` · `showFlag` hud 경로 |
| 4 | 라바 전투: iframe `lq:start_attempt` → `suspendEventMinigame()` → `startLavaQuestMode()` |
| 5 | 보상: `event:grant` → `GameCore.grantReward()` |

**postMessage (호스트 수신):**

| type | 동작 |
|------|------|
| `lq:start_attempt` | 라바 호스트 전투 진입 |
| `event:grant` | 보상 지급 (라바·퍼즐·양궁 번들) |
| `event:showRewardDetail` | `RewardDetailOverlay` |
| `aa:ready` / `aa:consumeBow` / `aa:claimed` | 양궁 전용 (`App.tsx`) |

### 3-C. 세일 (`mall_marvels` + `drivers_joy`)

| 단계 | 작업 |
|------|------|
| 1 | `mallMarvels/mdv4/` · `driversJoy/mdv4/` 읽기 |
| 2 | `loadAllSalesEventData()` → `bindSalesToCore(core)` |
| 3 | `SalesEventOverlay` — 좌측 탭 z48, 모달 z62 |
| 4 | `SalesHostBridge`: gems · cash · `grantSalesRewards` |

---

## 4. App.tsx 레이어 순서 (DOM · z-index)

```
canvas (Three.js z0)
EventHud mileage/tournament (z 11 / 40 lobby)
SalesEventOverlay (z 48 / 62 modal)
PrismHud bar (z 10)
PrismHud modal (z 30)
EventMinigameOverlay iframe (z 500 visible)
Toast / RewardDetail (z 520+)
```

상세 z: `DESIGN_prism_squad_v4.md` §5.

---

## 5. 데이터 로드 실패 정책

| 로더 | 실패 시 |
|------|---------|
| `loadAllGameData` | 게임 전체 에러 화면 |
| `loadAllEventData` | `eventData=null` — **코어만 계속** |
| `loadAllSalesEventData` | 코드 fallback 데이터 (DEV에 명시) |

---

## 6. AI 프롬프트 예시

```
PRISM 스퀘어 코어만 v4대로 구현해줘. (이벤트 md 읽지 마)
```

```
PRISM 코어 구현 후, tycoonSeason/mdv4 문서 읽고 타이쿤 이벤트만 붙여줘.
```

```
코어 + 라바 iframe만. Lava mdv4 + HOST postMessage 절 준수.
```

---

## 7. 관련 소스 (RECIPE_CODE에 전문)

- `src/game/eventMinigameRegistry.ts`
- `src/eventSystem/tycoonSeason/host/EventBridge.ts`
- `src/App.tsx` (load · bridge · message)
- `src/game/GameCore.ts` (`attachEventBridge`, `onEnemyKilled` 호출)

전문: `RECIPE_CODE_prism_squad.md`
