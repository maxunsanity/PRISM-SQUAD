import { z } from 'zod';

/** CSV 경로 SSoT — data.ts CSV_PATHS와 반드시 동기화 */
export const DataMaterial_PlayerConfig    = z.literal('/player_config.csv');
export const DataMaterial_EnemyConfig     = z.literal('/enemy_config.csv');
export const DataMaterial_BossConfig      = z.literal('/boss_config.csv');
export const DataMaterial_WaveConfig      = z.literal('/wave_config.csv');
export const DataMaterial_MapConfig       = z.literal('/map_config.csv');
export const DataMaterial_SkillConfig     = z.literal('/skill_config.csv');
export const DataMaterial_SkillLevel      = z.literal('/skill_level_config.csv');
export const DataMaterial_SkillEvolution  = z.literal('/skill_evolution_config.csv');
export const DataMaterial_DropConfig      = z.literal('/drop_config.csv');
export const DataMaterial_LevelConfig     = z.literal('/level_config.csv');
export const DataMaterial_VfxConfig       = z.literal('/vfx_config.csv');
export const DataMaterial_TalentConfig    = z.literal('/talent_config.csv');
export const DataMaterial_TalentCost      = z.literal('/talent_cost_config.csv');
export const DataMaterial_ControlConfig   = z.literal('/control_config.csv');

/** 스텁 — 아직 화면에 안 나옴. registry 구현 후 operationalUi로 승격 */
export const PrismStub_TalentScreen = z.object({
  type: z.literal('PrismStub_TalentScreen'),
  visible: z.boolean(),
  props: z.object({}),
});
