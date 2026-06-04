---
doc_generation: mdv4
condense_policy: forbidden
---

# Tycoon Season — RECIPE_CODE (v4 source)

## EventBridge.ts (full)

```typescript
import type { EventData } from '../data';
import { EventController } from '../core/EventController';

/**
 * 스퀘어(탕탕) 호스트 ↔ 이벤트 모듈 얇은 연결층.
 */
export class EventBridge {
  private ctrl: EventController;
  private unbind: (() => void) | null = null;
  public onRewardGranted?: (bundleId: string) => void;

  constructor(data: EventData) {
    this.ctrl = new EventController(data);
    this.ctrl.onRewardGranted = (bundleId) => {
      this.onRewardGranted?.(bundleId);
    };
    const onCloseMilestone = () => this.ctrl.dismissMilestonePopup();
    const onToggleMilestoneList = () => this.ctrl.toggleMilestoneList();
    const onToggleTournament = () => this.ctrl.toggleTournamentPanel();
    const onCloseTournament = () => this.ctrl.dismissTournamentPanel();
    const onCloseSettlement = () => this.ctrl.dismissSettlement();
    const onOpenHelp = (e: Event) => {
      const kind = (e as CustomEvent).detail as 'tycoon' | 'season';
      if (kind === 'tycoon' || kind === 'season') this.ctrl.openHelp(kind);
    };
    const onCloseHelp = () => this.ctrl.dismissHelp();
    const onToggleExpress = () => this.ctrl.toggleExpressPanel();
    const onCloseExpress = () => this.ctrl.dismissExpressPanel();

    window.addEventListener('event:closeMilestonePopup', onCloseMilestone);
    window.addEventListener('event:toggleMilestoneList', onToggleMilestoneList);
    window.addEventListener('event:toggleTournamentPanel', onToggleTournament);
    window.addEventListener('event:closeTournamentPanel', onCloseTournament);
    window.addEventListener('event:closeSettlement', onCloseSettlement);
    window.addEventListener('event:openHelp', onOpenHelp);
    window.addEventListener('event:closeHelp', onCloseHelp);
    window.addEventListener('event:toggleExpressPanel', onToggleExpress);
    window.addEventListener('event:closeExpress', onCloseExpress);

    this.unbind = () => {
      window.removeEventListener('event:closeMilestonePopup', onCloseMilestone);
      window.removeEventListener('event:toggleMilestoneList', onToggleMilestoneList);
      window.removeEventListener('event:toggleTournamentPanel', onToggleTournament);
      window.removeEventListener('event:closeTournamentPanel', onCloseTournament);
      window.removeEventListener('event:closeSettlement', onCloseSettlement);
      window.removeEventListener('event:openHelp', onOpenHelp);
      window.removeEventListener('event:closeHelp', onCloseHelp);
      window.removeEventListener('event:toggleExpressPanel', onToggleExpress);
      window.removeEventListener('event:closeExpress', onCloseExpress);
    };
  }

  dispose() {
    this.unbind?.();
    this.unbind = null;
  }

  /** 입장 배수 확정 시 호출 — UI(×N 칩)가 첫 처치 전에도 맞게 표시 */
  syncTicketMultiplier(ticketMultiplier: number) {
    this.ctrl.syncTicketMultiplier(ticketMultiplier);
  }

  onEnemyKilled(enemyId: string, ticketMultiplier: number) {
    this.ctrl.onEnemyKilled(enemyId, ticketMultiplier);
  }

  tick(dt: number) {
    this.ctrl.tick(dt);
  }

  getTycoonPoints() {
    return this.ctrl.getPoints();
  }

  getSeasonCoins() {
    return this.ctrl.getSeasonCoins();
  }
}
```

## EventController.ts (full)

