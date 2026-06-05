---
name: drivers-joy-v4
description: Driver's Joy(드라이버의 기쁨) 단일 IAP 특가 세일 이벤트를 MD v4 + CSV만으로 재현할 때의 진입점 — SalesHostBridge 연동, 캐시 결제, v4 규칙.
doc_generation: mdv4
condense_policy: forbidden
---

# SKILL — Driver's Joy (드라이버의 기쁨) v4 진입점

> **사용법:** "이 폴더(`drivers_joy_event_v4/`)의 `SKILL_drivers_joy_event_v4.md` 읽고 이 이벤트 만들어".
> **함축 금지:** v4 = 기획서 원본·재현 계약. 요약·수치 변경 금지(함축은 v5).
> **호스트:** 스퀘어 코어에 **세일 오버레이(SalesHostBridge)** 로 붙는 부착 모듈. 코어 진입점 `src/prism_squad_v4/SKILL_prism_squad_v4.md`.

## ★ 데이터 구동 필수 (최우선 규칙)
이 폴더의 **CSV(= DEV §14 CSV 전문, 또는 동봉 `.csv`)가 모든 수치·패키지·비용의 단일 진실(SSoT)**다. 게임은 **반드시 이 CSV를 런타임에 fetch·파싱해 구동**하도록 만들 것 — **어떤 수치도 코드에 하드코딩 금지**(IAP 패키지·CASH 비용·보상). CSV에 없는 항목만 DEV 데이터 스키마로 생성하되, 생성 후에도 CSV로 빼서 구동(데이터구동화). 이게 "에셋·수치 교체로 다양한 버전 양산"의 전제다.

## 0. 이 게임은 무엇인가
- **Driver's Joy** = **단일 IAP 특가 패키지 팝업** 라이브 이벤트. 캐시(원) 결제 1회성 번들. (Mall Marvels가 다단계 상점이라면 이쪽은 단일 패키지.)

## 1. 읽기 순서 (필수)
1. **이 SKILL**
2. `GAME_drivers_joy_event_v4.md` — 패키지·보상·비용 + **코어 연동**
3. `DESIGN_drivers_joy_event_v4.md` — IAP 팝업 UI(좌측 탭·모달 z62·차 SVG)
4. `DEV_drivers_joy_event_v4.md` — 컨트롤러·store + §14 CSV 전문
5. `RECIPE_drivers_joy_event.md` → `RECIPE_CODE_drivers_joy_event.md`

## 2. 코딩 전 7항목 요약
```
- 이 이벤트는 무엇인가(단일 IAP 팝업):
- 핵심 기술 구조(DriversJoyController·SalesHostBridge·store):
- 선언형(React 모달) vs 명령형 경계:
- 가장 주의할 Anti-Pattern 3개:
- RECIPE / RECIPE_CODE 있음 여부:
- public CSV 목록(public/event/driversJoy/):
- 코어 연동 인터페이스(getWallet/trySpendCashKrw/grant):
```

## 3. 비주얼
- **인앱 React 모달** — 코어 `style.css` 공유. 좌측 세로 탭(아이콘 SVG `MiniCarIcon` 빨간 차 — 🚗 이모지는 햄버거 메뉴에만), 모달 z62, 본문 차 일러스트 `DriversJoyCar` SVG. 2D 스케치 베이지 톤.
- 상태 = `driversJoyStore`.

## 4. 에셋 교체 시스템
- **현재 url 컬럼 없음 — 하드코딩 SVG.** 에셋화 시 코어 `DEV §9-A UI 확장 규칙` 따름.

## 5. 코어(스퀘어 호스트) 연동 — 계층 ② SalesHostBridge
- **진입:** 로비 좌측 세로 탭 🚗 → `DriversJoyController.openModal` → React 모달. 노출 = `/lobby/showDriversJoy`. (탭 z48 → 모달 z62.)
- **인터페이스:** 브리지 표면 `getWallet()` · `trySpendCashKrw(a)` · `grantRewards(lines)` → 코어 `getSalesWallet`/`trySpendSalesCashKrw`/`grantSalesRewards`로 위임. (브리지에 `trySpendGems`도 있으나 드라이버는 미사용.)
- **결제:** CASH(원, `metaCashKrw`). **보상 타입:** `energy|meta_gold|gems|supply_key|dna|open_box|equip_lv`.
- **화면 전환 효과 없음** — 세일 모달이라 사선 블라인드 대상 아님.
- **빌드 스코프:** 세일 데이터 부재 시 코어 무영향(데이터 없으면 컨트롤러 미생성). 런타임 OFF = `/lobby/showDriversJoy`.

## 6. v4 규칙 + 고유 Anti-Patterns
- 함축 금지 / CSV §14 동일·수치 변경 금지 / RECIPE_CODE 임의 수정 금지.
- 좌측 탭 아이콘 = **SVG `MiniCarIcon`**(🚗 이모지 아님) · 본문 차 = `DriversJoyCar` SVG · 세일 store(타이쿤과) 분리 · 코드 내장 폴백 데이터 없음.

## 7. 빌드
```bash
cd "/Users/max/minigame_make/PRISM SQUAD v2"
npm run build
node mdv4_generator/build_mdv4_docs.mjs
```

## 8. 완성 체크리스트
- [ ] GAME(패키지·보상·비용) + 코어 연동 / DESIGN(좌측탭·모달·차 SVG) / DEV(컨트롤러·store·§14 CSV) / RECIPE + RECIPE_CODE
- [ ] `getWallet`/`trySpendCashKrw`/`grantSalesRewards` 연동
- [ ] 데이터 부재 시 코어 무영향 확인
- [ ] `npm run build` 통과
