---
identity:
  name: SQUARE EVENT (tycoonSeason)
  doc_type: DEV
  scope: "개발 연동 명세 — 파일구조·API·상태·CSV 스키마·Anti-Patterns"
---

# tycoonSeason — DEV.md

> **대상**: 개발자 · AI 에이전트  
> **게임 기획**: `GAME.md` (같은 폴더)  
> **이벤트 관리 구조**: `../EVENT_MANAGEMENT.md`  
> **호스트 게임 기술**: `../../DEV.md`

---

## 1. 모듈 위치

| 구분 | 경로 |
|------|------|
| 코드 | `src/eventSystem/tycoonSeason/` |
| CSV | `public/event/tycoonSeason/` |
| 이벤트 진입점 | `src/eventSystem/index.ts` |

---

## 2. 파일 구조

```
tycoonSeason/
├── GAME.md                    ← 기획 SSoT (기획자용)
├── DEV.md                     ← 이 문서 (개발자용)
├── HANDOFF.md                 ← 인수인계
├── data.ts                    ← CSV 로더 + 타입 정의 + EventData 빌드
├── index.ts                   ← 이 모듈의 public API (re-export)
│
├── core/
│   ├── EventController.ts     ← 이벤트 로직 (TP 적립, 마일스톤, 봇 시뮬)
│   └── BotSimulator.ts        ← 봇 49명 TP 틱 갱신
│
├── host/
│   └── EventBridge.ts         ← 호스트 게임 ↔ 이벤트 연결 얇은 층
│
├── jsonRender/
│   ├── eventHudSpec.ts        ← HUD Spec ($state 바인딩 선언)
│   ├── registry.tsx           ← React 컴포넌트 구현 + 등록
│   ├── EventHudRenderer.tsx   ← slot별 렌더러 (mileage/tournament/modal)
│   ├── eventMonopolyUi.tsx    ← 실제 UI 컴포넌트 (캡슐·탭·모달·헬프)
│   ├── EventCurrencyFlyOverlay.tsx ← 재화 획득 파티클 비행 연출
│   ├── catalog.ts             ← Spec 유효성 검증
│   ├── operationalUi.ts
│   └── shared.ts
│
└── store/
    └── eventExternalStore.ts  ← 이벤트 $state 브릿지 (/event/* 경로)
```

---

## 3. 호스트 연동 API

### App.tsx에서 import (항상 `../eventSystem`에서만)

```ts
import {
  loadAllEventData,      // CSV 전체 로드 → EventData
  EventBridge,           // 호스트 연결 인스턴스
  EventHudRenderer,      // slot별 UI 렌더
  EventDataProvider,     // EventData React context
  eventCatalog,          // Spec 검증
  eventHudSpec,          // HUD Spec
  eventStore,            // 상태 스토어
  eventModalOpen,        // 모달 열림 여부 판단
  EventCurrencyFlyOverlay,
  type EventData,
} from '../eventSystem';
```

### EventBridge public API (코드 검증 — `host/EventBridge.ts`)

```ts
new EventBridge(data: EventData)              // App.tsx에서 생성
bridge.syncTicketMultiplier(mult: number)     // 입장 배수 확정 시 (×N 칩 선반영)
bridge.onEnemyKilled(enemyId, ticketMult)     // 적·보스 처치 (보스 = enemyId 'final_boss')
bridge.tick(dt: number)                       // 매 프레임 (초 단위 dt)
bridge.getTycoonPoints(): number              // 결과창 tycoonEarned pull
bridge.getSeasonCoins(): number               // 시즌 코인 pull (현재 미사용)
bridge.onRewardGranted?: (bundleId) => void   // 보상 지급 콜백 (현재 미연결)
bridge.dispose()                              // window 리스너 해제
```

> ⚠️ **`onBossKilled` / `onGameTick` / `onGameEnd` 는 존재하지 않는다.** (과거 오기)
> - 보스 처치 = `onEnemyKilled('final_boss', mult)`
> - 프레임 = `tick(dt)`
> - 종료 = 별도 메서드 없음. `tick`에서 `eventEndSec ≤ 0` 감지 시 `settleTournament` 자동 호출.

### GameCore.ts 실제 호출 지점 (코드 검증)

```ts
// _onEnemyDeath
this.eventBridge?.onEnemyKilled(dead.cfg.enemy_id, this.ticketMultiplier);
// _onBossDeath
this.eventBridge?.onEnemyKilled('final_boss', this.ticketMultiplier);
// 매 프레임
this.eventBridge?.tick(dt);
// 로비 배수 토글·게임 시작
this.eventBridge?.syncTicketMultiplier(this.selectedMult);   // / this.ticketMultiplier
// 결과창 (pull, 미부착 시 폴백)
'/result/tycoonEarned': this.eventBridge?.getTycoonPoints()
    ?? this.killCount * this.ticketMultiplier,        // 클리어 시 +50킬 보너스 가산
```

### 적립 규칙 (`EventController.onEnemyKilled`)

