---
identity:
  name: "Lava Quest"
  genre: [survival, ranking, event-minigame]
  platform: [web, mobile-web]
  players: 1
  pitch: "100명이 동시 시작해 7레벨을 1분씩 생존하며 연속 클리어하는 생존 경쟁 이벤트 미니게임. 호스트 게임(PRISM SQUAD 스퀘어)과 postMessage로 연동."
  host_game: "PRISM SQUAD (스퀘어) — 각 스테이지의 실제 게임은 스퀘어 1분 서바이버"
  event_duration: "30분 (lq_event_config.csv duration_hours: 0.5)"

components:
  phase:
    type: enum
    values: [MATCHING, LOBBY, ATTEMPT, CLEAR, FAIL, FULL_CLEAR, RANKING, REWARD]
    default: MATCHING

  clears_completed:
    type: int
    range: [0, 7]
    default: 0

  players_alive:
    type: int
    range: [0, 100]
    default: 100

  timer_remain_ms:
    type: int
    note: "duration_hours × 3600 × 1000. 1초마다 감소."

  busy:
    type: bool
    default: false
    note: "true이면 버튼 중복 탭 차단. 모든 async 핸들러 시작 시 if (busy) return."

  player_index:
    type: int
    default: 0
    note: "항상 0. 봇은 1~99."

  clears_for_rank:
    type: int
    range: [0, 7]
    default: 0

  eliminated:
    type: bool
    default: false

entities:
  players:
    components: [player_index, clears_for_rank, eliminated]
    count: 100
    note: "인덱스 0 = 플레이어(나). 1~99 = 봇. lq_bot_config.csv 기준 정렬."

  session:
    components: [phase, clears_completed, players_alive, timer_remain_ms, busy]
    count: 1

mechanics:
  turn_structure: realtime

  actions:
    continue_matching:
      actor: player
      preconditions:
        - "MATCHING 화면에서 100/100 연출 완료"
      effects:
        - "LOBBY 화면 전환"
        - "Three.js 씬 마운트 (#canvas-container)"
        - "타이머 시작"

    start_attempt:
      actor: player
      preconditions:
        - "phase == LOBBY"
        - "busy == false"
        - "alive에 플레이어(0) 포함"
      effects:
        - "busy = true"
        - "호스트(PRISM SQUAD)에 postMessage 발송 → 실제 게임은 호스트가 처리"
        - "window.parent가 없으면(standalone) 기존 ATTEMPT 화면 전환 (fallback)"
      note: >
        window.parent !== window 일 때 (iframe 환경) → postMessage 발송.
        발송 후 LQ 측은 대기. 결과는 'lq:result' 메시지로 수신.

    square_game_attempt:
      actor: host_game (PRISM SQUAD 스퀘어)
      trigger: "lq:start_attempt postMessage 수신"
      effects:
        - "LQ iframe 숨김 (display:none)"
        - "스퀘어 1분 서바이버 게임 시작"
        - "타이머 카운트다운 60초 (화면에 표시)"
        - "적 스폰·XP 빠른 진행 (1분 압축 밸런스)"
        - "마지막 스테이지(level == total_levels)이면 50초에 보스 등장"
        - "1분 생존 → lq:result(success:true) 전송 → LQ iframe 복원"
        - "사망 → lq:result(success:false) 전송 → LQ iframe 복원"

    resolve_success:
      actor: player
      preconditions:
        - "lq:result success:true 수신 OR standalone 성공 버튼 클릭"
      effects:
        - "clears_completed += 1"
        - "생존자 전원 clears_for_rank += 1"
        - "CLEAR 화면 전환"
        - "fleaIntro → 플레이어 마커 전진 + 카메라 2.0× 줌인"
        - "CSV delay_ms × PACE(0.52) 간격으로 봇 탈락 연출"
        - "alive에서 탈락 봇 제거"
        - "세션 저장"

    resolve_failure:
      actor: player
      preconditions:
        - "lq:result success:false 수신 OR standalone 실패 버튼 클릭"
      effects:
        - "body에 임시 div.lq-fx-mount 생성 → 플레이어 낙하 연출"
        - "alive에서 플레이어(0) 제거"
        - "FAIL 화면 전환"
        - "세션 저장"

    continue_after_clear:
      actor: player
      preconditions:
        - "phase == CLEAR"
        - "연출 완료 후 버튼 활성"
      effects:
        - "clears_completed == 7 → FULL_CLEAR 화면"
        - "clears_completed < 7 → LOBBY 복귀"

    confirm_reward:
      actor: player
      effects:
        - "세션·메모리 전체 초기화"
        - "MATCHING 화면으로 리셋"

  elimination_rule:
    note: >
      탈락 스케줄은 lq_elimination_schedule.csv의 delay_ms 차이 × PACE(0.52) 간격으로 실행.
      절대 지연(delay_ms 그대로) 금지. 동일 봇은 가장 이른 delay_ms만 사용.
      플레이어(idx=0)는 탈락 연출에서 항상 제외.

  pace_constant:
    value: 0.52
    note: "PACE = 0.52. 고정. 임의 변경 금지. 모든 연출 타이밍에 적용."

  loops:
    - name: lobby_attempt_loop
      description: "LOBBY ↔ ATTEMPT ↔ CLEAR ↔ LOBBY. 7클리어 달성 시 FULL_CLEAR."
    - name: elimination_loop
      description: "resolve_success 후 CSV delay_ms 차이 × PACE 간격으로 봇 탈락 연출."
    - name: timer_loop
      description: "setInterval 1초. lobbyEnter 시 시작. 화면 3곳(lobby/attempt/clear) 동기화."

