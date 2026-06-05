---
identity:
  name: SQUARE EVENT (tycoonSeason)
  doc_type: DESIGN
  scope: "HUD UI 레이아웃 재현 명세 — 슬롯 배치·z-index·top px·컴포넌트·$state 경로"
  precision: "재현 등급. 실제 컴포넌트명·경로·z·px는 코드 검증값."
  verified_against:
    - "src/App.tsx (HUD 슬롯·z-index)"
    - "src/eventSystem/tycoonSeason/jsonRender/eventHudLayout.ts (top px)"
    - "src/eventSystem/tycoonSeason/jsonRender/EventHudRenderer.tsx (slot→type 매핑)"
    - "src/eventSystem/tycoonSeason/jsonRender/registry.tsx (컴포넌트 구현)"
    - "src/eventSystem/tycoonSeason/store/eventExternalStore.ts (/event/* 경로)"
---

# tycoonSeason — DESIGN.md

> **대상**: UI·디자인 · 외부 팀 · 재현 작업자
> **기획**: `GAME.md` · **개발 명세**: `DEV.md` · **인수인계**: `HANDOFF.md`
> **원칙**: 별도 진입 화면 없음. 전투/라바 전투 중 호스트 캔버스 위에 떠 있는 **인앱 React HUD**.

---

## 1. 레이어 개요 (z-index 맵 — `App.tsx` 검증)

전부 `position: absolute`. 호스트 Three.js 캔버스 위 React 오버레이.

| 레이어 | z-index | pointerEvents | 비고 |
|--------|---------|---------------|------|
| 이벤트 HUD — mileage 슬롯 | **전투 40 / 그 외 11** | `none`(컨테이너) | `battleLobbyScreen ? 40 : 11` |
| 이벤트 HUD — tournament 슬롯 | **전투 40 / 그 외 11** | `none`(컨테이너) | 좌우 슬롯 동일 z |
| 공통 TopBar | 55 | auto | 로비/상점/이벤트 위 공통 바 |
| 이벤트 modal 슬롯 (`inset:0`) | **60** | `eventOverlayOpen ? auto : none` | 마일스톤 목록·토너먼트판·익스프레스·정산·헬프 |
| 마일스톤 보상 팝업 백드롭 | **80** | auto | modal 슬롯 *내부* 오버레이 (`registry.tsx` zIndex 80) |

> 슬롯 컨테이너는 `pointerEvents:'none'`이고, 내부 탭/버튼만 `auto`. 모달이 열리면(`eventModalOpen`) 인게임 HUD(mileage/tournament)는 **숨김**(`!eventOverlayOpen` 조건).

---

## 2. HUD 슬롯 배치 (`EventHudRenderer` slot → 컴포넌트)

`EventHudRenderer.tsx`의 `SLOT_TYPES` 매핑 = SSoT:

| slot | App.tsx 위치 | 허용 컴포넌트 타입 |
|------|--------------|--------------------|
| `mileage` | **좌상단** (`top: eventHudLayerTop`, `left:0 right:0`) | `EventTycoonMileageBar` |
| `tournament` | **우측** (`top: eventHudLayerTop`, `right:0`, `paddingTop:8`) | `EventTournamentLeaderboard`, `SeasonExpressSideTab` |
| `modal` | **inset 0, z60** | `EventMilestoneRewardPopup`, `EventMilestoneListPopup`, `EventTournamentPanel`, `EventTournamentSettlementPopup`, `SeasonExpressPanel` |

> ⚠️ 토너먼트/시즌은 **우측 사이드탭**이다. (구 GAME.md "좌측 미니"는 우측으로 이동 완료.)

### 슬롯 외 단독 오버레이

| 컴포넌트 | 위치 | 용도 |
|----------|------|------|
| `EventCurrencyFlyOverlay` | 단독 (`App.tsx`에서 `<EventCurrencyFlyOverlay data={eventData} />`) | 처치 시 재화 파티클이 캡슐/사이드탭으로 비행 |
| `EventTooltipOverlay` | 단독 | 툴팁 |

---

## 3. top px — 전투/로비 상태별 (`eventHudLayout.ts`)

```ts
eventHudLayerTop(battleLobby: boolean): number
  => battleLobby ? 128 : 108     // 로비(배수 토글 줄 포함) 128, 전투 108
```

| 상태 | top px | 판정 |
|------|--------|------|
| 전투 중 (combat) | **108** | `battleLobby=false` |
| 배틀 로비 (combat lobby) | **128** | `isBattleLobbyHud(snap)`=true |

`isBattleLobbyHud(snap)`: `/lobby/visible` && **상점·장비·도전·진화·특성·에너지·아바타 모달 전부 닫힘**일 때만 로비 HUD로 간주.

