---
name: prism-squad-v4
description: PRISM SQUAD v2 코어·부착 이벤트를 MD v4+CSV만으로 재현할 때 읽기 순서, 폴더 지도, json-render·호스트 연동 규칙. 게임 MD 작업·mdv4 문서·public CSV 수정 시 사용.
metadata:
  category: Game MD v4
  internal: false
paths:
  - "src/**"
  - "public/**"
  - "mdv4_generator/**"
---

# PRISM SQUAD v2 — Game MD v4 (Host + Attached Events)

> **목적:** MD+CSV만으로 **호스트(코어)** 와 **부착 이벤트**를 각각 독립 재현. 서비스 운영 문서가 아님.  
> **함축 금지:** v5 diff용. 이 SKILL도 요약·대체 금지.  
> **UI:** 픽셀·wireframe은 외부 팀. 구현 담당은 json-render **Spec·$state·DOM·z-index** + CSV SSoT.

[Unsanity Skills](https://skills.unsanity.ai/) — `name`/`description`으로 자동 발견.

| 문서 | 역할 |
|------|------|
| 본 SKILL | 읽기 순서·조립 |
| `src/prism_squad_v4/INDEX_v4.md` | 모듈별 v4 폴더 색인 |

**RECIPE_CODE** = 레포 전체가 아니라 **AI가 추론하기 쉬운 구간의 샘플 소스**. **DESIGN** = `style.css` **거의 전문**.

---

## When to Use

- PRISM 코어 또는 라바/퍼즐/양궁/타이쿤/세일 모듈을 **처음부터** 맞춰 구현할 때
- `mdv4/` · `public/tables/*.csv` · json-render 3종 세트를 수정할 때
- 호스트 `GameCore` ↔ iframe `postMessage` 연동을 건드릴 때
- v4 문서를 재생성할 때: `node mdv4_generator/build_mdv4_docs.mjs`

---

## 0. 아키텍처 (코어 vs 부착 — 따로 만들고 합침)

```
┌─────────────────────────────────────────────────────────────┐
│  HOST: PRISM SQUAD (스퀘어 코어)                              │
│  src/prism_squad_v4/          ← GAME·DESIGN·DEV·RECIPE·HOST_ARCHITECTURE │
│  public/tables/*.csv       ← 서바이벌·로비·상점·장비…                  │
│  json-render: prismHudSpec + registry.tsx                    │
│  Three.js: GameCore + SkillSystem + EnemySystem              │
└───────────────────────────┬─────────────────────────────────┘
                            │ EventBridge · postMessage · iframe
        ┌───────────────────┼───────────────────┐
        ▼                   ▼                   ▼
  tycoonSeason          iframe minigames      sales overlay
  (인게임 HUD)           lava/prize/archery    mall/drivers
  tycoon_season_event_v4/  각 폴더/<slug>_event_v4/   <slug>_event_v4/
```

| 레이어 | 재현 단위 | v4 폴더 | CSV SSoT |
|--------|-----------|---------|----------|
| **A. 코어** | 로비·전투·상점·장비·도전·진화 | `src/prism_squad_v4/` | `public/tables/*.csv` |
| **B. 인게임 이벤트** | 타이쿤·시즌·익스프레스 | `src/eventSystem/tycoonSeason/tycoon_season_event_v4/` | `public/event/tycoonSeason/` |
| **C. iframe 미니게임** | 라바·퍼즐·양궁 | `…/Lava Quest…/lava_quest_event_v4/` 등 | `public/event/{lavaQuest,prizeDrop,archeryArena}/` |
| **D. 세일** | 마블·드라이버 | `mallMarvels/mall_marvels_event_v4/`, `driversJoy/drivers_joy_event_v4/` | `public/event/mallMarvels/`, `driversJoy/` |

---

## 1. 읽기 순서 (필수)

### 1-A. 코어만

1. **이 SKILL** (지금 문서)
2. `src/prism_squad_v4/GAME_prism_squad_v4.md`
3. `src/prism_squad_v4/DESIGN_prism_squad_v4.md`
4. `src/prism_squad_v4/DEV_prism_squad_v4.md`
5. `src/prism_squad_v4/RECIPE_prism_squad.md` (있으면)
6. `src/prism_squad_v4/RECIPE_CODE_prism_squad.md` (있으면)
7. `public/tables/*.csv` — DEV **§14·§15** 전문과 동일. **수치 임의 변경 금지**
8. **7항목 요약** (§2) → 사용자 시작 지시 후 코딩

### 1-B. 부착 모듈만 (예: 라바)

1. 이 SKILL
2. 해당 `src/eventSystem/<모듈>/<slug>_event_v4/GAME_*_event_v4.md`
3. `DESIGN_*_event_v4.md` → `DEV_*_event_v4.md` (§14 CSV 전문)
4. `RECIPE_*` / `RECIPE_CODE_*`
5. `public/event/...` CSV
6. 호스트 연동: `src/prism_squad_v4/HOST_ARCHITECTURE_v4.md` (postMessage·티켓·`lq:start_attempt`)

### 1-C. 코어 + 전체 이벤트

1-A 완료 후 **B → C → D** 각각 1-B 반복.

**구현 순서:** DEV §9 — `main.tsx` **항상 마지막**.

---

## 2. 7항목 요약 (코딩 전 필수)

```
- 이 게임(모듈)은 무엇인가:
- 핵심 기술 구조는 무엇인가 (스택·렌더러):
- 선언형(json-render) vs 명령형(Three.js/물리/iframe) 경계:
- 가장 주의할 Anti-Pattern 3개:
- RECIPE.md 있음 여부:
- RECIPE_CODE.md 있음 여부:
- game_data / public CSV 있음 여부 (파일명 나열):
```

---

## 3. v4 파일 인벤토리

### 3-1. 코어 (`src/prism_squad_v4/`)

| 파일 | 역할 |
|------|------|
| `GAME_prism_squad_v4.md` | 규칙·엔티티·메카닉 |
| `DESIGN_prism_squad_v4.md` | 비주얼 + **`src/style.css` 전문** |
| `DEV_prism_squad_v4.md` | 스택·json-render·**전 CSV 전문** |
| **`ATTACH_MODULES_v4.md`** | **있으면 붙임** 조립 절차·postMessage |
| `RECIPE_prism_squad.md` | Anti-Patterns·3종 세트 |
| `RECIPE_CODE_prism_squad.md` | **소스 전문** (registry·Bridge·App·GameCore 발췌) |
| `HOST_ARCHITECTURE_v4.md` | HANDOFF + SALES_EVENTS_PLAN |

### 3-2. Lava / Prize / Archery

각 `<slug>_event_v4/`: `GAME_*`, `DESIGN_*`, `DEV_*`(+§14 CSV), `RECIPE_*`, `RECIPE_CODE_*`. 양궁: `HANDOFF_archery_arena_event_v4.md`.

### 3-3. Tycoon Season

`GAME_tycoon_season_v4.md`, `DEV_*`, `DESIGN_*`, `HANDOFF_*`, `RECIPE_*`.

### 3-4. Mall Marvels / Driver's Joy

`GAME_*`, `DEV_*`, `DESIGN_*`(최소), `RECIPE_*`, CSV §14.

### 3-5. mdv3 vs mdv4

| | mdv3 | mdv4 |
|---|------|------|
| 용도 | 작업 스냅샷 | AI 재현 전량 계약 |
| 수정 | 참조 유지 | v5까지 **함축 금지** |

---

## 4. json-render (구현 SSoT)

| 영역 | Spec | Catalog | Registry | Store |
|------|------|---------|----------|-------|
| 호스트 HUD | `prismHudSpec.ts` | `catalog.ts` | `registry.tsx` | `hudExternalStore` |
| 이벤트 HUD | `eventHudSpec.ts` | event catalog | `event/registry.tsx` | `eventExternalStore` |
| 미니게임 | 각 mdv4 DEV §4 | 각 catalog | `GameJson*.tsx` | hud store |

**3종 세트 동시 패치** — Spec만 수정 시 Registry에서 컴포넌트 못 찾음.

---

## 5. CSV 정책

- DEV **§14(§15)** = `public/` 파일과 **바이트 동일** 목표
- CSV 없으면 DEV Data Schema로 생성 — **수치 변경 금지**
- 배포 SSoT: **`public/`만** fetch. `src/eventSystem/**/game_data`는 빌드 미러일 수 있음

---

## 6. 호스트 vs 부착 (혼동 금지)

| 질문 | 답 |
|------|-----|
| 타이쿤 TP | `GameCore` 킬 → `EventBridge.onEnemyKilled` |
| 라바 스테이지 보상 | `lq_stage_reward.csv` + `event:grant` |
| 마블 step | `mallMarvels` + `SalesHostBridge` (타이쿤 store 공유 금지) |
| HUD 경로 | `/hud/*`·`/lobby/*` vs `/event/*` 혼용 금지 |
| 라바 호스트 전투 | 타이쿤·시즌 HUD **표시**; iframe `visible`일 때만 이벤트 HUD 숨김 |

---

## 7. 역할 분담

| 담당 | 문서 |
|------|------|
| 구현 (에이전트) | DEV·RECIPE·RECIPE_CODE·CSV·Spec/Registry |
| UI 정밀 | DESIGN·wireframe (외부) |
| 기획 수치 | CSV + GAME |

---

## 8. Anti-Patterns

1. CSV 수치 임의 변경 (v5 diff 불가)
2. RECIPE_CODE 임의 수정 — repo에서 복사만
3. json-render Spec만 수정 — catalog·registry 동시 필수
4. mdv4·이 SKILL 함축·별도 MANIFEST로 쪼개기 (진입점은 **이 SKILL 하나**)
5. 라바 전투 WASD: `focusPrismGameShell` (`HOST_ARCHITECTURE_v4.md`)

---

## 9. 완성 체크리스트 (모듈당)

- [ ] GAME YAML: identity / components / entities / mechanics / goals
- [ ] DESIGN (9섹션 또는 minimum layout)
- [ ] DEV 13섹션 + CSV §14
- [ ] RECIPE + RECIPE_CODE (미니게임)
- [ ] iframe postMessage 표 (해당 시)
- [ ] `npm run build` 통과

---

## 10. 빌드

```bash
cd "/Users/max/minigame_make/PRISM SQUAD v2"
npm run build
node mdv4_generator/build_mdv4_docs.mjs   # mdv4 + CSV 부록 재생성 (소스: mdv4_generator/sources/)
```

---

## 11. 포맷 설계 원본

포맷 설계 원본: 노션 "🏗️ Game MD v4 — 분리 포맷 설계 (GAME + DESIGN + DEV + RECIPE + RECIPE_CODE + csv)" 문서. (로컬 루트 사본은 더 이상 두지 않음)

---

## 12. v4 폴더 경로 (빠른 참조)

| 모듈 | 경로 |
|------|------|
| 코어 | `src/prism_squad_v4/` |
| 라바 | `src/eventSystem/Lava Quest _game_end/lava_quest_event_v4/` |
| 퍼즐 | `src/eventSystem/prize-drop_end/prize_drop_event_v4/` |
| 양궁 | `src/eventSystem/Archery Arena_game_end/archery_arena_event_v4/` |
| 타이쿤 | `src/eventSystem/tycoonSeason/tycoon_season_event_v4/` |
| 마블 | `src/eventSystem/mallMarvels/mall_marvels_event_v4/` |
| 드라이버 | `src/eventSystem/driversJoy/drivers_joy_event_v4/` |

모듈별 색인: `src/prism_squad_v4/INDEX_v4.md`