goals:
  win:
    - condition: "clears_completed == 7 → FULL_CLEAR 분기."
    - reward: >
        스테이지 보상은 매 레벨(1~7) 클리어마다 lq_stage_reward.csv 기준으로 event:grant 지급.
        L7 = 보석 200 + 황금 왕관(equip prize_crown). (코드 검증: grantForLevel → postGrantToHost)
  loss:
    - condition: "resolve_failure → 플레이어 탈락 → FAIL 분기."
  score:
    - metric: clears_completed
      formula: "0~7 연속 클리어 수."
    - metric: rank
      formula: "sortRanking() 기준 순위 (클리어 수 → 탈락 레벨 → 인덱스 역순)."

stage_game_rules:
  mode: "1분 서바이버 (PRISM SQUAD 스퀘어)"
  duration_sec: 60
  success_condition: "1분 생존 OR 보스 처치"
  failure_condition: "1분 내 사망"
  last_stage_boss:
    spawn_sec: 50
    spawn_note: "lava_quest_host_config.csv boss_spawn_sec_override(기본 50). 보스: L1~2 crusher / L3~4 nexus / L5~7 titan."
    reward_on_kill: "보스 처치 = 즉시 성공 처리. 보상은 해당 레벨 lq_stage_reward.csv 행으로 event:grant."
  balance_note: "1분 내 레벨 5~6 도달할 수 있는 압축 밸런스. 적 스폰·XP 빠름."
---

## 🎯 레퍼런스 (제작 기준 게임)

> **라바 = Monopoly GO 스타일 스테이지 돌파/건너기 챌린지.**
> ※모노폴리GO에 공식 'Lava' 이벤트는 **없음** — 장르·톤 참고용.
>
> ⚠️ 레퍼런스는 톤·조작감·연출 **참고용**. 모든 수치·구조·UI·플로우의 단일 진실(SSoT)은 이 문서 세트(GAME·DESIGN·DEV·CSV)다. **충돌 시 문서 우선**, 임의 추가·생략 금지.

## Design Pillars

**호스트 게임이 실제 게임** — 라바 퀘스트 자체는 이벤트 프레임워크다. 실제 게임플레이는 PRISM SQUAD 스퀘어(1분 서바이버). LQ는 매칭·스테이지·보상·순위를 담당하고, 스퀘어는 전투를 담당한다.

**1분 생존 = 클리어** — 각 스테이지는 60초다. 살아남으면 성공, 죽으면 탈락. 단순하고 긴장감 있다.

**생존 연출이 핵심** — 탈락 봇이 CSV 스케줄대로 X축으로 튕겨 나가는 것이 게임의 핵심 연출이다. Y축 포물선 낙하는 탑뷰에서 보이지 않는다. X축 넓게(-12~+12) 튕겨나는 방식만 허용한다.

