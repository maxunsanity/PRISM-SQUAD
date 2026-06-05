---
name: mall-marvels-v4
description: Mall Marvels(쇼핑몰의 경이로움) 세일 라이브 이벤트를 MD v4 + CSV만으로 재현할 때의 진입점 — SalesHostBridge 연동, 단계 구매, v4 규칙.
doc_generation: mdv4
condense_policy: forbidden
---

# SKILL — Mall Marvels (쇼핑몰의 경이로움) v4 진입점

> **사용법:** "이 폴더(`mall_marvels_event_v4/`)의 `SKILL_mall_marvels_event_v4.md` 읽고 이 이벤트 만들어".
> **함축 금지:** v4 = 기획서 원본·재현 계약. 요약·수치 변경 금지(함축은 v5).
> **호스트:** 스퀘어 코어에 **세일 오버레이(SalesHostBridge)** 로 붙는 부착 모듈. 코어 진입점 `src/prism_squad_v4/SKILL_prism_squad_v4.md`.

## ★ 데이터 구동 필수 (최우선 규칙)
이 폴더의 **CSV(= DEV §14 CSV 전문, 또는 동봉 `.csv`)가 모든 수치·상품·비용의 단일 진실(SSoT)**다. 게임은 **반드시 이 CSV를 런타임에 fetch·파싱해 구동**하도록 만들 것 — **어떤 수치도 코드에 하드코딩 금지**(단계 상품·FREE/GEMS/CASH 비용·보상). CSV에 없는 항목만 DEV 데이터 스키마로 생성하되, 생성 후에도 CSV로 빼서 구동(데이터구동화). 이게 "에셋·수치 교체로 다양한 버전 양산"의 전제다.

## 0. 이 게임은 무엇인가
- **Mall Marvels** = 세일(상점형) 라이브 이벤트. **단계별(step) 상품** 구매 — 1~2단계 FREE, 3단계부터 GEMS/CASH 유료. 게임 플레이가 아닌 구매 UI.

## 1. 읽기 순서 (필수)
1. **이 SKILL**
2. `GAME_mall_marvels_event_v4.md` — 단계·상품·비용 + **코어 연동**
3. `DESIGN_mall_marvels_event_v4.md` — 세일 탭/모달 UI(좌측 세로탭·모달 z62)
4. `DEV_mall_marvels_event_v4.md` — 컨트롤러·store + §14 CSV 전문
5. `RECIPE_mall_marvels_event.md` → `RECIPE_CODE_mall_marvels_event.md`

## 2. 코딩 전 7항목 요약
```
- 이 이벤트는 무엇인가(세일 단계 구매):
- 핵심 기술 구조(MallMarvelsController·SalesHostBridge·store):
- 선언형(React 모달) vs 명령형 경계:
- 가장 주의할 Anti-Pattern 3개:
- RECIPE / RECIPE_CODE 있음 여부:
- public CSV 목록(public/event/mallMarvels/):
- 코어 연동 인터페이스(getWallet/trySpend/grant):
```

## 3. 비주얼
- **인앱 React 세일 오버레이** — 코어 `style.css` 공유. 좌측 세로 세일 탭(`eventSideTabShellStyleLeft`, 아이콘은 SVG `ShoppingBagIcon` — 🛍️ 이모지 아님), 모달 z62. 2D 스케치 베이지 톤. 단계 카드 3상태 CTA 색(`#3DDC84`/`#E8DFD1`/`#cccccc`).
- 상태 = `mallMarvelsStore`.

## 4. 에셋 교체 시스템
- **현재 url 컬럼 없음 — 하드코딩 SVG.** 에셋화 시 코어 `DEV §9-A UI 확장 규칙`(asset_key+url+fallback) 따름.

## 5. 코어(스퀘어 호스트) 연동 — 계층 ② SalesHostBridge
- **진입:** 로비 **좌측 세로 탭** 🛍️ → `MallMarvelsController.openModal` → React 모달(`SalesEventOverlay`). 진입 시 iframe 미니게임 자동 닫힘(`hideEventMinigameForOverlay`). 노출 = `/lobby/showMallMarvels`. (탭 z48 → 모달 z62 승격.)
- **인터페이스:** `getWallet()`({cashKrw,gems,gold,energy}) · `trySpendGems(a)` · `trySpendCashKrw(a)` · `grantSalesRewards(lines)`(코어로 위임).
- **보상 타입(`reward_type`):** `energy|meta_gold|gems|supply_key|dna|open_box|equip_lv`. `open_box`/`equip_lv`는 상자 등급표 `pickWeighted`→`_grantBoxEquipment`(등급표 없으면 fallback gold).
- **결제:** 단계별 FREE / GEMS / CASH(원, `metaCashKrw`).
- **화면 전환 효과 없음** — 세일 모달이라 사선 블라인드 대상 아님.
- **빌드 스코프:** 세일 데이터 부재 시 **throw → App `.catch()` 무시 = 코어 무영향**(코드 내장 폴백 데이터 없음). 런타임 OFF = `/lobby/showMallMarvels`.

## 6. v4 규칙 + 고유 Anti-Patterns
- 함축 금지 / CSV §14 동일·수치 변경 금지 / RECIPE_CODE 임의 수정 금지.
- **`getDefaultMallMarvelsData()` 같은 코드 내장 폴백 없음** — 데이터 없으면 컨트롤러 미생성(no-op). 잘못 가정 금지.
- 사이드 탭 아이콘 = **SVG**(이모지 아님) · 타이쿤 store 공유 금지.

## 7. 빌드
```bash
cd "/Users/max/minigame_make/PRISM SQUAD v2"
npm run build
node mdv4_generator/build_mdv4_docs.mjs
```

## 8. 완성 체크리스트
- [ ] GAME(단계·상품·비용) + 코어 연동 / DESIGN(좌측탭·모달 z62) / DEV(컨트롤러·store·§14 CSV) / RECIPE + RECIPE_CODE
- [ ] `getWallet`/`trySpend*`/`grantSalesRewards` 연동 + reward_type 7종
- [ ] 데이터 부재 시 코어 무영향(no-op) 확인
- [ ] `npm run build` 통과
