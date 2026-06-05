import type { MinigameCurrencyId } from '../data';

export type MinigameTargetType = 'normal' | 'boss';

export type MinigameCurrencySave = {
  lavaTickets?: number;
  prizeBalls?: number;
  bowStands?: number;
  archeryClaimPending?: boolean;
  killAccum?: Record<string, number>;
  starterGranted?: boolean;
};

export type MinigameKillGain = Partial<Record<MinigameCurrencyId, number>>;

export type MinigameCurrencyHudGain = MinigameKillGain & {
  ticketMultiplier?: number;
};
