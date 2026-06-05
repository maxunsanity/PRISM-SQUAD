import type { GameCore } from '../../game/GameCore';
import type { SalesHostBridge, SalesRewardLine } from './types';

export function createPrismSalesHost(core: GameCore): SalesHostBridge {
  return {
    grantRewards: (lines: SalesRewardLine[]) => core.grantSalesRewards(lines),
    trySpendCashKrw: (amount: number) => core.trySpendSalesCashKrw(amount),
    trySpendGems: (amount: number) => core.trySpendSalesGems(amount),
    getWallet: () => core.getSalesWallet(),
  };
}
