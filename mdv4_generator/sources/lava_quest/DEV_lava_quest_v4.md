# Lava Quest — Developer Spec

> 게임 규칙은 `GAME.md`, 비주얼 시스템은 `DESIGN.md` 참조.
>
> **⚠️ PRISM SQUAD 연동 버전** — `도전 시작` 버튼이 postMessage로 호스트(스퀘어)에 게임 시작을 요청한다.
> 실제 1분 게임은 스퀘어가 처리하고, 결과를 postMessage로 수신해 성공/실패를 처리한다.

---

## 1. Tech Stack

| 항목 | 값 |
|---|---|
| 번들러 | Vite ^6.0.0 |
| UI 프레임워크 | React ^18 + TypeScript |
| 선언 UI | @json-render/react ^0.19.0 |
| 3D 렌더러 | Three.js r172 (OrthographicCamera) |
| 트윈 | @tweenjs/tween.js ^25.0.0 |
| 데이터 | CSV (public/) + localStorage |
| 스타일 | src/style.css |

**스택 정책:** React + json-render + Three.js r172. 외부 물리 엔진 추가 금지. 스택 변경 금지.

---

## 2. File Structure

```
src/
  main.tsx                          진입점 — React 루트, bootstrapGame 호출
  style.css                         전 UI 스타일 SSoT
  bootstrapGame.ts                  CSV 4개 로드 → LavaQuestGame 인스턴스 생성
  App.tsx                           화면 상태 관리, 화면 전환 라우터

  game/
    LavaQuestGame.ts                게임 상태 머신 (세션·화면 루프 전체)
    simulation.ts                   elimPlanForLevel, botIdToIndex, delay
    ranking.ts                      sortRanking
    gameData.ts                     parseCsv(RFC4180), localStorage I/O
    hudExternalStore.ts             HUD $state 스토어
    gameControlBridge.ts            json-render 액션 ↔ LavaQuestGame 연결
    syncLavaHud.ts                  스냅샷 → HUD 스토어 동기화
    gameDataPaths.ts                CSV 파일명 SSoT
    types.ts                        모든 타입 정의

  screens/
    Matching.tsx                    매칭 연출 화면
    Lobby.tsx                       로비 (Three.js + 도전 버튼)
    Attempt.tsx                     레벨 도전 (다크 모드)
    Clear.tsx                       클리어 연출 화면
    Fail.tsx                        실패 화면
    FullClear.tsx                   전체 클리어 화면
    Ranking.tsx                     순위표
    Reward.tsx                      보상 확인

  three/
    setup.ts                        createLavaTopViewBasics — OrthographicCamera, ResizeObserver
    players.ts                      마커 스프라이트, computeClusterTargets, tweenWorldPos
    bridge.ts                       7티어 실린더(돌계단) + 토러스 링
    arenaMap.ts                     지형 데코
    lava.ts                         용암 PlaneGeometry 애니메이션
    dispose.ts                      disposeScene 헬퍼
    lavaScene.ts                    씬 조립(mountLavaScene), PACE=0.52, 연출 타임라인

  catalog/
    lavaCatalog.ts                  defineCatalog() 진입점
    lavaCatalogOperationalUi.ts     HUD·버튼 (화면에 실제 렌더되는 것)
    lavaCatalogStubsAndMaterials.ts CSV 재료 + 개념 선언
    lavaCatalogShared.ts            hudBindProp 등 공통 Zod 조각

  jsonRender/
    GameJsonLava.tsx                플레이 Spec + Registry + Provider 래핑

public/
  lq_bot_config.csv
  lq_elimination_schedule.csv
  lq_level_config.csv
  lq_event_config.csv
```

---

## 3. Layout & DOM Order

⚠️ `.screen.hidden { display: none !important; }` 전역 CSS 누락 시 화면 전환 불작동.

```
body (flex center, background: #000)
  #root (React 루트)
    #app (min(390px,100vw-16px) × min(844px,100vh-24px))
      [json-render]
        #jr-hud              ← ① 레벨·생존자·타이머 HUD
      .screen (position absolute, inset 0)
        #screen-matching     ← 매칭 연출
        #screen-lobby        ← Three.js 씬 + 도전 버튼
        #screen-attempt      ← 다크 모드 (z-index: 50)
        #screen-clear        ← 클리어 연출
        #screen-fail
        #screen-full-clear
        #screen-ranking
        #screen-reward
      #toast                 ← position absolute, bottom (pointer-events: none)
      #btn-session-reset     ← position absolute, top-right (screen-matching에서만)
```

