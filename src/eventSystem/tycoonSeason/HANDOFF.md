# 이벤트 모듈 — 짧은 인수인계

> 전체 프로젝트·폴더·다음 채팅 프롬프트: **[`../../HANDOFF.md`](../../HANDOFF.md)**

## 읽을 것 (이 모듈만)

1. [`GAME.md`](./GAME.md) — 기획 SSoT (+ `## 코어 연동` 섹션: EventBridge API·적립·빌드 스코프)
2. [`DEV.md`](./DEV.md) — 코드 연동 명세 (파일구조·EventBridge API·$state·CSV)
3. [`DESIGN.md`](./DESIGN.md) — HUD 레이아웃·z-index·컴포넌트 픽셀 명세

## 메인 UI 진입

| 이벤트 | HUD | 메인 창 |
|--------|-----|---------|
| 타이쿤 | `EventTycoonMileageBar` (상단) | `EventMilestoneListPopup` → `EventTycoonMainModal` |
| 시즌 | `EventTournamentLeaderboard` (우측 탭) | `EventTournamentPanel` → `EventTournamentBoardModal` |

획득 방법 블록: `EventAcquireRulesSection` in `eventMonopolyUi.tsx`  
데이터: `event_help_acquire_config.csv` + `event_help_config.csv`

## export

```ts
import { loadAllEventData, EventBridge, EventHudRenderer, EventDataProvider } from './eventSystem';
```

## 코어 연동 (요약 — 상세는 GAME.md `## 코어 연동`)

- 별도 진입 화면 없음. 전투/라바 전투 중 **상시 HUD**.
- 코어→이벤트 메서드는 4개: `onEnemyKilled(enemyId, mult)`(보스=`'final_boss'`), `tick(dt)`, `syncTicketMultiplier(mult)`.
  - **`onBossKilled`/`onGameTick`/`onGameEnd` 없음.**
- 이벤트→코어: 결과창은 `getTycoonPoints()` pull, 보상은 `onRewardGranted(bundleId)` 콜백(현재 미연결).
- 배수: `ticket_multiplier_step.csv`(1/2/5/10/50/100), 비용 = `mult × meta.energy_per_mult`. (`ticket_config.csv`는 미사용 기획표)

## 분리

`src/eventSystem/` + `public/event/` 이전 → 호스트(`App.tsx`)에서 `EventBridge` import·attach 제거.
`attachEventBridge(null)`이면 코어의 모든 `eventBridge?.…` 호출이 no-op → 코어 단독 무영향.
