# 라이브 세일 이벤트 — 공통 기획 인덱스

> **목적:** 모노폴리 GO식 **좌측 아이콘 + 팝업** 세일 2종을 `src/eventSystem` 아래 **독립 모듈**로 설계한다.  
> **대상:** 기획 리드 검토용 (구현 전).  
> **상세 스펙:** 각 폴더 `GAME.md` 참고.  
> **갱신 (2026-06-03):** §9 — 로비 **iframe 미니게임**(라바·퍼즐) 단일 호스트 구현·세일과의 공존 규칙.

---

## 1. 두 이벤트 한눈에

| | 드라이버의 기쁨 | 쇼핑몰의 경이로움 |
|--|----------------|------------------|
| **모노 레퍼런스** | 단일 IAP 패키지 팝업 | 순차 해금 「팩」 사다리 |
| **핵심 루프** | 보고 → ₩결제 → 즉시 보상 수령 | 1단계씩 해금 → 무료/유료 수령 → 다음 단계 공개 |
| **진행 재화** | 없음 (마일리지 누적 X) | 없음 (TP 누적 X) |
| **잠금** | 구매 횟수(2/2)·이벤트 종료 | **이전 단계 미수령 시 다음 단계 잠금** |
| **결제** | 처음부터 **캐시(원)** | 앞은 **무료**, 뒤는 **캐시/보석** 혼합 |
| **폴더** | `src/eventSystem/driversJoy/` | `src/eventSystem/mallMarvels/` |
| **tycoonSeason 재사용** | UI 톤·타이머·에셋 CSV 패턴만 | **단계·prereq 체인** 개념만 (TP 마일리지 바 아님) |

---

## 2. tycoonSeason(마일리지) 재사용 판단

| 항목 | 재사용? | 이유 |
|------|---------|------|
| TP + 킬 적립 | **아니오** | 세일은 「한 번에 사기 / 한 칸씩 받기」지 누적 게이지가 아님 |
| `event_milestone_config` UI 바 | **아니오** | 쇼핑몰은 **세로 사다리** UX |
| `EventHelpPopup` 레이아웃 | **참고만** | 헤더·섹션·버튼 톤 복제 |
| `event_asset_config` / theme CSV | **예** | 아이콘·색·fallback 통일 |
| `EventBridge` 패턴 | **예 (이름 분리)** | `SalesEventBridge` — 보상 지급·결제만 호스트에 위임 |
| `eventExternalStore` | **아니오** | 모듈별 **전용 store** (`/driversJoy/*`, `/mallMarvels/*`) |

**결론:** 마일리지 **시스템을 붙이지 않고**, 이벤트 공통 **연동 규약(브릿지·CSV·jsonRender 3종)** 만 맞춘다.

---

## 3. 모듈 공통 구조 (Lava Quest / prize-drop 동형)

```
src/eventSystem/{moduleName}/
  GAME.md              ← 기획 SSoT (이번에 작성)
  DEV.md               ← 구현·호스트 연동 (2차)
  index.ts             ← export + EVENT_REGISTRY 등록
  data.ts              ← CSV 로더
  store/               ← 전용 external store
  core/                ← Controller (상태·구매·단계)
  host/                ← HostBridge 인터페이스
  jsonRender/          ← spec + registry + UI
  (선택) dev/          ← Vite 단독 실행 — 타 게임 이식용

public/event/{moduleName}/
  *.csv
```

**호스트(PRISM) 연동 2안**

| 안 | 설명 | 추천 |
|----|------|------|
| A. **오버레이** | 호스트 `App.tsx`에 jsonRender 슬롯 + 좌측 탭 | PRISM에 빠르게 붙일 때 |
| B. **iframe** | Lava Quest처럼 `/event/.../index.html` | **타 게임 이식** 우선이면 B |

기획 단계 **추천:** 코어는 **A+B 공통 Controller** — UI만 오버레이/iframe 갈아끼기.

---

## 4. 호스트(스퀘어)에 필요한 최소 API

```ts
// 개념 — 구현 시 host/SalesHostBridge.ts
interface SalesHostBridge {
  grantRewards(bundle: RewardLine[]): void;
  trySpendCashKrw(amount: number): boolean;   // shop metaCashKrw 연동
  trySpendGems(amount: number): boolean;
  getWallet(): { cashKrw; gems; gold; energy };
  onPurchaseComplete?(eventId: string, stepId?: number): void;
}
```

