/**
 * 드라이버의 기쁨 — CSV SSoT (public/event/driversJoy/)
 */
import { loadCSV } from '../sales/csvLoader';
import type { SalesRewardLine, SalesRewardType } from '../sales/types';

export const DRIVERS_JOY_CSV_PATHS = {
  EVENT: '/event/driversJoy/dj_event_config.csv',
  REWARD: '/event/driversJoy/dj_reward_config.csv',
} as const;

export type DriversJoyData = {
  event_id: string;
  title: string;
  duration_hours: number;
  max_purchase_per_player: number;
  price_krw: number;
  side_tab_label: string;
  banner_image: string;
  rewards: SalesRewardLine[];
};

const REWARD_TYPES: SalesRewardType[] = [
  'energy', 'meta_gold', 'gems', 'supply_key', 'dna', 'open_box', 'equip_lv',
];

function parseRewardType(raw: string): SalesRewardType | null {
  const t = raw.trim() as SalesRewardType;
  return REWARD_TYPES.includes(t) ? t : null;
}

function parseDriversFromRows(
  eventRows: Record<string, string>[],
  rewardRows: Record<string, string>[],
): DriversJoyData {
  const ev = eventRows.find(r => r['enabled'] !== '0') ?? eventRows[0];
  if (!ev) throw new Error('[driversJoy] dj_event_config empty');

  const eventId = ev['event_id'] || 'drivers_joy_01';
  const rewardPairs: { sort: number; line: SalesRewardLine }[] = [];
  for (const r of rewardRows) {
    if (r['event_id'] && r['event_id'] !== eventId) continue;
    const rewardType = parseRewardType(r['reward_type'] || '');
    if (!rewardType) continue;
    rewardPairs.push({
      sort: +r['sort_order'] || rewardPairs.length + 1,
      line: {
        reward_type: rewardType,
        reward_qty: +r['reward_qty'] || 1,
        reward_param: r['reward_param'] || undefined,
        label: r['label'] || undefined,
      },
    });
  }
  rewardPairs.sort((a, b) => a.sort - b.sort);
  const rewards = rewardPairs.map(p => p.line);
  if (!rewards.length) throw new Error('[driversJoy] dj_reward_config empty');

  const durationMinutes = +ev['duration_minutes'];
  const duration_hours = Number.isFinite(durationMinutes) && durationMinutes > 0
    ? durationMinutes / 60
    : (+ev['duration_hours'] || 10);

  return {
    event_id: eventId,
    title: ev['title'] || '드라이버의 기쁨',
    duration_hours,
    max_purchase_per_player: Math.max(1, +ev['max_purchase_per_player'] || 2),
    price_krw: +ev['price_krw'] || 0,
    side_tab_label: ev['side_tab_label'] || '드라이버',
    banner_image: ev['banner_image'] || '',
    rewards,
  };
}

export async function loadDriversJoyData(): Promise<DriversJoyData> {
  const [eventRows, rewardRows] = await Promise.all([
    loadCSV(DRIVERS_JOY_CSV_PATHS.EVENT),
    loadCSV(DRIVERS_JOY_CSV_PATHS.REWARD),
  ]);
  return parseDriversFromRows(eventRows, rewardRows);
}
