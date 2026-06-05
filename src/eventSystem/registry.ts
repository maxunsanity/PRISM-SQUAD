/**
 * eventSystem/registry.ts — 등록된 이벤트 모듈 목록 (코드 레벨)
 * 새 이벤트 추가 시 여기에 한 줄만 추가
 */
import * as tycoonSeason from './tycoonSeason';
import * as mallMarvels from './mallMarvels';
import * as driversJoy from './driversJoy';

export type EventModule = typeof tycoonSeason;

export const EVENT_REGISTRY: Record<string, EventModule | typeof mallMarvels | typeof driversJoy> = {
  tycoon_season: tycoonSeason,
  mall_marvels: mallMarvels,
  drivers_joy: driversJoy,
};
