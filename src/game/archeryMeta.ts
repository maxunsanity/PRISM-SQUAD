/**
 * 양궁 아레나 — 호스트 재화 래퍼 (SSoT: MinigameCurrencyService)
 */
import { getMinigameCurrencyService } from './minigameCurrency';
import type { MinigameCurrencySave } from './minigameCurrency/types';
import { resolvePublicPath } from '../publicPath';

const BUNDLE_CSV = '/event/archeryArena/aa_bundle_reward_config.csv';

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

/** PRISM 기동 시 1회 — 번들 CSV + aa_integration kills는 combat_tuning/archery_starter_bows 사용 */
export async function preloadArcheryCsvConfig() {
  try {
    const bunRes = await fetch(resolvePublicPath(BUNDLE_CSV));
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
  } catch { /* CSV 없으면 폴백 */ }
}

export type ArcheryHostState = {
  bowStands: number;
  killsTowardBow: number;
  claimPending: boolean;
};

function svc() {
  return getMinigameCurrencyService();
}

export function loadArcheryHost(): ArcheryHostState {
  const s = svc();
  if (!s) {
    return { bowStands: 0, killsTowardBow: 0, claimPending: false };
  }
  return {
    bowStands: s.getBowStands(),
    killsTowardBow: s.getKillsToward('archery'),
    claimPending: s.getArcheryClaimPending(),
  };
}

export function ensureArcheryStarterBows() {
  svc()?.ensureStarterCurrency();
  svc()?.syncHud();
}

export function saveArcheryHost(patch: Partial<ArcheryHostState>) {
  const s = svc();
  if (!s) return;
  if (patch.claimPending !== undefined) s.setArcheryClaimPending(patch.claimPending);
  s.syncHud();
}

export function syncArcheryHud(state = loadArcheryHost()) {
  void state;
  svc()?.syncHud();
}

/** @deprecated MinigameCurrencyService.onEnemyKilled 가 처리 */
export function archeryOnEnemyKill() {
  /* no-op — GameCore → getMinigameCurrencyService().onEnemyKilled */
}

export function archerySetClaimPending(pending: boolean) {
  svc()?.setArcheryClaimPending(pending);
}

/** 양궁이 자체 소비 후 통지한 잔액(발)을 호스트가 저장 — 이식 지갑 계약 */
export function setArcheryBowStands(balance: number) {
  svc()?.setBowStands(balance);
}

/** 이식 가능 지갑 동기화 메시지 — balance(발) + 획득규칙 안내(호스트 제공 데이터) */
export function archeryWalletSyncMsg() {
  const s = svc();
  const rows = (s?.getAcquireRows('archery') ?? [])
    .filter(r => r.enabled)
    .sort((a, b) => a.sort_order - b.sort_order);
  return {
    type: 'host:walletSync',
    balance: s?.getBowStands() ?? 0,
    missionLines: rows.map(r => ({ title: `${r.row_title} ${r.kills_required}마리`, detail: r.reward_label })),
    claimPending: s?.getArcheryClaimPending() ?? false,
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

/** GameCore._loadMeta / _saveMeta 연동 */
export function applyMinigameCurrencySave(patch: MinigameCurrencySave | undefined) {
  svc()?.applySave(patch);
  svc()?.migrateLegacyArchery();
  svc()?.ensureStarterCurrency();
  svc()?.syncHud();
}

export function minigameCurrencySavePayload(): MinigameCurrencySave | undefined {
  return svc()?.toSavePayload();
}
