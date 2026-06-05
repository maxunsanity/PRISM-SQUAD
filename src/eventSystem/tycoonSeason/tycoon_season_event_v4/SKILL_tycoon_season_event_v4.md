---
name: tycoon-season-v4
description: Tycoon Season(타이쿤·시즌) 인게임 HUD 라이브 이벤트를 MD v4 + CSV만으로 재현할 때의 진입점 — EventBridge 연동, 적립 규칙, v4 규칙.
doc_generation: mdv4
condense_policy: forbidden
---

# SKILL — Tycoon Season (타이쿤·시즌) v4 진입점

> **사용법:** "이 폴더(`tycoon_season_event_v4/`)의 `SKILL_tycoon_season_event_v4.md` 읽고 이 이벤트 만들어".
> **함축 금지:** v4 = 기획서 원본·재현 계약. 요약·수치 변경 금지(함축은 v5).
> **호스트:** 스퀘어 코어에 **EventBridge로 붙는 인게임 HUD형** 부착 모듈. 코어 진입점 `src/prism_squad_v4/SKILL_prism_squad_v4.md`.

## ★ 데이터 구동 필수 (최우선 규칙)
이 폴더의 **CSV(= DEV §14 CSV 전문, 또는 동봉 `event_*.csv`)가 모든 수치·밸런스·구성의 단일 진실(SSoT)**다. 게임은 **반드시 이 CSV를 런타임에 fetch·파싱해 구동**하도록 만들 것 — **어떤 수치도 코드에 하드코딩 금지**(마일스톤 임계값·적립 base·배수 등). CSV에 없는 항목만 DEV 데이터 스키마로 생성하되, 생성 후에도 CSV로 빼서 구동(데이터구동화). 이게 "에셋·수치 교체로 다양한 버전 양산"의 전제다.

## 0. 이 게임은 무엇인가
- **Tycoon Season** = 별도 게임 화면이 아니라 **인게임 HUD형 라이브 이벤트**. 일반/라바 전투 중 **상시 표시**되는 마일리지 바 + 토너먼트 패널.
- 전투 킬 → **타이쿤 포인트(TP) / 시즌 코인** 적립 → 마일스톤 보상 + **토너먼트(50명·봇49)** 순위 → 시즌 **클래스 승급**.
- **별도 진입 화면 없음** (사이드탭으로 여닫는 게 아니라 HUD로 항상 떠 있음).

## 1. 읽기 순서 (필수)
1. **이 SKILL**
2. `GAME_tycoon_season_v4.md` — 마일리지·토너먼트·시즌 규칙 + **코어 연동**
3. `DESIGN_tycoon_season_event_v4.md` — HUD 슬롯 배치(마일리지 좌상단/토너먼트 우측/모달 z60)·`/event/*` 경로
4. `DEV_tycoon_season_event_v4.md` — EventBridge·EventController + §14 CSV 전문
5. `RECIPE_tycoon_season_event.md` → `RECIPE_CODE_tycoon_season_event.md`
6. `HANDOFF_tycoon_season_event_v4.md`

## 2. 코딩 전 7항목 요약
```
- 이 이벤트는 무엇인가(HUD형):
- 핵심 기술 구조(EventBridge·EventController·eventExternalStore):
- 선언형(event HUD spec) vs 명령형 경계:
- 가장 주의할 Anti-Pattern 3개:
- RECIPE / RECIPE_CODE 있음 여부:
- public CSV 목록(public/event/tycoonSeason/):
- 코어 연동 메서드(onEnemyKilled/tick…):
```

## 3. 비주얼
- **인앱 React HUD** — 코어 `style.css` 공유(별 iframe 아님). 슬롯: 마일리지 좌상단, 토너먼트 우측, 모달 inset z60, 보상 팝업 z80. 상태 = `eventExternalStore`의 `/event/*` 경로(코어 `/hud/*`·`/lobby/*`와 분리).
- z-index: 이벤트 HUD 40(로비)/11(전투).

## 4. 에셋 교체 시스템
- **자체 에셋/색 토큰 시스템 보유** — `public/event/tycoonSeason/event_asset_config.csv`(`asset_key, asset_type, url, fallback_text`). url 있으면 `<img>`, 없으면 `fallback_text`. 전용 `assets/`(season_coin.png 등). (코어 UI보다 토큰화 수준 높음.)

## 5. 코어(스퀘어 호스트) 연동 — 계층 ③ EventBridge (인게임 킬 적립)
- **연결:** `App.tsx`가 `new EventBridge(eventData)` 생성 → `core.attachEventBridge(bridge)`. (코어는 `import type`만 — 약결합)
- **코어→이벤트:** `onEnemyKilled(enemyId, ticketMultiplier)` · `tick(dt)` · `syncTicketMultiplier(mult)`. ⚠️ **`onBossKilled`/`onGameEnd` 메서드 없음** — 보스는 `onEnemyKilled('final_boss', mult)`, 종료는 코어가 pull.
- **적립:** `EventController.onEnemyKilled` → `event_kill_reward_config.csv`(`enemy_id,tycoon_point_base,season_point_base,is_boss`). `getKillsRequired`만큼 킬 누적 시 `max(1, floor(point_base × max(1,mult)))` 적립(킬당 즉시 아님).
- **이벤트→코어:** 결과창 `tycoonEarned` = 코어가 `getTycoonPoints()` **pull**(브릿지 미부착 시 폴백 `(killCount + result_clear_bonus_kills) × ticketMultiplier`). 마일스톤/순위 보상은 `onRewardGranted(bundleId)` 콜백.
- **배수:** `public/ticket_multiplier_step.csv`(1/2/5/10/50/100), 비용 = `multiplier × meta.energy_per_mult`.
- **화면 전환 효과 없음** — 상시 HUD라 진입/이탈 오버레이가 없음.
- **빌드 스코프:** 코어 단독 = `eventData=null` → `attachEventBridge(null)` → 전부 no-op(결과창은 폴백). 통합 = 위 바인딩.

## 6. v4 규칙 + 고유 Anti-Patterns
- 함축 금지 / CSV §14 동일·수치 변경 금지 / RECIPE_CODE 임의 수정 금지.
- **`/event/*` ↔ `/hud/*`·`/lobby/*` 혼용 금지** · 타이쿤 store와 세일(mall/drivers) store 공유 금지.
- 토너먼트/시즌 패널은 **우측**(좌측 아님) · `onRewardGranted`는 브릿지에 있으나 App 연결은 단계적(미연결일 수 있음 — 코드 확인).

## 7. 빌드
```bash
cd "/Users/max/minigame_make/PRISM SQUAD v2"
npm run build
node mdv4_generator/build_mdv4_docs.mjs
```

## 8. 완성 체크리스트
- [ ] GAME(마일리지·토너먼트·시즌) + 코어 연동 / DESIGN(HUD 슬롯·/event/*) / DEV(EventBridge·EventController·§14 CSV) / RECIPE + RECIPE_CODE / HANDOFF
- [ ] `onEnemyKilled`/`tick`/`getTycoonPoints` 연동 + 적립 누적 규칙
- [ ] 코어 단독(attachEventBridge(null)) no-op 확인
- [ ] `npm run build` 통과
