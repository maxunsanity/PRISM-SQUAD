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

## 10. 미니게임 재화 적립 — 호스트 `MinigameCurrencyService`

iframe 미니게임(퍼즐·양궁)의 재화는 **스퀘어 전투에서 적을 잡아 번다.** 호스트가 적립을 소유하고, iframe은 그 재화를 **빌려 쓰는 소비자**다.

> ⚠️ **라바는 제외.** 라바는 코어 전투로 진입하는 단독 플레이라 이 서비스의 적립 대상이 아니다(`SQUARE_CURRENCY_IDS = ['prize','archery']`). 라바 입장권은 별도.

**파일:** `src/game/minigameCurrency/MinigameCurrencyService.ts`

**적립 규칙 (타이쿤 `onEnemyKilled` 누적식과 동일):**
- `onEnemyKilled(enemyId, ticketMultiplier)` → 적 처치마다 `prize`·`archery` 각각 **누적 카운터** +1.
- 적 종류·일반/보스 구분: `event_minigame_kill_reward_config.csv`(`enemy_id, prize_base, archery_base, is_boss`).
- 필요 킬 수: `event_minigame_acquire_config.csv`(`minigame_id, target_type[normal|boss], kills_required, reward_label, …`).
- 누적이 `kills_required`에 도달하면 `max(1, floor(base × max(1,ticketMultiplier)))` 만큼 지급하고 카운터 0으로 리셋.
- `onStageClear(mult)` → `combat_tuning.csv` `stage_clear_prize_bonus` 만큼 추가 지급(승리 시).
- 영속: `prism_squad_save_v1`의 `minigameCurrency` 필드(GameCore `_saveMeta`/`_loadMeta`). 양궁 레거시 `prism_archery_host_v1` 마이그레이션 포함.

**밸런스 레버:** 난이도는 **`event_minigame_acquire_config.csv`의 `kills_required`** 가 단일 조절점. 값↑ = 획득 느려짐(어려움). 코드 수정 불필요.

**HUD 동기화(`syncHud`):** `/lobby/prizeBalls`, `/lobby/archeryBowStands`, `/lobby/prizeKillsToward`·`prizeKillsRequired`, `/archery/killsTowardBow`·`killsPerBow`.

---

## 11. 이식 가능 지갑 계약 — 호스트 ↔ iframe 미니게임 (host-agnostic)

iframe 미니게임(퍼즐·양궁)을 **다른 호스트(예: 모노폴리 GO)에도 그대로 붙이기 위한** 핵심 계약. 호스트는 **재화 잔액(숫자)만** 주고받고 게임 내부 규칙을 1도 모른다. 게임이 **자체 소비·UI·통화명**을 전부 소유한다.

### 11-1. 3개 메시지 (postMessage)

```
게임 → 호스트 :  <ns>:ready                                   (iframe 준비 완료)
호스트 → 게임 :  host:walletSync { balance, missionLines? }    (보유 재화 + 획득안내 데이터)
게임 → 호스트 :  <ns>:walletChanged { balance }                (자체 소비 후 남은 잔액 = 저장 요청)
```
- `<ns>` = 게임별 네임스페이스. 퍼즐 = `pd`, 양궁 = `aa`.
- `balance` = 재화 개수(정수). 퍼즐=퍼즐볼, 양궁=발.
- `missionLines` = `[{title, detail}]` — "어떻게 버는지" 안내(호스트가 제공하는 **표시용 데이터**, 게임은 그대로 렌더만). 없으면 게임이 제네릭 문구 표시.

### 11-2. 역할 경계 (절대 규칙)

| 책임 | 소유자 |
|------|--------|
| 재화 잔액 보관·지급·저장 | **호스트** (지갑) |
| 소비 판정(부족 경고 포함) | **게임(iframe)** |
| 입장/미션 화면, 통화명, 소비 UI | **게임(iframe)** |
| 게임 규칙(드롭·발사·연출) | **게임(iframe)** |

→ 호스트는 `balance` 숫자만 안다. **다른 호스트는 이 3개 메시지만 구현하면 게임이 그대로 붙는다.**

### 11-3. 호스트 구현 (스퀘어)

- **App.tsx** 메시지 핸들러:
  - `pd:ready`/`aa:ready` → `host:walletSync` 전송(balance = `getPrizeBalls()`/`getBowStands()`, missionLines = acquire CSV에서 구성).
  - `pd:walletChanged` → `MinigameCurrencyService.setPrizeBalls(balance)` (저장).
  - `aa:walletChanged` → `setBowStands(balance)` (저장).