### 우측 사이드탭 스택 좌표

```ts
EVENT_MILEAGE_WRAP_PAD       = { top: 8, bottom: 16, sides: 8 }
EVENT_CAPSULE_BODY_MIN_H     = 74
EVENT_SIDE_TAB_STACK_H       = 74 + 28 = 102
EVENT_SIDE_TAB_GAP           = 10
SIDE_TAB_W                   = 64

eventSideTabStackTopPx(battleLobby, stackIndex)
  = eventHudLayerTop(battleLobby) + 8 + stackIndex × (102 + 10)
```

- `stackIndex 0` = 시즌(또는 첫 미니카드). 익스프레스/라바/프라이즈/아처리 미니카드가 아래로 102+10px 간격 스택.
- 미니카드 인덱스 계산: `eventMiniCardStackIndex(card, {seasonTabVisible, showLava, showPrize})`.

### 사이드탭 셸 스타일 (오른쪽 기준)

```
width 64 · minHeight 102 · bg #F4EFE6 · border 3px #000
borderRadius 12 0 0 12 (오른쪽 탭) / 0 12 12 0 (왼쪽 세일 탭)
boxShadow -3px 3px 0 #000 (오른쪽) / 3px 3px 0 #000 (왼쪽)
아이콘: size 44 · bg #FFB347 · border 3px #000 · shadow 1.5px 1.5px 0 #000
```

---

## 4. 컴포넌트별 명세

### 4-1. `EventTycoonMileageBar` (mileage 슬롯, 좌상단)

구현체: `MonopolyMileageCapsule` (`eventMonopolyUi.tsx`) via `registry.tsx`.

| 요소 | $state 경로 |
|------|-------------|
| 이벤트명 | `/event/name` |
| 진행 N/M | `/event/points` / `/event/nextMilestonePoint` |
| 재화 아이콘 | `/event/currencyAssetKey` |
| 다음 보상 | `/event/nextRewardAssetKey`, `/event/nextRewardLabel` |
| 타이머 | `/event/timerText` |
| 배수 칩 ×N | `/event/ticketMultiplier` |
| 테마 | `/event/themeKey` (`tycoon_default`) |

- 탭 → `window.dispatchEvent('event:toggleMilestoneList')` → `EventMilestoneListPopup`(z60).
- 흰 카드 본체 최소 높이 `EVENT_CAPSULE_BODY_MIN_H = 74`.

**★ 마일리지/시즌 게이지 표시 규칙 (버그 방지 — 타이쿤·시즌 동일, 캡슐·익스프레스 탭·토너먼트 패널 공통):**
- **숫자 N/M = 바와 동일하게 "구간" 기준** `gaugePoints / gaugeTarget`(시즌=`seasonGaugePoints/seasonGaugeTarget`). 단계 넘으면 **0부터** 다시 셈. 예: 누적 1650(임계 1500→1900 구간)이면 화면 표기는 **150/400**(1650/1900 아님).
- **바 채움**도 동일 **구간** `gaugePoints / gaugeTarget`. `EventController.milestoneGaugeSegment`: `base = 이전 단계 임계값`, `target = 다음 − base`, `gaugePoints = points − base` → **단계 넘으면 바·숫자 모두 0부터** 다시 채워짐.
- (참고) `/event/points`·`/event/nextMilestonePoint`는 누적값 store이지만 **마일리지 표시(숫자·바)에는 쓰지 않는다** — 표시는 전부 구간 게이지.
- 임계값(`event_milestone_config.required_point`)은 누적: 1500/1900/2300… (구간 크기 = 다음−이전).
- ⚠️ **[CRITICAL] 누적값(points/nextMilestone)으로 바를 그리면 안 됨** — 단계 넘을 때 0%가 아니라 이전 누적부터 시작하는 버그(예: 1500 도달 → 다음 구간이 0%가 아닌 1500/1900=79%부터). 캡슐·익스프레스 사이드탭·**토너먼트 패널** 모두 반드시 구간 게이지(`gaugePoints/gaugeTarget`) 사용. (과거 토너먼트 패널이 누적으로 그려 게이지가 왔다갔다하던 버그 — 구간 게이지로 수정 완료.)
- 단계 미수령(claim 전)에도 게이지는 다음 구간으로 진행: `next = 미claim & points<required` 첫 단계, base=그 직전 임계값.
- 바 transition `0.45s`(`style.css` `.event-mileage-bar-fill`) — `displayPct` 다중 갱신 + 긴 transition 겹침 금지(왔다갔다 원인).

### 4-2. `EventTournamentLeaderboard` / `SeasonExpressSideTab` (tournament 슬롯, 우측)

