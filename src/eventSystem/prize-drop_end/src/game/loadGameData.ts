import { z } from 'zod';
import { DATA_PATHS } from './runnerDataPaths';

// --- Zod Schemas ---

export const SlotLightningSchema = z.object({
  slot_index: z.number(),
  reward_lightning: z.number(),
  is_jackpot: z.boolean(),
  weight: z.number(),
  slot_color: z.string(),
  sprite_url: z.string().optional(),
});

export const MultiplierSchema = z.object({
  level: z.number(),
  value: z.number(),
  visual_style: z.string(),
  token_cost: z.number(),
});

export const MilestoneSchema = z.object({
  step: z.number(),
  threshold_lightning: z.number(),
  reward_type: z.string(),
  reward_amount: z.number(),
  reward_icon: z.string().optional().default('🎲'),
  reward_label: z.string().optional().default(''),
  reward_item_id: z.string().optional().default(''),
});

export const BoardObstacleSchema = z.object({
  obstacle_id: z.string(),
  type: z.enum(['pin', 'circle', 'triangle', 'diamond', 'rect']),
  cx: z.number(),
  cy: z.number(),
  radius: z.number(),
  reward_type: z.string().optional(),
  reward_amount: z.number().optional(),
  sprite_url: z.string().optional(),
});

export type LoadedGameData = {
  slots: z.infer<typeof SlotLightningSchema>[];
  multipliers: z.infer<typeof MultiplierSchema>[];
  milestones: z.infer<typeof MilestoneSchema>[];
  obstacles: z.infer<typeof BoardObstacleSchema>[];
};

// --- Helper: Simple CSV Parser ---
function parseCsv(text: string) {
  const lines = text.trim().split('\n');
  const headers = lines[0].split(',').map(h => h.trim());
  return lines.slice(1).map((line) => {
    const values = line.split(',');
    const obj: any = {};
    headers.forEach((header, i) => {
      let val: any = values[i] ? values[i].trim() : '';
      
      // Basic type conversion
      if (val === 'true') {
        val = true;
      } else if (val === 'false') {
        val = false;
      } else if (val === '') {
        val = undefined; // Make it undefined for optional Zod fields
      } else if (!isNaN(Number(val))) {
        val = Number(val);
      }
      
      obj[header] = val;
    });
    return obj;
  });
}

// --- Main Loader ---
export async function loadGameData(): Promise<LoadedGameData> {
  const fetchCsv = async (path: string) => {
    // Add cache buster to ensure fresh data
    const res = await fetch(`${path}?t=${Date.now()}`);
    if (!res.ok) throw new Error(`Failed to load ${path}`);
    return res.text();
  };

  const [slotsRaw, multipliersRaw, milestonesRaw, obstaclesRaw] = await Promise.all([
    fetchCsv(DATA_PATHS.SLOT_LIGHTNING),
    fetchCsv(DATA_PATHS.MULTIPLIER),
    fetchCsv(DATA_PATHS.MILESTONE),
    fetchCsv(DATA_PATHS.BOARD_OBSTACLE),
  ]);

  return {
    slots: parseCsv(slotsRaw).map((d) => SlotLightningSchema.parse(d)),
    multipliers: parseCsv(multipliersRaw).map((d) => MultiplierSchema.parse(d)),
    milestones: parseCsv(milestonesRaw).map((d) => MilestoneSchema.parse(d)),
    obstacles: parseCsv(obstaclesRaw).map((d) => BoardObstacleSchema.parse(d)),
  };
}
