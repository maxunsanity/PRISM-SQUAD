import { z } from 'zod';
import { eventBindProp } from './shared';

export const EventTycoonMileageBar = z.object({
  type: z.literal('EventTycoonMileageBar'),
  visible: z.boolean(),
  props: z.object({
    name: eventBindProp,
    points: eventBindProp,
    nextPoint: eventBindProp,
    gaugePoints: eventBindProp,
    gaugeTarget: eventBindProp,
    currencyAssetKey: eventBindProp,
    rewardAssetKey: eventBindProp,
    rewardLabel: eventBindProp,
    timerText: eventBindProp,
    themeKey: eventBindProp,
  }),
});

export const EventTournamentLeaderboard = z.object({
  type: z.literal('EventTournamentLeaderboard'),
  visible: z.boolean(),
  props: z.object({
    seasonName: eventBindProp,
    seasonThemeKey: eventBindProp,
    seasonCurrencyAssetKey: eventBindProp,
    seasonTimerText: eventBindProp,
    seasonGroupSize: eventBindProp,
    seasonBadgeLabel: eventBindProp,
    rows: eventBindProp,
    playerRank: eventBindProp,
    className: eventBindProp,
  }),
});

export const EventMilestoneRewardPopup = z.object({
  type: z.literal('EventMilestoneRewardPopup'),
  visible: z.boolean(),
  props: z.object({
    title: eventBindProp,
    lap: eventBindProp,
    step: eventBindProp,
    assetKey: eventBindProp,
    label: eventBindProp,
  }),
});

export const EventMilestoneListPopup = z.object({
  type: z.literal('EventMilestoneListPopup'),
  visible: z.boolean(),
  props: z.object({
    rows: eventBindProp,
    points: eventBindProp,
    nextPoint: eventBindProp,
    gaugePoints: eventBindProp,
    gaugeTarget: eventBindProp,
  }),
});

export const EventTournamentPanel = z.object({
  type: z.literal('EventTournamentPanel'),
  visible: z.boolean(),
  props: z.object({
    rows: eventBindProp,
    playerRank: eventBindProp,
    className: eventBindProp,
    seasonCoins: eventBindProp,
  }),
});

export const EventTournamentSettlementPopup = z.object({
  type: z.literal('EventTournamentSettlementPopup'),
  visible: z.boolean(),
  props: z.object({
    rank: eventBindProp,
    coins: eventBindProp,
    bundleId: eventBindProp,
  }),
});

export const SeasonExpressPanel = z.object({
  type: z.literal('SeasonExpressPanel'),
  visible: z.boolean(),
  props: z.object({
    title: eventBindProp,
    timerText: eventBindProp,
    rewardAssetKey: eventBindProp,
    rewardLabel: eventBindProp,
  }),
});

export const SeasonExpressSideTab = z.object({
  type: z.literal('SeasonExpressSideTab'),
  visible: z.boolean(),
  props: z.object({
    name: eventBindProp,
    timerText: eventBindProp,
    rewardAssetKey: eventBindProp,
  }),
});
