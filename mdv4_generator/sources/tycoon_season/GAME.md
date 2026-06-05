---
identity:
  name: SQUARE EVENT (스퀘어 이벤트)
  pitch: "전투 중 몬스터 처치로 타이쿤 포인트(TP)를 모으고, 상단 마일리지 바로 진행하며, 시즌 토너먼트(50명)와 순위를 겨루는 라이브 이벤트"
  host_game: "스퀘어(탕탕특공대류) — PRISM SQUAD v2에 모듈로 탑재, 추후 분리 가능"
  reference: "모노폴리 GO — 상단 마일리지 배너 + 시즌/타이쿤 토너먼트 (보드 타일 대신 몬스터 킬로 대체)"
  module_path: "src/eventSystem/"
  data_path: "public/event/"
  dev_entry: "EVENT_SYSTEM.md (개발자 연동 요약)"

components:
  tycoon_points:
    type: int
    alias: TP
    desc: "이벤트 전용 누적 포인트. 몬스터 처치 시 증가"
    formula: "point_base(enemy_id) × ticket_multiplier"
    source: event_kill_reward_config.csv
  season_coins:
    type: int
    desc: "토너먼트 종료·순위 보상으로 누적, 클래스 승급에 사용"
    source: tournament_rank_reward_config.csv + season_class_config.csv
  ticket_multiplier:
    type: int
    desc: "호스트 게임 입장 배수. TP·시즌 점수 획득에 곱함 (max(1, mult))"
    source: "public/ticket_multiplier_step.csv (1/2/5/10/50/100) — 코드 실사용. ticket_config.csv는 미사용 기획표"

event_kinds:
  TYCOON_MILEAGE:
    desc: "개인 마일리지. 순위 없음. 상단 배너에 진행 표시"
    ui: EventTycoonMileageBar
    rewards: event_milestone_config.csv
  SEASON_TOURNAMENT:
    desc: "50명 토너먼트(본인 1 + 봇 49). TP로 순위 경쟁"
    ui: EventTournamentLeaderboard
    rewards: tournament_rank_reward_config.csv
    bots: tournament_bot_name_pool.csv + tournament_config.csv

ui_slots:
  top_mileage_bar:
    position: "TopBar(52px) 바로 아래"
    component: EventTycoonMileageBar
    reference_ui: "모노폴리 GO — 식은 죽 먹기 상단 캡슐 (0/N, 재화·보상 아이콘, 타이머)"
    data_bind:
      - "/event/name"
      - "/event/points"
      - "/event/nextMilestonePoint"
      - "/event/currencyAssetKey"
      - "/event/nextRewardAssetKey"
      - "/event/nextRewardLabel"
      - "/event/timerText"
      - "/event/themeKey"
  left_tournament_mini:
    position: "좌측 상단 (전투 중)"
    component: EventTournamentLeaderboard
    reference_ui: "모노폴리 GO — 프리미어 클래스 좌측 위젯 / 순위 팝업 축약"
    data_bind:
      - "/event/tournamentRows"
      - "/event/tournamentRank"
    note: "2차에 풀팝업·리더보드 확장 예정"

mechanics:
  point_gain:
    desc: "적 처치 시 TP 적립 (모노폴리 타일 착지 대체)"
    trigger: "호스트 GameCore._onEnemyDeath → EventBridge.onEnemyKilled"
    table: event_kill_reward_config.csv
    boss_row: "final_boss — 보스 처치 시 별도 가산"
  mileage_milestone:
    desc: "TP 누적이 required_point 이상이면 마일스톤 달성 (1차 자동 수령)"
    table: event_milestone_config.csv
    group_key: "event_board_config.milestone_group_id"
  tournament_bots:
    desc: "이벤트 시작 시 이름 풀에서 49명 랜덤, 난이도 low"
    group_size: 50
    tables:
      - tournament_config.csv
      - tournament_bot_name_pool.csv
    behavior: "8초 틱, 플레이어 TP의 72% 상한, 성장률 45% — 테스트용으로 본인이 상위권 들어가기 쉬움"
  season_class:
    desc: "season_coins 누적 시 class_level 승급 (2차 정산 연동)"
    table: season_class_config.csv

