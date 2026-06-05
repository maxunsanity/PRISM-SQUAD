import type { GameCore } from '../../game/GameCore';
import { DriversJoyController } from '../driversJoy/core/DriversJoyController';
import { MallMarvelsController } from '../mallMarvels/core/MallMarvelsController';
import { createPrismSalesHost } from './createPrismSalesHost';
import type { SalesEventBundle } from './loadSalesEventData';

let mallCtrl: MallMarvelsController | null = null;
let driversCtrl: DriversJoyController | null = null;
let activeBundle: SalesEventBundle | null = null;

export function bindSalesToCore(core: GameCore, bundle?: SalesEventBundle) {
  unbindSales();
  const b = bundle ?? activeBundle;
  if (!b) return;
  activeBundle = b;
  const host = createPrismSalesHost(core);
  mallCtrl = new MallMarvelsController(b.mall, host);
  driversCtrl = new DriversJoyController(b.drivers, host);
}

export function unbindSales() {
  mallCtrl?.dispose();
  driversCtrl?.dispose();
  mallCtrl = null;
  driversCtrl = null;
}

export function getMallMarvelsController() {
  return mallCtrl;
}

export function getDriversJoyController() {
  return driversCtrl;
}

export function getActiveSalesBundle(): SalesEventBundle | null {
  return activeBundle;
}

/** CSV 로드 후 컨트롤러 재바인딩 (진행도 localStorage 유지) */
export function rebindSalesFromBundle(core: GameCore, bundle: SalesEventBundle) {
  bindSalesToCore(core, bundle);
}
