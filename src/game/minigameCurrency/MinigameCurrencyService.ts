/**
 * MinigameCurrencyService — 퍼즐/양궁 재화 (스퀘어 사냥 → 호스트 재화)
 * 라바는 단독 iframe — 이 서비스 대상 아님
 */
import type { GameData, MinigameAcquireConfig, MinigameCurrencyId, MinigameKillRewardConfig } from '../data';
import { hudStore } from '../hudExternalStore';
import { refreshRedDots } from '../redDot/RedDotService';
import type { MinigameCurrencySave, MinigameKillGain, MinigameTargetType } from './types';

const LEGACY_ARCHERY_KEY = 'prism_archery_host_v1';

function accumKey(id: MinigameCurrencyId, target: MinigameTargetType): string {
  return `${id}:${target}`;
}

const SQUARE_CURRENCY_IDS: MinigameCurrencyId[] = ['prize', 'archery'];

function baseFor(id: MinigameCurrencyId, row: MinigameKillRewardConfig): number {
  if (id === 'prize') return row.prize_base;
  return row.archery_base;
}

export class MinigameCurrencyService {
  private prizeBalls = 0;
  private bowStands = 0;
  private archeryClaimPending = false;
  private killAccum = new Map<string, number>();
  private starterGranted = false;

  constructor(private readonly data: GameData) {}

  private ct(key: string, def: number): number {
    return this.data.combatTuning.get(key) ?? def;
  }

  private starterBows(): number {
    return Math.max(0, Math.floor(this.ct('archery_starter_bows', 5)));
  }

  private resolveKillReward(enemyId: string): MinigameKillRewardConfig {
    const map = this.data.minigameKillRewards;
    return map.get(enemyId)
      ?? map.get('mini_boss')
      ?? map.get('basic')
      ?? { enemy_id: 'basic', lava_base: 1, prize_base: 1, archery_base: 1, is_boss: false };
  }

  private getKillsRequired(id: MinigameCurrencyId, target: MinigameTargetType): number {
    const rows = this.data.minigameAcquire.get(id) ?? [];
    const found = rows.find(r => r.target_type === target);
    return found?.kills_required ?? 1;
  }

  private isMinigameEnabled(id: MinigameCurrencyId): boolean {
    const host = this.data.eventMinigames.find(m => m.id === id);
    return host?.enabled !== false;
  }

  private grantAmount(base: number, mult: number): number {
    const b = base > 0 ? base : 1;
    return Math.max(1, Math.floor(b * Math.max(1, mult)));
  }

  /** 영구 저장 복원 */
  applySave(patch: MinigameCurrencySave | undefined) {
    if (!patch) return;
    if (typeof patch.prizeBalls === 'number') this.prizeBalls = Math.max(0, patch.prizeBalls);
    if (typeof patch.bowStands === 'number') this.bowStands = Math.max(0, patch.bowStands);
    if (typeof patch.archeryClaimPending === 'boolean') this.archeryClaimPending = patch.archeryClaimPending;
    if (typeof patch.starterGranted === 'boolean') this.starterGranted = patch.starterGranted;
    if (patch.killAccum) {
      this.killAccum.clear();
      for (const [k, v] of Object.entries(patch.killAccum)) {
        if (Number.isFinite(v)) this.killAccum.set(k, Math.max(0, Math.floor(v)));
      }
    }
  }

  /** prism_archery_host_v1 → 통합 저장 마이그레이션 */
  migrateLegacyArchery() {
    try {
      const raw = localStorage.getItem(LEGACY_ARCHERY_KEY);
      if (!raw) return;
      const d = JSON.parse(raw) as MinigameCurrencySave & { killsTowardBow?: number; starterV2?: boolean };
      if (typeof d.bowStands === 'number' && d.bowStands > this.bowStands) {
        this.bowStands = d.bowStands;
      }
      if (typeof d.archeryClaimPending === 'boolean') {
        this.archeryClaimPending = d.archeryClaimPending;
      }
      const toward = Number(d.killsTowardBow ?? 0);
      if (toward > 0) {
        const req = this.getKillsRequired('archery', 'normal');
        this.killAccum.set(accumKey('archery', 'normal'), Math.min(req - 1, toward));
      }
      if (d.starterGranted || d.starterV2) this.starterGranted = true;
    } catch { /* ignore */ }
  }

  ensureStarterCurrency() {
    const starter = this.starterBows();
    if (!this.starterGranted && !this.archeryClaimPending && this.bowStands < starter) {
      this.bowStands = starter;
      this.starterGranted = true;
    }
  }

  toSavePayload(): MinigameCurrencySave {
    const killAccum: Record<string, number> = {};
    for (const [k, v] of this.killAccum) killAccum[k] = v;
    return {
      prizeBalls: this.prizeBalls,
      bowStands: this.bowStands,
      archeryClaimPending: this.archeryClaimPending,
      killAccum,
      starterGranted: this.starterGranted,
    };
  }

  getPrizeBalls() { return this.prizeBalls; }
  getBowStands() { return this.bowStands; }
  getArcheryClaimPending() { return this.archeryClaimPending; }

  getKillsToward(id: MinigameCurrencyId): number {
    return this.killAccum.get(accumKey(id, 'normal')) ?? 0;
  }