design_rules:
  - "수치·아이콘·색·배너 크기는 CSV만 수정. 코드 하드코딩 금지"
  - "UI 추가/변경 시 jsonRender 3종 세트 동시 패치: eventHudSpec + eventExternalStore + registry"
  - "에셋은 event_asset_config.csv에 URL·fallback_text 등록"
  - "레이아웃 수치는 event_ui_theme_config.csv (theme_key별)"
  - "이벤트 모듈 분리 시 src/eventSystem + public/event 만 이전"

---

# SQUARE EVENT — 게임 기획서 (GAME.md)

> **대상**: 게임 기획 · 밸런스 · 운영  
> **코드/연동 요약**: 같은 폴더 `EVENT_SYSTEM.md`  
> **호스트 게임**: 스퀘어(탕탕류). PRISM 본편 `mdv4_generator/sources/core/GAME.md`와 별도 문서.

## 1. 이 모듈이 하는 일

스퀘어 전투(서바이버) 안에서 **라이브 이벤트**를 돌린다.

| 축 | 모노폴리 GO 대응 | 스퀘어 적용 |
|----|------------------|-------------|
| **타이쿤 마일리지** | 발바닥/배너 마일리지 (개인, 마일스톤) | **몬스터 킬 → TP**, 상단 캡슐 바 |
| **시즌 토너먼트** | 타이쿤 익스프레스 (그룹 순위, 봇 포함) | **50명 고정**, 봇 49 + 본인, 좌측 미니 순위 |

- 보드·타일·주사위는 **없음**. 밸런스는 전부 **CSV**로 조절.
- 나중에 **폴더 통째 분리** 가능 (`src/eventSystem` + `public/event`).

## 2. 플레이어가 보는 UI

> **이벤트는 2개가 동시에 돌아도 UI는 반드시 분리**한다.  
> - **타이쿤** = 개인 마일리지(주황 캡슐·🎈 재화)  
> - **시즌** = 50명 순위(청색 위젯·🏆 재화)  
> 같은 TP 수치를 쓰더라도 **이름·배지·색·아이콘**이 달라야 한다.

### 2-0. 메인 이벤트 창 — 획득 방법 + 미션 (한 화면)

**별도 헬프 탭 없음.** 메인 창을 열면 **재화 획득 방법**과 **미션**이 같이 보인다.

| 메인 창 | 여는 방법 | 상단 섹션 | 하단 섹션 |
|---------|-----------|-----------|-----------|
| 타이쿤 | 상단 주황 바 탭 | `재화 획득 방법` (일반 20 / 보스 1) | `마일스톤 미션` 목록 |
| 시즌 | 우측 트로피 탭 | `재화 획득 방법` (일반 20 / 보스 1) | `순위 경쟁` 리더보드 |

CSV: `event_help_acquire_config.csv` + `event_help_config.csv` (`acquire_section_title`, `mission_section_title`)

### 2-0b. (참고) 헬프 CSV 문구

| CSV | 용도 |
|-----|------|
| `event_help_config.csv` | 이벤트명·부제·섹션 제목·추가 팁 4줄 |
| `event_help_acquire_config.csv` | **획득 방법 2행** (일반/보스) |

**획득 규칙 (기본값, CSV 수정 가능)**

| 이벤트 | 대상 | 조건 | 보상 |
|--------|------|------|------|
| 타이쿤 챌린지 | 일반 몬스터 | **30마리** 사냥 | 재화 1장 |
| 타이쿤 챌린지 | 보스 | 1마리 사냥 | 재화 1장 |
| 시즌 익스프레스 | 일반 몬스터 | **50마리** 사냥 | 점수 1장 |
| 시즌 익스프레스 | 보스 | **2마리** 사냥 | 점수 1장 |

> CSV 검증값(`event_help_acquire_config.csv`): 타이쿤 일반 30 / 보스 1, 시즌 익스프레스 일반 50 / 보스 2.

- UI: 좌 몬스터 아이콘 → 가운데 사냥 조건 → 우 재화 아이콘 + `1장`
- 아이콘: `enemy_normal`, `enemy_boss`, `tycoon_coin` / `season_coin`

### 2-1. 인게임 상단 — 타이쿤 마일리지 바 (`EventTycoonMileageBar`)

**표시 조건**: 전투 중(로비 아님) + `TYCOON_MILEAGE` 활성

