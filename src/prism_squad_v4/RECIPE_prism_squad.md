---
doc_generation: mdv4
condense_policy: forbidden
note: "v4는 mdv3와 별도 폴더. v5 diff용 — 절대 요약·삭제 금지."
ui_pixel_precision: "DESIGN·외부 팀. DEV는 json-render 슬롯·$state·DOM 순서·CSV SSoT만."
---

# PRISM SQUAD Host — RECIPE.md (v4)



### [CRITICAL] 투사체 z값 오류
투사체 z ≠ 1.0이면 적 메쉬(z=0.5) 뒤에 렌더되어 안 보임.

### [CRITICAL] MeshStandardMaterial 사용
모든 게임 오브젝트는 MeshBasicMaterial. MeshStandardMaterial은 조명 필요 → 암전 구간 깨짐.

### InstancedMesh frustumCulled 누락
`frustumCulled = false` 없으면 카메라 이동 시 적이 사라짐.

### 미니보스 등장 시 웨이브 전멸
미니보스는 웨이브를 멈추지 않는다. BOSS_INTRO(전멸+암전)는 최종 보스 전용.

### HUD 수치 하드코딩
`$state` 경로 수정 시 3곳 동시 패치: `hudExternalStore` + `prismHudSpec` + `registry.tsx`

### CSV 경로 분산
CSV 경로는 `src/game/data.ts`의 `CSV_PATHS` 상수에서만 관리.

