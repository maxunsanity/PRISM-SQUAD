/**
 * RedDotService — CSV 기반 레드닷 집계 (claim / action / new)
 */
import { hudStore, type HudState } from '../hudExternalStore';
import { loadArcheryHost } from '../archeryMeta';
import { getRedDotConfigSync, loadRedDotConfig } from './redDotConfig';
import { RED_DOT_RESOLVERS } from './resolvers';

/** 레거시 UI 호환 — scope별 표시 (claim > action > new OR) */
const LEGACY_SCOPES: Array<{
  claim: string;
  action: string;
  neu: string;
  legacy: string;
}> = [
  {
    claim: '/redDot/tycoon/claim',
    action: '/redDot/tycoon/action',
    neu: '/redDot/tycoon/new',
    legacy: '/event/redDot/tycoon',
  },
  {
    claim: '/redDot/season/claim',
    action: '/redDot/season/action',
    neu: '/redDot/season/new',
    legacy: '/event/redDot/season',
  },
  {
    claim: '/redDot/lava/claim',
    action: '/redDot/lava/action',
    neu: '/redDot/lava/new',
    legacy: '/event/redDot/lava',
  },
  {
    claim: '/redDot/prize/claim',
    action: '/redDot/prize/action',
    neu: '/redDot/prize/new',
    legacy: '/event/redDot/prize',
  },
  {
    claim: '/redDot/archery/claim',
    action: '/redDot/archery/action',
    neu: '/redDot/archery/new',
    legacy: '/event/redDot/archery',
  },
];

let configReady = false;

export async function preloadRedDotConfig() {
  await loadRedDotConfig();
  configReady = true;
}

export function refreshRedDots() {
  if (!configReady) {
    void loadRedDotConfig().then(() => {
      configReady = true;
      refreshRedDots();
    });
    return;
  }

  const rows = getRedDotConfigSync();
  const patch: Record<string, boolean> = {};
  const aggregateKeys = new Set(
    rows.filter(r => r.resolver_key.startsWith('aggregate_')).map(r => r.resolver_key),
  );

  const evalRow = (row: typeof rows[number]) => {
    if (!row.enabled || !row.hud_path) return;
    const resolver = RED_DOT_RESOLVERS[row.resolver_key];
    if (!resolver) return;
    patch[row.hud_path] = resolver({
      minInt: row.min_int,
      partial: patch,
      dotId: row.dot_id,
    });
  };

  for (const row of rows) {
    if (aggregateKeys.has(row.resolver_key)) continue;
    evalRow(row);
  }
  for (const row of rows) {
    if (!aggregateKeys.has(row.resolver_key)) continue;
    evalRow(row);
  }

  for (const scope of LEGACY_SCOPES) {
    patch[scope.legacy] = Boolean(
      patch[scope.claim] || patch[scope.action] || patch[scope.neu],
    );
  }

  /* 시즌 토너먼트 탭 — 정산 + 익스프레스 마일스톤 */
  patch['/event/redDot/season'] = Boolean(
    patch['/event/redDot/season']
    || patch['/redDot/express/claim']
    || patch['/redDot/express/action'],
  );

  /* 세일 좌측 탭 레거시 */
  patch['/event/redDot/mall'] = Boolean(
    patch['/redDot/mall/claim'] || patch['/redDot/mall/new'],
  );
  patch['/event/redDot/drivers'] = Boolean(
    patch['/redDot/drivers/action'] || patch['/redDot/drivers/new'],
  );

  /* 전투 탭 — 로비 이벤트·세일 버블업 */
  patch['/redDot/nav/battle'] = Boolean(
    patch['/event/redDot/tycoon']
    || patch['/redDot/event_stack/any']
    || patch['/event/redDot/express']
    || patch['/event/redDot/season']
    || patch['/event/redDot/mall']
    || patch['/event/redDot/drivers'],
  );

  const archery = loadArcheryHost();
  const hudPatch = {
    ...patch,
    '/archery/claimPending': archery.claimPending,
  } as Partial<HudState>;
  hudStore.setMany(hudPatch);
}

/** @deprecated refreshRedDots 별칭 */
export const refreshEventRedDots = refreshRedDots;