| UI 요소 | 데이터 소스 |
|---------|-------------|
| 이벤트명 | `event_board_config.event_name` |
| 진행 `N/M` | 누적 TP / 다음 마일스톤 `required_point` |
| 좌측 아이콘 | `currency_asset_key` → `event_asset_config` |
| 우측 보상 아이콘·라벨 | 다음 마일스톤 `reward_asset_key`, `reward_qty_label` |
| 타이머 | 런타임 잔여 시간 (2차: `active_until` CSV 연동) |
| 배너 색·높이 | `event_asset_config`(색) + `event_ui_theme_config`(크기) |

**레퍼런스**: 모노폴리 GO 「식은 죽 먹기」 상단 캡슐.

### 2-1-b. 보상 아이콘 스왑 + 보상 팝업 연쇄 (구현 주의 — 최종 튜닝)
- **다음 보상 아이콘 스왑**(`eventMonopolyUi.tsx` + `style.css`): 마일스톤 달성 시 우측 보상 아이콘이 다음 단계로 교체. `.event-reward-badge-swap-out` **0.26s** → `.event-reward-badge-swap-in` **0.38s**. `eventMonopolyUi.tsx` 3중 중첩 `setTimeout` 지연 **300ms / 260ms / 380ms**(총 ~0.94s)로 버벅임 제거.
- **보상 획득 팝업 가속**(`registry.tsx`): 팝업 카드 축소 `cardClaimDisappear` + 오버레이 `bgFadeOut` 모두 **0.15s**, 언마운트 대기 `setTimeout` **150ms**. 불필요한 파티클 없이 빠르게 소멸(연속 수령 시인성·반응성).
- **[CRITICAL] 타이쿤·시즌 보상 팝업 채널 완전 분리**: 두 이벤트가 **독립 큐**(`pendingTycoonPopups`/`pendingSeasonPopups`) + **독립 상태**(`/event/tycoonMilestonePopup*`/`/event/seasonMilestonePopup*`)를 가져 서로 막지 않음. **게임(전투) 중엔 안 뜨고**, 타이쿤 창(마일스톤 리스트)·시즌 창(익스프레스/토너먼트)이 **열릴 때만** 대기 보상이 표시된다(`showNext*`가 해당 창 visible일 때만, 창 닫으면 닫힘). 제목·카드 헤더에 **이벤트명** 포함(혼동 방지). 닫을 때 채널별 `dismissTycoonMilestonePopup()`/`dismissSeasonMilestonePopup()` → 같은 채널 `setTimeout 50ms` 후 다음(React 배칭 stuck 방지). close 이벤트도 채널별 `event:closeTycoonMilestonePopup`/`event:closeSeasonMilestonePopup`. (구: 단일 공유 큐·채널 → 시즌이 타이쿤을 막고 제목이 `N회차 N단계`로 동일해 "보상이 같다"고 오인되던 버그 → 채널 분리로 해결.)

### 2-2. 우측 — 토너먼트 탭 (`EventTournamentLeaderboard`)

**레퍼런스**: 모노 GO 보드 **우측 이벤트 아이콘** → 탭 시 순위판.

- 썸네일: `event_asset_config` → `tournament_tab_icon` / `tournament_hero`
- 탭 시 **퍼스트 클래스** 스타일 순위판 (`EventTournamentPanel`)

### 2-3. 토너먼트 순위판 (`EventTournamentPanel`)

**레퍼런스**: 첨부 스크린(종료 화면) — 보라 테두리 · 히어로 배너 · 순위 행 · 보상 칩 · **수집** 버튼.

| UI | 데이터 |
|----|--------|
| 제목 | `season_class_config.class_name` |
| 부제 | `N 에서 업그레이드` (이전 클래스 `required_coins`) |
| 종료 문구 | `이벤트가 종료되었습니다!` |
| 순위 행 | 아바타·이름·점수 pill·`tournament_rank_reward_config` 보상 표시 |
| 수집 | 종료 정산 시 (`settlementVisible`) |

### 2-4. (구) 좌측 미니 — **우측 탭으로 이동함**

**표시 조건**: 전투 중(로비 아님) + `SEASON_TOURNAMENT` 활성

| UI 요소 | 데이터 소스 |
|---------|-------------|
| 배지 `시즌` | `/event/seasonBadgeLabel` |
| 이벤트명 | `event_board_config.event_name` (10002) |
| 내 순위·클래스 | `/event/tournamentRank`, `/event/className` |
| 인원 | `group_size` (50) |
| 상위 6명 | 이름·TP + `season_coin` 아이콘 |
| 타이머 | `/event/seasonTimerText` |
| 위젯 색·위치 | `season_default` theme + `event_asset_config` |

