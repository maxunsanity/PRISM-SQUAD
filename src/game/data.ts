/**
 * data.ts — CSV 파서 + 전체 타입 정의 (SSoT)
 * 모든 게임 수치는 이 파일을 통해 로드됨. 코드 내 하드코딩 금지.
 */

/* ── CSV 경로 상수 (stubsAndMaterials.ts와 동기화 유지) ── */
export const CSV_PATHS = {
  PLAYER:          '/player_config.csv',
  ENEMY:           '/enemy_config.csv',
  BOSS:            '/boss_config.csv',
  WAVE:            '/wave_config.csv',
  MAP:             '/map_config.csv',
  SKILL:           '/skill_config.csv',
  PROJECTILE:      '/projectile_config.csv',
  SKILL_LEVEL:     '/skill_level_config.csv',
  SKILL_EVOLUTION: '/skill_evolution_config.csv',
  DROP:            '/drop_config.csv',
  LEVEL:           '/level_config.csv',
  VFX:             '/vfx_config.csv',
  TALENT:          '/talent_config.csv',
  TALENT_COST:     '/talent_cost_config.csv',
  CONTROL:         '/control_config.csv',
  STAGE:           '/stage_config.csv',
  LUCKY_TRAIN:     '/lucky_train_config.csv',
  TICKET:          '/ticket_config.csv',
  ELEMENT:         '/element_config.csv',
  EQUIPMENT:       '/equipment_config.csv',
  WEAPON:          '/weapon_config.csv',
  WEAPON_VISUAL:   '/weapon_visual_config.csv',
  COMBAT_TUNING:   '/combat_tuning.csv',
  ADVENTURE:       '/adventure_config.csv',
  CHALLENGE:       '/challenge_config.csv',
  EVOLUTION_TREE:  '/evolution_config.csv',
  RUSH:            '/rush_config.csv',
  META:            '/meta_config.csv',
  SHOP_TEST:       '/shop_test_config.csv',
  SHOP_GEM_PACK:   '/shop_gem_pack.csv',
  SHOP_GOLD_PACK:  '/shop_gold_pack.csv',
  SHOP_BOX:        '/shop_box.csv',
  SHOP_BOX_GRADE:  '/shop_box_grade.csv',
  FORMATION_SPAWN: '/formation_spawn_config.csv',
  RUSH_CYCLE:      '/rush_cycle_config.csv',
  LAVA_QUEST_HOST: '/lava_quest_host_config.csv',
  TICKET_MULT_STEP:'/ticket_multiplier_step.csv',
  EVENT_MINIGAME_HOST: '/event_minigame_host_config.csv',
  SKILL_RUNTIME:       '/skill_runtime_config.csv',
  GUARDIAN_RUNTIME:    '/guardian_runtime_config.csv',
  BOSS_PATTERN:        '/boss_pattern_config.csv',
  LEVELUP_RULE:        '/levelup_rule_config.csv',
  PLAYER_VISUAL:       '/player_visual_config.csv',
  RENDERER:            '/renderer_config.csv',
} as const;

/** boss_pattern_config.csv — boss_id → key → value(문자열, 런타임에서 숫자·목록 파싱) */
export type BossPatternTable = Map<string, Map<string, string>>;

export function parseBossPatternTable(rows: Record<string, string>[]): BossPatternTable {
  const table: BossPatternTable = new Map();
  for (const r of rows) {
    const bossId = r['boss_id'];
    const key = r['key'];
    if (!bossId || !key) continue;
    if (!table.has(bossId)) table.set(bossId, new Map());
    table.get(bossId)!.set(key, r['value'] ?? '');
  }
  return table;
}

export function bossPatternNum(table: BossPatternTable, bossId: string, key: string, def: number): number {
  const v = table.get(bossId)?.get(key);
  if (v === undefined || v === '') return def;
  const n = +v;
  return Number.isNaN(n) ? def : n;
}

export function bossPatternList(table: BossPatternTable, bossId: string, key: string, def: number[]): number[] {
  const v = table.get(bossId)?.get(key);
  if (!v) return def;
  const list = v.split('|').map(s => +s.trim()).filter(n => !Number.isNaN(n));
  return list.length ? list : def;
}

/* ── 경량 CSV 파서 ── */
/** 따옴표(")로 감싼 필드 안의 쉼표를 보존하는 CSV 한 줄 분리 */
function splitCsvLine(line: string): string[] {
  const out: string[] = [];
  let cur = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (inQuotes) {
      if (ch === '"') {
        if (line[i + 1] === '"') { cur += '"'; i++; }  // 이스케이프된 따옴표
        else inQuotes = false;
      } else {
        cur += ch;
      }
    } else if (ch === '"') {
      inQuotes = true;
    } else if (ch === ',') {
      out.push(cur);
      cur = '';
    } else {
      cur += ch;
    }
  }
  out.push(cur);
  return out.map(v => v.trim());
}

function parseCSV(raw: string): Record<string, string>[] {
  const lines = raw.trim().split('\n').map(l => l.trim()).filter(Boolean);
  if (lines.length < 2) return [];
  const headers = splitCsvLine(lines[0]);
  return lines.slice(1).map(line => {
    const vals = splitCsvLine(line);
    const row: Record<string, string> = {};
    headers.forEach((h, i) => { row[h] = vals[i] ?? ''; });
    return row;
  });
}

async function loadCSV(path: string): Promise<Record<string, string>[]> {
  const res = await fetch(path);
  const text = await res.text();
  return parseCSV(text);
}

/* ── 타입 정의 ── */
export type GameState = 'PLAYING' | 'LEVELUP' | 'PAUSED' | 'BOSS_INTRO' | 'GAMEOVER';
export type SkillType = 'ACTIVE' | 'PASSIVE' | 'AUTO';
export type DropType = 'xp' | 'heal' | 'magnet' | 'bomb';
export type EnemyId = 'basic' | 'dog' | 'bloater' | 'spitter' | 'crusher' | 'nexus';

export interface PlayerConfig {
  player_id: string;
  max_hp: number;
  base_speed: number;
  radius: number;
  invincible_frames: number;
  geometry_size: number;
  color_hex: string;
  glow_intensity: number;
  hp_bar_low_threshold: number;
  sprite_url: string;
}

export interface EnemyConfig {
  enemy_id: EnemyId;
  enemy_name: string;
  hp: number;
  /** 받는 피해 감소율 (0~0.95) */
  damage_reduction: number;
  speed: number;
  radius: number;
  contact_dmg: number;
  contact_dmg_interval_frames: number;
  exp_drop_type: string;
  gold_drop: number;
  weight: number;
  geometry_type: string;
  color_hex: string;
  has_glow: boolean;
  glow_color_hex: string;
  sprite_url: string;
}