**겹침 방지 원칙:**
- 모든 .screen은 position absolute + .hidden 전환.
- .screen--game-mode(ATTEMPT)는 z-index: 50.
- #toast, #btn-session-reset만 position absolute.
- .lq-fx-mount는 JS 임시 생성만. DOM 고정 금지.

---

## 4. json-render Architecture

HUD·버튼은 json-render 선언형. Three.js 씬·연출·타임라인은 명령형 유지.

```
[1] Catalog   src/catalog/lavaCatalog.ts
              → 존재 선언만. 색상·크기·로직 포함 금지.
              → operationalUi: HudLevelBlock, HudPlayersBlock, HudTimerBlock,
                               StartAttemptButton, ResetButton

[2] Spec      src/jsonRender/GameJsonLava.tsx
              → hudRow: { HudLevelBlock, HudPlayersBlock, HudTimerBlock }

[3] State     src/game/hudExternalStore.ts
              → /hud/levelText, /hud/playersText, /hud/timerText 등 flat path

[4] Runtime   src/game/LavaQuestGame.ts
              → 게임 상태 변경 → syncLavaHud → State 갱신
              → Three.js 씬·연출·타임라인은 lavaScene.ts에서 명령형 처리
```

**데이터 흐름:**
```
LavaQuestGame.ts → notify() → syncLavaHud() → hudExternalStore.set() → GameJsonLava.tsx 자동 재렌더
```

**Catalog 4파일 분리 원칙:**

| 파일 | 역할 | 약속 |
|---|---|---|
| lavaCatalog.ts | 관문. defineCatalog() 단일 인스턴스 | 외부는 이 파일만 import |
| lavaCatalogOperationalUi.ts | 실제 화면에 렌더되는 컴포넌트 | 여기 있는 것 = 화면에 나온다 |
| lavaCatalogStubsAndMaterials.ts | CSV 경로 재료 + 개념 선언 | 여기 있어도 화면에 안 나온다 |
| lavaCatalogShared.ts | hudBindProp 등 공통 Zod 조각 | 규칙 바꿀 때 이 파일 하나만 |

---

## 5. State Paths ($state)

수정 시 **3곳 동시 패치**: `hudExternalStore.ts 초기값` + `Spec $state 문자열` + `syncLavaHud.ts set() 키`

| 경로 | 타입 | 초기값 | 설명 |
|---|---|---|---|
| `/hud/levelText` | string | `'레벨 1'` | 현재 레벨 표시 |
| `/hud/playersText` | string | `'100명'` | 생존자 수 표시 |
| `/hud/timerText` | string | `'00:00'` | 타이머 표시 |
| `/hud/phase` | string | `'MATCHING'` | 현재 phase |
| `/hud/busyDisabled` | boolean | `false` | busy 상태 버튼 비활성 |

---

## 6. DOM Required IDs

⚠️ id 변경 금지. 화면 전환·WebGL 마운트·HUD 갱신 기준.

| ID | 역할 |
|---|---|
| `app` | 앱 컨테이너 |
| `jr-hud` | json-render HUD 영역 |
| `screen-matching` | 매칭 화면 |
| `screen-lobby` | 로비 화면 |
| `screen-attempt` | 도전 화면 |
| `screen-clear` | 클리어 화면 |
| `screen-fail` | 실패 화면 |
| `screen-full-clear` | 전체 클리어 화면 |
| `screen-ranking` | 순위표 화면 |
| `screen-reward` | 보상 화면 |
| `canvas-container` | 로비 Three.js 마운트 |
| `canvas-container-clear` | 클리어 Three.js 마운트 |
| `avatar-stack` | 매칭 아바타 스택 |
| `rank-list` | 순위 목록 |
| `btn-session-reset` | 세션 리셋 버튼 (matching만) |
| `toast` | 토스트 알림 |

---

## 6.5. Host Integration (PRISM SQUAD postMessage 브릿지)

### 발송 메시지 (LQ → 호스트)

```ts
// btn-start-attempt 클릭 시 (window.parent !== window 조건 확인)
window.parent.postMessage({
  type: 'lq:start_attempt',
  level: number,        // 현재 스테이지 번호 (1~7)
  totalLevels: number,  // 전체 레벨 수 (CSV total_levels)
  isLastLevel: boolean, // 마지막 스테이지 여부
  aliveCount: number,   // 현재 생존자 수
}, '*')
```

### 수신 메시지 (호스트 → LQ)

```ts
window.addEventListener('message', (ev) => {
  if (!ev.data || ev.data.type !== 'lq:result') return
  if (ev.data.success) {
    document.getElementById('btn-success')?.click()  // 성공 처리
  } else {
    document.getElementById('btn-fail')?.click()     // 실패 처리
  }
})
```