- `event_kill_reward_config.csv` 행 조회(폴백 `mini_boss` → `basic`).
- `targetType` = `final_boss` 또는 `is_boss=true` → `'boss'`, else `'normal'`.
- `getKillsRequired`(`event_help_acquire_config.csv`)만큼 누적 시 1회 적립:
  `max(1, floor(point_base × max(1, mult)))`. 타이쿤·시즌 점수 **분리 카운터**.

### 이벤트 분리 시 (호스트 단독 복구)

`src/eventSystem` 폴더 제거 + `App.tsx`에서 import 삭제만으로 완전 분리.

---

## 4. json-render 패턴 (이벤트 전용)

UI 추가/수정 시 **3종 세트 동시 패치** (하나라도 빠지면 컴포넌트 못 찾거나 타입 오류):

```
eventHudSpec.ts       ← $state 바인딩 선언
    ↓
eventExternalStore.ts ← /event/* 상태 키 추가
    ↓
registry.tsx          ← React 컴포넌트 구현 + eventRegistry 등록
```

신규 컴포넌트 타입 추가 시 `operationalUi.ts` + `catalog.ts`도 동시 패치.

---

## 5. 이벤트 상태 ($state 경로)

모든 경로는 `/event/` 접두사. `hudStore(/hud/*)` 에 절대 추가하지 말 것.

### 타이쿤 마일리지

| 경로 | 타입 | 설명 |
|------|------|------|
| `/event/visible` | boolean | 타이쿤 HUD 표시 여부 |
| `/event/name` | string | 이벤트명 |
| `/event/themeKey` | string | CSS 테마 키 |
| `/event/currencyAssetKey` | string | 재화 아이콘 키 |
| `/event/points` | number | 현재 누적 TP |
| `/event/nextMilestonePoint` | number | 다음 마일스톤 필요 TP |
| `/event/nextRewardAssetKey` | string | 다음 보상 아이콘 키 |
| `/event/nextRewardLabel` | string | 다음 보상 라벨 |
| `/event/timerText` | string | 잔여 시간 텍스트 |
| `/event/ticketMultiplier` | number | 입장권 배수 |
| `/event/lastTpGain` | number | 직전 처치 TP (파티클 연출용) |
| `/event/milestoneRows` | MilestoneRow[] | 마일스톤 목록 |
| `/event/milestoneListVisible` | boolean | 마일스톤 목록 팝업 표시 |
| `/event/milestonePopupVisible` | boolean | 보상 팝업 표시 |
| `/event/milestonePopupTitle` | string | 보상 팝업 제목 |
| `/event/milestonePopupAssetKey` | string | 보상 팝업 아이콘 |
| `/event/milestonePopupLabel` | string | 보상 팝업 라벨 |

### 시즌 토너먼트

| 경로 | 타입 | 설명 |
|------|------|------|
| `/event/tournamentVisible` | boolean | 토너먼트 탭 표시 |
| `/event/tournamentRank` | number | 내 현재 순위 |
| `/event/tournamentRows` | TournamentBotRow[] | 전체 순위 행 (50명) |
| `/event/tournamentPanelVisible` | boolean | 순위판 팝업 |
| `/event/tournamentEnded` | boolean | 토너먼트 종료 여부 |
| `/event/seasonName` | string | 시즌 이벤트명 |
| `/event/seasonThemeKey` | string | 시즌 테마 키 |
| `/event/seasonCurrencyAssetKey` | string | 시즌 재화 아이콘 키 |
| `/event/seasonPoints` | number | 시즌 점수 |
| `/event/seasonCoins` | number | 획득 시즌 코인 |
| `/event/seasonTimerText` | string | 시즌 잔여 시간 |
| `/event/seasonGroupSize` | number | 그룹 인원 (50) |
| `/event/seasonBadgeLabel` | string | 배지 라벨 |
| `/event/className` | string | 현재 클래스명 |
| `/event/classLevel` | number | 클래스 레벨 |
| `/event/classSubtitle` | string | 클래스 부제 |
| `/event/settlementVisible` | boolean | 정산 팝업 |

### 시즌 익스프레스

| 경로 | 타입 | 설명 |
|------|------|------|
| `/event/expressVisible` | boolean | 익스프레스 패널 |
| `/event/expressTabVisible` | boolean | 익스프레스 사이드탭 |
| `/event/expressName` | string | 익스프레스명 |
| `/event/expressTitle` | string | 패널 제목 |
| `/event/expressTimerText` | string | 잔여 시간 |
| `/event/expressRewardAssetKey` | string | 보상 아이콘 키 |
| `/event/expressRewardLabel` | string | 보상 라벨 |

---

## 6. UI 컴포넌트 현황

### 구현 완료 ✅

