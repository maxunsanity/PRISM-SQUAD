export type ArcheryHudState = {
  myScore: number;
  myRank: number;
  diceCount: number;
  timeLeft: string;
  phase: string;
};

const DEFAULT: ArcheryHudState = {
  myScore: 0,
  myRank: 50,
  diceCount: 20,
  timeLeft: '01:00',
  phase: 'lobby',
};

let _state: ArcheryHudState = { ...DEFAULT };
let _listeners: Array<() => void> = [];

export function pushHudState(partial: Partial<ArcheryHudState>): void {
  _state = { ..._state, ...partial };
  _listeners.forEach(fn => fn());
}

export const hudExternalStore = {
  getSnapshot: () => _state,
  subscribe: (fn: () => void) => {
    _listeners.push(fn);
    return () => { _listeners = _listeners.filter(l => l !== fn); };
  },
};
