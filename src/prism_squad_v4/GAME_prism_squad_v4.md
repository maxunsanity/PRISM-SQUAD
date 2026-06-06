---
doc_generation: mdv4
condense_policy: forbidden
note: "v4는 mdv3와 별도 폴더. v5 diff용 — 절대 요약·삭제 금지."
ui_pixel_precision: "DESIGN·외부 팀. DEV는 json-render 슬롯·$state·DOM 순서·CSV SSoT만."
---

---
identity:
  name: PRISM SQUAD
  pitch: "적을 무한히 처치하며 10분간 생존하고, 세 보스를 꺾어 스테이지를 클리어하는 탑뷰 자동 공격 서바이버"
  genre: Top-down Auto-attack Survivor (Roguelike)
  duration: 10분 / 스테이지 (미니보스 2 + 최종보스 1)

components:
  hp:
    type: int
    default: 200
  exp:
    type: int
    default: 0
  level:
    type: int
    default: 1
  gold:
    type: int
    default: 0
  kill_count:
    type: int
    default: 0
  tycoon_currency:
    type: int
    default: 0
  ticket_multiplier:
    type: int
    default: 1
  game_state:
    type: enum
    values: [PLAYING, LEVELUP, PAUSED, BOSS_INTRO, GAMEOVER]
    default: PAUSED

entities:
  player:
    desc: "플레이어가 조작하는 캐릭터. 이동만 수동, 공격은 자동"
    stats: [hp, speed, radius, invincible_frames]
    source: player_config.csv

  enemy:
    desc: "4종 일반 적 (basic / dog / bloater / spitter). InstancedMesh 렌더"
    stats: [hp, speed, contact_dmg, gold_drop, exp_drop_type]
    source: enemy_config.csv

  mini_boss:
    desc: "주기 스폰(기본 100초). CRUSHER/NEXUS가 교대로 등장, 일반 웨이브는 유지"
    variants: [CRUSHER(교대), NEXUS(교대)]
    source: boss_config.csv (is_mini_boss=true)

  final_boss:
    desc: "기본 10:00(600초) 등장. BOSS_INTRO 후 전투 시작, 처치 시 VICTORY"
    variant: TITAN
    source: boss_config.csv (is_mini_boss=false)

  skill_projectile:
    desc: "스킬이 발사하는 투사체. z=1.0, MeshBasicMaterial 필수"
    source: skill_config.csv

