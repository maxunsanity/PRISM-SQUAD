---
identity:
  name: PRISM SQUAD
  doc_type: DESIGN
  scope: "비주얼 시스템 전체 — 색상·폰트·컴포넌트·레이아웃·애니메이션"
---

# PRISM SQUAD — DESIGN.md

> **대상**: UI 개발자 · AI 에이전트  
> **코드 연동**: `src/DEV.md`  
> **게임 기획**: `src/GAME.md`

---

## 1. Visual Theme & Atmosphere

| 항목 | 값 |
|------|-----|
| 장르 무드 | 네온 사이버펑크 + 탑뷰 슈터 |
| 배경 기조 | 짙은 남보라 (`#1a1a2e`) — 우주·심해 느낌 |
| 강조 기조 | 형광 청록 (`#7BE8F4`) — 사이버 에너지 |
| 위험/데미지 | 형광 빨강-분홍 (`#FF6680`) |
| 골드/보상 | 금색 (`#FFD600`, `#FFB347`) |
| 전체 분위기 | 어둡고 빠름. 글로우·네온 효과 우선. 파스텔·밝은 배경 금지 |

---

## 2. Color Palette & Roles

### 기본 팔레트

| 역할 | hex | 사용처 |
|------|-----|--------|
| 배경 베이스 | `#1a1a2e` | 게임 배경, 모달 배경 |
| 배경 딥 | `#0c1118` | 패널 내부, 카드 배경 |
| 배경 미드 | `#121620` | 사이드탭, 보조 패널 |
| 강조 청록 | `#7BE8F4` | 로딩 텍스트, 플레이어 HUD 포인트 |
| 강조 사이안 | `#00F0FF` | 내 순위 행, 플레이어 하이라이트 |
| 위험/HP | `#FF6680` | 에러, HP 바 위험 구간 |
| 골드 | `#FFD600` | 골드 수치, 보상 라벨, 상위 순위 |
| 골드 서브 | `#FFB347` | 버튼, 확인 CTA |
| 흰색 텍스트 | `#FFFFFF` | 주요 수치, 타이틀 |
| 보조 텍스트 | `#b0bec5` | 설명, 서브 라벨 |
| 오버레이 | `rgba(0,0,0,0.55)` | 모달 백드롭 |

### 시스템 색상

| 시스템 | 색 |
|--------|-----|
| EXP 바 | `#4fc3f7` (청색) |
| HP 바 | `#66BB6A` (녹색) → `#FF6680` (30% 이하) |
| 보스 HP | `#FF6680` |
| 골드 | `#FFD600` |
| 킬 카운트 | `#7BE8F4` |
| 레벨 | `#FFFFFF` |

---

## 3. Typography Rules

| 용도 | 크기 | 굵기 | 색 |
|------|------|------|-----|
| 타이틀 (모달 헤더) | 20~24px | 900 | `#fff` |
| 서브타이틀 | 14~16px | 700 | `#FFD600` or `#fff` |
| 수치 (HP·레벨·점수) | 14~18px | 900 | 역할별 색 |
| 본문·설명 | 11~13px | 400~700 | `#b0bec5` |
| 라벨·배지 | 9~11px | 900 | `#fff` |
| 버튼 텍스트 | 14~16px | 900 | `#fff` or `#222` |

- 폰트 패밀리: `-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif`
- `letter-spacing`: 타이틀에 0.5~1px, 배지에 0.5px
- 수치·점수는 반드시 `fontWeight: 900` — 네온 느낌 유지

---

## 4. Component Stylings

### 모달 (기본형)

```
background: linear-gradient(180deg, #1b2336 0%, #0c1118 100%)
border-radius: 16~18px
border: 3~4px solid [테마 색]
box-shadow: 0 12px 32px rgba(0,0,0,0.85), 0 0 16px [테마 글로우]
color: #fff
```

### 버튼 (주요 CTA)

