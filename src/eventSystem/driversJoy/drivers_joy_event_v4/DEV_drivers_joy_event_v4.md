---
doc_generation: mdv4
condense_policy: forbidden
note: "v4는 mdv3와 별도 폴더. v5 diff용 — 절대 요약·삭제 금지."
ui_pixel_precision: "DESIGN·외부 팀. DEV는 json-render 슬롯·$state·DOM 순서·CSV SSoT만."
---

# 드라이버의 기쁨 — DEV.md

> 기획: [`GAME.md`](./GAME.md)  
> 세일 공통: [`../SALES_EVENTS_PLAN.md`](../SALES_EVENTS_PLAN.md)

---

## 1. 디렉터리 구조

```text
src/eventSystem/driversJoy/
  GAME.md
  DEV.md
  index.ts
  data.ts
  store.ts
  core/DriversJoyController.ts
  jsonRender/DriversJoyModal.tsx

public/event/driversJoy/
  dj_event_config.csv
  dj_reward_config.csv
```

공유: `src/eventSystem/sales/*` (§ [`mallMarvels/DEV.md` §1](../mallMarvels/DEV.md))

---

## 2. CSV API

```ts
export const DRIVERS_JOY_CSV_PATHS = {
  EVENT:  '/event/driversJoy/dj_event_config.csv',
  REWARD: '/event/driversJoy/dj_reward_config.csv',
};

export async function loadDriversJoyData(): Promise<DriversJoyData>;
export function getDefaultDriversJoyData(): DriversJoyData;
```

**보상 순서:** `sort_order` 오름차순.

---

## 3. Controller API

```ts
class DriversJoyController {
  constructor(data: DriversJoyData, host: SalesHostBridge);
  dispose(): void;
  openModal(): void;
  closeModal(): void;
  refresh(): void;
  purchase(): boolean;
  canShowTab(): boolean;
  hasPurchaseAvailable(): boolean;
}
```

**purchase**

1. ¬expired ∧ ¬soldOut  
2. `trySpendCashKrw(price_krw)`  
3. `grantRewards(data.rewards)`  
4. `purchases_used++` → LS  
5. toast  

---

## 4. Store 키

| 경로 | 용도 |
|------|------|
| `/driversJoy/modalOpen` | 팝업 |
| `/driversJoy/timerText` | |
| `/driversJoy/title` | |
| `/driversJoy/priceKrw` | |
| `/driversJoy/purchasesUsed` | |
| `/driversJoy/maxPurchase` | |
| `/driversJoy/remainingLabel` | `N/M 가능` |
| `/driversJoy/ctaLabel` | |
| `/driversJoy/ctaDisabled` | |
| `/driversJoy/rewards` | 칩 목록 |

로비: `/lobby/showDriversJoy`

---

## 5. localStorage

| 키 | 내용 |
|----|------|
| `prism_dj_purchases_v1` | 구매 횟수 |
| `prism_dj_ends_at_v1` | 종료 ms |

---

## 6. UI

- 왼쪽 탭: 쇼핑몰 아래 (`salesLeftTabStackIndex('drivers', …)`)  
- `DriversJoyModal` + `purchase()`  
- 만료: `canShowTab() === false` → 탭 미렌더  

---

## 7. Host (코드 검증)

쇼핑몰과 **동일** `SalesHostBridge`(`sales/types.ts`) · `createPrismSalesHost(core)`.
차이: **일괄 보상** + **캐시만** 차감 (1차)

```ts
// sales/createPrismSalesHost.ts — 브리지 표면 → 코어 위임
grantRewards(lines)    -> core.grantSalesRewards(lines): string
trySpendCashKrw(a)     -> core.trySpendSalesCashKrw(a): boolean   // metaCashKrw
trySpendGems(a)        -> core.trySpendSalesGems(a): boolean      // 쇼핑몰 전용
getWallet()            -> core.getSalesWallet()
                          // { cashKrw, gems, gold, energy }
```

- 컨트롤러 바인딩: `salesRuntime.bindSalesToCore(core, bundle)` → `new DriversJoyController(b.drivers, host)`.
- 보상 타입(코어 switch 전부 구현): `energy | meta_gold | gems | supply_key | dna | open_box | equip_lv`.
- 드라이버 `purchase()`는 `trySpendCashKrw` + `grantRewards`만 호출(보석/SKU 미사용).

### 7-1. 레이어 / 마운트 (코드 검증)

| 요소 | 값 |
|------|-----|
| 마운트 | `App.tsx` `<SalesEventOverlay/>` (항상 마운트, `inset:0`) |
| 좌측 탭 | **z48** (`eventSideTabShellStyleLeft` `zIndex:48`), 아이콘 `MiniCarIcon` SVG bg `#3DDC84` |
| 모달 | **z62** (`DriversJoyModal` 루트 `zIndex:62`, 배경 `rgba(0,0,0,0.5)`) |
| 탭 top | `eventSideTabStackTopPx(battleLobby, salesLeftTabStackIndex('drivers', …))` (쇼핑몰 ON이면 +1칸) |
| 가시 | `hud['/lobby/showDriversJoy']`(기본 `true`) `∧ isBattleLobbyHud ∧ canShowTab()` |

---

## 8. registry

```ts
drivers_joy: driversJoy,
```

---

## 9. 2차 구현 훅 (CSV만 추가 가능)

| 기능 | 제안 |
|------|------|
| IAP | `dj_event_config.sku_id` + 영수증 검증 후 `purchase` |
| theme | `dj_theme_config.csv` + Modal 인라인 스타일 |
| 서버 구매 횟수 | HostBridge `getPurchaseCount` / `setPurchaseCount` |
| 캐시 부족 CTA | `getWallet().cashKrw` 로 선비활성 |

---

## 10. 검증

- 2회 구매 → 매진  
- `prism_dj_purchases_v1` 삭제 후 리셋  
- CSV `price_krw` 변경 → 재로드 후 `rebindSalesFromBundle` 반영


---

## 14. Deployed CSV Full Contents (public SSoT)

> **배포 SSoT.** AI는 이 내용을 임의 변경하지 말 것. 파일이 repo에 있으면 fetch 경로 그대로 사용.

### `public/event/driversJoy/dj_event_config.csv`

```csv
event_id,title,duration_hours,duration_minutes,max_purchase_per_player,price_krw,side_tab_label,banner_image,enabled
drivers_joy_01,드라이버의 기쁨,10.6,10,2,4400,드라이버,,1
```

### `public/event/driversJoy/dj_reward_config.csv`

```csv
event_id,sort_order,reward_type,reward_qty,reward_param,icon_asset_key,label
drivers_joy_01,1,energy,80,,bolt,⚡ 80
drivers_joy_01,2,meta_gold,50000,,coin,🪙 50K
drivers_joy_01,3,open_box,1,defense,box,🎁 지구방위 1회
```

