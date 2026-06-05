/** 호스트 RewardDetailOverlay — 보상 아이콘 탭 시 설명 */
export function postRewardDetail(payload: {
  kind: string;
  slotId?: string;
  label?: string;
  icon?: string;
  amount?: number;
}) {
  if (typeof window === 'undefined' || window.parent === window) return;
  window.parent.postMessage({ type: 'event:showRewardDetail', ...payload }, '*');
}

export function rewardTypeToKind(rewardType: string): string {
  const t = rewardType.toLowerCase();
  if (t === 'equip') return 'equip';
  if (t === 'gem') return 'gem';
  if (t === 'lightning') return 'lightning';
  return 'gold';
}
