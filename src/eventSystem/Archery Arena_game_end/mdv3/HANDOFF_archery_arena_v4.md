# Archery Arena × PRISM SQUAD 호스트 연동 (HANDOFF)

> **용도:** AI·개발자가 동일 미니게임을 PRISM 로비에 다시 붙일 때 참조하는 **단일 인수인계 문서**.  
> 게임 규칙·연출·CSV 상세는 `GAME_archery_arena_v4.md` / `DEV_archery_arena_v4.md` 와 함께 읽는다.

**최종 반영:** 2026-06-04

---

## 1. 한 줄 요약

| 항목 | 내용 |
|------|------|
| 슬롯 | `eventMinigameRegistry` id **`archery`** (라바·퍼즐과 동일 iframe 호스트) |
| 배포 | `public/event/archeryArena/` (`npm run build:archery` → PRISM `npm run build` 선행) |
| 입장 | 로비 우측 🏹 사이드탭 → `openEventMinigame('archery')`, **입장 무료**(host config `ticket_cost=0`) |
| 재화 | **활대**(주사위 아님). 호스트 `prism_archery_host_v1` · iframe은 표시만 동기화 |
| 도전 | 활대 **1개** 소비 → **5발** WebGL 연출(SET5 점수표, `shots_per_bow=5`) → 로비 복귀 |
| 토너먼트 | **30분** 라운드 → 종료 후 **보상 수령 필수** → `event:grant`→`grantReward`(gem/gold) → 새 라운드 |
| 활대 수급 | 코어 전투 적 처치 **`KILLS_PER_BOW=100`마리당 활대 +1** (`archeryOnEnemyKill` ← `GameCore._onEnemyDeath`) |
| 스퀘어 전투 | **불필요** (라바 suspend/resume 없음 — 활대만 코어 킬에서 누적) |

### 코어 재화 사이클 (한눈에)

```
[코어 전투]  적 1킬 → archeryOnEnemyKill()
                       ├─ /archery/killsTowardBow += 1
                       └─ killsTowardBow ≥ 100 → /lobby/archeryBowStands += 1, 누적 0 리셋
[이벤트 진입] 🏹 탭(무료) → aa:ready → host:archeryInit{ bowStands, killsTowardBow, killsPerBow }
[도전]        활대 1개 소비(aa:consumeBow→archeryConsumeBow) → 5발 연출 → 순위 갱신
[라운드 종료] aa:claimPending → 결과/보상 → event:grant{bundleId}
                       └─ archeryBundleToGrant(bundleId) → grantReward(gem/gold) → aa:claimed
```

---

## 2. PRISM 쪽 파일 맵 (실제 경로)

| 역할 | 경로 |
|------|------|
| 레지스트리 | `src/game/eventMinigameRegistry.ts` — `archery` 항목 |
| 호스트 API | `src/game/eventMinigameHost.ts` — `openEventMinigame` (archery는 입장 시 활대 차감 **없음**) |
| 활대·킬·저장 | `src/game/archeryMeta.ts` |
| 번들→지급 | `archeryMeta.archeryBundleToGrant` ← `aa_bundle_reward_config.csv` |
| 레드닷 | `src/game/eventRedDots.ts` + `hudStore` `/event/redDot/archery` |
| message | `src/App.tsx` — `aa:*`, `host:archeryInit`, `event:grant` |
| iframe 셸 | `src/jsonRender/EventMinigameOverlay.tsx` |
| 로비 탭 | `src/jsonRender/registry.tsx` — `EventMiniCards` |
| 햄버거 ON/OFF | `src/jsonRender/LobbyMenuDropdown.tsx` — `/lobby/showArcheryArena` |
| 스택 위치 | `src/eventSystem/tycoonSeason/jsonRender/eventHudLayout.ts` — `archery` 인덱스 |
| 처치 연동 | `src/game/GameCore.ts` — `archeryOnEnemyKill()` |

