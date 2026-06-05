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
    visible: false,  // TopBar에 통합됨
    props: { action: 'TOGGLE_PAUSE' },
  },
  {
    type: 'PrismHudTimer',
    visible: false,  // TopBar에 통합됨
    props: { value: { $state: '/hud/timer' } },
  },
  {
    type: 'PrismHudExpBar',
    visible: false,  // TopBar에 통합됨
    props: {
      pct:   { $state: '/hud/expPct' },
      level: { $state: '/hud/level' },
    },
  },
  {
    type: 'PrismHudKillCount',
    visible: false,  // TopBar에 통합됨
    props: { value: { $state: '/hud/killCount' } },
  },
  {
    type: 'PrismHudGold',
    visible: false,  // TopBar에 통합됨
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
    type: 'PrismPauseScreen',
    visible: true,
    props: {},
  },
  {
    type: 'PrismRushWarning',
    visible: false,       // hudStore '/rushWave/visible' 로 동적 제어
    props: {},
  },
  {
    type: 'PrismBossIntro',
    visible: false,
    props: {},
  },
  {
    type: 'PrismBossDeath',
    visible: false,       // hudStore '/bossDeath/phase' 로 동적 제어
    props: {},
  },
  {
    type: 'PrismAdventureUp',
    visible: false,       // hudStore '/advUp/visible' 로 동적 제어
    props: {
      level:      { $state: '/advUp/level' },
      rewardGem:  { $state: '/advUp/rewardGem' },
      rewardGold: { $state: '/advUp/rewardGold' },
    },
  },
  {
    type: 'PrismChallengeScreen',
    visible: false,
    props: { items: { $state: '/challenge/items' } },
  },
  {
    type: 'PrismEvolutionScreen',
    visible: false,
    props: { items: { $state: '/evolution/items' }, gold: { $state: '/evolution/gold' }, dna: { $state: '/evolution/dna' } },
  },
  {
    type: 'PrismEquipScreen',
    visible: false,       // hudStore '/equip/visible' 로 동적 제어
    props: {
      items: { $state: '/equip/items' },
      gold:  { $state: '/equip/gold' },
      atk:   { $state: '/equip/atk' },
      hp:    { $state: '/equip/hp' },
      spd:   { $state: '/equip/spd' },
      weapons: { $state: '/equip/weapons' },
      selectedWeaponId: { $state: '/equip/selectedWeaponId' },
    },
  },
  {
    type: 'PrismShopScreen',
    visible: false,
    props: {
      cashKrw:     { $state: '/shop/cashKrw' },
      gems:        { $state: '/shop/gems' },
      metaGold:    { $state: '/shop/metaGold' },
      energy:      { $state: '/shop/energy' },
      supplyKeys:  { $state: '/shop/supplyKeys' },
      defensePity: { $state: '/shop/defensePity' },
      purchasedGemIds: { $state: '/shop/purchasedGemIds' },
      gemPacks:    { $state: '/shop/gemPacks' },
      goldPacks:   { $state: '/shop/goldPacks' },
      boxes:       { $state: '/shop/boxes' },
      maxEnergy:   { $state: '/shop/maxEnergy' },
      showResetButton: { $state: '/shop/showResetButton' },
      testCashKrw: { $state: '/shop/testCashKrw' },
    },
  },
  {
    type: 'PrismTalentScreen',
    visible: false,       // hudStore '/talent/visible' 로 동적 제어
    props: {
      items: { $state: '/talent/items' },
      gold:  { $state: '/talent/gold' },
    },
  },
  {
    type: 'PrismBattlePopup',
    visible: false,       // hudStore '/battle/visible' 로 동적 제어
    props: {
      options:      { $state: '/battle/options' },
      selectedMult: { $state: '/battle/selectedMult' },
      energy:       { $state: '/battle/energy' },
    },
  },
  {
    type: 'PrismEnergyShop',
    visible: false,       // hudStore '/energy/visible' 로 동적 제어
    props: {
      cur:  { $state: '/energy/cur' },
      gems: { $state: '/energy/gems' },
    },
  },
  {
    type: 'PrismLuckyTrain',
    visible: false,       // hudStore '/luckyTrain/visible' 로 동적 제어
    props: {
      gold:       { $state: '/luckyTrain/gold' },
      skills:     { $state: '/luckyTrain/skills' },
      selectedId: { $state: '/luckyTrain/selectedId' },
    },
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
  {
    type: 'PrismAvatarSelect',
    visible: false,
    props: {},
  },
];