```
background: linear-gradient(180deg, #FFB347 0%, #F57C00 100%)
border-radius: 10~12px
border: none
box-shadow: 0 3px 0 #B26A00, 0 3px 8px rgba(245,124,0,0.2)
color: #fff / #222
fontWeight: 900
padding: 10px 28px
```
- 눌림 효과: `translateY(2px)` + `box-shadow 0 1px 0`

### 닫기 버튼 (X)

```
width/height: 26~28px, border-radius: 50%
border: 2px solid rgba(255,255,255,0.4)
background: rgba(0,0,0,0.4)
color: #fff, fontWeight: 900
hover: border-color #fff, background rgba(255,255,255,0.1)
```

### 아바타/랭크 셀

```
background: hsl(H, 50~55%, 35~45%)  ← 이름 기반 해시 색
border-radius: 0 (스퀘어 스타일) or 50% (원형)
border: 1.5px solid rgba(255,255,255,0.2)
```

### 진행 바

```
track: background rgba(0,0,0,0.4), border-radius: 4px, height: 6~8px
fill:  background [역할 색], border-radius: 동일
```

### 배지 / 칩

```
background: rgba(0,0,0,0.6)
border-radius: 6px
border: 1px solid rgba(255,213,79,0.3)
padding: 2px 6px
fontSize: 10~11px, fontWeight: 900
```

### 사이드탭 (우측 고정)

```
width: 64px
border-radius: 12px 0 0 12px
border: 3px solid [테마 색], border-right: none
box-shadow: 0 0 12px [테마 글로우 rgba]
padding: 8px 4px 8px 6px
transition: transform 0.2s ease-in-out
hover: scale(1.05)
```

---

## 5. Layout Principles

### 뷰포트

- **9:16 고정** (모바일 세로 기준). JS로 계산해서 캔버스·래퍼에 px 고정.
- 바깥: `#000` 레터박스. 게임 영역만 9:16.
- `overflow: hidden` 필수 — 스크롤 없음.

### z-index 레이어 (절대 순서)

| z | 용도 |
|---|------|
| 0 (Three.js) | 게임 캔버스 |
| 10 | 상단 HUD TopBar |
| 11 | 이벤트 HUD (인게임) |
| 30 | 게임 모달 (스킬선택·결과화면 등) |
| 40 | 이벤트 HUD (로비) |
| 50 | 이벤트 오버레이 백드롭 |
| 60 | 이벤트 모달 |
| 80 | 이벤트 보상 팝업 (최상위) |
| 9999 | 화면 회전 안내 |

### DOM 배치 순서 (App.tsx 기준)

1. `<canvas>` — Three.js 렌더
2. TopBar (z:10, `position: absolute, top:0`)
3. 이벤트 HUD 상단 캡슐 (z:11~40)
4. 이벤트 HUD 우측 탭 (z:11~40)
5. 이벤트 모달 레이어 (z:60)
6. 게임 모달 레이어 (z:30)
7. ToastOverlay

**규칙**: 이벤트 레이어와 게임 레이어는 절대 같은 z-index 공유 금지.

---

## 6. Depth & Elevation

| 레벨 | 표현 |
|------|------|
| 바닥 (게임월드) | Three.js z축 -2.0 ~ -1.2 |
| 인게임 오브젝트 | z 0.5~8.0 (z축 체계는 DEV.md 참조) |
| HUD (flat) | `position: absolute`, box-shadow 없음 |
| 패널/사이드탭 | `box-shadow: 0 0 12px [글로우]` |
| 모달 | `box-shadow: 0 12px 32px rgba(0,0,0,0.85)` |
| 최상위 팝업 | 추가 `0 0 24px [강조 글로우]` |

---

## 7. Animations

### CSS 클래스 (style.css 정의)

| 클래스 | 용도 |
|--------|------|
| `.prism-idle-char` | 장비 화면 캐릭터 상하 float (1.6s ease-in-out) |
| `.prism-gun-spin` | 장비 화면 총 5초 스핀 |
| `.equip-lv-vfx-*` | 장비 레벨업 파티클 VFX 세트 |
| `.event-fly-tycoon` | 이벤트 재화 파티클 → 상단 바 |
| `.event-fly-season` | 이벤트 재화 파티클 → 우측 탭 |