| 컴포넌트 | 파일 | slot | 설명 |
|----------|------|------|------|
| `EventTycoonMileageBar` | registry.tsx | mileage | 상단 타이쿤 캡슐 바 |
| `EventTournamentLeaderboard` | registry.tsx | tournament | 우측 시즌 사이드탭 |
| `SeasonExpressSideTab` | registry.tsx | tournament | 우측 익스프레스 탭 |
| `EventMilestoneListPopup` | registry.tsx | modal | 마일스톤 전체 목록 |
| `EventMilestoneRewardPopup` | registry.tsx | modal | 마일스톤 보상 팝업 |
| `EventTournamentPanel` | registry.tsx | modal | 50명 순위판 |
| `SeasonExpressPanel` | registry.tsx | modal | 익스프레스 패널 |
| `EventCurrencyFlyOverlay` | 단독 | — | 재화 파티클 비행 |
| `MonopolyMileageCapsule` | eventMonopolyUi | — | 타이쿤 캡슐 구현체 |
| `EventTycoonMainModal` | eventMonopolyUi | — | 타이쿤 메인 모달 |
| `EventTournamentSideTab` | eventMonopolyUi | — | 시즌 사이드탭 구현체 |
| `EventTournamentBoardModal` | eventMonopolyUi | — | 50명 순위판 구현체 |
| `EventAcquireRulesSection` | eventMonopolyUi | — | 획득 방법 블록 |

### 미구현 / 껍데기 ⏳

| 컴포넌트 | 상태 | 설명 |
|----------|------|------|
| `EventTournamentSettlementPopup` | `return null` | 토너먼트 종료 정산 — 구현 필요 |
| `EventLobbyPromoCards` | 미등록 | 로비 진입 시 타이쿤·시즌 2카드 나란히 |

---

## 7. CSV 스키마 (SSoT)

경로: `public/event/tycoonSeason/`

| 파일 | 주요 컬럼 | 담당 |
|------|-----------|------|
| `event_board_config.csv` | event_id, event_name, event_kind, enabled, theme_key, milestone_group_id, group_size, duration_hours, tick_min | 운영 |
| `event_milestone_config.csv` | milestone_group_id, step, required_point, reward_bundle_id, reward_asset_key, reward_qty_label | 기획 |
| `event_kill_reward_config.csv` | enemy_id, tycoon_point_base, season_point_base, is_boss | 밸런스 |
| `tournament_config.csv` | key, value (tick_sec/player_cap_ratio/growth_ratio/bot_floor_ratio) | 밸런스 |
| `tournament_bot_name_pool.csv` | name (60개 풀) | 기획 |
| `tournament_rank_reward_config.csv` | event_id, rank_from, rank_to, season_coins, dice_label, token_label | 기획 |
| `season_class_config.csv` | class_level, class_name, required_coins, tournament_reward_rate | 기획 |
| `event_asset_config.csv` | asset_key, asset_type(icon/color), url, fallback_text, width, height | 아트 |
| `event_ui_theme_config.csv` | theme_key, prop_key, value | UI |
| `event_help_config.csv` | help_id, event_kind, title, subtitle, acquire_section_title, body_1~4 | 기획 |
| `event_help_acquire_config.csv` | event_kind, target_type, row_title, kills_required, reward_label, left_icon_key, reward_icon_key, sort_order | 기획 |
| `event_express_config.csv` | event_id, event_name, duration_hours, reward_asset_key, icon_key | 기획 |

---

## 8. 커스텀 이벤트 (window)

UI 컴포넌트 간 통신은 `window.dispatchEvent(new CustomEvent(...))`:

| 이벤트명 | 설명 |
|----------|------|
| `event:toggleMilestoneList` | 마일스톤 목록 토글 |
| `event:closeMilestonePopup` | 보상 팝업 닫기 |
| `event:toggleTournamentPanel` | 순위판 토글 |
| `event:closeTournamentPanel` | 순위판 닫기 |
| `event:closeSettlement` | 정산 팝업 닫기 |
| `event:toggleExpressPanel` | 익스프레스 패널 토글 |
| `event:closeExpress` | 익스프레스 닫기 |
| `event:openHelp` | 도움말 열기 (`detail: 'tycoon' \| 'season'`) |

---

## Anti-Patterns

### [CRITICAL] 이벤트 state를 `/hud/*`에 추가
`hudExternalStore`와 `eventExternalStore`는 완전 분리. 교차 사용 금지.

### [CRITICAL] 아이콘·색상을 코드에 하드코딩
반드시 `event_asset_config.csv` + `getEventAsset()` / `getThemeColor()` 함수 경유.

### 3종 세트 중 하나만 수정
`eventHudSpec` ↔ `eventExternalStore` ↔ `registry.tsx` 항상 동시 패치.

### `src/eventSystem/tycoonSeason/` 내부를 외부에서 직접 import
항상 `src/eventSystem/index.ts`를 통할 것. 내부 경로 직접 import 금지.

### 마일스톤·순위를 코드에 박기
`event_milestone_config`, `tournament_rank_reward_config` CSV만 수정.

### `EventTournamentSettlementPopup`을 구현 완료로 착각
현재 `return null` 껍데기. UI 작업 시 구현 필요.
