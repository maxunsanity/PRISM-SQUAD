import { z } from 'zod';
import { hudBindProp } from './shared';

/* ── HUD 컴포넌트 ── */

export const PrismHudTimer = z.object({
  type: z.literal('PrismHudTimer'),
  visible: z.boolean(),
  props: z.object({
    value: hudBindProp,          // $state: /hud/timer → "01:23"
  }),
});

export const PrismHudTopBar = z.object({
  type: z.literal('PrismHudTopBar'),
  visible: z.boolean(),
  props: z.object({}),
});

export const PrismHudExpBar = z.object({
  type: z.literal('PrismHudExpBar'),
  visible: z.boolean(),
  props: z.object({
    pct: hudBindProp,            // $state: /hud/expPct → 0~100
    level: hudBindProp,          // $state: /hud/level → 숫자
  }),
});

export const PrismHudKillCount = z.object({
  type: z.literal('PrismHudKillCount'),
  visible: z.boolean(),
  props: z.object({
    value: hudBindProp,          // $state: /hud/killCount
  }),
});

export const PrismHudGold = z.object({
  type: z.literal('PrismHudGold'),
  visible: z.boolean(),
  props: z.object({
    value: hudBindProp,          // $state: /hud/gold
  }),
});

export const PrismHudPlayerHp = z.object({
  type: z.literal('PrismHudPlayerHp'),
  visible: z.boolean(),
  props: z.object({
    pct: hudBindProp,            // $state: /hud/hpPct → 0~100
  }),
});

export const PrismHudBossHp = z.object({
  type: z.literal('PrismHudBossHp'),
  visible: z.boolean(),          // $state: /hud/bossVisible
  props: z.object({
    pct: hudBindProp,            // $state: /hud/bossHpPct → 0~100
    bossName: hudBindProp,       // $state: /hud/bossName
  }),
});

export const PrismHudPauseBtn = z.object({
  type: z.literal('PrismHudPauseBtn'),
  visible: z.boolean(),
  props: z.object({
    action: z.literal('TOGGLE_PAUSE'),
  }),
});

export const PrismHudSkillSlots = z.object({
  type: z.literal('PrismHudSkillSlots'),
  visible: z.boolean(),
  props: z.object({
    slots: hudBindProp,            // $state: /hud/activeSkillSlots
  }),
});

export const PrismHudBossWarning = z.object({
  type: z.literal('PrismHudBossWarning'),
  visible: z.boolean(),          // $state: /hud/bossWarningVisible
  props: z.object({}),
});

export const PrismLobbyScreen = z.object({
  type: z.literal('PrismLobbyScreen'),
  visible: z.boolean(),            // $state: /lobby/visible
  props: z.object({}),
});

export const PrismSceneTransition = z.object({
  type: z.literal('PrismSceneTransition'),
  visible: z.boolean(),
  props: z.object({
    visibleState: hudBindProp,     // $state: /scene/transitionVisible
    text: hudBindProp,             // $state: /scene/transitionText
  }),
});

/* ── 도전 화면 ── */

export const PrismChallengeScreen = z.object({
  type: z.literal('PrismChallengeScreen'),
  visible: z.boolean(),
  props: z.object({
    items: hudBindProp,
  }),
});

/* ── 진화 화면 ── */

export const PrismEvolutionScreen = z.object({
  type: z.literal('PrismEvolutionScreen'),
  visible: z.boolean(),
  props: z.object({
    items: hudBindProp,
    gold:  hudBindProp,
    dna:   hudBindProp,
  }),
});

/* ── 모험 레벨업 팝업 ── */

export const PrismAdventureUp = z.object({
  type: z.literal('PrismAdventureUp'),
  visible: z.boolean(),
  props: z.object({
    level:      hudBindProp,
    rewardGem:  hudBindProp,
    rewardGold: hudBindProp,
  }),
});

/* ── 장비 화면 ── */

export const PrismEquipScreen = z.object({
  type: z.literal('PrismEquipScreen'),
  visible: z.boolean(),
  props: z.object({
    items: hudBindProp,
    gold:  hudBindProp,
    atk:   hudBindProp,
    hp:    hudBindProp,
    spd:   hudBindProp,
    weapons: hudBindProp,
    selectedWeaponId: hudBindProp,
  }),
});

