import { z } from 'zod';

/**
 * 점수 표시 컴포넌트
 * bind: ArcheryHudState 의 myScore 키
 */
export const ScoreDisplaySchema = z.object({
  type: z.literal('ScoreDisplay'),
  props: z.object({
    label: z.string().default('점수'),
    bind: z.string().default('myScore'),
  }),
});

/**
 * 순위 표시 컴포넌트
 * bind: ArcheryHudState 의 myRank 키
 */
export const RankDisplaySchema = z.object({
  type: z.literal('RankDisplay'),
  props: z.object({
    label: z.string().default('순위'),
    bind: z.string().default('myRank'),
    suffix: z.string().default('위'),
  }),
});

/**
 * 주사위(재화) 표시 컴포넌트
 * bind: ArcheryHudState 의 diceCount 키
 */
export const DiceCountDisplaySchema = z.object({
  type: z.literal('DiceCountDisplay'),
  props: z.object({
    label: z.string().default('주사위'),
    bind: z.string().default('diceCount'),
    icon: z.string().default('🎲'),
  }),
});

/**
 * 타이머 표시 컴포넌트
 * bind: ArcheryHudState 의 timeLeft 키
 */
export const TimerDisplaySchema = z.object({
  type: z.literal('TimerDisplay'),
  props: z.object({
    bind: z.string().default('timeLeft'),
    icon: z.string().default('⏱'),
  }),
});

export type ScoreDisplay = z.infer<typeof ScoreDisplaySchema>;
export type RankDisplay = z.infer<typeof RankDisplaySchema>;
export type DiceCountDisplay = z.infer<typeof DiceCountDisplaySchema>;
export type TimerDisplay = z.infer<typeof TimerDisplaySchema>;

export const OperationalUiSchemas = {
  ScoreDisplay: ScoreDisplaySchema,
  RankDisplay: RankDisplaySchema,
  DiceCountDisplay: DiceCountDisplaySchema,
  TimerDisplay: TimerDisplaySchema,
};