| 요소 | $state |
|------|--------|
| 표시 조건(토너먼트) | `/event/tournamentVisible` |
| 표시 조건(익스프레스) | `/event/expressTabVisible` |
| 내 순위 | `/event/tournamentRank` |
| 순위 행(50) | `/event/tournamentRows` (`TournamentBotRow[]`) |
| 시즌 타이머 | `/event/seasonTimerText` (익스프레스: `/event/expressTimerText`) |
| 라벨 | `/event/seasonBadgeLabel`('시즌') |

- 익스프레스 활성 시 `tournamentVisible=false`로 토너먼트 탭을 끄고 `SeasonExpressSideTab`만 표시.
- 탭 → `event:toggleTournamentPanel` / `event:toggleExpressPanel`.

### 4-3. 마일리지 바·마일스톤 모달 그룹 (modal 슬롯, z60)

| 컴포넌트 | 표시 $state | 트리거 이벤트 |
|----------|-------------|---------------|
| `EventMilestoneListPopup` | `/event/milestoneListVisible` | `event:toggleMilestoneList` |
| `EventMilestoneRewardPopup` (타이쿤·시즌 2채널 독립) | `/event/tycoonMilestonePopupVisible` · `/event/seasonMilestonePopupVisible` | `event:closeTycoonMilestonePopup` / `event:closeSeasonMilestonePopup` — **백드롭 z80** |
| `EventTournamentPanel` | `/event/tournamentPanelVisible` | `event:toggleTournamentPanel` / `event:closeTournamentPanel` |
| `SeasonExpressPanel` | `/event/expressVisible` | `event:toggleExpressPanel` / `event:closeExpress` |
| `EventTournamentSettlementPopup` | (정산) | **현재 `return null` 껍데기** — 정산은 `EventTournamentPanel` + `/event/tournamentEnded`로 렌더 |

- 보상 팝업 백드롭: `position:absolute, inset:0, zIndex:80, background:rgba(0,0,0,0.65)`.
- 메인 모달 3종(`milestoneListVisible`/`tournamentPanelVisible`/`expressVisible`)은 **상호 배타** — 하나 열면 나머지 닫힘.
- 보상 팝업은 **타이쿤·시즌 독립 채널**(`/event/tycoonMilestonePopup*` / `/event/seasonMilestonePopup*`). **게임(전투) 중엔 안 뜸.** 타이쿤 창(마일스톤 리스트)·시즌 창(익스프레스/토너먼트)이 **열릴 때** 대기 중 보상이 표시된다. 두 채널은 서로 막지 않음.

### 4-4. 마일스톤 보상 팝업 (`EventMilestoneRewardPopup`)

| 요소 | $state |
|------|--------|
| 제목 | `/event/{tycoon,season}MilestonePopupTitle` (`{이벤트명} · N회차 N단계 달성!`) |
| 보상 아이콘 | `/event/{tycoon,season}MilestonePopupAssetKey` |
| 보상 라벨 | `/event/{tycoon,season}MilestonePopupLabel` (배수 스케일 `×N`) |
| 회차·단계 | `/event/{tycoon,season}MilestonePopup{Lap,Step}` |

**연출 (2D 스케치 — `tycoonSeason/jsonRender/registry.tsx`):**
- **오버레이** `.reward-popup-overlay`: `inset:0`, `rgba(0,0,0,0.5)` + `backdrop-filter: blur(3px)`, flex center. (백드롭 z80 — §1)
- **카드** `.reward-popup-card`: 배경 `#F4EFE6`, 테두리 `4px solid #000`, radius 20, 그림자 `8px 8px 0 #000`, min-width 280. **등장 = `popupOpenBounce 0.45s`** cubic-bezier 바운스(scale 0.7→1.08→0.97→1 + 미세 rotate). 데코: **sunburst glow**(주황 `radial-gradient`, `sunburstRotate`), 부유 데코(`floatDecor`), 보상 아이콘 펄스(`rewardIconPulse`).
- **수령 소멸 (가속)**: 카드에 `.claiming` → 오버레이 `bgFadeOut 0.15s`(dim+blur 0), 카드 `cardClaimDisappear 0.15s`(scale 1→1.1→0, rotate −15°). 파티클 없이 빠르게. 언마운트 대기 `setTimeout 150ms`.
- **표시 게이트(★게임 중 미표시)**: 마일스톤 달성 시엔 채널별 큐(`pendingTycoonPopups`/`pendingSeasonPopups`)에 **적재만** 한다. `showNextTycoonPopup`은 `/event/milestoneListVisible`, `showNextSeasonPopup`은 `/event/expressVisible || /event/tournamentPanelVisible`가 참일 때만 표시(아니면 no-op). 해당 창 **열림 시 flush**(대기분 표시), **닫힘 시 같은 채널 팝업 닫음**.
- **연쇄(다음 보상)**: 닫을 때 `dismissTycoonMilestonePopup()`/`dismissSeasonMilestonePopup()` → **같은 채널 `setTimeout 50ms` 후 다음**(React 배칭 stuck 방지). 타이쿤·시즌 **완전 독립** — 하나가 다른 쪽을 막지 않음.
- **제목에 이벤트명 포함**: `${이벤트명} · ${회차}회차 ${단계}단계 달성!` + 카드 상단에 이벤트명 헤더 → 타이쿤/시즌 혼동 방지.
- **다음 보상 아이콘 스왑**(마일리지 바): `.event-reward-badge-swap-out 0.26s` → `.event-reward-badge-swap-in 0.38s`(`eventMonopolyUi.tsx` setTimeout 300/260/380ms).

