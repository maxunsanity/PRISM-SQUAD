# Archery Arena — Developer Spec

> 게임 규칙은 `GAME.md`, 비주얼 시스템은 `DESIGN.md` 참조.

---

## 1. Tech Stack

| 항목 | 값 |
|---|---|
| 번들러 | Vite ^6 |
| UI 프레임워크 | React ^18 + TypeScript |
| 선언 UI | @json-render/react ^0.19.0 |
| 3D 렌더러 | Three.js r172 (PerspectiveCamera, FOV 38) |
| 데이터 | CSV (public/) + localStorage |
| 스타일 | src/style-ui.css |

**스택 정책:** React + json-render + Three.js r172. 외부 물리 엔진 추가 금지. 스택 변경 금지.

---

## 2. File Structure (실구현 · 2026-06-04)

> 아래가 **실제 코드**. React 화면 분리(`screens/*.tsx`)·`ArcheryGame.ts` 는 미착수 — DOM + `game.js` 단일 상태기.

```
src/
  main.tsx                 React HUD(GameJsonHud) + dynamic import gameEntry
  gameEntry.js             loadAllData → import('./game.js') (TDZ 방지)
  game.js                  startGame — 화면·봇·5발 연출·보상
  data.js                  CSV fetch(resolveCsvUrl) · integration · bundle 파싱
  hostBridge.js            PRISM postMessage (aa:* / host:*)
  ui.js                    DOM 화면 전환·토스트·순위 렌더
  mechanics.js             점수·Bullseye 확률
  ranking.js               50인 봇·순위
  style.css + style-ui.css
  three/setup.js, target.js, arrow_shot.js
  game/hudExternalStore.ts   iframe 미니 HUD 스냅샷(우상단)
  game/gameControlBridge.ts  (스텁·확장용)
  jsonRender/GameJsonHud.tsx
  catalog/                   json-render 카탈로그(참고·부분 사용)

public/  → 빌드 시 outDir 루트로 복사
  aa_attempt_config.csv
  aa_event_config.csv
  aa_visual_config.csv
  aa_rank_reward_config.csv
  aa_integration_config.csv   ← PRISM·세션·5발·100킬 (key-value)
  aa_bundle_reward_config.csv ← event:grant SSoT

index.html                 7화면 DOM (screen-entry … screen-reward)

vite.config.ts
  base: '/event/archeryArena/'
  build.outDir: '../../../public/event/archeryArena'
```

### PRISM 호스트 (별도 repo 경로)

```
src/game/eventMinigameRegistry.ts   archery 슬롯
src/game/eventMinigameHost.ts
src/game/archeryMeta.ts             활대·킬·bundle CSV preload
src/game/eventRedDots.ts
src/jsonRender/EventMinigameOverlay.tsx
src/App.tsx                         postMessage
```

→ **`HANDOFF_archery_arena_v4.md`**

---

## 3. Layout & DOM Order

⚠️ `#root` CSS 누락 시 활쏘기 화면 전환 시 canvas 0px 붕괴.

```
body (background: #ede8dc, flex center, min-height: 100dvh)
  #root (height: 100%, display: flex, flex-direction: column)  ← React 루트
    #app (max-width: 390px, max-height: 844px, height: 100dvh)
      .header-timer          ← ① 헤더 타이머 (border-bottom: 3px solid #222)
      [json-render]
        #jr-hud              ← ② 점수·순위·주사위 HUD
      .screen-container      ← ③ 화면 전환 영역
        #screen-entry
        #screen-lobby
          #ranking-list      ← 50행 스크롤
        #screen-attempt
          .attempt-cards     ← SINGLE/SET3/SET5 카드
        #screen-shooting
          #canvas-container  ← Three.js WebGL
          #hit-target-hud    ← DOM 오버레이 (중앙만)
        #screen-bullseye
        #screen-result
        #screen-reward
      #toast                 ← position absolute, bottom
```

