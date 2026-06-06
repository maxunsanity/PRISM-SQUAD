---
doc_generation: mdv4
condense_policy: forbidden
---

# PRISM SQUAD v2 — v4 백화점 색인 (INDEX)

> **SKILL** = 공통 읽기 순서 (`.cursor/skills/prism-squad-v4/SKILL_v4.md`)  
> **이 파일** = 모듈별 **어떤 v4 폴더에 뭐가 들어있는지** 색인  
> **CSV(SSoT)** = 각 v4 폴더 동봉 `.csv` + **DEV §14·15 전문** (수치 변경 금지)

> ⚠️ **이 문서(INDEX)·`ATTACH_MODULES_v4.md`·`HOST_ARCHITECTURE_v4.md` = 이벤트 조립 전용 상위 문서.**
> 스퀘어(코어) 게임 **자체를 만드는 데는 필요 없음** — 코어는 `GAME/DESIGN/DEV/RECIPE/RECIPE_CODE + CSV`로 충분.
> 이 3개는 **"코어 + 6이벤트를 통합 조립"할 때만** 본다. (코어 폴더에 동봉돼 있을 뿐, 코어 콘텐츠 아님.)

---

## v4에 담는 것 (역할)

| 종류 | 담기 | 안 담기 |
|------|------|--------|
| **GAME·DEV·RECIPE** | 기존 성공 md **전량 복사** + v4 배너 | 요약본 |
| **DESIGN** | 팔레트·레이아웃 + **`style.css` 거의 전문** (있으면) | 픽셀 완성용 Figma |
| **DEV §14** | `public/tables/` CSV **파일 통째** | AI 임의 수치 |
| **RECIPE_CODE** | **추론 위험 구간의 샘플 소스** (연동·상태·핵심 루프) | 레포 전 파일 전부 |

---

## 모듈별 폴더

### A. 코어 (필수)

**경로:** `src/prism_squad_v4/`

| 파일 | 출처·비고 |
|------|-----------|
| `GAME_prism_squad_v4.md` | `mdv4_generator/sources/core/GAME.md` |
| `DESIGN_prism_squad_v4.md` | `mdv4_generator/sources/core/DESIGN.md` + `src/style.css` 전문 |
| `DEV_prism_squad_v4.md` | `mdv4_generator/sources/core/DEV.md` + `public/*.csv` + `public/event/*` |
| `ATTACH_MODULES_v4.md` | 조립 계약 (신규) |
| `RECIPE_prism_squad.md` | Anti-Pattern·json-render |
| `RECIPE_CODE_prism_squad.md` | 샘플: registry·Bridge·App·GameCore 발췌 |
| `HOST_ARCHITECTURE_v4.md` | HANDOFF·SALES_EVENTS_PLAN |

### B. 타이쿤·시즌 (선택)

**경로:** `src/eventSystem/tycoonSeason/tycoon_season_event_v4/`

| 파일 | 출처 |
|------|------|
| `GAME_tycoon_season_event_v4.md` | `tycoonSeason/GAME.md` |
| `DEV_tycoon_season_event_v4.md` | `DEV.md` + CSV §14 |
| `DESIGN_tycoon_season_event_v4.md` | HUD 슬롯 최소 |
| `HANDOFF_tycoon_season_event_v4.md` | `HANDOFF.md` |
| `RECIPE_tycoon_season_event.md` | 패턴 |
| `RECIPE_CODE_tycoon_season_event.md` | EventBridge·EventController **전체** |

### C. iframe 미니게임 (선택, 원본→event_v4 복제)

| 모듈 | v4 경로 | 세트 |
|------|---------|------|
| 라바 | `Lava Quest _game_end/lava_quest_event_v4/` | GAME·DESIGN·DEV·RECIPE·RECIPE_CODE + CSS |
| 퍼즐 | `prize-drop_end/prize_drop_event_v4/` | 동일 |
| 양궁 | `Archery Arena_game_end/archery_arena_event_v4/` | 동일 + HANDOFF |

### D. 세일 (선택)

| 모듈 | v4 경로 |
|------|---------|
| 마블 | `mallMarvels/mall_marvels_event_v4/` |
| 드라이버 | `driversJoy/drivers_joy_event_v4/` |

GAME·DEV·DESIGN(최소)·RECIPE·RECIPE_CODE(Controller) + CSV §14

---

## mdv3 vs mdv4

- **mdv3:** 검증 스냅샷 — 수정 최소
- **mdv4:** AI 재현 백화점 — **함축 금지**, v5 diff용

---

## 재생성

```bash
node scripts/build_mdv4_docs.mjs
```
