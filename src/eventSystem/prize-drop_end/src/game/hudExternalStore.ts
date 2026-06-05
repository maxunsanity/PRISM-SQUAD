import { createStateStore } from '@json-render/core';

export const hudStore = createStateStore({
  // 입장/미션 인트로 (게임 자체 화면)
  '/hud/intro_visible': true,
  '/hud/mission_lines': [] as Array<{ title: string; detail: string }>,
  // 공 관리
  '/hud/ball_count': 10,
  // 배수
  '/hud/multiplier': 1,
  // 누적 번개
  '/hud/session_lightning': 0,
  // 경고 토스트
  '/hud/show_warning': false,
  /** 공 비행 중 — 추가 드롭 버튼 비활성 */
  '/hud/drop_busy': false,
  // 마일스톤 게이지
  '/hud/milestone_step': 0,
  '/hud/milestone_progress': 0,
  '/hud/milestone_thresholds': [100, 200, 300, 400, 500] as number[],
  '/hud/milestone_rewards': [] as Array<{
    step: number;
    threshold_lightning: number;
    reward_type: string;
    reward_amount: number;
    reward_icon: string;
    reward_label: string;
    reward_item_id: string;
  }>,
  '/hud/last_gain': 0,
  '/hud/show_gain': false,
  '/hud/cycle_count': 0,
  // 보상 모달
  '/hud/modal_visible': false,
  '/hud/modal_type': '' as string,
  '/hud/modal_step': 0,
  '/hud/modal_reward_amount': 0,
  '/hud/modal_reward_type': '' as string,
  '/hud/modal_reward_icon': '🎲' as string,
  '/hud/modal_reward_label': '' as string,
  '/hud/modal_reward_slot_id': '' as string,
  '/hud/modal_remaining': 0,
  '/hud/modal_cycle_count': 0,
});

export function syncHud(updates: Record<string, unknown>) {
  hudStore.update(updates);
}
