---
doc_generation: mdv4
condense_policy: forbidden
---

# Driver's Joy — RECIPE.md (v4)

## R-01. 단일 IAP 패키지

- `dj_event_config.csv` + `dj_reward_config.csv`
- 구매 횟수: `prism_dj_purchases_v1` vs `max_purchase`

## R-02. SalesHostBridge

- Mall Marvels와 동일 호스트 API
- 모듈·CSV·LS 키 **공유 금지**

## R-03. CSV fallback

- `getDefaultDriversJoyData()` — dev only

코드 SSoT: `core/DriversJoyController.ts`
