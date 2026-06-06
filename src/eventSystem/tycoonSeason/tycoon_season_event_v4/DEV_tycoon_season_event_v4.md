---
doc_generation: mdv4
condense_policy: forbidden
note: "v4는 mdv3와 별도 폴더. v5 diff용 — 절대 요약·삭제 금지."
ui_pixel_precision: "DESIGN·외부 팀. DEV는 json-render 슬롯·$state·DOM 순서·CSV SSoT만."
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
| `/event/tycoonMilestonePopupVisible` · `…/seasonMilestonePopupVisible` | boolean | 타이쿤/시즌 보상 팝업 표시 (**독립 2채널**, 서로 안 막음) |
| `/event/{tycoon,season}MilestonePopupTitle` | string | 보상 팝업 제목(이벤트명 포함) |
| `/event/{tycoon,season}MilestonePopupAssetKey` | string | 보상 팝업 아이콘 |
| `/event/{tycoon,season}MilestonePopupLabel` | string | 보상 팝업 라벨 |
| `/event/{tycoon,season}MilestonePopup{Lap,Step}` | number | 회차·단계 |

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
| `event:closeTycoonMilestonePopup` / `event:closeSeasonMilestonePopup` | 보상 팝업 닫기 (채널별 — 타이쿤/시즌 독립) |
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


---

## 14. Deployed CSV Full Contents (public SSoT)

> **배포 SSoT.** AI는 이 내용을 임의 변경하지 말 것. 파일이 repo에 있으면 fetch 경로 그대로 사용.

### `public/event/tycoonSeason/bot_simulator_config.csv`

```csv
key,value,note
tick_sec_cap,15,봇 틱 상한(초) — tournament tick_sec와 min
bot_init_rank_mult,250,초기 TP = rankFactor×이값 + bot_init_base + random×bot_init_rand
bot_init_base,10,
bot_init_rand,40,
bot_effective_points_floor,300,플레이어 0점일 때 봇 성장 기준 하한
bot_growth_rank_top,1.6,상위 봇 growth ratioFactor 상한
bot_growth_rank_span,1.3,상위−하위 ratioFactor 스팬
bot_cap_ratio_top_mult,1.6,상위 봇 capRatio 배율
```

### `public/event/tycoonSeason/event_asset_config.csv`

```csv
asset_key,asset_type,url,fallback_text,width,height
tycoon_coin,icon,,🎈,40,40
season_coin,icon,,🏆,40,40
reward_energy,icon,,⚡,36,36
reward_gold,icon,,💰,36,36
reward_gem,icon,,💎,36,36
reward_dna,icon,,🧬,36,36
reward_sticker,icon,,🃏,36,36
tycoon_banner_bg_top,color,#FF8A2A,,0,0
tycoon_banner_bg_bottom,color,#FFE4A8,,0,0
tycoon_banner_border,color,#FFFFFF,,0,0
tycoon_progress_track,color,#3D2817,,0,0
tycoon_progress_fill,color,#FFB347,,0,0
tycoon_title_text,color,#FFFFFF,,0,0
tycoon_timer_bg,color,#FFFFFF,,0,0
tycoon_timer_text,color,#333333,,0,0
season_widget_bg,color,#152238,,0,0
season_widget_border,color,#4FC3F7,,0,0
season_widget_accent,color,#29B6F6,,0,0
season_title_text,color,#E3F2FD,,0,0
season_badge_bg,color,#0D47A1,,0,0
season_badge_text,color,#FFFFFF,,0,0
lobby_tycoon_card_bg,color,#3D2817,,0,0
lobby_tycoon_card_border,color,#FFB347,,0,0
lobby_season_card_bg,color,#0F2744,,0,0
lobby_season_card_border,color,#4FC3F7,,0,0
enemy_normal,icon,,👾,40,40
enemy_boss,icon,,👹,40,40
enemy_mini_boss,icon,,👿,40,40
help_arrow,icon,,➜,24,24
tournament_hero,icon,,🏆,120,72
tournament_tab_icon,icon,,🏆,48,48
modal_border_color,color,#9C7BD8,,0,0
modal_bg_color,color,#E8D4F8,,0,0
row_player_bg,color,#B3E5FC,,0,0
reward_lock,icon,,🔒,36,36
```

### `public/event/tycoonSeason/event_board_config.csv`

```csv
event_id,event_name,event_kind,group_size,currency_asset_key,milestone_group_id,theme_key,duration_hours,tick_min,enabled
10001,겨울 타이쿤 챌린지,TYCOON_MILEAGE,0,tycoon_coin,mg_ty_01,tycoon_default,72,10,1
10002,시즌 익스프레스,SEASON_EXPRESS,50,season_coin,mg_se_01,season_default,72,30,1
```

