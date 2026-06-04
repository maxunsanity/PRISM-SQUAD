---
doc_generation: mdv4
condense_policy: forbidden
note: "v4는 mdv3와 별도 폴더. v5 diff용 — 절대 요약·삭제 금지."
ui_pixel_precision: "DESIGN·외부 팀. DEV는 json-render 슬롯·$state·DOM 순서·CSV SSoT만."
---

# 쇼핑몰의 경이로움 — DEV.md

> 기획 SSoT: [`GAME.md`](./GAME.md)  
> 세일 공통: [`../SALES_EVENTS_PLAN.md`](../SALES_EVENTS_PLAN.md)

---

## 1. 디렉터리 구조

```text
src/eventSystem/mallMarvels/
  GAME.md
  DEV.md
  DESIGN.md                  ← UI/UX 재현 명세 (탭 셸·모달·z-index)
  index.ts
  data.ts                    ← CSV 로더 + 폴백
  store.ts                   ← mallMarvelsStore (hud와 분리)
  core/MallMarvelsController.ts
  jsonRender/MallMarvelsModal.tsx

public/event/mallMarvels/
  mm_event_config.csv
  mm_step_config.csv
  mm_step_reward.csv
```

**PRISM에서 추가로 필요한 파일 (분리 시 `sales` 패키지로 묶음)**

```text
src/eventSystem/sales/
  types.ts                   ← SalesRewardLine, SalesHostBridge
  csvLoader.ts
  loadSalesEventData.ts      ← loadAllSalesEventData()
  createPrismSalesHost.ts
  salesRuntime.ts            ← bindSalesToCore, getMallMarvelsController
  SalesEventOverlay.tsx      ← 왼쪽 탭 + 모달 마운트
```

---

## 2. 런타임 부팅 순서 (PRISM App.tsx)

1. `GameCore` 생성 → `bindSalesToCore(core)` — **bundle 인자 없으면 `activeBundle` 도 없어 no-op** (컨트롤러 미생성, 코드 내장 폴백 없음)  
2. `loadAllSalesEventData()` 비동기 완료 → `rebindSalesFromBundle(core, bundle)` 로 컨트롤러 최초 생성. 실패 시 `App.tsx` `.catch()` 가 무시 (탭 미노출, 코어 무영향)  
3. 재바인딩 시 기존 컨트롤러 `dispose` 후 재생성 — **localStorage claimed/ends_at 유지**

```ts
import { loadAllSalesEventData } from '../sales/loadSalesEventData';
import { bindSalesToCore, rebindSalesFromBundle } from '../sales/salesRuntime';
```

---

## 3. CSV API

```ts
export const MALL_CSV_PATHS = {
  EVENT: '/event/mallMarvels/mm_event_config.csv',
  STEP:  '/event/mallMarvels/mm_step_config.csv',
  REWARD:'/event/mallMarvels/mm_step_reward.csv',
};

export async function loadMallMarvelsData(): Promise<MallMarvelsData>;
// 코드 내장 폴백 없음 — getDefaultMallMarvelsData / DEFAULT_REWARDS 미존재
```

**파싱 규칙**

- `enabled !== '0'` 첫 `mm_event_config` 행 (없으면 `eventRows[0]`)  
- step/reward는 `event_id` 일치 필터 (step.event_id 비면 통과)  
- step `step_id <= 0` 또는 알 수 없는 `reward_type` 행 스킵  
- step 보상 0개 → 빈 배열 (폴백 테이블 없음)  
- 빈 데이터/실패 시 **throw** → `loadAllSalesEventData` 도 throw → `App.tsx` `.catch()` 가 무시 (탭 미노출, 코어 무영향)

---

## 4. Controller API

```ts
class MallMarvelsController {
  constructor(data: MallMarvelsData, host: SalesHostBridge);
  dispose(): void;
  openModal(): void;
  closeModal(): void;
  refresh(): void;
  claimStep(stepId: number): boolean;
}
```

**claimStep 흐름**

1. `lockState(step) === 'AVAILABLE'`  
2. `endsAt > now`  
3. `trySpendGems` / `trySpendCashKrw` (유료)  
4. `host.grantRewards(lines)`  
5. `claimed.add(stepId)` → `localStorage`  
6. `lobby:toast`  

---

## 5. Store 키 (`mallMarvelsStore`)

| 경로 | 타입 | 용도 |
|------|------|------|
| `/mallMarvels/modalOpen` | boolean | 팝업 |
| `/mallMarvels/timerText` | string | 헤더·탭 뱃지 |
| `/mallMarvels/title` | string | |
| `/mallMarvels/introTip` | string | |
| `/mallMarvels/steps` | MallStepView[] | 카드 리스트 |
| `/mallMarvels/hasFreeClaim` | boolean | 왼쪽 탭 빨간 점 |