### 인터랙션 규칙

- 버튼 눌림: `translateY(2px)` + `box-shadow` 줄이기 (0.1s)
- 탭/사이드탭 hover: `scale(1.05)` (0.2s ease-in-out)
- 모달 등장: 별도 애니메이션 없음 — `visible` 상태로 즉시 표시
- 파티클 비행: 0.85s ease-in, `animation-fill-mode: forwards`

---

## 8. Responsive Behavior

- **세로(Portrait) 전용**. 가로 감지 시 "세로 화면으로 회전" 안내 표시.
- 뷰포트 변화: 캔버스·카메라만 갱신 (게임 재시작 없음).
- 폰트 크기는 **px 고정** — vw/vh 단위 사용 금지 (9:16 고정 뷰포트에서 vw = px 동일).
- 이벤트 HUD 위치: 로비/인게임 상태에 따라 JS로 `top` 값 전환 (CSS 반응형 아님).

---

## 9. Agent Prompt Guide

### Do

- 색은 반드시 위 팔레트에서 선택. 임의 색 추가 금지.
- 모달 배경은 항상 `linear-gradient(180deg, #1b2336, #0c1118)` 기반.
- 버튼은 반드시 `border: none` + `box-shadow` 눌림 효과 포함.
- 아이콘 없는 상태는 `fallback_text` 이모지 표시 (`EventIcon` 컴포넌트 활용).
- 새 컴포넌트는 `position: absolute` + 명시적 z-index.

### Don't

- `MeshStandardMaterial` (Three.js) — `MeshBasicMaterial`만 사용.
- 밝은 배경(`#fff`, `#f5f5f5` 등) — 네온 무드 파괴.
- `border-radius: 50%`를 순위 행 아바타에 적용 — 스퀘어 스타일은 `border-radius: 0`.
- 이벤트 state를 `/hud/*`에 추가 — `/event/*` 경로만 사용.
- 새 컴포넌트에서 `hudExternalStore` import — `eventExternalStore`만.

---

## 10. 화면별 UI 레이아웃 (Screen-by-Screen — 재현 SSoT)

> **이 절은 AI 재현의 1순위 정보다.** 각 화면의 "트리거 / 컨테이너 / z-index / 구성요소(위치·바인딩) / 렌더 컴포넌트"를 코드(`App.tsx`·`prismHudSpec.ts`·`registry.tsx`·`operationalUi.ts`·`NavTabBar.tsx`) 기준으로 명시한다. **추측 금지 — 이 표대로 배치하면 동일 화면이 나온다.**

### 10.0 렌더 골격 (PrismHudRenderer 3슬롯)

전체 HUD는 `PrismHudRenderer`가 `prismHudSpec`의 element를 **3개 슬롯**으로 분배해 렌더한다. App.tsx는 이 렌더러를 3번(`slot="top"`, `slot="bar"`, `slot="modal"`) 마운트한다.

| 슬롯 | 마운트 위치(App.tsx) | z-index | 담는 컴포넌트 |
|------|--------------------|---------|--------------|
| `top` | `top:0` | 10 | `PrismHudTopBar` (전투 인게임 상단 HUD) |
| `bar` | `top:118` | 10 | `PrismHudBossHp`, `PrismHudBossWarning`, `PrismHudSkillSlots`, `PrismRushWarning` |
| `modal` | `inset:0` | 30 | 로비·스킬모달·결과·씬전환·일시정지·보스인트로/사망·상점·장비·도전·진화·특성·에너지·행운열차·모험업·아바타 등 전 모달 |

각 컴포넌트는 **Spec의 `visible` 필드를 대부분 무시**하고, 자체적으로 `$state`의 `*/visible` 플래그를 읽어 `null` 반환 여부를 결정한다(동적 제어). 따라서 화면 전환 = 해당 `*/visible` 토글이다.

### 10.0.1 App.tsx 최상위 DOM 레이어 순서 (실제 코드 기준)