**2차 예정**: 전체 50명 리스트 팝업, 클래스 보기, 토너먼트 정보 팝업.

## 3. 재화 · 획득 (기획 확정)

### 3-1. 타이쿤 포인트 (TP)

```
일반 30킬·보스 1킬마다 1회 적립:
획득 TP = max(1, floor(tycoon_point_base × max(1, ticket_multiplier)))
시즌 점수도 동일 방식 (season_point_base, 일반 50킬·보스 2킬마다)
```

`event_kill_reward_config.csv` 검증값 — **타이쿤(TP)·시즌 점수 base 분리**:

| enemy_id | tycoon_point_base | season_point_base | is_boss |
|----------|-------------------|-------------------|---------|
| basic | 1 | 2 | false |
| dog | 1 | 2 | false |
| bloater | 2 | 3 | false |
| spitter | 2 | 3 | false |
| mini_boss | 8 | 0 | false |
| crusher | 10 | 0 | false |
| nexus | 10 | 0 | false |
| final_boss | 0 | 25 | **true** |

> ⚠️ `final_boss`는 **타이쿤 TP 0 / 시즌 점수 25**다. 적립은 즉시가 아니라 N킬 누적식(일반 30/50, 보스 1/2) × 배수.

- **입장권 배수**는 스퀘어 `ticket_multiplier`와 동일 규칙.
- 골드·보석·인게임 EXP와 **별도 재화** (섞지 않음).

### 3-2. 시즌 코인

- 토너먼트 **종료 후** 순위 구간별 `season_coins` 지급 (2차 정산 구현).
- 누적 → `season_class_config.required_coins` 도달 시 클래스 상승.

## 4. 타이쿤 마일리지 (마일스톤)

- **개인 진행**, 리더보드 없음.
- 그룹: `milestone_group_id` (예: `mg_ty_01`).
- 단계마다 `required_point` + 보상 (`reward_bundle_id`, 표시용 `reward_asset_key`).

**현재 샘플 (`mg_ty_01`, 10단계)** — `event_milestone_config.csv` 검증값.

| step | required_point | 표시 보상 |
|------|----------------|-----------|
| 1 | 1500 | 에너지×25 |
| 2 | 3600 | 골드×500 |
| 3 | 7200 | 에너지×40 |
| 4 | 12600 | DNA×1 |
| 5 | 19500 | 보석×50 |
| 6 | 28000 | 골드×1000 |
| 7 | 38000 | 에너지×60 |
| 8 | 50000 | DNA×3 |
| 9 | 65000 | 보석×150 |
| 10 | 85000 | 보석×300 |

시즌 익스프레스는 `mg_se_01` 그룹(10단계, 1000~70000). 기획 확장 시 동일 CSV에 행만 추가(코드 수정 불필요).

## 5. 시즌 토너먼트 (50명 + 봇)

### 5-1. 인원 (테스트 고정)

| 항목 | 값 |
|------|-----|
| `group_size` | **50** (고정) |
| 플레이어 | 1 (`나`) |
| 봇 | 49 |
| 난이도 | **low** (`tournament_config.csv`) |

### 5-2. 봇 이름

- `tournament_bot_name_pool.csv` — **60개** 일반 닉네임 풀.
- 이벤트 시작 시 **중복 없이 49개** 랜덤 배정.
- 기획 추가 시 풀에 행만 추가.

### 5-3. 봇 점수 (low — 테스트)

| key | 값 | 의미 |
|-----|-----|------|
| tick_sec | 8 | 봇 TP 갱신 간격 |
| player_cap_ratio | 0.72 | 봇 TP ≤ 플레이어×0.72 |
| growth_ratio | 0.45 | 틱 성장 기준 (낮음) |
| bot_floor_ratio | 0.25 | 최소 따라가기 |

→ 운영 전 **normal/hard** 프로필을 `tournament_config`에 key 추가하는 방식으로 확장 가능.

### 5-4. 순위 보상 (샘플)

`event_id=10002` — `tournament_rank_reward_config.csv`

| rank | season_coins |
|------|--------------|
| 1 | 20 |
| 2~3 | 15 |
| 4~10 | 10 |
| 11~25 | 5 |
| 26~50 | 1 |

