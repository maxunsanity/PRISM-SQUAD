/**
 * eventSystem/data.ts — 이벤트 CSV SSoT (게임 data.ts와 분리)
 */
import { resolvePublicPath } from '../../publicPath';

export const EVENT_CSV_PATHS = {
  BOARD: '/event/tycoonSeason/event_board_config.csv',
  MILESTONE: '/event/tycoonSeason/event_milestone_config.csv',
  KILL_REWARD: '/event/tycoonSeason/event_kill_reward_config.csv',
  TOURNAMENT: '/event/tycoonSeason/tournament_config.csv',
  BOT_NAMES: '/event/tycoonSeason/tournament_bot_name_pool.csv',
  RANK_REWARD: '/event/tycoonSeason/tournament_rank_reward_config.csv',
  SEASON_CLASS: '/event/tycoonSeason/season_class_config.csv',
  ASSET: '/event/tycoonSeason/event_asset_config.csv',
  UI_THEME: '/event/tycoonSeason/event_ui_theme_config.csv',
  HELP: '/event/tycoonSeason/event_help_config.csv',
  HELP_ACQUIRE: '/event/tycoonSeason/event_help_acquire_config.csv',
  EXPRESS: '/event/tycoonSeason/event_express_config.csv',
  BOT_SIMULATOR: '/event/tycoonSeason/bot_simulator_config.csv',
} as const;

export type EventKind = 'TYCOON_MILEAGE' | 'SEASON_TOURNAMENT' | 'SEASON_EXPRESS';

export interface EventBoardConfig {
  event_id: number;
  event_name: string;
  event_kind: EventKind;
  group_size: number;
  currency_asset_key: string;
  milestone_group_id: string;
  theme_key: string;
  duration_hours: number;
  /** UI·주기 타이머 간격(분). 타이쿤 10 / 시즌 30 등 */
  tick_min: number;
  enabled: boolean;
}

export interface EventMilestoneConfig {
  milestone_group_id: string;
  step: number;
  required_point: number;
  reward_bundle_id: string;
  reward_asset_key: string;
  reward_qty_label: string;
}

export interface EventKillRewardConfig {
  enemy_id: string;
  tycoon_point_base: number;
  season_point_base: number;
  is_boss: boolean;
}

export interface TournamentRankRewardConfig {
  event_id: number;
  rank_from: number;
  rank_to: number;
  bundle_id: string;
  season_coins: number;
  dice_label: string;
  cash_label: string;
  pack_asset_key: string;
  token_label: string;
}

export interface EventHelpConfig {
  help_id: string;
  event_kind: EventKind;
  title: string;
  subtitle: string;
  acquire_section_title: string;
  mission_section_title: string;
  body_1: string;
  body_2: string;
  body_3: string;
  body_4: string;
  point_icon_asset: string;
}

export interface EventHelpAcquireRow {
  event_kind: EventKind;
  target_type: string;
  row_title: string;
  kills_required: number;
  reward_label: string;
  left_icon_key: string;
  reward_icon_key: string;
  sort_order: number;
}

export interface SeasonClassConfig {
  class_level: number;
  class_name: string;
  required_coins: number;
  tournament_reward_rate: number;
  instant_bundle_id: string;
}

export interface SeasonExpressConfig {
  event_id: number;
  name: string;
  duration_hours: number;
  reward_asset_key: string;
  icon_key: string;
}

export interface EventAssetConfig {
  asset_key: string;
  asset_type: 'icon' | 'color';
  url: string;
  fallback_text: string;
  width: number;
  height: number;
}

export interface EventData {
  boards: EventBoardConfig[];
  milestones: Map<string, EventMilestoneConfig[]>;
  killRewards: Map<string, EventKillRewardConfig>;
  tournament: Map<string, number | string>;
  botNames: string[];
  rankRewards: Map<number, TournamentRankRewardConfig[]>;
  seasonClasses: SeasonClassConfig[];
  assets: Map<string, EventAssetConfig>;
  uiThemes: Map<string, Map<string, string>>;
  helpByKind: Map<EventKind, EventHelpConfig>;
  helpAcquireByKind: Map<EventKind, EventHelpAcquireRow[]>;
  tycoonEvent: EventBoardConfig | null;
  seasonEvent: EventBoardConfig | null;
  expressEvent: EventBoardConfig | null;
  expressConfigs: SeasonExpressConfig[];
  /** 봇 시뮬레이터 상수 (bot_simulator_config.csv) */
  botSimulator: Map<string, number>;
}

function splitCsvLine(line: string): string[] {
  const out: string[] = [];
  let cur = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (inQuotes) {
      if (ch === '"') {
        if (line[i + 1] === '"') { cur += '"'; i++; }
        else inQuotes = false;
      } else cur += ch;
    } else if (ch === '"') inQuotes = true;
    else if (ch === ',') { out.push(cur); cur = ''; }
    else cur += ch;
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
  const res = await fetch(resolvePublicPath(path));
  if (!res.ok) throw new Error(`[event] CSV load failed: ${path}`);
  return parseCSV(await res.text());
}

