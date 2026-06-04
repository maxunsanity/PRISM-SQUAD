---
doc_generation: mdv4
condense_policy: forbidden
note: "v4는 mdv3와 별도 폴더. v5 diff용 — 절대 요약·삭제 금지."
ui_pixel_precision: "DESIGN·외부 팀. DEV는 json-render 슬롯·$state·DOM 순서·CSV SSoT만."
---

# Prize Drop Arcade — Design System
> Blank Paper Sketch — Arcade

**Theme:** light

게임의 느낌은 빈티지 아케이드 머신을 종이 위에 스케치한 것이다. 밝은 페이퍼 배경(#f0f0e8) 위에 잉크(#1a1a1a) 테두리로 그린 핀볼 보드. 어두운 HUD 상단과 밝은 보드 영역이 대비를 만든다.

---

## Tokens — Colors

| Name | Value | Token | Role |
|---|---|---|---|
| Paper | `#f0f0e8` | `--bps-paper` | 빈티지 페이퍼 배경. 보드·카드 배경. |
| Ink | `#1a1a1a` | `--bps-ink` | 잉크 테두리·텍스트. HUD 상단 배경. |
| Gray | `#d1d1c1` | `--bps-gray` | 보조 그레이. 구분선·비활성 요소. |
| Slot Green | `#a0ff60` | — | 일반 슬롯 색상. |
| Jackpot Gold | `#ffd700` | — | 잭팟 슬롯 색상. |
| Milestone Blue | `#5ab0ff` | — | 마일스톤 게이지 채움. |
| Milestone Done | `#4cde6a` | — | 마일스톤 달성 마커. |
| Milestone BG | `#0c0c14` | — | 마일스톤 바 배경. |
| Board Outer | `#a0a090` | — | body 배경. |

---

## Tokens — Typography

### Outfit — 유일한 서체. · `--font-outfit`
- **Source:** Google Fonts
- **Substitute:** -apple-system, sans-serif
- **Role:** 모든 HUD 텍스트, 버튼 라벨, 보상 수치.

### Type Scale

| Role | Size | Weight | 용도 |
|---|---|---|---|
| 본문·HUD | 13px | 800 | 공 카운트·배수 수치 |
| 라벨 | 11px | 800 | 버튼 보조 텍스트 |
| 미니 라벨 | 9px | 800 | 마일스톤 마커 번호 |
| 보상 금액 | 48px | 900 | 모달 보상 수치 |

---

## Tokens — Spacing & Shapes

**고정 치수 (변경 금지):**
- `#prize-drop-root`: 366×646px
- `#game-viewport`: 360×396px (top: 110px, left: 3px)
- `.prizedrop-hud-top`: 110px
- `.prizedrop-board-spacer`: 396px
- `#slot-labels`: 50px

### Border

| Element | Value |
|---|---|
| #prize-drop-root | 3px solid #1a1a1a |
| .rw-card 모달 | 3px solid #1a1a1a |
| .btn-drop | 3px solid #1a1a1a |

### Border Radius

| Element | Value |
|---|---|
| #prize-drop-root | 24px |
| .rw-card 모달 | 20px |
| .btn-drop | 50% (원형) |
| .ms-track | 11px |

### Shadow

| Element | Value |
|---|---|
| .rw-card 모달 | `4px 4px 0px #000` |
| .btn-drop | `2px 2px 0px rgba(0,0,0,0.5)` |
| .prizedrop-status-panel | `0 4px 10px rgba(0,0,0,0.3)` |

---

## Components

### #prize-drop-root
366×646px 고정. 잉크 테두리 3px. border-radius 24px. overflow hidden.
배경 Paper(#f0f0e8). flex column.

### Three.js 보드 레이어 (#game-viewport)
position absolute, top 110px, left 3px. 360×396px.
OrthographicCamera — PerspectiveCamera 사용 금지. 보드 원근 왜곡 발생.
Y축: 위가 viewHeight, 아래가 0. scene 배경 #f0f0e8.
`canvas { pointer-events: auto !important }` — 누락 시 드롭 버튼 클릭 마비.

### Three.js 보드 렌더 방식

| 요소 | 색상 | 렌더 방법 |
|---|---|---|
| 핀 | 몸체 #d1d1c1 + 테두리 #1a1a1a | CircleGeometry × 2겹 |
| RewardCircle | 흰색 #ffffff + 테두리 #1a1a1a | CircleGeometry + RingGeometry |
| TriangleBumper | #1a1a1a 솔리드 | ShapeGeometry |
| Diamond | #1a1a1a 솔리드 | CircleGeometry(r,4) rotation.z=π/4 |
| Bumper(rect) | #1a1a1a 솔리드 | CircleGeometry(r,4) |
| 구분선 | #1a1a1a opacity 0.15 | PlaneGeometry |
| 구슬 | 본체 #e8e8e0 + 테두리 #1a1a1a | CircleGeometry + RingGeometry |

### .prizedrop-hud-top (110px)
배경 Ink(#1a1a1a). z-index 20. HUD 상단 머신 헤드 영역.
- `.prizedrop-status-panel`: 잉크 배경, 흰 텍스트. 공 카운트 + 배수 표시.
- `.machine-head-body`: 잉크 배경. border-radius 12px 12px 0 0.
- `.machine-head-bottom-line`: height 6px. Gray(#d1d1c1) 배경.

### .btn-drop (드롭 버튼)
width/height 32px. 원형. Paper(#f0f0e8) 배경. 잉크 테두리 3px.
shadow: `2px 2px 0px rgba(0,0,0,0.5)`.
active: translateY(2px) + shadow 제거.
**중심 X: 30/105/180/255/330px 고정 — simulationRunner dropX()와 반드시 동일.**

### #slot-labels (50px)
height 50px. 배경 #e8e8d8. border-top 1px solid Gray.
각 슬롯: flex 1. **01_slot_lightning.csv 데이터 기반 렌더. 하드코딩 금지.**

### .ms-wrap (마일스톤 바)
배경 #0c0c14. border-top 2px solid Gray. flex 1.
`.ms-track`: 배경 #0e0e1c. border-radius 11px. height 22px.
`.ms-fill`: 그라데이션 #3a7bd5→#5ab0ff. width transition 0.4s ease.
`.ms-mark--done .ms-mark-icon`: 배경 #4cde6a.

### .rw-card (보상 모달)
Paper(#f0f0e8) 배경. 잉크 테두리 3px. border-radius 20px.
shadow: `4px 4px 0px #000`.
등장: scale 0.7→1, 200ms, cubic-bezier(0.34,1.56,0.64,1).
잭팟 변형: border-color #f0c040, 배경 #fffff0.
완료 변형: border-color #4cde6a, 배경 #f0fff4.

---

## Surfaces

| Level | Name | Value | Purpose |
|---|---|---|---|
| 0 | Board Outer | `#a0a090` | body 배경 |
| 1 | Paper | `#f0f0e8` | 보드·카드 배경 |
| 2 | Slot Area | `#e8e8d8` | 슬롯 라벨 영역 |
| 3 | Milestone BG | `#0c0c14` | 마일스톤 바 배경 |
| 4 | HUD Dark | `#1a1a1a` | HUD 상단 배경 |

---

## Elevation

모달은 position absolute, z-index 500, rgba(0,0,0,0.55) dim 오버레이.
버튼은 탭 시 translateY(2px) + shadow 제거로 눌림 효과.
그림자는 blur 없는 하드 드롭 섀도만 사용.

---

## Animations

| ID | 트리거 | Duration | Easing | 상세 |
|---|---|---|---|---|
| PD-ANI-001 | 구슬 착지 sink | 280ms | ease-in | 슬롯 안으로 가속 흡수 |
| PD-ANI-002 | 보상원 bounce | 300ms | ease-out | scale 1→1.12(80ms)→1 |
| PD-ANI-003 | 보상원 ripple | 280ms | linear | scale 1→0 수축 |
| PD-ANI-004 | flash 오버레이 | 400ms | ease-out | opacity 0.8→0 |
| PD-ANI-005 | 모달 pop | 200ms | cubic-bezier(0.34,1.56,0.64,1) | scale 0.7→1 |
| PD-ANI-006 | overlay fade-in | 150ms | ease | opacity 0→1 |
| PD-ANI-007 | 마일스톤 게이지 | 400ms | ease | width transition |

---

## Layout

이 게임은 366×646px 고정 컨테이너다. 뷰포트 크기에 관계없이 항상 중앙 정렬.

```
body (background: #a0a090, flex center, height: 100vh)
  #prize-drop-root (366×646px, position: relative)
    [Three.js 레이어 — position: absolute, top:110px, left:3px]
      #game-viewport (360×396px)
    [json-render HUD 레이어 — position: absolute, inset: 0, flex column]
      .prizedrop-hud-top (110px, z-index: 20)
        .prizedrop-status-panel    ← 공 카운트 + 배수
        .prizedrop-machine-head    ← 드롭 버튼 5개
      .prizedrop-board-spacer (396px, pointer-events: none)
      #slot-labels (50px)
      .ms-wrap (flex: 1)
    [모달 레이어 — position: absolute, z-index: 500]
      .rw-overlay > .rw-card
```

Three.js(#game-viewport)와 json-render HUD는 별도 레이어. 혼합 금지.
.prizedrop-board-spacer는 pointer-events: none — 보드 클릭을 막으면 안 됨.

---

## Do's and Don'ts

### Do
- `#game-viewport canvas`에 `pointer-events: auto !important` 명시
- 드롭 버튼 중심 X를 30/105/180/255/330px 고정
- 보드 치수(366×646, 360×396) 절대 변경 금지
- 마일스톤 게이지에 `transition: width 0.4s ease` 적용
- SlotLabels는 반드시 CSV 기반 렌더
- 모든 스타일은 style.css에서만

### Don't
- PerspectiveCamera 사용 금지
- 보드 치수 임의 변경 금지
- SlotLabels 하드코딩 금지
- rect bumper(bump_0~5) 삭제 금지
- ValidationProvider 추가 금지 (3개 Provider만)
- 인라인 style 금지
- 그라데이션·blur 섀도 사용 금지 (하드 드롭 섀도만)

---

## Agent Prompt Guide

### 색상 빠른 참조
- 보드 배경: `#f0f0e8` (`--bps-paper`)
- 잉크: `#1a1a1a` (`--bps-ink`)
- 보조: `#d1d1c1` (`--bps-gray`)
- 잭팟: `#ffd700`
- 마일스톤: `#5ab0ff`
- 마일스톤 달성: `#4cde6a`
- 마일스톤 바 배경: `#0c0c14`
- body 배경: `#a0a090`

### CSS Custom Properties 목록
`--bps-paper`, `--bps-ink`, `--bps-gray`, `--font-outfit`


---

## Appendix — style.css full (SSoT)

```css
/* [V5.0: The Flash & Hidden Reward] 🔞💋 */
:root {
  --bps-paper: #f0f0e8;
  --bps-ink: #1a1a1a;
  --bps-gray: #d1d1c1;
  --font-main: 'Outfit', -apple-system, sans-serif;
}

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  background-color: #a0a090;
  font-family: var(--font-main);
  overflow: hidden;
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
}

#prize-drop-root {
  position: relative;
  width: 366px;
  height: 646px;
  background-color: var(--bps-paper);
  border: 3px solid var(--bps-ink);
  border-radius: 24px;
  box-shadow: 0 30px 60px rgba(0,0,0,0.3);
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

/* 1. Top UI Area */
.prizedrop-hud-top {
  height: 110px;
  width: 100%;
  position: relative;
  z-index: 20;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: center;
  padding-top: 5px;
}

/* 2. The Machine Area (Fullscreen by default) */
#machine-area {
  flex: 1;
  width: 100%;
  position: relative;
  z-index: 1;
  background-color: var(--bps-paper);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

#game-viewport {
  flex: 1;
  width: 100%;
  overflow: hidden;
}

#game-viewport canvas {
  display: block;
  width: 100% !important;
  height: 100% !important;
}

#slot-labels {
  height: 50px;
  width: 100%;
  display: flex;
  background: rgba(0,0,0,0.03);
  z-index: 5;
  cursor: pointer;
}

/* 3. Bottom Reward UI (Hidden underneath) */
#bottom-reward-ui {
  height: 120px; /* 항상 고정 표시 */
  width: 100%;
  background-color: #2c2c34;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  z-index: 10;
  color: white;
  overflow: hidden;
}

/* The Flash Effect Overlay */
#flash-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: white;
  z-index: 1000;
  opacity: 0;
  pointer-events: none;
}

#flash-overlay.active {
  animation: flash-anim 0.4s ease-out;
}

@keyframes flash-anim {
  0% { opacity: 0.8; }
  100% { opacity: 0; }
}

/* ── Paper Status Panel (Dark Version) ── */
.prizedrop-status-panel {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 12px;
  background: var(--bps-ink); /* 진한 잉크색 */
  border: 2px solid var(--bps-gray);
  padding: 5px 12px;
  border-radius: 12px;
  box-shadow: 0 4px 10px rgba(0,0,0,0.3);
  z-index: 25;
  margin-bottom: 2px;
  color: white; /* 텍스트는 흰색으로 */
}

/* ── Paper Machine Head (Dark Version) ── */
.prizedrop-machine-head {
  width: 360px; /* 보드 너비와 동일하게 */
  position: relative;
  z-index: 21;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.machine-head-body {
  width: 100%;
  background: var(--bps-ink); /* 진한 잉크색 */
  border: 2px solid var(--bps-ink);
  border-radius: 12px 12px 0 0;
  padding: 8px 20px 6px; /* 하단 패딩 대폭 축소 */
  box-shadow: 0 4px 12px rgba(0,0,0,0.4);
}

.machine-head-bottom-line {
  width: 100%;
  height: 6px;
  background: var(--bps-gray); /* 구분선은 밝게 */
  border-bottom: 2px solid var(--bps-ink);
}

/* 드롭 버튼 & 런처 */
#jr-overlay-buttons {
  display: flex;
  justify-content: space-between;
  width: 100%;
  align-items: center;
}

.drop-launcher {
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
}

.btn-drop {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: var(--bps-paper);
  border: 3px solid var(--bps-ink);
  cursor: pointer;
  box-shadow: 2px 2px 0px rgba(0,0,0,0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 2;
  transition: transform 0.1s;
}

.btn-drop:active:not(:disabled) { transform: translateY(2px); box-shadow: 0px 0px 0px #000; }
.btn-drop:disabled { opacity: 0.45; cursor: not-allowed; box-shadow: none; }
.btn-drop::after { content: '▼'; font-size: 10px; font-weight: 900; color: var(--bps-ink); }

/* 런처 배출구 (Spout) — 길이를 아주 짧게 조절 */
.launcher-spout {
  width: 14px;
  height: 6px;
  background: var(--bps-paper);
  border-left: 2px solid var(--bps-ink);
  border-right: 2px solid var(--bps-ink);
  border-bottom: 2px solid var(--bps-ink);
  margin-top: -2px;
  z-index: 1;
}

/* 공 카운트 & 배수 미세 조정 */
.ball-hud {
  display: flex;
  align-items: center;
  gap: 5px;
  background: rgba(255,255,255,0.1); /* 어두운 배경에 맞게 투명감 */
  border: 1.5px solid var(--bps-gray);
  border-radius: 8px;
  padding: 2px 8px;
}
.ball-icon { font-size: 13px; }
.ball-count { font-size: 13px; font-weight: 900; color: white; }
.btn-add-balls {
  background: var(--bps-gray);
  color: var(--bps-ink);
  border: none;
  border-radius: 4px;
  padding: 1px 6px;
  font-size: 9px;
  font-weight: 900;
  cursor: pointer;
}

.multiplier-circle {
  width: 30px;
  height: 30px;
  background: var(--bps-gray);
  color: var(--bps-ink);
  border: 1px solid var(--bps-ink);
  border-radius: 6px;
  display: flex;
  justify-content: center;
  align-items: center;
  font-weight: 900;
  font-size: 11px;
  cursor: pointer;
}

/* 공 없음 경고 토스트 */
.ball-warning { position: absolute; bottom: 140px; left: 50%; transform: translateX(-50%); background: #1a1a1a; color: white; font-size: 11px; font-weight: 800; padding: 8px 16px; border-radius: 50px; white-space: nowrap; z-index: 200; animation: rw-fade-in 0.15s ease; font-family: var(--font-main); }

/* 슬롯 3D 느낌 (적당한 깊이감) */
#slot-labels {
  height: 50px;
  width: 100%;
  display: flex;
  background: #e8e8d8; /* 보드보다 살짝 어둡게 */
  border-top: 1px solid var(--bps-gray); /* 두꺼운 검정 대신 얇은 회색으로 */
  box-shadow: inset 0 5px 10px rgba(0,0,0,0.1); 
  z-index: 5;
  cursor: pointer;
}

.slot-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  border-left: 1px solid rgba(0,0,0,0.15);
  box-shadow: inset 1px 0 3px rgba(255,255,255,0.4); /* 각 슬롯 경계 입체감 */
}

/* ── HUD Layout (json-render) ──────────────────────────────── */
.prizedrop-hud-root {
  width: 100%;
  height: 646px;
  display: flex;
  flex-direction: column;
  position: relative;
}

.prizedrop-hud-top {
  height: 110px;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: center;
  padding: 5px 0 0; /* 상단 패딩 최소화 */
  z-index: 20;
}

.prizedrop-controls-row {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 10px;
}

.prizedrop-board-spacer {
  height: 396px;
  flex-shrink: 0;
  pointer-events: none;
}

/* ── Milestone Bar ─────────────────────────────────────────── */
.ms-wrap {
  width: 100%;
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 0 0 0;
  gap: 8px;
  background: #0c0c14;
  border-top: 2px solid var(--bps-gray);
  flex: 1;
}

.ms-row {
  width: 100%;
}

/* +N 배지 — absolute로 트랙 위에 오버레이 */
.ms-gain {
  position: absolute;
  left: 6px;
  top: 12px;
  height: 22px;
  display: flex;
  align-items: center;
  gap: 2px;
  opacity: 0;
  transition: opacity 0.2s ease;
  z-index: 5;
  pointer-events: none;
}
.ms-gain--on { opacity: 1; }
.ms-gain-arrow { color: #4cde6a; font-size: 12px; line-height: 1; }
.ms-gain-num { color: #4cde6a; font-size: 12px; font-weight: 900; letter-spacing: -0.5px; }

/* 트랙 — 좌우 대칭을 위해 고정 폭과 margin 사용 */
.ms-track {
  width: calc(100% - 22px); /* 양쪽 11px 여백 — 끝 마커 overflow 공간 확보 */
  margin: 0 11px;
  flex-shrink: 0;
  position: relative;
  height: 22px;
  background: #0e0e1c;
  border-radius: 11px;
  overflow: visible;
  border: 1px solid rgba(255,255,255,0.12);
}

/* 채움 */
.ms-fill {
  position: absolute;
  top: 0;
  left: 0;
  height: 100%;
  background: linear-gradient(90deg, #3a7bd5, #5ab0ff);
  border-radius: 11px;
  transition: width 0.4s ease;
  min-width: 22px;
}

/* 마커 */
.ms-mark {
  position: absolute;
  top: 50%;
  transform: translate(-50%, -50%);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0;
  z-index: 2;
}

.ms-mark-icon {
  width: 22px;
  height: 22px;
  background: #3a3a4e;
  border: 1.5px solid rgba(255,255,255,0.15);
  border-radius: 5px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 11px;
  line-height: 1;
  box-shadow: 0 1px 3px rgba(0,0,0,0.4);
}
.ms-mark-icon--tap {
  cursor: pointer;
}
.ms-mark-icon--tap:active {
  transform: scale(0.92);
}

.ms-mark--done .ms-mark-icon {
  background: #4cde6a;
  border-color: #2eb84e;
  color: #1a1a1a;
  font-size: 10px;
  font-weight: 900;
}

.ms-mark-num {
  font-size: 7px;
  font-weight: 800;
  color: rgba(255,255,255,0.5);
  margin-top: 3px;
  white-space: nowrap;
}

.ms-mark--done .ms-mark-num { color: #4cde6a; }

/* 보상 카운트 */
.ms-count {
  font-size: 9px;
  font-weight: 800;
  color: rgba(255,255,255,0.4);
  letter-spacing: 1px;
  text-transform: uppercase;
  text-align: center;
  width: 100%; /* 너비 확보 후 센터링 */
}
.ms-cycle-badge {
  display: inline-block;
  margin-left: 6px;
  background: #4cde6a;
  color: #1a1a1a;
  font-size: 8px;
  font-weight: 900;
  padding: 1px 5px;
  border-radius: 4px;
  vertical-align: middle;
}

/* ── Reward Modal ──────────────────────────────────────────── */
.rw-overlay {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.55);
  z-index: 500;
  display: flex;
  align-items: center;
  justify-content: center;
  animation: rw-fade-in 0.15s ease;
}

@keyframes rw-fade-in {
  from { opacity: 0; }
  to   { opacity: 1; }
}

.rw-card {
  background: var(--bps-paper);
  border: 3px solid var(--bps-ink);
  border-radius: 20px;
  padding: 28px 36px 22px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  box-shadow: 4px 4px 0px #000;
  animation: rw-pop 0.2s cubic-bezier(0.34, 1.56, 0.64, 1);
  min-width: 200px;
}

.rw-card--jackpot {
  border-color: #f0c040;
  box-shadow: 4px 4px 0px #c09000;
  background: #fffff0;
}

@keyframes rw-pop {
  from { transform: scale(0.7); opacity: 0; }
  to   { transform: scale(1);   opacity: 1; }
}

.rw-icon   { font-size: 40px; line-height: 1; }
.rw-icon--tap { cursor: pointer; }
.rw-icon--tap:active { transform: scale(0.94); }
.rw-label  { font-size: 13px; font-weight: 800; color: var(--bps-ink); margin-top: 4px; }
.rw-amount { font-size: 48px; font-weight: 900; color: var(--bps-ink); line-height: 1.1; }
.rw-unit   { font-size: 12px; font-weight: 700; color: #666; }

.rw-card--complete {
  border-color: #4cde6a;
  box-shadow: 4px 4px 0px #2eb84e;
  background: #f0fff4;
}

.rw-label--complete {
  font-size: 15px;
  text-align: center;
  line-height: 1.4;
}

.rw-close {
  margin-top: 14px;
  padding: 7px 28px;
  background: var(--bps-ink);
  color: #fff;
  border: none;
  border-radius: 50px;
  font-size: 13px;
  font-weight: 800;
  cursor: pointer;
  font-family: var(--font-main);
}
```
