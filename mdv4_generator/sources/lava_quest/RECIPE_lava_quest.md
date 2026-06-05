# Lava Quest — Recipe

> 이 파일은 검증된 구현 패턴의 **설명서**다. 사람도 읽을 수 있는 기획서 양식.
>
> **RECIPE_CODE.md가 있으면** → 해당 코드 그대로 사용.
> **RECIPE_CODE.md가 없으면** → 이 문서의 설명을 보고 직접 구현.

---

## R-01. json-render Provider 래핑

**적용 위치:** `src/jsonRender/GameJsonLava.tsx`

**설명:**
StateProvider → ActionProvider → VisibilityProvider → Renderer 순서.
Provider 누락 시 HUD 전체 공백.

---

## R-02. $state 3곳 동시 패치

**적용 위치:** hudExternalStore.ts + syncLavaHud.ts + GameJsonLava.tsx

**설명:**
$state 경로 수정 시 반드시 3곳 동시 패치.

---

## R-03. getSnapshot() 캐시 패턴

**적용 위치:** `src/game/LavaQuestGame.ts`

**설명:**
React 18 useSyncExternalStore는 getSnapshot()이 매번 새 객체 반환 시 tearing.
notify() 내부에서만 새 스냅샷 생성. getSnapshot()은 캐시 반환만.

---

## R-04. Three.js 카메라 설정

**적용 위치:** `src/three/setup.ts`

**설명:**
OrthographicCamera 탑뷰. lookWorld Z = -8 (화면 상단 방향).
camera.up 반드시 (0,1,0). (0,0,-1) 설정 시 LookAt Singularity → NaN 크래시.

**핵심 수치:**
- frustumHalfH: 32
- cameraLiftY: 72
- lookWorld: (0, -2.95, -8)
- camera.up: (0, 1, 0) 고정

---

## R-05. ResizeObserver + disposeScene

**적용 위치:** `src/three/setup.ts`, `src/three/dispose.ts`

**설명:**
ResizeObserver는 disposeScene 시 반드시 disconnect해야 한다.
누락 시 씬 교체 후 죽은 렌더러에 접근해 크래시.

**규칙:**
- ResizeObserver 생성 시 참조 보관
- disposeScene()에서 ro.disconnect() 먼저 호출
- container 기준 resize. window 금지.

---

## R-06. 씬 마운트 타이밍

**적용 위치:** Lobby.tsx, Clear.tsx

**설명:**
showScreen() 직후 바로 mountLavaScene()을 호출하면
DOM이 아직 렌더되지 않아 getBoundingClientRect()가 0을 반환한다.
frameWait(2) 대기 후 마운트해야 한다.

**규칙:**
- showScreen('screen-lobby') 후 await frameWait(2)
- 그 다음 mountLavaScene(container) 호출

---

## R-07. 탈락 연출 타이밍 — 차이값 × PACE

**적용 위치:** `src/three/lavaScene.ts`

**설명:**
탈락 연출 간격은 각 step의 delay_ms에서 이전 step의 delay_ms를 뺀 차이값에 PACE를 곱한다.
각 step의 delay_ms를 그대로 사용하면 연출이 3배 이상 느려진다.

**PACE = 0.52. 고정. 임의 변경 금지.**

**계산 방식:**
- prevScheduled = 0으로 시작
- waitMs = floor((step.delay_ms - prevScheduled) × PACE)
- prevScheduled = step.delay_ms로 갱신
- await delay(max(0, waitMs))

---

## R-08. 마커 생성 — CircleGeometry + depthTest:false

**적용 위치:** `src/three/players.ts`

**설명:**
탑뷰 씬의 마커는 반드시 CircleGeometry(2D)로 생성해야 한다.
SphereGeometry(3D)는 탑뷰에서 깊이가 없어 보이지 않는다.
depthTest:false 없으면 Z-fighting으로 깜빡인다.
group.rotation.x = -Math.PI/2 없으면 마커가 수직으로 선다.

**핵심 규칙:**
- CircleGeometry(반지름, 48세그먼트)
- MeshBasicMaterial: depthTest: false, depthWrite: false
- group.rotation.x = -Math.PI/2 (눕힘)
- 마커 크기: wpp × 3.85 동적 계산

---

## R-09. 탈락 연출 — X축 튕겨남

**적용 위치:** `src/three/players.ts`

**설명:**
탑뷰 씬에서 Y축 포물선 낙하는 전혀 보이지 않는다.
탑뷰 전용 탈락 연출은 X축으로 넓게(-12~+12) 튕겨나는 방식이어야 한다.
탈락 후 마커를 제거하지 않고 회색(0x6a6a6a)으로 필드에 남긴다.

**규칙:**
- X: -12 ~ +12 (넓게)
- Z: 좁게
- 탈락 후 색상 0x6a6a6a로 변경. 완전 제거 금지.

---

## R-10. 실패 연출 임시 씬

**적용 위치:** `src/screens/Fail.tsx` or `src/game/LavaQuestGame.ts`

**설명:**
실패 연출용 Three.js 씬은 JS로 body에 임시 div를 생성하고 연출 후 제거한다.
index.html에 고정 배치하면 WebGL이 항상 화면을 덮어 마커 연출이 차단된다.

**규칙:**
- div.lq-fx-mount를 JS로 body에 appendChild
- mountLavaScene(fxMount) 임시 씬 생성
- animateSelfEliminate() 연출 실행
- try/finally에서 disposeScene() + fxMount.remove()

---

## R-11. busy 가드

**적용 위치:** 모든 async 핸들러

**설명:**
버튼을 빠르게 연속 탭하면 같은 핸들러가 중복 실행되어 세션이 꼬인다.
모든 async 핸들러는 시작 시 busy 체크, 종료 시 finally에서 해제한다.

**규칙:**
- 핸들러 시작: if (busy) return; busy = true;
- finally: busy = false;