### standalone 폴백

`window.parent === window` (iframe 아님)일 때 → 기존 ATTEMPT 화면 전환으로 폴백.
성공/실패 버튼을 수동으로 탭해서 테스트 가능.

### 호스트(GameCore) 처리 흐름

```
lq:start_attempt 수신
  → iframe display:none
  → startLavaQuestMode(level, isLast) 호출
  → 1분 타이머 시작, 적 스폰
  → 1분 생존 → _onLavaQuestEnd(true)
  → 사망    → _onLavaQuestEnd(false)
  → lq:result postMessage 발송
  → iframe display:flex (세션 유지)
```

### 배포 경로

LQ dist → `public/event/lavaQuest/` (PRISM SQUAD public 폴더)
호스트에서 iframe src: `/event/lavaQuest/index.html`

---

## 7. Data Schema

> CSV 파일이 있으면 그대로 사용.
> 없으면 아래 스키마 기준으로 생성.

### lq_event_config.csv

| 컬럼 | 타입 | 설명 |
|---|---|---|
| event_id | string | 이벤트 식별자 |
| event_name | string | 표시 이름 |
| group_size | int | 그룹 크기 (100) |
| total_levels | int | 총 레벨 수 (7) |
| duration_hours | float | 이벤트 지속 시간(시) — **현재값: 0.5 (30분)** |
| grand_prize | int | 그랜드 프라이즈 코인 |

### lq_level_config.csv

| 컬럼 | 타입 | 설명 |
|---|---|---|
| level | int | 1~7 |
| difficulty_label | string | 표시 난이도 |
| target_clear_rate | float | 목표 클리어율 (참고용) |
| tip_text | string | ATTEMPT 화면 팁 문구 |

### lq_bot_config.csv

| 컬럼 | 타입 | 설명 |
|---|---|---|
| bot_id | string | bot_001 ~ bot_099 형식 |
| display_name | string | 표시 이름 |
| avatar_emoji | string | 아바타 이모지 |
| x_offset | float | Three.js 마커 X 오프셋 |

### lq_elimination_schedule.csv

| 컬럼 | 타입 | 설명 |
|---|---|---|
| level | int | 1~7 |
| bot_id | string | bot_001 형식 |
| delay_ms | int | 탈락 연출 시작 시점. 동일 봇은 최소값만 사용. |

---

## 8. Session Storage

| 키 | 구조 |
|---|---|
| `lq_session_v1` | `{ version: 1\|2, clearsCompleted, aliveIds: number[], clearsForRank: number[], meFailedAttemptLevel: number\|null }` |

**복구 조건:** `version === 1 \|\| 2` AND `aliveIds`, `clearsForRank` 배열 AND `clearsForRank.length === bots.length`
**복구 후:** 항상 startMatchingAnimated()부터 시작. 로비 자동 스킵 없음.

---

## 9. Implementation Order

```
1단계: index.html + src/style.css (SVG 필터 포함)
2단계: src/game/types.ts + gameDataPaths.ts + gameData.ts
3단계: src/game/simulation.ts + ranking.ts
4단계: src/three/setup.ts → players.ts → bridge.ts → arenaMap.ts → lava.ts → dispose.ts
5단계: src/three/lavaScene.ts (씬 조립 + 연출 타임라인)
6단계: src/game/LavaQuestGame.ts (상태 머신)
7단계: src/game/hudExternalStore.ts + syncLavaHud.ts + gameControlBridge.ts
8단계: src/catalog/ 4개 파일
9단계: src/jsonRender/GameJsonLava.tsx
10단계: src/screens/ 8개 파일
11단계: src/App.tsx + bootstrapGame.ts
12단계: src/main.tsx (마지막)
```

**main.tsx는 항상 마지막.** 모든 import 대상 파일이 존재해야 빌드 성공.

---

## 10. Anti-Patterns

### 🔗 호스트 연동 (postMessage)

- **[CRITICAL] window.parent 체크 없이 postMessage 발송 금지** — standalone 모드에서 에러 발생
- **[CRITICAL] iframe src 재설정으로 복원 금지** — 세션 초기화됨. `display:none/flex`만 사용
- **[CRITICAL] lq:result 수신 전 btn-success/btn-fail 직접 클릭 금지** — 호스트 결과와 어긋남
- **[CRITICAL] window.parent.postMessage origin을 특정 도메인으로 제한 금지** — `'*'` 사용
- **duration_hours를 정수로만 설정 금지** — 0.5(30분) 등 소수점 가능. CSV float 파싱 필수

### 🎥 Three.js / 씬