루트: `letterbox()`(검정 배경, flex center) → `wrapperRef` div(`position:relative`, `vp.w × vp.h`, `overflow:hidden`, `background:#1a1a2e`). 그 자식 순서/조건:

| # | 요소 | z-index | pointerEvents | 표시 조건 |
|---|------|---------|---------------|-----------|
| 1 | `<canvas>` (Three.js, inset:0) | — | — | 항상 |
| 2a | 인게임 상단 HUD `PrismHudRenderer slot="top"` (top:0) | 10 | auto | `isCombatScreen` |
| 2b | 공통 재화바 `<CommonTopBar/>` (top:0) | 55 | auto | `!isCombatScreen` (로비/상점/결과/일시정지 등) |
| 3 | 이벤트 HUD mileage (top:`eventHudLayerTop`) | 40(로비)/11(전투) | none | `showEventHud && !eventOverlayOpen` |
| 4 | 이벤트 HUD tournament (right:0) | 40/11 | none | 위와 동일 |
| 5 | 이벤트 HUD modal (inset:0) | 60 | eventOverlayOpen?auto:none | `showEventHud` |
| 6 | `<EventCurrencyFlyOverlay/>`, `<EventTooltipOverlay/>` | 자체 | — | `eventData` 존재 |
| 7 | `<LobbyMenuDropdown/>` (햄버거 메뉴) | 이벤트40 위 | — | `isBattleLobbyScreen` |
| 8 | `<SalesEventOverlay/>` 래퍼 (inset:0) | salesModalOpen?62:48 | none(래퍼) | 항상 마운트 |
| 9 | 상단 바형 HUD `PrismHudRenderer slot="bar"` (top:118) | 10 | auto | 항상(내부 visible 자체판단) |
| 10 | 모달/전환 `PrismHudRenderer slot="modal"` (inset:0) | 30 | anyModalOpen?auto:none | 항상 마운트 |
| 11 | `<ToastOverlay zIndex={60}/>` (모달 레이어 내부) | 60 | — | `!iframeOpen` |
| 12 | `<EventMinigameOverlay/>` (iframe Lava/Prize/Archery 셸) | 자체(≈500) | — | 항상 마운트 |
| 13 | 미니게임 위 토스트 `<ToastOverlay/>` (inset:0) | 530 | none | `iframeOpen` |
| 14 | `<RewardDetailOverlay/>` (inset:0) | iframeOpen?520:63 | none | 항상 |

**화면 판별 헬퍼(App.tsx):**
- `isBattleLobbyScreen` = `/lobby/visible` true **AND** shop/equip/challenge/evolution/talent/energy/avatar 전부 false (= 하단 「전투」탭 상태)
- `isCombatScreen` = `/lobby/visible` false **AND** `/result/visible` false **AND** `/pause/visible` false
- `showEventHud(=shouldShowEventHud)` = `isBattleLobbyScreen || isCombatScreen`
- `anyModalOpen` = lobby/pause/modal/result/battle/energy/luckyTrain/challenge/evolution/equip/shop/talent/advUp/avatar 중 하나 visible, 또는 `/bossIntro/phase>0`, `/scene/transitionVisible`, eventOverlayOpen, salesModalOpen
- **상단 바 상호배타**: 전투 중엔 인게임 HUD(z10), 그 외 전 화면은 `CommonTopBar`(z55)