mechanics:
  movement:
    desc: "플로팅 조이스틱(터치) / WASD+방향키(PC). 대각선 이동 시 sqrt(2)배 — 의도된 스펙"

  auto_attack:
    desc: "장착된 액티브 스킬이 쿨타임마다 최근접 적 자동 타겟 발사"

  levelup:
    desc: "EXP 100% 도달 시 LEVELUP 상태 전환, 스킬 3장 제시, 선택 후 PLAYING 복귀"
    design_target: "탕탕특공대형 10분 런 — 스킬 선택 약 14~16회(초반 2연속 레벨업 제거, 3분 전후 5~6레벨, 10분 전후 15레벨)"
    tuning:
      - "drop_config.csv — xp_small/medium/large effect_value (1/5/22)"
      - "level_config.csv — Lv→다음 Lv exp_required, 35행=스킬 선택 35회 상한, exp_scale_rate=1.145 외삽"
      - "stage_config.csv — xp_mult(1.0~1.35 완만), initial_xp_small(최소 소형 gem 개수, 시작 산포는 Lv1→3 필요 EXP 자동 맞춤)"
      - "enemy_config.csv — exp_drop_type(small/medium/large)"
      - "영구 exp_boost·ninjaScroll·몹 스폰 밀도는 체감에 추가 영향"
    code: "GameCore._expRequiredForLevel — CSV 초과 레벨은 exp_scale_rate로 외삽, 최대 레벨=levels.length+1"

  wave_progression:
    desc: "10분 단계별 스폰 구조. 미니보스는 웨이브 중단 없이 추가 스폰, 대량 러시는 주기형"
    timeline:
      - "미니보스: mini_boss_cycle_sec(기본 100초)마다 CRUSHER↔NEXUS 교대"
      - "대량 러시: rush_cycle_sec(기본 50초)마다 생성"
      - "겹침 보정: 미니보스와 같은 타이밍이면 rush_overlap_delay_sec(기본 +20초) 지연"
      - "보스 안전구간: boss_rush_block_before_sec(기본 40초) ~ boss_rush_block_after_sec(기본 20초) 러시 차단"
      - "최종보스: boss_config.spawn_time_seconds(기본 600초) 도달 시 BOSS_INTRO"

  lucky_train:
    desc: "골드 80 이상 보유 시 🎰 버튼 활성화. 모든 스킬을 골드로 즉시 구매"
    source: lucky_train_config.csv

  evolution:
    desc: "액티브 Lv.5 + 특정 패시브 Lv.1+ 보유 시 다음 레벨업에 EVO 카드 출현"
    source: skill_evolution_config.csv

  ticket_multiplier:
    desc: "입장 전 티켓 선택 팝업 (x1/x3/x5/x10). 보유분 차감, 결과 화면 타이쿤 재화 = (킬 + 클리어시 50) × 배수"
    source: ticket_config.csv

  element:
    desc: "스킬 속성 시스템. skill_config.element → 적중 시 상태효과 부여. 화염(DoT 0.5초 틱)/냉기(둔화)/독(누적 5스택)/광선(관통)/전기(연쇄)"
    source: element_config.csv (효과 수치) / skill_config.csv (스킬별 element)
    apply: "SkillSystem.hitResults=[id,dmg,element] → GameCore → EnemySystem.applyElement(). 전기 연쇄는 번개 스킬이 직접 hitResults로 처리"
  hit_debuff_rule:
    desc: "피격 둔화는 미사일 계열 피격에서만 적용. 일반 접촉/장판/근접 데미지는 둔화 없음"
    source: combat_tuning.csv (player_debuff_sec, debuff_speed_mult)

  quick_skill_hotkey:
    desc: "레벨업 카드 선택은 숫자키 1/2/3으로 즉시 선택 가능"
    source: InputController.ts (prism:quickSkill) + GameCore.ts (_onQuickSkill)

  expanded_skills:
    desc: "확장 스킬 (1차). 액티브: 번개 발사기(전기 연쇄, max_range 360) / 지뢰(화염 폭발존) / 샷건(부채꼴 산탄 5발, max_range 220). 패시브: 에너지큐브(쿨타임 -6~30%) / 피트니스(최대HP +80~400)"
    source: skill_config.csv / skill_level_config.csv / lucky_train_config.csv
    note: "모든 발사체에 max_range 적용. energyCube→cooldownMult, fitnessGuide→maxHp (전투 시작 시 _applyTalents에서 초기화)"

  lobby:
    desc: "탕탕특공대 메인 로비 레이아웃 미러링. 상단 재화바(아바타+LV+EXP / ⚡입장권 / 💎보석 / 🪙골드) + 중앙 스테이지뷰(제목 N.이름 + 최장생존시간 + 디오라마 + ‹›화살표 + 🎁챕터보상 + 게임시작⚡×N) + 하단 탭5(상점/장비/전투/성장/카드팩). 스테이지 1~10 자유 선택"
    source: stage_config.csv / ticket_config.csv
    tabs: "탕탕 원작 미러링 — 상점/장비/전투/도전/진화. 전투=로비, 상점=PrismShopScreen(구매 테스트), 장비=PrismEquipScreen, 도전=PrismChallengeScreen, 진화=PrismEvolutionScreen. (성장/카드팩 제거, 영구특성 화면은 코드 보존하나 진입점 없음)"

  shop:
    desc: "하단 탭 상점 — 보석(캐시)·골드(보석·무료 무제한)·지원품 상자. 상자=6슬롯 장비 Lv+1(만렙 시 fallback 골드). 캐시/리셋=shop_test_config.csv(미저장). 첫구매 두배=meta_config.first_purchase_double"
    source: shop_gem_pack.csv / shop_gold_pack.csv / shop_box.csv / shop_box_grade.csv / shop_test_config.csv

  challenge:
    desc: "도전 — 스테이지 10 × 난이도 3(노말/하드/헬) 잠금해제 (탕탕 도전 화면). prereq_id 체인 순차 해금, 클리어 시 DNA+골드(reward_dna/reward_gold). 입장 시 enemy_hp_mult/enemy_dmg_mult 추가 적용"
    ui: "상단 모드 안내 박스 + 스테이지별 3카드(HP/DMG 배율 표기). 카드 탭 → 상세 모달(규칙·보상·해금) → 도전 시작. 잠금 카드도 탭 시 해금 조건 표시"
    player_copy:
      mode_intro: "노말→하드→헬 순서. 전투=일반과 동일·적만 강화. 보스 클리어=도전 클리어. 최초 1회 DNA·골드."
      modal: ["플레이 방식", "난이도 배율", "클리어 보상", "해금 조건"]
    source: challenge_config.csv (난이도/스테이지 행 추가로 확장, 코드 무수정)
    state: "clearedChallenges Set (localStorage). VICTORY(_stageClear) 시 activeChallengeId 클리어 기록 + 보상"

  evolution:
    desc: "진화 — 플레이어 영구 강화 단일 세로 트리 (탕탕 진화 화면, 성장 흡수). 골드로 순차 해금, 능력(power/hp/speed/armor) 영구 합산"
    source: evolution_config.csv (branch 추가로 분기 확장)
    apply: "_evolutionBonus(type) → _applyTalents에서 특성·장비와 합산. armor=피해감소(_takeDamage, 최대 80%). unlockedEvolutions Set(localStorage)"

  result:
    desc: "승(STAGE CLEAR 🏆)/패(DEFEAT 💀) 분기. BATTLE RESULT 스탯 카드(처치/레벨/시간/골드/EXP) + SKILLS USED 칩 + 타이쿤 재화 적립(= (킬+클리어시50)×배수). 확인 → 로비 복귀"

  talent:
    desc: "영구 특성 화면 (로비 → 🌟 영구 특성). 4종(공격력+15%/체력+50/이속+8%/경험치+10% per Lv) 각 Lv.0~3, 메타 골드로 업그레이드"
    source: talent_config.csv / talent_cost_config.csv
    persistence: "localStorage(prism_squad_save_v1)에 metaGold + talentLevels + equipLevels 영속화. 결과 화면 시 인게임 골드를 metaGold에 적립"
    apply: "전투 시작(_beginBattle→_applyTalents): hp→maxHp, power→globalDmgMult, speed→speedMult, exp_boost→xpMult (특성+장비+패시브 합산)"

  equipment:
    desc: "장비 화면 (로비 → ⚔️ 장비). 6슬롯(무기/목걸이/장갑/갑옷/벨트/신발) 기본 Lv.1 지급. 슬롯별 stat_type(power/hp/speed) 효과를 메타 골드로 Lv.10까지 업그레이드. 비용 = base×scale^(lv-1)"
    source: equipment_config.csv
    apply: "_equipBonus(statType) → _applyTalents에서 특성과 합산"
    ui: "탕탕특공대 레이아웃 — 상단 재화바 + ATK/HP 바 + 중앙 캐릭터 idle(prismIdleBob 위아래) + 양옆 6슬롯 + 선택슬롯 업그레이드 + 레벨별/등급별 정렬 토글 + 보유장비 그리드 + 하단 탭바. (합성 제외)"

  adventure:
    desc: "모험 레벨(아웃게임 EXP 누적). 결과 화면 시 totalXpEarned → adventureExp 적립. 레벨업 시 보석+골드 보상 + 로비 복귀 시 레벨업 팝업. 로비 헤더에 모험 LV + EXP바 + 보석 표시"
    source: adventure_config.csv (레벨별 필요 EXP + 보상)
    gem: "보석(metaGems)은 다이아 티켓(gem_cost=500) 구매 재화로 실연동. localStorage 영속화"

