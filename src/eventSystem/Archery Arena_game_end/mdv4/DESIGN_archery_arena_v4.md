---
doc_generation: mdv4
condense_policy: forbidden
note: "v4는 mdv3와 별도 폴더. v5 diff용 — 절대 요약·삭제 금지."
ui_pixel_precision: "DESIGN·외부 팀. DEV는 json-render 슬롯·$state·DOM 순서·CSV SSoT만."
---

# Archery Arena — Design System
> Blank Paper Sketch + Neubrutalism

**Theme:** light

게임의 느낌은 흰 종이 위에 두꺼운 잉크로 그린 무술 대련장이다. 배경 페이퍼(#faf8f5), 잉크(#222222), 골드(#f5c842) 3색 기반. 그라데이션·블러 금지. 3px 잉크 테두리와 3px 하드 드롭 섀도가 Neubrutalism 질감을 만든다.

---

## 1. Visual Theme & Atmosphere

Blank Paper Sketch + Neubrutalism 테마. 흰 종이 위에 두꺼운 잉크 펜으로 그린 대련장 느낌. 3px 테두리와 하드 드롭 섀도가 물리적 질감을 만든다. 골드 강조색 하나가 Bullseye와 세트 배지에만 사용된다.

밀도: 중간. 헤더 + 화면 전환 구조. 각 화면은 한 가지 행동에 집중한다. 복잡한 장식 없이 기능적 요소만.

---

## 2. Color Palette & Roles

| Name | HEX | Token | Role |
|---|---|---|---|
| Ink | `#222222` | `--ink` | 텍스트·테두리·그림자 |
| Paper | `#faf8f5` | `--paper` | 배경·기본 지면 |
| Paper 2 | `#f5f0e8` | `--paper2` | 보조 배경·ghost 버튼 |
| Cream | `#ede8dc` | `--cream` | 앱 외곽 배경 |
| Surface | `#fffef9` | `--surface` | 헤더·카드·팝업 배경 |
| Gold | `#f5c842` | `--gold` | 강조·세트 배지·Bullseye |
| Gold 2 | `#ffd700` | `--gold2` | 1위·Bullseye 헤드라인 |
| Red | `#e84040` | `--red` | CENTER 적중 |
| Orange | `#e8a020` | `--orange` | MIDDLE 적중 |
| Brown | `#8b7355` | `--brown` | OUTER 적중 |
| Blue | `#1a6fd4` | `--blue` | 내 순위 강조 |

**원칙:** 그라데이션 금지. 블러 금지.

---

## 3. Typography Rules

**서체 3종:**
- **Primary:** `'Noto Sans KR', system-ui, sans-serif`
- **Display:** `'Black Han Sans', sans-serif`
- **Mono:** `'IBM Plex Mono', monospace`

| Role | Family | Size | Weight | 용도 |
|---|---|---|---|---|
| display_lg | display | 40px | 400 | Bullseye 헤드라인 |
| display_md | display | 26px | 400 | 화면 제목 |
| display_sm | display | 18px | 400 | 카드 제목 |
| header | display | 16px | 400 | 헤더 타이머 |
| body | primary | 13px | 900 | 본문 |
| stat_val | mono | 14px | 800 | 점수·순위 수치 |
| label_sm | primary | 12px | 800 | 라벨 |
| label_xs | primary | 11px | 800 | 소형 라벨 |
| stat_label | primary | 8px | 700 | 통계 항목명 |

---

## 4. Component Stylings

### #app (앱 컨테이너)
`max-width: 390px`, `max-height: 844px`, `background: #faf8f5`, `border: 3px solid #222`.
`height: 100dvh`. 외곽 body: `background: #ede8dc`, flex center, `min-height: 100dvh`.
⚠️ max-height 없으면 데스크탑에서 세로 무한 늘어남.

### .header-timer
`background: #fffef9`, `border-bottom: 3px solid #222`.
초기값: `'01:00'` 하드코딩 (동적 갱신 전 깜빡임 방지).
탭 시 reset_session 실행.

### #ranking-list (로비 순위표)
50행 스크롤. 내 행(is_me): `--blue` 배경 강조.
`scrollIntoView`로 내 행 자동 스크롤. `position: sticky` 금지.
순위 상승 시: `.rank-up` + `.score-up` 클래스 일시 적용.

### .attempt-card (도전 카드)
3종류 카드 (SINGLE/SET3/SET5).
선택 상태: `border-color: var(--gold)`, `background: #fffde0`.
재화 부족: `opacity: 0.4`, `pointer-events: none`.

**PRISM 연동 (2026-06-04):** 활대 0이어도 `.lobby-btn.bow-empty` 는 **클릭 가능**(disabled 아님).  
`#shooting-shot-badge` — 5발 연출 시 `2 / 5발` 형태, Neubrutalism 테두리 박스 (`style-ui.css`).
진입·취소 시 clearAttemptSelection() 필수.

### #canvas-container (활쏘기)
Three.js WebGL 마운트. 전체 화면 차지.
오버레이: `#hit-target-hud` (중앙 과녁 위 HUD만. 하단 결과 띠 금지).

### 과녁 (Three.js)
링 5개 동심원. `flashRing` 시 **색 lerp만 허용. scale 변경 금지.**
스케일: aa_visual_config.csv의 target_scale 기준.

### Bullseye 화면
풀스크린. `background: #222` 어두운 배경.
파티클 + 카운트업 0→100.
골드 타이포: `--gold2(#ffd700)`, `display_lg(40px)`.

### #jr-hud (json-render HUD 영역)
점수·순위·주사위 카운터 표시.
.header-timer 영역 또는 화면별 HUD 위치에 마운트.

---

## 5. Layout Principles

**DOM 순서 (위→아래, 변경 금지):**
```
body (background: #ede8dc, flex center)
  #app (max-width: 390px, max-height: 844px)
    .header-timer         ← ① 헤더 타이머
    [json-render]
      #jr-hud             ← ② 점수·순위·주사위 HUD
    .screen               ← ③ 화면 전환 영역
      #screen-entry
      #screen-lobby
      #screen-attempt
      #screen-shooting
        #canvas-container
        #hit-target-hud
      #screen-bullseye
      #screen-result
      #screen-reward
    #toast                ← position absolute, bottom
```

**겹침 방지 원칙:**
- .header-timer와 .screen은 normal flow(flex column).
- #toast만 position: absolute.
- #hit-target-hud는 #canvas-container 내부 absolute.

---

## 6. Depth & Elevation

하드 드롭 섀도. blur 항상 0.

| 요소 | Shadow | 효과 |
|---|---|---|
| 카드·버튼 | `3px 3px 0 #222` | Neubrutalism 입체감 |
| 강조 요소 | `4px 4px 0 #222` | 강한 입체감 |
| 탭 시 | `translate(2px, 2px)` + shadow 제거 | 눌리는 느낌 |

---

## 7. Animations

| ID | 트리거 | Duration | 설명 |
|---|---|---|---|
| AA-ANI-001 | 화살 비행 | arrow_flight_ms (CSV) | ease-out |
| AA-ANI-002 | rankRise 순위 상승 | 450ms | ease-out 슬라이드 |
| AA-ANI-003 | flashRing 과녁 색 | hit_ring_pulse_ms (CSV) | 색 lerp only |
| AA-ANI-004 | screenShake | 480ms | cubic-bezier(0.36,0.07,0.19,0.97) |
| AA-ANI-005 | hitHudPop | 380ms | ease-out |
| AA-ANI-006 | Bullseye 파티클 | bullseye_particle_duration_ms (CSV) | ease-out |
| AA-ANI-007 | Bullseye 카운트업 | bullseye_countup_ms (CSV) | linear |
| AA-ANI-008 | 트레일 페이드 | trail_fade_ms (CSV) | ease-out |

---

## 8. Responsive Behavior

모바일 우선. 390×844px 기준.

- body: flex center. #app이 화면 중앙에 위치.
- #app: max-width 390px, max-height 844px, height 100dvh.
- Three.js 렌더러 크기: #canvas-container getBoundingClientRect() 기준. window 금지.
- `renderer.setSize(w, h, false)` — false 필수.
- React `#root`: `height: 100%; display: flex; flex-direction: column` 필수.

---

## 9. Agent Prompt Guide

**색상 빠른 참조:**
- 배경: `#faf8f5`
- 잉크: `#222222`
- 앱 외곽: `#ede8dc`
- 헤더·카드: `#fffef9`
- 골드 강조: `#f5c842`
- 1위·Bullseye: `#ffd700`
- 내 순위: `#1a6fd4`

**CSS Custom Properties:**
```
--ink: #222222
--paper: #faf8f5
--paper2: #f5f0e8
--cream: #ede8dc
--surface: #fffef9
--gold: #f5c842
--gold2: #ffd700
--red: #e84040
--orange: #e8a020
--brown: #8b7355
--blue: #1a6fd4
--stroke-brut: 3px solid var(--ink)
--shadow: 3px 3px 0 var(--ink)
--shadow-lg: 4px 4px 0 var(--ink)
```

**Do:**
- `flashRing` 시 색 lerp만 허용
- `#root { height: 100%; display: flex; flex-direction: column; }` 필수
- `max-height: 844px` #app에 반드시 적용
- `renderer.setSize(w, h, false)` + canvas CSS 100%
- 순위표 내 행 스크롤: `scrollIntoView`
- 헤더 타이머 초기값: `'01:00'` 하드코딩
- 도전 카드 진입 시 clearAttemptSelection() 항상 호출
- 모든 스타일은 style-ui.css에서만

**Don't:**
- `flashRing`에서 `mesh.scale` 변경 금지
- 순위 행 `position: sticky` 금지
- 그라데이션·블러 금지
- 인라인 style 금지
- 봇에 `setInterval` 금지
- `#root` CSS 누락 금지
- `renderer.setSize(w, h, true)` 금지


---

## Appendix — style.css full (SSoT)

```css
@import './style-ui.css';
```
