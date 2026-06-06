/** 세일 이벤트 CSV — tycoonSeason/data.ts와 동일 RFC4180 파서 */
import { resolvePublicPath } from '../../publicPath';

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

export function parseCSV(raw: string): Record<string, string>[] {
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

export async function loadCSV(path: string): Promise<Record<string, string>[]> {
  const res = await fetch(resolvePublicPath(path));
  if (!res.ok) throw new Error(`[sales] CSV load failed: ${path}`);
  return parseCSV(await res.text());
}