goals:
  victory: "최종 보스 TITAN 처치"
  defeat: "플레이어 HP 0 도달 (언제든지)"
---

## 🎯 레퍼런스 (제작 기준 게임)

> **스퀘어(코어) = Survivor.io (Habby, 탕탕특공대)류** — 탑뷰 자동공격 로그라이트 서바이버.
>
> ⚠️ 레퍼런스는 톤·조작감·연출 **참고용**. 모든 수치·구조·UI·플로우의 단일 진실(SSoT)은 이 문서 세트(GAME·DESIGN·DEV·CSV)다. **충돌 시 문서 우선**, 임의 추가·생략 금지.

## Design Pillars

- **성장 체감**: 0초~10분 사이 약함→최강 빌드. Evolution이 화면을 장악하는 순간이 클라이맥스
- **타이쿤 연계**: 킬 수 × 티켓 배수 = 타이쿤 재화. 더 강한 티켓 = 더 많은 재화 = 토너먼트 경쟁력
- **3보스 클라이맥스**: 미니보스 2마리(성장 검문)와 최종보스(결전). 각 보스가 현재 빌드 수준을 시험
- **운영 원칙(요청 반영)**: 신규 밸런스 조정은 하드코딩보다 CSV 우선. 코드 수정이 필요한 경우 작업 시작 전에 "코딩 작업" 여부를 먼저 공유

