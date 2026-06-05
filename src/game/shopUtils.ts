import type { EnemyId } from './data';

/** 상점·스폰 유틸 (수치는 CSV — 여기는 헬퍼만) */

export function fmtKrw(n: number): string {
  return `₩${n.toLocaleString('ko-KR')}`;
}

export function pickWeighted<T extends { weight: number }>(
  table: readonly T[],
  pick: (row: T) => string,
  forceValue?: string,
): string {
  if (forceValue) return forceValue;
  const total = table.reduce((s, r) => s + r.weight, 0);
  if (total <= 0) return pick(table[0]);
  let roll = Math.random() * total;
  for (const row of table) {
    roll -= row.weight;
    if (roll <= 0) return pick(row);
  }
  return pick(table[table.length - 1]);
}

/** wave_config rate_* 4종 가중 랜덤 (합≠1이어도 비율대로) */
export function pickEnemyIdFromRates(
  rBasic: number,
  rDog: number,
  rBloater: number,
  rSpitter: number,
): EnemyId {
  const total = rBasic + rDog + rBloater + rSpitter;
  if (total <= 0) return 'basic';
  let r = Math.random() * total;
  if ((r -= rBasic) <= 0) return 'basic';
  if ((r -= rDog) <= 0) return 'dog';
  if ((r -= rBloater) <= 0) return 'bloater';
  return 'spitter';
}
