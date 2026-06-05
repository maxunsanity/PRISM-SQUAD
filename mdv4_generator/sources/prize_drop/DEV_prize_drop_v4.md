# Prize Drop Arcade — Developer Spec

> 게임 규칙은 `GAME.md`, 비주얼 시스템은 `DESIGN.md` 참조.
> 구현 코드는 `RECIPE_CODE.md` 참조. 없으면 이 문서의 규칙 기반으로 직접 구현.

---

## Tech Stack

| 항목 | 값 |
|---|---|
| 번들러 | Vite ^8 |
| 언어 | TypeScript ^5.5.4 |
| 물리 엔진 | matter-js ^0.19.0 (시뮬·좌표 참조용. 런타임 물리 없음) |
| 3D 렌더러 | Three.js ^0.160.0 |
| 선언 UI | @json-render/core + @json-render/react ^0.19.0 |
| React | ^18.3.1 |
| 유효성 검사 | Zod ^3.23.8 |
| 스타일 | src/style.css |

**스택 정책:** Three.js + Matter.js + React + json-render + TypeScript + Vite. 스택 변경 금지.
**Provider:** StateProvider + ActionProvider + VisibilityProvider 3개만. ValidationProvider 금지.

---

## File Structure

```
src/
  main.tsx                    진입점 — React 루트, Provider 래핑
  style.css                   전 UI 스타일 SSoT
  game/
    PrizeDrop.ts              게임 코어 — 보드 시각화, 슬롯 결정, BankPlayer 재생
    boardBuilder.ts           CSV → 장애물 좌표 참조. BOARD_CONSTANTS 정의.
    bankPlayer.ts             bank JSON 키프레임 재생. Y-flip 처리.
    bootstrapGame.ts          게임 초기화 진입점
    loadGameData.ts           CSV 파싱 + Zod 유효성 검사
    runnerDataPaths.ts        CSV 경로 SSoT
    hudExternalStore.ts       flat path 스토어 — $state 바인딩 공급원
    milestoneStore.ts         마일스톤 게이지 상태
    rewardModalStore.ts       보상 모달 큐 (enqueue/dismiss)
    gameStore.ts              공 수·배수 상태
    gameControlBridge.ts      React HUD → 게임 메서드 연결
  catalog/
    prizedropCatalog.ts       카탈로그 정의
  jsonRender/
    GameJsonHud.tsx           HUD Spec + Registry + ActionHandlers

scripts/
  simulationRunner.mjs        오프라인 물리 시뮬 → bank JSON 생성

game_data/
  01_slot_lightning.csv
  02_multiplier.csv
  03_milestone.csv
  04_board_obstacle.csv
  bank/
    bank_slot{N}_drop{M}.json  N=0~6, M=0~4, 총 35파일

index.html
```

---

## Layout & DOM Order

고정 치수 변경 금지. Three.js와 json-render 레이어 혼합 금지.

```
body (background: #a0a090, flex center, height: 100vh)
  #prize-drop-root (366×646px, position: relative)

    [Three.js 레이어]
      #game-viewport (position: absolute, top:110px, left:3px, 360×396px)

    [json-render HUD 레이어 — position: absolute, inset: 0, flex column]
      .prizedrop-hud-top (110px, z-index: 20)       ← ① 공 카운트 + 배수 + 드롭버튼
      .prizedrop-board-spacer (396px)               ← ② pointer-events: none
      #slot-labels (50px)                           ← ③ CSV 기반 슬롯 라벨
      .ms-wrap (flex: 1)                            ← ④ 마일스톤 바

    [모달 레이어]
      .rw-overlay (position: absolute, z-index: 500)
```

**핵심 규칙:**
- `#game-viewport canvas`에 `pointer-events: auto !important` 필수
- `.prizedrop-board-spacer`는 `pointer-events: none` — 보드 클릭 허용
- 모달만 `position: absolute + z-index: 500`

---

## json-render Architecture

HUD·버튼·모달은 json-render 선언형. Three.js 보드·공 궤적은 명령형 유지.

