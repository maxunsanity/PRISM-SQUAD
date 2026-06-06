---
identity:
  name: "Archery Arena"
  genre: [casual, ranking, event-minigame]
  platform: [mobile-web]
  players: 1
  pitch: "재화를 소비해 활을 쏘고 50인 랭킹에서 경쟁하는 이벤트 미니게임."

components:
  bow_stands:
    type: int
    default: 5
    note: "PRISM 호스트 SSoT(prism_archery_host_v1). iframe 표시는 dice_count/bow_stands 동기화"

  dice_count:
    type: int
    default: 0
    note: "레거시 키 — UI·저장 호환용. 의미=활대 개수(주사위 아님)"

  target_score:
    type: int
    default: 0

  rank_current:
    type: int
    default: 50

  combo_count:
    type: int
    default: 0

  total_attempts:
    type: int
    default: 0

  daily_free_used:
    type: bool
    default: false

  attempt_type:
    type: enum
    values: [SINGLE, SET3, SET5]

  hit_zone:
    type: enum
    values: [OUTER, MIDDLE, CENTER, BULLSEYE]

  rank:
    type: int

  display_name:
    type: string

  score:
    type: int
    default: 0

  is_me:
    type: bool
    default: false

  is_bot:
    type: bool
    default: true

  tier:
    type: enum
    values: [low, mid, high]

entities:
  player:
    components: [dice_count, target_score, rank_current, combo_count, total_attempts, daily_free_used]
    states: [lobby, attempting, shooting, bullseye, result, reward]

  ranking:
    components: [rank, display_name, score, is_me, is_bot, tier]
    count: 50

mechanics:
  turn_structure: realtime

  actions:
    attempt:
      actor: player
      params:
        attempt_type: "enum(SINGLE|SET3|SET5)"
      preconditions:
        - "dice_count >= cost_dice"
        - "screen-shooting 활성 상태가 아님"
      effects:
        - "dice_count -= cost_dice 즉시 차감"
        - "base_score = random(score_min, score_max)"
        - "final_score = floor(base_score × attempt_multiplier)"
        - "bullseye_prob = min(max_prob, base_prob + combo × increment)"
        - "random() < bullseye_prob → final_score = 100, hit_zone = BULLSEYE"
        - "target_score += final_score"
        - "SHOOTING 화면 전환 → WebGL 연출 → HUD 갱신"
        - "BULLSEYE 분기: Bullseye 화면 전환"
        - "일반 분기: 확인 버튼 대기 → Lobby 복귀"
        - "update_ranking(target_score)"

    update_ranking:
      actor: system
      effects:
        - "내 점수로 50인 순위 재계산"
        - "동점 시 is_me는 해당 점수대 맨 뒤"
        - "rank_current 업데이트 → rankRise 애니메이션"

    bot_tick:
      actor: system
      effects:
        - "재귀 setTimeout — delay = random(bot_tick_min_ms, bot_tick_max_ms)"
        - "1~3명 랜덤 봇 score += tier 기반 랜덤"
        - "recalculate_ranks() → render_ranking()"
        - "재귀 setTimeout 재예약"

    reset_session:
      actor: player
      preconditions:
        - "타이머 클릭"
      effects:
        - "disposeArcheryThree()"
        - "localStorage 랭킹 키 제거"
        - "player 초기 상태 복원"
        - "endMs = Date.now() + 60_000"
        - "ensureRanking() → Lobby 화면"

  loops:
    - name: attempt_loop
      description: "재화 차감 → 카드 선택 → 도전 → WebGL 연출 → 순위 갱신 → 반복."
    - name: bot_loop
      description: "재귀 setTimeout → 봇 점수 갱신 → 순위표 변동 → 재스케줄."
    - name: session_loop
      description: "타이머 250ms tick → 남은 시간 표시 → 0 도달 → endSession."

