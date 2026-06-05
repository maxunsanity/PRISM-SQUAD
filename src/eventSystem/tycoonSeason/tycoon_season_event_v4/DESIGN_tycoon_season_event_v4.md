---
doc_generation: mdv4
condense_policy: forbidden
note: "v4는 mdv3와 별도 폴더. v5 diff용 — 절대 요약·삭제 금지."
ui_pixel_precision: "DESIGN·외부 팀. DEV는 json-render 슬롯·$state·DOM 순서·CSV SSoT만."
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
| `EventMilestoneListPopup` | `/event/milestoneListVisible` | `event:toggleMilestoneList` / `event:closeMilestonePopup` |
| `EventMilestoneRewardPopup` | `/event/milestonePopupVisible` | `event:closeMilestonePopup` — **백드롭 z80** |
| `EventTournamentPanel` | `/event/tournamentPanelVisible` | `event:toggleTournamentPanel` / `event:closeTournamentPanel` |
| `SeasonExpressPanel` | `/event/expressVisible` | `event:toggleExpressPanel` / `event:closeExpress` |
| `EventTournamentSettlementPopup` | (정산) | **현재 `return null` 껍데기** — 정산은 `EventTournamentPanel` + `/event/tournamentEnded`로 렌더 |

- 보상 팝업 백드롭: `position:absolute, inset:0, zIndex:80, background:rgba(0,0,0,0.65)`.
- 메인 모달 3종(`milestoneListVisible`/`tournamentPanelVisible`/`expressVisible`)은 **상호 배타** — 하나 열면 나머지 닫힘.
- 보상 팝업은 **메인 모달이 열려 있을 때만** 대기열에서 순차 표시(`flushPendingMilestonePopups`).

### 4-4. 마일스톤 보상 팝업 (`EventMilestoneRewardPopup`)

| 요소 | $state |
|------|--------|
| 제목 | `/event/milestonePopupTitle` (`N단계 달성!`) |
| 보상 아이콘 | `/event/milestonePopupAssetKey` |
| 보상 라벨 | `/event/milestonePopupLabel` (배수 스케일 적용된 `×N`) |

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
`/event/milestonePopupVisible`, `/event/milestonePopupTitle`, `/event/milestonePopupAssetKey`, `/event/milestonePopupLabel`,
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