### `public/event/tycoonSeason/event_express_config.csv`

```csv
event_id,event_name,duration_hours,reward_asset_key,icon_key
10002,스프린트 익스프레스,12,reward_dice,express_icon
```

### `public/event/tycoonSeason/event_help_acquire_config.csv`

```csv
event_kind,target_type,row_title,kills_required,reward_label,left_icon_key,reward_icon_key,sort_order
TYCOON_MILEAGE,normal,일반 몬스터,10,1장,enemy_normal,tycoon_coin,1
TYCOON_MILEAGE,boss,중간 보스,1,1장,enemy_mini_boss,tycoon_coin,2
SEASON_TOURNAMENT,normal,일반 몬스터,50,1장,enemy_normal,season_coin,1
SEASON_TOURNAMENT,boss,최종 보스,2,1장,enemy_boss,season_coin,2
SEASON_EXPRESS,normal,일반 몬스터,50,1장,enemy_normal,season_coin,1
SEASON_EXPRESS,boss,최종 보스,2,1장,enemy_boss,season_coin,2
```

### `public/event/tycoonSeason/event_help_config.csv`

```csv
help_id,event_kind,title,subtitle,acquire_section_title,mission_section_title,body_1,body_2,body_3,body_4,point_icon_asset
tycoon_help,TYCOON_MILEAGE,겨울 타이쿤 챌린지,타이쿤 이벤트,재화 획득 방법,마일스톤 미션,아래 조건으로 타이쿤 재화를 모읍니다.,번개 배수(입장 시 선택)만큼 한 번에 더 많이 받을 수 있습니다.,마일스톤 목표에 도달하면 보상을 수령합니다.,상단 주황 바에서 진행도를 확인하세요.,tycoon_coin
season_help,SEASON_TOURNAMENT,시즌 익스프레스,시즌 토너먼트,재화 획득 방법,순위 경쟁,아래 조건으로 토너먼트 점수(재화)를 모읍니다.,같은 점수가 50명 순위에 실시간 반영됩니다.,이벤트 종료 후 순위에 따라 시즌 코인을 받습니다.,이벤트 종료 시 순위 보상을 수집하세요.,season_coin
express_help,SEASON_EXPRESS,시즌 익스프레스,스프린트 익스프레스,재화 획득 방법,순위 경쟁,처치 시 시즌 점수와 타이쿤 TP가 각각 쌓입니다.,번개 배수를 올리면 두 재화 모두 더 많이 받습니다.,50명 순위에 실시간 반영됩니다.,이벤트 종료 시 순위 보상을 수집하세요.,season_coin
```

### `public/event/tycoonSeason/event_kill_reward_config.csv`

```csv
enemy_id,tycoon_point_base,season_point_base,is_boss
basic,3,2,false
dog,3,2,false
bloater,4,3,false
spitter,4,3,false
mini_boss,15,0,false
crusher,15,0,false
nexus,15,0,false
final_boss,0,25,true
```

### `public/event/tycoonSeason/event_milestone_config.csv`

```csv
milestone_group_id,step,required_point,reward_bundle_id,reward_asset_key,reward_qty_label
mg_ty_01,1,400,reward_energy_25,reward_energy,×25
mg_ty_01,2,1200,reward_gold_500,reward_gold,×500
mg_ty_01,3,2400,reward_energy_40,reward_energy,×40
mg_ty_01,4,4000,reward_dna_1,reward_dna,×1
mg_ty_01,5,6000,reward_gem_50,reward_gem,×50
mg_ty_01,6,8400,reward_gold_1000,reward_gold,×1000
mg_ty_01,7,11200,reward_energy_60,reward_energy,×60
mg_ty_01,8,14400,reward_dna_3,reward_dna,×3
mg_ty_01,9,18000,reward_gem_150,reward_gem,×150
mg_ty_01,10,22000,reward_gem_300_gold_3000,reward_gem,×300
mg_se_01,1,400,reward_energy_20,reward_energy,×20
mg_se_01,2,1200,reward_gold_300,reward_gold,×300
mg_se_01,3,2400,reward_energy_30,reward_energy,×30
mg_se_01,4,4000,reward_dna_1,reward_dna,×1
mg_se_01,5,6000,reward_gem_30,reward_gem,×30
mg_se_01,6,8400,reward_gold_800,reward_gold,×800
mg_se_01,7,11200,reward_energy_50,reward_energy,×50
mg_se_01,8,14400,reward_dna_2,reward_dna,×2
mg_se_01,9,18000,reward_gem_100,reward_gem,×100
mg_se_01,10,22000,reward_gem_200_gold_2000,reward_gem,×200
```