**겹침 방지 원칙:**
- .header-timer, #jr-hud, .screen-container는 normal flow(flex column).
- #toast만 position: absolute.
- #hit-target-hud는 #canvas-container 내부 absolute.

---

## 4. json-render Architecture

HUD·버튼은 json-render 선언형. Three.js 과녁·화살·파티클은 명령형 유지.

```
[1] Catalog   src/catalog/archeryCatalog.ts
              → 존재 선언만. 색상·크기·로직 포함 금지.
              → operationalUi: HudScoreBlock, HudRankBlock, HudDiceBlock,
                               AttemptButton, ResetButton

[2] Spec      src/jsonRender/GameJsonArchery.tsx
              → hudRow: { HudScoreBlock, HudRankBlock, HudDiceBlock }

[3] State     src/game/hudExternalStore.ts
              → /hud/scoreText, /hud/rankText, /hud/diceText 등 flat path

[4] Runtime   src/game/ArcheryGame.ts
              → 게임 상태 변경 → syncArcheryHud → State 갱신
              → Three.js 과녁·화살·파티클은 three/에서 명령형 처리
```

**데이터 흐름 (단방향):**
```
ArcheryGame.ts → notify() → syncArcheryHud() → hudExternalStore.set() → GameJsonArchery.tsx 자동 재렌더
```

**Catalog 4파일 분리 원칙:**

| 파일 | 역할 | 약속 |
|---|---|---|
| archeryCatalog.ts | 관문. defineCatalog() 단일 인스턴스 | 외부는 이 파일만 import |
| archeryCatalogOperationalUi.ts | 실제 화면에 렌더되는 컴포넌트 | 여기 있는 것 = 화면에 나온다 |
| archeryCatalogStubsAndMaterials.ts | CSV 경로 재료 + 개념 선언 | 여기 있어도 화면에 안 나온다 |
| archeryCatalogShared.ts | hudBindProp 등 공통 Zod 조각 | 규칙 바꿀 때 이 파일 하나만 |

---

## 5. State Paths ($state)

수정 시 **3곳 동시 패치**: `hudExternalStore.ts 초기값` + `Spec $state 문자열` + `syncArcheryHud.ts set() 키`

| 경로 | 타입 | 초기값 | 설명 |
|---|---|---|---|
| `/hud/scoreText` | string | `'0'` | 점수 표시 |
| `/hud/rankText` | string | `'50위'` | 순위 표시 |
| `/hud/diceText` | string | `'🎲 20'` | 주사위 수 |
| `/hud/timerText` | string | `'01:00'` | 타이머 표시 |
| `/hud/diceDisabled` | boolean | `false` | 주사위 소진 상태 |
| `/hud/screen` | string | `'entry'` | 현재 화면 |

---

## 6. DOM Required IDs

⚠️ id 변경 금지. 화면 전환·WebGL 마운트·이벤트 바인딩 기준.

| ID | 역할 |
|---|---|
| `app` | 앱 컨테이너 (max 390×844) |
| `jr-hud` | json-render HUD 영역 |
| `screen-entry` | 진입 팝업 화면 |
| `screen-lobby` | 로비 화면 |
| `screen-attempt` | 도전 카드 선택 화면 |
| `screen-shooting` | 활쏘기 화면 |
| `screen-bullseye` | Bullseye 화면 |
| `screen-result` | 결과 화면 |
| `screen-reward` | 보상 화면 |
| `ranking-list` | 순위표 목록 |
| `canvas-container` | Three.js 마운트 |
| `hit-target-hud` | 과녁 위 HUD 오버레이 |
| `attempt-cards` | 도전 카드 컨테이너 |
| `btn-attempt` | 활쏘 도전 버튼 |
| `btn-add-dice` | 주사위 충전 버튼 (PRISM 빌드: display:none) |
| `shooting-shot-badge` | 5발 연출 진행 `N / 5발` |
| `toast` | 토스트 알림 |