## 6. CSV 목록 (SSoT) — 기획이 수정하는 파일

| 파일 | 누가 | 내용 |
|------|------|------|
| `event_board_config.csv` | 기획·운영 | 이벤트 ON/OFF, kind, 이름, theme, 마일스톤 그룹, group_size |
| `event_milestone_config.csv` | 기획 | 마일스톤 단계·필요 TP·보상 |
| `event_kill_reward_config.csv` | 밸런스 | 몬스터별 TP |
| `tournament_config.csv` | 밸런스 | 인원·봇 난이도 |
| `tournament_bot_name_pool.csv` | 기획 | 봇 닉네임 풀 |
| `tournament_rank_reward_config.csv` | 기획 | 순위별 보상 |
| `season_class_config.csv` | 기획 | 클래스·필요 코인·배율 |
| `event_asset_config.csv` | 기획·아트 | **아이콘 URL, 색상, fallback 이모지** |
| `event_ui_theme_config.csv` | UI·기획 | 배너 높이·radius·폰트 크기 등 |
| `event_help_config.csv` | 기획 | ⓘ 도움말 제목·본문 4줄 |
| `event_help_acquire_config.csv` | 기획 | 일반 20마리/보스 1마리 획득 규칙 행 |

**경로**: `public/event/` (빌드 시 `dist/event/` 포함)

## 7. 에셋 테이블화 규칙

모든 아이콘·색은 `event_asset_config.csv` 한 곳에서만 관리.

| asset_key | asset_type | 예 |
|-----------|------------|-----|
| tycoon_coin | icon | 타이쿤 마일리지 재화 (🎈) |
| season_coin | icon | 시즌 토너먼트 재화 (🏆) |
| reward_dice | icon | 다음 마일스톤 보상 |
| banner_bg_top | color | `#FF8A2A` |
| progress_track | color | 진행 바 배경 |

- `url` 비우면 `fallback_text` 이모지 표시.
- 신규 이벤트 테마 = **새 asset_key** + `event_board_config.theme_key` 연결.

## 8. 이벤트 인스턴스 (현재 샘플)

| event_id | event_name | event_kind | 비고 |
|----------|------------|------------|------|
| 10001 | 겨울 타이쿤 챌린지 | TYCOON_MILEAGE | 상단 마일리지 |
| 10002 | 시즌 익스프레스 | SEASON_TOURNAMENT | 50명 토너먼트 |

## 9. 신규 이벤트 추가 절차 (기획 체크리스트)

1. `event_board_config.csv` 행 추가 (`event_kind`, `theme_key`, `milestone_group_id` 등).
2. 마일리지면 `event_milestone_config.csv`에 그룹 ID로 단계 추가.
3. 토너먼트면 `tournament_rank_reward_config.csv`에 `event_id` 구간 보상 추가.
4. `event_kill_reward.csv` — 필요 시 몬스터별 TP 조정.
5. `event_asset_config.csv` — 이벤트 전용 아이콘·색 등록.
6. `event_ui_theme_config.csv` — 테마키별 레이아웃 (선택).
7. **코드 수정 없음** (UI 신규 컴포넌트 타입이 필요할 때만 개발 요청).

## 10. 구현 상태 · 로드맵

### ✅ 1차

- CSV 9종 + 로더 (`data.ts`)
- jsonRender: `EventTycoonMileageBar`, `EventTournamentLeaderboard`
- 몬스터 킬 → TP, 봇 49 low 시뮬, 상단/좌측 HUD
- 스퀘어 연동: `EventBridge` + `App.tsx` 슬롯

### ✅ 2차

- `event_board_config.duration_hours` — 이벤트 잔여 시간(기본 72시간)
- `EventMilestoneRewardPopup` — 마일스톤 달성 보상 팝업
- `EventMilestoneListPopup` — 상단 바 탭 → 전체 마일스톤 목록
- `EventTournamentPanel` — 좌측 위젯 탭 → 50명 전체 순위
- `EventTournamentSettlementPopup` — 토너먼트 종료 시 순위·시즌 코인 정산
- `crusher` / `nexus` 킬 보상 CSV 행
- 클래스 승급: `season_coins` 누적 시 `season_class_config` 기준

### ✅ 2.5 (UI 분리)