function parseTournament(rows: Record<string, string>[]): Map<string, number | string> {
  const m = new Map<string, number | string>();
  for (const r of rows) {
    const k = r['key'];
    if (!k) continue;
    const v = r['value'];
    m.set(k, v !== '' && !Number.isNaN(+v) && /^-?\d/.test(v) ? +v : v);
  }
  return m;
}

function parseUiThemes(rows: Record<string, string>[]): Map<string, Map<string, string>> {
  const themes = new Map<string, Map<string, string>>();
  for (const r of rows) {
    const theme = r['theme_key'] || 'default';
    if (!themes.has(theme)) themes.set(theme, new Map());
    themes.get(theme)!.set(r['prop_key'], r['value']);
  }
  return themes;
}

export async function loadAllEventData(): Promise<EventData> {
  const [
    boardRows, milestoneRows, killRows, tournamentRows, botRows,
    rankRows, classRows, assetRows, themeRows, helpRows, helpAcquireRows, expressRows,
    botSimRows,
  ] = await Promise.all([
    loadCSV(EVENT_CSV_PATHS.BOARD),
    loadCSV(EVENT_CSV_PATHS.MILESTONE),
    loadCSV(EVENT_CSV_PATHS.KILL_REWARD),
    loadCSV(EVENT_CSV_PATHS.TOURNAMENT),
    loadCSV(EVENT_CSV_PATHS.BOT_NAMES),
    loadCSV(EVENT_CSV_PATHS.RANK_REWARD),
    loadCSV(EVENT_CSV_PATHS.SEASON_CLASS),
    loadCSV(EVENT_CSV_PATHS.ASSET),
    loadCSV(EVENT_CSV_PATHS.UI_THEME),
    loadCSV(EVENT_CSV_PATHS.HELP),
    loadCSV(EVENT_CSV_PATHS.HELP_ACQUIRE),
    loadCSV(EVENT_CSV_PATHS.EXPRESS),
    loadCSV(EVENT_CSV_PATHS.BOT_SIMULATOR),
  ]);

  const botSimulator = new Map<string, number>();
  for (const r of botSimRows) {
    const k = r['key'];
    if (!k) continue;
    botSimulator.set(k, +r['value'] || 0);
  }

  const expressConfigs: SeasonExpressConfig[] = expressRows.map(r => ({
    event_id: +r['event_id'],
    name: r['event_name'],
    duration_hours: +r['duration_hours'] || 12,
    reward_asset_key: r['reward_asset_key'] || 'reward_dice',
    icon_key: r['icon_key'] || 'express_icon',
  }));

  const boards: EventBoardConfig[] = boardRows
    .filter(r => r['enabled'] !== '0')
    .map(r => ({
      event_id: +r['event_id'],
      event_name: r['event_name'],
      event_kind: r['event_kind'] as EventKind,
      group_size: +r['group_size'] || 0,
      currency_asset_key: r['currency_asset_key'] || 'tycoon_coin',
      milestone_group_id: r['milestone_group_id'] || '',
      theme_key: r['theme_key'] || 'tycoon_default',
      duration_hours: +r['duration_hours'] || 72,
      tick_min: +r['tick_min'] || 30,
      enabled: r['enabled'] !== '0',
    }));

  const milestones = new Map<string, EventMilestoneConfig[]>();
  for (const r of milestoneRows) {
    const gid = r['milestone_group_id'];
    const row: EventMilestoneConfig = {
      milestone_group_id: gid,
      step: +r['step'],
      required_point: +r['required_point'],
      reward_bundle_id: r['reward_bundle_id'],
      reward_asset_key: r['reward_asset_key'] || 'reward_dice',
      reward_qty_label: r['reward_qty_label'] || '',
    };
    if (!milestones.has(gid)) milestones.set(gid, []);
    milestones.get(gid)!.push(row);
  }
  for (const list of milestones.values()) {
    list.sort((a, b) => a.step - b.step);
  }

  const killRewards = new Map<string, EventKillRewardConfig>();
  for (const r of killRows) {
    killRewards.set(r['enemy_id'], {
      enemy_id: r['enemy_id'],
      tycoon_point_base: +r['tycoon_point_base'] || +r['point_base'] || 1,
      season_point_base: +r['season_point_base'] || +r['point_base'] || 1,
      is_boss: r['is_boss'] === 'true',
    });
  }

  const rankRewards = new Map<number, TournamentRankRewardConfig[]>();
  for (const r of rankRows) {
    const eid = +r['event_id'];
    const row: TournamentRankRewardConfig = {
      event_id: eid,
      rank_from: +r['rank_from'],
      rank_to: +r['rank_to'],
      bundle_id: r['bundle_id'],
      season_coins: +r['season_coins'] || 0,
      dice_label: r['dice_label'] ?? '',
      cash_label: r['cash_label'] ?? '',
      pack_asset_key: r['pack_asset_key'] || 'reward_dice',
      token_label: r['token_label'] ?? '',
    };
    if (!rankRewards.has(eid)) rankRewards.set(eid, []);
    rankRewards.get(eid)!.push(row);
  }

  const assets = new Map<string, EventAssetConfig>();
  for (const r of assetRows) {
    assets.set(r['asset_key'], {
      asset_key: r['asset_key'],
      asset_type: (r['asset_type'] === 'color' ? 'color' : 'icon') as 'icon' | 'color',
      url: r['url'] ?? '',
      fallback_text: r['fallback_text'] ?? '',
      width: +r['width'] || 32,
      height: +r['height'] || 32,
    });
  }

  const helpByKind = new Map<EventKind, EventHelpConfig>();
  for (const r of helpRows) {
    const kind = r['event_kind'] as EventKind;
    helpByKind.set(kind, {
      help_id: r['help_id'],
      event_kind: kind,
      title: r['title'] ?? '',
      subtitle: r['subtitle'] ?? '',
      acquire_section_title: r['acquire_section_title'] ?? '재화 획득 방법',
      mission_section_title: r['mission_section_title'] ?? '미션',
      body_1: r['body_1'] ?? '',
      body_2: r['body_2'] ?? '',
      body_3: r['body_3'] ?? '',
      body_4: r['body_4'] ?? '',
      point_icon_asset: r['point_icon_asset'] || 'tycoon_coin',
    });
  }

  const helpAcquireByKind = new Map<EventKind, EventHelpAcquireRow[]>();
  for (const r of helpAcquireRows) {
    const kind = r['event_kind'] as EventKind;
    const row: EventHelpAcquireRow = {
      event_kind: kind,
      target_type: r['target_type'] ?? 'normal',
      row_title: r['row_title'] ?? '',
      kills_required: +r['kills_required'] || 1,
      reward_label: r['reward_label'] ?? '1장',
      left_icon_key: r['left_icon_key'] || 'enemy_normal',
      reward_icon_key: r['reward_icon_key'] || 'tycoon_coin',
      sort_order: +r['sort_order'] || 0,
    };
    if (!helpAcquireByKind.has(kind)) helpAcquireByKind.set(kind, []);
    helpAcquireByKind.get(kind)!.push(row);
  }
  for (const list of helpAcquireByKind.values()) {
    list.sort((a, b) => a.sort_order - b.sort_order);
  }

  return {
    boards,
    milestones,
    killRewards,
    tournament: parseTournament(tournamentRows),
    botNames: botRows.map(r => r['name']).filter(Boolean),
    rankRewards,
    seasonClasses: classRows.map(r => ({
      class_level: +r['class_level'],
      class_name: r['class_name'],
      required_coins: +r['required_coins'],
      tournament_reward_rate: +r['tournament_reward_rate'] || 1,
      instant_bundle_id: r['instant_bundle_id'] ?? '',
    })),
    assets,
    uiThemes: parseUiThemes(themeRows),
    helpByKind,
    helpAcquireByKind,
    tycoonEvent: boards.find(b => b.event_kind === 'TYCOON_MILEAGE') ?? null,
    seasonEvent: boards.find(b => b.event_kind === 'SEASON_TOURNAMENT') ?? null,
    expressEvent: boards.find(b => b.event_kind === 'SEASON_EXPRESS') ?? null,
    expressConfigs,
    botSimulator,
  };
}

export function getRankRewardForRank(
  data: EventData,
  eventId: number,
  rank: number,
): TournamentRankRewardConfig | null {
  const list = data.rankRewards.get(eventId) ?? [];
  return list.find(r => rank >= r.rank_from && rank <= r.rank_to) ?? null;
}

export function getEventAsset(data: EventData, key: string): EventAssetConfig | undefined {
  return data.assets.get(key);
}

export function getEventColor(data: EventData, key: string, fallback = '#ffffff'): string {
  const a = data.assets.get(key);
  return a?.asset_type === 'color' ? a.url : fallback;
}

export function getUiThemeProp(data: EventData, themeKey: string, prop: string, fallback = ''): string {
  return data.uiThemes.get(themeKey)?.get(prop) ?? fallback;
}

/** theme CSV의 *_color 값은 event_asset_config의 color asset_key */
export function getThemeColor(
  data: EventData,
  themeKey: string,
  prop: string,
  fallback = '#ffffff',
): string {
  const assetKey = getUiThemeProp(data, themeKey, prop, '');
  if (!assetKey) return fallback;
  return getEventColor(data, assetKey, fallback);
}