**PACE 상수 고정** — PACE = 0.52. 모든 연출 타이밍에 적용. 임의 변경 금지. 절대 지연이 아닌 delay_ms 차이 × PACE로 계산한다.

**어두운 씬 + 밝은 HUD** — Three.js 씬은 어둡고 극적이며, HTML 셸은 밝고 스케치풍이다. 두 레이어가 시각적으로 분리된다.

## Mechanics in Depth

탈락 스케줄 타이밍은 절대 지연이 아닌 차이값 기반이다. 각 step의 delay_ms에서 이전 step의 delay_ms를 빼고 PACE를 곱한다. 이 방식을 쓰지 않으면 연출이 3배 이상 느려진다.

busy 가드는 모든 async 핸들러에 필수다. 버튼을 빠르게 연속 탭하면 같은 핸들러가 중복 실행되어 세션이 꼬인다. 핸들러 시작 시 busy 체크, 종료 시 finally에서 해제.

실패 연출의 임시 씬은 반드시 JS로 body에 임시 생성하고 연출 후 제거한다. index.html에 고정 배치하면 WebGL이 항상 화면을 덮어 마커 연출이 보이지 않는다.

localStorage 복구 후에도 항상 startMatchingAnimated()부터 시작한다. 로비를 자동 스킵하면 매칭 연출이 생략되어 100명 등장 연출이 사라진다.

## Content Guidelines

레벨 수치 변경은 lq_level_config.csv에서만. 봇 정보 변경은 lq_bot_config.csv에서만. 탈락 타이밍 변경은 lq_elimination_schedule.csv에서만. 이벤트 기본 설정은 lq_event_config.csv에서만. PACE 상수(0.52)와 좌표 상수(PLAYER_START_Z, STEP_Z_DELTA 등)는 코드에 고정.

순위 산정은 3단계 기준: 생존자 → 일부 클리어 탈락 → 0클리어 탈락. 동점 시 인덱스 역순.

## Anti-Patterns

**camera.up을 (0,0,-1)로 설정** — LookAt Singularity → 화면 백화·NaN 크래시. 반드시 (0,1,0).

**STEP_Z_DELTA를 양수로 설정** — 이동 방향이 화면 위→아래로 반전된다. -6.5 고정.

**마커에 SphereGeometry 사용** — 탑뷰에서 깊이가 없어 보이지 않는다. CircleGeometry(2D) 필수.

**탈락 연출에 Y축 포물선 낙하 구현** — 탑뷰에서 전혀 보이지 않는다. X축 튕겨남만 허용.

**탈락 연출에 절대 지연 사용** — 연출이 3배 이상 느려진다. delay_ms 차이 × PACE 사용.

**고정 #lq-fx-mount를 index.html에 추가** — WebGL이 항상 화면을 덮어 마커 연출이 차단된다.

**localStorage 복구 후 로비 자동 스킵** — 매칭 연출이 생략된다. 항상 startMatchingAnimated()부터.

**MARKER_Z_BIAS 누락** — 마커가 카메라 시야 밖으로 벗어난다.

---

## 유저 플로우 (전체 화면 흐름)

iframe 내부 화면(phase) 전환과 코어 전투로의 핸드오프를 포함한 전체 흐름이다. 화면은 모두 `.screen` + `.hidden` 토글로 전환된다.

```
[로비] 우측 🌋 사이드탭 클릭 → 라바 티켓 1장 차감 → iframe 오버레이 오픈
   │
   ▼
① MATCHING   100명 매칭 연출(100/100) → 자동 진행
   ▼
② LOBBY      Three.js 용암 씬 + 돌다리 마커, 30분 타이머 시작
             "도전 시작" 버튼
   │  (lq:start_attempt → 코어 전투, iframe 숨김)
   ▼
   ┌─ 코어(스퀘어 1분 서바이버, 라바 호스트 모드) ─┐
   │  60초 생존 / 보스 처치 = 성공, 사망 = 실패     │
   └─ lq:result {success} → iframe 복원 ───────────┘
   │
   ├─ success ─▶ ③ CLEAR   클리어 연출(플레이어 전진·줌인·봇 탈락) + 스테이지 보상(event:grant)
   │              │  7클리어 미만 → ② LOBBY 복귀 (다음 레벨)
   │              │  7클리어 달성 → ④ FULL_CLEAR (골드 오버레이)
   │              ▼
   └─ fail ────▶ ⑤ FAIL    플레이어 낙하 연출 → 탈락
                   ▼
                 ⑥ RANKING  생존자→일부클리어→0클리어, 동점 시 인덱스 역순
                   ▼
                 ⑦ REWARD   최종 보상 확인 → "확인" → 세션 리셋 → ① MATCHING
```