export interface BossConfig {
  boss_id: string;
  boss_name: string;
  is_mini_boss: boolean;
  boss_type: 'moving' | 'stationary_missile';
  arena_size_w: number;
  arena_size_h: number;
  missile_count: number;
  missile_interval_frames: number;
  missile_speed: number;
  missile_turn_rate: number;
  missile_max_range: number;
  missile_spread_angle: number;
  hp: number;
  speed: number;
  radius: number;
  contact_dmg: number;
  contact_dmg_interval_frames: number;
  puddle_interval_frames: number;
  puddle_radius: number;
  puddle_life_frames: number;
  puddle_dmg: number;
  puddle_dmg_interval_frames: number;
  spawn_time_seconds: number;
  spawn_offset_y: number;
  /** BOSS_INTRO 시 일반 몬스터 전멸 (최종 보스) */
  clear_minions_on_intro: boolean;
  /** 보스 전투 중 wave_config 간격 스폰 중단 */
  suppress_wave_spawn: boolean;
  geometry_type: string;
  color_hex: string;
  glow_color_hex: string;
  sprite_url: string;
}

export interface RushConfig {
  rush_id: number;
  start_time_seconds: number;
  warning_sec: number;
  spawn_count_base: number;
  spawn_count_per_stage: number;
  spawn_count_max: number;
  ring_radius: number;
  ring_radius_jitter: number;
  rate_dog: number;
  rate_basic: number;
  rate_spitter: number;
  /** formation: 'ring'(기본)|'column' */
  formation: string;
  /** 1이면 현재 웨이브 max_enemies 상한까지만 추가 스폰 */
  respect_max_enemies: boolean;
  enabled: boolean;
}

export interface FormationSpawnConfig {
  formation_id: number;
  start_time_seconds: number;
  enemy_id: EnemyId;
  count: number;
  start_offset_y: number;
  col_spacing: number;
  row_spacing: number;
  move_sec: number;
  fire_sec: number;
  march_speed_mult: number;
  enabled: boolean;
}

export interface WaveConfig {
  /** 이 웨이브가 속한 스테이지 번호 */
  stage: number;
  wave_id: number;
  start_time_seconds: number;
  spawn_interval_frames: number;
  max_enemies: number;
  rate_basic: number;
  rate_dog: number;
  rate_bloater: number;
  rate_spitter: number;
}

export interface MapConfig {
  map_id: string;
  map_width: number;
  map_height: number;
  camera_zoom: number;
  spawn_radius_min: number;
  spawn_radius_max: number;
  boundary_color_hex: string;
  boundary_opacity: number;
  grid_color_hex: string;
  grid_interval: number;
  floor_color_hex: string;
  ambient_light_color: string;
  ambient_light_intensity: number;
  dir_light_color: string;
  dir_light_intensity: number;
  boss_ambient_color: string;
  boss_ambient_transition_seconds: number;
  bg_sprite_url: string;
}

export interface SkillConfig {
  skill_id: string;
  skill_name: string;
  skill_type: SkillType;
  icon: string;
  description: string;
  base_cooldown_frames: number;
  base_dmg_mult: number;
  projectile_speed: number;
  projectile_radius: number;
  max_level: number;
  /** 유도 투사체 최대 이동 거리 (0 = 무한) */
  max_range: number;
  /** 속성 (fire/ice/poison/beam/electric, 빈값=무속성) */
  element: string;
  projectile_sprite_url: string;
  /** 발사 방식: homing/directional/spread/boomerang/orbit/parabola/ground_random/ground_self/chain/aura/blade/drone/passive */
  fire_pattern: string;
  /** 조준 기준: nearest/joystick/random_enemy/self */
  target_mode: string;
  /** 한 번에 발사하는 투사체 개수 */
  projectile_count: number;
  /** 분산 각도(도) — spread/멀티샷용 */
  spread_deg: number;
  /** 명중/소멸 시 폭발 반경 (0=폭발 없음) */
  explode_radius: number;
  /** 참조할 투사체 유닛 ID (projectile_config) */
  projectile_id: string;
  /** 탄창 용량 (0 = 쿨타임 방식, >0 = 탄창/재장전 방식) */
  magazine_capacity: number;
  /** 연사 간격 (프레임) — magazine_capacity > 0 일 때만 사용 */
  burst_interval_frames: number;
  /** 재장전 시간 (프레임) */
  reload_frames: number;
}

/** 투사체 유닛 — 날아가는 물체의 외형/물리 (skill.projectile_id로 참조) */
export interface ProjectileConfig {
  projectile_id: string;
  shape: string;          // kunai/sphere/cone/torus/rocket/boomerang/flask
  color_hex: string;
  size_mult: number;
  speed_mult: number;
  life_seconds: number;
  pierce: boolean;        // 적 관통
  bounce_enemy: boolean;  // 적에 튕김
  bounce_screen: boolean; // 화면 가장자리에 튕김
  bounce_count: number;
  homing_turn_rate: number;
  gravity: number;        // >0 = 포물선 낙하
}

export interface AdventureConfig {
  level: number;
  exp_required: number;   // 이 레벨 도달에 필요한 누적 EXP
  reward_gem: number;
  reward_gold: number;
}

export interface ChallengeConfig {
  challenge_id: number;
  stage: number;
  difficulty: number;
  difficulty_name: string;
  enemy_hp_mult: number;
  enemy_dmg_mult: number;
  reward_dna: number;
  reward_gold: number;
  prereq_id: number;   // 0 = 잠금 없음
}

export interface LevelUpRuleConfig {
  cardCount: number;
  maxEvoCards: number;
  evoRandomPick: boolean;
  evoFirstInList: boolean;
  normalShuffle: boolean;
}

export interface MetaConfig {
  initialGems: number;
  initialDna: number;
  initialGold: number;
  initialEnergy: number;
  maxEnergy: number;
  energyPerMult: number;
  armorCap: number;
  predatorHealRatio: number;
  firstPurchaseDouble: boolean;
  itemDropChance: number;
  cooldownMultMin: number;
  avatarProfileLimit: number;
}

export interface ShopTestConfig {
  testCashKrw: number;
  testResetGems: number;
  showResetButton: boolean;
}

export interface ShopGemPackConfig {
  pack_id: string;
  sort_order: number;
  label: string;
  gems: number;
  bonus_gems: number;
  price_krw: number;
  enabled: boolean;
}

