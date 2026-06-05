import { hudStore } from './hudExternalStore';

export type RewardModalPayload = {
  type: 'milestone' | 'jackpot' | 'complete';
  step?: number;
  rewardAmount?: number;
  rewardType?: string;
  rewardIcon?: string;
  rewardLabel?: string;
  rewardSlotId?: string;
  cycleCount?: number;
};

export type RewardModalState = {
  visible: boolean;
  current: RewardModalPayload | null;
  remaining: number;
};

let _queue: RewardModalPayload[] = [];
let _autoCloseTimer: ReturnType<typeof setTimeout> | null = null;
let _dismissTimer: ReturnType<typeof setTimeout> | null = null;

function _pushCurrent() {
  if (_queue.length === 0) {
    hudStore.update({ '/hud/modal_visible': false });
    return;
  }
  const current = _queue[0];
  hudStore.update({
    '/hud/modal_visible': true,
    '/hud/modal_type': current.type,
    '/hud/modal_step': current.step ?? 0,
    '/hud/modal_reward_amount': current.rewardAmount ?? 0,
    '/hud/modal_reward_type': current.rewardType ?? '',
    '/hud/modal_reward_icon': current.rewardIcon ?? '🎲',
    '/hud/modal_reward_label': current.rewardLabel ?? '',
    '/hud/modal_reward_slot_id': current.rewardSlotId ?? '',
    '/hud/modal_remaining': _queue.length - 1,
    '/hud/modal_cycle_count': current.cycleCount ?? 0,
  });
  if (_autoCloseTimer) clearTimeout(_autoCloseTimer);
  if (current.type !== 'complete') {
    _autoCloseTimer = setTimeout(() => rewardModalStore.dismiss(), 3000);
  }
}

export const rewardModalStore = {
  getSnapshot(): RewardModalState {
    const s = hudStore.getSnapshot();
    const visible = s['/hud/modal_visible'] as boolean;
    if (!visible) return { visible: false, current: null, remaining: 0 };
    return {
      visible,
      current: {
        type: s['/hud/modal_type'] as RewardModalPayload['type'],
        step: s['/hud/modal_step'] as number,
        rewardAmount: s['/hud/modal_reward_amount'] as number,
        rewardType: s['/hud/modal_reward_type'] as string,
        rewardIcon: s['/hud/modal_reward_icon'] as string,
        rewardLabel: s['/hud/modal_reward_label'] as string,
        rewardSlotId: s['/hud/modal_reward_slot_id'] as string,
        cycleCount: s['/hud/modal_cycle_count'] as number,
      },
      remaining: s['/hud/modal_remaining'] as number,
    };
  },
  subscribe(listener: () => void): () => void {
    return hudStore.subscribe(listener);
  },
  enqueue(payload: RewardModalPayload) {
    _queue.push(payload);
    if (_queue.length === 1) _pushCurrent();
  },
  dismiss() {
    if (_autoCloseTimer) clearTimeout(_autoCloseTimer);
    if (_dismissTimer) clearTimeout(_dismissTimer);
    _queue.shift();
    hudStore.update({ '/hud/modal_visible': false });
    if (_queue.length > 0) {
      _dismissTimer = setTimeout(_pushCurrent, 180);
    }
  },
};
