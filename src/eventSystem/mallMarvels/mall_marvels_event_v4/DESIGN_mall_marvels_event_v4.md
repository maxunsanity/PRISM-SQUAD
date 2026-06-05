---
doc_generation: mdv4
condense_policy: forbidden
note: "v4는 mdv3와 별도 폴더. v5 diff용 — 절대 요약·삭제 금지."
ui_pixel_precision: "DESIGN·외부 팀. DEV는 json-render 슬롯·$state·DOM 순서·CSV SSoT만."
---

# 쇼핑몰의 경이로움 — DESIGN.md (UI/UX 재현 명세)

> **문서 역할:** 세일 탭 셸 · 모달 오버레이의 **레이아웃·스타일·상태 경로 재현 SSoT**
> **기획·밸런스:** [`GAME.md`](./GAME.md) · **구현·연동:** [`DEV.md`](./DEV.md)
> 모든 값은 실제 소스에서 검증 — 추론 0.

---

## 0. 화면 레이어 구조 (z-index)

`App.tsx` 의 절대 배치 레이어 (검증: `App.tsx`):

| 레이어 | z-index | 비고 |
|--------|---------|------|
| 공통 상단 바 | 55 | 로비/상점/이벤트 위 |
| 이벤트 오버레이 컨테이너 (`SalesEventOverlay` 래퍼) | **48** (평소) → **62** (`salesModalOpen` 시 승격) | `zIndex: salesModalOpen ? 62 : 48` |
| `MallMarvelsModal` 자체 | **62** | 모달 dim + 카드 |
| 토스트 | 60 / 63 | `ToastOverlay` |
| iframe 미니게임 | 520 / 63 | 쇼핑몰 진입 시 자동 닫힘 |

- `salesModalOpen = Boolean(mallSnap['/mallMarvels/modalOpen'] || driversSnap['/driversJoy/modalOpen'])`.
- 모달이 열리면 컨테이너가 z62 로 올라가 탭과 모달이 한 레이어 위로 묶임.

---

## 1. 왼쪽 세일 사이드 탭 (셸)

컴포넌트: `SalesEventOverlay` → `SalesSideTab` (검증: `SalesEventOverlay.tsx`)

### 1-1. 배치·스택

| 항목 | 값 | 근거 |
|------|-----|------|
| 위치 | `position: absolute; left: 0` | `SalesSideTab` |
| 셸 스타일 | `eventSideTabShellStyleLeft({ transition, zIndex: 48 })` | `eventHudLayout.ts` |
| top 좌표 | `eventSideTabStackTopPx(battleLobby, salesLeftTabStackIndex(tab, opts))` px | 스택 계산 |
| 스택 순서 | `mall` = index 0, `drivers` = mall 표시 시 index 1 | `salesLeftTabStackIndex` |
| 분리 | 라바/퍼즐·시즌 탭은 **오른쪽** 별도 스택 — 겹치지 않음 | 설계 분리 |

`eventSideTabShellStyleLeft` 실제 반환 스타일 (재현 값):

```text
width: SIDE_TAB_W
minHeight: EVENT_CAPSULE_BODY_MIN_H + 28
background: #F4EFE6
borderRadius: 0 12px 12px 0
border: 3px solid #000000   (borderLeft: none)
boxShadow: 3px 3px 0 #000000
padding: 8px 6px 8px 4px
textAlign: center
fontFamily: "Segoe UI", Roboto, Helvetica, Arial, sans-serif
```

### 1-2. 탭 내부 (아이콘·라벨·뱃지·점)

