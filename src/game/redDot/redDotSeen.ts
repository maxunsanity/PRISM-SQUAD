const STORAGE_KEY = 'prism_red_dot_seen_v1';

function readSeen(): Set<string> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return new Set();
    const arr = JSON.parse(raw) as string[];
    return new Set(Array.isArray(arr) ? arr : []);
  } catch {
    return new Set();
  }
}

function writeSeen(set: Set<string>) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([...set]));
  } catch { /* ignore */ }
}

export function isRedDotSeen(dotId: string): boolean {
  return readSeen().has(dotId);
}

/** new·action 유도 dot 해제 — 최초 방문·메인창 오픈 등 */
export function markRedDotSeen(dotId: string) {
  const set = readSeen();
  if (set.has(dotId)) return;
  set.add(dotId);
  writeSeen(set);
}
