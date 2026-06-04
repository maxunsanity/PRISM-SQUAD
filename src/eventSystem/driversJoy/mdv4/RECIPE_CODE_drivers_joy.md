---
doc_generation: mdv4
---

# driversJoy RECIPE_CODE

```typescript
import type { SalesHostBridge } from '../../sales/types';
import { hideEventMinigameForOverlay } from '../../../game/eventMinigameHost';
import type { DriversJoyData } from '../data';
import { driversJoyStore } from '../store';

const LS_PURCHASES = 'prism_dj_purchases_v1';
const LS_END_KEY = 'prism_dj_ends_at_v1';

function loadPurchases(): number {
  try {
    const n = Number(localStorage.getItem(LS_PURCHASES));
    return Number.isFinite(n) && n >= 0 ? Math.floor(n) : 0;
  } catch {
    return 0;
  }
}

function savePurchases(n: number) {
  localStorage.setItem(LS_PURCHASES, String(n));
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
  if (h > 0) return `${h}시간 ${m}분`;
  return `${m}분`;
}

export class DriversJoyController {
  private purchasesUsed = loadPurchases();
  private endsAt: number;
  private tickTimer: number | null = null;

  constructor(
    private data: DriversJoyData,
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
    driversJoyStore.set('/driversJoy/modalOpen', true);
    this.refresh();
  }

  closeModal() {
    driversJoyStore.set('/driversJoy/modalOpen', false);
  }

  private soldOut(): boolean {
    return this.purchasesUsed >= this.data.max_purchase_per_player;
  }

  private expired(): boolean {
    return this.endsAt <= Date.now();
  }

  private refreshTimerOnly() {
    driversJoyStore.set('/driversJoy/timerText', formatRemainMs(this.endsAt - Date.now()));
  }

  refresh() {
    const remaining = Math.max(0, this.data.max_purchase_per_player - this.purchasesUsed);
    const sold = this.soldOut();
    const expired = this.expired();
    let ctaLabel = `₩${this.data.price_krw.toLocaleString()}`;
    let ctaDisabled = false;
    if (expired) {
      ctaLabel = '이벤트 종료';
      ctaDisabled = true;
    } else if (sold) {
      ctaLabel = '매진';
      ctaDisabled = true;
    }

    driversJoyStore.setMany({
      '/driversJoy/timerText': formatRemainMs(this.endsAt - Date.now()),
      '/driversJoy/title': this.data.title,
      '/driversJoy/priceKrw': this.data.price_krw,
      '/driversJoy/purchasesUsed': this.purchasesUsed,
      '/driversJoy/maxPurchase': this.data.max_purchase_per_player,
      '/driversJoy/remainingLabel': `${remaining}/${this.data.max_purchase_per_player} 가능`,
      '/driversJoy/ctaLabel': ctaLabel,
      '/driversJoy/ctaDisabled': ctaDisabled,
      '/driversJoy/rewards': this.data.rewards,
    });
  }

  canShowTab(): boolean {
    return !this.expired();
  }

  hasPurchaseAvailable(): boolean {
    return !this.expired() && !this.soldOut();
  }

  purchase(): boolean {
    if (this.expired()) {
      window.dispatchEvent(new CustomEvent('lobby:toast', { detail: '이벤트가 종료되었습니다' }));
      return false;
    }
    if (this.soldOut()) {
      window.dispatchEvent(new CustomEvent('lobby:toast', { detail: '구매 횟수를 모두 사용했습니다' }));
      return false;
    }
    if (!this.host.trySpendCashKrw(this.data.price_krw)) {
      window.dispatchEvent(new CustomEvent('lobby:toast', { detail: '캐시 부족 · 상점에서 테스트 캐시 충전' }));
      return false;
    }
    const msg = this.host.grantRewards(this.data.rewards);
    this.purchasesUsed += 1;
    savePurchases(this.purchasesUsed);
    this.refresh();
    window.dispatchEvent(new CustomEvent('lobby:toast', { detail: msg || '구매 완료' }));
    return true;
  }
}
```