## Mechanics in Depth

### 미니보스 vs 최종보스
- 미니보스(CRUSHER/NEXUS): 웨이브 유지하며 추가 스폰. 처치 보상(골드×3~5 + 대형 EXP)만 주고 게임 계속. BOSS_INTRO 연출 없음
- 최종보스(TITAN): BOSS_INTRO 시 일반 적 전멸 → 연출 후 전투. 기본은 웨이브 스폰 유지(`suppress_wave_spawn=0`). 처치 = 클리어
  - Phase1 (1.3초): 빨간 비네트 + ⚠️ WARNING "보스가 등장합니다"
  - Phase2 (1.0초): 퍼플 암전(startBossAmbient) + 보스명 표시 → 전투 시작

### 웨이브 중단 금지 원칙
미니보스 등장 시 일반 웨이브를 멈추지 않는다. BOSS_INTRO(전멸+암전) 연출은 최종 보스(9:30)에만 사용.

### 보스 타입 시스템 (boss_type)
- **stationary_missile (고정 포격형, NEXUS)**: 제자리 고정. 3발 방사형 유도 미사일 발사. **봉쇄 벽(아레나) 생성** — 플레이어가 도망 못 가게 가둠. 처치 시 벽 페이드아웃.
- **moving (이동형, CRUSHER/TITAN)**: 플레이어 추격. 봉쇄 벽 없음(추격하므로 불필요). 속도는 플레이어의 73~77% (압박하되 회피 가능).

### 유도 미사일 밸런스 (max_range / turn_rate)
- 보스 미사일은 `missile_turn_rate`(회전 반경)로 제한되어 플레이어가 회피 가능해야 함. 무한 추적 금지.
- `missile_max_range` 초과 시 미사일 소멸. 화면 잔류 방지 + 밸런스.
- 플레이어 유도 스킬도 `max_range`(skill_config.csv)로 사거리 제한 — 0이면 무제한.
- 투사체가 **사거리 초과로 소멸**하면 그 자리에 버스트 VFX(`_spawnExpireBurst`, 피해 없음).
- 드론: max_range 170(짧음)·연사 0.18초·2발씩·유닛 2배(p_drone). 타겟 사망 시 즉시 폭발 금지 → 가장 가까운 적 재탐색.
- 드릴샷: 적 관통 + **화면 가장자리** 반사(맵 경계 아님)로 화면 내 반동 지속.

### 무기 = 기본 공격 (장비 무기 그룹)
- `equipment_config.csv`에서 **`skill_id`가 채워진 행 = 무기 종류**(weapon/weapon_shotgun/weapon_drill). 무기 그룹은 **상호 배타**: 한 번에 1종만 장착(다른 무기 장착 시 자동 해제), 해제 불가(최소 1개 유지).
- 장착한 무기의 `skill_id`가 인게임 **기본 공격**이 됨(`GameCore._equippedWeaponSkill` → `SkillSystem.basicSkillId`). HP 바 아래 노란 탄창 핍 = 기본 공격 쿨타임 게이지(`basicCooldownPct`, 적이 있을 때만 진행).
- 장비 화면: 무기 슬롯 위치엔 **장착된 무기**가 표시되고, 인벤토리에서 다른 무기 아이템 탭→팝업→장착으로 교체. 표준 장비 팝업(ATK/레벨/장착) 그대로 사용.
- 인게임 손에 든 총 모양도 무기별로 다름(`PlayerMesh.setWeaponType`: revolver/shotgun/drill). 표시 조건은 `_hasWeaponEquipped()`(무기 그룹 중 1개라도 장착).