export interface ShopGoldPackConfig {
  pack_id: string;
  sort_order: number;
  label: string;
  sublabel: string;
  gold: number;
  gem_cost: number;
  is_free: boolean;
  enabled: boolean;
}

export interface ShopBoxConfig {
  box_id: string;
  sort_order: number;
  label: string;
  subtitle: string;
  gem_cost: number;
  key_cost: number;
  pity_max: number;
  pity_force_grade: string;
  key_bonus_chance: number;
  banner_title: string;
  banner_desc: string;
  enabled: boolean;
}

export interface ShopBoxGradeConfig {
  box_id: string;
  equipment_grade: string;
  weight: number;
  grant_fallback_gold: number;
}

export interface EvolutionNodeConfig {
  evo_id: number;
  order: number;
  branch: number;      // 0 = 일반진화(메인,골드), 1 = 특수진화(분기,DNA)
  node_name: string;
  node_title: string;  // 정보 팝업 제목
  node_description: string; // 정보 팝업 설명
  icon: string;
  ability_type: string; // power/hp/speed/armor (일반) | predator/cooldown/magnet (특수)
  effect_value: number;
  cost_type: string;   // gold / dna
  cost_amount: number;
  prereq_id: number;   // 0 = 시작 노드
}

export interface EquipmentConfig {
  slot_id: string;
  slot_name: string;
  item_name: string;
  icon: string;
  grade: string;
  stat_type: string;       // power / hp / speed
  effect_per_level: number;
  max_level: number;
  base_gold_cost: number;
  gold_cost_scale: number;
  description: string;
  skill_id: string;        // 무기 슬롯 전용: 장착 시 기본 공격이 되는 스킬 (그 외 슬롯은 빈값)
}

/** 무기 외형 매핑 — 기본공격 스킬 → 인게임 총 모양/크기/오프셋 */
export interface WeaponVisualConfig {
  skill_id: string;
  weapon_kind: string;   // revolver/shotgun/drill
  scale: number;
  offset_x: number;
  offset_y: number;
}

/** 무기 종류 — 장착 무기에 따라 인게임 기본 공격(스킬)이 달라짐 */
export interface WeaponConfig {
  weapon_id: string;
  item_name: string;
  icon: string;
  grade: string;
  skill_id: string;        // 기본 공격으로 사용할 스킬 ID
  description: string;
}

export interface ElementConfig {
  element: string;
  element_name: string;
  icon: string;
  color_hex: string;
  effect_type: string;   // dot / slow / poison_stack / pierce / chain
  duration_sec: number;
  magnitude: number;
  tick_interval_sec: number;
  max_stacks: number;
}

export interface SkillLevelConfig {
  skill_id: string;
  level: number;
  dmg_mult_scale: number;
  cooldown_reduce_rate: number;
  passive_bonus_value: number;
}

export interface SkillEvolutionConfig {
  evolution_id: string;
  active_skill_id: string;
  passive_skill_id: string;
  result_skill_id: string;
  result_skill_name: string;
  result_description: string;
}

export interface DropConfig {
  drop_id: string;
  drop_type: DropType;
  drop_weight: number;
  effect_value: number;
  pickup_radius: number;
  geometry_type: string;
  color_hex: string;
  size_small: number;
  size_medium: number;
  size_large: number;
  sprite_url: string;
}

export interface LevelConfig {
  level: number;
  exp_required: number;
  exp_scale_rate: number;
}

export interface StageConfig {
  /** 스테이지 번호 (1~10) */
  stage: number;
  /** 로비·도전 UI 표시명 */
  stage_name: string;
  /** 최대 동시 적 수 스케일 (wave max_enemies × 이 값) */
  max_enemies_scale: number;
  /** 스폰 간격 스케일 (wave spawn_interval_frames × 이 값) */
  spawn_interval_scale: number;
  /** 스폰 간격 최소값 (프레임) */
  spawn_interval_min_frames: number;
  /** 보스 체력 배율 (boss_config hp × 이 값) */
  boss_hp_mult: number;
  /** 몬스터 경험치 배율 (drop effect_value × 이 값) */
  xp_mult: number;
  /** 게임 시작 시 바닥에 산포할 xp_small 개수 */
  initial_xp_small: number;
  /** 적 체력 배율 */
  enemy_hp_mult: number;
  /** 적 이동 속도 배율 */
  enemy_speed_mult: number;
  /** 적 접촉 데미지 배율 */
  enemy_dmg_mult: number;
}

export interface VfxConfig {
  vfx_id: string;
  particle_count: number;
  particle_size_min: number;
  particle_size_max: number;
  particle_life_frames: number;
  particle_speed: number;
  bloom_strength: number;
  bloom_radius: number;
  bloom_threshold: number;
  screen_shake_intensity: number;
  screen_shake_duration_frames: number;
  flash_duration_frames: number;
  particle_color_hex: string;
  particle_sprite_url: string;
}

export interface TalentConfig {
  talent_id: string;
  talent_name: string;
  description: string;
  max_level: number;
  effect_per_level: number;
}

export interface TalentCostConfig {
  talent_id: string;
  level: number;
  gold_cost: number;
}

export interface ControlConfig {
  joystick_ring_diameter: number;
  joystick_knob_diameter: number;
  joystick_max_dist: number;
  joystick_z_index: number;
  joystick_ring_opacity: number;
  joystick_knob_opacity: number;
  keyboard_diagonal_normalize: boolean;
}

export interface LuckyTrainConfig {
  skill_id: string;
  gold_cost: number;
}

export interface TicketConfig {
  ticket_id: string;
  ticket_name: string;
  ticket_tier: number;
  multiplier: number;
  gem_cost: number;
  daily_free_count: number;
  icon: string;
  acquire_label: string;
}

export interface LavaQuestHostRule {
  level_min: number;
  level_max: number;
  boss_id: string;
  boss_spawn_sec_override: number;
}

/** iframe 미니게임 호스트 (event_minigame_host_config.csv) */
export interface EventMinigameHostConfig {
  id: string;
  label: string;
  emoji: string;
  tabBg: string;
  src: string;
  ticketPath: string;
  ticketCost: number;
  ticketUnit: string;
  showFlag: string;
  persistKeys: string[];
  enabled: boolean;
}

