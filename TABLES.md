# PRISM SQUAD v2 — 테이블(CSV) 구조 가이드

> 모든 CSV가 **어디에 있고, 어디를 편집하며, 어디가 런타임인지**를 정의하는 단일 기준 문서.
> 원칙: **각 프로젝트의 테이블은 "하나의 canonical 폴더"에만 둔다.** 중복·구버전은 백업 후 삭제.

---

## 0. 핵심 개념 — 이벤트는 두 유형

| 유형 | 게임 | 빌드 | canonical(편집 대상) | 런타임(앱이 fetch) |
|------|------|------|----------------------|---------------------|
| **A. iframe (별도 빌드)** | 양궁 · 라바 · 퍼즐 | 각자 vite 프로젝트 | **게임 폴더 내 source CSV** | `public/event/<id>/` (빌드가 복사 배포) |
| **B. 인앱 (메인 앱 일부)** | 타이쿤·시즌 · 쇼핑몰 · 드라이버 | 메인 앱 | `public/event/<id>/` | (동일 — 한 벌) |
| **C. 코어(스퀘어)** | 본편 | 메인 앱 | `public/tables/` | (동일 — 한 벌) |

- **A형은 "두 벌"이 필연**: 게임 폴더의 source(편집용) → 빌드 → `public/event/<id>/`(런타임용, **손으로 안 고침·빌드가 덮음**).
- **B·C형은 한 벌**: 메인 앱이 직접 fetch하므로 그 폴더가 곧 canonical.

---

## 1. canonical 위치 (편집은 여기서만)

| 프로젝트 | canonical 폴더 | 개수 | 비고 |
|----------|----------------|------|------|
| **스퀘어 코어** | `public/tables/` ✅완료 | 47 | `data.ts CSV_PATHS`·`stubsAndMaterials.ts`·`redDotConfig.ts`가 `/tables/` fetch |
| **양궁** | `src/eventSystem/Archery Arena_game_end/public/` | 6 | vite `publicDir:public` → `public/event/archeryArena/` 배포 |
| **라바** | `src/eventSystem/Lava Quest _game_end/public/` | 5 | 동일 → `public/event/lavaQuest/` 배포 |
| **퍼즐** | `src/eventSystem/prize-drop_end/game_data/` | 4 | `public/game_data`는 심링크 → 1벌. → `public/event/prizeDrop/game_data/` 배포 |
| **타이쿤·시즌** | `public/event/tycoonSeason/` | 13 | 인앱 — 여기가 canonical |
| **쇼핑몰** | `public/event/mallMarvels/` | 3 | 인앱 |
| **드라이버** | `public/event/driversJoy/` | 2 | 인앱 |

> **런타임 배포본(생성물, 편집 금지):** `public/event/archeryArena/`, `public/event/lavaQuest/`, `public/event/prizeDrop/game_data/` — 각 iframe 빌드가 자동 생성.

---

## 2. 코어 47개 테이블 (그룹)

`public/tables/`(목표)

- **전투·적·스폰(10):** enemy_config · wave_config · formation_spawn_config · rush_config · rush_cycle_config · boss_config · boss_pattern_config · stage_config · guardian_runtime_config · combat_tuning
- **플레이어·렌더·맵(7):** player_config · player_visual_config · control_config · renderer_config · map_config · projectile_config · vfx_config
- **스킬·무기(6):** skill_config · skill_level_config · skill_evolution_config · skill_runtime_config · weapon_config · weapon_visual_config
- **성장·메타·콘텐츠(12):** level_config · levelup_rule_config · talent_config · talent_cost_config · evolution_config · adventure_config · challenge_config · meta_config · element_config · drop_config · lucky_train_config · equipment_config
- **상점·재화(7):** shop_box · shop_box_grade · shop_gem_pack · shop_gold_pack · shop_test_config · ticket_config · ticket_multiplier_step
- **이벤트 연동(코어 측, 4):** event_minigame_host_config(탭·노출 duration) · event_minigame_acquire_config(퍼즐·양궁 획득) · event_minigame_kill_reward_config(적별 base) · lava_quest_host_config
- **UI(1):** red_dot_config

---

## 3. 정리 완료 — 삭제된 중복·구버전 ✅

| 위치 | 처리 |
|------|------|
| `src/eventSystem/Archery Arena_game_end/*.csv` (root 6) | **삭제됨** (public/과 100% 동일 stale) |
| `src/eventSystem/Lava Quest _game_end/backups/**/*.csv` (16) | **삭제됨** (구 스냅샷) |

> 라바 root는 원래 복사본 없음. 퍼즐·인앱은 이미 1벌이었음.
> 백업: `사용안하는 md 모음/csv_snapshot_<날짜>/` 에 정리 전 전체(113개) 스냅샷 보관.

---

## 4. 편집 규칙 (한 줄 요약)

- **수치 바꾼다** → 위 §1 canonical 폴더의 CSV만 수정. (A형 iframe은 수정 후 `npm run build`로 재배포.)
- **`public/event/<id>/`(A형 배포본)은 절대 손수정 금지** — 다음 빌드에 덮임.
- **코어는 `public/tables/`** (이동 후). 경로는 `src/game/data.ts CSV_PATHS` 가 SSoT.
- 새 CSV 추가: canonical 폴더에 두고, 코어면 `CSV_PATHS`·`data.ts` 파서에 등록 / 이벤트면 해당 로더에 등록.