- **EventMinigameOverlay.tsx** `onLoad` → 진입 직후 `host:walletSync` 1회 선전송(ready 누락 대비).
- **입장 차감 없음:** `event_minigame_host_config.csv` `ticket_cost = 0`. 소비는 게임이 플레이 중 자체 차감 후 `walletChanged`로 통지.

### 11-4. 게임(iframe) 구현 — 자립

- 진입 시 `<ns>:ready` 송신 → `host:walletSync` 수신 → 내부 재화 카운트 = `balance`.
- **입장/미션 화면을 게임이 소유**(퍼즐 = `PrizeIntro`, 양궁 = lobby 상단 미션 배너). missionLines를 그대로 렌더.
- 소비할 때 자체 카운트 차감 → `<ns>:walletChanged { balance }` 송신(호스트가 저장).
- **standalone**(호스트 없음, `window.parent === window`): `hosted=false` → 내부 기본값으로 동작(깨지지 않음).

### 11-5. ⚠️ json-render 스토어 접근 주의 (`@json-render/core`)

iframe의 `createStateStore`는 **JSON-pointer(중첩) 접근**이다. `/hud/ball_count` → `state.hud.ball_count`로 읽고 쓴다.
- **반드시 `store.get('/hud/ball_count')`** 로 읽을 것. `store.getSnapshot()['/hud/ball_count']` **직접 키 접근은 stale**(초기 평면 키만 보고 update 결과를 못 봄) → 버그.
- 초기 기본값은 평면 키라 `get()`엔 `undefined`로 보임 → 가시성 플래그는 "명시적 false일 때만 숨김"으로 판정(`get(...) !== false`).

---

## 12. 이벤트 노출 시간 — 사이드탭 카운트다운

모든 이벤트는 **노출 기간**을 데이터로 갖는다. 사이드탭은 **남은시간을 카운트다운**으로 표시하고 만료 시 숨긴다.

**기간 데이터 위치(SSoT):**
| 이벤트 | CSV · 필드 |
|--------|-----------|
| 라바 | `lq_event_config.csv` `duration_hours` |
| 퍼즐·양궁(iframe) | **`event_minigame_host_config.csv` `duration_hours`** (호스트가 노출 관리) |
| 타이쿤·시즌 | `event_board_config.csv` `duration_hours` (`EventController`가 종료 처리) |
| 쇼핑몰·드라이버 | `mm_/dj_event_config.csv` `duration_hours`/`duration_minutes` |

**iframe 미니게임 노출(호스트):** `src/game/eventExposure.ts`
- `getEventEndMs(id, durationHours)` — 최초 노출 시각을 `prism_event_exposure_v1`(localStorage)에 앵커·영속 → `endMs = 앵커 + duration`.
- `getEventRemainMs` ≤ 0 이면 `EventMiniCards`에서 탭 **숨김**. `durationHours ≤ 0`이면 `Infinity`(무기한 노출).
- `registry.tsx` `EventMiniCards`가 1초 인터벌로 재렌더하여 카운트다운 갱신.

---

## 13. 사이드탭 표기 규칙 (전 이벤트 통일)

- **시간만 표기 + 레드닷.** 재화 **갯수 표기 금지**(요즘 라이브 게임 규격).
- 포맷: 초·아이콘 없이 **`H시간 M분` / `M분`** (만료 `종료`). 무기한이면 빈 문자열.
- **단일 규칙을 6개 탭 전부 동일 적용:**
  - iframe(라바·퍼즐·양궁): `eventExposure.formatRemain`.
  - 타이쿤·시즌·쇼핑몰·드라이버: 각 컨트롤러 `formatTimer`(동일 규칙: `EventController`·`MallMarvelsController`·`DriversJoyController`).

---

## Anti-Patterns

### 사이드탭에 재화 갯수 표기
```
❌ 퍼즐 57개 / 양궁 33발   (구버전)
✅ 퍼즐 23시간 59분 + 레드닷   (시간만 + 레드닷)
```
재화 보유량은 게임 입장 후 내부 화면에서 본다. 로비 탭은 **남은시간**만.

### 호스트가 미니게임 소비를 판정
`pd:consumeBall`처럼 호스트가 차감 판정하면 게임 규칙이 호스트로 새어 이식 불가. 호스트는 `walletChanged`로 받은 **잔액 저장만**.

### iframe 스토어를 getSnapshot 직접 키로 읽기
`@json-render/core` 스토어는 JSON-pointer(중첩). `store.get(path)` 사용. 직접 키 접근은 stale.

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