- **로비** `EventLobbyPromoCards` — 타이쿤/시즌 2카드 나란히
- **인게임** — 타이쿤 상단 캡슐 + 시즌 좌측 위젯 (로비와 상호 배타)
- 테마 색상 `tycoon_*` / `season_*` / `lobby_*` asset_key 분리
- `season_coin` vs `tycoon_coin` CSV 분리

### ⏳ 3차

- 보상 실제 지급(호스트 bundle → 골드/보석 연동)
- `active_from` / `active_until` 캘린더 운영
- 토너먼트 정보·클래스 보기 전용 팝업(모노 레퍼런스 UI)
- event-sandbox 단독 앱

## 코어 연동 (PRISM SQUAD Host) — 재화·아이템

> **코드 검증 기준.** 실제 소스: `host/EventBridge.ts`, `core/EventController.ts`,
> `src/game/GameCore.ts`, `src/App.tsx`. MD가 코드와 다를 경우 **코드가 정답**.

### 계층 구조

- 이벤트는 **인앱 React HUD**다 — 호스트(PRISM SQUAD)의 Three.js 캔버스 위에 React 레이어로 덧그린다.
- **별도 진입 화면·로딩·씬 전환이 없다.** 일반 전투·라바 전투 진행 중 **상시 표시되는 HUD**로 떠 있고, 탭하면 모달이 열린다.
- 연결 지점은 단 하나, `EventBridge` 인스턴스. `App.tsx`가 생성 → `GameCore`에 attach.

### 코어 → 이벤트 (호스트가 부르는 메서드)

`GameCore`가 `EventBridge`(→`EventController`)를 호출하는 진입은 **4개뿐**이다:

| 메서드 | 호출 위치 (GameCore) | 의미 |
|--------|----------------------|------|
| `onEnemyKilled(enemyId, ticketMultiplier)` | `_onEnemyDeath` — `onEnemyKilled(dead.cfg.enemy_id, this.ticketMultiplier)` | 일반 적 처치 |
| `onEnemyKilled('final_boss', ticketMultiplier)` | `_onBossDeath` | **보스도 같은 메서드**로 들어옴 (`enemyId='final_boss'`) |
| `tick(dt)` | 매 프레임 `eventBridge?.tick(dt)` | 타이머·봇 시뮬 진행 |
| `syncTicketMultiplier(mult)` | 로비 배수 토글·게임 시작 시 | ×N 칩을 첫 처치 전에도 맞게 표시 |

> ⚠️ **`onBossKilled` / `onGameTick` / `onGameEnd` 메서드는 존재하지 않는다.** 보스는 `onEnemyKilled('final_boss', mult)`, 프레임은 `tick(dt)` 하나로 처리. (과거 DEV.md가 잘못 기재했던 부분 — 수정됨)

### 적립 규칙 (TP / 시즌 점수)

`EventController.onEnemyKilled` → 타이쿤 TP + 시즌 점수를 **분리 적립**한다.

1. `event_kill_reward_config.csv`에서 `enemy_id` 행 조회 (없으면 `mini_boss` → `basic` 폴백).
   - 컬럼: `enemy_id, tycoon_point_base, season_point_base, is_boss`
2. 보스 판정: `enemyId === 'final_boss'` 또는 행의 `is_boss=true` → `targetType='boss'`, 아니면 `'normal'`.
3. **킬 누적식**: `event_help_acquire_config.csv`의 `kills_required`(`getKillsRequired`)만큼 같은 targetType을 처치해야 1회 적립.
   - 타이쿤(`TYCOON_MILEAGE`): 일반 30킬 / 보스 1킬마다
   - 시즌(`SEASON_EXPRESS`): 일반 50킬 / 보스 2킬마다
4. 적립량: `max(1, floor(point_base × max(1, mult)))`. `point_base ≤ 0`이면 base=1로 보정.

> 즉 "킬 1회 = 즉시 TP"가 아니라 **N킬마다 base×배수**가 누적된다. 직전 적립량은 `/event/lastTpGain` / `/event/lastSeasonGain`에 실린다 (재화 비행 연출용).

### 이벤트 → 코어 (코어가 가져가거나 콜백받는 것)

| 방향 | 메커니즘 | 비고 |
|------|----------|------|
| 결과창 `tycoonEarned` | 코어가 `getTycoonPoints()` **pull** | `EventController.getPoints()` 반환. 브릿지 미부착이면 폴백 `(killCount[+50]) × ticketMultiplier` |
| 보상 지급 신호 | `onRewardGranted(bundleId)` **콜백** | 마일스톤 달성·토너먼트 순위 보상 시 호출. **현재 App.tsx에서 미연결**(no-op) — 3차에서 호스트 인벤토리 연동 예정 |

