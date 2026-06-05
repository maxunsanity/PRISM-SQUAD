---
doc_generation: mdv4
---

# mallMarvels RECIPE_CODE

```typescript
import type { SalesHostBridge } from '../../sales/types';
import { hideEventMinigameForOverlay } from '../../../game/eventMinigameHost';
import { markRedDotSeen } from '../../../game/redDot/redDotSeen';
import { refreshRedDots } from '../../../game/redDot/RedDotService';
import type { MallMarvelsData, MallStepConfig } from '../data';
import { mallMarvelsStore, type MallStepLockState, type MallStepView } from '../store';

const LS_KEY = 'prism_mm_claimed_v1';
const LS_END_KEY = 'prism_mm_ends_at_v2';

function loadClaimed(): Set<number> {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) return new Set();
    const arr = JSON.parse(raw) as number[];
    return new Set(arr.filter(n => Number.isFinite(n)));
  } catch {
    return new Set();
  }
}

function saveClaimed(set: Set<number>) {
  localStorage.setItem(LS_KEY, JSON.stringify([...set]));
}

function ensureEndsAt(durationHours: number): number {
  const now = Date.now();
  try {
    const raw = localStorage.getItem(LS_END_KEY);
    if (raw) {
      const t = Number(raw);
      if (Number.isFinite(t) && t > now) return t;
    }
  } catch { /* ignore */ }
  const ends = now + durationHours * 3600 * 1000;
  localStorage.setItem(LS_END_KEY, String(ends));
  return ends;
}

function formatRemainMs(ms: number): string {
  if (ms <= 0) return '종료';
  const h = Math.floor(ms / 3600000);
  const m = Math.floor((ms % 3600000) / 60000);
  if (h >= 24) {
    const d = Math.floor(h / 24);
    const rh = h % 24;
    return `${d}일 ${rh}시간`;
  }
  if (h > 0) return `${h}시간 ${m}분`;
  return `${m}분`;
}

function buttonLabel(step: MallStepConfig): string {
  if (step.button_label_override.trim()) return step.button_label_override.trim();
  if (step.cost_type === 'FREE') return '무료';
  if (step.cost_type === 'GEMS') return `💎 ${step.gem_cost}`;
  return `₩${step.price_krw.toLocaleString()}`;
}

export class MallMarvelsController {
  private claimed = loadClaimed();
  private endsAt: number;
  private tickTimer: number | null = null;

  constructor(
    private data: MallMarvelsData,
    private host: SalesHostBridge,
  ) {
    this.endsAt = ensureEndsAt(data.duration_hours);
    this.refresh();
    this.tickTimer = window.setInterval(() => this.refreshTimerOnly(), 30_000);
  }

  dispose() {
    if (this.tickTimer !== null) window.clearInterval(this.tickTimer);
    this.tickTimer = null;
  }

  openModal() {
    hideEventMinigameForOverlay();
    markRedDotSeen('mall_new');
    mallMarvelsStore.set('/mallMarvels/modalOpen', true);
    this.refresh();
    refreshRedDots();
  }

  closeModal() {
    mallMarvelsStore.set('/mallMarvels/modalOpen', false);
  }

  private lockState(step: MallStepConfig): MallStepLockState {
    if (this.claimed.has(step.step_id)) return 'CLAIMED';
    const prereq = step.prereq_step_id;
    if (prereq > 0 && !this.claimed.has(prereq)) return 'LOCKED';
    return 'AVAILABLE';
  }

  private buildSteps(): MallStepView[] {
    return [...this.data.steps]
      .sort((a, b) => a.sort_order - b.sort_order)
      .map(step => {
        const rewards = this.data.rewardsByStep.get(step.step_id) ?? [];
        return {
          ...step,
          lock_state: this.lockState(step),
          reward_labels: rewards.map(r => r.label ?? `${r.reward_type} ${r.reward_qty}`),
          button_label: buttonLabel(step),
        };
      });
  }

  private hasFreeClaimable(steps: MallStepView[]): boolean {
    return steps.some(s => s.lock_state === 'AVAILABLE' && s.cost_type === 'FREE');
  }

  private refreshTimerOnly() {
    const ms = this.endsAt - Date.now();
    mallMarvelsStore.set('/mallMarvels/timerText', formatRemainMs(ms));
  }

  refresh() {
    const ms = this.endsAt - Date.now();
    const steps = this.buildSteps();
    mallMarvelsStore.setMany({
      '/mallMarvels/timerText': formatRemainMs(ms),
      '/mallMarvels/title': this.data.title,
      '/mallMarvels/introTip': this.data.intro_tip,
      '/mallMarvels/steps': steps,
      '/mallMarvels/hasFreeClaim': this.hasFreeClaimable(steps),
    });
  }

  claimStep(stepId: number): boolean {
    const step = this.data.steps.find(s => s.step_id === stepId);
    if (!step) return false;
    if (this.lockState(step) !== 'AVAILABLE') {
      window.dispatchEvent(new CustomEvent('lobby:toast', { detail: '아직 받을 수 없습니다' }));
      return false;
    }
    if (this.endsAt <= Date.now()) {
      window.dispatchEvent(new CustomEvent('lobby:toast', { detail: '이벤트가 종료되었습니다' }));
      return false;
    }

    if (step.cost_type === 'GEMS') {
      if (!this.host.trySpendGems(step.gem_cost)) {
        window.dispatchEvent(new CustomEvent('lobby:toast', { detail: `보석 부족 (필요 💎${step.gem_cost})` }));
        return false;
      }
    } else if (step.cost_type === 'CASH_KRW') {
      if (!this.host.trySpendCashKrw(step.price_krw)) {
        window.dispatchEvent(new CustomEvent('lobby:toast', { detail: '캐시 부족 · 상점에서 테스트 캐시 충전' }));
        return false;
      }
    }

    const lines = this.data.rewardsByStep.get(stepId) ?? [];
    const msg = this.host.grantRewards(lines);
    this.claimed.add(stepId);
    saveClaimed(this.claimed);
    this.refresh();
    refreshRedDots();
    window.dispatchEvent(new CustomEvent('lobby:toast', { detail: msg || '보상을 받았습니다' }));
    return true;
  }
}
```
