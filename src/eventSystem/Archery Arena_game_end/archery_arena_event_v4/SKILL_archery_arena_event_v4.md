---
name: archery-arena-v4
description: Archery Arena(양궁 토너먼트) 이벤트 미니게임을 MD v4 + CSV만으로 재현할 때의 진입점 — 읽기 순서, 7항목, 비주얼(iframe 자체 style.css), 에셋 교체, PRISM 코어 연동(iframe+postMessage·활대 재화·100킬 수급·5발 연출), v4 규칙·고유 Anti-Patterns·빌드·체크리스트.
doc_generation: mdv4
condense_policy: forbidden
---

# SKILL — Archery Arena (양궁 토너먼트) 이벤트 v4 진입점

> **사용법:** "이 폴더(`src/eventSystem/Archery Arena_game_end/archery_arena_event_v4/`)의 `SKILL_archery_arena_event_v4.md` 읽고 양궁 미니게임 만들어/붙여" → 이 문서 1개에서 시작해 아래 읽기 순서대로 이어진다.
> **함축 금지:** 이 v4 문서들은 기획서 원본이자 재현 계약이다. 요약·삭제·임의 수치 변경 금지 (함축은 v5에서 diff용으로만).
> **코어와 별도:** 이 미니게임은 PRISM SQUAD 코어(스퀘어 본편)의 **iframe 이벤트 모듈**이다. 코어 진입점은 `src/prism_squad_v4/SKILL_prism_squad_v4.md`. 이 미니게임은 그 안에 약결합으로 붙는다.

---

## ★ 데이터 구동 필수 (최우선 규칙)
이 폴더의 **CSV(= DEV §14 CSV 전문, 또는 동봉 `aa_*.csv`)가 모든 수치·밸런스·구성의 단일 진실(SSoT)**다. 게임은 **반드시 이 CSV를 런타임에 fetch·파싱해 구동**하도록 만들 것 — **어떤 수치도 코드에 하드코딩 금지**. CSV에 없는 항목만 DEV 데이터 스키마로 생성하되, 생성 후에도 CSV로 빼서 구동(데이터구동화). 이게 "에셋·수치 교체로 다양한 버전 양산"의 전제다.

## 0. 이 게임은 무엇인가 (정체)

- **Archery Arena = 양궁 토너먼트 미니게임.** 50인 그룹(나 1 + 봇 49) 순위 경쟁. 토너먼트 라운드(**30분**, `tournament_round_min`) 동안 점수를 쌓아 순위를 다투고, 라운드 종료 시 순위 보상을 받는다.
- **활대(Bow Stand) 1개 = 한 라운드 단위 도전 = 5발**(`shots_per_bow=5`). 「활대 5발 도전」 1회를 누르면 활대 1개를 소비하고 **과녁에 화살 5발**을 순차로 쏘는 WebGL 연출이 실행된다. 각 발의 명중 영역(OUTER/MIDDLE/CENTER/Bullseye)에 따라 점수가 산출되어 합산되고 순위에 반영된다.
- **연출이 전부.** 플레이어 행동은 재화(활대) 소비뿐. 점수는 CSV 확률표 기반 자동 산출 + WebGL 과녁 연출이 뒤따른다. Bullseye 확률은 콤보에 따라 증가(`base_prob + combo × increment`, 상한 `max_prob`).
- gameState 개념은 코어와 별도. 화면은 7종 DOM 전환(entry → lobby → attempt → shooting → bullseye → result → reward).

## 1. 읽기 순서 (필수 — 이 폴더 파일명, HANDOFF 포함)

1. **이 SKILL** (지금 문서)
2. `GAME_archery_arena_event_v4.md` — Design Pillars·Mechanics·Anti-Patterns + **PRISM SQUAD 호스트 연동**(활대·5발·30분·100킬·보상) + **코어 연동(재화/아이템) 계층·진입·등록·빌드 스코프**
3. `DESIGN_archery_arena_event_v4.md` — Blank Paper Sketch + Neubrutalism, 3색(paper `#faf8f5`/ink `#222`/gold `#f5c842`), §4 컴포넌트·§5 DOM 순서·§7 애니메이션·§9 토큰
4. `DEV_archery_arena_event_v4.md` — 스택(React+json-render+Three.js r172)·실파일 트리·DOM id·State Paths·Session Storage·Anti-Patterns·**§14 배포 CSV 전문**·에셋 교체 시스템
5. `RECIPE_archery_arena_event.md` → `RECIPE_CODE_archery_arena_event.md` — 검증된 패턴(R-01~R-14) + 추론 위험 구간 소스 발췌
6. `HANDOFF_archery_arena_event_v4.md` — **PRISM 로비에 다시 붙일 때의 단일 인수인계**: 슬롯·배포·재화 사이클·PRISM 파일 맵·hudStore 경로·postMessage 프로토콜·시퀀스·버그 재발 방지