---

## 7. Data Schema

> CSV 파일이 있으면 그대로 사용.
> 없으면 아래 스키마 기준으로 생성.

### aa_attempt_config.csv

| 컬럼 | 타입 | 설명 |
|---|---|---|
| attempt_type | enum | SINGLE/SET3/SET5 |
| cost_dice | int | 재화 소모량 |
| score_min | int | 최소 점수 |
| score_max | int | 최대 점수 |
| attempt_multiplier | float | 점수 배율 |
| has_set_bonus | bool | 세트 보너스 여부 |

### aa_event_config.csv

| 컬럼 | 타입 | 설명 |
|---|---|---|
| bullseye_base_prob | float | Bullseye 기본 확률 (권장: 0.05) |
| bullseye_max_prob | float | Bullseye 최대 확률 (권장: 0.15) |
| bullseye_combo_increment | float | 콤보당 확률 증가 |
| bot_tick_min_ms | int | 봇 최소 간격 |
| bot_tick_max_ms | int | 봇 최대 간격 |
| session_duration_ms | int | 세션 지속 시간 |

### aa_visual_config.csv

| 컬럼 | 타입 | 설명 |
|---|---|---|
| arrow_flight_ms | int | 화살 비행 시간 |
| hit_ring_pulse_ms | int | flashRing 지속 시간 |
| trail_fade_ms | int | 트레일 페이드 시간 |
| bullseye_particle_duration_ms | int | 파티클 지속 시간 |
| bullseye_countup_ms | int | 카운트업 0→100 시간 |
| target_scale | float | 과녁 스케일 (권장: 0.68) |

### aa_rank_reward_config.csv

| 컬럼 | 타입 | 설명 |
|---|---|---|
| rank_min | int | 보상 순위 범위 최소 |
| rank_max | int | 보상 순위 범위 최대 |
| reward_grade | string | GRAND/HIGH/… |
| reward_bundle_id | string | `aa_bundle_reward_config` FK |

### 7.1 aa_integration_config.csv (key-value · PRISM SSoT)

| config_key | 예시 | 설명 |
|---|---|---|
| tournament_round_min | 30 | 라운드 분 |
| bot_tick_ms | 60000 | 봇 tick(ms). 0=event CSV 랜덤 |
| shots_per_bow | 5 | 활대 1개당 연출 발수 |
| event_meta_version | 3 | `aa_event_meta.v` |
| starter_bow_stands | 5 | 호스트 기본 활대 |
| kills_per_bow_host | 100 | 스퀘어 N킬당 활대+1 |
| storage_key_prism_host | prism_archery_host_v1 | 호스트 LS |
| storage_key_player | aa_player_state | iframe LS |
| storage_key_event_meta | aa_event_meta | iframe LS |
| iframe_deploy_base | /event/archeryArena/ | Vite base |
| minigame_id | archery | registry id |
| minigame_src | /event/archeryArena/index.html | iframe src |

### 7.2 aa_bundle_reward_config.csv

| 컬럼 | 설명 |
|---|---|
| bundle_id | `aa_rank_reward_config.reward_bundle_id` |
| reward_kind | gold / gem / lightning / equip |
| reward_amount | 수량 |
| reward_slot_id | equip 시 slot_id |
| note | 기획 메모 |

PRISM `archeryBundleToGrant` · iframe `event:grant` **둘 다 이 CSV 우선**.

---

## 8. Session Storage

| 키 | 구조 | 설명 |
|---|---|---|
| `aa_player_state` | `{ version, dice_count, target_score, rank_current, combo_count, total_attempts, daily_free_used }` | 플레이어 상태. version 필수. |
| `aa_ranking_bots` | 봇 49명 배열 | 봇 상태 |
| `aa_ranking_dummy_schema` | `v2-gold-balance-v5` | 스키마 버전 |
| `aa_event_meta` | `{ eventId, endMs, v, claimPending? }` | 이벤트 메타 (v=3, 30분 라운드) |
| `prism_archery_host_v1` | `{ bowStands, killsTowardBow, claimPending, starterGranted?, starterV2? }` | **호스트만** — 활대 재화 |

