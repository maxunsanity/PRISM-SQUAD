/** 레드닷 UI 헬퍼 — claim > action > new 우선순위 */
import type { HudState } from '../hudExternalStore';
import type { RedDotCategory } from './types';

function hudFlag(hud: HudState, path: string): boolean {
  return Boolean((hud as Record<string, unknown>)[path]);
}

export function pickScopeRedDot(hud: HudState, scope: string): RedDotCategory | null {
  if (hudFlag(hud, `/redDot/${scope}/claim`)) return 'claim';
  if (hudFlag(hud, `/redDot/${scope}/action`)) return 'action';
  if (hudFlag(hud, `/redDot/${scope}/new`)) return 'new';
  return null;
}

export function hasScopeRedDot(hud: HudState, scope: string): boolean {
  return pickScopeRedDot(hud, scope) !== null;
}

export function hasNavTabRedDot(hud: HudState, tab: string): boolean {
  return hudFlag(hud, `/redDot/nav/${tab}`);
}

export function pickNavTabRedDot(hud: HudState, tab: string): RedDotCategory | null {
  if (hudFlag(hud, `/redDot/nav/${tab}/claim`)) return 'claim';
  if (hudFlag(hud, `/redDot/nav/${tab}/action`)) return 'action';
  if (hudFlag(hud, `/redDot/nav/${tab}/new`)) return 'new';
  return null;
}

export function hasLegacyEventRedDot(hud: HudState, legacyKey: string): boolean {
  return hudFlag(hud, `/event/redDot/${legacyKey}`);
}