goals:
  win:
    - condition: "이벤트 종료 시 최상위 순위 → rank_reward_config 보상."
  loss:
    - condition: "재화 소진 후 타이머 종료 → 현재 순위 기준 보상."
  score:
    - metric: target_score
      formula: "도전 횟수 × 점수. Bullseye = 100점 고정."
---

## 🎯 레퍼런스 (제작 기준 게임)

> **양궁 = Monopoly GO 스타일 토너먼트 미니게임 (아케이드 양궁·타겟 스코어링).**
> ※모노폴리GO에 공식 'Archery' 이벤트는 **없음** — 장르·구조·톤 참고용.
>
> ⚠️ 레퍼런스는 톤·조작감·연출 **참고용**. 모든 수치·구조·UI·플로우의 단일 진실(SSoT)은 이 문서 세트(GAME·DESIGN·DEV·CSV)다. **충돌 시 문서 우선**, 임의 추가·생략 금지.

## Design Pillars

**연출이 전부** — 플레이어가 하는 행동은 재화 소비뿐이다. 활쏘기는 순수 연출이다. 결과는 CSV 확률표 기반으로 자동 산출되며 WebGL 과녁 연출이 뒤따른다. 연출이 없으면 게임이 없다.

**봇의 자연스러움** — 봇 49명이 재귀 setTimeout으로 불규칙하게 점수를 올린다. 간격이 규칙적이면 봇임이 드러난다. variance가 핵심이다. setInterval 금지.

**초반 경쟁심** — 봇 전부 0점 시작이면 초반 경쟁심이 없다. v2-gold-balance-v5 스키마 기준으로 SET5 3~4회 완벽 적중해야 1등 탈환 가능한 초기 점수를 설정한다.

## Mechanics in Depth

attempt 액션에서 재화는 WebGL 연출 전에 즉시 차감된다. 연출 후 차감하면 애니메이션 도중 재화 수가 이상하게 표시된다.

Bullseye 확률은 combo_count에 따라 증가한다. base_prob + combo × increment 공식이며 max_prob가 상한이다. 수치는 aa_event_config.csv가 SSoT. 하드코딩 금지.

SET3/SET5 도전은 WebGL 화살 연출을 3회/5회 순차 실행해야 한다. 1회만 실행하면 SET의 의미가 없다. 각 화살 연출이 완료된 후 다음 발을 실행한다.

dispose 타이밍이 중요하다. BULLSEYE 분기는 즉시 dispose 후 Bullseye 화면 전환. 일반 적중은 확인 버튼 클릭 후 dispose. 확인 전에 dispose하면 과녁이 사라진다.

localStorage 버전 체크가 필수다(`aa_event_meta` `event_meta_version`, CSV `event_meta_version`). 불일치 시 메타를 리셋한다. 단 **PRISM 호스트 모드에서 활대 수는 iframe 로컬값이 아니라 호스트 SSoT(`prism_archery_host_v1`, `getHostBowStands()`)** 를 따른다 — 신규/마이그레이션 기본 활대는 **5개**(`starter_bow_stands`). (standalone 단독 실행 시에만 iframe 로컬 기본값 사용.)

## Content Guidelines

도전 유형 수치 변경은 aa_attempt_config.csv에서만 한다. Bullseye 확률·봇 간격 변경은 aa_event_config.csv에서만 한다. WebGL 연출 수치 변경은 aa_visual_config.csv에서만 한다. 어떤 수치도 코드에 하드코딩하지 않는다.

봇 초기 점수 스키마(v2-gold-balance-v5)는 1등 봇이 SET5 3~4회 완벽 적중 수준, 꼴찌 봇이 0~소액이 되도록 분포를 설계한다. 이 분포가 경쟁감의 핵심이다.

## Anti-Patterns

**봇에 setInterval 사용** — 규칙적인 간격으로 봇임이 드러난다. 재귀 setTimeout만 허용.

**봇 전부 0점 초기화** — 초반 경쟁심이 없다. v2-gold-balance-v5 스키마로 초기 점수 설정 필수.

