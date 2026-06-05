import type { MallStepConfig } from './data';

export type MallStepLockState = 'LOCKED' | 'AVAILABLE' | 'CLAIMED';

export type MallStepView = MallStepConfig & {
  lock_state: MallStepLockState;
  reward_labels: string[];
  button_label: string;
};

type MallState = {
  '/mallMarvels/modalOpen': boolean;
  '/mallMarvels/timerText': string;
  '/mallMarvels/title': string;
  '/mallMarvels/introTip': string;
  '/mallMarvels/steps': MallStepView[];
  '/mallMarvels/hasFreeClaim': boolean;
};

const defaults: MallState = {
  '/mallMarvels/modalOpen': false,
  '/mallMarvels/timerText': '',
  '/mallMarvels/title': '',
  '/mallMarvels/introTip': '',
  '/mallMarvels/steps': [],
  '/mallMarvels/hasFreeClaim': false,
};

type Listener = () => void;

class MallMarvelsStore {
  private state = { ...defaults };
  private listeners = new Set<Listener>();

  subscribe = (cb: Listener) => {
    this.listeners.add(cb);
    return () => this.listeners.delete(cb);
  };

  getSnapshot = (): MallState => this.state;

  set<K extends keyof MallState>(key: K, value: MallState[K]) {
    this.state = { ...this.state, [key]: value };
    this.listeners.forEach(l => l());
  }

  setMany(patch: Partial<MallState>) {
    this.state = { ...this.state, ...patch };
    this.listeners.forEach(l => l());
  }
}

export const mallMarvelsStore = new MallMarvelsStore();