### 4-5. 토너먼트 정산 (`settleTournament` → 패널)

| 요소 | $state |
|------|--------|
| 종료 플래그 | `/event/tournamentEnded` |
| 정산 표시 | `/event/settlementVisible` |
| 최종 순위 | `/event/settlementRank` (= `tournamentRank`) |
| 시즌 코인 | `/event/settlementCoins`, 누적 `/event/seasonCoins` |
| 보상 번들 | `/event/settlementBundleId` |
| 클래스 | `/event/className`, `/event/classLevel`, `/event/classSubtitle` |

---

## 5. `/event/*` 상태 경로 (eventExternalStore — 그룹별)

전 경로 `/event/` 접두사. `hudStore(/hud/*)`와 **완전 분리**.

### 가시성·테마
`/event/visible`, `/event/name`, `/event/kind`, `/event/themeKey`, `/event/currencyAssetKey`

### 타이쿤 마일리지
`/event/points`, `/event/nextMilestonePoint`, `/event/nextRewardAssetKey`, `/event/nextRewardLabel`,
`/event/timerText`, `/event/ticketMultiplier`, `/event/lastTpGain`,
`/event/milestoneRows`, `/event/milestoneListVisible`,
`/event/{tycoon,season}MilestonePopup{Visible,Title,Lap,Step,AssetKey,Label}` (타이쿤·시즌 독립 채널),
`/event/tycoonBadgeLabel`('타이쿤')

### 시즌 토너먼트
`/event/seasonPoints`, `/event/lastSeasonGain`, `/event/nextSeasonMilestonePoint`,
`/event/nextSeasonRewardAssetKey`, `/event/nextSeasonRewardLabel`,
`/event/tournamentVisible`, `/event/tournamentRank`, `/event/tournamentRows`,
`/event/tournamentPanelVisible`, `/event/tournamentEnded`,
`/event/seasonName`, `/event/seasonThemeKey`, `/event/seasonCurrencyAssetKey`, `/event/seasonTimerText`,
`/event/seasonGroupSize`(50), `/event/seasonBadgeLabel`('시즌'),
`/event/seasonCoins`, `/event/className`, `/event/classLevel`, `/event/classSubtitle`,
`/event/settlementVisible`, `/event/settlementRank`, `/event/settlementCoins`, `/event/settlementBundleId`

### 시즌 익스프레스
`/event/expressVisible`, `/event/expressTabVisible`, `/event/expressName`, `/event/expressTitle`,
`/event/expressTimerText`, `/event/expressRewardAssetKey`, `/event/expressRewardLabel`

### 헬프
`/event/helpVisible`, `/event/helpKind` — `event:openHelp`(detail `'tycoon' | 'season'`) / `event:closeHelp`

> `eventModalOpen(snap)` = `milestoneListVisible || tournamentPanelVisible || settlementVisible || helpVisible || expressVisible`. true면 App 모달 레이어가 클릭을 받고 인게임 HUD는 숨김.

---

## 6. 재현 체크리스트

1. mileage 슬롯 = 좌상단 full-width, z(전투40/그외11), 내부만 클릭.
2. tournament 슬롯 = 우측, z 동일, 사이드탭 스택 top = `eventHudLayerTop + 8 + idx×112`.
3. top px = 전투 108 / 로비 128.
4. modal 슬롯 = inset0 z60, 보상 팝업 백드롭 z80.
5. 메인 모달 3종 상호 배타 + 보상 팝업은 메인 모달 열림 시에만.
6. 토너먼트/시즌 = **우측**(좌측 아님). 정산은 패널+`tournamentEnded`(전용 SettlementPopup은 껍데기).
7. 모든 색·아이콘·테마 = `event_asset_config.csv` + `event_ui_theme_config.csv` 경유. 코드 하드코딩 금지.