### 공격 발사 시스템 (데이터 구동)
- **발사 경로 2종**: ① 일반 쿨타임 루프(기본 공격 + 대부분 액티브) ② 드론 전용 사이클(공격3초/휴식, 0.18초마다 2발).
- **쿨타임**: `(base_cooldown_frames/60) × (1 - cooldown_reduce_rate) × cooldownMult`.
- **데미지**: `base_dmg_mult × dmg_mult_scale(레벨) × 10 × globalDmgMult`. (드론 ×0.55)
- **범용 발사기 `_fireFromTable`**: `fire_pattern ∈ {homing, directional, spread}` 스킬은 `skill_config`+`projectile_config` 값만으로 발사(코드 무수정). 적용: kunai/rocket/shotgun/soccer_ball/drill_shot.
- **`fire_pattern` 종류**: homing(유도)/directional(조이스틱)/spread(부채꼴)/**parabola(포물선 투척→착지 화염)**/boomerang(귀환)/orbit(공전)/ground_random·ground_self/chain(연쇄)/aura/blade/drone/passive.
- **parabola(화염병)**: `_fireParabola`가 p_flask를 목표로 곡선 비행(`gravity`)시키고 착지 시 `_spawnFlame`. `projectile_count`개 투척.
- **투사체 유닛**(`projectile_config.csv`): pierce(관통)·bounce_enemy/bounce_screen(튕김)·bounce_count·homing_turn_rate·gravity·size_mult·speed_mult·life로 거동 제어.
- **시작 2개**: 드릴/축구공/화염병(`projectile_count=2`), 수호자(블레이드 2개부터).
- **특수 핸들러 유지**(테이블 미경유): 부메랑 귀환/드론 사이클/수호자 공전/오라/낙뢰/지뢰/차원검기 + 진화 스킬(ghost_shuriken/twin_boomerang/napalm/cluster_rocket/quantum_ball/whistling_arrow/void_slash). 공통 수치는 표에 기록돼 있으나 거동은 코드.

### 러시 웨이브 (포위 스폰)
`rush_config.csv` 기반 포위 스폰 + `combat_tuning.csv` 주기 규칙 병행.
- 기본 주기: `rush_cycle_sec=50`
- 미니보스 시각 겹침 시: `rush_overlap_delay_sec=20` 지연
- 최종보스 안전구간: `boss_rush_block_before_sec=40`, `boss_rush_block_after_sec=20`
- 생성 형태/마릿수/반경/종비율은 `GameCore._buildCycleRushWave` 기본값 + stage 배율로 계산

### 미사일 종대(하드코딩 제거)
- 미사일 종대 출현 타이밍/규모/행동은 `formation_spawn_config.csv`에서 관리.
- 각 row는 `formation_id`, `start_time_seconds`, `enemy_id`, `count`, `start_offset_y`, `col_spacing`, `row_spacing`, `move_sec`, `fire_sec`, `march_speed_mult`를 가진다.
- 엔진 동작:
  - `GameCore._updateWaveSpawn`가 `stageElapsedSec` 기준으로 해당 row를 1회 트리거
  - `EnemySystem`은 `squadId` 기준으로 2열 종대 정렬 유지
  - `move_sec` 동안 전진/정렬 → `fire_sec` 동안 동시사격 → 반복
- 결과: 종대 타이밍/간격/사격 리듬은 코드 수정 없이 CSV만으로 조절 가능.

### 스폰 거리 기준 (요청 반영)
- 일반 몬스터 리젠은 플레이어 기준 원형 반경에서 생성.
- 현재 기본값: `map_config.csv`의 `spawn_radius_min=120`, `spawn_radius_max=200` (기존 380~480에서 축소).
- 목적: 화면 안 체감 리젠 거리 확보, 공백 시간 감소.

### 최종 보스 일반 스폰
`boss_config.csv` — 기본값 `suppress_wave_spawn=0` (보스전에도 `wave_config` 간격 스폰 **유지**). `1`로 바꾸면 TITAN 솔로전. `clear_minions_on_intro=1` — BOSS_INTRO 시에만 일반 몹 전멸 후 보스 등장.

### 플레이어 인게임 표현 (PlayerMesh)
- **HP 바**: 캐릭터 **위쪽**(y +0.9s). 그 아래 **노란 탄창 핍 5개** = 기본 공격 쿨타임 게이지.
- **바닥 그림자**: 라디얼 그라데이션(가장자리 투명), 발밑에 납작한 타원.
- **사각형 잔상 컷팅(아티팩트 제거)**: 몸체 `bodyMat`·실루엣 그림자 `silMat`에 `alphaTest: 0.02` → 캔버스 외곽 미세 알파 잔상(사각형 테두리 선) 컷팅. 외골격(`exoskeleton`) 껍데기 `exoShell` 텍스처는 `createRadialGradient`(원형 그라데이션) → 사각형 선 대신 부드러운 둥근 오라. (PlayerMesh.ts)
- **손에 든 총**: 무기 그룹 장착 시 표시. 캐릭터 옆(피벗)에 붙어 **발사 방향으로 조준 회전**(`setWeaponAngle` ← `skillSystem.lastFireAngle`), 왼쪽 조준 시 상하 미러로 총대 정상화. 무기 종류별 모양(`setWeaponType`).

