# PRISM SQUAD v2 — 인수인계서

> **작성일**: 2026-06-03  
> **대상**: 다음 채팅/에이전트 (Cursor·Claude·Antigravity 등)  
> **프로젝트 별칭**: 스퀘어(탕탕류 서바이버) — 저장소명은 `PRISM SQUAD v2`

---

## 1. 한 줄 요약

탑뷰 자동 공격 서바이버 본편(`src/game` + `public/*.csv`)에, **모노폴리 GO 레퍼런스 라이브 이벤트**가 **분리 모듈**로 탑재됨.  
이벤트는 **CSV + jsonRender**만으로 밸런스·UI 문구·색·아이콘을 바꾸고, 본편 HUD(`/hud/*`)와 state는 섞지 않음.

---

## 2. 먼저 읽을 문서 (순서)

| 순서 | 경로 | 누가 / 왜 |
|------|------|-----------|
| **①** | [`src/eventSystem/GAME.md`](src/eventSystem/GAME.md) | **이벤트 기획 SSoT** — 타이쿤·시즌 2축, UI 슬롯, CSV 목록, 로드맵 |
| **②** | [`src/eventSystem/EVENT_SYSTEM.md`](src/eventSystem/EVENT_SYSTEM.md) | **개발 연동** — EventBridge, App 슬롯, jsonRender 3종 세트 |
| **③** | [`mdv4_generator/sources/core/GAME.md`](mdv4_generator/sources/core/GAME.md) | **본편 게임** — 전투·로비·장비·상점; 하단 「연동 모듈 — 스퀘어 이벤트」 참고 |
| ④ | [`src/eventSystem/HANDOFF.md`](src/eventSystem/HANDOFF.md) | 이벤트 모듈만 짧게 보는 요약 (이 파일 §4 링크) |
| ⑤ | `CURSOR_DEV_LOG.md` / `CLAUDE_DEV_LOG.md` | (있으면) 타 에이전트 작업 이력 |

**기획 수정** → `public/event/*.csv` + `src/eventSystem/GAME.md`  
**UI 추가/타입 추가** → `eventHudSpec` + `eventExternalStore` + `registry` + `operationalUi` + `catalog` **동시 패치**

---

## 3. 프로젝트 폴더 구조

```
PRISM SQUAD v2/
├── index.html              # Vite 엔트리
├── package.json            # npm run dev (port 5176), build
├── vite.config.ts          # server.port = 5176
├── build_with_index.zip    # 배포용 (dist + index.html 압축) — 필요 시 재생성
├── HANDOFF.md              # ← 이 인수인계서
│
├── public/                 # 본편 CSV·에셋 (빌드 시 dist/ 로 복사)
│   ├── *.csv               # enemy, skill, stage, shop, wave …
│   ├── assets/             # 스프라이트 (player, enemies, skills, drops)
│   └── event/              # ★ 이벤트 전용 CSV·에셋 (모듈 분리)
│       ├── event_board_config.csv      # 이벤트 ON/OFF, kind, theme, 72h
│       ├── event_milestone_config.csv  # 타이쿤 마일스톤
│       ├── event_kill_reward_config.csv
│       ├── event_help_config.csv       # 메인 창 섹션 제목·팁
│       ├── event_help_acquire_config.csv  # 일반 20마리/보스 1마리 → 1장
│       ├── tournament_*.csv / season_class_config.csv
│       ├── event_asset_config.csv      # 아이콘 URL·색상
│       ├── event_ui_theme_config.csv   # 배너 높이·모달 색 키
│       └── assets/tournament_hero.png  # 토너먼트 메인 창 히어로 (레퍼런스 캡처)
│
├── src/
│   ├── App.tsx             # 9:16 레터박스, GameCore, ★ EventHudRenderer 슬롯
│   ├── GAME.md             # 본편 기획 SSoT
│   ├── main.tsx
│   ├── style.css
│   │
│   ├── game/               # ★ 본편 런타임
│   │   ├── GameCore.ts     # attachEventBridge, onEnemyKilled, tick
│   │   ├── data.ts         # loadAllGameData, public/*.csv
│   │   ├── hudExternalStore.ts   # /lobby/*, /hud/* — 이벤트 키 금지
│   │   └── …
│   │
│   ├── jsonRender/         # ★ 본편 UI (prismHudSpec, registry)
│   │   ├── prismHudSpec.ts
│   │   ├── registry.tsx    # 로비, 상점, 전투 HUD …
│   │   └── ShopScreen.tsx …
│   │
│   ├── eventSystem/        # ★ 이벤트 모듈 (분리 가능)
│   │   ├── GAME.md         # 이벤트 기획 SSoT
│   │   ├── EVENT_SYSTEM.md
│   │   ├── HANDOFF.md      # 이벤트 요약
│   │   ├── index.ts        # public export
│   │   ├── data.ts         # loadAllEventData, EVENT_CSV_PATHS
│   │   ├── host/EventBridge.ts
│   │   ├── core/EventController.ts, BotSimulator.ts
│   │   ├── store/eventExternalStore.ts   # /event/* only
│   │   └── jsonRender/
│   │       ├── eventHudSpec.ts
│   │       ├── eventMonopolyUi.tsx   # 모노 GO형 UI (캡슐·순위판·메인 창)
│   │       ├── registry.tsx
│   │       └── EventHudRenderer.tsx
│   │
│   └── three/              # Three.js 렌더
│
├── _backup_20260601_prep/  # 과거 백업 스냅샷 (참고용)
└── scripts/gen_sprites.mjs
```

