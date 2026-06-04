---
doc_generation: mdv4
condense_policy: forbidden
---

# Mall Marvels — RECIPE.md (v4)

## R-01. SalesHostBridge

- 호스트 `GameCore.grantSalesRewards` / `trySpendGems` / `trySpendSalesCashKrw`
- **타이쿤 eventStore 미사용**

## R-02. Step ladder

- `lock_state`: prereq_step_id 체인
- persist: `prism_mm_claimed_v1`, `prism_mm_ends_at_v1`

## R-03. CSV 실패 fallback

- `getDefaultMallMarvelsData()` in `data.ts` — **배포 zip은 public CSV 필수**. fallback은 dev만.

## R-04. UI

- 좌측 탭: `eventSideTabShellStyleLeft`
- 모달 z62: `SalesEventOverlay`

코드 SSoT: `core/MallMarvelsController.ts`, `jsonRender/MallMarvelsModal.tsx`