```
[1] Catalog   src/catalog/prizedropCatalog.ts
              액션 4개:
                prizedropDropBall        — 드롭 버튼 탭
                prizedropAddBalls        — [레거시·미사용] 구 +10 치트(ball_count 탭). 실재화 전환으로 제거
                prizedropCycleMultiplier — 배수 순환
                prizedropDismissModal    — 보상 모달 닫기

[2] Spec      src/jsonRender/GameJsonHud.tsx
              HUD 트리: HudTop → BoardSpacer → SlotLabels → MilestoneBar → Modal

[3] State     src/game/hudExternalStore.ts
              flat path: /hud/ball_count, /hud/multiplier 등

[4] Runtime   src/game/PrizeDrop.ts + bankPlayer.ts
              게임 상태 → hudStore.update() → HUD 자동 갱신
```

**데이터 흐름:**
```
PrizeDrop.ts → hudStore.update() → GameJsonHud.tsx 자동 재렌더
```

---

## State Paths ($state)

수정 시 **3곳 동시 패치**: `hudExternalStore.ts 초기값` + `Spec $state 문자열` + `공급원 update 키`

| 경로 | 타입 | 초기값 | 공급원 |
|---|---|---|---|
| `/hud/ball_count` | number | 10 | gameStore |
| `/hud/multiplier` | number | 1 | gameStore |
| `/hud/show_warning` | boolean | false | gameStore |
| `/hud/session_lightning` | number | 0 | milestoneStore |
| `/hud/milestone_step` | number | 0 | milestoneStore |
| `/hud/milestone_progress` | number | 0 | milestoneStore |
| `/hud/milestone_thresholds` | number[] | [100,200,300,400,500] | milestoneStore |
| `/hud/last_gain` | number | 0 | milestoneStore |
| `/hud/show_gain` | boolean | false | milestoneStore |
| `/hud/cycle_count` | number | 0 | milestoneStore |
| `/hud/modal_visible` | boolean | false | rewardModalStore |
| `/hud/modal_type` | string | '' | rewardModalStore |
| `/hud/modal_step` | number | 0 | rewardModalStore |
| `/hud/modal_reward_amount` | number | 0 | rewardModalStore |
| `/hud/modal_reward_type` | string | '' | rewardModalStore |
| `/hud/modal_remaining` | number | 0 | rewardModalStore |
| `/hud/modal_cycle_count` | number | 0 | rewardModalStore |

---

## DOM Required IDs

| ID | 역할 |
|---|---|
| `prize-drop-root` | 전체 게임 컨테이너 366×646px |
| `game-viewport` | Three.js WebGL 마운트 360×396px |
| `slot-labels` | 슬롯 라벨 (CSV 기반 렌더) |
| `jackpot-overlay` | 잭팟 풀스크린 연출 |
| `flash-overlay` | 플래시 효과 |

---

## Data Schema

> CSV 파일이 있으면 그대로 사용.
> 없으면 아래 기준 데이터로 생성.

### 01_slot_lightning.csv

| 컬럼 | 타입 | 설명 |
|---|---|---|
| slot_index | int | 0~6 (0=맨 왼쪽, 6=맨 오른쪽) |
| reward_lightning | int | 착지 시 번개 보상 |
| is_jackpot | bool | 잭팟 여부 (반드시 1개만) |
| weight | int | 착지 가중치 |
| slot_color | string | HEX 색상 |

**기준 데이터:** 0,6=1점/30, 1,5=10점/100, 2,4=20점/60, 3(잭팟)=100점/10

### 04_board_obstacle.csv — 물리·렌더 좌표 SSoT

| 컬럼 | 타입 | 설명 |
|---|---|---|
| obstacle_id | string | 고유 ID (언더바만. 하이픈 금지) |
| type | enum | pin/circle/triangle/diamond/rect |
| cx | float | 중심 X |
| cy | float | 중심 Y (Matter.js 기준. Three.js는 HEIGHT-cy) |
| radius | float | 반지름 (rect: half-size) |
| reward_type | enum | 보상 타입 (circle만 유효) |
| reward_amount | int | 보상량 |