- **티켓 차감 시점**: iframe을 열 때(`openEventMinigame`) 1장. "도전 시작"이나 재도전 시 추가 차감 없음(1회 입장 = 1티켓으로 7스테이지 진행).
- **코어 핸드오프**: ②에서 "도전 시작" → 코어 전투 진입이 유일한 외부 전환점. 나머지 화면 전환은 모두 iframe 내부.
- **세션 복구**: localStorage(`lq_session_v1`) 복구 후에도 항상 ① MATCHING 연출부터 시작한다.

---

## 코어 연동 (PRISM SQUAD Host) — 재화/아이템

> 본 섹션은 실제 소스(`src/game/GameCore.ts`, `src/App.tsx`, `src/game/eventMinigameHost.ts`, `public/event_minigame_host_config.csv`, `public/lava_quest_host_config.csv`, `public/event/lavaQuest/*.csv`, 이벤트 `src/game.js`·`src/stageRewards.js`) 검증 기준으로 작성. 사실이 코드와 다르면 코드를 우선한다.

### 1. 계층 구조

라바 퀘스트는 **iframe 미니게임 + postMessage** 방식이다. 이벤트 미니게임 3종(lava / prize / archery) 중 **코어 전투(스퀘어 1분 서바이버)에 직접 진입하는 유일한 iframe 이벤트**다. prize·archery는 iframe 내부에서 자기 완결되지만, lava는 "도전 시작" 시 호스트(PRISM SQUAD 코어)의 전투 모드를 호출하고 그 결과를 다시 받아온다.

| 계층 | 담당 | 위치 |
|---|---|---|
| iframe 셸(LQ) | 매칭·로비·스테이지·순위·보상 UI, 봇 탈락 연출 | `public/event/lavaQuest/` (이벤트 `src/`) |
| 코어 전투(스퀘어) | 실제 1분 서바이버 전투 (라바 호스트 모드) | `src/game/GameCore.ts` |
| 브리지 | postMessage 라우팅 | `src/App.tsx` |

### 2. 진입 플로우 (로비 → 코어 전투 → iframe 복귀)

```
로비 우측 이벤트 사이드탭(🌋 라바)            ← /lobby/showLavaQuest=true 일 때만 노출
  → openEventMinigame('lava')                  (src/game/eventMinigameHost.ts)
     → /lobby/lavaTickets 1장 차감(ticket_cost=1)
     → iframe 오버레이 마운트 (/event/lavaQuest/index.html)
  → iframe 내부 "도전 시작" 버튼 (#btn-start-attempt)
     → postMessage { type:'lq:start_attempt', level, totalLevels, isLastLevel, aliveCount }
  → App.tsx 수신 → suspendEventMinigame() (iframe 숨김·세션 유지)
     → GameCore.startLavaQuestMode(level, isLastLevel)
        → /game/lavaQuestActive = true
        → lava_quest_host_config.csv 규칙으로 보스 선택(crusher/nexus/titan)·등장초 적용
        → 스퀘어 1분 서바이버 전투 (라바 호스트 모드)
  → 전투 종료:
        - 1분 생존 / 보스 처치 → _stageClear() → _onLavaQuestEnd(true)
        - 사망               → _gameOver()   → _onLavaQuestEnd(false)
     → /game/lavaQuestActive = false → resumeEventMinigame() (iframe 복원)
     → postMessage { type:'lq:result', success } → iframe 가 btn-success / btn-fail 자동 클릭
  → iframe 가 CLEAR / FAIL 연출 + 보상 처리 재개
```

`level`은 iframe 측 `Math.min(7, clearsCompleted + 1)`, `isLastLevel = currentLevel >= total_levels(7)`로 계산해 전송한다. standalone(부모 창 없음)에서는 postMessage 대신 iframe 자체 ATTEMPT 화면으로 폴백한다.

