---
name: prism-squad-core-v4
description: PRISM SQUAD 코어(스퀘어 본편)를 MD v4 + CSV만으로 재현할 때의 진입점 — 읽기 순서, 비주얼 2레이어, 에셋 교체, json-render, 이벤트 연동/빌드 스코프, v4 규칙.
doc_generation: mdv4
condense_policy: forbidden
---

# SKILL — PRISM SQUAD 코어 (스퀘어 본편) v4 진입점

> **사용법:** "이 폴더(`src/prism_squad_v4/`)의 `SKILL_prism_squad_v4.md` 읽고 게임 만들어" → 이 문서 1개로 코어 재현 길이 다 이어진다.
> **함축 금지:** 이 v4 문서들은 기획서 원본이자 재현 계약이다. 요약·삭제·임의 수치 변경 금지 (함축은 v5에서).
> **이벤트는 별도:** 6개 미니게임은 각자 폴더의 `SKILL_<게임>_event_v4.md`가 진입점. 코어는 이벤트 없이도 단독 동작.

---

## 0. 이 게임은 무엇인가
- **PRISM SQUAD** = 탑뷰 자동공격 서바이버(탕탕특공대류). 이동만 수동, 공격은 자동. 1스테이지 = **10분**(미니보스 2 + 최종보스 1), HP 0 = 패배 / 최종보스 처치 = 승리.
- 로비에서 스테이지·배수 선택 → 전투(레벨업마다 스킬 3장 중 택1로 빌드업) → 결과 → 로비. 상점·장비·도전·진화·영구특성 메타 성장.

## 1. 읽기 순서 (필수)
1. **이 SKILL** (지금 문서)
2. `GAME_prism_squad_v4.md` — 규칙·엔티티·메카닉 + **User Flow(유저 플로우)** + 이벤트 연동/빌드 스코프
3. `DESIGN_prism_squad_v4.md` — **§0 비주얼 2레이어** → **§10 화면별 UI 레이아웃 23종** + §11 `style.css` 전문
4. `DEV_prism_squad_v4.md` — 스택·파일구조·json-render·$state·gameState·**§9 이벤트 연동 계약**·**§9-A 에셋 교체 규칙** + **§14·15 public CSV 전문**
5. `RECIPE_prism_squad.md` → `RECIPE_CODE_prism_squad.md` — 검증된 패턴 + 추론 위험 구간 소스 발췌
6. (선택 모듈 붙일 때) `ATTACH_MODULES_v4.md` / 색인 `INDEX_v4.md` / CSV 단계 `CSV_v4.md` / 호스트 아키텍처 `HOST_ARCHITECTURE_v4.md`

## 2. 코딩 전 7항목 요약 (채우고 시작)
```
- 이 게임은 무엇인가:
- 핵심 기술 구조(스택·렌더러):
- 선언형(json-render) vs 명령형(Three.js/물리) 경계:
- 가장 주의할 Anti-Pattern 3개:
- RECIPE / RECIPE_CODE 있음 여부:
- public CSV 목록(파일명 나열):
- 이벤트 포함 여부(통합/코어단독/일부) — §6 빌드 스코프:
```

## 3. 비주얼 2레이어 (혼동 금지 — DESIGN §0)
- **레이어 A · UI 크롬**(HUD·로비·메뉴·모달·상점·장비·도전·진화·결과·씬전환): **2D 스케치 베이지** — 배경 `#F4EFE6`, 검정 실선 테두리 `2~3px`, 플랫 그림자 `3px 3px 0 #000`, **네온/그라데이션·이모지 금지**, 손그림 SVG. 등급색 전설`#FF8A2A`/에픽`#FFE45C`/레어`#6BD5E8`/일반`#D4CFC5`.
- **레이어 B · 게임 월드**(적·플레이어·보스·스킬·드롭·VFX·3D배경): Three.js `MeshBasicMaterial`, 네온/도형, z레이어 체계(투사체 **z=1.0** 필수).

## 4. 에셋 교체 시스템 (DEV §9-A)
- 그래픽 = CSV가 SSoT. `sprite_url` 비면 절차적 도형/색 폴백(기본 연출 무손상). `public/assets/` 루트. 이미지 교체만으로 리스킨.
- 게임월드는 구현 완료, **UI는 토큰화·에셋화 규칙만 정의(미구현)** — DEV §9-A.4 따라 재현.

## 5. json-render 3종 세트 (구현 SSoT)
`prismHudSpec.ts`(Spec/$state) ↔ `catalog.ts`(검증) ↔ `registry.tsx`(React 구현) ↔ `hudExternalStore`(상태). **3종 동시 패치** — 하나만 고치면 컴포넌트 못 찾음. 이벤트 상태는 `/event/*`, 코어는 `/hud/*`·`/lobby/*` (혼용 금지).

## 6. 이벤트 연동 + 빌드 스코프 (재현 시작 시 사용자에게 질문)
- 코어는 6개 미니게임을 품지만 **약결합** — 코어 단독 동작 보장(`App.tsx` `eventData=null` → `attachEventBridge(null)`).
- **재현 전 질문:** ① 통합(코어+6이벤트, 기본) ② 코어만 ③ 일부. 상세 = `GAME ## 이벤트 연동 (3계층) + 빌드 스코프` / `ATTACH_MODULES_v4.md`.
- 이벤트를 붙이면 각 이벤트 폴더의 `SKILL_<게임>_event_v4.md`를 그 모듈 진입점으로 읽는다.

## 7. v4 규칙 / Anti-Patterns (코어 핵심)
- **함축 금지**(v5 diff용) · CSV §14·15 = `public/`과 동일, **수치 임의 변경 금지** · RECIPE_CODE 임의 수정 금지(repo에서 복사).
- **[CRITICAL]** 투사체 `z=1.0`(아니면 적 뒤로 숨음) · 게임 오브젝트 `MeshBasicMaterial`만(Standard 금지) · InstancedMesh `frustumCulled=false` · wave rate 합 = 1.0 · CSV 쉼표값은 `"..."` 따옴표 · 무기 판정은 무기그룹 API(슬롯 문자열 하드코딩 금지).
- gameState = `PLAYING|LEVELUP|PAUSED|BOSS_INTRO|GAMEOVER` (**VICTORY 없음** — 승/패 GAMEOVER + `/result/isVictory`).

## 8. 빌드
```bash
cd "/Users/max/minigame_make/PRISM SQUAD v2"
npm run build
node mdv4_generator/build_mdv4_docs.mjs   # 문서 재생성 (소스: mdv4_generator/sources/, CSV 부록 동기화)
```

## 9. 완성 체크리스트
- [ ] GAME: identity/components/entities/mechanics/goals + User Flow
- [ ] DESIGN: §0 2레이어 + §10 화면 23종 + style.css
- [ ] DEV: 스택·json-render·§9 연동·§9-A 에셋·§14·15 CSV
- [ ] RECIPE + RECIPE_CODE
- [ ] 빌드 스코프(이벤트) 사용자 확정
- [ ] `npm run build` 통과
