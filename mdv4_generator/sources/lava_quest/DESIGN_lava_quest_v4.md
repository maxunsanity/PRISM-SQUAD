# Lava Quest — Design System
> 삼국 용암 던전

**Theme:** dark/light hybrid

게임의 느낌은 어두운 용암 씬 위에 종이 질감의 2D HUD가 올라간 구조다. Three.js 씬은 어둡고 극적이며, HTML 셸은 밝고 스케치풍이다. 두 레이어가 시각적으로 분리되어 각자의 역할을 한다.

---

## 1. Visual Theme & Atmosphere

Dark/Light Hybrid 테마. Three.js 씬(용암·돌다리)은 어둡고 극적이며, HTML UI 셸은 밝은 종이 질감(#F7F4EC) 위에 잉크 스케치 스타일이다. 두 레이어는 시각적으로 분리되어야 하며 혼합 금지. ATTEMPT 화면은 예외적으로 다크 모드(radial-gradient 어두운 배경)를 사용한다.

밀도: 중간. 화면 전환 구조. 각 화면은 한 가지 행동에 집중. 스케치 패널과 버튼에 6px 하드 드롭 섀도가 물리적 질감을 만든다.

---

## 2. Color Palette & Roles

| Name | HEX | Token | Role |
|---|---|---|---|
| Lava | `#E85030` | `--lava` | 용암 주색. 위험·강조 요소. |
| Lava Bright | `#FF6B35` | `--lava-glow` | 용암 발광 효과. |
| Stone | `#6B5A4E` | `--stone` | 돌 재질·보조 요소. |
| Gold | `#D4A017` | `--gold` | 보상·골드 강조. |
| Gold Bright | `#FFD700` | `--gold-bright` | 전체 클리어 골드 연출. |
| Surface Dark | `#1A0A02` | `--surface` | Three.js 씬 바닥·어두운 배경. |
| Ink | `#111111` | `--ink` | 텍스트·테두리. |
| Safe Green | `#16A34A` | `--safe` | 성공 버튼. |
| Danger Red | `#DC2626` | `--danger` | 실패 버튼. |
| My Blue | `#1A6FD4` | `--my-blue` | 플레이어 마커·내 순위 강조. |
| Paper | `#F7F4EC` | `--paper` | 2D HUD 배경. |
| Paper 2 | `#ECE6D9` | `--paper-2` | 보조 배경. |
| Eliminated | `#999999` | — | 탈락 마커 색상. |

---

## 3. Typography Rules

**Family:** `ui-rounded, 'SF Pro Rounded', system-ui, 'Segoe UI', 'Apple SD Gothic Neo', sans-serif`
외부 웹폰트 로드 금지.

| Role | Size | Weight | 용도 |
|---|---|---|---|
| content-sm | 0.8rem | 400 | 소형 라벨·보조 텍스트 |
| content | 0.88rem | 400 | 본문 텍스트 |
| stat | 1.08rem | 700 | HUD 수치 |
| title-pill | 1.28rem | 700 | 화면 제목 |

---

## 4. Component Stylings

### #app
`width: min(390px, 100vw - 16px)`, `height: min(844px, 100vh - 24px)`.
`border: 3px solid #111`, `border-radius: 18px`.
`box-shadow: 6px 6px 0 #000, 14px 18px 0 rgba(0,0,0,0.28)`.
`isolation: isolate` — Three.js 씬과 HTML 레이어 분리 필수.
`::before`: paper-texture SVG 필터 오버레이 (opacity 0.45, pointer-events:none, z-index:100).

### .screen
`position: absolute`, `inset: 0`, `flex column`, `min-height: 0`.
`.screen.hidden { display: none !important; }` — 전역 hidden 규칙 필수.

### .screen-footer
`position: relative`, `z-index: 8`, `flex-shrink: 0`.
`padding-bottom: max(var(--footer-pad-y), env(safe-area-inset-bottom, 0px))` — 안전 영역 대응.
변형: `--dark` (투명→어두운 그라데이션), `--gold`, `--reward`.

### .screen--game-mode (ATTEMPT 화면)
`background: radial-gradient(circle at center, #2a1005 0%, #0a0502 100%)`.
`color: #fff`, `z-index: 50`.

### .lava-canvas-frame
`position: relative`, `width: 100%`, `aspect-ratio: 4/5`.
`border: 4px solid #111`, `border-radius: var(--sketch-radius-alt)`.
`background: #000`, `overflow: hidden`, `filter: url(#sketchy-edge)`.
내부 `.lava-canvas`: `width: 100%`, `height: 100%`, `background: #1a0a08`.
canvas: `display: block !important`, `width: 100% !important`, `height: 100% !important`.

### .btn-primary
`background: #111`, `color: #fff`.
`border-radius: var(--sketch-radius)`.
`min-height: var(--tap-target-min)`.
탭: `transform: translate(2px, 2px)`.

### .btn-game-success / .btn-game-fail
성공: 녹색 그라데이션, `border-bottom: 4px solid`.
실패: 빨간 그라데이션, `border-bottom: 4px solid`.
active: `translateY(2px)`, `border-bottom-width: 2px`.

### sketch-panel 공통
`.sketch-panel`, `.grand-prize-display`, `.matching-box`, `.stat-box`, `.timer-value`, `.reward-tile`:
`border: 3px solid #111`, `border-radius: var(--sketch-radius)`, `background: var(--paper)`.
`box-shadow: var(--shadow-hard)`, `filter: url(#sketchy-edge)`.
짝수 자식: `border-radius: var(--sketch-radius-alt)`.

### #btn-session-reset
`position: absolute`, `top: 8px`, `right: 14px`, `z-index: 200`.
`width/height: 40px`. SVG 아이콘만. screen-matching에서만 표시.
active: `translate(2px, 2px)`.

### .lq-fx-mount (실패 연출 전용)
`position: fixed`, `inset: 0`, `pointer-events: none`, `z-index: 9999`.
**index.html에 고정 배치 금지 — JS로 body에 임시 생성만.**

### #toast
`position: absolute`, `left/right: 10px`, `bottom: 12px`.
`border: 3px solid #111`, `border-radius: 14px`.
`box-shadow: 6px 6px 0 #000`, `z-index: 10`.
**`pointer-events: none` 필수** — 누락 시 하단 버튼 탭 차단.

### .rank-item
`display: grid`, `grid-template-columns: 34px 32px minmax(0,1fr) auto`.
`.rank-item.me`: `outline: 3px solid var(--my-blue)`.

### #jr-hud (json-render HUD 영역)
레벨 수·생존자 수·타이머 표시.
.screen 상단 또는 화면별 HUD 위치에 마운트.

---

## 5. Layout Principles

**DOM 순서 (위→아래, 변경 금지):**
```
body (flex center, background: #000)
  #app (min(390px, 100vw-16px) × min(844px, 100vh-24px))
    [json-render]
      #jr-hud              ← ① 레벨·생존자·타이머 HUD
    .screen (position absolute, inset 0)
      #screen-matching
      #screen-lobby
        .lava-canvas-frame ← Three.js WebGL
      #screen-attempt      ← .screen--game-mode (다크)
      #screen-clear
        .lava-canvas-frame
      #screen-fail
      #screen-full-clear
      #screen-ranking
      #screen-reward
    #toast                 ← position absolute, bottom
    #btn-session-reset     ← position absolute, top-right (matching에서만)
```

**겹침 방지 원칙:**
- 모든 .screen은 position absolute + .hidden으로 전환.
- .screen--game-mode(ATTEMPT)는 z-index: 50으로 다른 화면 위에 표시.
- #toast, #btn-session-reset만 position absolute.
- .lq-fx-mount는 JS로 임시 생성만. index.html 배치 금지.

---

## 5b. 화면별 UI 레이아웃 (재현 기준)

각 `.screen`의 구성 요소. 모두 paper(#F7F4EC) 셸 위 스케치 패널 기준이며, ATTEMPT만 다크 게임모드다.

| 화면 (id) | 상단 | 본문 | 하단(footer) |
|---|---|---|---|
| `#screen-matching` | 타이틀 필 "용암 퀘스트" | 매칭 박스 `.matching-box` — 100/100 카운트업 + 아바타 등장 연출 | (자동 진행) · 우상단 `#btn-session-reset` 노출 |
| `#screen-lobby` | `#jr-hud` (레벨·생존자·30분 타이머) | `.lava-canvas-frame` (Three.js 용암 씬·돌다리·마커) + 그랜드프라이즈 표시 `.grand-prize-display` | `.btn-primary` "도전 시작" |
| `#screen-attempt` | (다크) 레벨 n/7 · 생존자 수 | `.screen--game-mode` radial 다크 배경 + 팁 텍스트 (standalone 폴백 전용 — 호스트 모드에선 코어 전투가 대체) | `.btn-game-success` / `.btn-game-fail` |
| `#screen-clear` | `#jr-hud` 클리어 수 n/7 | `.lava-canvas-frame` 클리어 연출(플레이어 전진·줌인·봇 탈락) + 보상 칩 `.lq-reward-card` | `.btn-primary` "계속" (연출 후 활성) |
| `#screen-fail` | 타이틀 필 "탈락" | 탈락 안내 + 도달 레벨 | `.btn-primary` "순위 보기" |
| `#screen-full-clear` | 골드 오버레이(LQ-ANI-006/007) | 7클리어 축하 + 그랜드프라이즈 | `.screen-footer--gold` |
| `#screen-ranking` | 타이틀 필 "순위" | `.rank-item` 리스트(`.me`는 my-blue 아웃라인) | `.btn-primary` "보상 받기" |
| `#screen-reward` | 타이틀 필 "보상" | `.reward-tile` 최종 보상 | `.screen-footer--reward` "확인"(→세션 리셋) |

- 보상 칩(`.lq-reward-card`) 클릭 → `event:showRewardDetail` postMessage로 호스트 상세 팝업.
- `#toast`는 `pointer-events: none` 필수(하단 버튼 탭 차단 방지).

---

## 5c. 유저 플로우 (코어 핸드오프 포함)

```
[로비] 🌋 사이드탭 → 라바 티켓 1장 차감 → iframe 오버레이
  → MATCHING(100/100) → LOBBY(용암 씬·타이머)
  → "도전 시작"
       └─ (lq:start_attempt) → 코어 스퀘어 1분 서바이버(라바 호스트) → (lq:result)
  → 성공: CLEAR(+스테이지 보상) → 7클리어 미만 LOBBY 복귀 / 7클리어 FULL_CLEAR
  → 실패: FAIL → RANKING → REWARD → "확인" → 세션 리셋 → MATCHING
```

- 외부(코어) 전환점은 "도전 시작" 한 곳뿐. 나머지는 iframe 내부 `.screen` 전환.
- ATTEMPT 화면은 standalone(부모 창 없음) 폴백 전용 — iframe 호스트 환경에서는 코어 전투가 대신 표시되고 iframe은 숨겨진다.
- 자세한 코어 연동·재화·보상 계약은 GAME_lava_quest_v4.md「코어 연동」섹션 참조.

---

## 6. Depth & Elevation

하드 드롭 섀도. blur 없음.

| 요소 | Shadow | 효과 |
|---|---|---|
| #app | `6px 6px 0 #000, 14px 18px 0 rgba(0,0,0,0.28)` | 앱 부각 |
| sketch-panel | `6px 6px 0 #000` | 스케치 패널 |
| 버튼 탭 | `transform: translate(2px, 2px)` | 눌리는 느낌 |

---

## 7. Animations

| ID | 트리거 | Duration | 설명 |
|---|---|---|---|
| LQ-ANI-001 | fleaIntro 흩어짐 | 120ms × PACE ≈ 62ms | 마커 클러스터 바깥으로 흩어짐 |
| LQ-ANI-002 | fleaIntro 집결 | 180ms × PACE ≈ 93ms | 원래 위치로 복귀 |
| LQ-ANI-003 | 플레이어 전진 | 450ms × PACE | 다음 스텝으로 이동 + 카메라 2.0× 줌인 |
| LQ-ANI-004 | 봇 탈락 | 480ms × PACE ≈ 250ms | X축 넓게(-12~+12) 튕겨남. Y축 낙하 금지. |
| LQ-ANI-005 | 생존자 파동 재배치 | 360ms × PACE | 새 클러스터 위치로 재배치 |
| LQ-ANI-006 | FULL_CLEAR 골드 오버레이 | 420ms linear | opacity 0 → 0.85 |
| LQ-ANI-007 | 골드 타이틀 | 520ms linear | — |

---

## 8. Responsive Behavior

모바일 우선. 390×844px 기준.

- `#app`: `width: min(390px, 100vw - 16px)`, `height: min(844px, 100vh - 24px)`.
- Three.js 렌더러 크기: container.getBoundingClientRect() 기준. window 금지.
- 씬 마운트: showScreen() 후 frameWait(2) 대기 → flex 높이 계산 완료 후 마운트.
- `.lava-canvas canvas`: `display: block !important`, `width/height: 100% !important` 필수.
- `env(safe-area-inset-bottom)` 하단 안전 영역 대응 필수.

---

## 9. Agent Prompt Guide

**색상 빠른 참조:**
- HUD 배경: `#F7F4EC`
- 잉크: `#111111`
- Three.js 씬 바닥: `#1A0A02`
- 용암: `#E85030`
- 골드: `#D4A017`
- 내 마커: `#00ffff` (사이언)
- 봇 마커: `#ffffff`
- 탈락 마커: `#6a6a6a`

**CSS Custom Properties:**
```
--lava: #E85030
--stone: #6B5A4E
--gold: #D4A017
--gold-bright: #FFD700
--surface: #1A0A02
--ink: #111111
--safe: #16A34A
--danger: #DC2626
--my-blue: #1A6FD4
--paper: #F7F4EC
--paper-2: #ECE6D9
--shadow-hard: 6px 6px 0 #000
--sketch-radius: 255px 15px 225px 15px / 15px 225px 15px 255px
--sketch-radius-alt: 15px 225px 15px 255px / 255px 15px 225px 15px
```

**Three.js 씬 핵심 설정:**
- OrthographicCamera, frustumHalfH: 32, cameraLiftY: 72
- lookWorld: (0, -2.95, -8) — Z 음수 = 화면 상단 방향
- camera.up: (0, 1, 0) 고정. (0, 0, -1) 절대 금지.
- 마커: CircleGeometry(2D), 48세그먼트, depthTest: false
- 탈락 연출: X축 넓게(-12~+12) 튕겨남. Y축 포물선 금지.

**Do:**
- `isolation: isolate` #app에 필수
- `pointer-events: none` — canvas, toast, .lq-fx-mount에 필수
- `.screen.hidden { display: none !important; }` 전역 필수
- SVG 필터 (paper-texture, sketchy-edge) index.html에 포함
- #btn-session-reset은 screen-matching에서만 표시

**Don't:**
- Three.js 씬과 HTML 레이어 혼합 금지
- .lq-fx-mount를 index.html에 고정 배치 금지
- #avatar-stack에 `flex: 1` 금지
- 그라데이션·블러 섀도 금지 (성공/실패 버튼 제외)
- 인라인 style 금지
