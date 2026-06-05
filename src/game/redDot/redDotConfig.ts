import type { RedDotCategory, RedDotConfigRow } from './types';

const CSV_PATH = '/red_dot_config.csv';

function parseCsv(text: string): Record<string, string>[] {
  const lines = text.split(/\r?\n/).filter(l => l.trim());
  if (lines.length < 2) return [];
  const headers = lines[0].split(',').map(h => h.trim());
  return lines.slice(1).map(line => {
    const cells = line.split(',');
    const row: Record<string, string> = {};
    headers.forEach((h, i) => { row[h] = (cells[i] ?? '').trim(); });
    return row;
  });
}

let cached: RedDotConfigRow[] | null = null;

export async function loadRedDotConfig(): Promise<RedDotConfigRow[]> {
  if (cached) return cached;
  try {
    const res = await fetch(CSV_PATH);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    cached = parseCsv(await res.text()).map(r => ({
      dot_id: r.dot_id ?? '',
      category: (r.category ?? 'action') as RedDotCategory,
      enabled: r.enabled !== '0',
      hud_path: r.hud_path ?? '',
      resolver_key: r.resolver_key ?? '',
      min_int: Math.max(0, Number(r.min_int ?? 0)),
      bubble_to: r.bubble_to ?? '',
      note: r.note ?? '',
    })).filter(r => r.dot_id && r.resolver_key);
  } catch {
    cached = [];
  }
  return cached;
}

export function getRedDotConfigSync(): RedDotConfigRow[] {
  return cached ?? [];
}