`hudExternalStore` 와 **절대 공유하지 않음** (로비 플래그만 예외):

- `/lobby/showMallMarvels` — `LobbyMenuDropdown` 토글

---

## 6. localStorage

| 키 | 형식 | 시점 |
|----|------|------|
| `prism_mm_claimed_v1` | `number[]` JSON | claim 성공 |
| `prism_mm_ends_at_v1` | epoch ms string | 최초 없을 때 `duration_hours` 로 생성 |

---

## 7. Host 연동 (PRISM)

`createPrismSalesHost(core)` → `GameCore`:

| Bridge 메서드 | GameCore |
|---------------|----------|
| `grantRewards` | `grantSalesRewards` |
| `trySpendCashKrw` | `trySpendSalesCashKrw` |
| `trySpendGems` | `trySpendSalesGems` |
| `getWallet` | `getSalesWallet` |

`open_box` → `_grantSalesBoxFree(reward_param || 'resource')` (젬/열쇠 없이 1회, defense는 pity·key_bonus 재사용)  
`equip_lv` → `resource` 상자 등급표 `pickWeighted` → `_grantBoxEquipment` (등급표 없으면 NORMAL, fallback gold = grant_fallback_gold ?? 500)  
`getWallet` 반환: `{ cashKrw, gems, gold, energy }` (`metaCashKrw`/`metaGems`/`metaGold`/`metaEnergy`)

---

## 8. UI 마운트

- `SalesEventOverlay` — `App.tsx` z48/62  
- `MallMarvelsModal` — `onClaim={(id) => getMallMarvelsController()?.claimStep(id)}`  
- 왼쪽 탭: `eventSideTabShellStyleLeft`, `salesLeftTabStackIndex('mall', …)`

---

## 9. EVENT_REGISTRY

```ts
// src/eventSystem/registry.ts
mall_marvels: mallMarvels,  // index.ts export
```

---

## 10. 다른 게임 이식 체크리스트

- [ ] `SalesHostBridge` 4메서드 구현  
- [ ] `sales/` 또는 동등 오버레이 + CSV fetch 경로  
- [ ] 로비 플래그 1개 (`showMallMarvels`)  
- [ ] `public/event/mallMarvels/` 배포  
- [ ] 상자/장비 grant가 호스트에 있으면 `open_box` / `equip_lv` 연결  
- [ ] (선택) iframe 대신 오버레이만 사용

---

## 11. 수정 시 동시 패치

| 변경 | 파일 |
|------|------|
| CSV 컬럼 추가 | `data.ts` 파서 + `GAME.md` §7 + CSV |
| store 키 | `store.ts`, `MallMarvelsController`, `MallMarvelsModal` |
| 보상 타입 | `sales/types.ts`, `GameCore.grantSalesRewards` |
| 탭 위치 | `SalesEventOverlay`, `eventHudLayout.ts` |

---

## 12. 빌드·검증

```bash
npm run build
```

브라우저: 전투 로비 → 햄버거 쇼핑몰 ON → 왼쪽 🛍️ → 1~2 무료 → 3 💎 → 4 ₩


---

## 14. Deployed CSV Full Contents (public SSoT)

> **배포 SSoT.** AI는 이 내용을 임의 변경하지 말 것. 파일이 repo에 있으면 fetch 경로 그대로 사용.

### `public/event/mallMarvels/mm_event_config.csv`

```csv
event_id,title,intro_tip,duration_hours,hero_image,enabled
mall_marvels_01,쇼핑몰의 경이로움,각각의 팩을 잠금 해제하면 더 많은 보상을 받을 수 있습니다.,34,,1
```

### `public/event/mallMarvels/mm_step_config.csv`

```csv
step_id,event_id,sort_order,prereq_step_id,cost_type,gem_cost,price_krw,card_color,button_label_override
1,mall_marvels_01,1,0,FREE,0,0,#FFE8F0,
2,mall_marvels_01,2,1,FREE,0,0,#FFF0E8,
3,mall_marvels_01,3,2,GEMS,90,0,#E8F4FF,
4,mall_marvels_01,4,3,CASH_KRW,0,4400,#F0FFE8,
5,mall_marvels_01,5,4,GEMS,120,0,#FFF8E8,
6,mall_marvels_01,6,5,CASH_KRW,0,7000,#F8E8FF,
```

### `public/event/mallMarvels/mm_step_reward.csv`

```csv
step_id,reward_type,reward_qty,reward_param,icon_asset_key,label
1,energy,35,,bolt,⚡ 35
2,meta_gold,35400,,coin,🪙 35.4K
3,open_box,1,resource,box,📦 군자원상자
4,meta_gold,80000,,coin,🪙 80K
5,equip_lv,1,,equip,⚔️ 장비 Lv+1
6,open_box,1,defense,box,🎁 지구방위
6,energy,100,,bolt,⚡ 100
```

