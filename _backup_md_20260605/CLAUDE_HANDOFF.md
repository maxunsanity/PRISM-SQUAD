# PRISM SQUAD v2 — Claude 인수인계 (2026-06-03)

> Cursor(단서) 세션 마무리 스냅샷. **git commit 없음** — 리드 지시 시만.

## 한 줄
CSV SSoT + `data.ts` 로더 + 런타임 `_ct`/`_sr`/`_pv`/`_rc`/`_hostPat` 패턴으로 하드코딩 제거 중. **본편 로드맵 대부분 완료.**

## 읽을 문서 (순서)
1. `src/GAME.md` — 기획 + **데이터구동화 로드맵(✅/⏳)**
2. `src/DEV.md` — 기술·CSV
3. `src/mdv4/DEV_prism_squad_v4.md` — **§14 CSV 전문 (AI 테이블 SSoT)**
4. `HANDOFF.md` — 이벤트·폴더 구조

CSV 수정 후: `node scripts/build_mdv4_docs.mjs`  
검증: `npm run build`

## 완료 (본편 CSV 연동)
- `combat_tuning`, `element`+DOT, `skill_runtime`(+lists), `guardian_runtime`, `boss_pattern`, `levelup_rule`
- `rush_cycle`, `formation_spawn`, `lava_quest_host`, `ticket_mult`, `event_minigame_host`
- `weapon_visual`, `player_visual`, `renderer_config`
- meta/shop/challenge/equipment/evolution/projectile/weapon 등 (이전 세션)
- 세일 mallMarvels/driversJoy: CSV 필수, DEFAULT 제거

## 이번 마무리 추가
- `host,miniboss_warning_visible_ms` → 미니보스 WARNING HUD
- `skill_runtime` 회전 키 7종 → `SkillSystem`
- `player_visual` 디버프 파티클 궤도

## 남은 것 (많지 않음 — 본편 핵심 기준)
| 우선 | 내용 |
|------|------|
| 낮음 | `SkillSystem` dmg×0.5·jitter 등 **잔여 매직 넘버** |
| 낮음 | `PlayerMesh` 버프 파티클·색 hex |
| 낮음 | `Renderer3D` 스타디움 바닥 타원 RX/RY·색 (map 테마) |
| 별도 | `src/eventSystem/*` 이벤트·세일 모듈 로드맵 |
| 운영 | `src/mdv4/` git 추적, `build_with_index.zip` 재생성 |

## 규칙
- CSV 경로: `data.ts` `CSV_PATHS` only
- HUD 경로: `hudExternalStore` + `prismHudSpec` + `registry` 동시
- 투사체 z=1.0, MeshBasicMaterial only
- git commit/push 금지 (리드 요청 전)