- `getSeasonCoins()`도 브릿지에 노출되어 있으나 현재 결과창에서 pull하는 곳은 `getTycoonPoints()`뿐.
- `onRewardGranted`는 `EventBridge`에 `public onRewardGranted?` 로 존재하고 `EventController.onRewardGranted`에 위임된다. 호스트가 콜백을 꽂으면 실제 지급으로 확장 가능.

### 입장 배수 (ticket multiplier)

- 후보 단계: `public/ticket_multiplier_step.csv` = **1 / 2 / 5 / 10 / 50 / 100**.
- 입장 비용 = `multiplier × meta.energy_per_mult` (`public/meta_config.csv`, 기본 5번개).
- ⚠️ `public/ticket_config.csv`(basic/silver/gold/diamond 입장권)는 **코드 미사용 기획표**다. 실제 배수 소스는 `ticket_multiplier_step.csv`.
- 이벤트는 이 배수를 `syncTicketMultiplier` / `onEnemyKilled`의 2번째 인자로 받아 `max(1, mult)`로 TP·시즌 점수에 곱한다.

### 빌드 스코프 — 코어 단독 실행

`App.tsx`는 게임 데이터와 이벤트 데이터를 **독립 로드**한다(이벤트 로드 실패해도 게임 진행).

- 이벤트 CSV 로드 성공 → `new EventBridge(eventData)` → `core.attachEventBridge(bridge)`.
- 이벤트 로드 실패/비활성 → `eventData=null` → `core.attachEventBridge(null)`.
- attach(null)이면 `GameCore`의 모든 `eventBridge?.…` 호출이 **옵셔널 체이닝으로 전부 no-op**. 결과창 `tycoonEarned`는 폴백식으로 계산.
- 즉 **PRISM SQUAD 코어 단독 = 이벤트 0 의존**. 폴더(`src/eventSystem` + `public/event`) 제거만으로 분리.

## 유저 플로우 (전투 → 마일리지 → 토너먼트 → 클래스)

```
[전투 중] 몬스터/보스 처치
   └ GameCore._onEnemyDeath / _onBossDeath
       └ EventBridge.onEnemyKilled(enemyId, ticketMultiplier)
           ├─(타이쿤) 일반 30킬·보스 1킬마다 → TP += max(1, floor(base × mult))
           │     └ TP ≥ 마일스톤 required_point → 단계 자동 달성
           │         ├ onRewardGranted(bundle) 콜백 (지급 신호)
           │         └ 메인 모달이 열려 있으면 EventMilestoneRewardPopup(z80)
           └─(시즌) 일반 50킬·보스 2킬마다 → 시즌 점수 += …
                 └ 시즌 점수로 토너먼트 봇 49 + 본인 순위 갱신
```

1. **전투 중 킬 → 마일리지 누적**
   상단 마일리지 캡슐(`EventTycoonMileageBar`)에 `현재 TP / 다음 required_point` 진행이 실시간 표시. 킬마다 재화 비행 파티클(`EventCurrencyFlyOverlay`)이 캡슐로 빨려 들어감.

2. **마일스톤 달성 → 보상 모달**
   누적 TP가 단계 `required_point`를 넘으면 `claimedSteps`에 기록 + 대기열에 푸시.
   **메인 모달(마일스톤 목록/토너먼트/익스프레스)이 열려 있을 때만** `EventMilestoneRewardPopup`이 떠서 보상 아이콘·라벨을 보여줌(대기열 순차 소비). 동시에 `onRewardGranted(reward_bundle_id)` 콜백.

3. **토너먼트 (50명 = 본인 1 + 봇 49)**
   시즌/익스프레스 활성 시 `BotSimulator`가 봇 49명을 생성, `tick(dt)`마다 플레이어 시즌 점수 기준으로 봇 TP를 갱신(상한 `player_cap_ratio`, 하한 `bot_floor_ratio`). 우측 사이드탭(`SeasonExpressSideTab`/`EventTournamentLeaderboard`)을 탭하면 전체 순위판 모달.

