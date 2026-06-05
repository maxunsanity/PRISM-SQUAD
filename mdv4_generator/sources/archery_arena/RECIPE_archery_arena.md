# Archery Arena — Recipe

> 이 파일은 검증된 구현 패턴의 **설명서**다. 사람도 읽을 수 있는 기획서 양식.
>
> **RECIPE_CODE.md가 있으면** → 해당 코드 그대로 사용.
> **RECIPE_CODE.md가 없으면** → 이 문서의 설명을 보고 직접 구현.

---

## R-01. json-render Provider 래핑

**적용 위치:** `src/jsonRender/GameJsonArchery.tsx`

**설명:**
StateProvider → ActionProvider → VisibilityProvider → Renderer 순서.
Provider 누락 시 HUD 전체 공백.

---

## R-02. $state 3곳 동시 패치

**적용 위치:** hudExternalStore.ts + syncArcheryHud.ts + GameJsonArchery.tsx

**설명:**
$state 경로 수정 시 반드시 3곳 동시 패치.
한 곳만 수정하면 화면 미갱신 또는 런타임 오류.

---

## R-03. getSnapshot() 캐시 패턴

**적용 위치:** `src/game/ArcheryGame.ts`

**설명:**
React 18 useSyncExternalStore는 getSnapshot()이 매번 새 객체를 반환하면
tearing 발생 → 화면 unmount.
notify() 내부에서만 새 스냅샷 생성. getSnapshot()은 캐시 반환만.

---

## R-04. Three.js 렌더러 크기 — container 기준

**적용 위치:** `src/three/setup.ts`

**설명:**
renderer.setSize는 반드시 #canvas-container getBoundingClientRect() 기준.
window 기준으로 하면 모바일 컨테이너 밖 영역까지 렌더된다.
renderer.setSize(w, h, false) — false 필수.

---

## R-05. flashRing — 색 lerp만

**적용 위치:** `src/three/target.ts`

**설명:**
과녁 링 적중 연출은 색상 변경만 허용한다.
mesh.scale 변경 시 과녁 크기가 변동된다.
color.lerp(hitColor, t) 방식으로 구현한다.

---

## R-06. 봇 타이머 — 재귀 setTimeout

**적용 위치:** `src/game/ranking.ts`

**설명:**
봇 점수 갱신은 재귀 setTimeout만 허용한다.
setInterval은 규칙적인 간격으로 봇임이 드러난다.
delay = random(bot_tick_min_ms, bot_tick_max_ms) — CSV 기준.

**규칙:**
- sessionEnded 플래그로 정지 조건 체크
- 각 tick 완료 후 다음 tick 예약
- cleanup: sessionEnded = true

---

## R-07. 봇 초기 점수 — v2-gold-balance-v5

**적용 위치:** `src/game/ranking.ts`

**설명:**
봇 전부 0점 시작이면 초반 경쟁심이 없다.
v2-gold-balance-v5 스키마 기준:
- 1등 봇: SET5 3~4회 완벽 적중 수준
- 2~10등: 중간 분포
- 11~49등: 낮은 분포 (일부 0)

---

## R-08. SET3/SET5 순차 연출

**적용 위치:** `src/game/ArcheryGame.ts` — attempt()

**설명:**
SET3/SET5 도전 시 화살 연출을 세트 횟수만큼 순차 실행한다.
각 화살 연출이 완료된 후(await) 다음 발을 실행한다.
1회만 실행하면 SET의 의미가 없다.

**규칙:**
- SINGLE: shootArrow 1회
- SET3: shootArrow 3회 순차 (await + delay 300ms)
- SET5: shootArrow 5회 순차 (await + delay 300ms)

---

## R-09. localStorage 버전 체크

**적용 위치:** `src/game/gameData.ts` — loadPlayerState()

**설명:**
구버전 저장 데이터의 dice_count가 0이면 시작부터 주사위가 없다.
부트 시 version 필드를 확인하고 불일치 시 clearStorage + 기본값(dice:20)으로 재시작한다.

**규칙:**
- SAVE_VERSION 상수 정의
- loadPlayerState()에서 version 체크
- 불일치 → removeItem + defaultState() 반환

---

## R-10. dispose 타이밍

**적용 위치:** `src/screens/Shooting.tsx`

**설명:**
Three.js 씬 dispose 타이밍은 분기에 따라 다르다.
BULLSEYE 분기: 즉시 dispose → Bullseye 화면 전환.
일반 적중 분기: 확인 버튼 클릭 후 dispose.
확인 전 dispose하면 과녁이 사라진다.

**규칙:**
- isBullseye → disposeArcheryThree() 즉시 → screen-bullseye 전환
- 일반 → 확인 버튼 탭 핸들러 안에서 disposeArcheryThree() → screen-lobby 전환

---

## R-11. PRISM — game.js dynamic import (TDZ 방지)

**적용 위치:** `src/gameEntry.js`, `src/main.tsx`

**설명:**
`gameEntry`가 `game.js`를 **정적 import** 하면 Three·game 모듈 초기화 순서에 따라
`Cannot access 'X' before initialization` 발생.
CSV 로드 **성공 후** `import('./game.js')` 만 허용.

**규칙:**
- `main.tsx`는 `void import('./gameEntry.js')` 로 HUD 이후 부트
- `gameEntry`는 `loadAllData().then(() => import('./game.js'))`

---

## R-12. PRISM — shootingBusy 선언 순서

**적용 위치:** `src/game.js` → `startGame()`

**설명:**
`installHostBridge` → `refreshRank()` → `syncAttemptButton()` 이
`let shootingBusy` **선언 전** 실행되면 TDZ.
`let shootingBusy = false` 를 `startGame` **최상단**(installHostBridge 이전)에 둔다.

---

## R-13. PRISM — 5발 연출 (autoAdvance)

**적용 위치:** `src/game.js` → `runFiveBowRound`, `runShootingScene`

**설명:**
활대 1개 소비 시 `SET5` 점수표로 **5회** `calculateScore` 후
`runShootingScene(result, rankBefore, rankBefore, { autoAdvance: true, shotIndex, shotTotal })` 순차 await.
`autoAdvance` 분기: 확인 버튼 없이 pop 후 dispose → 다음 발.

**규칙:**
- `#shooting-shot-badge` 에 `N / 5발` 표시
- Bullseye+autoAdvance: 풀스크린 생략 가능, shooting HUD·파티클만

---

## R-14. CSV 상대 경로 fetch

**적용 위치:** `src/data.js` → `resolveCsvUrl(filename)`

**설명:**
`fetch('/event/archeryArena/aa_….csv')` 절대경로만 쓰면 zip·서브패스 배포 시 404.
`new URL(filename, import.meta.env.BASE_URL + window.location)` 사용.

**규칙:**
- CSV 6종: attempt, event, visual, rank_reward, **integration**, **bundle**
- `loadAllData()` 반환: `integration`, `bundleRewards`