### BOARD_CONSTANTS (boardBuilder.ts ↔ simulationRunner.mjs 반드시 동일)

| 상수 | 값 |
|---|---|
| WIDTH | 360 |
| HEIGHT | 396 |
| PIN_RADIUS | 5 |
| BALL_RADIUS | 9 |
| SLOT_COUNT | 7 |
| CENTER_X | 180 |

### bank JSON 구조

키프레임 간격 50ms. Y 좌표는 Matter.js 기준. Three.js 렌더 시 HEIGHT - y 플립.

```
{ drop_position, target_slot, duration_ms, keyframes: [{x, y, t}] }
```

---

## Session Storage

세션 저장 없음. 새로고침 시 초기화. 공 수·번개는 메모리에만 유지.

---

## Implementation Order

⚠️ **3공정 파이프라인 순서 필수. 역전 금지.**

```
[공정 1 — 보드 구현]
0단계: 심링크 — mkdir public && ln -sf ../game_data public/game_data
1단계: index.html + src/style.css
2단계: game_data/*.csv (4개)
3단계: src/game/loadGameData.ts + boardBuilder.ts
4단계: src/game/PrizeDrop.ts — Three.js 보드 시각화만
       → npm run dev → 보드 육안 확인 필수

[공정 2 — bank JSON 생성]
5단계: scripts/simulationRunner.mjs
       → BOARD_CONSTANTS와 B 상수 동일 확인 필수
6단계: node scripts/simulationRunner.mjs 20
       → game_data/bank/ 35개 파일 생성 확인

[공정 3 — 재생 구현]
7단계: src/game/bankPlayer.ts
8단계: src/game/gameStore.ts + milestoneStore.ts + rewardModalStore.ts
9단계: src/game/hudExternalStore.ts + gameControlBridge.ts
10단계: src/catalog/prizedropCatalog.ts
11단계: src/jsonRender/GameJsonHud.tsx
12단계: src/game/bootstrapGame.ts
13단계: src/main.tsx (마지막)
```

---

## Anti-Patterns

### 🎯 물리 수치 (변경 금지)

| 수치 | 값 | 이유 |
|---|---|---|
| RewardCircle restitution | 3.5 | 이하면 박진감 소멸 |
| velocity_boost | 1.2× | 에너지 감쇄 보정 |
| Pin restitution | 0.6 | 이상이면 경로 예측 불가 |
| Ball restitution | 0.8 | 표준 탄성 |
| TriangleBumper radius | 32 | 이하면 사이드 틈새 탈출 |

### ⚙️ 게임 로직

- **[CRITICAL] 모달 show() 직접 호출 금지** — rewardModalStore.enqueue() 사용
- **[CRITICAL] bank 없이 드롭 금지** — isReady 확인 필수
- **[CRITICAL] 슬롯 수 7개 변경 금지** — 전면 재설계 필요
- **[CRITICAL] separator_pin 렌더링 금지** — physics body만 유지
- **[CRITICAL] SlotLabels 하드코딩 금지** — CSV 오름차순 렌더 필수

### 📊 데이터 / CSV

- **[CRITICAL] 04_board_obstacle.csv 수정 후 bank 재생성 없이 배포 금지**
- **[CRITICAL] Zod enum과 CSV type 비동기화 금지** — 블랙스크린
- **[CRITICAL] BOARD_CONSTANTS 단일 파일만 수정 금지** — 양쪽 동시
- **dropX 좌표 단일 파일만 수정 금지** — simulationRunner + PrizeDrop 동시

### 🎥 Three.js

- **[CRITICAL] PerspectiveCamera 금지** — OrthographicCamera만
- **[CRITICAL] bankPlayer에서 viewHeight 금지** — BOARD_CONSTANTS.HEIGHT(396) 사용
- **[CRITICAL] Y-flip 누락 금지** — Three.js Y = HEIGHT - Matter.js cy