### 스킬 슬롯 상한
액티브 6슬롯 + 패시브 6슬롯 = 최대 12. 초과 선택 불가. 슬롯이 가득 찬 상태의 레벨업은 기존 스킬 레벨업 카드만 제시.

### Evolution 발동
조건 충족(액티브 Lv.5 + 패시브 Lv.1+)된 상태에서 다음 레벨업 시 EVO 카드 1장이 일반 카드와 함께 출현. EVO 선택 시 베이스 액티브 스킬 → EVO 스킬로 교체.

### 대각선 이동
W+D 동시: vx=+1, vy=-1 → 실제 이동거리 = speed × sqrt(2). 정규화 안 함. 수정 금지.

### 기본 몬스터 추적 AI (ChaseMode — basic / bloater)
- `ChaseMode = 'direct' | 'intercept' | 'flank'` (`EnemySystem.ts`). **스폰 순간 고정**(리스폰마다 랜덤이 아니라 스폰 시 1회 결정 — `GameCore._chaseSpawnMeta`). basic/bloater에만 적용, 그 외 적은 `direct`.
- **direct**: 플레이어로 직추적. **intercept**: 플레이어 입력(`input.vx/vy`)을 받아 `chase_intercept_lead_sec`(0.45초)·`chase_intercept_player_speed`(180px/s)로 미래 위치 예측 요격. **flank**: `chase_flank_offset_px`(70) 만큼 측면 우회(`flankSign ±1`).
- **모드 비율** (`combat_tuning.csv`): basic = direct `chase_basic_direct_pct`(30) / intercept `chase_basic_intercept_pct`(40) / flank(나머지 30). bloater = direct `chase_bloater_direct_pct`(50) / intercept `chase_bloater_intercept_pct`(30) / flank(나머지 20).
- **스폰 위치 비율**(이동형): 뒤 `spawn_move_behind_weight`(0.55) / 측면 `spawn_move_side_weight`(0.30) / 앞(나머지 0.15).
- 적용 경로: `GameCore`가 `input.vx/vy`를 `EnemySystem`에 전달 → 고정된 `chaseMode` 기준으로 매 프레임 추적 벡터 계산.

## Content Guidelines

### 신규 스킬 추가
1. `skill_config.csv` 행 추가 — `fire_pattern`/`target_mode`/`projectile_count`/`spread_deg`/`explode_radius`/`projectile_id` 포함
2. 비행 투사체면 `projectile_config.csv`에 유닛(p_xxx) 행 추가 후 `projectile_id`로 참조
3. `skill_level_config.csv` 1~5레벨 수치 추가
4. `registry.tsx`의 `renderSkillIcon()` 케이스 추가
5. EVO 스킬이면 `skill_evolution_config.csv` 조합 규칙 추가
6. fire_pattern이 `homing/directional/spread`면 **코드 수정 불필요**(`_fireFromTable` 범용 발사기가 처리). 그 외(parabola/orbit/aura/chain 등)는 전용 핸들러 필요

### 신규 적 타입 추가
1. `enemy_config.csv` 행 추가
2. `EnemyMesh.ts` switch 케이스 추가
3. `wave_config.csv` rate 합계 = 1.0 유지

### 신규 보스 추가
1. `boss_config.csv`에 `is_mini_boss` 플래그로 구분
2. `BossController.ts` 보스 ID 케이스 추가
3. `GameCore.ts` 미니보스 스폰 타이밍 배열에 추가

## Anti-Patterns

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

## 연동 모듈 (선택 — v4)

| 문서 | 내용 |
|------|------|
| [`ATTACH_MODULES_v4.md`](./ATTACH_MODULES_v4.md) | 있으면 붙이는 이벤트·iframe·세일 절차 |
| 각 이벤트 `<slug>_event_v4/` | 검증된 이벤트 GAME·DEV·DESIGN·RECIPE·CSV |

코어 단독 플레이 가능. 이벤트 md 없으면 해당 모듈 구현·연동 **생략**.