function parseRushRow(r: Record<string, string>, startOverride?: number): RushConfig {
  return {
    rush_id: +r['rush_id'],
    start_time_seconds: startOverride ?? (+r['start_time_seconds'] || 0),
    warning_sec: +r['warning_sec'] || 2,
    spawn_count_base: +r['spawn_count_base'] || 30,
    spawn_count_per_stage: +r['spawn_count_per_stage'] || 0,
    spawn_count_max: +r['spawn_count_max'] || 50,
    ring_radius: +r['ring_radius'] || 280,
    ring_radius_jitter: +r['ring_radius_jitter'] || 0,
    rate_dog: +r['rate_dog'] || 0,
    rate_basic: +r['rate_basic'] || 0,
    rate_spitter: +r['rate_spitter'] || 0,
    formation: r['formation'] || 'ring',
    respect_max_enemies: r['respect_max_enemies'] === '1',
    enabled: r['enabled'] !== '0',
  };
}

/* ── 전체 게임 데이터 컨테이너 ── */
export interface GameData {
  player: PlayerConfig;
  players: PlayerConfig[];
  enemies: Map<EnemyId, EnemyConfig>;
  bosses: BossConfig[];
  /** 최종 보스 (is_mini_boss=false 중 spawn_time_seconds 최대) */
  finalBoss: BossConfig;
  waves: WaveConfig[];
  map: MapConfig;
  skills: Map<string, SkillConfig>;
  projectiles: Map<string, ProjectileConfig>;
  weaponVisuals: Map<string, WeaponVisualConfig>;
  combatTuning: Map<string, number>;
  playerVisual: Map<string, number>;
  rendererConfig: Map<string, number>;
  skillRuntime: Map<string, number>;
  /** pipe(|) 구분 목록 — skill_runtime_config */
  skillRuntimeLists: Map<string, number[]>;
  guardianRuntime: Map<string, number>;
  levelUpRules: LevelUpRuleConfig;
  bossPatterns: BossPatternTable;
  skillLevels: Map<string, SkillLevelConfig[]>;
  evolutions: SkillEvolutionConfig[];
  drops: DropConfig[];
  levels: LevelConfig[];
  stages: StageConfig[];
  luckyTrain: Map<string, LuckyTrainConfig>;
  tickets: TicketConfig[];
  elements: Map<string, ElementConfig>;
  equipment: EquipmentConfig[];
  weapons: WeaponConfig[];
  adventure: AdventureConfig[];
  challenges: ChallengeConfig[];
  evolutionTree: EvolutionNodeConfig[];
  rushWaves: RushConfig[];
  /** 주기형 러시 템플릿 (rush_cycle_config.csv rush_id=0) */
  rushCycleTemplate: RushConfig | null;
  formationSpawns: FormationSpawnConfig[];
  /** 입장 배수 단계 (ticket_multiplier_step.csv) */
  ticketMultSteps: number[];
  /** 라바 호스트 전투 보스·등장 시각 */
  lavaQuestHost: LavaQuestHostRule[];
  /** iframe 미니게임 호스트 메타 */
  eventMinigames: EventMinigameHostConfig[];
  eventMinigameOrder: string[];
  meta: MetaConfig;
  shopTest: ShopTestConfig;
  shopGemPacks: ShopGemPackConfig[];
  shopGoldPacks: ShopGoldPackConfig[];
  shopBoxes: ShopBoxConfig[];
  shopBoxGrades: Map<string, ShopBoxGradeConfig[]>;
  vfx: Map<string, VfxConfig>;
  talents: TalentConfig[];
  talentCosts: Map<string, TalentCostConfig[]>;
  control: ControlConfig;
}

function parseLevelUpRules(rows: Record<string, string>[]): LevelUpRuleConfig {
  const m = new Map(rows.map(r => [r['key'], r['value']]));
  const num = (k: string, def: number) => {
    const v = m.get(k);
    return v !== undefined && v !== '' ? +v : def;
  };
  const flag = (k: string) => m.get(k) !== '0';
  return {
    cardCount: num('card_count', 3),
    maxEvoCards: num('max_evo_cards', 1),
    evoRandomPick: flag('evo_random_pick'),
    evoFirstInList: flag('evo_first_in_list'),
    normalShuffle: flag('normal_shuffle'),
  };
}

function parseMetaConfig(rows: Record<string, string>[]): MetaConfig {
  const m = new Map(rows.map(r => [r['key'], r['value']]));
  const num = (k: string, def: number) => {
    const v = m.get(k);
    return v !== undefined && v !== '' ? +v : def;
  };
  return {
    initialGems: num('initial_gems', 500),
    initialDna: num('initial_dna', 100),
    initialGold: num('initial_gold', 0),
    initialEnergy: num('initial_energy', 500),
    maxEnergy: num('max_energy', 60),
    energyPerMult: num('energy_per_mult', 5),
    armorCap: num('armor_cap', 0.8),
    predatorHealRatio: num('predator_heal_ratio', 0.02),
    firstPurchaseDouble: m.get('first_purchase_double') !== '0',
    itemDropChance: num('item_drop_chance', 0.03),
    cooldownMultMin: num('cooldown_mult_min', 0.2),
    avatarProfileLimit: num('avatar_profile_limit', 16),
  };
}

function parseShopTestConfig(rows: Record<string, string>[]): ShopTestConfig {
  const m = new Map(rows.map(r => [r['key'], r['value']]));
  return {
    testCashKrw: +(m.get('test_cash_krw') ?? 1_000_000),
    testResetGems: +(m.get('test_reset_gems') ?? 500),
    showResetButton: m.get('show_reset_button') !== '0',
  };
}