### hudStore 경로 (PRISM)

| 경로 | 타입 | 설명 |
|------|------|------|
| `/lobby/showArcheryArena` | boolean | 오른쪽 🏹 탭 노출 |
| `/lobby/archeryBowStands` | number | 로비 탭에 `N대` 표시 |
| `/archery/killsTowardBow` | number | 0~99 누적 (100 도달 시 활대+1) |
| `/archery/claimPending` | boolean | 토너먼트 종료·미수령 |
| `/event/redDot/archery` | boolean | 수령 가능 시 레드닷 |

---

## 3. iframe 쪽 파일 맵 (Archery Arena_game_end)

| 역할 | 경로 |
|------|------|
| 진입 | `src/main.tsx` — React HUD 후 `import('./gameEntry.js')` |
| 부트 | `src/gameEntry.js` — CSV 로드 → **dynamic** `import('./game.js')` (TDZ 방지) |
| 게임 본체 | `src/game.js` — `startGame(loaded)` |
| CSV | `src/data.js` — `resolveCsvUrl()` 상대 경로 fetch |
| 호스트 브릿지 | `src/hostBridge.js` — postMessage |
| UI | `src/ui.js`, `index.html`, `src/style-ui.css` |
| Three | `src/three/setup.js`, `target.js`, `arrow_shot.js` |
| Vite | `vite.config.ts` — `base: '/event/archeryArena/'`, outDir → `public/event/archeryArena` |

> ⚠️ DEV 문서에 나온 `ArcheryGame.ts` / `screens/*.tsx` / `bootstrapGame.ts` 는 **미구현(목표 구조)**. 실제는 **바닐라 `game.js` + DOM 화면**.

---

## 4. CSV SSoT (public · 배포 후 동일 경로)

| 파일 | 용도 |
|------|------|
| `aa_event_config.csv` | Bullseye 확률, group_size, (레거시) bot_tick_min/max |
| `aa_attempt_config.csv` | SINGLE/SET3/SET5 — **PRISM 플로우는 SET5만 사용** |
| `aa_visual_config.csv` | 화살·링·파티클 ms |
| `aa_rank_reward_config.csv` | 순위 구간·`reward_bundle_id` (UI 설명) |
| **`aa_integration_config.csv`** | **30분·5발·100킬·기본 활대 5·storage 키·배포 base** |
| **`aa_bundle_reward_config.csv`** | **`event:grant` 실지급** (gem/gold/slot_id) |

`aa_integration_config.csv` 키 목록은 `DEV_archery_arena_v4.md` §7.1 참고.

---

## 5. postMessage 프로토콜 (archery 전용)

### iframe → PRISM

| type | payload | 동작 |
|------|---------|------|
| `aa:ready` | — | iframe 기동 완료 → host가 `host:archeryInit` 회신 |
| `aa:consumeBow` | — | 5발 도전 요청 → host `archeryConsumeBow()` |
| `aa:claimPending` | `{ pending: boolean }` | 라운드 종료·미수령 → 레드닷 |
| `aa:claimed` | — | 보상 수령 완료 → host `claimPending` 해제 |
| `aa:toast` | `{ message: string }` | 호스트 ToastOverlay (z530) |
| `event:grant` | `{ bundleId, rewards: [] }` | `GameCore.grantReward` (rewards 비면 bundleId로 CSV 매핑) |

### PRISM → iframe

| type | payload | 동작 |
|------|---------|------|
| `host:archeryInit` | `bowStands, claimPending, killsTowardBow, killsPerBow, roundBlocked` | 활대 수·라운드 차단 동기화 |
| `host:bowConsumed` | 위와 동일 | 소비 성공 → `runFiveBowRound()` |
| `host:bowDenied` | 위와 동일 | 활대 부족 → iframe 토스트 |
| `host:eventDispose` | `{ eventId: 'archery' }` | 탭 전환·닫기 — LS 키 정리 (`eventMinigameRegistry.persistKeys`) |

