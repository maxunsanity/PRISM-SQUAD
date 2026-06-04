---
doc_generation: mdv4
condense_policy: forbidden
pairs_with: RECIPE_CODE_tycoon_season.md
---

# Tycoon Season — RECIPE.md (v4)

> 패턴 설명만. 코드는 `tycoonSeason/jsonRender/registry.tsx` · `core/EventController.ts` SSoT.

---

## R-01. 호스트 킬 → TP 적립

- **위치:** `GameCore._onEnemyDeath` → `EventBridge.onEnemyKilled(enemyId, ticketMultiplier)`
- **데이터:** `event_kill_reward_config.csv` — `tycoon_point_base` × 배수
- **규칙:** enemy_id 없으면 `basic` → `mini_boss` fallback. 보스는 `final_boss` 행

## R-02. 마일스톤 자동 수령

- **위치:** `EventController` tick / onEnemyKilled 후
- **데이터:** `event_milestone_config.csv` + `milestone_group_id` from board
- **규칙:** `required_point` 도달 시 popup 큐 — `milestonePopupVisible`

## R-03. json-render 3종 세트 (이벤트 HUD)

| 파일 | 역할 |
|------|------|
| `eventHudSpec.ts` | `$state` 바인딩 |
| `catalog.ts` | Zod 검증 |
| `registry.tsx` | React 구현 |

**슬롯:** `EventHudRenderer slot=mileage|tournament|modal`

## R-04. App.tsx 표시 조건

- `showEventHud = shouldShowEventHud && !iframeOpen`
- **라바 호스트 전투 중에도 타이쿤·시즌 표시** (`lavaQuestActive`는 HUD 숨김에 사용 안 함)
- iframe 로비(`minigame/visible`)일 때만 이벤트 HUD 숨김

## R-05. 재화 비행 연출

- `EventCurrencyFlyOverlay` — 킬 좌표 → `data-event-anchor="tycoon-gauge"` / `season-tab`
- absorb 이벤트: `event:tycoonGaugeAbsorb`, `event:seasonTabAbsorb`

## R-06. 토너먼트 봇

- `BotSimulator` — CSV가 아닌 코드 상수(문서화: GAME.md mechanics)
- v5에서 `tournament_bot_behavior.csv` 분리 예정

---

## Anti-Patterns

- `eventStore` 키를 `hudStore`에 복제 금지
- `tycoonSeason` CSV를 mallMarvels와 공유 금지
- 익스프레스 ON 시 `tournamentVisible=false` (board CSV)

---

전량 HANDOFF: `HANDOFF_tycoon_season_v4.md` (같은 폴더)
