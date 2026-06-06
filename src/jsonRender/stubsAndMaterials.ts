import { z } from 'zod';

/** CSV 경로 SSoT — data.ts CSV_PATHS와 반드시 동기화 */
export const DataMaterial_PlayerConfig    = z.literal('/tables/player_config.csv');
export const DataMaterial_EnemyConfig     = z.literal('/tables/enemy_config.csv');
export const DataMaterial_BossConfig      = z.literal('/tables/boss_config.csv');
export const DataMaterial_WaveConfig      = z.literal('/tables/wave_config.csv');
export const DataMaterial_MapConfig       = z.literal('/tables/map_config.csv');
export const DataMaterial_SkillConfig     = z.literal('/tables/skill_config.csv');
export const DataMaterial_SkillLevel      = z.literal('/tables/skill_level_config.csv');
export const DataMaterial_SkillEvolution  = z.literal('/tables/skill_evolution_config.csv');
export const DataMaterial_DropConfig      = z.literal('/tables/drop_config.csv');
export const DataMaterial_LevelConfig     = z.literal('/tables/level_config.csv');
export const DataMaterial_VfxConfig       = z.literal('/tables/vfx_config.csv');
export const DataMaterial_TalentConfig    = z.literal('/tables/talent_config.csv');
export const DataMaterial_TalentCost      = z.literal('/tables/talent_cost_config.csv');
export const DataMaterial_ControlConfig   = z.literal('/tables/control_config.csv');

/** 스텁 — 아직 화면에 안 나옴. registry 구현 후 operationalUi로 승격 */
export const PrismStub_TalentScreen = z.object({
  type: z.literal('PrismStub_TalentScreen'),
  visible: z.boolean(),
  props: z.object({}),
});