---

## 4. 이번 세션에서 완료한 작업 (이벤트 중심)

### 4-1. 아키텍처 (확정)

- **2개 이벤트 동시 운영** (`event_board_config.csv`)
  - `10001` **TYCOON_MILEAGE** — 겨울 타이쿤 챌린지 (개인 마일리지)
  - `10002` **SEASON_TOURNAMENT** — 시즌 익스프레스 (50명, 봇 49 + 본인)
- **TP 획득**: `event_kill_reward.point_base × ticket_multiplier` (호스트 입장 배수)
- **모듈 분리**: `src/eventSystem/` + `public/event/` — `EventBridge` 제거 시 본편만 동작

### 4-2. UI (모노폴리 GO 레퍼런스)

| UI | 위치 | 열기 |
|----|------|------|
| **타이쿤 마일리지 캡슐** | 상단 중앙 (로비·인게임 공통) | — |
| **타이쿤 메인 이벤트 창** | 전면 모달 | 상단 캡슐 **탭** |
| **시즌 토너먼트 탭** | **우측** 세로 (보드 우측 아이콘 느낌) | — |
| **시즌 메인 이벤트 창** | 전면 모달 (보라 테두리·히어로·순위·수집) | 우측 트로피 탭 |

**메인 창 구성 (별도 ⓘ 헬프 탭 없음 — 한 화면에 통합)**

1. **재화 획득 방법** (`event_help_acquire_config.csv`)
   - 일반 몬스터 **20마리 사냥 → 1장**
   - 보스 **1마리 사냽 → 1장**
2. **마일스톤 미션** (타이쿤) / **순위 경쟁** (시즌)

### 4-3. 2차 기능

- 마일스톤 달성 팝업, 50명 순위 패널, 토너먼트 종료 정산(`duration_hours`), 시즌 코인·클래스 승급
- `tournament_rank_reward_config` — 순위 행에 주사위/캐시/스티커 표시용 컬럼

### 4-4. ⏳ 미완 (3차 — 다음 담당)

- 보상 **실제 지급** (bundle → 호스트 골드/보석)
- `active_from` / `active_until` 운영 일정
- 헬프의 **20마리=1장**과 **실제 처치 TP** 로직 일치 여부 (현재 TP는 처치당 `kill_reward` 합산 — 기획 확인 필요)
- event-sandbox 단독 앱

---

## 5. 호스트 연동 체크리스트

```text
App.tsx
  ├─ Promise.all([loadAllGameData(), loadAllEventData()])
  ├─ EventDataProvider
  ├─ top/right: EventHudRenderer — **전투 로비·인게임만** (상점/장비/도전/진화 탭에서는 숨김, App `shouldShowEventHud`)
  ├─ top: mileage (로비 top≈128, 전투 top≈52)
  ├─ right: tournament
  └─ modal: milestone / tournament panel / popups

GameCore.ts
  ├─ attachEventBridge(bridge | null)
  ├─ enemy/boss death → eventBridge.onEnemyKilled(enemyId, ticketMultiplier)
  └─ tick → eventBridge.tick(dt)
```

