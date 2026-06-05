/**
 * Prize Drop Data Paths (SSoT)
 */
export const DATA_PATHS = {
  SLOT_LIGHTNING: './game_data/01_slot_lightning.csv',
  MULTIPLIER: './game_data/02_multiplier.csv',
  MILESTONE: './game_data/03_milestone.csv',
  BOARD_OBSTACLE: './game_data/04_board_obstacle.csv',
} as const;

export type DataKey = keyof typeof DATA_PATHS;