4. **종료 → 순위 → 시즌 코인 → 클래스 승급**
   `eventEndSec ≤ 0` 시 `settleTournament`:
   - 최종 순위 산정 → `tournament_rank_reward_config.csv`에서 `season_coins` 지급.
   - `seasonCoins` 누적 → `applyClassLevelUp`이 `season_class_config.required_coins` 기준 `classLevel` 상승(타이쿤→퍼스트→프리미어→디럭스→엘리트).
   - 정산 표시는 `tournamentEnded=true` + `EventTournamentPanel`로 렌더(별도 `EventTournamentSettlementPopup`은 **현재 `return null` 껍데기**).

## 11. PRISM 본편과의 관계

| | PRISM `mdv4_generator/sources/core/GAME.md` | 이 문서 |
|--|---------------------|---------|
| 범위 | 서바이버 전투·로비·장비 | **이벤트만** |
| 데이터 | `public/*.csv` | `public/event/*.csv` |
| UI | `jsonRender/prismHudSpec` | `eventSystem/jsonRender/eventHudSpec` |

PRISM 단독 실행: `EventBridge` 제거 시 본편만 동작.  
이벤트만 테스트: `eventSystem` CSV + 샌드박스(2차).

## 12. 작업 이력

| 날짜 | 내용 |
|------|------|
| 2026-06-03 | 모노폴리 GO 이벤트 구조 조사 → 스퀘어 킬 기반 TP, 50명 low 봇, jsonRender·에셋 CSV 골격 |
| 2026-06-03 | **GAME.md** 신규 — 기획용 SSoT 문서 (`src/eventSystem/GAME.md`) |
| 2026-06-03 | 2차: 마일스톤/토너먼트 팝업, 50명 패널, 종료 정산, duration_hours, 미니보스 킬 매핑 |
| 2026-06-03 | 2.5: 로비 2카드·인게임 HUD 분리, 타이쿤/시즌 비주얼·재화 키 분리 |
| 2026-06-03 | 2.6: 모노 GO형 캡슐·우측 토너먼트 탭·순위판·ⓘ헬프·히어로 이미지 |

---

## Anti-Patterns

### [CRITICAL] HUD 경로를 PRISM `/hud/*`에 섞기

이벤트 state는 **`/event/*`만** 사용. `hudExternalStore`에 이벤트 키 추가 금지.

### [CRITICAL] 아이콘·색상을 registry에 하드코딩

반드시 `event_asset_config.csv` + `EventDataProvider` 조회.

### 마일스톤·순위를 코드에 박기

`event_milestone_config`, `tournament_rank_reward_config`만 수정.

### UI만 바꾸고 Spec·Store 미패치

`eventHudSpec.ts` ↔ `eventExternalStore.ts` ↔ `registry.tsx` **3종 세트** 동시 수정.

---

## 재화·노출 모델 — iframe 지갑 계약과 다름 (주의)

타이쿤·시즌은 **인게임 HUD형**이라 iframe 미니게임(퍼즐·양궁)의 "지갑 계약"과 **메커니즘이 다르다.** 혼동 금지.

| 구분 | 타이쿤·시즌 (인게임 HUD) | 퍼즐·양궁 (iframe) |
|------|------------------------|-------------------|
| 재화 적립 | 코어 `EventBridge.onEnemyKilled` → `EventController` (in-game 상시) | 호스트 `MinigameCurrencyService` → `host:walletSync` |
| 소비/사용 | 마일스톤·토너먼트(별도 게임 화면 없음) | iframe 내부 자체 소비 → `*:walletChanged` |
| 통신 | postMessage 없음 (코어 직접 호출) | postMessage 지갑 계약 3종 |

→ 타이쿤/시즌은 **지갑 계약(`walletSync`)을 쓰지 않는다.** 코어 연동은 `EventBridge` 경유(코어 DEV §9). 재화 적립 규칙은 `event_kill_reward_config.csv` + `event_help_acquire_config.csv`.

### 노출 시간 — 표기 규칙은 공통
- 이벤트 기간: `event_board_config.csv` `duration_hours`(72) — `EventController`가 종료 처리(maxHours).
- 사이드탭 남은시간 표기는 **6개 이벤트 전부 동일**: 초·아이콘 없이 `H시간 M분`/`M분`, **재화 갯수 표기 금지**. 타이쿤/시즌은 컨트롤러 `formatTimer`, iframe은 `eventExposure.formatRemain`(동일 규칙). (코어 DEV §12·§13.)