**일반 적중 후 확인 전 dispose** — 과녁이 사라진다. 확인 버튼 클릭 후 dispose.

**도전 카드 진입 시 clearAttemptSelection 누락** — 이전 선택이 잔존한다. 항상 초기화.

**N발 도전 시 화살 1회만 연출** — 선택 발수(N)만큼 순차 실행 필수.

**localStorage 버전 체크 누락 / 호스트 SSoT 무시** — 구버전 메타 잔존 시 오작동. PRISM 모드는 발 잔액을 `getHostBowStands()`(호스트 `host:walletSync.balance`)에서 받아야 한다. iframe 로컬 `dice_count`를 SSoT로 쓰면 호스트와 어긋난다. 부트 시 `event_meta_version` 체크 + `aa:ready`→`host:walletSync` 동기화 필수.

**flashRing에서 mesh.scale 변경** — 과녁 크기가 변동된다. 색 lerp만 허용.

**renderer.setSize(w, h, true) 사용** — DPR 2배 시 canvas CSS 억제 안 되어 과녁 우하단 쏠림.

---

## PRISM SQUAD 호스트 연동 (2026-06-04)

> 상세 인수인계: **`HANDOFF_archery_arena_v4.md`**

### 재화·진행 (기획 확정)

| 항목 | 규칙 |
|------|------|
| 재화명 | **발**(arrow). **1 재화 = 1발** (주사위·스퀘어 주사위 보드 **미연동**) |
| 획득 | 스퀘어 적 처치 — `MinigameCurrencyService` 누적식, `event_minigame_acquire_config.csv`(일반 **200킬→발+1**, 보스 **2킬→+1**) |
| 기본 지급 | **발 5개** (`combat_tuning.csv archery_starter_bows=5`, `ensureStarterCurrency`) |
| 소비 | 로비 **1~5발 선택** → 선택 수만큼 발 소비 (`requestConsumeBow(n)`) |
| 연출 | 선택 N발 → **N발** WebGL (`runRound(n)`, `SET5` 점수표) |
| 토너먼트 | **30분** 라운드 (`tournament_round_min`) |
| 봇 | **60초**마다 점수 갱신 (`bot_tick_ms`) |
| 보상 | 라운드 종료 → **수령 필수** → `event:grant` → 수령 전 **재도전 불가** |
| 레드닷 | 수령 가능 시 🏹 탭 + 호스트 `/event/redDot/archery` |

### mechanics 추가 (PRISM 플로우)

```yaml
  prism_bow_grant:
    actor: host
    trigger: "GameCore → MinigameCurrencyService.onEnemyKilled('archery'…)"
    effects:
      - "누적 += 1 (event_minigame_acquire_config.csv kills_required)"
      - "일반 200킬 / 보스 2킬 도달 → bowStands += 1, 누적 0 리셋"

  prism_select_shot_attempt:
    actor: player
    preconditions:
      - "balance(발) >= 선택 발수 N (1~5)"
      - "not claimPending"
      - "not eventEnded (또는 결과 화면)"
    effects:
      - "requestConsumeBow(N): balance -= N (iframe 자체 판정)"
      - "postMessage aa:walletChanged{balance} → host setArcheryBowStands 저장"
      - "runRound(N): runShootingScene × N (autoAdvance)"
      - "target_score 합산 → ranking 갱신"

  prism_round_end:
    actor: system
    effects:
      - "eventEnded → claimPending true → aa:claimPending"
      - "Result 화면 → Reward → event:grant(bundleId) + aa:claimed"
      - "startNewTournamentPeriod (새 30분)"
```

### Anti-Patterns (PRISM)

