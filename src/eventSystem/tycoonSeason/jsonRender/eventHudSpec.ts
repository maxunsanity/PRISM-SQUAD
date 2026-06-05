/**
 * eventHudSpec.ts — 이벤트 HUD Spec ($state는 /event/* 만 사용)
 */
import type { EventCatalogElement } from './catalog';

export const eventHudSpec: EventCatalogElement[] = [
  {
    type: 'EventTycoonMileageBar',
    visible: true,
    props: {
      name: { $state: '/event/name' },
      points: { $state: '/event/points' },
      nextPoint: { $state: '/event/nextMilestonePoint' },
      gaugePoints: { $state: '/event/gaugePoints' },
      gaugeTarget: { $state: '/event/gaugeTarget' },
      currencyAssetKey: { $state: '/event/currencyAssetKey' },
      rewardAssetKey: { $state: '/event/nextRewardAssetKey' },
      rewardLabel: { $state: '/event/nextRewardLabel' },
      timerText: { $state: '/event/timerText' },
      themeKey: { $state: '/event/themeKey' },
    },
  },
  {
    type: 'EventTournamentLeaderboard',
    visible: true,
    props: {
      seasonName: { $state: '/event/seasonName' },
      seasonThemeKey: { $state: '/event/seasonThemeKey' },
      seasonCurrencyAssetKey: { $state: '/event/seasonCurrencyAssetKey' },
      seasonTimerText: { $state: '/event/seasonTimerText' },
      seasonGroupSize: { $state: '/event/seasonGroupSize' },
      seasonBadgeLabel: { $state: '/event/seasonBadgeLabel' },
      rows: { $state: '/event/tournamentRows' },
      playerRank: { $state: '/event/tournamentRank' },
      className: { $state: '/event/className' },
    },
  },
  {
    type: 'EventMilestoneRewardPopup',
    visible: true,
    props: {
      title: { $state: '/event/tycoonMilestonePopupTitle' },
      lap: { $state: '/event/tycoonMilestonePopupLap' },
      step: { $state: '/event/tycoonMilestonePopupStep' },
      assetKey: { $state: '/event/tycoonMilestonePopupAssetKey' },
      label: { $state: '/event/tycoonMilestonePopupLabel' },
    },
  },
  {
    type: 'EventMilestoneListPopup',
    visible: true,
    props: {
      rows: { $state: '/event/milestoneRows' },
      points: { $state: '/event/points' },
      nextPoint: { $state: '/event/nextMilestonePoint' },
      gaugePoints: { $state: '/event/gaugePoints' },
      gaugeTarget: { $state: '/event/gaugeTarget' },
    },
  },
  {
    type: 'EventTournamentPanel',
    visible: true,
    props: {
      rows: { $state: '/event/tournamentRows' },
      playerRank: { $state: '/event/tournamentRank' },
      className: { $state: '/event/className' },
      seasonCoins: { $state: '/event/seasonCoins' },
    },
  },
  {
    type: 'EventTournamentSettlementPopup',
    visible: true,
    props: {
      rank: { $state: '/event/tournamentRank' },
      coins: { $state: '/event/seasonCoins' },
      bundleId: { $state: '/event/settlementBundleId' },
    },
  },
  {
    type: 'SeasonExpressPanel',
    visible: true,
    props: {
      title: { $state: '/event/expressTitle' },
      timerText: { $state: '/event/expressTimerText' },
      rewardAssetKey: { $state: '/event/expressRewardAssetKey' },
      rewardLabel: { $state: '/event/expressRewardLabel' },
    },
  },
  {
    type: 'SeasonExpressSideTab',
    visible: true,
    props: {
      name: { $state: '/event/expressName' },
      timerText: { $state: '/event/expressTimerText' },
      rewardAssetKey: { $state: '/event/expressRewardAssetKey' },
    },
  },
];