- **[CRITICAL] camera.up을 (0,0,-1)로 설정 금지** — LookAt Singularity → 화면 백화·NaN
- **[CRITICAL] STEP_Z_DELTA를 양수로 설정 금지** — 이동 방향 반전 (위→아래)
- **[CRITICAL] 마커에 SphereGeometry 사용 금지** — 탑뷰에서 깊이가 없어 안 보임
- **[CRITICAL] 마커 depthTest:true 금지** — Z-fighting → 깜빡임·가려짐
- **[CRITICAL] 탈락 연출에 Y축 포물선 낙하 금지** — 탑뷰에서 전혀 안 보임
- **[CRITICAL] 고정 마커 크기 사용 금지** — wpp × 3.85 동적 계산 필수
- **[CRITICAL] MARKER_Z_BIAS 누락 금지** — 마커가 카메라 시야 밖으로 벗어남
- **마커 rotation.x = -Math.PI/2 누락 금지** — 마커가 수직으로 서 있음
- **worldRoot 없이 씬 오브젝트 직접 추가 금지** — Y 오프셋 관리 불가
- **[CRITICAL] ResizeObserver disconnect 없이 disposeScene 금지** — 씬 교체 시 죽은 렌더러 접근
- **씬 마운트 전 frameWait(2) 누락 금지** — getBoundingClientRect() = 0

### ⚙️ 게임 로직

- **[CRITICAL] 고정 #lq-fx-mount를 index.html에 추가 금지** — 마커 연출 차단
- **busy 가드 누락 금지** — 모든 async 핸들러 시작 시 if (busy) return
- **localStorage 복구 후 로비 자동 스킵 금지** — 항상 startMatchingAnimated()부터
- **[CRITICAL] PACE 상수 임의 변경 금지** — PACE = 0.52 고정
- **[CRITICAL] 탈락 연출 절대 지연 사용 금지** — delay_ms 차이 × PACE 사용

### 🔗 json-render

- **$state 경로 수정 시 3곳 미동시 패치 금지**
- **카탈로그에 타입 추가 시 registry JSX 미패치 금지**
- **StateProvider 없이 Renderer 사용 금지**
- **Three.js 씬을 json-render Spec 안에 넣으려는 시도 금지**

### 🖼️ UI / Layout

