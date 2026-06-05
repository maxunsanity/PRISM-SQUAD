/** 세일 이벤트 공통 — 호스트(스퀘어) 보상·결제 타입 */

export type SalesRewardType =
  | 'energy'
  | 'meta_gold'
  | 'gems'
  | 'supply_key'
  | 'dna'
  | 'open_box'
  | 'equip_lv';

export type SalesRewardLine = {
  reward_type: SalesRewardType;
  reward_qty: number;
  reward_param?: string;
  label?: string;
};

export interface SalesHostBridge {
  grantRewards(lines: SalesRewardLine[]): string;
  trySpendCashKrw(amount: number): boolean;
  trySpendGems(amount: number): boolean;
  getWallet(): { cashKrw: number; gems: number; gold: number; energy: number };
}