/* ── 로드 함수 ── */
export async function loadAllGameData(): Promise<GameData> {
  const [
    playerRows, enemyRows, bossRows, waveRows, mapRows,
    skillRows, projectileRows, skillLevelRows, evoRows, dropRows, levelRows,
    vfxRows, talentRows, talentCostRows, controlRows, stageRows, luckyTrainRows, ticketRows, elementRows, equipmentRows, adventureRows, challengeRows, evolutionTreeRows, weaponRows,
    metaRows, shopTestRows, shopGemRows, shopGoldRows, shopBoxRows, shopBoxGradeRows, rushRows, formationSpawnRows,
    weaponVisualRows, combatTuningRows,
    rushCycleRows, lavaHostRows, ticketMultRows, eventMinigameRows, skillRuntimeRows,
    guardianRuntimeRows, bossPatternRows, levelUpRuleRows,
    playerVisualRows, rendererConfigRows,
  ] = await Promise.all([
    loadCSV(CSV_PATHS.PLAYER),
    loadCSV(CSV_PATHS.ENEMY),
    loadCSV(CSV_PATHS.BOSS),
    loadCSV(CSV_PATHS.WAVE),
    loadCSV(CSV_PATHS.MAP),
    loadCSV(CSV_PATHS.SKILL),
    loadCSV(CSV_PATHS.PROJECTILE),
    loadCSV(CSV_PATHS.SKILL_LEVEL),
    loadCSV(CSV_PATHS.SKILL_EVOLUTION),
    loadCSV(CSV_PATHS.DROP),
    loadCSV(CSV_PATHS.LEVEL),
    loadCSV(CSV_PATHS.VFX),
    loadCSV(CSV_PATHS.TALENT),
    loadCSV(CSV_PATHS.TALENT_COST),
    loadCSV(CSV_PATHS.CONTROL),
    loadCSV(CSV_PATHS.STAGE),
    loadCSV(CSV_PATHS.LUCKY_TRAIN),
    loadCSV(CSV_PATHS.TICKET),
    loadCSV(CSV_PATHS.ELEMENT),
    loadCSV(CSV_PATHS.EQUIPMENT),
    loadCSV(CSV_PATHS.ADVENTURE),
    loadCSV(CSV_PATHS.CHALLENGE),
    loadCSV(CSV_PATHS.EVOLUTION_TREE),
    loadCSV(CSV_PATHS.WEAPON),
    loadCSV(CSV_PATHS.META),
    loadCSV(CSV_PATHS.SHOP_TEST),
    loadCSV(CSV_PATHS.SHOP_GEM_PACK),
    loadCSV(CSV_PATHS.SHOP_GOLD_PACK),
    loadCSV(CSV_PATHS.SHOP_BOX),
    loadCSV(CSV_PATHS.SHOP_BOX_GRADE),
    loadCSV(CSV_PATHS.RUSH),
    loadCSV(CSV_PATHS.FORMATION_SPAWN),
    loadCSV(CSV_PATHS.WEAPON_VISUAL),
    loadCSV(CSV_PATHS.COMBAT_TUNING),
    loadCSV(CSV_PATHS.RUSH_CYCLE),
    loadCSV(CSV_PATHS.LAVA_QUEST_HOST),
    loadCSV(CSV_PATHS.TICKET_MULT_STEP),
    loadCSV(CSV_PATHS.EVENT_MINIGAME_HOST),
    loadCSV(CSV_PATHS.SKILL_RUNTIME),
    loadCSV(CSV_PATHS.GUARDIAN_RUNTIME),
    loadCSV(CSV_PATHS.BOSS_PATTERN),
    loadCSV(CSV_PATHS.LEVELUP_RULE),
    loadCSV(CSV_PATHS.PLAYER_VISUAL),
    loadCSV(CSV_PATHS.RENDERER),
  ]);

  const weaponVisuals = new Map<string, WeaponVisualConfig>();
  for (const r of weaponVisualRows) {
    weaponVisuals.set(r['skill_id'], {
      skill_id: r['skill_id'],
      weapon_kind: r['weapon_kind'] || 'revolver',
      scale: +r['scale'] || 1,
      offset_x: +r['offset_x'] || 0,
      offset_y: +r['offset_y'] || 0,
    });
  }
  const combatTuning = new Map<string, number>();
  for (const r of combatTuningRows) {
    if (r['key']) combatTuning.set(r['key'], +r['value'] || 0);
  }
  const playerVisual = new Map<string, number>();
  for (const r of playerVisualRows) {
    if (r['key']) playerVisual.set(r['key'], +r['value'] || 0);
  }
  const rendererConfig = new Map<string, number>();
  for (const r of rendererConfigRows) {
    if (r['key']) rendererConfig.set(r['key'], +r['value'] || 0);
  }
  const skillRuntime = new Map<string, number>();
  const skillRuntimeLists = new Map<string, number[]>();
  for (const r of skillRuntimeRows) {
    const key = r['key'];
    const val = r['value'] ?? '';
    if (!key || val === '') continue;
    if (val.includes('|')) {
      const list = val.split('|').map(s => +s.trim()).filter(n => !Number.isNaN(n));
      if (list.length) skillRuntimeLists.set(key, list);
    } else {
      skillRuntime.set(key, +val || 0);
    }
  }
  const levelUpRules = parseLevelUpRules(levelUpRuleRows);
  const guardianRuntime = new Map<string, number>();
  for (const r of guardianRuntimeRows) {
    if (r['key']) guardianRuntime.set(r['key'], +r['value'] || 0);
  }
  const bossPatterns = parseBossPatternTable(bossPatternRows);

  const meta = parseMetaConfig(metaRows);
  const shopTest = parseShopTestConfig(shopTestRows);

  const weapons: WeaponConfig[] = weaponRows.map(w => ({
    weapon_id: w['weapon_id'],
    item_name: w['item_name'],
    icon: w['icon'],
    grade: w['grade'],
    skill_id: w['skill_id'],
    description: w['description'],
  }));

  const players: PlayerConfig[] = playerRows.map(p => ({
    player_id: p['player_id'],
    max_hp: +p['max_hp'],
    base_speed: +p['base_speed'],
    radius: +p['radius'],
    invincible_frames: +p['invincible_frames'],
    geometry_size: +p['geometry_size'],
    color_hex: p['color_hex'],
    glow_intensity: +p['glow_intensity'],
    hp_bar_low_threshold: +p['hp_bar_low_threshold'],
    sprite_url: p['sprite_url'] ?? '',
  }));
  const player = players[0];

  const enemies = new Map<EnemyId, EnemyConfig>();
  for (const r of enemyRows) {
    enemies.set(r['enemy_id'] as EnemyId, {
      enemy_id: r['enemy_id'] as EnemyId,
      enemy_name: r['enemy_name'],
      hp: +r['hp'],
      damage_reduction: +r['damage_reduction'] || 0,
      speed: +r['speed'],
      radius: +r['radius'],
      contact_dmg: +r['contact_dmg'],
      contact_dmg_interval_frames: +r['contact_dmg_interval_frames'],
      exp_drop_type: r['exp_drop_type'],
      gold_drop: +r['gold_drop'],
      weight: +r['weight'],
      geometry_type: r['geometry_type'],
      color_hex: r['color_hex'],
      has_glow: r['has_glow'] === 'true',
      glow_color_hex: r['glow_color_hex'] ?? '',
      sprite_url: r['sprite_url'] ?? '',
    });
  }

  const bosses: BossConfig[] = bossRows.map(br => ({
    boss_id: br['boss_id'],
    boss_name: br['boss_name'],
    is_mini_boss: br['is_mini_boss'] === 'true',
    boss_type: (br['boss_type'] ?? 'moving') as 'moving' | 'stationary_missile',
    arena_size_w: +br['arena_size_w'] || 0,
    arena_size_h: +br['arena_size_h'] || 0,
    missile_count: +br['missile_count'] || 0,
    missile_interval_frames: +br['missile_interval_frames'] || 0,
    missile_speed: +br['missile_speed'] || 0,
    missile_turn_rate: +br['missile_turn_rate'] || 0,
    missile_max_range: +br['missile_max_range'] || 0,
    missile_spread_angle: +br['missile_spread_angle'] || 0,
    hp: +br['hp'],
    speed: +br['speed'],
    radius: +br['radius'],
    contact_dmg: +br['contact_dmg'],
    contact_dmg_interval_frames: +br['contact_dmg_interval_frames'],
    puddle_interval_frames: +br['puddle_interval_frames'],
    puddle_radius: +br['puddle_radius'],
    puddle_life_frames: +br['puddle_life_frames'],
    puddle_dmg: +br['puddle_dmg'],
    puddle_dmg_interval_frames: +br['puddle_dmg_interval_frames'],
    spawn_time_seconds: +br['spawn_time_seconds'],
    spawn_offset_y: +br['spawn_offset_y'],
    clear_minions_on_intro: br['clear_minions_on_intro'] === '1',
    suppress_wave_spawn: br['suppress_wave_spawn'] === '1',
    geometry_type: br['geometry_type'],
    color_hex: br['color_hex'],
    glow_color_hex: br['glow_color_hex'],
    sprite_url: br['sprite_url'] ?? '',
  }));
  const finalBoss = bosses.find(b => !b.is_mini_boss) ?? bosses[bosses.length - 1];

  const rushWaves: RushConfig[] = rushRows
    .filter(r => r['enabled'] !== '0')
    .map(r => parseRushRow(r))
    .sort((a, b) => a.start_time_seconds - b.start_time_seconds);

  const rushCycleRow = rushCycleRows.find(r => r['rush_id'] === '0' && r['enabled'] !== '0')
    ?? rushCycleRows.find(r => r['enabled'] !== '0');
  const rushCycleTemplate = rushCycleRow ? parseRushRow(rushCycleRow, 0) : null;

  const ticketMultSteps = ticketMultRows
    .filter(r => r['multiplier'] !== '' && r['enabled'] !== '0')
    .sort((a, b) => (+a['sort_order'] || 0) - (+b['sort_order'] || 0))
    .map(r => +r['multiplier'])
    .filter(n => n > 0);
  const ticketMultStepsFinal = ticketMultSteps.length ? ticketMultSteps : [1, 2, 5, 10, 50, 100];

  const lavaQuestHost: LavaQuestHostRule[] = lavaHostRows
    .filter(r => r['boss_id'])
    .map(r => ({
      level_min: +r['level_min'] || 1,
      level_max: +r['level_max'] || 99,
      boss_id: r['boss_id'],
      boss_spawn_sec_override: +r['boss_spawn_sec_override'] || 50,
    }));

  const eventMinigames: EventMinigameHostConfig[] = [];
  const eventMinigameOrder: string[] = [];
  for (const r of eventMinigameRows) {
    if (r['enabled'] === '0' || !r['id']) continue;
    const id = r['id'];
    eventMinigameOrder.push(id);
    const persistRaw = r['persist_keys'] ?? '';
    eventMinigames.push({
      id,
      label: r['label'] || id,
      emoji: r['emoji'] || '',
      tabBg: r['tab_bg'] || '#888888',
      src: r['src'] || '',
      ticketPath: r['ticket_path'] || '',
      ticketCost: +r['ticket_cost'] || 0,
      ticketUnit: r['ticket_unit'] || '',
      showFlag: r['show_flag_key'] || '',
      persistKeys: persistRaw ? persistRaw.split('|').map(k => k.trim()).filter(Boolean) : [],
      enabled: true,
    });
  }

  const formationSpawns: FormationSpawnConfig[] = formationSpawnRows
    .filter(r => r['enabled'] !== '0')
    .map(r => ({
      formation_id: +r['formation_id'],
      start_time_seconds: +r['start_time_seconds'],
      enemy_id: (r['enemy_id'] || 'spitter') as EnemyId,
      count: +r['count'] || 12,
      start_offset_y: +r['start_offset_y'] || 260,
      col_spacing: +r['col_spacing'] || 30,
      row_spacing: +r['row_spacing'] || 26,
      move_sec: +r['move_sec'] || 1.4,
      fire_sec: +r['fire_sec'] || 0.9,
      march_speed_mult: +r['march_speed_mult'] || 0.85,
      enabled: r['enabled'] !== '0',
    }))
    .sort((a, b) => a.start_time_seconds - b.start_time_seconds);

  const waves: WaveConfig[] = waveRows.map(r => ({
    stage:                 +r['stage'],
    wave_id:               +r['wave_id'],
    start_time_seconds:    +r['start_time_seconds'],
    spawn_interval_frames: +r['spawn_interval_frames'],
    max_enemies:           +r['max_enemies'],
    rate_basic:            +r['rate_basic'],
    rate_dog:              +r['rate_dog'],
    rate_bloater:          +r['rate_bloater'],
    rate_spitter:          +r['rate_spitter'],
  }));

  const mr = mapRows[0];
  const map: MapConfig = {
    map_id: mr['map_id'],
    map_width: +mr['map_width'],
    map_height: +mr['map_height'],
    camera_zoom: +mr['camera_zoom'],
    spawn_radius_min: +mr['spawn_radius_min'],
    spawn_radius_max: +mr['spawn_radius_max'],
    boundary_color_hex: mr['boundary_color_hex'],
    boundary_opacity: +mr['boundary_opacity'],
    grid_color_hex: mr['grid_color_hex'],
    grid_interval: +mr['grid_interval'],
    floor_color_hex: mr['floor_color_hex'],
    ambient_light_color: mr['ambient_light_color'],
    ambient_light_intensity: +mr['ambient_light_intensity'],
    dir_light_color: mr['dir_light_color'],
    dir_light_intensity: +mr['dir_light_intensity'],
    boss_ambient_color: mr['boss_ambient_color'],
    boss_ambient_transition_seconds: +mr['boss_ambient_transition_seconds'],
    bg_sprite_url: mr['bg_sprite_url'] ?? '',
  };

  const skills = new Map<string, SkillConfig>();
  for (const r of skillRows) {
    skills.set(r['skill_id'], {
      skill_id: r['skill_id'],
      skill_name: r['skill_name'],
      skill_type: r['skill_type'] as SkillType,
      icon: r['icon'],
      description: r['description'],
      base_cooldown_frames: +r['base_cooldown_frames'],
      base_dmg_mult: +r['base_dmg_mult'],
      projectile_speed: +r['projectile_speed'],
      projectile_radius: +r['projectile_radius'],
      max_level: +r['max_level'],
      max_range: +r['max_range'] || 0,
      element: r['element'] ?? '',
      projectile_sprite_url: r['projectile_sprite_url'] ?? '',
      fire_pattern: r['fire_pattern'] ?? '',
      target_mode: r['target_mode'] ?? 'nearest',
      projectile_count: +r['projectile_count'] || 0,
      spread_deg: +r['spread_deg'] || 0,
      explode_radius: +r['explode_radius'] || 0,
      projectile_id: r['projectile_id'] ?? '',
      magazine_capacity: +r['magazine_capacity'] || 0,
      burst_interval_frames: +r['burst_interval_frames'] || 0,
      reload_frames: +r['reload_frames'] || 0,
    });
  }

  const projectiles = new Map<string, ProjectileConfig>();
  for (const r of projectileRows) {
    projectiles.set(r['projectile_id'], {
      projectile_id: r['projectile_id'],
      shape: r['shape'] ?? 'sphere',
      color_hex: r['color_hex'] ?? '#FFFFFF',
      size_mult: +r['size_mult'] || 1,
      speed_mult: +r['speed_mult'] || 1,
      life_seconds: +r['life_seconds'] || 2,
      pierce: r['pierce'] === '1',
      bounce_enemy: r['bounce_enemy'] === '1',
      bounce_screen: r['bounce_screen'] === '1',
      bounce_count: +r['bounce_count'] || 0,
      homing_turn_rate: +r['homing_turn_rate'] || 0,
      gravity: +r['gravity'] || 0,
    });
  }

  const skillLevels = new Map<string, SkillLevelConfig[]>();
  for (const r of skillLevelRows) {
    const id = r['skill_id'];
    if (!skillLevels.has(id)) skillLevels.set(id, []);
    skillLevels.get(id)!.push({
      skill_id: id,
      level: +r['level'],
      dmg_mult_scale: +r['dmg_mult_scale'],
      cooldown_reduce_rate: +r['cooldown_reduce_rate'],
      passive_bonus_value: +r['passive_bonus_value'],
    });
  }

  const evolutions: SkillEvolutionConfig[] = evoRows.map(r => ({
    evolution_id: r['evolution_id'],
    active_skill_id: r['active_skill_id'],
    passive_skill_id: r['passive_skill_id'],
    result_skill_id: r['result_skill_id'],
    result_skill_name: r['result_skill_name'],
    result_description: r['result_description'],
  }));

  const drops: DropConfig[] = dropRows.map(r => ({
    drop_id: r['drop_id'],
    drop_type: r['drop_type'] as DropType,
    drop_weight: +r['drop_weight'],
    effect_value: +r['effect_value'],
    pickup_radius: +r['pickup_radius'],
    geometry_type: r['geometry_type'],
    color_hex: r['color_hex'],
    size_small: +r['size_small'],
    size_medium: +r['size_medium'],
    size_large: +r['size_large'],
    sprite_url: r['sprite_url'] ?? '',
  }));

  const levels: LevelConfig[] = levelRows.map(r => ({
    level: +r['level'],
    exp_required: +r['exp_required'],
    exp_scale_rate: +r['exp_scale_rate'],
  }));

  const vfx = new Map<string, VfxConfig>();
  for (const r of vfxRows) {
    vfx.set(r['vfx_id'], {
      vfx_id: r['vfx_id'],
      particle_count: +r['particle_count'],
      particle_size_min: +r['particle_size_min'],
      particle_size_max: +r['particle_size_max'],
      particle_life_frames: +r['particle_life_frames'],
      particle_speed: +r['particle_speed'],
      bloom_strength: +r['bloom_strength'],
      bloom_radius: +r['bloom_radius'],
      bloom_threshold: +r['bloom_threshold'],
      screen_shake_intensity: +r['screen_shake_intensity'],
      screen_shake_duration_frames: +r['screen_shake_duration_frames'],
      flash_duration_frames: +r['flash_duration_frames'],
      particle_color_hex: r['particle_color_hex'] ?? '',
      particle_sprite_url: r['particle_sprite_url'] ?? '',
    });
  }

  const talents: TalentConfig[] = talentRows.map(r => ({
    talent_id: r['talent_id'],
    talent_name: r['talent_name'],
    description: r['description'],
    max_level: +r['max_level'],
    effect_per_level: +r['effect_per_level'],
  }));

  const talentCosts = new Map<string, TalentCostConfig[]>();
  for (const r of talentCostRows) {
    const id = r['talent_id'];
    if (!talentCosts.has(id)) talentCosts.set(id, []);
    talentCosts.get(id)!.push({
      talent_id: id,
      level: +r['level'],
      gold_cost: +r['gold_cost'],
    });
  }

  const cr = controlRows[0];
  const control: ControlConfig = {
    joystick_ring_diameter: +cr['joystick_ring_diameter'],
    joystick_knob_diameter: +cr['joystick_knob_diameter'],
    joystick_max_dist: +cr['joystick_max_dist'],
    joystick_z_index: +cr['joystick_z_index'],
    joystick_ring_opacity: +cr['joystick_ring_opacity'],
    joystick_knob_opacity: +cr['joystick_knob_opacity'],
    keyboard_diagonal_normalize: cr['keyboard_diagonal_normalize'] === 'true',
  };

  const stages: StageConfig[] = stageRows.map(r => ({
    stage:                     +r['stage'],
    stage_name:                r['stage_name'] ?? `STAGE ${r['stage']}`,
    max_enemies_scale:         +r['max_enemies_scale'],
    spawn_interval_scale:      +r['spawn_interval_scale'],
    spawn_interval_min_frames: +r['spawn_interval_min_frames'],
    boss_hp_mult:              +r['boss_hp_mult'],
    xp_mult:                   +r['xp_mult'],
    initial_xp_small:          +r['initial_xp_small'],
    enemy_hp_mult:             +r['enemy_hp_mult'],
    enemy_speed_mult:          +r['enemy_speed_mult'],
    enemy_dmg_mult:            +r['enemy_dmg_mult'],
  }));

  const luckyTrain = new Map<string, LuckyTrainConfig>();
  for (const r of luckyTrainRows) {
    luckyTrain.set(r['skill_id'], { skill_id: r['skill_id'], gold_cost: +r['gold_cost'] });
  }

  const tickets: TicketConfig[] = ticketRows.map(r => ({
    ticket_id: r['ticket_id'],
    ticket_name: r['ticket_name'],
    ticket_tier: +r['ticket_tier'],
    multiplier: +r['multiplier'],
    gem_cost: +r['gem_cost'] || 0,
    daily_free_count: +r['daily_free_count'] || 0,
    icon: r['icon'] ?? '🎫',
    acquire_label: r['acquire_label'] ?? '',
  }));

  const elements = new Map<string, ElementConfig>();
  for (const r of elementRows) {
    elements.set(r['element'], {
      element: r['element'],
      element_name: r['element_name'],
      icon: r['icon'],
      color_hex: r['color_hex'],
      effect_type: r['effect_type'],
      duration_sec: +r['duration_sec'] || 0,
      magnitude: +r['magnitude'] || 0,
      tick_interval_sec: +r['tick_interval_sec'] || 0,
      max_stacks: +r['max_stacks'] || 0,
    });
  }

  const equipment: EquipmentConfig[] = equipmentRows.map(r => ({
    slot_id: r['slot_id'],
    slot_name: r['slot_name'],
    item_name: r['item_name'],
    icon: r['icon'],
    grade: r['grade'],
    stat_type: r['stat_type'],
    effect_per_level: +r['effect_per_level'] || 0,
    max_level: +r['max_level'] || 1,
    base_gold_cost: +r['base_gold_cost'] || 0,
    gold_cost_scale: +r['gold_cost_scale'] || 1,
    description: r['description'] ?? '',
    skill_id: r['skill_id'] ?? '',
  }));

  const adventure: AdventureConfig[] = adventureRows.map(r => ({
    level: +r['level'],
    exp_required: +r['exp_required'] || 0,
    reward_gem: +r['reward_gem'] || 0,
    reward_gold: +r['reward_gold'] || 0,
  }));

  const challenges: ChallengeConfig[] = challengeRows.map(r => ({
    challenge_id: +r['challenge_id'],
    stage: +r['stage'],
    difficulty: +r['difficulty'] || 1,
    difficulty_name: r['difficulty_name'] ?? '노말',
    enemy_hp_mult: +r['enemy_hp_mult'] || 1,
    enemy_dmg_mult: +r['enemy_dmg_mult'] || 1,
    reward_dna: +r['reward_dna'] || +r['reward_gem'] || 0,
    reward_gold: +r['reward_gold'] || 0,
    prereq_id: +r['prereq_id'] || 0,
  }));

  const shopGemPacks: ShopGemPackConfig[] = shopGemRows
    .filter(r => r['enabled'] !== '0')
    .map(r => ({
      pack_id: r['pack_id'],
      sort_order: +r['sort_order'] || 0,
      label: r['label'],
      gems: +r['gems'] || 0,
      bonus_gems: +r['bonus_gems'] || 0,
      price_krw: +r['price_krw'] || 0,
      enabled: r['enabled'] !== '0',
    }))
    .sort((a, b) => a.sort_order - b.sort_order);

  const shopGoldPacks: ShopGoldPackConfig[] = shopGoldRows
    .filter(r => r['enabled'] !== '0')
    .map(r => ({
      pack_id: r['pack_id'],
      sort_order: +r['sort_order'] || 0,
      label: r['label'],
      sublabel: r['sublabel'] ?? '',
      gold: +r['gold'] || 0,
      gem_cost: +r['gem_cost'] || 0,
      is_free: r['is_free'] === '1',
      enabled: r['enabled'] !== '0',
    }))
    .sort((a, b) => a.sort_order - b.sort_order);

  const shopBoxes: ShopBoxConfig[] = shopBoxRows
    .filter(r => r['enabled'] !== '0')
    .map(r => ({
      box_id: r['box_id'],
      sort_order: +r['sort_order'] || 0,
      label: r['label'],
      subtitle: r['subtitle'] ?? '',
      gem_cost: +r['gem_cost'] || 0,
      key_cost: +r['key_cost'] || 0,
      pity_max: +r['pity_max'] || 0,
      pity_force_grade: r['pity_force_grade'] ?? '',
      key_bonus_chance: +r['key_bonus_chance'] || 0,
      banner_title: r['banner_title'] ?? '',
      banner_desc: r['banner_desc'] ?? '',
      enabled: r['enabled'] !== '0',
    }))
    .sort((a, b) => a.sort_order - b.sort_order);

  const shopBoxGrades = new Map<string, ShopBoxGradeConfig[]>();
  for (const r of shopBoxGradeRows) {
    const boxId = r['box_id'];
    if (!shopBoxGrades.has(boxId)) shopBoxGrades.set(boxId, []);
    shopBoxGrades.get(boxId)!.push({
      box_id: boxId,
      equipment_grade: r['equipment_grade'],
      weight: +r['weight'] || 0,
      grant_fallback_gold: +r['grant_fallback_gold'] || 0,
    });
  }

  const evolutionTree: EvolutionNodeConfig[] = evolutionTreeRows.map(r => ({
    evo_id: +r['evo_id'],
    order: +r['order'] || 0,
    branch: +r['branch'] || 0,
    node_name: r['node_name'],
    node_title: r['node_title'] || r['node_name'] || '',
    node_description: r['node_description'] || '',
    icon: r['icon'],
    ability_type: r['ability_type'],
    effect_value: +r['effect_value'] || 0,
    cost_type: r['cost_type'] ?? 'gold',
    cost_amount: +r['cost_amount'] || 0,
    prereq_id: +r['prereq_id'] || 0,
  }));

  return {
    player, players, enemies, bosses, finalBoss, waves, map, skills, projectiles, weaponVisuals, combatTuning, playerVisual, rendererConfig, skillRuntime, skillRuntimeLists, guardianRuntime, bossPatterns, levelUpRules, skillLevels, evolutions, drops, levels, stages,
    luckyTrain, tickets, elements, equipment, weapons, adventure, challenges, evolutionTree,
    meta, shopTest, shopGemPacks, shopGoldPacks, shopBoxes, shopBoxGrades,
    rushWaves, rushCycleTemplate, formationSpawns, ticketMultSteps: ticketMultStepsFinal, lavaQuestHost,
    eventMinigames, eventMinigameOrder,
    vfx, talents, talentCosts, control,
  };
}