| 요소 | 스펙 |
|------|------|
| 아이콘 원 | `44×44`, `borderRadius 50%`, `border 3px #000`, `boxShadow 1.5px 1.5px 0 #000`, 배경 `bg` |
| 쇼핑몰 배경 | `#FFB6C1` |
| 아이콘 본체 | 인라인 SVG `ShoppingBagIcon` (쇼핑백, 몸체 `#FF8A80`) — **emoji 아님** (🛍️은 개념 라벨) |
| 라벨 | `"쇼핑몰"`, fontSize 9, fontWeight 900, color #000 |
| 뱃지 | `mallTimer || '—'`, 흰 배경 + `border 2px #000` + `boxShadow 1px 1px 0 #000`, minWidth 32 |
| 알림 점 | `dot = mallSnap['/mallMarvels/hasFreeClaim']`. `10×10` 원, `#FF4455`, `border 2px #000`, 좌상단 `top:-2 left:-2` |
| hover | `transform: scale(1.05)` (mouseEnter), `scale(1)` (mouseLeave) |
| 클릭 | `mallCtrl?.openModal()` |

### 1-3. 가시 조건

```text
showMall   = Boolean(hud['/lobby/showMallMarvels'])
battleLobby = isBattleLobbyHud(hud)
탭 렌더 = battleLobby && showMall   (&& 둘 중 하나라도 표시될 때 컨테이너 활성)
```

- 비전투 로비거나 둘 다 OFF면 탭은 안 그리고 **모달만 마운트** (조건 분기 양쪽 모두 `<MallMarvelsModal>` 포함).

---

## 2. 메인 모달 (`MallMarvelsModal`)

컴포넌트: `mallMarvels/jsonRender/MallMarvelsModal.tsx`. 표시 게이트: `snap['/mallMarvels/modalOpen']`.

### 2-1. 오버레이·컨테이너

| 영역 | 스펙 |
|------|------|
| dim | `position: absolute; inset: 0; zIndex: 62; background: rgba(0,0,0,0.5)`, 가운데 정렬, 클릭 시 `close()` |
| 패널 | `width 92% / maxWidth 340 / maxHeight 88%`, `flexDirection column` |
| 패널 테두리 | `borderRadius 8`, `border 3px #000`, `background #F4EFE6` (베이지), `boxShadow 4px 4px 0 #000`, `overflow hidden` |
| close 차단 | 패널 `onClick` 에 `stopPropagation` (바깥 클릭만 닫힘) |

### 2-2. 헤더

| 요소 | 스펙 |
|------|------|
| 배경 | `#B388FF` (보라), `borderBottom 3px #000`, `flexShrink 0` |
| 타이틀 | `snap['/mallMarvels/title']`, fontWeight 900, fontSize 18, 가운데 |
| 타이머 | `⏱ {snap['/mallMarvels/timerText']}`, fontSize 11, fontWeight 900 |
| X 버튼 | 우상단 `26×26`, `borderRadius 6`, `border 2px #000`, 배경 `#F4EFE6`, `boxShadow 2px 2px 0 #000` → `close()` |

### 2-3. 본문 (스크롤 영역)

| 요소 | 스펙 |
|------|------|
| 컨테이너 | `flex:1; overflow:auto; padding 12px 12px 4px; minHeight 0` |
| intro 박스 | `snap['/mallMarvels/introTip']`, fontSize 11, fontWeight 900, 가운데, 배경 `#E8DFD1`, `border 2px #000`, `borderRadius 8`, `boxShadow 2px 2px 0 #000` |
| 카드 리스트 | `snap['/mallMarvels/steps']` 순회, 카드 사이 `↓` (fontSize 16, fontWeight 900), 마지막은 `height 4` 스페이서 |

---

## 3. 스텝 카드 (`StepCard`)

상태: `step.lock_state` = `LOCKED | AVAILABLE | CLAIMED` (store `MallStepView`).

### 3-1. 카드 셸

| 항목 | 값 |
|------|-----|
| 박스 | `width 100%`, `borderRadius 10`, `border 3px #000`, 배경 `step.card_color` (CSV), `padding 10px 10px 8px`, `boxShadow 3px 3px 0 #000` |
| LOCKED opacity | `0.55` (그 외 `1`) |
| 보상 칩 영역 | `flexWrap; gap 6; justify center; minHeight 36` |

### 3-2. 보상 칩

