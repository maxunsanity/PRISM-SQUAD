/**
 * 양궁 아레나 — 호스트 재화(활대) · 100킬 지급 · 수령 대기(레드닷)
 */
import { hudStore } from './hudExternalStore';

/** SSoT: public/event/archeryArena/aa_integration_config.csv (호스트·iframe 동기화) */
const STORAGE_KEY = 'prism_archery_host_v1';
const INTEGRATION_CSV = '/event/archeryArena/aa_integration_config.csv';
const BUNDLE_CSV = '/event/archeryArena/aa_bundle_reward_config.csv';

let KILLS_PER_BOW = 100;
/** 신규·보유 0일 때 1회 지급 — 활대 1개 = 5발 도전 1회 */
export let STARTER_BOW_STANDS = 5;

let bundleGrantCache: Record<string, Array<{ kind: string; amount?: number; slotId?: string }>> | null = null;

function parseCsvRows(text: string): Record<string, string>[] {
  const lines = text.split(/\r?\n/).filter((l) => l.trim());
  if (lines.length < 2) return [];
  const headers = lines[0].split(',').map((h) => h.trim());
  return lines.slice(1).map((line) => {
    const cells = line.split(',');
    const row: Record<string, string> = {};
    headers.forEach((h, i) => { row[h] = (cells[i] ?? '').trim(); });
    return row;
  });
}

/** PRISM 기동 시 1회 — CSV와 호스트 상수 동기화 */
export async function preloadArcheryCsvConfig() {
  try {
    const [intRes, bunRes] = await Promise.all([
      fetch(INTEGRATION_CSV),
      fetch(BUNDLE_CSV),
    ]);
    if (intRes.ok) {
      const rows = parseCsvRows(await intRes.text());
      const cfg: Record<string, string> = {};
      for (const r of rows) if (r.config_key) cfg[r.config_key] = r.config_value;
      if (cfg.kills_per_bow_host) KILLS_PER_BOW = Math.max(1, Number(cfg.kills_per_bow_host));
      if (cfg.starter_bow_stands) STARTER_BOW_STANDS = Math.max(1, Number(cfg.starter_bow_stands));
    }
    if (bunRes.ok) {
      const map: typeof bundleGrantCache = {};
      for (const r of parseCsvRows(await bunRes.text())) {
        const id = r.bundle_id;
        if (!id) continue;
        if (!map[id]) map[id] = [];
        map[id].push({
          kind: String(r.reward_kind ?? 'gold').toLowerCase(),
          amount: Number(r.reward_amount ?? 0) || undefined,
          slotId: r.reward_slot_id || undefined,
        });
      }
      bundleGrantCache = map;
    }
  } catch { /* CSV 없으면 하드코드 폴백 */ }
}

export type ArcheryHostState = {
  bowStands: number;
  killsTowardBow: number;
  claimPending: boolean;
};

const DEFAULT: ArcheryHostState = {
  bowStands: STARTER_BOW_STANDS,
  killsTowardBow: 0,
  claimPending: false,
};

export function loadArcheryHost(): ArcheryHostState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...DEFAULT };
    const d = JSON.parse(raw) as Partial<ArcheryHostState> & { starterGranted?: boolean; starterV2?: boolean };
    let bowStands = Math.max(0, Number(d.bowStands ?? 0));
    const claimPending = Boolean(d.claimPending);
    if (!d.starterGranted && !claimPending && bowStands < STARTER_BOW_STANDS) {
      bowStands = STARTER_BOW_STANDS;
    } else if (!d.starterV2 && !claimPending && bowStands < STARTER_BOW_STANDS) {
      bowStands = STARTER_BOW_STANDS;
    }
    if (bowStands !== Number(d.bowStands ?? 0)) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify({
          bowStands,
          killsTowardBow: Math.max(0, Number(d.killsTowardBow ?? 0)),
          claimPending,
          starterGranted: true,
          starterV2: true,
        }));
      } catch { /* ignore */ }
    }
    return {
      bowStands,
      killsTowardBow: Math.max(0, Math.min(KILLS_PER_BOW - 1, Number(d.killsTowardBow ?? 0))),
      claimPending,
    };
  } catch {
    return { ...DEFAULT };
  }
}

/** 앱 기동 시 — 저장 없으면 기본 활대 지급 */
export function ensureArcheryStarterBows() {
  if (!localStorage.getItem(STORAGE_KEY)) saveArcheryHost({ bowStands: STARTER_BOW_STANDS });
  else loadArcheryHost();
}

export function saveArcheryHost(patch: Partial<ArcheryHostState>) {
  const next = { ...loadArcheryHost(), ...patch };
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch { /* ignore */ }
  syncArcheryHud(next);
}

export function syncArcheryHud(state = loadArcheryHost()) {
  hudStore.setMany({
    '/lobby/archeryBowStands': state.bowStands,
    '/archery/killsTowardBow': state.killsTowardBow,
    '/archery/claimPending': state.claimPending,
    '/event/redDot/archery': state.claimPending,
  });
}

/** 스퀘어 적 처치 1회 — 100마리마다 활대 +1 */
export function archeryOnEnemyKill() {
  const s = loadArcheryHost();
  let kills = s.killsTowardBow + 1;
  let bows = s.bowStands;
  if (kills >= KILLS_PER_BOW) {
    kills = 0;
    bows += 1;
  }
  saveArcheryHost({ killsTowardBow: kills, bowStands: bows });
}

export function archeryConsumeBow(): boolean {
  const s = loadArcheryHost();
  if (s.bowStands < 1) return false;
  saveArcheryHost({ bowStands: s.bowStands - 1 });
  return true;
}

export function archerySetClaimPending(pending: boolean) {
  saveArcheryHost({ claimPending: pending });
}

export function archeryInitPayload() {
  const s = loadArcheryHost();
  return {
    bowStands: s.bowStands,
    claimPending: s.claimPending,
    killsTowardBow: s.killsTowardBow,
    killsPerBow: KILLS_PER_BOW,
    roundBlocked: s.claimPending,
  };
}

const FALLBACK_BUNDLE: Record<string, Array<{ kind: string; amount?: number; slotId?: string }>> = {
  '2001': [{ kind: 'gem', amount: 120 }],
  '2002': [{ kind: 'gem', amount: 80 }],
  '2003': [{ kind: 'gem', amount: 50 }],
  '2004': [{ kind: 'gold', amount: 5000 }],
  '2005': [{ kind: 'gold', amount: 2000 }],
};

export function archeryBundleToGrant(bundleId: string): Array<{ kind: string; amount?: number; slotId?: string }> {
  const map = bundleGrantCache ?? FALLBACK_BUNDLE;
  return map[String(bundleId)] ?? [{ kind: 'gold', amount: 500 }];
}
