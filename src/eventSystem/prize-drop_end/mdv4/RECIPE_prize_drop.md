---
doc_generation: mdv4
condense_policy: forbidden
note: "v4는 mdv3와 별도 폴더. v5 diff용 — 절대 요약·삭제 금지."
ui_pixel_precision: "DESIGN·외부 팀. DEV는 json-render 슬롯·$state·DOM 순서·CSV SSoT만."
---

# Prize Drop Arcade — Recipe

> 이 파일은 검증된 구현 패턴의 **설명서**다. 사람도 읽을 수 있는 기획서 양식.
>
> **RECIPE_CODE.md가 있으면** → 해당 코드 그대로 사용.
> **RECIPE_CODE.md가 없으면** → 이 문서의 설명을 보고 직접 구현.

---

## R-01. json-render Provider 래핑

**적용 위치:** `src/main.tsx`

**설명:**
StateProvider → ActionProvider → VisibilityProvider → GameJsonHud 순서.
이 게임은 ValidationProvider 없음. 3개 Provider만 사용.

---

## R-02. $state 3곳 동시 패치

**적용 위치:** hudExternalStore.ts + 공급원(milestoneStore 등) + GameJsonHud.tsx

**설명:**
$state 경로 수정 시 반드시 3곳 동시 패치.
한 곳만 수정하면 화면 미갱신 또는 런타임 오류.

---

## R-03. getSnapshot() 캐시 패턴

**적용 위치:** 모든 외부 스토어 (gameStore, milestoneStore 등)

**설명:**
React 18 useSyncExternalStore는 getSnapshot()이 매번 새 객체를 반환하면
tearing 발생 → 화면 unmount.
변경 시에만 새 참조 생성. getSnapshot()은 캐시 반환만.
스토어 메서드는 화살표 함수 필드로 선언해야 this가 유실되지 않는다.

---

## R-04. Three.js OrthographicCamera + Y축 설정

**적용 위치:** `src/game/PrizeDrop.ts` — 카메라 초기화

**설명:**
OrthographicCamera(0, viewWidth, viewHeight, 0, -1000, 1000).
Y축: 위가 viewHeight, 아래가 0.
camera.position.set(0, 0, 500).
PerspectiveCamera 사용 금지 — 보드 원근 왜곡 발생.

---

## R-05. bankPlayer Y-flip (가장 중요)

**적용 위치:** `src/game/bankPlayer.ts`

**설명:**
Matter.js 좌표계: 위가 0, 아래가 HEIGHT.
Three.js 좌표계: 위가 HEIGHT, 아래가 0.
Y축 반전 필수: `Three.js Y = BOARD_CONSTANTS.HEIGHT(396) - Matter.js cy`.
viewHeight(≈390)를 사용하면 좌표가 어긋나 공이 핀을 뚫고 지나간다.
반드시 BOARD_CONSTANTS.HEIGHT(396) 사용.

---

## R-06. bank fallback 패턴

**적용 위치:** `src/game/bankPlayer.ts`

**설명:**
드롭 위치에 해당하는 bank가 없을 때 같은 슬롯의 다른 drop_position에서 fallback.
모든 drop_position에 없으면 임의 슬롯 사용.
bank 없이 드롭 금지 — bankPlayer.isReady 확인 필수.

**규칙:**
1. banks.get(bankKey(targetSlot, dropPosition)) 시도
2. 없으면 같은 targetSlot의 다른 drop_position 순서대로 시도
3. 그래도 없으면 임의 슬롯 사용

---

## R-07. 보상 모달 큐 패턴

**적용 위치:** `src/game/rewardModalStore.ts`

**설명:**
보상 모달은 반드시 enqueue()로 큐에 추가한다.
show()를 직접 호출하면 복수 마일스톤 달성 시 첫 번째만 표시되고 나머지는 스킵된다.
dismiss() 후 180ms 기다렸다가 다음 모달을 자동으로 표시한다.

**규칙:**
- 마일스톤 달성 시: rewardModalStore.enqueue(step, reward)
- 모달 닫기: rewardModalStore.dismiss()
- dismiss 후 180ms → 큐에 다음 항목 있으면 자동 표시

---

## R-08. BOARD_CONSTANTS 동기화

**적용 위치:** `src/game/boardBuilder.ts` + `scripts/simulationRunner.mjs`

**설명:**
두 파일의 BOARD_CONSTANTS(boardBuilder.ts)와 B 상수(simulationRunner.mjs)는
반드시 항상 동일해야 한다.
하나라도 다르면 bank 경로와 실제 보드가 불일치해 공이 핀을 뚫고 지나간다.

**고정값:**
- WIDTH: 360
- HEIGHT: 396
- PIN_RADIUS: 5
- BALL_RADIUS: 9
- SLOT_COUNT: 7
- CENTER_X: 180

---

## R-09. SlotLabels CSV 기반 렌더

**적용 위치:** `src/jsonRender/GameJsonHud.tsx` — SlotLabelsImpl

**설명:**
SlotLabels는 반드시 01_slot_lightning.csv 데이터를 slot_index 오름차순으로 렌더한다.
하드코딩하면 CSV 수정이 화면에 반영되지 않는다.

**규칙:**
- loadGameData에서 로드된 slots 데이터 사용
- [...slots].sort((a, b) => a.slot_index - b.slot_index)로 정렬 보장
- 각 slot의 reward_lightning 값을 표시

---

## R-10. RewardCircle 충돌 감지

**적용 위치:** `src/game/PrizeDrop.ts` — 렌더 루프

**설명:**
Matter.js 런타임 물리 없이 Three.js 렌더 루프에서 직접 거리 계산으로 bounce 트리거한다.
ball과 RewardCircle 중심 거리가 (원 반지름 + BALL_RADIUS + 2) 미만이면 bounce 발동.
bounce: scale 1→1.12(80ms)→1. ripple: scale 1→0 수축(280ms).

**규칙:**
- 매 프레임 거리 계산
- lastHitTime으로 150ms 내 중복 트리거 방지
- bounce + ripple 애니메이션은 elapsed 기반

---

## R-11. 드롭 버튼 중심 X 고정

**적용 위치:** `src/jsonRender/GameJsonHud.tsx` + `scripts/simulationRunner.mjs`

**설명:**
드롭 버튼 중심 X 좌표는 30/105/180/255/330px 고정이다.
simulationRunner.mjs의 dropX() 함수와 반드시 동일해야 한다.
다르면 버튼 위치와 공 스폰 위치가 어긋난다.

**계산식:** margin=(360-300)/2=30, x=30+posIndex×(300/4)

---

## R-12. 공정 2 — bank 생성 절차

**적용 위치:** `scripts/simulationRunner.mjs`

**설명:**
공정 1(보드 구현) 완료 후 보드를 육안으로 확인한 다음에 bank를 생성한다.
보드 오류가 있으면 bank에도 오류가 그대로 반영된다.

**절차:**
1. BOARD_CONSTANTS와 simulationRunner.mjs B 상수 동일 확인
2. rm -rf game_data/bank/*.json (기존 bank 제거)
3. node scripts/simulationRunner.mjs 20 (35파일 × 20경로)
4. game_data/bank/ 아래 35개 파일 생성 확인
5. npm run dev → 드롭 테스트