**개발 서버**: `npm run dev` → http://localhost:5176  
**빌드**: `npm run build` (마지막 확인 통과)

---

## 6. CSV 빠른 참조

| 파일 | 역할 |
|------|------|
| `event_board_config.csv` | 이벤트 2종 ON, `event_kind`, `theme_key`, `duration_hours` |
| `event_milestone_config.csv` | 타이쿤 단계·필요 TP·보상 표시 |
| `event_kill_reward_config.csv` | 몬스터별 `point_base` (실제 전투 TP) |
| `event_help_acquire_config.csv` | **UI용** 획득 규칙 2행 (20/1) |
| `event_help_config.csv` | 메인 창 섹션 제목·짧은 팁 |
| `tournament_config.csv` | 50명, 봇 low (`tick_sec`, `player_cap_ratio` …) |
| `tournament_bot_name_pool.csv` | 봇 닉 60개 |
| `tournament_rank_reward_config.csv` | 순위별 보상·UI 라벨 |
| `season_class_config.csv` | 클래스명 (1단계 「타이쿤 클래스」— 시즌명과 혼동 가능) |
| `event_asset_config.csv` / `event_ui_theme_config.csv` | 아이콘·색·레이아웃 수치 |

---

## 7. 코드 핵심 파일

| 파일 | 역할 |
|------|------|
| `eventMonopolyUi.tsx` | `MonopolyMileageCapsule`, `EventTycoonMainModal`, `EventTournamentBoardModal`, `EventAcquireRulesSection` |
| `EventController.ts` | TP, 마일스톤, 봇 시뮬, 타이머, 정산 |
| `eventExternalStore.ts` | `/event/*` state — **hudStore에 이벤트 키 넣지 말 것** |
| `EventBridge.ts` | window CustomEvent ↔ controller |

**CustomEvent 예**: `event:toggleMilestoneList`, `event:toggleTournamentPanel`, `event:closeSettlement`

---

## 8. Anti-patterns (반드시 지킬 것)

1. 이벤트 state를 `hudExternalStore`에 추가 ❌  
2. 아이콘·색을 `registry.tsx`에 하드코딩 ❌ → `event_asset_config.csv`  
3. `eventHudSpec`만 수정하고 store/registry 누락 ❌  
4. 사용자 요청 없이 `git commit` ❌ (사용자 규칙)  
5. 기획자는 비개발자 — 용어·의도 불명확 시 **먼저 질문**

---

## 9. 다음 채팅에 붙여넣기용 프롬프트

```markdown
프로젝트: PRISM SQUAD v2 (스퀘어). 경로: [워크스페이스 루트]

인수인계: 루트 `HANDOFF.md` 와 `src/eventSystem/GAME.md` 먼저 읽고 이어서 작업해줘.

현재 상태:
- 모노폴리 GO형 이벤트 2종 (타이쿤 마일리지 + 시즌 토너먼트) 모듈 탑재 완료
- 메인 이벤트 창에 재화 획득 방법(일반 20마리/보스 1마리) + 미션/순위 통합 표시
- 3차: bundle 실제 지급, 운영 일정 CSV, 20마리=1장 vs 실제 TP 로직 정합

규칙: CSV 우선, /event/* only, jsonRender 3종 세트 동시 패치, git commit은 내가 요청할 때만.
```

---

## 10. 연락·역할 (맥락)

- **사용자**: 게임 기획 리드 (25년차, 비프로그래머 표현 있음 — 용어 확인 후 진행)
- **에이전트 톤**: 한국어, 동료 개발자 (`단서` 페르소나 규칙 있으나 인수인계서는 중립 문서)
- **협업**: Antigravity·Claude Code 등 병행 — 변경 시 `npm run build`로 호출·구현·CSV 일치 확인

---

*이 문서는 세션 핸드오프용이다. 상세 스펙 변경 시 `src/eventSystem/GAME.md`를 SSoT로 갱신할 것.*