### 🔗 json-render

- **emit 두 번째 인자 사용 금지** — 무시됨
- **props:{} 누락 금지** — resolveBindings TypeError
- **slots.default 접근 금지** — children 배열만
- **$state 경로 수정 시 3곳 미동시 패치 금지**
- **ValidationProvider 추가 금지**

### ⚛️ React 18

- **getSnapshot() 매번 새 객체 반환 금지** — tearing
- **스토어 메서드 일반 함수 선언 금지** — this 유실
- **외부 스토어 useState 사용 금지** — useSyncExternalStore 사용

### 🖼️ UI

- **[CRITICAL] 보드 치수 변경 금지** — 366×646 / 360×396
- **[CRITICAL] rect bumper(bump_0~5) 삭제 금지** — 슬라이딩 방지 필수
- **[CRITICAL] canvas pointer-events 누락 금지** — auto !important
- **인라인 style 금지**

### 🔄 공정 순서

- **[CRITICAL] 공정 2 전 공정 3 구현 금지** — bank 없으면 테스트 불가
- **[CRITICAL] 보드 육안 확인 없이 bank 생성 금지** — 보드 오류가 bank에 반영

---

## Bug Log

| 버그 | 원인 | 해결 |
|---|---|---|
| 공이 핀 뚫고 지나감 | bankPlayer viewHeight(390) 사용 | BOARD_CONSTANTS.HEIGHT(396) 통일 |
| 블랙스크린 | Zod enum 'rect' 누락 | Zod enum 추가 |
| 마일스톤 모달 스킵 | show() 연속 호출 | enqueue() 큐 시스템 |
| 게이지 첫 구간 절반 | 공식 오류 | (step+segProgress)/total |
| 공이 구분선 슬라이딩 | 구분선 2px | 8px + rect bumper 6개 |
| HUD 전체 미렌더링 | slots.default 접근 | children 배열 |
| 드롭 무반응 | gameControl 미연결 | dispatchGameAction 직접 호출 |
| 드롭 항상 중앙 | emit 두 번째 인자 무시 | dispatchGameAction(action, i) |
| props 없는 Spec 크래시 | resolveBindings(undefined) | 모든 요소 props:{} 필수 |
| 드롭 버튼 클릭 마비 | pointer-events 대물림 | canvas pointer-events: auto !important |
| React HUD 렌더 스킵 | getSnapshot 동일 객체 | 변경 시에만 새 참조 |
| 스토어 메서드 this 유실 | 일반 메서드 | 화살표 함수 필드 |

---

## Checklist

공정 1 완료 후:
- [ ] npm run dev → 보드(핀·범퍼·보상원·슬롯 7개) 육안 확인
- [ ] 슬롯 라벨 7개 CSV 기반 렌더 확인
- [ ] OrthographicCamera 사용 확인
- [ ] BOARD_CONSTANTS == simulationRunner B 상수 동일 확인

공정 2 완료 후:
- [ ] game_data/bank/ 35개 JSON 파일 있는가

공정 3 완료 후:
- [ ] 드롭 → 공 궤적 → 슬롯 착지 → 번개 증가
- [ ] 마일스톤 달성 → 모달 큐 순서대로
- [ ] 잭팟 착지 → 잭팟 모달
- [ ] 공 0개 → 드롭 불가
- [ ] npm run build 통과

---

## Commands

```bash
mkdir public && ln -sf ../game_data public/game_data
rm -rf game_data/bank/*.json
node scripts/simulationRunner.mjs 20
npm install
npm run dev
npm run build
```

---

## 에셋 교체 시스템 (Asset Replacement System)

> `sprite_url` 비어있으면 기존 MeshBasicMaterial 색상 렌더 유지.

### 적용 CSV
| CSV | 추가 컬럼 |
|-----|---------|
| `game_data/01_slot_lightning.csv` | `sprite_url` |
| `game_data/04_board_obstacle.csv` | `sprite_url` |