  getKillsRequiredFor(id: MinigameCurrencyId): number {
    return this.getKillsRequired(id, 'normal');
  }

  getAcquireRows(id: MinigameCurrencyId): MinigameAcquireConfig[] {
    return this.data.minigameAcquire.get(id) ?? [];
  }

  /** 스퀘어 적 처치 — EventController.onEnemyKilled 와 동일 누적식 */
  onEnemyKilled(enemyId: string, ticketMultiplier: number): MinigameKillGain {
    const rewardRow = this.resolveKillReward(enemyId);
    const mult = Math.max(1, ticketMultiplier);
    const target: MinigameTargetType =
      enemyId === 'final_boss' || rewardRow.is_boss ? 'boss' : 'normal';

    const gains: MinigameKillGain = {};
    for (const id of SQUARE_CURRENCY_IDS) {
      if (!this.isMinigameEnabled(id)) continue;
      const acquireRows = this.data.minigameAcquire.get(id);
      if (!acquireRows?.some(r => r.target_type === target)) continue;

      const base = baseFor(id, rewardRow);
      if (base <= 0) continue;

      const req = this.getKillsRequired(id, target);
      const key = accumKey(id, target);
      const current = (this.killAccum.get(key) ?? 0) + 1;

      if (current >= req) {
        this.killAccum.set(key, 0);
        const amount = this.grantAmount(base, mult);
        gains[id] = (gains[id] ?? 0) + amount;
        if (id === 'prize') this.prizeBalls += amount;
        else this.bowStands += amount;
      } else {
        this.killAccum.set(key, current);
      }
    }

    this.syncHud();
    if (Object.keys(gains).length > 0) {
      refreshRedDots();
      window.dispatchEvent(new CustomEvent('minigame:currencyGain', {
        detail: { gains, ticketMultiplier: mult },
      }));
    }

    return gains;
  }

  /** 스테이지 클리어 보너스 (승리) */
  onStageClear(ticketMultiplier: number): MinigameKillGain {
    const mult = Math.max(1, ticketMultiplier);
    const gains: MinigameKillGain = {};
    const prizeBonus = Math.max(0, Math.floor(this.ct('stage_clear_prize_bonus', 1) * mult));

    if (this.isMinigameEnabled('prize') && prizeBonus > 0) {
      this.prizeBalls += prizeBonus;
      gains.prize = prizeBonus;
    }

    if (Object.keys(gains).length > 0) {
      this.syncHud();
      refreshRedDots();
      window.dispatchEvent(new CustomEvent('minigame:currencyChanged'));
    }
    return gains;
  }

  consumeBow(): boolean {
    if (this.bowStands < 1) return false;
    this.bowStands -= 1;
    this.syncHud();
    refreshRedDots();
    window.dispatchEvent(new CustomEvent('minigame:currencyChanged'));
    return true;
  }

  /** 이식 지갑 계약 — iframe(퍼즐)이 자체 소비 후 통지한 잔액을 호스트가 저장 */
  setPrizeBalls(balance: number) {
    this.prizeBalls = Math.max(0, Math.floor(Number(balance) || 0));
    this.syncHud();
    refreshRedDots();
    window.dispatchEvent(new CustomEvent('minigame:currencyChanged'));
  }

  /** 이식 지갑 계약 — iframe(양궁)이 자체 소비(발)한 잔액을 호스트가 저장 */
  setBowStands(balance: number) {
    this.bowStands = Math.max(0, Math.floor(Number(balance) || 0));
    this.syncHud();
    refreshRedDots();
    window.dispatchEvent(new CustomEvent('minigame:currencyChanged'));
  }

  /** iframe 입장 티켓 차감 */
  tryConsume(id: MinigameCurrencyId, amount: number): boolean {
    const cost = Math.max(1, amount);
    if (id === 'prize') {
      if (this.prizeBalls < cost) return false;
      this.prizeBalls -= cost;
    } else {
      return true;
    }
    this.syncHud();
    refreshRedDots();
    window.dispatchEvent(new CustomEvent('minigame:currencyChanged'));
    return true;
  }

  setArcheryClaimPending(pending: boolean) {
    this.archeryClaimPending = pending;
    this.syncHud();
    refreshRedDots();
    window.dispatchEvent(new CustomEvent('minigame:currencyChanged'));
  }

  syncHud() {
    const archeryReq = this.getKillsRequired('archery', 'normal');
    hudStore.setMany({
      '/lobby/prizeBalls': this.prizeBalls,
      '/lobby/archeryBowStands': this.bowStands,
      '/lobby/prizeKillsToward': this.getKillsToward('prize'),
      '/lobby/prizeKillsRequired': this.getKillsRequired('prize', 'normal'),
      '/archery/killsTowardBow': this.getKillsToward('archery'),
      '/archery/killsPerBow': archeryReq,
      '/archery/claimPending': this.archeryClaimPending,
      '/event/redDot/archery': this.archeryClaimPending,
    });
  }
}

let instance: MinigameCurrencyService | null = null;

export function initMinigameCurrencyService(data: GameData): MinigameCurrencyService {
  instance = new MinigameCurrencyService(data);
  return instance;
}

export function getMinigameCurrencyService(): MinigameCurrencyService | null {
  return instance;
}
