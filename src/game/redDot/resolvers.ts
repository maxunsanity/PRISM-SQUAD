import { eventStore } from '../../eventSystem/tycoonSeason/store/eventExternalStore';
import { mallMarvelsStore } from '../../eventSystem/mallMarvels/store';
import { getDriversJoyController } from '../../eventSystem/sales/salesRuntime';
import { hudStore } from '../hudExternalStore';
import { archerySetClaimPending, loadArcheryHost } from '../archeryMeta';
import type { RedDotResolver, RedDotResolverContext } from './types';
import { isRedDotSeen } from './redDotSeen';

function readLavaClaimPending(): boolean {
  try {
    const raw = localStorage.getItem('lq_session_v1');
    if (!raw) return false;
    const s = JSON.parse(raw) as { pendingGrant?: boolean; claimPending?: boolean };
    return Boolean(s.pendingGrant ?? s.claimPending);
  } catch {
    return false;
  }
}

function readPrizeClaimPending(): boolean {
  try {
    const raw = localStorage.getItem('pd_milestone_pending_v1');
    if (raw === '1' || raw === 'true') return true;
    const s = localStorage.getItem('pd_hud_snapshot_v1');
    if (!s) return false;
    const j = JSON.parse(s) as { rewardModalOpen?: boolean; pendingMilestone?: boolean };
    return Boolean(j.rewardModalOpen ?? j.pendingMilestone);
  } catch {
    return false;
  }
}

function mergeArcheryClaimFromIframe() {
  try {
    const raw = localStorage.getItem('aa_event_meta');
    if (!raw) return;
    const m = JSON.parse(raw) as { claimPending?: boolean; endMs?: number };
    if (m.claimPending && Date.now() >= Number(m.endMs ?? 0)) {
      const s = loadArcheryHost();
      if (!s.claimPending) archerySetClaimPending(true);
    }
  } catch { /* ignore */ }
}

/** resolver_key → 판정 함수 (CSV red_dot_config.resolver_key 와 1:1) */
export const RED_DOT_RESOLVERS: Record<string, RedDotResolver> = {
  tycoon_milestone_pending: () => {
    const ev = eventStore.getSnapshot();
    return Number(ev['/event/tycoonPendingRewardCount'] ?? 0) > 0;
  },
  tycoon_lap_complete_pending: () => {
    const ev = eventStore.getSnapshot();
    return Boolean(ev['/event/tycoonLapCompletePending']) && !isRedDotSeen('tycoon_lap_guide');
  },
  season_settlement_pending: () => {
    const ev = eventStore.getSnapshot();
    return Boolean(ev['/event/settlementClaimPending']);
  },
  express_milestone_pending: () => {
    const ev = eventStore.getSnapshot();
    return Number(ev['/event/seasonPendingRewardCount'] ?? 0) > 0;
  },
  express_lap_complete_pending: () => {
    const ev = eventStore.getSnapshot();
    return Boolean(ev['/event/seasonLapCompletePending']) && !isRedDotSeen('express_lap_guide');
  },
  lava_claim_pending: () => readLavaClaimPending(),
  lava_ticket_ready: () => false, /* 라바 단독 — 호스트 티켓 없음 */
  lava_first_visit: () => {
    const hud = hudStore.getSnapshot();
    if (!hud['/lobby/showLavaQuest']) return false;
    return !isRedDotSeen('lava_new');
  },
  prize_claim_pending: () => readPrizeClaimPending(),
  prize_ball_ready: ({ minInt }: RedDotResolverContext) => {
    const hud = hudStore.getSnapshot();
    if (!hud['/lobby/showPrizeDrop']) return false;
    return Number(hud['/lobby/prizeBalls'] ?? 0) >= minInt;
  },
  prize_first_visit: () => {
    const hud = hudStore.getSnapshot();
    if (!hud['/lobby/showPrizeDrop']) return false;
    return !isRedDotSeen('prize_new');
  },
  archery_claim_pending: () => {
    mergeArcheryClaimFromIframe();
    return loadArcheryHost().claimPending;
  },
  archery_bow_ready: ({ minInt }: RedDotResolverContext) => {
    const hud = hudStore.getSnapshot();
    if (!hud['/lobby/showArcheryArena']) return false;
    const archery = loadArcheryHost();
    if (archery.claimPending) return false;
    return archery.bowStands >= minInt;
  },
  archery_first_visit: () => {
    const hud = hudStore.getSnapshot();
    if (!hud['/lobby/showArcheryArena']) return false;
    return !isRedDotSeen('archery_new');
  },
  aggregate_event_stack: ({ partial }) => Boolean(
    partial?.['/redDot/lava/claim'] || partial?.['/redDot/lava/action'] || partial?.['/redDot/lava/new']
    || partial?.['/redDot/prize/claim'] || partial?.['/redDot/prize/action'] || partial?.['/redDot/prize/new']
    || partial?.['/redDot/archery/claim'] || partial?.['/redDot/archery/action'] || partial?.['/redDot/archery/new'],
  ),
  aggregate_express_tab: ({ partial }) => Boolean(
    partial?.['/redDot/express/claim'] || partial?.['/redDot/express/action'],
  ),
  mall_free_claim: () => Boolean(mallMarvelsStore.getSnapshot()['/mallMarvels/hasFreeClaim']),
  mall_first_visit: () => {
    const hud = hudStore.getSnapshot();
    if (!hud['/lobby/showMallMarvels']) return false;
    return !isRedDotSeen('mall_new');
  },
  drivers_purchase_available: () => getDriversJoyController()?.hasPurchaseAvailable() ?? false,
  drivers_first_visit: () => {
    const hud = hudStore.getSnapshot();
    if (!hud['/lobby/showDriversJoy']) return false;
    return !isRedDotSeen('drivers_new');
  },
  nav_shop_first_visit: () => !isRedDotSeen('nav_shop_new'),
  nav_equip_first_visit: () => !isRedDotSeen('nav_equip_new'),
  nav_challenge_first_visit: () => !isRedDotSeen('nav_challenge_new'),
  nav_evolution_first_visit: () => !isRedDotSeen('nav_evolution_new'),
  equip_upgrade_available: () => {
    const hud = hudStore.getSnapshot();
    const items = hud['/equip/items'] ?? [];
    const gold = Number(hud['/equip/gold'] ?? hud['/lobby/metaGold'] ?? 0);
    return items.some(it =>
      it.current_level < it.max_level && it.next_cost > 0 && gold >= it.next_cost,
    );
  },
  challenge_energy_ready: ({ minInt }: RedDotResolverContext) =>
    Number(hudStore.getSnapshot()['/lobby/entryTickets'] ?? 0) >= minInt,
  evolution_unlock_available: () => {
    const items = hudStore.getSnapshot()['/evolution/items'] ?? [];
    return items.some(n => n.available && n.affordable);
  },
  aggregate_nav_shop: ({ partial }) => Boolean(
    partial?.['/redDot/nav/shop/new'],
  ),
  aggregate_nav_equip: ({ partial }) => Boolean(
    partial?.['/redDot/nav/equip/new'] || partial?.['/redDot/nav/equip/action'],
  ),
  aggregate_nav_challenge: ({ partial }) => Boolean(
    partial?.['/redDot/nav/challenge/new'] || partial?.['/redDot/nav/challenge/action'],
  ),
  aggregate_nav_evolution: ({ partial }) => Boolean(
    partial?.['/redDot/nav/evolution/new'] || partial?.['/redDot/nav/evolution/action'],
  ),
};
