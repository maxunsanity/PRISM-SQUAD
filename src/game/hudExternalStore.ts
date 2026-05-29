/**
 * hudExternalStore.ts — $state 브릿지
 * $state 경로 수정 시 반드시 동시 패치:
 *   1) 이 파일 키  2) prismHudSpec.ts $state 문자열  3) registry.tsx
 */

type HudState = {
  '/lobby/visible': boolean;
  '/scene/transitionVisible': boolean;
  '/scene/transitionText': string;
  '/hud/timer': string;
  '/hud/stage': number;
  '/hud/expPct': number;
  '/hud/level': number;
  '/hud/killCount': number;
  '/hud/gold': number;
  '/hud/hpPct': number;
  '/hud/bossHpPct': number;
  '/hud/bossVisible': boolean;
  '/hud/bossName': string;
  '/hud/bossWarningVisible': boolean;
  '/hud/activeSkillSlots': string[];
  '/hud/passiveSkillSlots': string[];
  '/modal/visible': boolean;
  '/modal/cards': SkillCardData[];
  '/result/visible': boolean;
  '/result/isVictory': boolean;
  '/result/killCount': number;
  '/result/survivalTime': string;
  '/result/finalLevel': number;
  '/result/totalXpEarned': number;
  '/result/goldEarned': number;
  '/vfx/flashOpacity': number;
  '/vfx/flashColor': string;
};

export interface SkillCardData {
  skill_id: string;
  skill_name: string;
  icon: string;
  description: string;
  current_level: number;
  max_level: number;
  is_new: boolean;
  is_evolution?: boolean;
}

type Listener = () => void;

class HudExternalStore {
  private state: HudState = {
    '/lobby/visible': true,
    '/scene/transitionVisible': false,
    '/scene/transitionText': 'STAGE 1',
    '/hud/timer': '00:00',
    '/hud/stage': 1,
    '/hud/expPct': 0,
    '/hud/level': 1,
    '/hud/killCount': 0,
    '/hud/gold': 0,
    '/hud/hpPct': 100,
    '/hud/bossHpPct': 100,
    '/hud/bossVisible': false,
    '/hud/bossName': '',
    '/hud/bossWarningVisible': false,
    '/hud/activeSkillSlots': [],
    '/hud/passiveSkillSlots': [],
    '/modal/visible': false,
    '/modal/cards': [],
    '/result/visible': false,
    '/result/isVictory': false,
    '/result/killCount': 0,
    '/result/survivalTime': '00:00',
    '/result/finalLevel': 1,
    '/result/totalXpEarned': 0,
    '/result/goldEarned': 0,
    '/vfx/flashOpacity': 0,
    '/vfx/flashColor': '#ffffff',
  };

  private listeners = new Set<Listener>();

  get<K extends keyof HudState>(path: K): HudState[K] {
    return this.state[path];
  }

  set<K extends keyof HudState>(path: K, value: HudState[K]): void {
    this.state = { ...this.state, [path]: value };
    this._notify();
  }

  setMany(patch: Partial<HudState>): void {
    this.state = { ...this.state, ...patch };
    this._notify();
  }

  subscribe(fn: Listener): () => void {
    this.listeners.add(fn);
    return () => this.listeners.delete(fn);
  }

  getSnapshot(): HudState {
    return this.state;
  }

  private _notify(): void {
    this.listeners.forEach(fn => fn());
  }
}

export const hudStore = new HudExternalStore();

/** React useSyncExternalStore 어댑터 — registry.tsx에서 직접 사용 */
export type { HudState };