- **발 0일 때 btn-attempt disabled** — 클릭·토스트 불가. 발 없어도 버튼 활성 + 안내 문구.
- **선택 발수 > 보유 발인데 소비 허용** — `requestConsumeBow(n)`은 `balance < n`이면 거부(deny). 선택기는 보유 초과 옵션 비활성.
- **gameEntry에서 game.js 정적 import** — `Cannot access before initialization` TDZ. **dynamic import 필수**.
- **refreshRank()를 let shootingBusy 선언 전 호출** — 동일 TDZ. `shootingBusy`를 `startGame` 최상단에 선언.
- **runRound(n)에서 점수만 합산** — 연출 생략 금지. `runShootingScene` N회 필수.

---

## 코어 연동 (PRISM SQUAD Host) — 재화/아이템

> 코드 검증 기준 (2026-06-04). SSoT = `aa_integration_config.csv` + `event_minigame_host_config.csv`.
> iframe 측 상세: `HANDOFF_archery_arena_v4.md`.

### 계층

PRISM 코어(탕탕 서바이버) **로비 안의 iframe 이벤트 미니게임**. 코어 ↔ iframe은 **`postMessage`** 만으로 통신 (DOM·전역 공유 없음). 코어 측 진입·재화·보상 로직은 `src/game/archeryMeta.ts` + `src/App.tsx` message 핸들러에 집중.

### 진입

| 단계 | 동작 |
|------|------|
| 1. 탭 | 로비 **우측 세로 사이드탭(🏹 양궁)** — `registry.tsx` `EventMiniCards`, `/lobby/showArcheryArena=true`일 때만 노출 |
| 2. 클릭 | `openEventMinigame('archery')` (`eventMinigameHost.ts`) — `ticketCost=0`이라 **입장 차감 없음** → 이전 세션 dispose → `mountKey++` → iframe remount |
| 3. ready | iframe 부팅 완료 → `aa:ready` postMessage |
| 4. init | 코어가 `host:walletSync` 회신 — **balance(보유 발) · missionLines(획득안내) · claimPending** 전달 (`archeryWalletSyncMsg()`) |

### 재화 — 발(Arrow), 이식 지갑 계약

| 항목 | 값/경로 |
|------|---------|
| 입장 비용 | **무료** — host config `ticket_cost=0` (`event_minigame_host_config.csv`, archery 행) |
| 진행 소모 | **1~5발 선택 → N발 소비** (`requestConsumeBow(N)` → `aa:walletChanged{balance}`). 1 재화 = 1발 |
| 발 잔액 | `/lobby/archeryBowStands` (호스트 SSoT `MinigameCurrencyService.bowStands`, 저장 `prism_squad_save_v1.minigameCurrency`) |
| 발 수급 | 코어 전투 적 처치 — `MinigameCurrencyService.onEnemyKilled`, `event_minigame_acquire_config.csv`(일반 **200킬→발+1**, 보스 **2킬→+1**) × `ticketMultiplier` |
| 누적 진척 | `/archery/killsTowardBow`·`/archery/killsPerBow`(=200) |
| 수령 대기 | `/archery/claimPending` (토너먼트 종료·미수령 시 재도전 차단, `host:walletSync.claimPending`) |
| 기본 지급 | 신규/마이그레이션 시 **발 5개** (`combat_tuning.csv archery_starter_bows=5`, `ensureStarterCurrency`) |

> ⚠️ 구버전 **"활대 1개 = 5발"**(`aa_integration_config.csv` `shots_per_bow=5`, `kills_per_bow_host=100`, `starter_bow_stands`)은 **폐기**. 이제 **1발 = 1재화**이고 라운드당 1~5발을 선택해 그만큼 소비한다. (해당 CSV 필드는 미사용 레거시.)

### 이벤트 → 코어 보상

| 단계 | 동작 |
|------|------|
| 트리거 | 토너먼트 라운드 종료 → 결과/보상 화면에서 수령 |
| 메시지 | iframe → `event:grant` (`{ rewards: [], bundleId }`) |
| 변환 | `rewards`가 비면 **`archeryBundleToGrant(bundleId)`** 로 CSV 매핑 (`aa_bundle_reward_config.csv`, 폴백 하드코드 내장) |
| 지급 | `coreRef.current.grantReward(resolved)` — **gem / gold**(필요 시 slot_id) |
| 후처리 | `aa:claimed` → 코어 `claimPending=false` → 레드닷(`/event/redDot/archery`) 해제 |