### 10.1 로비 (전투 탭) — `LobbyScreenImpl`
- **트리거**: `/lobby/visible`=true & 서브탭 전부 false. gameState=`PAUSED`.
- **컨테이너**: `position:absolute; inset:0; zIndex:45; background:#F4EFE6`.
- **상단 바(`CommonTopBar`, App z55)**: 햄버거 `≡`(36×36 → `/lobby/menuOpen` 토글) / 아바타(36×36, `/lobby/selectedPlayerColorHex` → `lobby:openAvatar`) / `PLAYER 1` + `LV.{/lobby/advLevel}` + 모험 EXP바(56×6, `/lobby/advExpPct`) / 재화 3종: ⚡`/lobby/entryTickets`(클릭 `energy:open`), 💎`/lobby/gems`, 🪙`/lobby/metaGold`(K 축약).
- **중앙 스테이지 뷰**: 제목 `{selectedStage}. {stageName}`(24px, `/lobby/selectedStage`·`/lobby/stageName`) / `최장 생존시간 {bestTime}`(`/lobby/bestTime`) / 디오라마 박스 180×150(`renderStageDiorama`, 1~10 분기) + 좌`‹`/우`›` 화살표(34×34 → `lobby:selectStage`, `/lobby/maxStages` 제한) / 챕터 보상 선물상자(`renderNeonGiftIcon` → 토스트) / 배수 토글(minWidth 94: `×{selectedMult}`·"배수"·`⚡{multEnergyCost} 소모` → `lobby:cycleMult`) / **게임 시작 버튼**(padding 12×32, `canStart = entryTickets >= multEnergyCost`; 활성 `#FFB347`→`START_GAME`, 비활성 `#cccccc`→`energy:open`).
- **이벤트 사이드 탭(우측 세로, `EventMiniCards`, z48)**: `EVENT_MINIGAME_ORDER` 중 show 플래그 true(`/lobby/showLavaQuest`·`showPrizeDrop`·`showArcheryArena`)인 것. 44×44 원형 + 라벨 + 티켓 핍, 레드닷 `/event/redDot/*`. 클릭 `openEventMinigame(id)`.
- **하단 탭바**: `<NavTabBar active="battle"/>` (10.2).
- **토스트**: `LobbyToast`(`/toast/visible`·`/toast/text`, bottom:96, z48).

### 10.2 하단 탭바 — `NavTabBar.tsx`
5버튼(각 flex:1, SVG 아이콘+라벨, active 배경 `#e8dfd1`): **상점 / 장비 / 전투 / 도전 / 진화**. 클릭 시 `close()`(menuOpen=false + equip/talent/challenge/evolution/shop `:close`) 후 해당 `lobby:open*`:
- 상점→`lobby:openShop`→`/shop/visible` / 장비→`lobby:openEquip`→`/equip/visible` / 전투→로비 복귀 / 도전→`lobby:openChallenge`→`/challenge/visible` / 진화→`lobby:openEvolution`→`/evolution/visible`.
- ※ **영구특성(Talent)은 5탭에 없음** — `lobby:openTalent`로 별도 진입(햄버거 메뉴 경유).

### 10.3 전투 인게임 HUD
- **트리거**: `isCombatScreen`. gameState=`PLAYING`.
- **상단 HUD(`HudTopBarImpl`, top slot, z10, `background:#F4EFE6`, 3행)**: ①얇은 자원바 ⚡`/lobby/entryTickets`(좌)·스테이지 캡슐 `S{stage}·{stageName}`(중, `/hud/stage`+`/lobby/stageName`)·🪙`/hud/gold`(우) / ②일시정지(40×40 → `TOGGLE_PAUSE`)·타이머(34px, `/hud/timer`)·킬수(`/hud/killCount`) / ③`LV.{level}`(`/hud/level`)+EXP바(h14, `/hud/expPct`, fill `#3DDC84`).
  - ※ `PrismHudExpBar/Timer/KillCount/Gold/PauseBtn`은 전부 `visible:false`(TopBar에 통합) — 단일 `HudTopBarImpl`이 통합 렌더.
- **플레이어 HP바(`HudPlayerHpImpl`)**: `position:absolute; bottom:-10; left:10%; width:80%; height:8`. `/hud/hpPct`, 색 ≤30%→`#ff4444` 그외 `#FFB347`. (캐릭터 머리 위 부착 — PlayerMesh)
- **스킬 슬롯(`HudSkillSlotsImpl`, bar slot)**: **현재 `return null`**(인게임 미표시, 데이터만 `/hud/activeSkillSlots`). 슬롯 시각화는 레벨업/일시정지 화면에서만.
- **보스 HP바(`HudBossHpImpl`, bar)**: `top:72; left:10%; width:80%; z10`, "😈 {bossName}"+빨간 바. `/hud/bossVisible`·`/hud/bossHpPct`·`/hud/bossName`.
- **보스 WARNING(`HudBossWarningImpl`, bar)**: `top:80; 중앙; z20`, "⚠️ BOSS WARNING ⚠️". `/hud/bossWarningVisible`.
- **러시 경고(`RushWarningImpl`, bar)**: `top:120; 중앙; z25`, "⚠️ RUSH INCOMING ⚠️". `/rushWave/visible`.

