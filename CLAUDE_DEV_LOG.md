# PRISM SQUAD — Claude 개발 로그

> 작성: Claude (Anthropic)
> 기준일: 2026-05-29
> 프로젝트: `/Users/max/minigame_make/제작 완료 백업/PRISM SQUAD`

---

## 1. 스테이지별 적 스케일링 완성

### 1-1. CSV 테이블 구조 변경 (`public/stage_config.csv`)
- 신규 컬럼 3개 추가:
  - `enemy_hp_mult` — 스테이지별 적 HP 배율
  - `enemy_speed_mult` — 스테이지별 적 이동속도 배율
  - `enemy_dmg_mult` — 스테이지별 적 공격력 배율

### 1-2. wave_config.csv 스테이지 필드 추가
- `stage` 컬럼 추가 (기존 wave_id만 있었음)
- GameCore가 현재 스테이지에 해당하는 웨이브만 선택하도록 수정

### 1-3. 파싱 수정 (`src/game/data.ts`)
- `WaveConfig` 타입: `stage: number` 필드 추가 (기존 `end_time_seconds` 제거)
- `StageConfig` 타입: `enemy_hp_mult / enemy_speed_mult / enemy_dmg_mult` 필드 추가

### 1-4. EnemySystem 스케일링 적용 (`src/game/EnemySystem.ts`)
- `EnemyInstance` 인터페이스: `speedMult`, `dmgMult` 필드 추가
- `spawn(enemyId, x, y, hpMult, speedMult, dmgMult)` 파라미터 추가
- `tick()`: 이동 시 `e.cfg.speed * e.speedMult`, 데미지 시 `e.cfg.contact_dmg * e.dmgMult` 적용

### 1-5. GameCore 웨이브 필터 수정 (`src/game/GameCore.ts`)
- `.filter(w => w.stage === this.currentStage)` 추가 → 스테이지별 웨이브 분리
- `spawn()` 호출 시 stageCfg의 배율값 전달

---

## 2. 자석 아이템 방향 버그 수정 (`src/game/DropSystem.ts`)

**원인**: 화면 밖 XP에 자석 발동 시 `dist > radius` → 속도 계산 음수 → 반대 방향으로 날아감

**수정 내용**:
- `magnetPull` 플래그 추가
- 자석 발동 XP: 시간 기반 가속 `speed = Math.min(420, 130 + pullTimer * 400)` (거리 무관)
- 일반 근접 픽업: 기존 거리 기반 유지 `speed = Math.min(520, 200 + Math.max(0, radius - dist) * 4.2)`

---

## 3. 렌더링 최적화 — InstancedMesh 전환 (`src/three/EnemyMesh.ts` 전체 재작성)

**Before**: 적 1마리당 개별 Mesh → 최대 수백 draw call
**After**: 적 타입 4종 각각 InstancedMesh 1개 → draw call 4개 고정

### 핵심 변경사항
- PointLight 전부 제거
- MeshStandardMaterial → MeshBasicMaterial (조명 불필요)
- `mesh.frustumCulled = false` 설정 — geometry bounding sphere(원점 기준)로 컬링하면 스폰 위치(380~480px)에서 모두 안 보임
- 인스턴스 숨김: `scale=0 + z=-9999` (frustumCulled=false이므로 scale=0으로 처리)
- 슬롯 풀: `freeSlots: number[]` 스택, `MAX_INSTANCES = 512` per type

### 추가된 공개 API
- `initEnemyInstancer(scene)` — GameCore 생성 시 1회 호출
- `clearEnemyInstancer()` — 스테이지 전환/리셋 시 전체 숨김 + 슬롯 반납
- `EnemyMeshHandle.setPosition(x, y)` — 매 프레임 위치 동기화

---

## 4. 밸런스 수치 조정

### 4-1. 적 공격력 2배 (`public/enemy_config.csv`)
- `contact_dmg`: 2 → **4** (basic, dog, bloater, spitter 전체)

### 4-2. 웨이브 최대 적 수 20% 상향 (`public/wave_config.csv`)
| Wave | 변경 전 | 변경 후 |
|------|--------|--------|
| Wave1 | 130 | **156** |
| Wave2 | 180 | **216** |
| Wave3 | 230 | **276** |
| Wave4 | 290 | **348** |

---

## 5. 스킬 투사체 렌더링 전면 수정 (`src/game/SkillSystem.ts`)