### `public/event/tycoonSeason/event_ui_theme_config.csv`

```csv
theme_key,prop_key,value
tycoon_default,banner_radius,22
tycoon_default,banner_height,56
tycoon_default,title_font_size,15
tycoon_default,progress_font_size,14
tycoon_default,timer_font_size,11
tycoon_default,bg_top_color,tycoon_banner_bg_top
tycoon_default,bg_bottom_color,tycoon_banner_bg_bottom
tycoon_default,border_color,tycoon_banner_border
tycoon_default,track_color,tycoon_progress_track
tycoon_default,fill_color,tycoon_progress_fill
tycoon_default,title_color,tycoon_title_text
tycoon_default,timer_bg_color,tycoon_timer_bg
tycoon_default,timer_text_color,tycoon_timer_text
season_default,side_widget_width,96
season_default,side_widget_top,118
season_default,leaderboard_row_height,36
season_default,title_font_size,11
season_default,widget_bg_color,season_widget_bg
season_default,widget_border_color,season_widget_border
season_default,widget_accent_color,season_widget_accent
season_default,title_color,season_title_text
season_default,badge_bg_color,season_badge_bg
season_default,badge_text_color,season_badge_text
season_default,modal_border_color,modal_border_color
season_default,modal_bg_color,modal_bg_color
season_default,row_player_bg,row_player_bg
season_default,side_widget_right,8
season_default,side_widget_top,140
lobby_promo_default,card_gap,8
lobby_promo_default,card_height,72
lobby_promo_default,tycoon_bg_color,lobby_tycoon_card_bg
lobby_promo_default,tycoon_border_color,lobby_tycoon_card_border
lobby_promo_default,season_bg_color,lobby_season_card_bg
lobby_promo_default,season_border_color,lobby_season_card_border
```

### `public/event/tycoonSeason/season_class_config.csv`

```csv
class_level,class_name,required_coins,tournament_reward_rate,instant_bundle_id
1,타이쿤 클래스,0,1.0,bundle_class_1
2,퍼스트 클래스,15,1.05,bundle_class_2
3,프리미어 클래스,35,1.10,bundle_class_3
4,디럭스 클래스,60,1.15,bundle_class_4
5,엘리트 클래스,90,1.20,bundle_class_5
```

### `public/event/tycoonSeason/tournament_bot_name_pool.csv`

```csv
name
하늘바람
별빛나래
초록고양이
바다물결
노을빛
은하수
바람결
새벽별
민트향
라일락
코코넛
피치맛
레몬티
베리맛
카카오
우주탐험
모험가
방랑자
여행자
탐험대
붉은여우
푸른늑대
작은토끼
느긋한곰
반짝사슴
철벽수호
빛의검
바람의활
고요한법
따뜻한힐
루나킹
솔라퀸
미스티
아쿠아
테라
진주님
옥이
수정이
마블
코랄
서준
민서
지후
수아
예린
도윤
하은
시우
유나
준호
게임왕초보
주말전사
퇴근후플레이
커피한잔
밤올빼미
행운아
평화주의
느린거북
빠른토끼
조용한관찰자
```

### `public/event/tycoonSeason/tournament_config.csv`

```csv
key,value,description
group_size,50,토너먼트 고정 인원(본인+봇)
tick_sec,200,봇 TP 갱신 간격(초) — event_board tick_min 우선, 기본 30분
difficulty,low,봇 난이도 프로필
player_cap_ratio,0.72,봇 TP 상한=플레이어×비율
growth_ratio,0.45,틱당 성장 기준 비율
variance_min,0.85,봇 랜덤 변동 하한
variance_max,1.0,봇 랜덤 변동 상한
bot_floor_ratio,0.25,봇 TP 하한=플레이어×비율
```

### `public/event/tycoonSeason/tournament_rank_reward_config.csv`

```csv
event_id,rank_from,rank_to,bundle_id,season_coins,dice_label,cash_label,pack_asset_key,token_label
10002,1,1,bundle_rank_1,20,1600,33.2M,reward_sticker,20
10002,2,3,bundle_rank_2_3,15,900,16.6M,reward_dice,18
10002,4,10,bundle_rank_4_10,10,700,12.5M,reward_gold,16
10002,11,25,bundle_rank_11_25,5,400,8.0M,reward_dice,10
10002,26,50,bundle_rank_26_50,1,200,3.0M,reward_gold,5
```

