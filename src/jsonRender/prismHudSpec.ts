/**
 * prismHudSpec.ts — HUD Spec 주문서
 * $state 경로 수정 시 hudExternalStore.ts + registry.tsx도 동시 패치
 */
import type { CatalogElement } from './catalog';

export const prismHudSpec: CatalogElement[] = [
  {
    type: 'PrismHudTopBar',
    visible: true,
    props: {},
  },
  {
    type: 'PrismLobbyScreen',
    visible: false,       // hudStore '/lobby/visible' 로 동적 제어
    props: {},
  },
  {
    type: 'PrismSceneTransition',
    visible: true,
    props: {
      visibleState: { $state: '/scene/transitionVisible' },
      text: { $state: '/scene/transitionText' },
    },
  },
  {
    type: 'PrismHudPauseBtn',
    visible: true,
    props: { action: 'TOGGLE_PAUSE' },
  },
  {
    type: 'PrismHudTimer',
    visible: true,
    props: { value: { $state: '/hud/timer' } },
  },
  {
    type: 'PrismHudExpBar',
    visible: true,
    props: {
      pct:   { $state: '/hud/expPct' },
      level: { $state: '/hud/level' },
    },
  },
  {
    type: 'PrismHudKillCount',
    visible: true,
    props: { value: { $state: '/hud/killCount' } },
  },
  {
    type: 'PrismHudGold',
    visible: true,
    props: { value: { $state: '/hud/gold' } },
  },
  {
    type: 'PrismHudPlayerHp',
    visible: true,
    props: { pct: { $state: '/hud/hpPct' } },
  },
  {
    type: 'PrismHudSkillSlots',
    visible: true,
    props: { slots: { $state: '/hud/activeSkillSlots' } },
  },
  {
    type: 'PrismHudBossHp',
    visible: false,       // hudStore '/hud/bossVisible' 로 동적 제어
    props: {
      pct:      { $state: '/hud/bossHpPct' },
      bossName: { $state: '/hud/bossName' },
    },
  },
  {
    type: 'PrismHudBossWarning',
    visible: false,       // hudStore '/hud/bossWarningVisible' 로 동적 제어
    props: {},
  },
  {
    type: 'PrismSkillModal',
    visible: false,       // hudStore '/modal/visible' 로 동적 제어
    props: { cards: { $state: '/modal/cards' } },
  },
  {
    type: 'PrismResultScreen',
    visible: false,       // hudStore '/result/visible' 로 동적 제어
    props: {
      isVictory:    { $state: '/result/isVictory' },
      killCount:    { $state: '/result/killCount' },
      survivalTime: { $state: '/result/survivalTime' },
      finalLevel:   { $state: '/result/finalLevel' },
      goldEarned:   { $state: '/result/goldEarned' },
    },
  },
];