```typescript
import type { EventData, EventMilestoneConfig } from '../data';
import { eventStore } from '../store/eventExternalStore';
import { BotSimulator } from './BotSimulator';
import { scaleRewardQtyLabel } from './rewardLabelScale';

const PLAYER_NAME = '나';

export class EventController {
  public onRewardGranted?: (bundleId: string) => void;
  private tycoonPoints = 0;
  private seasonPoints = 0;
  private seasonCoins = 0;
  private classLevel = 1;
  /** 이벤트 전체 종료( duration_hours ) */
  private eventEndSec = 72 * 3600;
  /** 타이쿤 UI 주기 타이머 — tick_min(분) */
  private tycoonCycleSec = 0;
  private tycoonCyclePeriod = 10 * 60;
  /** 시즌/익스프레스 UI·봇 주기 — tick_min(분) */
  private seasonCycleSec = 0;
  private seasonCyclePeriod = 30 * 60;
  private milestones: EventMilestoneConfig[] = [];
  private claimedSteps = new Set<number>();
  private seasonMilestones: EventMilestoneConfig[] = [];
  private claimedSeasonSteps = new Set<number>();
  private tycoonKills = new Map<string, number>();
  private seasonKills = new Map<string, number>();
  private pendingMilestonePopups: EventMilestoneConfig[] = [];
  private botSim: BotSimulator;
  private tournamentActive = false;
  private tournamentEventId = 0;
  private tournamentSettled = false;

  constructor(private data: EventData) {
    this.botSim = new BotSimulator(data);
    this.bootstrap();
  }

  private bootstrap() {
    let maxHours = 72;
    const tycoon = this.data.tycoonEvent;
    const season = this.data.seasonEvent;
    if (tycoon) {
      maxHours = Math.max(maxHours, tycoon.duration_hours);
      this.tycoonCyclePeriod = Math.max(1, tycoon.tick_min) * 60;
      this.tycoonCycleSec = this.tycoonCyclePeriod;
      this.milestones = this.data.milestones.get(tycoon.milestone_group_id) ?? [];
      eventStore.setMany({
        '/event/visible': true,
        '/event/name': tycoon.event_name,
        '/event/kind': tycoon.event_kind,
        '/event/themeKey': tycoon.theme_key,
        '/event/currencyAssetKey': tycoon.currency_asset_key,
        '/event/tycoonBadgeLabel': '타이쿤',
      });
    }
    if (season) {
      maxHours = Math.max(maxHours, season.duration_hours);
      this.tournamentEventId = season.event_id;
      const groupSize = Number(this.data.tournament.get('group_size') ?? season.group_size ?? 50);
      const botCount = Math.max(0, groupSize - 1);
      this.seasonCyclePeriod = Math.max(1, season.tick_min) * 60;
      this.seasonCycleSec = this.seasonCyclePeriod;
      this.botSim.start(botCount, this.data.botNames);
      this.tournamentActive = true;
      const cls = this.data.seasonClasses.find(c => c.class_level === this.classLevel);
      eventStore.setMany({
        '/event/tournamentVisible': true,
        '/event/seasonName': season.event_name,
        '/event/seasonThemeKey': season.theme_key,
        '/event/seasonCurrencyAssetKey': season.currency_asset_key,
        '/event/seasonGroupSize': groupSize,
        '/event/seasonBadgeLabel': '시즌',
        '/event/className': cls?.class_name ?? '',
        '/event/classLevel': this.classLevel,
        '/event/classSubtitle': this.buildClassSubtitle(),
      });
    }
    const express = this.data.expressEvent;
    if (express) {
      this.seasonMilestones = this.data.milestones.get(express.milestone_group_id) ?? [];
      maxHours = Math.max(maxHours, express.duration_hours);
      this.tournamentEventId = express.event_id;
      const groupSize = Number(this.data.tournament.get('group_size') ?? express.group_size ?? 50);
      const botCount = Math.max(0, groupSize - 1);
      this.seasonCyclePeriod = Math.max(1, express.tick_min) * 60;
      this.seasonCycleSec = this.seasonCyclePeriod;
      this.botSim.start(botCount, this.data.botNames);
      this.tournamentActive = true;
      const cls = this.data.seasonClasses.find(c => c.class_level === this.classLevel);
      const conf = this.data.expressConfigs.find(c => c.event_id === express.event_id);
      
      eventStore.setMany({
        '/event/tournamentVisible': false, // 익스프레스 활성화 시 토너먼트 가시성 끄기
        '/event/expressTabVisible': true,
        '/event/expressName': express.event_name,
        '/event/expressTitle': express.event_name,
        '/event/expressRewardAssetKey': conf?.reward_asset_key || 'reward_dice',
        '/event/expressRewardLabel': '대박 보상',
        '/event/seasonName': express.event_name,
        '/event/seasonThemeKey': express.theme_key,
        '/event/seasonCurrencyAssetKey': express.currency_asset_key,
        '/event/seasonGroupSize': groupSize,
        '/event/className': cls?.class_name ?? '',
        '/event/classLevel': this.classLevel,
        '/event/classSubtitle': this.buildClassSubtitle(),
      });
    }
    this.eventEndSec = maxHours * 3600;
    this.syncHud();
  }

  syncTicketMultiplier(ticketMultiplier: number) {
    eventStore.set('/event/ticketMultiplier', Math.max(1, ticketMultiplier));
    this.syncHud();
  }

  private ticketMultForLabels(): number {
    return Math.max(1, Math.floor(eventStore.get('/event/ticketMultiplier') ?? 1));
  }

  private scaleLabel(label: string): string {
    return scaleRewardQtyLabel(label, this.ticketMultForLabels());
  }

  private getKillsRequired(eventKind: string, targetType: string): number {
    const list = this.data.helpAcquireByKind.get(eventKind as any) ?? [];
    const found = list.find(row => row.target_type === targetType);
    return found ? found.kills_required : 1;
  }

  onEnemyKilled(enemyId: string, ticketMultiplier: number) {
    let rewardRow = this.data.killRewards.get(enemyId);
    if (!rewardRow) rewardRow = this.data.killRewards.get('mini_boss');
    if (!rewardRow) rewardRow = this.data.killRewards.get('basic');
    if (!rewardRow) return;

    const mult = Math.max(1, ticketMultiplier);
    const isBoss = enemyId === 'final_boss' || rewardRow.is_boss;
    const targetType = isBoss ? 'boss' : 'normal';

    let finalTycoonGain = 0;
    let finalSeasonGain = 0;

    // 1. 타이쿤 킬수 누적 및 포인트 지급
    if (this.data.tycoonEvent) {
      const tycoonReq = this.getKillsRequired(this.data.tycoonEvent.event_kind, targetType);
      const currentKills = (this.tycoonKills.get(targetType) ?? 0) + 1;
      if (currentKills >= tycoonReq) {
        this.tycoonKills.set(targetType, 0); // 초기화
        const tycoonGainBase = rewardRow.tycoon_point_base > 0 ? rewardRow.tycoon_point_base : 1;
        finalTycoonGain = Math.max(1, Math.floor(tycoonGainBase * mult));
        this.tycoonPoints += finalTycoonGain;
      } else {
        this.tycoonKills.set(targetType, currentKills);
      }
    }

    // 2. 시즌 킬수 누적 및 포인트 지급
    const activeSeasonEvent = this.data.seasonEvent || this.data.expressEvent;
    if (activeSeasonEvent) {
      const seasonReq = this.getKillsRequired(activeSeasonEvent.event_kind, targetType);
      const currentKills = (this.seasonKills.get(targetType) ?? 0) + 1;
      if (currentKills >= seasonReq) {
        this.seasonKills.set(targetType, 0); // 초기화
        const seasonGainBase = rewardRow.season_point_base > 0 ? rewardRow.season_point_base : 1;
        finalSeasonGain = Math.max(1, Math.floor(seasonGainBase * mult));
        this.seasonPoints += finalSeasonGain;
      } else {
        this.seasonKills.set(targetType, currentKills);
      }
    }

    // 3. 적립 포인트가 있을 때만 이펙트 및 HUD 상태 갱신
    if (finalTycoonGain > 0 || finalSeasonGain > 0) {
      const tycoonClaimed = this.checkTycoonMilestones();
      eventStore.setMany({
        '/event/ticketMultiplier': mult,
        '/event/lastTpGain': finalTycoonGain,
        '/event/lastSeasonGain': finalSeasonGain,
      });
      for (const m of tycoonClaimed) {
        const next = this.nextMilestone();
        window.dispatchEvent(new CustomEvent('event:tycoonMilestoneComplete', {
          detail: {
            step: m.step,
            earnedAssetKey: m.reward_asset_key,
            earnedLabel: this.scaleLabel(m.reward_qty_label),
            nextAssetKey: next?.reward_asset_key ?? '',
            nextLabel: next ? this.scaleLabel(next.reward_qty_label) : '',
            nextPoint: next?.required_point ?? this.tycoonPoints,
          },
        }));
      }
      this.checkSeasonMilestones();
      this.syncHud();
      window.dispatchEvent(new CustomEvent('event:currencyFly', {
        detail: {
          tycoonGain: finalTycoonGain,
          seasonGain: finalSeasonGain,
          tycoonAssetKey: this.data.tycoonEvent?.currency_asset_key ?? 'tycoon_coin',
          seasonAssetKey: (this.data.expressEvent || this.data.seasonEvent)?.currency_asset_key ?? 'season_coin',
        },
      }));
    }
  }

  tick(dt: number) {
    if (this.eventEndSec > 0) {
      this.eventEndSec = Math.max(0, this.eventEndSec - dt);
    }
    if (this.tycoonCyclePeriod > 0 && this.data.tycoonEvent) {
      this.tycoonCycleSec = Math.max(0, this.tycoonCycleSec - dt);
      if (this.tycoonCycleSec <= 0) this.tycoonCycleSec = this.tycoonCyclePeriod;
    }
    if (this.tournamentActive && this.seasonCyclePeriod > 0) {
      this.seasonCycleSec = Math.max(0, this.seasonCycleSec - dt);
      if (this.seasonCycleSec <= 0) this.seasonCycleSec = this.seasonCyclePeriod;
    }
    if (this.tournamentActive) {
      this.botSim.tick(dt, this.seasonPoints);
      if (this.eventEndSec <= 0 && !this.tournamentSettled) {
        this.settleTournament();
      }
    }
    this.syncHud();
  }

  dismissMilestonePopup() {
    eventStore.set('/event/milestonePopupVisible', false);
    if (this.isEventMainModalOpen() && this.pendingMilestonePopups.length > 0) {
      this.showNextMilestonePopup();
    }
  }

  toggleMilestoneList() {
    const open = !eventStore.get('/event/milestoneListVisible');
    eventStore.setMany({
      '/event/milestoneListVisible': open,
      '/event/tournamentPanelVisible': open ? false : eventStore.get('/event/tournamentPanelVisible'),
      '/event/expressVisible': open ? false : eventStore.get('/event/expressVisible'),
      ...(open ? {} : { '/event/milestonePopupVisible': false }),
    });
    if (open) this.flushPendingMilestonePopups();
  }

  toggleTournamentPanel() {
    const open = !eventStore.get('/event/tournamentPanelVisible');
    eventStore.setMany({
      '/event/tournamentPanelVisible': open,
      '/event/milestoneListVisible': open ? false : eventStore.get('/event/milestoneListVisible'),
      '/event/expressVisible': open ? false : eventStore.get('/event/expressVisible'),
      ...(open ? {} : { '/event/milestonePopupVisible': false }),
    });
    if (open) this.flushPendingMilestonePopups();
  }

  dismissTournamentPanel() {
    if (eventStore.get('/event/tournamentEnded')) {
      this.dismissSettlement();
      return;
    }
    eventStore.setMany({
      '/event/tournamentPanelVisible': false,
      '/event/milestonePopupVisible': false,
    });
  }

  dismissSettlement() {
    eventStore.setMany({
      '/event/settlementVisible': false,
      '/event/tournamentEnded': false,
    });
  }

  openHelp(kind: 'tycoon' | 'season') {
    eventStore.setMany({
      '/event/helpVisible': true,
      '/event/helpKind': kind,
    });
  }

  dismissHelp() {
    eventStore.set('/event/helpVisible', false);
  }

  private checkTycoonMilestones(): EventMilestoneConfig[] {
    const claimed: EventMilestoneConfig[] = [];
    for (const m of this.milestones) {
      if (this.claimedSteps.has(m.step)) continue;
      if (this.tycoonPoints >= m.required_point) {
        this.claimedSteps.add(m.step);
        this.pendingMilestonePopups.push(m);
        this.onRewardGranted?.(m.reward_bundle_id);
        claimed.push(m);
      }
    }
    return claimed;
  }

  private checkSeasonMilestones() {
    for (const m of this.seasonMilestones) {
      if (this.claimedSeasonSteps.has(m.step)) continue;
      if (this.seasonPoints >= m.required_point) {
        this.claimedSeasonSteps.add(m.step);
        this.pendingMilestonePopups.push(m);
        this.onRewardGranted?.(m.reward_bundle_id);
      }
    }
  }

  private isEventMainModalOpen(): boolean {
    return eventStore.get('/event/milestoneListVisible')
      || eventStore.get('/event/expressVisible')
      || eventStore.get('/event/tournamentPanelVisible');
  }

  /** 타이쿤·시즌 메인 창이 열렸을 때만 대기 중 마일스톤 보상 표시 */
  private flushPendingMilestonePopups() {
    if (!this.isEventMainModalOpen()) return;
    if (eventStore.get('/event/milestonePopupVisible')) return;
    if (this.pendingMilestonePopups.length === 0) return;
    this.showNextMilestonePopup();
  }

  private showNextMilestonePopup() {
    const m = this.pendingMilestonePopups.shift();
    if (!m) return;
    eventStore.setMany({
      '/event/milestonePopupVisible': true,
      '/event/milestonePopupTitle': `${m.step}단계 달성!`,
      '/event/milestonePopupAssetKey': m.reward_asset_key,
      '/event/milestonePopupLabel': this.scaleLabel(m.reward_qty_label),
    });
  }

  private settleTournament() {
    this.tournamentSettled = true;
    const { rows, playerRank } = this.botSim.getRankedRows(PLAYER_NAME, this.seasonPoints);
    const rewards = this.data.rankRewards.get(this.tournamentEventId) ?? [];
    const reward = rewards.find(r => playerRank >= r.rank_from && playerRank <= r.rank_to);
    const coins = reward?.season_coins ?? 0;
    const bundleId = reward?.bundle_id ?? '';
    this.seasonCoins += coins;
    this.applyClassLevelUp();
    if (bundleId) {
      this.onRewardGranted?.(bundleId);
    }

    eventStore.setMany({
      '/event/tournamentRows': rows,
      '/event/tournamentRank': playerRank,
      '/event/settlementVisible': true,
      '/event/tournamentPanelVisible': true,
      '/event/tournamentEnded': true,
      '/event/settlementRank': playerRank,
      '/event/settlementCoins': coins,
      '/event/settlementBundleId': bundleId,
      '/event/seasonCoins': this.seasonCoins,
      '/event/classLevel': this.classLevel,
      '/event/className': this.data.seasonClasses.find(c => c.class_level === this.classLevel)?.class_name ?? '',
      '/event/classSubtitle': this.buildClassSubtitle(),
    });
  }

  private applyClassLevelUp() {
    const sorted = [...this.data.seasonClasses].sort((a, b) => b.class_level - a.class_level);
    for (const c of sorted) {
      if (this.seasonCoins >= c.required_coins) {
        this.classLevel = Math.max(this.classLevel, c.class_level);
        break;
      }
    }
  }

  private nextMilestone(): EventMilestoneConfig | null {
    for (const m of this.milestones) {
      if (!this.claimedSteps.has(m.step) && this.tycoonPoints < m.required_point) return m;
    }
    return null;
  }

  private nextSeasonMilestone(): EventMilestoneConfig | null {
    for (const m of this.seasonMilestones) {
      if (!this.claimedSeasonSteps.has(m.step) && this.seasonPoints < m.required_point) return m;
    }
    return null;
  }

  private buildMilestoneRows() {
    return this.milestones.map(m => ({
      step: m.step,
      required_point: m.required_point,
      reward_label: this.scaleLabel(m.reward_qty_label),
      reward_asset_key: m.reward_asset_key,
      status: this.claimedSteps.has(m.step) ? 'claimed' as const : 'locked' as const,
    }));
  }

  private buildClassSubtitle(): string {
    if (this.classLevel <= 1) return '';
    const prev = this.data.seasonClasses.find(c => c.class_level === this.classLevel - 1);
    if (!prev) return '';
    return `${prev.required_coins} 에서 업그레이드`;
  }

  private formatTimer(sec: number): string {
    if (sec <= 0) return '종료';
    const h = Math.floor(sec / 3600);
    const m = Math.floor((sec % 3600) / 60);
    if (h > 0) return `${h}시간 ${m}분`;
    return `${m}분`;
  }

  private syncHud() {
    const next = this.nextMilestone();
    const nextSeason = this.nextSeasonMilestone();
    const patch: Parameters<typeof eventStore.setMany>[0] = {
      '/event/points': this.tycoonPoints,
      '/event/seasonPoints': this.seasonPoints,
      '/event/nextMilestonePoint': next?.required_point ?? this.tycoonPoints,
      '/event/nextRewardAssetKey': next?.reward_asset_key ?? 'reward_dice',
      '/event/nextRewardLabel': next?.reward_qty_label ?? '',
      '/event/nextSeasonMilestonePoint': nextSeason?.required_point ?? this.seasonPoints,
      '/event/nextSeasonRewardAssetKey': nextSeason?.reward_asset_key ?? 'reward_lock',
      '/event/nextSeasonRewardLabel': nextSeason?.reward_qty_label ?? '',
      '/event/timerText': this.data.tycoonEvent ? this.formatTimer(this.tycoonCycleSec) : '',
      '/event/seasonTimerText': (this.data.seasonEvent || this.data.expressEvent)
        ? this.formatTimer(this.seasonCycleSec) : '',
      '/event/seasonCoins': this.seasonCoins,
      '/event/classLevel': this.classLevel,
      '/event/milestoneRows': this.buildMilestoneRows(),
      '/event/classSubtitle': this.buildClassSubtitle(),
    };

    if (this.tournamentActive) {
      const { rows, playerRank } = this.botSim.getRankedRows(PLAYER_NAME, this.seasonPoints);
      patch['/event/tournamentRows'] = rows;
      patch['/event/tournamentRank'] = playerRank;
    }

    if (this.data.expressEvent) {
      patch['/event/expressTimerText'] = this.formatTimer(this.seasonCycleSec);
    }

    eventStore.setMany(patch);
  }

  toggleExpressPanel() {
    const open = !eventStore.get('/event/expressVisible');
    eventStore.setMany({
      '/event/expressVisible': open,
      '/event/milestoneListVisible': open ? false : eventStore.get('/event/milestoneListVisible'),
      '/event/tournamentPanelVisible': open ? false : eventStore.get('/event/tournamentPanelVisible'),
      ...(open ? {} : { '/event/milestonePopupVisible': false }),
    });
    if (open) this.flushPendingMilestonePopups();
  }

  dismissExpressPanel() {
    eventStore.setMany({
      '/event/expressVisible': false,
      '/event/milestonePopupVisible': false,
    });
  }

  getPoints() {
    return this.tycoonPoints;
  }

  getSeasonPoints() {
    return this.seasonPoints;
  }

  getSeasonCoins() {
    return this.seasonCoins;
  }
}
```
