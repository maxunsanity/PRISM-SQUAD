---
doc_generation: mdv4
condense_policy: forbidden
note: "v4는 mdv3와 별도 폴더. v5 diff용 — 절대 요약·삭제 금지."
ui_pixel_precision: "DESIGN·외부 팀. DEV는 json-render 슬롯·$state·DOM 순서·CSV SSoT만."
---

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

**SET3/SET5 도전 시 화살 1회만 연출** — 세트 횟수만큼 순차 실행 필수.

**localStorage 버전 체크 누락 / 호스트 SSoT 무시** — 구버전 메타 잔존 시 오작동. PRISM 모드는 활대 수를 `getHostBowStands()`(호스트)에서 받아야 한다. iframe 로컬 `dice_count`를 SSoT로 쓰면 호스트와 어긋난다. 부트 시 `event_meta_version` 체크 + `aa:ready`→`host:archeryInit` 동기화 필수.

**flashRing에서 mesh.scale 변경** — 과녁 크기가 변동된다. 색 lerp만 허용.

**renderer.setSize(w, h, true) 사용** — DPR 2배 시 canvas CSS 억제 안 되어 과녁 우하단 쏠림.

---

## PRISM SQUAD 호스트 연동 (2026-06-04)

> 상세 인수인계: **`HANDOFF_archery_arena_v4.md`**

### 재화·진행 (기획 확정)

| 항목 | 규칙 |
|------|------|
| 재화명 | **활대** (주사위·스퀘어 주사위 보드 **미연동**) |
| 획득 | 스퀘어 **적 100처치당 활대 +1** (호스트 `archeryOnEnemyKill`) |
| 기본 지급 | **활대 5개** (`aa_integration_config.starter_bow_stands`) |
| 소비 | 로비 **「활대 5발 도전」** 1회당 활대 **1개** |
| 연출 | 활대 1개 → **5발** WebGL (`SET5` 점수표, `shots_per_bow`) |
| 토너먼트 | **30분** 라운드 (`tournament_round_min`) |
| 봇 | **60초**마다 점수 갱신 (`bot_tick_ms`) |
| 보상 | 라운드 종료 → **수령 필수** → `event:grant` → 수령 전 **재도전 불가** |
| 레드닷 | 수령 가능 시 🏹 탭 + 호스트 `/event/redDot/archery` |

### mechanics 추가 (PRISM 플로우)

```yaml
  prism_bow_grant:
    actor: host
    trigger: "GameCore._onEnemyDeath"
    effects:
      - "killsTowardBow += 1"
      - "killsTowardBow >= 100 → bowStands += 1, killsTowardBow = 0"

  prism_five_shot_attempt:
    actor: player
    preconditions:
      - "bowStands >= 1 (host)"
      - "not claimPending"
      - "not eventEnded (또는 결과 화면)"
    effects:
      - "postMessage aa:consumeBow"
      - "host archeryConsumeBow → host:bowConsumed"
      - "runFiveBowRound: runShootingScene × shots_per_bow (autoAdvance)"
      - "target_score 합산 → ranking 갱신"

  prism_round_end:
    actor: system
    effects:
      - "eventEnded → claimPending true → aa:claimPending"
      - "Result 화면 → Reward → event:grant(bundleId) + aa:claimed"
      - "startNewTournamentPeriod (새 30분)"
```

### Anti-Patterns (PRISM)

- **활대 0일 때 btn-attempt disabled** — 클릭·토스트 불가. 활대 없어도 버튼 활성 + 안내 문구.
- **gameEntry에서 game.js 정적 import** — `Cannot access before initialization` TDZ. **dynamic import 필수**.
- **refreshRank()를 let shootingBusy 선언 전 호출** — 동일 TDZ. `shootingBusy`를 `startGame` 최상단에 선언.
- **runFiveBowRound에서 점수만 합산** — 연출 생략 금지. `runShootingScene` 5회 필수.

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
| 4. init | 코어가 `host:archeryInit` 회신 — **활대 수(`bowStands`) · `killsTowardBow` · `killsPerBow` · `claimPending` · `roundBlocked`** 전달 (`archeryInitPayload()`) |

### 입장 재화 — 활대(Bow Stand)

| 항목 | 값/경로 |
|------|---------|
| 입장 비용 | **무료** — host config `ticket_cost=0` (`event_minigame_host_config.csv`, archery 행) |
| 진행 소모 | **활대 1개 / 「활대 5발 도전」 1회** (`archeryConsumeBow` ← `aa:consumeBow`) |
| 활대 상태 | `/lobby/archeryBowStands` (호스트 SSoT `prism_archery_host_v1`) |
| 활대 수급 | 코어 전투 **적 처치 N마리당 활대 +1** — `archeryMeta.KILLS_PER_BOW` (CSV `kills_per_bow_host=100`), 훅 `archeryOnEnemyKill()` ← `GameCore._onEnemyDeath` |
| 누적 진척 | `/archery/killsTowardBow` (0~99, 100 도달 시 활대+1·0 리셋) |
| 수령 대기 | `/archery/claimPending` (토너먼트 종료·미수령 시 재도전 차단) |
| 기본 지급 | 신규/마이그레이션 시 **활대 5개** (CSV `starter_bow_stands=5`, `ensureArcheryStarterBows`) |

> **활대 1개 = 5발**: `aa_integration_config.csv` `shots_per_bow=5` — 도전 1회당 `runShootingScene` 5연발(SET5 점수표). `KILLS_PER_BOW`(=100, 활대 획득 단위)와 `shots_per_bow`(=5, 발사 횟수)는 별개 상수다.

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
