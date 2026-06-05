/**
 * 쇼핑몰의 경이로움 — CSV SSoT (public/event/mallMarvels/)
 */
import { loadCSV } from '../sales/csvLoader';
import type { SalesRewardLine, SalesRewardType } from '../sales/types';

export const MALL_CSV_PATHS = {
  EVENT: '/event/mallMarvels/mm_event_config.csv',
  STEP: '/event/mallMarvels/mm_step_config.csv',
  REWARD: '/event/mallMarvels/mm_step_reward.csv',
} as const;

export type MallCostType = 'FREE' | 'GEMS' | 'CASH_KRW';

export type MallStepConfig = {
  step_id: number;
  event_id: string;
  sort_order: number;
  prereq_step_id: number;
  cost_type: MallCostType;
  gem_cost: number;
  price_krw: number;
  card_color: string;
  button_label_override: string;
};

export type MallStepReward = SalesRewardLine & { step_id: number };

export type MallMarvelsData = {
  event_id: string;
  title: string;
  intro_tip: string;
  duration_hours: number;
  hero_image: string;
  steps: MallStepConfig[];
  rewardsByStep: Map<number, MallStepReward[]>;
};

const REWARD_TYPES: SalesRewardType[] = [
  'energy', 'meta_gold', 'gems', 'supply_key', 'dna', 'open_box', 'equip_lv',
];

function parseCostType(raw: string): MallCostType {
  const u = raw.toUpperCase();
  if (u === 'GEMS') return 'GEMS';
  if (u === 'CASH_KRW' || u === 'CASH') return 'CASH_KRW';
  return 'FREE';
}

function parseRewardType(raw: string): SalesRewardType | null {
  const t = raw.trim() as SalesRewardType;
  return REWARD_TYPES.includes(t) ? t : null;
}

function buildRewardsMap(rewards: MallStepReward[]): Map<number, MallStepReward[]> {
  const rewardsByStep = new Map<number, MallStepReward[]>();
  for (const r of rewards) {
    const list = rewardsByStep.get(r.step_id) ?? [];
    list.push(r);
    rewardsByStep.set(r.step_id, list);
  }
  return rewardsByStep;
}

function parseMallFromRows(
  eventRows: Record<string, string>[],
  stepRows: Record<string, string>[],
  rewardRows: Record<string, string>[],
): MallMarvelsData {
  const ev = eventRows.find(r => r['enabled'] !== '0') ?? eventRows[0];
  if (!ev) throw new Error('[mallMarvels] mm_event_config empty');

  const eventId = ev['event_id'] || 'mall_marvels_01';
  const steps: MallStepConfig[] = stepRows
    .filter(r => !r['event_id'] || r['event_id'] === eventId)
    .map(r => ({
      step_id: +r['step_id'],
      event_id: r['event_id'] || eventId,
      sort_order: +r['sort_order'] || +r['step_id'],
      prereq_step_id: +r['prereq_step_id'] || 0,
      cost_type: parseCostType(r['cost_type'] || 'FREE'),
      gem_cost: +r['gem_cost'] || 0,
      price_krw: +r['price_krw'] || 0,
      card_color: r['card_color'] || '#F4EFE6',
      button_label_override: r['button_label_override'] || '',
    }))
    .filter(s => s.step_id > 0)
    .sort((a, b) => a.sort_order - b.sort_order);

  if (!steps.length) throw new Error('[mallMarvels] mm_step_config empty');

  const rewards: MallStepReward[] = [];
  for (const r of rewardRows) {
    const stepId = +r['step_id'];
    const rewardType = parseRewardType(r['reward_type'] || '');
    if (!stepId || !rewardType) continue;
    if (!steps.some(s => s.step_id === stepId)) continue;
    rewards.push({
      step_id: stepId,
      reward_type: rewardType,
      reward_qty: +r['reward_qty'] || 1,
      reward_param: r['reward_param'] || undefined,
      label: r['label'] || undefined,
    });
  }

  const durationMinutes = +ev['duration_minutes'];
  const duration_hours = Number.isFinite(durationMinutes) && durationMinutes > 0
    ? durationMinutes / 60
    : (+ev['duration_hours'] || 34);

  return {
    event_id: eventId,
    title: ev['title'] || '쇼핑몰의 경이로움',
    intro_tip: ev['intro_tip'] || '',
    duration_hours,
    hero_image: ev['hero_image'] || '',
    steps,
    rewardsByStep: buildRewardsMap(rewards),
  };
}

export async function loadMallMarvelsData(): Promise<MallMarvelsData> {
  const [eventRows, stepRows, rewardRows] = await Promise.all([
    loadCSV(MALL_CSV_PATHS.EVENT),
    loadCSV(MALL_CSV_PATHS.STEP),
    loadCSV(MALL_CSV_PATHS.REWARD),
  ]);
  return parseMallFromRows(eventRows, stepRows, rewardRows);
}