## 2. 코딩 전 7항목 요약 (채우고 시작)

```
- 이 게임은 무엇인가: 양궁 토너먼트(50인 순위) 미니게임. 활대 1개=5발, 30분 라운드, 순위 보상.
- 핵심 기술 구조(스택·렌더러): Vite6 + React18 + @json-render/react 0.19 + Three.js r172(PerspectiveCamera FOV38). 실구현은 바닐라 game.js + DOM 7화면.
- 선언형(json-render) vs 명령형(Three.js) 경계: HUD·버튼=json-render($state /hud/*), 과녁·화살·파티클=Three.js 명령형(three/).
- 가장 주의할 Anti-Pattern 3개:
    ① 활대 단위 KILLS_PER_BOW=100 vs 발사 shots_per_bow=5 혼동 금지
    ② 호스트 SSoT getHostBowStands() 무시(iframe 로컬 dice_count를 활대 SSoT로 쓰기) 금지
    ③ 봇 setInterval / 봇 전부 0점 초기화 / 5발 중 연출 생략 금지
- RECIPE / RECIPE_CODE 있음 여부: 둘 다 있음 (R-01~R-14, PRISM 패턴 R-11~R-14 포함)
- public CSV 목록(파일명 나열): aa_attempt_config / aa_event_config / aa_visual_config / aa_rank_reward_config / aa_integration_config / aa_bundle_reward_config (6종)
- 이벤트 포함 여부 — 코어 빌드 스코프: 통합(코어+이 이벤트) / 코어단독(이 이벤트 제외) 중 사용자 확정. 상세 = GAME 「코어 연동 빌드 스코프」.
```

## 3. 비주얼 (iframe 자체 style.css — 코어 2레이어와 별개)

- 이 미니게임은 **iframe 안에서 자체 `style.css`(+ `style-ui.css`)** 로 그린다. 코어의 베이지 2D 스케치 시스템과는 **다른 별도 테마**다. 혼동 금지.
- 테마 = **Blank Paper Sketch + Neubrutalism.** 흰 종이 위 두꺼운 잉크 펜. 3색: paper `#faf8f5` / ink `#222222` / gold `#f5c842`. 외곽 `#ede8dc`, 헤더·카드 `#fffef9`.
- 질감: `border: 3px solid #222` + 하드 드롭 섀도 `3px 3px 0 #222`(blur 항상 0). 탭 시 `translate(2px,2px)` + 그림자 제거.
- **그라데이션·블러·인라인 style·이모지(코어 UI 규칙) 금지.** 모든 스타일은 `style-ui.css`에서만.
- 레이어 분리: HUD/버튼/순위표/카드/모달 = DOM+CSS. 과녁/화살/파티클 = Three.js WebGL(`#canvas-container`). Three.js 씬을 json-render Spec 안에 넣지 말 것.
- 상세: `DESIGN_archery_arena_event_v4.md` §2 팔레트·§4 컴포넌트·§5 DOM 순서·§7 애니메이션 8종(`AA-ANI-001`~`008`)·§9 토큰. `style.css`는 `@import './style-ui.css';`가 SSoT.

## 4. 에셋 교체 시스템 (DEV 「에셋 교체 시스템」)

- 그래픽 = **CSV가 SSoT.** `aa_visual_config.csv`에 과녁 스프라이트 URL **5종**:
  - `backdrop_sprite_url` (과녁 뒤 배경판)
  - `outer_sprite_url` (바깥 링)
  - `middle_sprite_url` (중간 링)
  - `center_sprite_url` (안쪽 링)
  - `bullseye_sprite_url` (정중앙)
- `sprite_url`이 비면 절차적 도형/색 링 폴백(기존 Material 링 렌더 유지 — 기본 연출 무손상). 이미지 교체만으로 리스킨.
- 루트 `public/assets/` (플레이스홀더 PNG 총 8개). 도전 카드도 `aa_attempt_config.csv` `sprite_url` 지원.
- 렌더 분기·재생성 코드는 `RECIPE_CODE_archery_arena_event.md` 해당 R-번호 참조(`src/three/target.js`).

## 5. 코어 연동 (PRISM SQUAD Host)

> SSoT = `aa_integration_config.csv` + 호스트 `event_minigame_host_config.csv`. 상세 = `GAME` 「코어 연동」·`HANDOFF` §2·§5.

### 계층 ① — iframe + postMessage
PRISM 코어(탕탕 서바이버) **로비 안의 iframe 이벤트 미니게임**. 코어 ↔ iframe은 **`postMessage`만**으로 통신(DOM·전역 공유 없음). 코어 측 로직은 `src/game/archeryMeta.ts` + `src/App.tsx` message 핸들러에 집중.

