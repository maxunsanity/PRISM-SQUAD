# PRISM SQUAD — GAME.md (헌법)

## 한 판 루프
```
게임 시작(CSV 로드 완료)
  → [PLAYING] 이동(조이스틱/WASD) + 자동 공격(스킬 쿨타임)
  → 적 처치 → EXP 보석 드롭 → 수집
  → EXP 100% → [LEVELUP] 게임 정지 + 3택1 카드 팝업
  → 카드 선택 → 스킬 장착 → [PLAYING] 재개
  → 타이머 02:30 → [BOSS_INTRO] 일반 적 전멸 + 보스 스폰 연출(3초)
  → [PLAYING] 보스 전투
  → 보스 처치 → VICTORY
  → HP 0 → [GAMEOVER] DEFEAT
  → 결과 화면 → 재도전 or 종료
```

## gameState 열거형
```typescript
type GameState = 'PLAYING' | 'LEVELUP' | 'PAUSED' | 'BOSS_INTRO' | 'GAMEOVER'
```

| gameState  | 조이스틱 | 키보드 이동 | ESC | 카드 탭 |
|------------|---------|------------|-----|---------|
| PLAYING    | ✅      | ✅         | ✅  | ❌      |
| LEVELUP    | ❌      | ❌         | ❌  | ✅      |
| PAUSED     | ❌      | ❌         | ✅  | ❌      |
| BOSS_INTRO | ❌      | ❌         | ❌  | ❌      |
| GAMEOVER   | ❌      | ❌         | ❌  | ❌      |

## json-render 경계
- **선언형 (json-render)**: HUD 수치·타이머·EXP바, 스킬 모달 카드, 결과 화면, 보스 경고 배너
- **명령형 유지 (Three.js)**: 게임 루프, 적 스폰·AI·충돌, 투사체, 파티클, 카메라
- Three.js 코어를 절대 선언화하지 않는다

## SSoT 원칙
- 모든 수치는 CSV에서 로드. 코드 내 게임 수치 하드코딩 금지
- CSV 경로는 `src/jsonRender/stubsAndMaterials.ts`에서 단일 관리
- `$state` 경로 수정 시 반드시 3곳 동시 패치:
  `hudExternalStore` + `prismHudSpec` + `registry.tsx`

## 금지 규칙
- `z.any()` 사용 금지 (Zod props는 항상 좁게)
- `visible` 필드 누락 금지 (catalog.validate 실패 → 앱 진입 차단)
- 카탈로그에 이름만 추가하고 registry 구현 없이 방치 금지
- 조이스틱 maxDist / 링 크기 등 UI 수치 하드코딩 금지 → control_config.csv

## CSV 목록 (14종 SSoT)
| 파일 | 역할 |
|------|------|
| player_config.csv | 플레이어 기본 스탯 |
| enemy_config.csv | 적 4종 스탯 |
| boss_config.csv | 보스 스탯 + 패턴 |
| wave_config.csv | 웨이브 타임라인 |
| map_config.csv | 맵 크기·카메라·스폰 반경 |
| skill_config.csv | 스킬 9종 기본 스탯 |
| skill_level_config.csv | 스킬 레벨별 수치 |
| skill_evolution_config.csv | Evolution 조합 룰 |
| drop_config.csv | 드롭 아이템 확률·스탯 |
| level_config.csv | EXP 요구량 테이블 |
| vfx_config.csv | 파티클·Bloom·트레일 수치 |
| talent_config.csv | 영구 특성 마스터 |
| talent_cost_config.csv | 특성 업그레이드 비용 |
| control_config.csv | 조이스틱 UI 수치 |

## 대각선 이동 (의도된 스펙)
W+D 동시: vx=+1, vy=-1 → 실제 이동거리 = speed × √2
정규화 안 함. 수정 시 기획 확인 필요.
