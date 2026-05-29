# PRISM SQUAD — Cursor 개발 로그

> 작성: Cursor (단서)  
> 기준일: 2026-05-28  
> 프로젝트: `/Users/max/minigame_make/제작 완료 백업/PRISM SQUAD`

---

## 1. 밸런스 조정

### 1-1. 웨이브 리젠 (`public/wave_config.csv`)
- 초반 난이도 상향 + 중반 급상승 완화
- 보스 등장 타이밍: `120초` 유지
- 최종 적용값:
  - Wave1: `20f, max130`
  - Wave2: `16f, max180`
  - Wave3: `13f, max230`
  - Wave4: `10f, max290`

### 1-2. 드롭 밸런스 (`public/drop_config.csv`)
- 폭탄 드랍 과다 문제 완화
  - `bomb` 가중치: `0.09 → 0.03 → `0.015`
  - `magnet` 가중치: `0.07 → `0.06`
- 아이템 드랍 확률: `ITEM_DROP_CHANCE 0.05 → 0.03`

### 1-3. XP 보석 크기 (`src/game/DropSystem.ts`)
- 작은 XP는 유지, 중/대형만 축소해 몬스터와 구분 강화
  - medium: `72%`, large: `60%`

---

## 2. 보스전 개선

### 2-1. 보스 연출/전투 흐름 (`src/game/GameCore.ts`, `src/game/BossController.ts`)
- 보스 연출씬(`BOSS_INTRO`) 제거 → 즉시 전투 지속
- 보스 등장 시 일반 몬스터 전멸 제거 → 몬스터와 동시 등장
- 보스 스폰 위치/타이밍 조정 (`spawn_offset_y` 상한, intro 900ms)
- 보스 초기 무적 1.2초 추가 (스폰 직후 HP 깎임 방지)
- 보스 체력 스케일 상향 (`boss.hp * (3.0 + stageIdx * 0.9)`)
- 보스 패턴: 자기 주변 + 플레이어 근처 웅덩이 혼합 생성
- 보스 스킬 시 회전 가속 연출 추가

### 2-2. 드론 보스전 타겟 (`src/game/SkillSystem.ts`, `GameCore.ts`)
- 보스전에서도 드론 미사일 발사되도록 보스 타겟 fallback 추가

### 2-3. 폭탄 범위 제한 (`GameCore.ts`)
- 전장 전체 몰살 → **현재 화면 내 대상만** 처치
- 보스도 화면 내일 때만 폭탄 데미지 적용

---

## 3. UI / 플로우 개선

### 3-1. 로비 (`src/jsonRender/registry.tsx`)
- 시작 버튼: 직각 정사각형 (`220x220`)
- 현재 입장 스테이지 표기 (`STAGE n`)
- `START_GAME` 시 현재 스테이지 번호 반영

### 3-2. 결과 모달 (`registry.tsx`, `hudExternalStore.ts`, `GameCore.ts`)
- 성공/실패 명확 표시 (`성공` / `실패`)
- 총 플레이 시간, 획득 EXP, 획득 골드, 처치 수, 최고 레벨 표시
- `다시 도전` 버튼 제거 → `확인(로비로)` 1개
- 클리어 후 로비 복귀 → 다음 스테이지 준비 상태로 진행

### 3-3. 화면 붉은 오버레이 제거 (`src/App.tsx`)
- `FlashOverlay` 비활성화 (피격/사망 전체 화면 tint 제거)

---

## 4. 스킬 시스템

### 4-1. 수호자(guardian)
- 레벨당 블레이드 수 증가 로직 수정
  - 기존: `1 + floor(level * 0.6)` → Lv2에서 2개 고정
  - 변경: `Math.min(5, Math.max(1, level))` (Lv1~5)

### 4-2. 드릴(drill_shot)
- 삼각뿔(3면) 형태 유지
- 회전 제거, 이동 방향만 유지
- 속도: `0.5x` (느리게)
- 크기: `r * 2.8`

### 4-3. 드론(drone)
- 우상단 고정 드론 1개
- 유도탄 + 연사 구조
- 보스전 타겟 지원

### 4-4. 외골격(exoskeleton) 시각효과
- 장착 시 플레이어에 그라데이션 오버레이
  - 상단 보라 → 하단 청록
  - 레벨에 따라 강도 증가
- 파일: `src/three/PlayerMesh.ts`, `GameCore.ts`

---

## 5. 스테이지 시스템 (10스테이지)

### 5-1. 구조 (`GameCore.ts`)
- `MAX_STAGES = 10`
- 보스 클리어 시 결과 모달 표시
- `로비로` 선택 시 다음 스테이지로 진행 (자동 인게임 시작 X)
- 스테이지 전환 시 **획득 스킬 초기화** (kunai Lv1만 유지)

### 5-2. 버그 수정
- 결과 모달 잔존 문제 수정 (`/result/visible` 해제)
- 로비 재입장 시 스테이지 1로 리셋되던 문제 수정 (`pendingStageAdvance` 플로우 정리)

---

## 6. 경험치/결과 데이터

- 결과창 누적 EXP 표시용 `totalXpEarned` 추가
- `GameCore._addXp()`에서 누적 집계
- HUD 경로: `/result/totalXpEarned`

---

## 7. 빌드 산출물

- 빌드 명령: `npm run build`
- ZIP 생성: `PRISM_SQUAD_build.zip`
- 포함: `dist/index.html` + `dist/assets` + `dist/*.csv`

---

## 8. 주요 수정 파일 목록

| 영역 | 파일 |
|------|------|
| 밸런스 | `public/wave_config.csv`, `public/drop_config.csv` |
| 보스 | `src/game/GameCore.ts`, `src/game/BossController.ts` |
| 스킬 | `src/game/SkillSystem.ts`, `src/three/PlayerMesh.ts` |
| UI | `src/jsonRender/registry.tsx`, `src/App.tsx` |
| HUD/상태 | `src/game/hudExternalStore.ts` |
| 드롭 | `src/game/DropSystem.ts` |

---

## 9. 미해결/추가 제안 항목

- [ ] 스테이지별 맵/배경 테마 분리 (현재는 난이도 수치만 상승)
- [ ] 결과창에 스테이지 번호 배지 추가 (원하면 가능)
- [ ] 보스 HP 추가 튜닝 (현재 체감 기준 재조정 필요 시 `boss_config.csv`에서 조정)