### 10.4 씬 전환 — `SceneTransitionImpl` (modal slot)
- 트리거 `/scene/transitionVisible`. `inset:0; z60; pointerEvents:none`. 줄무늬 4개 슬라이드 + "Ready... / {text} / GO SQUAD! 🚀"(z61). `/scene/transitionText`.

### 10.5 레벨업 카드 선택 — `SkillModalImpl` (modal slot)
- 트리거 `/modal/visible`. gameState=`LEVELUP`. `inset:0; z40`, 배경 `rgba(5,10,20,0.72)` blur, 폭<440px 시 scale 축소.
- "스킬 선택" 배너 / ACTIVE·PASSIVE 슬롯바(각 6칸, `/hud/activeSkillSlots`·`/hud/passiveSkillSlots`) / 가로 카드(136×234) 목록(`/modal/cards`, 보통 3장) → 클릭 `prism:skillSelect`. 숫자키 1/2/3 = `prism:quickSkill` 동일.
- **EVO 분기**: 카드에 `is_evolution`+`evo_recipe` 있으면 "🔥 돌파 조합!" 팝업(z40)으로 대체 — 레시피 행 + EVO 결과 카드 + "🔥 진화시키기".

### 10.6 일시정지 — `PauseScreenImpl` (modal slot)
- 트리거 `/pause/visible`. gameState=`PAUSED`. `inset:0; z40`. 무기/지원품 6슬롯 그리드 2개(ACTIVE/PASSIVE) + 계속하기(`TOGGLE_PAUSE`)/포기(`GIVE_UP`).

### 10.7 결과 화면 — `ResultScreenImpl` (modal slot)
- 트리거 `/result/visible`. gameState=`GAMEOVER`. `inset:0; z46; background:#F4EFE6`.
- 상단 배너: 승=`클리어!`(배경 `#FFB347`) / 패=`실패`(배경 `#FF4455`) — `/result/isVictory`. **(영어 STAGE CLEAR/DEFEAT 아님 — 한국어)**
- 스탯: 생존시간(52px, `/result/survivalTime`)·`S{stage}`·`LV.{finalLevel}`·킬수(`/result/killCount`). 보상: 🪙`/result/goldEarned`·EXP `/result/totalXpEarned`. 타이쿤 적립 `/result/tycoonEarned`.
- 하단: 통계(토스트)·"확인" → `prism:action`/`EXIT`.

### 10.8 보스 인트로 — `BossIntroImpl` (modal slot)
- 트리거 `/bossIntro/phase`(1/2/3). `inset:0; z55; pointerEvents:none`. gameState=`BOSS_INTRO`(phase1~2).
  - P1: 빨간 비네트 + "⚠️ WARNING / 최종 보스가 등장합니다" / P2: 퍼플 암전 + "👁️ {bossName} / FINAL BOSS"(`/hud/bossName`) / P3: 등장 충격파.

### 10.9 보스 사망/승리 연출 — `BossDeathImpl` (modal slot)
- 트리거 `/bossDeath/phase`(1/2/3). `z65; pointerEvents:none`.
  - P1: 노란 폭발 / P2: "VICTORY! / {bossName} 처치 / ★★★"(`/bossDeath/bossName`) / P3: 페이드아웃.

### 10.10 모험 레벨업 팝업 — `AdventureUpImpl` (modal slot)
- 트리거 `/advUp/visible`. `inset:0; z52`. 레벨/보석/골드(`/advUp/level`·`/advUp/rewardGem`·`/advUp/rewardGold`) → `advUp:close`. 로비 복귀 시 `_showPendingAdvUp`로 예약 표시.