- **드라이버:** `trySpendCashKrw(4400)` → 성공 시 보상 일괄 지급  
- **쇼핑몰:** 단계별 `cost_type` → FREE는 즉시, GEMS/CASH는 차감 후 해당 단계 보상만

---

## 5. 로비 UI (모노 GO 좌측 란)

| 요소 | 드라이버 | 쇼핑몰 |
|------|----------|--------|
| 아이콘 | 🚗 + 타이머 뱃지 | 🛍️ + 타이머 뱃지 |
| 알림 점 | 미수령 무료 단계 있을 때 (쇼핑몰) / 미구매 패키지 (드라이버) | |
| 탭 위치 | **화면 왼쪽** 세로 스택 (Lava/Prize·시즌은 **오른쪽** 유지) |
| 표시 조건 | `showDriversJoy` / `showMallMarvels` (로비 플래그, 메뉴 ON/OFF) |

기존 `EventMiniCards`·타이쿤 바와 **z-index·top** 은 `eventHudLayout.ts`에 슬롯 추가.

**미니게임(라바·퍼즐)과 겹침 방지:** 세일 팝업·다른 풀스크린 UI 진입 시 `hideEventMinigameForOverlay()` → iframe 미니게임 **완전 닫기** (§9).

---

## 6. 구현 순서 제안

1. **쇼핑몰의 경이로움** — 무료 단계·잠금·CSV만으로도 플레이 검증 가능  
2. **드라이버의 기쁨** — 결제·구매 횟수·팝업 (쇼핑몰의 CASH 단계와 결제 공유)  
3. `EVENT_REGISTRY` 등록 + PRISM 로비 탭 + DEV.md  
4. (선택) iframe 빌드·`postMessage` — 타 게임 패키지

---

## 7. 기획 확정 (2026-06-03)

| # | 항목 | 확정 |
|---|------|------|
| 1 | 드라이버 구매 횟수 | UI에 `N/M` **표시용** (모노 GO 연출). 1차는 localStorage 데모 저장, **서버 계정 연동 없음** |
| 2 | 쇼핑몰 유료 시작 | **3단계부터** 비용 (`step_id` ≥ 3). 1~2단계는 `FREE` |
| 3 | 보상 풀 | **재화 + 상자/장비** 포함 (`reward_type` CSV) |
| 4 | 원화 결제 | **상점 테스트 캐시** (`metaCashKrw` / `shop_test_config`) — IAP 2차 |

공통: `CASH_KRW`·드라이버 결제 모두 `GameCore.metaCashKrw` 차감 + 상점과 동일 토스트.

---

## 8. 문서 맵 (분리 패키지용)

| 모듈 | 기획 (상세) | 개발 (연동) |
|------|-------------|-------------|
| 쇼핑몰 | [`mallMarvels/GAME.md`](./mallMarvels/GAME.md) | [`mallMarvels/DEV.md`](./mallMarvels/DEV.md) |
| 드라이버 | [`driversJoy/GAME.md`](./driversJoy/GAME.md) | [`driversJoy/DEV.md`](./driversJoy/DEV.md) |
| 세일 공통 인덱스 | 본 문서 (§1~8 세일, **§9 미니게임 호스트**) | `sales/*.ts` |
| iframe 미니게임 | §9 본 문서 · Lava `mdv3/GAME_lava_quest_v4.md` · Prize `mdv3/GAME_prize_drop_v4.md` | `eventMinigameHost.ts` · `EventMinigameOverlay.tsx` |
| 타이쿤 (별도) | [`tycoonSeason/GAME.md`](./tycoonSeason/GAME.md) | [`tycoonSeason/DEV.md`](./tycoonSeason/DEV.md) |
| 이벤트 허브 | [`GAME.md`](./GAME.md) · [`EVENT_SYSTEM.md`](./EVENT_SYSTEM.md) | |

각 `GAME.md` §0 에 **이 폴더만 복사할 때 포함 목록** + `sales/` 공유 의존성 정리됨.

---

## 9. iframe 미니게임 단일 호스트 (Lava Quest · Prize Drop)

> **배경:** 라바·퍼즐은 **같은 종류의 이벤트**(iframe 미니게임)이다. 세일(쇼핑몰·드라이버)과 달리 **한 호스트·한 iframe 슬롯**만 쓰며, 탭 전환 시 이전 화면·세이브가 따라오지 않도록 **dispose → remount** 한다.  
> **구현 완료 (호스트):** 2026-06-03

