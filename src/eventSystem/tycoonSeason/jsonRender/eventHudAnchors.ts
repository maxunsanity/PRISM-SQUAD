/** 이벤트 재화 비행·흡수 연출용 HUD 앵커 (data-event-anchor) */
export const EVENT_ANCHOR = {
  tycoonGauge: 'tycoon-gauge',
  tycoonReward: 'tycoon-reward',
  seasonTab: 'season-tab',
} as const;

export type EventAnchorId = (typeof EVENT_ANCHOR)[keyof typeof EVENT_ANCHOR];

/** 비행 오버레이와 HUD 앵커는 형제 DOM — 부모(게임 래퍼)에서 검색 */
export function getAnchorCenterInContainer(
  container: HTMLElement,
  anchorId: EventAnchorId,
): { x: number; y: number } | null {
  const root = container.parentElement;
  if (!root) return null;
  const el = root.querySelector(`[data-event-anchor="${anchorId}"]`);
  if (!el) return null;
  const cr = container.getBoundingClientRect();
  const er = el.getBoundingClientRect();
  return {
    x: er.left + er.width / 2 - cr.left,
    y: er.top + er.height / 2 - cr.top,
  };
}
