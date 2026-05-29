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
  SKILL_LEVEL:     '/skill_level_config.csv',
  SKILL_EVOLUTION: '/skill_evolution_config.csv',
  DROP:            '/drop_config.csv',
  LEVEL:           '/level_config.csv',
  VFX:             '/vfx_config.csv',
  TALENT:          '/talent_config.csv',
  TALENT_COST:     '/talent_cost_config.csv',
  CONTROL:         '/control_config.csv',
  STAGE:           '/stage_config.csv',
} as const;

/* ── 경량 CSV 파서 ── */
function parseCSV(raw: string): Record<string, string>[] {
  const lines = raw.trim().split('\n').map(l => l.trim()).filter(Boolean);
  if (lines.length < 2) return [];
  const headers = lines[0].split(',').map(h => h.trim());
  return lines.slice(1).map(line => {
    const vals = line.split(',').map(v => v.trim());
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
export type SkillType = 'ACTIVE' | 'PASSIVE';
export type DropType = 'xp' | 'heal' | 'magnet' | 'bomb';
export type EnemyId = 'basic' | 'dog' | 'bloater' | 'spitter';

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
}

export interface EnemyConfig {
  enemy_id: EnemyId;
  enemy_name: string;
  hp: number;
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
}

export interface BossConfig {
  boss_id: string;
  boss_name: string;
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
  geometry_type: string;
  color_hex: string;
  glow_color_hex: string;
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
}

export interface LevelConfig {
  level: number;
  exp_required: number;
  exp_scale_rate: number;
}

export interface StageConfig {
  /** 스테이지 번호 (1~10) */
  stage: number;
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

/* ── 전체 게임 데이터 컨테이너 ── */
export interface GameData {
  player: PlayerConfig;
  enemies: Map<EnemyId, EnemyConfig>;
  boss: BossConfig;
  waves: WaveConfig[];
  map: MapConfig;
  skills: Map<string, SkillConfig>;
  skillLevels: Map<string, SkillLevelConfig[]>;
  evolutions: SkillEvolutionConfig[];
  drops: DropConfig[];
  levels: LevelConfig[];
  stages: StageConfig[];
  vfx: Map<string, VfxConfig>;
  talents: TalentConfig[];
  talentCosts: Map<string, TalentCostConfig[]>;
  control: ControlConfig;
}

/* ── 로드 함수 ── */
export async function loadAllGameData(): Promise<GameData> {
  const [
    playerRows, enemyRows, bossRows, waveRows, mapRows,
    skillRows, skillLevelRows, evoRows, dropRows, levelRows,
    vfxRows, talentRows, talentCostRows, controlRows, stageRows,
  ] = await Promise.all([
    loadCSV(CSV_PATHS.PLAYER),
    loadCSV(CSV_PATHS.ENEMY),
    loadCSV(CSV_PATHS.BOSS),
    loadCSV(CSV_PATHS.WAVE),
    loadCSV(CSV_PATHS.MAP),
    loadCSV(CSV_PATHS.SKILL),
    loadCSV(CSV_PATHS.SKILL_LEVEL),
    loadCSV(CSV_PATHS.SKILL_EVOLUTION),
    loadCSV(CSV_PATHS.DROP),
    loadCSV(CSV_PATHS.LEVEL),
    loadCSV(CSV_PATHS.VFX),
    loadCSV(CSV_PATHS.TALENT),
    loadCSV(CSV_PATHS.TALENT_COST),
    loadCSV(CSV_PATHS.CONTROL),
    loadCSV(CSV_PATHS.STAGE),
  ]);

  const p = playerRows[0];
  const player: PlayerConfig = {
    player_id: p['player_id'],
    max_hp: +p['max_hp'],
    base_speed: +p['base_speed'],
    radius: +p['radius'],
    invincible_frames: +p['invincible_frames'],
    geometry_size: +p['geometry_size'],
    color_hex: p['color_hex'],
    glow_intensity: +p['glow_intensity'],
    hp_bar_low_threshold: +p['hp_bar_low_threshold'],
  };

  const enemies = new Map<EnemyId, EnemyConfig>();
  for (const r of enemyRows) {
    enemies.set(r['enemy_id'] as EnemyId, {
      enemy_id: r['enemy_id'] as EnemyId,
      enemy_name: r['enemy_name'],
      hp: +r['hp'],
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
    });
  }

  const br = bossRows[0];
  const boss: BossConfig = {
    boss_id: br['boss_id'],
    boss_name: br['boss_name'],
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
    geometry_type: br['geometry_type'],
    color_hex: br['color_hex'],
    glow_color_hex: br['glow_color_hex'],
  };

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

  return { player, enemies, boss, waves, map, skills, skillLevels, evolutions, drops, levels, stages, vfx, talents, talentCosts, control };
}