### 타입 변경 (Zod 스키마)
→ 코드: RECIPE_CODE.md 해당 R-번호 참조

### 렌더 분기 (PrizeDrop.ts)
→ 코드: RECIPE_CODE.md 해당 R-번호 참조

### public/assets/ 구조
→ 코드: RECIPE_CODE.md 해당 R-번호 참조
총 **6개** 플레이스홀더 PNG

### 재생성 / 교체 예시
→ 코드: RECIPE_CODE.md 해당 R-번호 참조

---

## 호스트 지갑 연동 (이식 가능 계약 — 구현)

> 퍼즐볼 = **호스트(스퀘어) 재화**. 퍼즐은 잔액을 받아 자체 소비하는 소비자다. (공통 스펙: 코어 DEV "11. 이식 가능 지갑 계약".)
> ⚠️ 이 절로 인해 위 "Session Storage(세션 저장 없음)"·"State Paths(ball_count 초기 10)"·catalog `prizedropAddBalls(+10)` 기술은 **구버전**이다. 현재는 호스트 영속 + 호스트 보유량으로 시작 + 치트 제거.

### 메시지 (postMessage)
| 방향 | 메시지 | 동작 |
|------|--------|------|
| 퍼즐→호스트 | `pd:ready` | 부팅 완료, walletSync 요청 |
| 호스트→퍼즐 | `host:walletSync { balance, missionLines }` | `ball_count = balance`, missionLines 저장 |
| 퍼즐→호스트 | `pd:walletChanged { balance }` | 드롭 소비 후 남은 잔액 — 호스트가 저장 |

### 파일
| 파일 | 역할 |
|------|------|
| `src/hostBridge.ts` | `installPrizeHostBridge()`(리스너) · `notifyReady()` · `notifyWalletChanged(balance)` · `host:walletSync` 수신 → `ball_count`·`mission_lines` 갱신 · `hosted` 플래그 |
| `src/PrizeIntro.tsx` | 입장/미션 인트로 오버레이(게임 소유). `intro_visible` 가시성, missionLines 렌더, 보유 퍼즐볼, [입장하기] |
| `src/game/gameStore.ts` | `useBall()`/`addBalls()` → `ball_count` 변경 후 `notifyWalletChanged(next)` |
| `src/main.tsx` | 부팅 시 `installPrizeHostBridge()` 먼저 → bootstrap 후 `notifyReady()` · `<PrizeIntro/>` 렌더 |

### 스토어 키 추가 (`hudExternalStore.ts`)
| 키 | 초기값 | 용도 |
|----|--------|------|
| `/hud/intro_visible` | true | 입장 인트로 표시 (false=닫음) |
| `/hud/mission_lines` | [] | 호스트 walletSync가 채우는 획득안내 `[{title,detail}]` |

### ⚠️ JSON-pointer 스토어 접근 (필수)
`@json-render/core` `createStateStore`는 **중첩 경로** 접근(`/hud/ball_count`→`state.hud.ball_count`).
- **읽기는 `hudStore.get('/hud/ball_count')`** 사용. `getSnapshot()['/hud/ball_count']` 직접 키 접근은 **stale**(평면 초기키만 보고 update 결과 못 봄).
- `intro_visible` 초기값(평면)은 `get()`엔 `undefined`로 보이므로 **`get(...) !== false` 일 때 표시**(undefined=최초=표시).

### 호스트(스퀘어) 측
- `App.tsx`: `pd:ready`→`host:walletSync` 전송, `pd:walletChanged`→`MinigameCurrencyService.setPrizeBalls(balance)`.
- `EventMinigameOverlay.tsx` `onLoad`: prize면 `host:walletSync` 선전송.
- `event_minigame_host_config.csv` prize `ticket_cost=0`(입장 차감 없음), `duration_hours=24`(사이드탭 카운트다운).
- `+10` 치트: `ball_count` 탭 `on:press` 및 `btn-add-balls` 버튼 제거.
