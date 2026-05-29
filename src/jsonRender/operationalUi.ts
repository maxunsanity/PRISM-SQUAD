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