**버전 체크 필수:**
- 부트 시 `aa_player_state.version` 확인
- 불일치 → clearStorage + 기본값(dice:20) 재시작
- 누락 시 구버전 dice_count:0 잔존 → 주사위 0개 시작

---

## 9. Implementation Order

```
1단계: index.html + src/style-ui.css
2단계: src/game/types.ts + gameDataPaths.ts + gameData.ts
3단계: src/game/mechanics.ts + ranking.ts
4단계: src/three/setup.ts + target.ts + arrow_shot.ts
5단계: src/game/ArcheryGame.ts (상태 머신)
6단계: src/game/hudExternalStore.ts + syncArcheryHud.ts + gameControlBridge.ts
7단계: src/catalog/ 4개 파일
8단계: src/jsonRender/GameJsonArchery.tsx
9단계: src/screens/ 7개 파일
10단계: src/App.tsx + bootstrapGame.ts
11단계: src/main.tsx (마지막)
```

**main.tsx는 항상 마지막.** 모든 import 대상 파일이 존재해야 빌드 성공.

---

## 10. Anti-Patterns

### ⚙️ 게임 로직

- **[CRITICAL] 봇에 setInterval 사용 금지** — 재귀 setTimeout만. 규칙적 간격은 봇임이 드러남.
- **[CRITICAL] 봇 전부 0점 초기화 금지** — v2-gold-balance-v5 스키마로 초기 점수 설정.
- **[CRITICAL] 재화 차감을 연출 후로 지연 금지** — attempt() 첫 줄에서 즉시 차감.
- **[CRITICAL] SET3/SET5 화살 1회만 연출 금지** — 세트 횟수만큼 순차 실행 필수.
- **[CRITICAL] localStorage 버전 체크 누락 금지** — 구버전 dice_count:0 잔존 방지.
- **도전 카드 진입 시 clearAttemptSelection 누락 금지** — 이전 선택 잔존.
- **일반 적중 후 확인 전 dispose 금지** — 과녁 사라짐.

### 🎥 Three.js

- **[CRITICAL] flashRing에서 mesh.scale 변경 금지** — 색 lerp만 허용.
- **renderer.setSize(w, h, true) 금지** — false + canvas CSS 100% 적용.
- **window 기준 resize 금지** — #canvas-container getBoundingClientRect() 기준.
- **updateProjectionMatrix() 누락 금지** — camera.aspect 변경 후 항상 호출.
- **화살 방향 +Z 금지** — -Z 방향 필수. +Z이면 화면 밖으로 날아감.

### 🔗 json-render

- **$state 경로 수정 시 3곳 미동시 패치 금지**
- **카탈로그에 타입 추가 시 registry JSX 미패치 금지**
- **StateProvider 없이 Renderer 사용 금지**
- **Three.js 씬을 json-render Spec 안에 넣으려는 시도 금지**

### 🖼️ UI / Layout

- **[CRITICAL] #root CSS 누락 금지** — `height: 100%; display: flex; flex-direction: column` 필수.
- **max-height: 844px 누락 금지** — 데스크탑 세로 무한 늘어남.
- **순위 행 position:sticky 금지** — scrollIntoView 사용.
- **헤더 타이머 초기값 동적 처리 금지** — '01:00' 하드코딩 후 갱신.
- **#hit-target-hud 외 하단 결과 띠 금지** — HUD는 중앙 오버레이만.
- **순위 변동 시각 피드백 누락 금지** — .rank-up / .score-up 클래스 적용.
- **인라인 style 금지** — style-ui.css에서만.

---

## 11. Bug Log

