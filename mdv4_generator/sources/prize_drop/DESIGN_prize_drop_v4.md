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