### [CRITICAL] CSV 필드 내 쉼표
설명 등 필드에 쉼표가 있으면 컬럼이 밀려 값이 깨짐(예: 드론 max_range가 5로 읽혀 미사일이 즉시 소멸했던 버그). 파서(`splitCsvLine`)가 **따옴표(")로 감싼 필드**의 쉼표는 보존하므로, 쉼표 포함 텍스트는 반드시 `"..."`로 감쌀 것.

### 무기 그룹 장착 조건
인게임 총 표시·기본 공격 판정은 `'weapon'` 슬롯 단독이 아니라 **무기 그룹(skill_id 보유) 중 장착된 것**(`_hasWeaponEquipped`/`_equippedWeaponSkill`)으로 확인. 새 무기 추가 시 `'weapon'` 하드코딩 금지.

---

## User Flow (전체 유저 플로우 — 재현 SSoT)

> **AI 재현 1순위.** gameState 전이와 화면(`*/visible`) 전환을 함께 표기. 화면별 상세 레이아웃은 `DESIGN.md §10`, 상태 경로는 `DEV.md §4`.

```
앱 로드
 → loadAllGameData(CSV) + Three.js/GameCore 초기화 (로딩화면 "PRISM SQUAD / 데이터 로딩 중...")
 → 로비 (gameState=PAUSED, /lobby/visible=true)
      │
      ├─ [햄버거 ≡] /lobby/menuOpen 토글 (이벤트 ON/OFF 메뉴 = 빌드 스코프 런타임 제어)
      ├─ [아바타] lobby:openAvatar → 아바타 선택(/avatar/visible) → avatar:select/close → 로비
      ├─ [⚡ 또는 번개부족] energy:open → 에너지 상점(/energy/visible) → 충전/닫기 → 로비
      │
      ├─ 하단탭[상점]  /shop/visible      → 구매 → shop:close → 로비
      ├─ 하단탭[장비]  /equip/visible     → 강화/장착 → equip:close → 로비
      ├─ 하단탭[전투]  → (로비 유지)
      ├─ 하단탭[도전]  /challenge/visible → challenge:start → _startFromLobbyMult → 전투(도전배율)
      ├─ 하단탭[진화]  /evolution/visible → evolution:unlock → close → 로비
      │
      ├─ 이벤트 사이드탭(Lava/Prize/Archery) → openEventMinigame → iframe 오버레이 (계층① 진입)
      │     └─ Lava: iframe "도전 시작" → lq:start_attempt → startLavaQuestMode → 전투(라바 호스트) → _onLavaQuestEnd → iframe 복귀
      ├─ 이벤트 좌측탭(Mall/Drivers) → SalesEventOverlay (계층② 진입)
      │
      └─ [배수 토글 ×N] lobby:cycleMult  → [게임 시작] (canStart: entryTickets≥multEnergyCost)
             → prism:action/START_GAME → _startFromLobbyMult
             → 번개 차감(metaEnergy -= multEnergyCost), ticketMultiplier=selectedMult
             → _beginBattle: /lobby/visible=false, /scene/transitionVisible=true
             → 씬 전환 "STAGE n"(~850ms) → _spawnInitialXp → gameState=PLAYING
                    │  ── 전투 루프(PLAYING) ──
                    ├─ EXP 100% → level++ → gameState=LEVELUP, /modal/visible, 카드 3장
                    │     → [카드 클릭] prism:skillSelect (장착/레벨업/진화) → /modal/visible=false → PLAYING
                    │     (숫자키 1/2/3 = prism:quickSkill)
                    ├─ [일시정지] TOGGLE_PAUSE → PAUSED + /pause/visible → 계속하기/포기(GIVE_UP)
                    ├─ (PLAYING) OPEN_LUCKY_TRAIN → 행운열차(PAUSED) → 구매/닫기 → PLAYING
                    ├─ 경과 600초 → _startBossIntro: gameState=BOSS_INTRO
                    │     P1 WARNING(~1300ms) → P2 암전+등장(~1000ms) → _spawnBoss P3(800ms) → PLAYING(보스전)
                    ├─ [패배] hp≤0 → _gameOver: _bankGold(metaGold+=gold, 모험EXP 적립) → gameState=GAMEOVER
                    │     → 결과(패) /result/visible, isVictory=false ("실패")
                    └─ [승리] 보스 처치 → _onBossDeath: /bossDeath/phase 1→2(VICTORY)→3
                          → 3500ms → _stageClear: _bankGold(타이쿤 적립 포함) → GAMEOVER
                          → 결과(승) /result/visible, isVictory=true ("클리어!")  (pendingStageAdvance=stage<maxStages)
             결과 [확인] prism:action/EXIT:
                ├─ pendingStageAdvance → _advanceToNextStage (다음 스테이지)
                └─ else → _reset(true): /lobby/visible=true, gameState=PAUSED → 로비
                         → _showPendingAdvUp: 모험 레벨업 했으면 /advUp/visible 팝업
```

**gameState = `PLAYING | LEVELUP | PAUSED | BOSS_INTRO | GAMEOVER` (5종).** ⚠️ **VICTORY는 별도 상태가 아님** — 승/패 모두 `GAMEOVER`로 수렴, 결과창은 `/result/isVictory` 불린으로만 구분. 로비/상점/장비 등 비전투 화면은 모두 `PAUSED` 위에 `*/visible` 오버레이.

⚠️ **배수 = 에너지(번개)×배수**다. "티켓 선택 팝업"(PrismBattlePopup)은 **비활성**(`/battle/visible` 항상 false). 실제 입장은 로비 인라인 배수 토글 + 게임시작. 배수 후보 = `ticket_multiplier_step.csv`(1/2/5/10/50/100), 비용 = `multiplier × meta.energy_per_mult`.

---

## 이벤트 연동 (3계층) + 빌드 스코프 결정

> 스퀘어는 **코어 1개 + 미니게임 6개를 품은 통합 프로젝트**다. 이벤트는 코어에 **약결합**되어 있어 코어 단독으로도 완전히 동작한다. 연동 인터페이스 전체는 `DEV.md §9`.

### 이벤트 3계층

| 계층 | 이벤트 | 방식 | 코어 연동 |
|------|--------|------|-----------|
| ① iframe | lava / prize / archery | iframe + postMessage | **입장 차감 없음**(`ticket_cost=0`). 퍼즐·양궁은 **지갑 계약**(`host:walletSync`/`*:walletChanged`)으로 게임이 자체 소비. 라바는 단독 플레이(코어 전투 진입). 보상 `event:grant`→`grantReward` |
| ② 세일 | mallMarvels / driversJoy | 인앱 React 오버레이(SalesHostBridge) | `getWallet`/`trySpend*`/`grantSalesRewards` |
| ③ 타이쿤·시즌 | tycoonSeason | 인앱 React HUD(EventBridge) | 인게임 킬→`onEnemyKilled(id,mult)` 적립, 결과창 `getTycoonPoints()` pull |

### 재화/아이템 흐름 (요약)
- **코어→이벤트(미니게임 재화 적립)**: `MinigameCurrencyService.onEnemyKilled(enemyId, ticketMultiplier)` — **퍼즐·양궁만**(라바는 단독 플레이라 **제외**). `event_minigame_acquire_config.csv` 기준 누적식: 퍼즐 일반 **300킬→퍼즐볼 +1**(보스 10킬→+1), 양궁 일반 **200킬→발 +1**(보스 2킬→+1), 스테이지 클리어 보너스, `×ticketMultiplier`. 소비는 각 iframe이 **지갑 계약**으로 자체 처리 후 `*:walletChanged`로 잔액 저장. (타이쿤·시즌 적립은 `EventBridge.onEnemyKilled` 별도.)
- **타이쿤 적립**: EventBridge 부착 시 `getTycoonPoints()`(킬 누적×배수, `event_kill_reward_config.csv` 기반). **미부착(코어 단독) 시에만** 결과창 폴백 `(killCount + result_clear_bonus_kills(50)) × ticketMultiplier`.
- **이벤트→코어 보상**: ① iframe `event:grant`(gold/gem/lightning/equip — `equip`은 `equipment_config.slot_id`, 예 `prize_crown`) ② 세일 `grantSalesRewards(lines)`(energy/meta_gold/gems/supply_key/dna/open_box/equip_lv).

### ★ 빌드 스코프 — 이벤트 포함/제외 결정 단계 (재현 시 반드시 사용자에게 질문)

> **재현 AI는 코어를 만들기 전에 "6개 이벤트를 함께 만들지, 코어만 만들지"를 사용자에게 물어야 한다.** 기본값은 **통합 빌드(코어+6이벤트)**. 결정에 따라 구현 범위가 달라진다.

| 선택 | 만드는 것 | 코드/데이터 차이 |
|------|-----------|------------------|
| **A. 통합 (기본)** | 코어 + 6 이벤트 전부 | `public/event/*` 산출물 + 이벤트 CSV 3종 + `eventSystem` 모듈 + `App.tsx`에서 `EventBridge`/세일/iframe 바인딩 |
| **B. 코어만** | 서바이버 코어 단독 | 이벤트 CSV/산출물 부재 → iframe 탭 미표시, `eventData=null` → `attachEventBridge(null)`, 결과창 타이쿤은 폴백 공식. 사이드탭·세일·타이쿤 HUD 전부 생략 |
| **C. 선택 일부** | 코어 + 일부 이벤트 | 원하는 이벤트만 CSV `enabled=1`/show 플래그 ON. 나머지는 행 제거/OFF |

런타임 ON/OFF는 로비 햄버거 메뉴(`/lobby/show*` 토글)로도 가능. **코어 단독화의 핵심 = `App.tsx`의 `eventData null 가드 + attachEventBridge(null)`** (별도 `EventManager` 없음 — `EVENT_MANAGEMENT.md`의 EventManager 서술은 코드에 미구현된 선행 설계).

---

## 연동 모듈 — 스퀘어 이벤트 (분리)

PRISM 본편과 **CSV·문서·코드가 분리**된 라이브 이벤트 모듈. 기획·밸런스는 아래 문서만 보면 된다.

| 항목 | 경로 |
|------|------|
| **게임 기획서 (GAME.md)** | [`src/eventSystem/GAME.md`](eventSystem/GAME.md) |
| 개발 연동 요약 | `src/eventSystem/EVENT_SYSTEM.md` |
| **인수인계 (다음 채팅용)** | [`HANDOFF.md`](../HANDOFF.md) (프로젝트 루트) |
| 이벤트 CSV | `public/event/*.csv` |
| 요약 | 타이쿤=마일리지(킬→TP·상단 바), 시즌=토너먼트(50명·봇49·low) |

---

## CSV 목록 (SSoT)

| 파일 | 역할 |
|---|---|
| player_config.csv | 플레이어 기본 스탯 |
| enemy_config.csv | 적 4종 스탯 |
| boss_config.csv | 보스 3종 + intro 전멸·전투 중 웨이브 중단 플래그 |
| wave_config.csv | 웨이브 타임라인 (10분 구조) |
| rush_config.csv | 러시 웨이브 시각·포위 스폰·종 비율 |
| map_config.csv | 맵 크기·카메라·스폰 반경 |
| skill_config.csv | 스킬 기본 스탯 + **발사 규칙**(fire_pattern/target_mode/projectile_count/spread_deg/explode_radius/projectile_id) |
| projectile_config.csv | **투사체 유닛**(외형/물리: shape/color/size_mult/speed_mult/life/pierce/bounce/homing/gravity) |
| weapon_config.csv | (참고용) 무기 종류 정의. 실제 장착 무기는 equipment_config의 weapon 그룹 사용 |
| weapon_visual_config.csv | 기본공격 skill_id → 인게임 총 외형(weapon_kind/scale/offset). GameCore._equippedWeaponKind가 참조 |
| combat_tuning.csv | **전투 밸런스 key/value**(폭탄뎀·디버프초·무적초·스피터AI·미사일·독DOT·냉기둔화). GameCore._ct / EnemySystem._ct로 조회 |
| skill_level_config.csv | 스킬 레벨별 수치 |
| skill_evolution_config.csv | Evolution 조합 룰 |
| drop_config.csv | 드롭 아이템 확률·스탯 |
| level_config.csv | 인게임 Lv1→36 EXP 요구(35행·1.145 스케일·탕탕형 밸런스) |
| vfx_config.csv | 파티클·Bloom·트레일 수치 |
| talent_config.csv | 영구 특성 마스터 |
| talent_cost_config.csv | 특성 업그레이드 비용 |
| control_config.csv | 조이스틱 UI 수치 |
| stage_config.csv | 스테이지명 + 적 스탯 배율 |
| meta_config.csv | 메타 초기값·armor상한·포식자회복·드롭확률 등 |
| shop_gem_pack.csv | 보석 패키지(캐시 결제) |
| shop_gold_pack.csv | 골드 패키지(보석/무료) |
| shop_box.csv | 지원품 상자 비용·천장·배너 |
| shop_box_grade.csv | 상자 등급 확률·만렙 fallback 골드 |
| formation_spawn_config.csv | 미사일 종대 스폰 시간표(2열 종대 수/간격/이동-사격 주기) |
| shop_test_config.csv | 구매 테스트 캐시/리셋 |
| lucky_train_config.csv | 행운 열차 스킬별 구매 비용 |
| ticket_config.csv | 입장권 배수 정의 |
| element_config.csv | 속성 효과 수치 (화염/냉기/독/광선/전기) |
| equipment_config.csv | 장비 슬롯 (등급/스탯타입/레벨효과/비용) + **무기 그룹**(skill_id 보유 행 = 무기 종류, 기본 공격 결정) |
| adventure_config.csv | 모험 레벨별 필요 EXP + 보상(보석/골드) |
| challenge_config.csv | 도전 스테이지×난이도 (reward_dna/골드/잠금체인) |
| evolution_config.csv | 진화 트리 노드 (능력/골드비용/prereq) |

## gameState 입출력 표

| gameState  | 조이스틱 | 키보드 | ESC | 카드 탭 |
|---|---|---|---|---|
| PLAYING    | O | O | O | X |
| LEVELUP    | X | X | X | O |
| PAUSED     | X | X | O | X |
| BOSS_INTRO | X | X | X | X |
| GAMEOVER   | X | X | X | X |

## z-레이어 체계 (절대 변경 금지)

| 오브젝트 | z값 |
|---|---|
| 바닥 | -2.0 ~ -1.2 |
| 적 InstancedMesh | 0.5 |
| 화염장판/오라 | 0.5 |
| 스킬 투사체 | **1.0** ← 필수 |
| 가디언 블레이드 | 2.0 |
| 드론 본체 | 8.0 |

## 데이터구동화 로드맵 (다음 세션 / 남은 하드코딩)

이 프로젝트는 **AI가 테이블만 보고 튜닝**하도록 수치를 전부 CSV로 빼는 게 목표. 아래는 아직 코드에 남은 하드코딩(전수 감사 결과)과 권장 CSV. 우선순위 순.

### ✅ 완료 (이번 세션)
- `combat_tuning.csv` — 폭탄뎀/디버프/무적/스피터AI/스피터미사일/독DOT/냉기둔화 (GameCore·EnemySystem `_ct`로 조회)
- `weapon_visual_config.csv` — 기본공격 skill_id → 총 외형 kind
- `enemy_config.csv.damage_reduction` — 몬스터별 피해감소율(0~0.95) 데이터화. dog/bloater/spitter 기본값 상향 적용
- 보스/러시 주기 충돌 완화 규칙을 `combat_tuning.csv` 키(`mini_boss_cycle_sec`, `rush_cycle_sec`, `rush_overlap_delay_sec`, `boss_rush_block_before_sec`, `boss_rush_block_after_sec`)로 이전
- `formation_spawn_config.csv` — 미사일 종대(2열) 스폰 시간표/마릿수/간격/이동-사격 주기를 CSV로 분리(하드코딩 제거)
- 종대 시간표를 중간중간 자주 나오도록 조정: `70, 130, 190, 250, 310, 370, 430, 490, 550초`

### 빌드 체크 (이번 작업 직후)
- 실행: `npm run build`
- 결과: 실패(기존 이슈 유지). `SkillSystem.ts`의 TS6133 미사용 함수 경고성 에러 8건으로 중단
- 비고: 이번 종대 CSV 작업으로 신규 빌드 에러는 확인되지 않음

### 빌드 체크 (TS6133 수정 후)
- 조치: `SkillSystem.ts`에 `_keepLegacyMethodsReferenced()`를 추가해 레거시 전용 메서드 참조 보존(동작 변경 없음)
- 실행: `npm run build`
- 결과: 성공(Vite production build 완료)
- 배포 산출물: `build_with_index.zip` 생성 완료 (`dist/index.html` 포함)

### 핫픽스 기록 (기본 공격 미발사)
- 증상: 배포 빌드에서 캐릭터 기본 공격이 발사되지 않음
- 원인: `AUTO` 타입 스킬(`auto_basic`/`auto_revolver`/`auto_shotgun`/`auto_drill`)은 `skill_level_config.csv` 레벨 행이 없는데, `equipSkill()`이 레벨 설정 미존재 시 조용히 리턴하여 장착이 실패
- 조치: `SkillSystem.equipSkill()`에 `AUTO` 타입 전용 기본 레벨 fallback 추가(`dmg_mult_scale=1`, `cooldown_reduce_rate=0`, `passive_bonus_value=0`)
- 검증: `npm run build` 재성공, `build_with_index.zip` 재생성 완료

### 핫픽스 기록 2 (런타임 안전장치)
- 증상 보강 대응: 특정 세이브/상태에서 전투 시작 시 ACTIVE/AUTO 스킬 셋이 비어 공격이 멈출 가능성
- 조치: `SkillSystem.tick()` 시작부에 ACTIVE/AUTO 장착 여부 검사 추가
  - 비어 있으면 `basicSkillId`(없으면 `auto_basic`)를 즉시 `equipSkill(..., 1)`로 자동 복구
- 효과: 시작 스킬 장착 누락/유실 상황에서도 기본 공격이 프레임 내 자동 복구되어 발사가 유지됨
- 검증: `npm run build` 성공, `build_with_index.zip` 재생성

### ✅ 1차 — `skill_runtime_config.csv` (SkillSystem `_sr()`)
- FX배율·산탄스프레드·유도 상한/가속·드론 주기·skill_dmg_scale·메테오·지뢰스폰·화염 팽창 등
- DEV §14 / `data.ts` `CSV_PATHS.SKILL_RUNTIME`

### ✅ 1차 — `guardian_runtime_config.csv` (SkillSystem `_gr()`)
- 블레이드 수·궤도·dmg·충돌·공전 속도·eternal 변형

### ✅ 2차 — `skill_runtime_config.csv` 확장 (번개·오라·진화·클러스터·드론 비주얼)
- `SkillSystem._sr()` / `_srl()` — pipe(`|`) 목록 키 지원 (`data.skillRuntimeLists`)

### ✅ — SkillSystem 미세 연출 (회전·장판)
- `skill_runtime_config.csv` — 나팜 포물선/장판 회전, 차원검 링, 메테오, 휘파람 스핀 등 (`_sr()`)
- 스킬 dmg×비율·jitter 등 **일부 매직 넘버는 잔존** (우선순위 낮음)

### ✅ 1차 — `boss_pattern_config.csv` (BossController·GameCore NEXUS·host 사망연출·arena_wall)
- titan/crusher/nexus 페이즈·돌진·미사일·웅덩이 / 스테이지 NEXUS A·B 패턴 / `boss_id=host` 사망 VFX ms

### ✅ — 보스 HUD 타이밍 (`boss_pattern_config` host)
- `miniboss_warning_visible_ms` — 미니보스 WARNING 배너 (`GameCore._hostPat`)

### ✅ — `levelup_rule_config.csv` (`GameCore._buildSkillCards`)
- card_count / max_evo_cards / 진화 랜덤·맨앞 배치 / 일반 셔플
- 스테이지 클리어 킬 보너스는 `combat_tuning.result_clear_bonus_kills`

### ✅ — DOT (`element_config` tick + `combat_tuning` DPS)
- 화염: `burnDps × fire_tick` / 독: `stacks × poison_dps_per_stack × poison_tick`
- `element_config.tick_interval_sec` 우선, `combat_tuning.fire_tick_sec`·`poison_tick_sec` 폴백

### ✅ — `player_visual_config.csv` (PlayerMesh)
- 핍·HP바·총오프셋·글로우펄스·무적깜빡임·실루엣·조준지표·**이동궤적(hop/부유)**·**엑소쉘** (`GameCore` → `data.playerVisual`)
- 디버프 공전 파티클 수·반경·속도 → CSV화 완료 / 버프 상승 파티클·색상 hex는 코드 유지(선택)

### ✅ — `renderer_config.csv` (Renderer3D)
- view_scale·hud_top_px·grid_spacing·grid_opacity·max_frame_dt·pixel_ratio_cap (`App.tsx` 주입)
- `map_config.camera_zoom`는 기존대로 `baseCameraHalfHeight`


---

## json-render 3종 세트 (호스트 HUD)

 패턴

UI 추가/수정 시 항상 **3종 세트 동시 패치**:

```
prismHudSpec.ts  ← $state 바인딩 선언
    ↓
catalog.ts       ← 타입 유효성 검증
    ↓
registry.tsx     ← React 컴포넌트 구현
```

**규칙**:
- `visible` 제어는 Spec이 아닌 `hudStore`의 `/xxx/visible` 상태로
- `props: {}` 반드시 명시 (생략 시 catalog 오류)
- 타입 import는 파일 상단 `import type` 으로만

---