### 9.1 로비 이벤트 UI 3계층 (역할 분리)

| 계층 | 이벤트 | UI 형태 | 열기/닫기 API |
|------|--------|---------|----------------|
| **① iframe 미니게임** | 라바 퀘스트, Prize Drop | `EventMinigameOverlay` (App z500) | `eventMinigameHost` |
| **② 세일 오버레이** | 쇼핑몰의 경이로움, 드라이버의 기쁨 | `SalesEventOverlay` (좌측 탭 + 모달) | 각 `*Controller.openModal` |
| **③ 타이쿤/시즌** | 마일리지·토너먼트 | `EventHudRenderer` (전투/로비 HUD) | `eventStore` / `EventBridge` |

- **①만** iframe·`postMessage`·보상 `event:grant` 공통.
- **② 진입 시 ① 닫기** — 쇼핑몰/드라이버 `openModal()` → `hideEventMinigameForOverlay()`.
- **③** 은 미니게임 iframe과 별개(오른쪽 탭·상단 mileage).

### 9.2 SSoT — 레지스트리

파일: `src/game/eventMinigameRegistry.ts`

| id | 라벨 | iframe src | 입장 재화 | 로비 플래그 |
|----|------|------------|-----------|-------------|
| `lava` | 라바 | `/event/lavaQuest/index.html` | `/lobby/lavaTickets` 1장 | `/lobby/showLavaQuest` |
| `prize` | 퍼즐 | `/event/prizeDrop/index.html` | `/lobby/prizeBalls` 1개 | `/lobby/showPrizeDrop` |
| `archery` | 양궁 | `/event/archeryArena/index.html` | `/lobby/archeryBowStands` (**입장 차감 없음**, 5발 도전 시 1개) | `/lobby/showArcheryArena` |

**이벤트 추가 시:** 위 테이블에 행만 추가 + `public/event/{id}/` 빌드 산출물 + (필요 시) `persistKeys` for localStorage dispose.

**양궁 상세:** `src/eventSystem/Archery Arena_game_end/mdv3/HANDOFF_archery_arena_v4.md`  
빌드: `npm run build:archery` → `public/event/archeryArena/` (CSV 6종 포함).

### 9.3 호스트 API (`src/game/eventMinigameHost.ts`)

| 함수 | 용도 |
|------|------|
| `openEventMinigame(id)` | 입장권 차감 → **이전 세션 dispose** → `mountKey++` → iframe remount |
| `closeEventMinigame()` | ✕·완전 종료 — `activeId` 비움, iframe DOM 제거 |
| `hideEventMinigameForOverlay()` | 세일·기타 풀스크린 UI 진입 전 — `close`와 동일 |
| `suspendEventMinigame()` | 라바만: 스퀘어 전투 진입 (`lq:start_attempt`) — 숨김·세션 유지 |
| `resumeEventMinigame()` | 라바 전투 종료 후 iframe 복귀 + `lq:result` postMessage |
| `disposeMinigameSession(id)` | `host:eventDispose` postMessage + 라바 `lq_session_v1` 삭제 |

**hudStore 경로 (단일 상태):**

```
/event/minigame/activeId   '' | 'lava' | 'prize' | 'archery'
/event/minigame/visible    boolean
/event/minigame/suspended  boolean  (라바 전투 중)
/event/minigame/mountKey   number   (React iframe key)
```

레거시 `/iframe/*` 는 호스트가 동기화만 함(기존 코드 호환).

### 9.4 UI 셸 위치

- **이전:** `LobbyScreenImpl` 안 `IframeOverlay` — 로비 unmount 시 iframe 생명주기 꼬임.
- **현재:** `App.tsx` 최상위 `EventMinigameOverlay` — 로비·전투와 **분리**, zIndex **500**.
- 사이드 탭: `registry.tsx` `EventMiniCards` — 레지스트리 순회, `openEventMinigame(id)`만 호출.

### 9.5 전환 규칙 (기획·QA 공통)