- 원본 = `step.reward_labels[]` (예: `⚡ 35`, `🪙 35.4K`, `📦 군자원상자`).
- 칩 스타일: 흰 배경, `border 2px #000`, `borderRadius 6`, `padding 4px 8px`, `boxShadow 1px 1px 0 #000`, fontSize 13, fontWeight 900.
- 아이콘: `renderSketchReward(label)` 가 첫 토큰의 이모지(⚡🪙📦🎁⚔️/`장비`)를 **인라인 SVG 스케치**로 치환하고 나머지를 텍스트로. 매칭 없으면 라벨 그대로.

### 3-3. CTA 버튼

| lock_state | 문구 | 배경 | cursor | boxShadow |
|------------|------|------|--------|-----------|
| `CLAIMED` | `수령 완료` | `#E8DFD1` | not-allowed (disabled) | none |
| `LOCKED` | `🔒 잠김` | `#cccccc` | not-allowed (disabled) | none |
| `AVAILABLE` | `step.button_label` | `#3DDC84` (녹색) | pointer | `2px 2px 0 #000` |

- 공통: `width 100%`, `marginTop 8`, `padding 9px 0`, `borderRadius 8`, `border 2px #000`, color #000, fontWeight 900, fontSize 15.
- `button_label` (컨트롤러 `buttonLabel`): override 있으면 그대로 / `FREE`→`무료` / `GEMS`→`💎 N` / `CASH_KRW`→`₩N`(천단위 콤마).
- 클릭(AVAILABLE만): `onClaim(step.step_id)` → `getMallMarvelsController()?.claimStep(id)`.

---

## 4. 보상 팝업 (토스트)

전용 모달이 아니라 **로비 공통 토스트** 재사용 (검증: `MallMarvelsController.claimStep`).

| 트리거 | 메시지 (`lobby:toast` CustomEvent) |
|--------|-----------------------------------|
| 잠김 단계 클릭 | `아직 받을 수 없습니다` |
| 기간 종료 | `이벤트가 종료되었습니다` |
| 보석 부족 | `보석 부족 (필요 💎{gem_cost})` |
| 캐시 부족 | `캐시 부족 · 상점에서 테스트 캐시 충전` |
| 수령 성공 | `host.grantRewards(lines)` 반환 요약 (`⚡35 · 🪙80,000 …`), 비면 `보상을 받았습니다` |

- 토스트는 `ToastOverlay` (z60/63) 가 렌더. 모달은 닫히지 않고 카드가 즉시 `CLAIMED` 로 갱신(`refresh()`).

---

## 5. 상태 경로 (UI ↔ store)

`mallMarvelsStore` (검증: `store.ts`) — `hudExternalStore` 와 분리. `/lobby/showMallMarvels` 만 hud.

| 경로 | 타입 | UI 소비처 |
|------|------|-----------|
| `/mallMarvels/modalOpen` | boolean | 모달 마운트 게이트 |
| `/mallMarvels/timerText` | string | 헤더 ⏱ · 탭 뱃지 |
| `/mallMarvels/title` | string | 헤더 타이틀 |
| `/mallMarvels/introTip` | string | 본문 안내 박스 |
| `/mallMarvels/steps` | `MallStepView[]` | 카드 리스트 |
| `/mallMarvels/hasFreeClaim` | boolean | 탭 빨간 알림 점 |
| `/lobby/showMallMarvels` (hud) | boolean | 탭 가시 토글 (햄버거 메뉴) |

---

## 6. 재현 체크리스트 (외부 팀)

- [ ] 왼쪽 탭: `left:0`, 셸 `eventSideTabShellStyleLeft`, 아이콘 SVG + 원형 `#FFB6C1`, 뱃지=타이머, 점=`hasFreeClaim`
- [ ] 모달 dim z62 / 패널 베이지 `#F4EFE6` 검정 3px / 헤더 보라 `#B388FF`
- [ ] 카드 배경=CSV `card_color`, LOCKED opacity 0.55, CTA 3색(`#3DDC84`/`#E8DFD1`/`#cccccc`)
- [ ] 보상 칩 흰 배경 + SVG 스케치 아이콘 + `↓` 사이 화살표
- [ ] 모든 상태는 `mallMarvelsStore` 경유, 재화·grant는 `SalesHostBridge` 만 호출
