import type { SalesRewardLine } from '../sales/types';

type DriversJoyState = {
  '/driversJoy/modalOpen': boolean;
  '/driversJoy/timerText': string;
  '/driversJoy/title': string;
  '/driversJoy/priceKrw': number;
  '/driversJoy/purchasesUsed': number;
  '/driversJoy/maxPurchase': number;
  '/driversJoy/remainingLabel': string;
  '/driversJoy/ctaLabel': string;
  '/driversJoy/ctaDisabled': boolean;
  '/driversJoy/rewards': SalesRewardLine[];
};

const defaults: DriversJoyState = {
  '/driversJoy/modalOpen': false,
  '/driversJoy/timerText': '',
  '/driversJoy/title': '',
  '/driversJoy/priceKrw': 0,
  '/driversJoy/purchasesUsed': 0,
  '/driversJoy/maxPurchase': 2,
  '/driversJoy/remainingLabel': '2/2 가능',
  '/driversJoy/ctaLabel': '₩4,400',
  '/driversJoy/ctaDisabled': false,
  '/driversJoy/rewards': [],
};

type Listener = () => void;

class DriversJoyStore {
  private state = { ...defaults };
  private listeners = new Set<Listener>();

  subscribe = (cb: Listener) => {
    this.listeners.add(cb);
    return () => this.listeners.delete(cb);
  };

  getSnapshot = (): DriversJoyState => this.state;

  set<K extends keyof DriversJoyState>(key: K, value: DriversJoyState[K]) {
    this.state = { ...this.state, [key]: value };
    this.listeners.forEach(l => l());
  }

  setMany(patch: Partial<DriversJoyState>) {
    this.state = { ...this.state, ...patch };
    this.listeners.forEach(l => l());
  }
}

export const driversJoyStore = new DriversJoyStore();