### 10.11 행운 열차 — `LuckyTrainImpl` (modal slot)
- 트리거 `/luckyTrain/visible`. gameState=`PAUSED`(인게임 `OPEN_LUCKY_TRAIN` 진입). 스킬 골드 구매. `/luckyTrain/gold`·`/luckyTrain/skills`·`/luckyTrain/selectedId`. `luckyTrain:select`/`:buy`/`:close`.

### 10.12 에너지(번개) 충전 상점 — `EnergyShopImpl` (modal slot)
- 트리거 `/energy/visible`(번개 부족 or `energy:open`). `/energy/cur`·`/energy/max`·`/energy/gems`. `energy:buy`('gem'=보석100→+15, 'ad'=무료→+5)/`:close`.

### 10.13 상점 — `ShopScreenImpl` (modal slot)
- 트리거 `/shop/visible`. 바인딩 `/shop/{cashKrw,gems,metaGold,energy,supplyKeys,defensePity,purchasedGemIds,gemPacks,goldPacks,boxes,maxEnergy,showResetButton,testCashKrw}`. 액션 `shop:buyGem`(KRW→보석, 첫구매 2배)·`shop:buyGold`·`shop:openBox`·`shop:resetCash`·`shop:close`.

### 10.14 장비 — `EquipScreenImpl` (modal slot)
- 트리거 `/equip/visible`. 바인딩 `/equip/{items,gold,atk,hp,spd,weapons,selectedWeaponId}`. 액션 `equip:upgrade/toggle/equip/unequip/close`. stat_type(power/hp/speed) 6슬롯 강화 + 무기 선택(무기 그룹 상호배타).
- 레이아웃: 상단 재화바 + ATK/HP 바 + 중앙 캐릭터 idle(`prismIdleBob`) + 양옆 6슬롯 + 업그레이드 패널 + 보유장비 그리드 + 하단 탭바.

### 10.15 도전 — `ChallengeScreenImpl` (modal slot)
- 트리거 `/challenge/visible`. `/challenge/items`(ChallengeItem: stage·difficulty·enemy_hp_mult·dmg_mult·reward_dna·gold·cleared·unlocked). `challenge:start`→`_startFromLobbyMult`(도전 배율 적용 전투)·`challenge:close`. 카드 탭→상세 모달(플레이방식/난이도배율/클리어보상/해금조건).

### 10.16 진화 — `EvolutionScreenImpl` (modal slot)
- 트리거 `/evolution/visible`. `/evolution/items`(EvoNodeItem: branch 0=골드/1=DNA·cost_type·unlocked/affordable/available)·`/evolution/gold`·`/evolution/dna`. `evolution:unlock`/`:close`.

### 10.17 영구특성 — `TalentScreenImpl` (modal slot)
- 트리거 `/talent/visible`(`lobby:openTalent` 진입, 5탭 외). `/talent/items`(TalentItem: current·next_effect·next_cost)·`/talent/gold`. `talent:upgrade`/`:close`.

### 10.18 아바타 선택 — `AvatarSelectModalImpl` (modal slot)
- 트리거 `/avatar/visible`(CommonTopBar 아바타 클릭 → `lobby:openAvatar`). 4×4 프로필 16종(`/avatar/players`·`/meta/avatarProfileLimit`) + 활성 스탯 + "장착" → `avatar:select`·`avatar:close`.

### 10.19 (참고) 비활성·미발견
- **티켓/배수 선택 팝업(`BattlePopupImpl`)**: `/battle/visible` 항상 false(set true 없음) — **현재 비활성**. 배수 선택은 로비 인라인 토글(`lobby:cycleMult`)로 대체. 바인딩 경로(`/battle/options`·`selectedMult`·`energy`)는 잔존.
- **화면 회전 안내 UI**: 지정 소스 범위에 없음(9:16 레터박스 `calc916`만 존재).