### 진입 (입장 무료)
| 단계 | 동작 |
|------|------|
| 1. 탭 | 로비 **우측 세로 사이드탭(🏹 양궁)** — `/lobby/showArcheryArena=true`일 때만 노출 (`registry.tsx` `EventMiniCards`) |
| 2. 클릭 | `openEventMinigame('archery')` — host config **`ticket_cost=0`이라 입장 차감 없음** → 이전 세션 dispose → iframe remount |
| 3. ready | iframe 부팅 완료 → `aa:ready` postMessage |
| 4. init | 코어 회신 `host:walletSync` — **balance(보유 발)·missionLines(획득안내)·claimPending** 전달 (`archeryWalletSyncMsg()`) |

### 재화 — 발(Arrow), 이식 지갑 계약 (1발=1재화)
- **입장 무료**(`ticket_cost=0`). 진행 소모 = **1~5발 선택 → 선택 수만큼 발 소비**(`requestConsumeBow(n)` → `aa:walletChanged{balance}`). 1 재화 = 1발.
- 발 잔액 SSoT = **호스트** `MinigameCurrencyService.bowStands` (`/lobby/archeryBowStands`, 저장 `prism_squad_save_v1.minigameCurrency`).
- **수급 = 코어 전투 적 처치** — `MinigameCurrencyService.onEnemyKilled`, `event_minigame_acquire_config.csv`(일반 **200킬→발+1**, 보스 **2킬→+1**) × `ticketMultiplier`. 누적 진척 `/archery/killsTowardBow`·`killsPerBow`(=200).
- 기본 지급 = **발 5개**(`combat_tuning.csv archery_starter_bows=5`, `ensureStarterCurrency`).
- lobby 상단 **미션 배너**(`#lobby-mission`)에 missionLines 렌더 + 보유 발. 사이드탭은 갯수가 아니라 **남은시간**(`duration_hours=48`) 카운트다운.
- ⚠️ 구버전 **"활대 1개=5발"**(`aa:consumeBow`/`host:archeryInit`, `shots_per_bow`/`kills_per_bow_host`) **폐기**. 지갑 계약 3종(`aa:ready`/`host:walletSync`/`aa:walletChanged`)으로 통일.

### 이벤트 → 코어 보상
- 토너먼트 라운드 종료 → 결과/보상 화면 수령 → iframe `event:grant`(`{ rewards: [], bundleId }`).
- `rewards`가 비면 **`archeryBundleToGrant(bundleId)`** 로 CSV(`aa_bundle_reward_config.csv`) 매핑 → `archeryBundleToGrant` 결과를 `grantReward`로 지급(**gem / gold**, 필요 시 slot_id).
- 후처리 `aa:claimed` → 코어 `claimPending=false` → 레드닷 `/event/redDot/archery` 해제. **수령 전 재도전 불가.**
- 번들 예시: `2001=gem120`(1위)/`2002=gem80`/`2003=gem50`/`2004=gold5000`/`2005=gold2000`.

### 화면 전환 연출
진입/이탈 = **사선 블라인드(diagonal blind) 전환**. **팝업 없음.** 토스트는 호스트 ToastOverlay(z530)로 띄운다(`aa:toast`).

### postMessage 요약 (이식 지갑 계약, 상세 HANDOFF §5)
- iframe→PRISM: `aa:ready` / `aa:walletChanged{balance}` / `aa:claimPending` / `aa:claimed` / `aa:toast` / `event:grant`
- PRISM→iframe: `host:walletSync{balance,missionLines,claimPending}` / `host:eventDispose`
- ⚠️ 구 `aa:consumeBow`/`host:archeryInit`/`host:bowConsumed`/`host:bowDenied` **폐기**(지갑 계약으로 통일).

## 6. v4 규칙 / 고유 Anti-Patterns

### v4 공통 규칙
- **함축 금지**(v5 diff용) · CSV §14 = `public/`과 동일, **수치 임의 변경 금지** · `RECIPE_CODE` 임의 수정 금지(repo에서 복사).
- json-render **$state 3곳 동시 패치**: `hudExternalStore.ts` 초기값 + Spec `$state` 문자열 + `syncArcheryHud` set() 키. 하나만 고치면 컴포넌트 못 찾음.
- 이벤트 상태 경로는 `/event/*`·`/archery/*`, 코어는 `/hud/*`·`/lobby/*`. 혼용 금지.