1. **라바 → 퍼즐 (또는 반대) 탭:** 이전 이벤트 dispose + LS 정리 → **새 iframe만** 표시 (매칭 100/100 잔상 없음).
2. **✕ 닫기:** 미니게임 완전 종료.
3. **쇼핑몰·드라이버 탭:** 미니게임 먼저 닫고 세일 모달만 표시.
4. **라바 「도전 시작」:** iframe `suspend` (숨김) → 스퀘어 1분 전투 → `resume` + 결과 전달.
5. **보상 설명창:** 아이콘 탭 → `event:showRewardDetail` → 호스트 `EquipDetailPopup`(장비) / 재화 카드. 미니게임 닫히면 설명창도 닫힘.

### 9.6 postMessage 프로토콜 (호스트 ↔ iframe)

| 방향 | type | 용도 |
|------|------|------|
| iframe → host | `lq:start_attempt` | 라바 전투 시작 |
| iframe → host | `lq:result` | (host → iframe) 전투 결과 |
| iframe → host | `event:grant` | 보상 실지급 (`GameCore.grantReward`) |
| iframe → host | `event:showRewardDetail` | 보상 아이콘 설명 (장비/재화) |
| host → iframe | `host:eventDispose` | 탭 전환·닫기 시 자식 정리 (라바: `clearPersistentSession`) |
| iframe → host | `aa:ready` | 양궁 기동 → host `host:archeryInit` |
| iframe → host | `aa:consumeBow` | 활대 1개 소비 후 5발 연출 |
| iframe → host | `aa:claimPending` | 토너먼트 종료·미수령 (레드닷) |
| iframe → host | `aa:claimed` | 보상 수령 완료 |
| iframe → host | `aa:toast` | 호스트 토스트 (iframe 위 z530) |
| host → iframe | `host:archeryInit` | 활대·claimPending·killsTowardBow |
| host → iframe | `host:bowConsumed` / `host:bowDenied` | 활대 소비 결과 |

Prize Drop 마일스톤·보상 모달·Lava 보상 칩 클릭 → `event:showRewardDetail`.  
장비 보상: CSV `reward_item_id` = `equipment_config.slot_id` (`prize_crown` 등).

### 9.7 클릭·레이어 (2026-06-03 수정 요약)

- 세일 래퍼 `App.tsx`: `pointer-events: none`, **탭·모달만** `auto` (전체 화면 클릭 먹통 방지).
- `RewardDetailOverlay`: iframe(z500) 위 **z520**.
- Prize Drop 마일스톤 바 🎁 마크 탭 → 설명창 연동.

### 9.8 관련 파일 맵

| 역할 | 경로 |
|------|------|
| 레지스트리 | `src/game/eventMinigameRegistry.ts` |
| 호스트 API | `src/game/eventMinigameHost.ts` |
| iframe 셸 | `src/jsonRender/EventMinigameOverlay.tsx` |
| 로비 탭 | `src/jsonRender/registry.tsx` (`EventMiniCards`) |
| 보상 설명 | `src/jsonRender/RewardDetailOverlay.tsx` |
| message 브릿지 | `src/App.tsx` |
| 라바 전투 | `src/game/GameCore.ts` (`startLavaQuestMode` / `_onLavaQuestEnd`) |
| 세일 → 미니게임 닫기 | `mallMarvels/core/MallMarvelsController.ts`, `driversJoy/core/DriversJoyController.ts` |
| 빌드 산출 | `public/event/lavaQuest/`, `public/event/prizeDrop/`, `public/event/archeryArena/` |
| 양궁 호스트 | `src/game/archeryMeta.ts`, `src/game/eventRedDots.ts` |

### 9.9 세일 모듈과의 관계 (본 문서 §1~5)

- 세일은 **iframe 없음** — §3의 **A. 오버레이** 확정.
- 로비 **왼쪽** = 세일 탭, **오른쪽** = 라바·퍼즐·(시즌) — `eventHudLayout.ts` 스택 인덱스 공유.
- **동시에 둘 다 뜨면 안 됨:** 미니게임 열린 상태에서 세일 탭 → 미니게임 닫힘. 반대는 세일 모달만 닫으면 로비로 복귀(미니게임 자동 재오픈 없음).

---

*CSV: `public/event/driversJoy/`, `public/event/mallMarvels/` — 로더 `sales/loadSalesEventData.ts` · DEV.md 참고.*  
*미니게임 CSV: `public/event/lavaQuest/` (`lq_stage_reward.csv` 등), Prize Drop `game_data/03_milestone.csv`.*
