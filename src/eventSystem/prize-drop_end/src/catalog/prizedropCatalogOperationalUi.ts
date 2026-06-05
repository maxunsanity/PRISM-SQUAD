// @prizedrop-catalog-role #운영UI #JSX-registry연결 #HUD #모달 #게이지
import { z } from 'zod';
import { hudBindProp, emptySceneProps } from './prizedropCatalogShared';

export const prizedropCatalogOperationalUiComponents = {
  PrizedropSceneRoot: {
    props: emptySceneProps,
    slots: ['default'],
    description: 'HUD 최상위 래퍼.',
    example: {},
  },
  PrizedropHudBallCount: {
    props: z.object({
      ballCount: hudBindProp.describe('{ $state: "/hud/ball_count" }'),
      showWarning: hudBindProp.describe('{ $state: "/hud/show_warning" }'),
    }),
    slots: [],
    description: '공 보유 수 표시 + +10 추가 버튼 + 경고 토스트. press 이벤트에 prizedropAddBalls 연결.',
    example: { ballCount: 10, showWarning: false },
  },
  PrizedropHudMultiplier: {
    props: z.object({
      multiplier: hudBindProp.describe('{ $state: "/hud/multiplier" }'),
    }),
    slots: [],
    description: '배수 선택 버튼 (x1→x2→x5→x10 순환). press 이벤트에 prizedropCycleMultiplier 연결.',
    example: { multiplier: 1 },
  },
  PrizedropHudDropButtons: {
    props: emptySceneProps,
    slots: [],
    description: '5개 드롭 버튼 행. 내부적으로 release_drop(0~4) 디스패치. press 이벤트에 prizedropDropBall 액션.',
    example: {},
  },
  PrizedropHudSlotLabels: {
    props: emptySceneProps,
    slots: [],
    description: '슬롯 7개 라벨 행 (1/10/20/100/20/10/1) — 정적.',
    example: {},
  },
  PrizedropHudMilestoneBar: {
    props: z.object({
      sessionLightning: hudBindProp.describe('{ $state: "/hud/session_lightning" }'),
      milestoneStep: hudBindProp.describe('{ $state: "/hud/milestone_step" }'),
      milestoneThresholds: hudBindProp.describe('{ $state: "/hud/milestone_thresholds" }'),
      lastGain: hudBindProp.describe('{ $state: "/hud/last_gain" }'),
      showGain: hudBindProp.describe('{ $state: "/hud/show_gain" }'),
      cycleCount: hudBindProp.describe('{ $state: "/hud/cycle_count" }'),
    }),
    slots: [],
    description: '마일스톤 게이지 바 — 5단계 균등 구간(100/200/300/400/500), +N 배지, 보상 카운트.',
    example: {
      sessionLightning: 0,
      milestoneStep: 0,
      milestoneThresholds: [100, 200, 300, 400, 500],
      lastGain: 0,
      showGain: false,
      cycleCount: 0,
    },
  },
  PrizedropHudRewardModal: {
    props: z.object({
      visible: hudBindProp.describe('{ $state: "/hud/modal_visible" }'),
      modalType: hudBindProp.describe('{ $state: "/hud/modal_type" } — milestone|jackpot|complete'),
      modalStep: hudBindProp.describe('{ $state: "/hud/modal_step" }'),
      rewardAmount: hudBindProp.describe('{ $state: "/hud/modal_reward_amount" }'),
      rewardType: hudBindProp.describe('{ $state: "/hud/modal_reward_type" }'),
      remaining: hudBindProp.describe('{ $state: "/hud/modal_remaining" }'),
      cycleCount: hudBindProp.describe('{ $state: "/hud/modal_cycle_count" }'),
    }),
    slots: [],
    description: '보상 모달 (milestone/jackpot/complete 3종). 큐 기반 순차 표시. complete는 배경 클릭 비활성화.',
    example: {
      visible: false,
      modalType: 'milestone',
      modalStep: 1,
      rewardAmount: 10,
      rewardType: 'Dice',
      remaining: 0,
      cycleCount: 0,
    },
  },
};
