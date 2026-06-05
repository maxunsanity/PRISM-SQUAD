# 이벤트 시스템 관리 가이드

> **대상**: 운영자 · 기획자 · 개발자  
> **위치**: `src/eventSystem/`  
> **관련 문서**: 각 이벤트 폴더 내 `GAME.md` (기획) / `DEV.md` (개발)

---

## 1. 구조 개요

이벤트 시스템은 **두 레이어**로 관리된다.

```
레이어 1 (코드)  — 어떤 이벤트 모듈이 시스템에 등록되어 있나?
                   → src/eventSystem/registry.ts

레이어 2 (데이터) — 지금 어떤 이벤트가 실제로 켜져 있나?
                   → public/event/event_board_config.csv (enabled 컬럼)
```

| 작업 | 담당 레이어 | 수정 파일 |
|------|------------|-----------|
| 새 이벤트 종류 추가 | 코드 | `registry.ts` + 새 이벤트 폴더 |
| 이벤트 ON/OFF | 데이터 | `event_board_config.csv` |
| 이벤트 수치 조정 | 데이터 | 각 이벤트의 CSV |
| 호스트 게임 연동 | 코드 | `EventManager` import 한 줄 |

---

## 2. 폴더 구조

```
src/eventSystem/
├── EVENT_MANAGEMENT.md     ← 이 문서
├── registry.ts             ← 등록된 이벤트 모듈 목록 (코드 레벨)
├── EventManager.ts         ← 활성 이벤트 결정 + 라이프사이클 관리
├── index.ts                ← 바깥(App.tsx)이 import하는 유일한 진입점
│
├── tycoonSeason/           ← 타이쿤 마일리지 + 시즌 토너먼트 이벤트
│   ├── GAME.md             ← 이벤트 기획서
│   ├── DEV.md              ← 개발자 연동 요약
│   ├── HANDOFF.md          ← 인수인계
│   ├── core/               ← EventController, BotSimulator
│   ├── host/               ← EventBridge (호스트 게임 연결)
│   ├── jsonRender/         ← HUD/UI 컴포넌트
│   ├── store/              ← 이벤트 상태 (eventExternalStore)
│   ├── data.ts             ← CSV 로더 + 타입
│   └── index.ts            ← 이 이벤트의 public API
│
└── [새 이벤트 폴더]/       ← 추가 시 동일 구조로 생성
    └── ...

public/event/
├── tycoonSeason/           ← tycoonSeason 전용 CSV
│   ├── event_board_config.csv
│   ├── event_milestone_config.csv
│   ├── event_kill_reward_config.csv
│   ├── tournament_config.csv
│   ├── tournament_bot_name_pool.csv
│   ├── tournament_rank_reward_config.csv
│   ├── season_class_config.csv
│   ├── event_asset_config.csv
│   ├── event_ui_theme_config.csv
│   ├── event_help_config.csv
│   ├── event_help_acquire_config.csv
│   └── assets/
└── [새 이벤트 폴더]/       ← 추가 시 동일 구조로 생성
```

---

## 3. registry.ts — 이벤트 모듈 등록

`registry.ts`는 시스템에 **존재하는** 이벤트 모듈을 등록하는 파일이다.  
등록되지 않은 이벤트는 CSV에 있어도 절대 실행되지 않는다.

```ts
// src/eventSystem/registry.ts

import tycoonSeason from './tycoonSeason'
// import luckyTrain from './luckyTrain'   ← 추가 시 주석 해제

export const EVENT_REGISTRY: Record<string, EventModule> = {
  tycoon_season: tycoonSeason,
  // lucky_train: luckyTrain,
}
```

**새 이벤트 추가 시 여기에 한 줄만 추가한다.**

---

## 4. event_board_config.csv — 이벤트 ON/OFF

```
event_id, event_key,     enabled, event_name,         event_kind, ...
10001,    tycoon_season, 1,       겨울 타이쿤 챌린지, TYCOON_MILEAGE, ...
10002,    tycoon_season, 1,       시즌 익스프레스,     SEASON_EXPRESS, ...
20001,    lucky_train,   0,       럭키 트레인,          LUCKY_TRAIN, ...
```

| 컬럼 | 설명 |
|------|------|
| `event_key` | `registry.ts`의 키와 일치해야 함 |
| `enabled` | `1` = 활성, `0` = 비활성 (코드 수정 없이 끄고 켬) |

- 같은 `event_key`(모듈)에 여러 `event_id`(인스턴스)가 있을 수 있다
- `enabled=0`이면 해당 이벤트는 로드도, 렌더도 되지 않는다

---

## 5. EventManager.ts — 두 레이어 연결

`EventManager`가 레이어 1(registry)과 레이어 2(CSV)를 연결한다.

```
CSV enabled=1 행들
    ↓ event_key로 조회
registry.ts
    ↓ 매칭된 모듈만
활성 이벤트 인스턴스 구동
```

- **App.tsx는 `EventManager`만 import**한다. 개별 이벤트 이름을 알 필요 없다
- `EventManager`가 활성 이벤트의 init / tick / destroy 라이프사이클을 일괄 관리한다

---

## 6. 호스트 게임(스퀘어/PRISM SQUAD) 연동

```ts
// App.tsx — 호스트 게임 쪽 코드
import { EventManager } from '../eventSystem'

// 로드
const eventManager = new EventManager()
await eventManager.init()

// 인게임 킬 이벤트 전달 (호스트 → 이벤트)
eventManager.onEnemyKilled(enemyId, ticketMultiplier)

// 이벤트 분리 시: 이 import 한 줄만 제거하면 호스트 단독 복구
```

---

## 7. 이벤트 추가 체크리스트

새 이벤트를 추가할 때 순서:

1. `src/eventSystem/[새이벤트폴더]/` 생성 (동일 구조)
2. `registry.ts`에 한 줄 추가
3. `public/event/[새이벤트폴더]/event_board_config.csv`에 행 추가 (`enabled=0`으로 시작)
4. 기획 준비 완료 시 `enabled=1`로 변경
5. **코드 수정 없음**

---

## 8. 이벤트 제거 / 비활성화

| 목적 | 방법 |
|------|------|
| 일시 중지 | `event_board_config.csv`의 `enabled=0` |
| 코드에서 완전 제거 | `registry.ts`에서 해당 줄 삭제 |
| 폴더 보존(나중 재활용) | registry에서만 주석 처리, 폴더는 유지 |

---

## 9. 단독 빌드 (이벤트 시스템만)

이벤트 시스템은 `src/eventSystem/` + `public/event/`만으로 독립 실행 가능하다.

```
단독 실행 시:
  - 호스트 게임(GameCore, Renderer3D 등) 없음
  - EventBridge 대신 샌드박스 BotSimulator로 킬 이벤트 주입
  - 향후 event-sandbox 앱으로 분리 예정 (DEV.md 3차 로드맵)
```

---

## Anti-Patterns

### registry.ts 없이 App.tsx에서 직접 import
이벤트가 늘어날수록 호스트 코드가 오염된다. 반드시 `EventManager`를 통할 것.

### enabled 로직을 코드에 하드코딩
```ts
// ❌ 금지
if (eventId === 10001) { ... }

// ✅ 올바름
eventManager.getActiveEvents()
```

### 두 이벤트 폴더가 서로 import
각 이벤트 폴더는 완전 독립이어야 한다. 공통 로직이 필요하면 `eventSystem/shared/`로 올린다.

### event_key를 registry.ts와 다르게 쓰기
CSV의 `event_key`와 `registry.ts`의 키는 **정확히 일치**해야 한다.