### 라바와 공통

| type | 비고 |
|------|------|
| `event:showRewardDetail` | 장비 보상 설명 (archery도 동일 규칙 가능) |
| `host:closeRewardDetail` | 미니게임 닫을 때 |

---

## 6. 플레이어 플로우 (QA)

```mermaid
sequenceDiagram
  participant L as PRISM 로비
  participant H as archeryMeta
  participant I as iframe Archery

  L->>I: openEventMinigame(archery)
  I->>L: aa:ready
  L->>I: host:archeryInit (bowStands=5)
  I->>I: Entry → Lobby
  Note over I: 스퀘어 100킬마다 H += 활대
  I->>L: aa:consumeBow
  L->>H: archeryConsumeBow()
  L->>I: host:bowConsumed
  I->>I: 5발 WebGL 연출
  Note over I: 30분 후 라운드 종료
  I->>L: aa:claimPending
  I->>I: Result → Reward
  I->>L: event:grant(bundleId)
  I->>L: aa:claimed
  I->>I: startNewTournamentPeriod()
```

---

## 7. 구현 시 주의 (버그 재발 방지)

| 이슈 | 원인 | 해결 |
|------|------|------|
| `Cannot access 'T' before initialization` | `refreshRank()`가 `let shootingBusy` **선언 전** 호출 | `shootingBusy`를 `startGame` **상단**에 선언 |
| 데이터 로드 실패 (404) | CSV 절대경로 `/event/...` 만 사용 | `data.js` `resolveCsvUrl()` — index.html 기준 상대 URL |
| 데이터 로드 실패 (TDZ) | `gameEntry`가 `game.js` 정적 import | `gameEntry` → dynamic import `game.js` |
| 활대 없는데 메시지 없음 | `btn-attempt` **disabled** | 활대 0이어도 클릭 가능 + 토스트 |
| 연출 없이 점수만 | `runFiveBowRound`가 합산만 함 | `runShootingScene(..., { autoAdvance: true })` × 5 |
| 호스트 토스트 안 보임 | Toast z-index < iframe | iframe 열림 시 Toast **z530** |
| 1대만 표시 | `STARTER_BOW_STANDS=1` 시절 저장 | `starterV2` 마이그레이션 → **5** (`aa_integration_config.csv`) |

---

## 8. 빌드·배포

```bash
# PRISM 루트
npm run build:archery   # → public/event/archeryArena/
npm run build          # build 스크립트에 archery 선행 포함
npm run dev            # dev도 archery 빌드 후 vite (CSV 존재 보장)
```

zip 업로드 시 **`dist/event/archeryArena/`** 폴더(CSV+index+assets)가 **반드시** 포함되어야 한다.

---

## 9. AI 재생성 체크리스트

- [ ] CSV 6개 `public/` (소스) + 빌드 산출물 동기화
- [ ] `eventMinigameRegistry` + `EVENT_MINIGAME_ORDER`에 `archery`
- [ ] `archeryMeta.ts` + `GameCore` 처치 훅
- [ ] `App.tsx` postMessage 6종
- [ ] `hostBridge.js` + `game.js` 5발 연출 + claim 플로우
- [ ] `gameEntry.js` dynamic import
- [ ] `shootingBusy` 선언 순서
- [ ] `SALES_EVENTS_PLAN.md` §9 archery 행 보강

---

## 10. 관련 문서

| 문서 | 내용 |
|------|------|
| `GAME_archery_arena_v4.md` | 활대·5발·30분·보상 규칙 (components/mechanics) |
| `DEV_archery_arena_v4.md` | 실제 파일 트리·CSV 스키마·DOM id |
| `RECIPE_archery_arena.md` / `RECIPE_CODE_*.md` | R-08~ PRISM·dynamic import 패턴 |
| `../SALES_EVENTS_PLAN.md` (PRISM) | 미니게임 호스트 공통 §9 |
