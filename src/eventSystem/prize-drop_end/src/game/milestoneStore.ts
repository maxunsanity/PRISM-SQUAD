import { hudStore } from './hudExternalStore';

export type MilestoneSnapshot = {
  sessionLightning: number;
  milestoneStep: number;
  milestoneThresholds: number[];
  lastGain: number;
  showGain: boolean;
  cycleCount: number;
};

let _gainTimer: ReturnType<typeof setTimeout> | null = null;

export const milestoneStore = {
  getSnapshot(): MilestoneSnapshot {
    const s = hudStore.getSnapshot();
    return {
      sessionLightning: s['/hud/session_lightning'] as number,
      milestoneStep: s['/hud/milestone_step'] as number,
      milestoneThresholds: s['/hud/milestone_thresholds'] as number[],
      lastGain: s['/hud/last_gain'] as number,
      showGain: s['/hud/show_gain'] as boolean,
      cycleCount: s['/hud/cycle_count'] as number,
    };
  },
  subscribe(listener: () => void): () => void {
    return hudStore.subscribe(listener);
  },
  update(partial: Partial<MilestoneSnapshot>) {
    const patch: Record<string, unknown> = {};
    if ('sessionLightning' in partial) patch['/hud/session_lightning'] = partial.sessionLightning;
    if ('milestoneStep' in partial) patch['/hud/milestone_step'] = partial.milestoneStep;
    if ('milestoneThresholds' in partial) patch['/hud/milestone_thresholds'] = partial.milestoneThresholds;
    if ('lastGain' in partial) patch['/hud/last_gain'] = partial.lastGain;
    if ('showGain' in partial) patch['/hud/show_gain'] = partial.showGain;
    if ('cycleCount' in partial) patch['/hud/cycle_count'] = partial.cycleCount;
    hudStore.update(patch);
  },
  showGainBadge(amount: number) {
    if (_gainTimer) clearTimeout(_gainTimer);
    hudStore.update({ '/hud/last_gain': amount, '/hud/show_gain': true });
    _gainTimer = setTimeout(() => {
      hudStore.update({ '/hud/show_gain': false });
    }, 1500);
  },
};