/* ── 상점 화면 ── */

export const PrismShopScreen = z.object({
  type: z.literal('PrismShopScreen'),
  visible: z.boolean(),
  props: z.object({
    cashKrw:     hudBindProp,
    gems:        hudBindProp,
    metaGold:    hudBindProp,
    energy:      hudBindProp,
    supplyKeys:  hudBindProp,
    defensePity: hudBindProp,
    purchasedGemIds: hudBindProp,
    gemPacks:    hudBindProp,
    goldPacks:   hudBindProp,
    boxes:       hudBindProp,
    maxEnergy:   hudBindProp,
    showResetButton: hudBindProp,
    testCashKrw: hudBindProp,
  }),
});

/* ── 영구 특성 화면 ── */

export const PrismTalentScreen = z.object({
  type: z.literal('PrismTalentScreen'),
  visible: z.boolean(),
  props: z.object({
    items: hudBindProp,   // $state: /talent/items
    gold:  hudBindProp,   // $state: /talent/gold
  }),
});

/* ── 번개 배수 선택 팝업 ── */

export const PrismBattlePopup = z.object({
  type: z.literal('PrismBattlePopup'),
  visible: z.boolean(),
  props: z.object({
    options:      hudBindProp,   // $state: /battle/options
    selectedMult: hudBindProp,   // $state: /battle/selectedMult
    energy:       hudBindProp,   // $state: /battle/energy
  }),
});

/* ── 에너지(번개) 충전 상점 ── */

export const PrismEnergyShop = z.object({
  type: z.literal('PrismEnergyShop'),
  visible: z.boolean(),
  props: z.object({
    cur:  hudBindProp,
    gems: hudBindProp,
  }),
});

/* ── 보스 등장 연출 (BOSS_INTRO) ── */

export const PrismBossIntro = z.object({
  type: z.literal('PrismBossIntro'),
  visible: z.boolean(),
  props: z.object({}),
});

/* ── 보스 사망 연출 ── */

export const PrismBossDeath = z.object({
  type: z.literal('PrismBossDeath'),
  visible: z.boolean(),
  props: z.object({}),
});

/* ── 러시 웨이브 경고 ── */

export const PrismRushWarning = z.object({
  type: z.literal('PrismRushWarning'),
  visible: z.boolean(),
  props: z.object({}),
});

/* ── 일시정지 화면 ── */

export const PrismPauseScreen = z.object({
  type: z.literal('PrismPauseScreen'),
  visible: z.boolean(),
  props: z.object({}),
});

/* ── 행운 열차 ── */

export const PrismLuckyTrain = z.object({
  type: z.literal('PrismLuckyTrain'),
  visible: z.boolean(),          // $state: /luckyTrain/visible
  props: z.object({
    gold:       hudBindProp,     // $state: /luckyTrain/gold
    skills:     hudBindProp,     // $state: /luckyTrain/skills
    selectedId: hudBindProp,     // $state: /luckyTrain/selectedId
  }),
});

/* ── 스킬 선택 모달 ── */

export const PrismSkillModal = z.object({
  type: z.literal('PrismSkillModal'),
  visible: z.boolean(),          // $state: /modal/visible
  props: z.object({
    cards: hudBindProp,          // $state: /modal/cards → 카드 배열
  }),
});

/* ── 결과 화면 ── */

export const PrismResultScreen = z.object({
  type: z.literal('PrismResultScreen'),
  visible: z.boolean(),          // $state: /result/visible
  props: z.object({
    isVictory: hudBindProp,      // $state: /result/isVictory
    killCount: hudBindProp,      // $state: /result/killCount
    survivalTime: hudBindProp,   // $state: /result/survivalTime
    finalLevel: hudBindProp,     // $state: /result/finalLevel
    goldEarned: hudBindProp,     // $state: /result/goldEarned
  }),
});

export const PrismAvatarSelect = z.object({
  type: z.literal('PrismAvatarSelect'),
  visible: z.boolean(),
  props: z.object({}),
});