### 3. 입장 재화 — 라바 티켓 (`/lobby/lavaTickets`)

| 항목 | 값 | 출처 |
|---|---|---|
| 입장 차감 | 1장 / 1회 진입 | `event_minigame_host_config.csv` `ticket_cost=1`, `ticket_path=/lobby/lavaTickets` |
| 부족 시 | 진입 차단(토스트) | `openEventMinigame`에서 `tickets < ticket_cost` 검사 |

**티켓 수급은 코어 전투 중에 일어난다** (`GameCore._addEventCurrency(1, 1)`):

- 적 **30킬(`kill_per_event_ticket`, 기본 30)** 마다 라바 티켓 +1
- **보스 처치 보너스** +1 (`_onBossDeath`)
- **게임 클리어 보너스** +1 (`_gameOver` 일반 모드 경로)

주의: 라바 퀘스트 모드(`lavaQuestMode=true`)에서는 `_gameOver`가 LQ 실패 분기로 빠져 클리어 보너스 경로를 타지 않는다. 30킬·보스 처치 보너스는 모드와 무관하게 적립된다.

### 4. 이벤트 → 코어 보상 (`event:grant`)

스테이지 성공 시 iframe이 `lq_stage_reward.csv`의 해당 레벨 행을 `event:grant`로 호스트에 보낸다. 호스트는 `GameCore.grantReward(rewards[])`로 메타 재화·장비에 실지급한다.

| iframe `reward_type` | postMessage `kind` | 코어 적용 대상 |
|---|---|---|
| `gold` | `gold` | `metaGold += amount` |
| `gem` | `gem` | `metaGems += amount` |
| `lightning` | `lightning` | `metaEnergy += amount` |
| `equip` | `equip` (`slotId`=reward_param) | `equipLevels[slotId]` (0→1, 그 외 +1, `max_level` 상한) |

**보상은 레벨 7만이 아니라 1~7 각 스테이지 클리어마다 지급된다** (`grantForLevel(clearsCompleted)` → `postGrantToHost`). `lq_stage_reward.csv` 기준: L1 골드500 · L2 번개5 · L3 보석10 · L4 골드1.5K · L5 용암검(equip lava_blade) · L6 보석30 · L7 보석200 + 황금왕관(equip prize_crown).

### 5. 등록 (SSoT)

| 파일 | 역할 |
|---|---|
| `public/event_minigame_host_config.csv` | `id=lava, src=/event/lavaQuest/index.html, ticket_path=/lobby/lavaTickets, ticket_cost=1, show_flag_key=/lobby/showLavaQuest, persist_keys=lq_session_v1` |
| `src/game/eventMinigameRegistry.ts` | `EventMinigameId` union + 폴백 |
| `public/lava_quest_host_config.csv` | 레벨 구간별 보스(crusher/nexus/titan)·`boss_spawn_sec_override`(50) — 코어 라바 호스트 전투 분기 |
| `public/event/lavaQuest/lq_stage_reward.csv` | `event:grant` 레벨별 보상 SSoT |

### 6. 빌드 스코프 / 런타임 토글

- **코어 단독 빌드**(이벤트 CSV·산출물 부재): 사이드탭 미표시 + 진입 불가. 라바 퀘스트 자산이 함께 빌드되어야 동작한다.
- **런타임 OFF**: 로비 햄버거 메뉴 `/lobby/showLavaQuest` 토글로 사이드탭 노출을 끈다(`LobbyMenuDropdown.tsx`). OFF여도 기존 보유 티켓·세션은 유지된다.

### postMessage 계약 요약

| 방향 | 메시지 | 의미 |
|---|---|---|
| iframe → host | `lq:start_attempt` `{ level, totalLevels, isLastLevel, aliveCount }` | 코어 전투 시작 요청 |
| host → iframe | `lq:result` `{ success }` | 전투 결과 (iframe이 success/fail 버튼 자동 클릭) |
| iframe → host | `event:grant` `{ rewards:[{kind,amount,slotId}] }` | 스테이지 보상 실지급 |
| iframe → host | `event:showRewardDetail` `{ kind, slotId, label, icon, amount }` | 보상 상세 팝업 |
