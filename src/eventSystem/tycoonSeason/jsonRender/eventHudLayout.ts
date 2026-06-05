import type { CSSProperties } from 'react';

/** TopBar 직후 mileage·tournament 슬롯 공통 top (App.tsx와 동기) */
export function eventHudLayerTop(battleLobby: boolean): number {
  return battleLobby ? 128 : 108;
}

/** MonopolyMileageCapsule 외곽 padding — tournament 슬롯 상단과 동일 */
export const EVENT_MILEAGE_WRAP_PAD = { top: 8, bottom: 16, sides: 8 } as const;

/** 타이쿤 캡슐 흰 카드 본체 최소 높이 */
export const EVENT_CAPSULE_BODY_MIN_H = 74;

const SIDE_TAB_W = 64;
const SIDE_TAB_SHELL: CSSProperties = {
  width: SIDE_TAB_W,
  minHeight: EVENT_CAPSULE_BODY_MIN_H + 28,
  boxSizing: 'border-box',
  pointerEvents: 'auto',
  cursor: 'pointer',
  background: '#F4EFE6',
  borderRadius: '12px 0 0 12px',
  border: '3px solid #000000',
  borderRight: 'none',
  boxShadow: '-3px 3px 0 #000000',
  padding: '8px 4px 8px 6px',
  textAlign: 'center',
  fontFamily: '"Segoe UI", Roboto, Helvetica, Arial, sans-serif',
};

export function eventSideTabShellStyle(extra?: CSSProperties): CSSProperties {
  return { ...SIDE_TAB_SHELL, ...extra };
}

/** 왼쪽 가장자리 세일 탭 (쇼핑몰·드라이버) — 오른쪽 탭과 대칭 */
export function eventSideTabShellStyleLeft(extra?: CSSProperties): CSSProperties {
  return {
    width: SIDE_TAB_W,
    minHeight: EVENT_CAPSULE_BODY_MIN_H + 28,
    boxSizing: 'border-box',
    pointerEvents: 'auto',
    cursor: 'pointer',
    background: '#F4EFE6',
    borderRadius: '0 12px 12px 0',
    border: '3px solid #000000',
    borderLeft: 'none',
    boxShadow: '3px 3px 0 #000000',
    padding: '8px 6px 8px 4px',
    textAlign: 'center',
    fontFamily: '"Segoe UI", Roboto, Helvetica, Arial, sans-serif',
    ...extra,
  };
}

export const EVENT_SIDE_TAB_ICON = {
  size: 44,
  border: '3px solid #000000',
  bg: '#FFB347',
  shadow: '1.5px 1.5px 0 #000000',
} as const;

/** 사이드 탭 1장 높이 + 카드 간격 (EventMiniCards·시즌 탭 스택) */
export const EVENT_SIDE_TAB_STACK_H = EVENT_CAPSULE_BODY_MIN_H + 28;
export const EVENT_SIDE_TAB_GAP = 10;

export function isBattleLobbyHud(snap: Record<string, unknown>): boolean {
  if (!snap['/lobby/visible']) return false;
  return !snap['/shop/visible']
    && !snap['/equip/visible']
    && !snap['/challenge/visible']
    && !snap['/evolution/visible']
    && !snap['/talent/visible']
    && !snap['/energy/visible']
    && !snap['/avatar/visible'];
}

/** 오른쪽 스택 N번째 탭 top(px) — 0=시즌(또는 첫 미니카드) */
export function eventSideTabStackTopPx(battleLobby: boolean, stackIndex: number): number {
  const base = eventHudLayerTop(battleLobby) + EVENT_MILEAGE_WRAP_PAD.top;
  return base + stackIndex * (EVENT_SIDE_TAB_STACK_H + EVENT_SIDE_TAB_GAP);
}

export function eventMiniCardStackIndex(
  card: 'lava' | 'prize' | 'archery',
  opts: { seasonTabVisible: boolean; showLava: boolean; showPrize: boolean },
): number {
  let idx = opts.seasonTabVisible ? 1 : 0;
  if (card === 'lava') return idx;
  if (opts.showLava) idx += 1;
  if (card === 'prize') return idx;
  if (opts.showPrize) idx += 1;
  return idx;
}