### 5-1. z-레이어 수정
**원인**: 적 z=0.5, 투사체 z=0 → 투사체가 적 뒤에 렌더링되어 안 보임

| 대상 | 변경 전 | 변경 후 |
|------|--------|--------|
| `_spawnProjectile()` 스폰 z | 0 | **1** |
| `_spawnDrill()` 스폰 z | 0 | **1** |
| `_tickProjectiles()` 매프레임 z | blade/slash=1, 나머지=0 | **전부 1** |

### 5-2. 머티리얼 전환 (MeshStandardMaterial → MeshBasicMaterial)
조명 없이도 지정 색상으로 항상 렌더링되도록 전환:
- `_spawnProjectile()` — kunai, boomerang, rocket, drone탄, soccer_ball 등 모든 투사체
- `_spawnDrill()` — drill_shot, whistling_arrow
- `_fireDimensionalBlade()` — 차원 검기
- `_fireVoidSlash()` — 보이드 슬래시
- `_rebuildDrones()` — 드론 본체
- `_rebuildGuardians()` — 가디언 블레이드
- `_fireDebuffAura()` + `_tickDebuffAuras()` — 감쇄 오라

---

## 6. 쿠나이 시각 수정 (`src/game/SkillSystem.ts`)

### 6-1. 지오메트리 교체
**원인**: `OctahedronGeometry`(팔면체) → 탑다운 시점에서 backface culling으로 일부 면 안 보임
**수정**: `ShapeGeometry` 마름모꼴 2D 다이아몬드 (XY 평면 완전 펼쳐짐)
```
앞뾰족(+x) → 윗모서리(+y) → 뒤뾰족(-x) → 아랫모서리(-y) → 닫기
폭: radius * 0.6 / 길이: radius * 1.8
```

### 6-2. 스폰 오프셋 추가
**원인**: 플레이어 위치(px, py)에서 스폰 → 근접 적과 동일 프레임 충돌 → 렌더 전 제거
**수정**: 발사 방향으로 18px 오프셋 후 스폰 (`ghost_shuriken` 동일 적용)

---

## 7. 드론 유도탄 타겟 재탐색 버그 수정 (`src/game/SkillSystem.ts`)

**원인**: 타겟 사망 시 `_nearestEnemy()`로 새 적 재탐색 → 엉뚱한 방향으로 선회

**수정**: `Projectile` 인터페이스에 `lockX?: number, lockY?: number` 추가
- 타겟 **생존 중**: 매 프레임 `lockX = target.x, lockY = target.y` 갱신
- 타겟 **사망 시**:
  1. `lockX/lockY` 방향으로 속도 재설정
  2. `homing = false` → 이후 직선 비행
  3. 목표 위치 20px 이내 도착 시 폭발 (`_spawnFlame`)
- 처음부터 타겟이 없었던 경우만 즉시 폭발 유지
- 드론 외 유도탄(whistling_arrow 등)은 기존 재탐색 동작 유지

---

## 8. z-레이어 체계 (현재 기준)

```
바닥 (PlaneGeometry)     z = -2.0 ~ -1.2
트랙 / 필드              z = -1.5
그리드 / 데코 라인       z = -1.3 ~ -1.2
적 InstancedMesh         z = 0.5
화염장판 / 디버프오라    z = 0.5
독 웅덩이                z = -0.5
XP 드롭 / 아이템         z = 0
스킬 투사체 전부         z = 1.0  ← 적보다 반드시 높게
가디언 블레이드          z = 2.0
드론 본체                z = 8.0  (+ sin 보정)
```

---

## 9. 주요 수정 파일 목록

| 영역 | 파일 |
|------|------|
| 테이블 구조 | `public/stage_config.csv`, `public/wave_config.csv`, `public/enemy_config.csv` |
| 데이터 파싱 | `src/game/data.ts` |
| 적 시스템 | `src/game/EnemySystem.ts` |
| 적 렌더링 | `src/three/EnemyMesh.ts` (전체 재작성) |
| 스킬/투사체 | `src/game/SkillSystem.ts` |
| 드롭/자석 | `src/game/DropSystem.ts` |
| 게임 루프 | `src/game/GameCore.ts` |

---

## 10. 빌드 산출물

- 빌드 명령: `npm run build`
- 최종 ZIP: `PRISM_SQUAD_final.zip` (데스크탑)
