export function rollInt(min, max) {
  const a = Math.ceil(min);
  const b = Math.floor(max);
  return Math.floor(Math.random() * (b - a + 1)) + a;
}

/**
 * @param {object} attemptRow — CSV row
 * @param {number} comboAfterRolls — combo_count after adding attempt_rolls
 * @param {object} eventRow — CSV row (bullseye_* columns)
 */
export function calculateScore(attemptRow, comboAfterRolls, eventRow) {
  const baseMin = Number(attemptRow.score_min);
  const baseMax = Number(attemptRow.score_max);
  const mult = Number(attemptRow.attempt_multiplier);
  const base = rollInt(baseMin, baseMax);
  let final = Math.floor(base * mult);

  const bBase = Number(eventRow.bullseye_base_prob);
  const bMax = Number(eventRow.bullseye_max_prob);
  const bInc = Number(eventRow.bullseye_combo_increment);
  const prob = Math.min(bMax, bBase + comboAfterRolls * bInc);

  if (Math.random() < prob) {
    return { score: 100, hit_zone: 'BULLSEYE' };
  }
  return { score: final, hit_zone: attemptRow.hit_zone };
}

export function attemptRolls(attemptType) {
  if (attemptType === 'SINGLE') return 1;
  if (attemptType === 'SET3') return 3;
  if (attemptType === 'SET5') return 5;
  return 1;
}

export function minDiceCost(attemptRows) {
  if (!attemptRows?.length) return 1;
  return Math.min(...attemptRows.map((r) => Number(r.cost_dice)));
}
