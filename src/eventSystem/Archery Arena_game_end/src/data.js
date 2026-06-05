/** RFC 4180-aware CSV rows → array of objects (header row required). */
export function parseCSV(text) {
  const rows = [];
  let field = '';
  let row = [];
  let inQuotes = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (inQuotes) {
      if (c === '"') {
        if (text[i + 1] === '"') {
          field += '"';
          i++;
          continue;
        }
        inQuotes = false;
        continue;
      }
      field += c;
      continue;
    }
    if (c === '"') {
      inQuotes = true;
      continue;
    }
    if (c === ',') {
      row.push(field);
      field = '';
      continue;
    }
    if (c === '\r') continue;
    if (c === '\n') {
      row.push(field);
      rows.push(row);
      row = [];
      field = '';
      continue;
    }
    field += c;
  }
  row.push(field);
  if (row.length > 1 || row[0] !== '') rows.push(row);

  if (rows.length < 2) return [];
  const headers = rows[0].map((h) => h.trim());
  const body = rows.slice(1).filter((r) => r.some((cell) => String(cell).trim() !== ''));
  return body.map((r) => {
    const o = {};
    headers.forEach((h, j) => {
      o[h] = r[j] !== undefined ? String(r[j]).trim() : '';
    });
    return o;
  });
}

const STORAGE_PLAYER = 'aa_player_state';
const STORAGE_BOTS = 'aa_ranking_bots';
const STORAGE_META = 'aa_event_meta';

export function loadPlayerState() {
  try {
    const raw = localStorage.getItem(STORAGE_PLAYER);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function savePlayerState(state) {
  localStorage.setItem(
    STORAGE_PLAYER,
    JSON.stringify({
      bow_stands: state.bow_stands ?? state.dice_count,
      dice_count: state.bow_stands ?? state.dice_count,
      target_score: state.target_score,
      rank_current: state.rank_current,
      combo_count: state.combo_count,
      total_attempts: state.total_attempts,
      daily_free_used: state.daily_free_used,
    })
  );
}

export function loadBots() {
  try {
    const raw = localStorage.getItem(STORAGE_BOTS);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function saveBots(bots) {
  localStorage.setItem(STORAGE_BOTS, JSON.stringify(bots));
}

export function loadEventMeta() {
  try {
    const raw = localStorage.getItem(STORAGE_META);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function saveEventMeta(meta) {
  localStorage.setItem(STORAGE_META, JSON.stringify(meta));
}

/** index.html 과 같은 폴더 기준 — zip/서브경로 배포에서도 CSV 로드 */
export function resolveCsvUrl(filename) {
  const base = (typeof import.meta !== 'undefined' && import.meta.env?.BASE_URL)
    ? import.meta.env.BASE_URL
    : './';
  try {
    return new URL(filename, new URL(base, window.location.href)).href;
  } catch {
    return new URL(filename, window.location.href).href;
  }
}

export async function fetchCSV(filename) {
  const url = resolveCsvUrl(filename);
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed ${url}: ${res.status}`);
  return parseCSV(await res.text());
}

/** aa_integration_config.csv → key-value */
export function parseIntegrationConfig(rows) {
  const cfg = {};
  for (const r of rows) {
    if (r.config_key) cfg[r.config_key] = r.config_value;
  }
  return cfg;
}

/** aa_bundle_reward_config.csv → bundle_id별 grant 배열 */
export function parseBundleRewards(rows) {
  const map = {};
  for (const r of rows) {
    const id = String(r.bundle_id ?? '').trim();
    if (!id) continue;
    if (!map[id]) map[id] = [];
    map[id].push({
      kind: String(r.reward_kind ?? 'gold').toLowerCase(),
      amount: Number(r.reward_amount ?? 0) || undefined,
      slotId: (r.reward_slot_id || '').trim() || undefined,
    });
  }
  return map;
}

export async function loadAllData() {
  const [attempts, events, rewards, visual, integrationRows, bundleRows] = await Promise.all([
    fetchCSV('aa_attempt_config.csv'),
    fetchCSV('aa_event_config.csv'),
    fetchCSV('aa_rank_reward_config.csv'),
    fetchCSV('aa_visual_config.csv'),
    fetchCSV('aa_integration_config.csv'),
    fetchCSV('aa_bundle_reward_config.csv'),
  ]);
  const integration = parseIntegrationConfig(integrationRows);
  return {
    attempts,
    events,
    rewards,
    visual,
    integration,
    bundleRewards: parseBundleRewards(bundleRows),
    byEventId: {
      event: events[0],
      attemptByType: Object.fromEntries(attempts.map((a) => [a.attempt_type, a])),
      visual: visual[0],
    },
  };
}