### 고유 Anti-Patterns (코드 확인)
- **[CRITICAL] 1 재화 = 1발** — 라운드당 **1~5발 선택**(`selectedShots`)해 그만큼 소비(`requestConsumeBow(n)`). 구 "1활대=5발"(`shots_per_bow`/`kills_per_bow_host`) 모델 **폐기**(레거시 CSV 필드).
- **[CRITICAL] 호스트 SSoT `getHostBowStands` 무시 금지** — PRISM 모드에서 발 잔액은 호스트(`MinigameCurrencyService.bowStands`, `host:walletSync.balance`)에서 받아야 한다. iframe 로컬 `dice_count`를 SSoT로 쓰면 호스트와 어긋난다. 부트 시 `event_meta_version` 체크 + `aa:ready`→`host:walletSync` 동기화 필수.
- **[CRITICAL] 봇에 setInterval 금지** — 재귀 setTimeout만(규칙 간격은 봇임이 드러남). **봇 전부 0점 초기화 금지**(v2-gold-balance-v5 스키마: 1등 봇 = SET5 3~4회 완벽 적중 수준).
- **[CRITICAL] N발 중 연출 생략 금지** — `runRound(n)`이 점수만 합산하면 안 됨. `runShootingScene(..., { autoAdvance: true })` × N 순차 await. `#shooting-shot-badge`에 `N / N발`.
- **[CRITICAL] 소비를 연출 후로 지연 금지** — `requestConsumeBow(n)`이 `runRound(n)` 전에 차감(`aa:walletChanged` 통지).
- **발 0일 때 `btn-attempt` disabled 금지** — 클릭·토스트 불가. 발 없어도 버튼 활성 + 안내 문구(`.lobby-btn.bow-empty`).
- **gameEntry에서 game.js 정적 import 금지** — TDZ(`Cannot access 'X' before initialization`). **dynamic import 필수**. `shootingBusy`는 `startGame` 최상단 선언.
- **일반 적중 후 확인 전 dispose 금지**(과녁 사라짐) · **도전 카드 진입 시 `clearAttemptSelection` 누락 금지**.
- **Three.js:** `flashRing`에서 `mesh.scale` 변경 금지(색 lerp만) · `renderer.setSize(w,h,true)` 금지(false + canvas CSS 100%) · `#canvas-container` getBoundingClientRect 기준(window 금지) · 화살 방향 **-Z**(+Z이면 화면 밖).
- **UI:** `#root` CSS(`height:100%; flex column`) 누락 금지 · `#app` `max-height:844px` 누락 금지 · 순위 행 `position:sticky` 금지(`scrollIntoView`) · 헤더 타이머 `'01:00'` 하드코딩 후 갱신 · `#hit-target-hud` 외 하단 결과 띠 금지.

## 7. 빌드

```bash
cd "/Users/max/minigame_make/PRISM SQUAD v2"

# iframe(Archery) 단독 개발
#   (Archery 소스 디렉터리에서) npm run dev / npm run build

# PRISM 코어 루트에서
npm run build:archery   # → public/event/archeryArena/ (CSV+index+assets)
npm run build           # build 스크립트에 archery 선행 포함
node mdv4_generator/build_mdv4_docs.mjs   # 문서 재생성(소스: mdv4_generator/sources/, CSV 부록 동기화)
```
> zip 업로드 시 `dist/event/archeryArena/`(CSV+index+assets)가 반드시 포함되어야 한다. Vite `base: '/event/archeryArena/'`, CSV는 `resolveCsvUrl()` 상대 경로 fetch.

## 8. 완성 체크리스트

- [ ] GAME: Design Pillars/Mechanics/Anti-Patterns + 호스트 연동(활대·5발·30분·100킬·보상) + 빌드 스코프
- [ ] DESIGN: Blank Paper Sketch+Neubrutalism 3색 + §4 컴포넌트 + §5 DOM 순서 7화면 + style-ui.css
- [ ] DEV: 스택·json-render 4레이어·State Paths 3곳·Session Storage 버전체크·§14 CSV 6종·에셋 교체
- [ ] RECIPE + RECIPE_CODE (R-11~R-14 PRISM 패턴 포함)
- [ ] HANDOFF: postMessage 6종·hudStore 경로·시퀀스·버그 재발 방지
- [ ] CSV 6개 `public/event/archeryArena/` + 소스 동기화 (integration·bundle 포함)
- [ ] 코어 연동: `eventMinigameRegistry` archery 슬롯 · `archeryMeta.ts` · `GameCore._onEnemyDeath` 100킬 훅 · `App.tsx` postMessage · 입장 `ticket_cost=0`
- [ ] 활대 SSoT = `getHostBowStands()` (iframe 로컬 dice 금지) · 100킬 ≠ 5발 분리 확인
- [ ] 5발 연출 5회 순차 + `N / 5발` 배지 · 활대 0이어도 버튼 활성
- [ ] 봇 재귀 setTimeout + v2-gold-balance-v5 초기 점수
- [ ] 코어 빌드 스코프(이 이벤트 포함/제외) 사용자 확정
- [ ] `npm run build` 통과