- **`.lava-canvas canvas` pointer-events:none 누락 금지** — 버튼 탭 차단
- **`#toast` pointer-events:none 누락 금지** — 하단 버튼 탭 차단
- **`.screen.hidden` CSS 전역 룰 누락 금지** — JS hidden 클래스 미작동
- **`#btn-session-reset` 로비 이후 화면 노출 금지** — screen-matching에서만
- **`#avatar-stack`에 flex:1 금지** — 빈 박스 팽창 (flex:0 1 auto)
- **SVG 필터(#paper-texture, #sketchy-edge) index.html 누락 금지** — 스케치 질감 소실

---

## 10.5. 스퀘어 1분 모드 밸런스 (GameCore 설정)

| 항목 | 값 | 위치 |
|------|-----|------|
| 게임 시간 | 60초 | `GameCore.lavaQuestDurationSec` |
| 보스 등장 (마지막 스테이지) | 50초 | `data.finalBoss.spawn_time_seconds` 임시 오버라이드 |
| 보스 원복 | 종료 후 600초 복원 | `_onLavaQuestEnd()` |
| 1분 생존 | 성공 | `_onLavaQuestEnd(true)` |
| 사망 | 실패 | `_gameOver()` → `_onLavaQuestEnd(false)` |
| 마지막 스테이지 클리어 보상 | 보석 100개 | `_onLavaQuestEnd(true) + isLast` |
| 이벤트 HUD | 숨김 | `hudStore['/game/lavaQuestActive']` = true |
| iframe 세션 유지 | display:none/flex | src 변경 없음 |

---

## 11. Bug Log

| 버그 | 원인 | 해결 |
|---|---|---|
| 고정 #lq-fx-mount가 WebGL 덮음 | index.html에 고정 배치 | 실패 연출 시에만 JS로 임시 마운트 |
| localStorage 복구 후 매칭 스킵 | 자동 로비 진입 | 항상 startMatchingAnimated()부터 |
| levelConfig.find 예외 | 배열 확인 누락 | Array.isArray 가드 |
| 토스트·캔버스가 버튼 차단 | pointer-events 미설정 | 각각 none 적용 |
| 모바일 버튼 잘림 | min-height:0 누락 | .screen에 적용 |
| 매칭 그리드 오버플로 | width:100% + margin | width:auto + align-self:stretch |
| 깨진 세이브 비현실 스냅샷 | 검증 누락 | save_repair_on_load 로직 |
| 클리어 씬 마커 위치 어긋남 | playerClears 오설정 | bridgeTierBeforeWin = max(0, c-1) |
| iframe 복원 시 LQ 세션 초기화 | src 재설정 | src 변경 없이 display:flex만 |
| 이벤트 HUD(타이쿤 바)가 LQ 위에 노출 | z-index 미분리 | iframe z-index: 500 + isolation:isolate |
| 호스트 없는 환경에서 postMessage 에러 | window.parent 체크 누락 | window.parent !== window 조건 추가 |
| duration_hours 0.5 파싱 실패 | parseInt 사용 | parseFloat(evt.duration_hours) 필수 |
| 리셋 버튼 로비·인게임 노출 | hidden CSS 룰 누락 | .screen.hidden 전역 + screen-matching에서만 |
| 씬 교체 시 WebGL 크래시 | ResizeObserver disconnect 누락 | disposeScene()에 ro.disconnect() 추가 |
| 이동 방향 화면 위→아래 반전 | STEP_Z_DELTA 양수 또는 camera.up(0,0,-1) | STEP_Z_DELTA=-6.5, camera.up=(0,1,0) |
| 마커 안 보임 (탑뷰) | SphereGeometry 또는 고정 크기 | CircleGeometry(2D) + wpp×3.85 동적 계산 |
| 마커 Z-fighting 깜빡임 | depthTest:true | depthTest:false 필수 |
| 마커 수직으로 서 있음 | rotation.x 미설정 | rotation.x = -Math.PI/2 |
| 탈락 연출 안 보임 (탑뷰) | Y축 포물선 낙하 | xzScatterDelta() X축 튕겨남 |
| 마커 시야 밖 배치 | MARKER_Z_BIAS 누락 | zForClears(tier) + MARKER_Z_BIAS |

---

## 12. Checklist

- [ ] Anti-Patterns 전 항목 읽었는가 (호스트 연동 섹션 포함)
- [ ] 호스트(PRISM SQUAD) 환경에서 도전 시작 → postMessage 발송 확인
- [ ] lq:result(success:true) 수신 → btn-success 자동 클릭 확인
- [ ] lq:result(success:false) 수신 → btn-fail 자동 클릭 확인
- [ ] standalone 폴백 (iframe 없이 직접 열기) 정상 동작 확인
- [ ] lq_event_config.csv duration_hours: 0.5 → 타이머 30분으로 표시 확인
- [ ] CSV 4개 public/ 아래 있는가
- [ ] SVG 필터 (paper-texture, sketchy-edge) index.html에 있는가
- [ ] json-render 4레이어 구조 이해했는가
- [ ] npm run dev → screen-matching + 100명 매칭 연출 (육안 확인)
- [ ] 계속 탭 → Three.js 씬(돌다리+마커) 렌더 (빈 캔버스 = 실패)
- [ ] 도전 시작 → 성공/실패 버튼 탭 가능
- [ ] 성공 → fleaIntro + 플레이어 전진 + CSV 순 탈락 연출 (X축 튕겨남)
- [ ] 실패 → 낙하 연출 → screen-fail
- [ ] 7클리어 → screen-full-clear → 보상 확인 → 매칭 리셋
- [ ] 새로고침 → localStorage 복구 + 매칭 연출부터
- [ ] 마커가 CircleGeometry(2D)로 렌더되는가 (SphereGeometry 아님)
- [ ] 플레이어 이동 방향이 화면 하단→상단인가
- [ ] HUD 레벨·생존자·타이머 json-render $state 갱신
- [ ] npm run build 통과

---

## 13. Commands

```bash
npm install
npm run dev
npm run build
npm run preview
```

---

## 에셋 교체 시스템 (Asset Replacement System)

> `sprite_url` 비어있으면 기존 CircleGeometry 원형 마커 렌더 유지.

### 적용 CSV
| CSV | 추가 컬럼 |
|-----|---------|
| `public/lq_bot_config.csv` | `sprite_url` (100개 봇 행) |
| `public/lq_level_config.csv` | `bg_sprite_url` |

### 렌더 분기 (src/three/players.js)
→ 코드: RECIPE_CODE.md 해당 R-번호 참조

### public/assets/ 구조
→ 코드: RECIPE_CODE.md 해당 R-번호 참조
총 **5개** 플레이스홀더 PNG

### 재생성 / 교체 예시
→ 코드: RECIPE_CODE.md 해당 R-번호 참조
→ 코드: RECIPE_CODE.md 해당 R-번호 참조