| 버그 | 원인 | 해결 |
|---|---|---|
| 확인 전 과녁 사라짐 | 즉시 dispose | 확인 버튼 클릭 후 dispose |
| 이전 카드 선택 잔존 | clearAttemptSelection 누락 | 진입 시 항상 초기화 |
| 순위 행 sticky 겹침 | position:sticky | scrollIntoView |
| 타이머·순위 이중 표시 | 초기값 미설정 | HTML에 '–'/'01:00' 하드코딩 |
| HUD 과녁 가림 | 하단 결과 띠 | #hit-target-hud만 유지 |
| 과녁 크기 변동 | scale 변경 | 색 lerp만 |
| 봇 점수 편향 | 전부 0 시작 | v2-gold-balance-v5 스키마 |
| 순위 변동 연출 없음 | 클래스 미적용 | .rank-up / .score-up |
| SET3/SET5 연출 1회만 | 세트 횟수 반복 누락 | shootArrow를 count만큼 순차 실행 |
| 주사위 0개 시작 | localStorage 구버전 잔존 | version 체크 → clearStorage + 기본값 20 |
| 과녁 우하단 쏠림 | setSize true + DPR 충돌 | setSize(w,h,false) + canvas CSS 100% |
| 화살 연출 안 보임 | 화살 +Z 방향 | -Z 방향 수정 |
| 활쏘기 canvas 0px | #root CSS 누락 | height:100% flex column 추가 |
| Cannot access 'T' before initialization | shootingBusy TDZ + 정적 import | shootingBusy 상단 선언 + game.js dynamic import |
| CSV 404 | 절대경로 only | data.js resolveCsvUrl |
| 연출 생략 | runFiveBowRound 합산만 | runShootingScene autoAdvance ×5 |

---

## 12. Checklist

- [ ] Anti-Patterns 전 항목 읽었는가
- [ ] CSV **6개** public/ 아래 있는가 (integration + bundle 포함)
- [ ] PRISM HANDOFF 체크리스트 (`HANDOFF_archery_arena_v4.md`)
- [ ] json-render 4레이어 구조 이해했는가
- [ ] npm run dev → Entry 팝업 표시
- [ ] 도전 → 카드 선택 → 도전! → WebGL 과녁 연출
- [ ] flashRing: 색 변화만 (크기 변동 없음)
- [ ] Bullseye → 풀스크린 연출
- [ ] SET3/SET5 → 화살 3발/5발 순차 연출
- [ ] 새 세션 시작 → 주사위 20개로 시작
- [ ] 화살이 과녁 방향(-Z)으로 날아가는가
- [ ] 봇 49명 불규칙 점수 갱신 (재귀 setTimeout)
- [ ] HUD 점수·순위·주사위 json-render $state 갱신
- [ ] 타이머 0 → Result → Reward 플로우
- [ ] npm run build 통과

---

## 13. Commands

```bash
npm install
npm run dev          # Archery 단독
npm run build
npm run preview

# PRISM 루트에서
npm run build:archery
npm run build        # archery 선행 포함
```

---

## 에셋 교체 시스템 (Asset Replacement System)

> `sprite_url` 비어있으면 기존 MeshPhongMaterial 색상 링 렌더 유지.

### 적용 CSV
| CSV | 추가 컬럼 |
|-----|---------|
| `public/aa_visual_config.csv` | `backdrop_sprite_url`, `outer_sprite_url`, `middle_sprite_url`, `center_sprite_url`, `bullseye_sprite_url` (5개) |
| `public/aa_attempt_config.csv` | `sprite_url` |

### 렌더 분기 (src/three/target.js)
→ 코드: RECIPE_CODE.md 해당 R-번호 참조

### public/assets/ 구조
→ 코드: RECIPE_CODE.md 해당 R-번호 참조
총 **8개** 플레이스홀더 PNG

### 재생성 / 교체 예시
→ 코드: RECIPE_CODE.md 해당 R-번호 참조
→ 코드: RECIPE_CODE.md 해당 R-번호 참조