번들 예시(CSV): `2001=gem 120`(1위) / `2002=gem 80` / `2003=gem 50` / `2004=gold 5000` / `2005=gold 2000`.

### 등록

`public/event_minigame_host_config.csv` 의 `id=archery` 행:

```
archery,양궁,🏹,#7EC8A8,/event/archeryArena/index.html,/lobby/archeryBowStands,0,대,/lobby/showArcheryArena,"aa_player_state|aa_event_meta|aa_ranking_bots|aa_ranking_dummy_schema",1
```

(`ticket_cost=0`, `ticket_unit=대`, `show_flag_key=/lobby/showArcheryArena`, `enabled=1`.) 코드 폴백은 `eventMinigameRegistry.ts` `FALLBACK.archery`.

### 빌드 스코프 (런타임 ON/OFF)

| 방법 | 동작 |
|------|------|
| 런타임 토글 | `/lobby/showArcheryArena` (`hudExternalStore` 기본 `true`) — 햄버거 메뉴(`LobbyMenuDropdown.tsx`) 또는 store 직접. false면 사이드탭 숨김 |
| CSV OFF | `event_minigame_host_config.csv` archery 행 `enabled=0`/삭제 |
| 완전 제외 | 위 + `eventMinigameRegistry.ts` `FALLBACK`·union 타입에서 archery 제거 (FALLBACK 하드코드가 살아있으면 CSV만으론 미제거) |

---

## 재화 = "발" + 호스트 지갑 계약 (이식 가능)

양궁 재화는 **"발"(arrow)** 이며 **1 재화 = 1발**. 스퀘어 전투에서 적을 잡아 벌고(호스트 `MinigameCurrencyService`), 양궁은 그 잔액을 받아 자체 소비한다. 호스트는 잔액(숫자)만 주고받으며 양궁 규칙을 모른다 → 이식 가능. (공통 스펙: 코어 DEV "11. 이식 가능 지갑 계약".)

> ⚠️ **구버전 정정:** 과거 "활대 1개 = 5발"(`shots_per_bow=5`, 1회 입장에 1활대 차감) 모델은 폐기. 이제 **1발 = 1재화**, 한 라운드에 **1~5발을 선택**해 그만큼 소비한다.

**메시지 3종 (`aa` 네임스페이스):**
```
양궁 → 호스트 :  aa:ready
호스트 → 양궁 :  host:walletSync { balance, missionLines, claimPending }   (보유 발 + 획득안내)
양궁 → 호스트 :  aa:walletChanged { balance }                              (소비 후 남은 발 저장)
```
(토너먼트 보상 수령은 별도: `aa:claimPending` / `aa:claimed`.)

**1~5발 선택 + 소비:**
- lobby 하단 **1~5 선택 버튼**(`#shot-selector`). 보유량 초과 옵션은 비활성. 버튼 라벨 `🏹 N발 도전`.
- 도전 → `requestConsumeBow(N)` → 보유 발에서 N 차감 + `aa:walletChanged` 통지 → `runRound(N)`(N발 발사).

**lobby 상단 미션 배너:** `#lobby-mission` 에 "발 모으는 법"(missionLines: 일반 N마리→1발, 보스 M마리→1발) + 보유 발 표시. 호스트가 missionLines를 데이터로 제공, 양궁이 렌더.

**단위 표기:** 사이드탭·lobby 모두 "발"(기존 "활대/대" 폐기). 사이드탭은 갯수가 아니라 **남은시간**(`duration_hours=48`) 카운트다운(코어 DEV §12·§13).

**standalone:** 호스트 없으면 내부 기본값으로 동작.
