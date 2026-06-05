/**
 * 게임 밸런스·슬롯 라벨 — 추후 CSV/JSON 로 옮길 때 이 파일이 SSoT 역할.
 */

export const PHYSICS = {
  gravity: 0.35,
  airDrag: 0.998,
  restitution: 0.82,
  ballRadiusPx: 9,
  pegRadiusPx: 5,
};

/** 아래 슬롯 개수와 동일한 길이 권장 */
export const BIN_VALUES = [5, 15, 40, 15, 5];

export function binLabel(points) {
  return `+${points}`;
}
