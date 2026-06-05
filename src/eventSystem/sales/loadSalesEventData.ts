import { loadDriversJoyData, type DriversJoyData } from '../driversJoy/data';
import { loadMallMarvelsData, type MallMarvelsData } from '../mallMarvels/data';

export type SalesEventBundle = {
  mall: MallMarvelsData;
  drivers: DriversJoyData;
};

/** 세일 CSV SSoT — 실패 시 throw (코드 내장 폴백 없음) */
export async function loadAllSalesEventData(): Promise<SalesEventBundle> {
  const [mall, drivers] = await Promise.all([
    loadMallMarvelsData(),
    loadDriversJoyData(),
  ]);
  return { mall, drivers };
}
