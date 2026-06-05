import type { EventData, EventMilestoneConfig } from '../data';
import { eventStore } from '../store/eventExternalStore';
import { BotSimulator } from './BotSimulator';
import { scaleRewardQtyLabel } from './rewardLabelScale';

const PLAYER_NAME = '나';
/** 타이쿤 마일스톤 전 단계 달성 후 HUD 문구 */
export const TYCOON_ALL_COMPLETE_MSG = '이벤트 보상을 찾아가세요';

type PendingMilestonePopup = {
  milestone: EventMilestoneConfig;
  lap: number;
};

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
  private pendingTycoonPopups: PendingMilestonePopup[] = [];
  private pendingSeasonPopups: PendingMilestonePopup[] = [];
  /** 10단계 수령 완료 후 true — 다음 TP 획득 시 다음 회차 시작 */
  private tycoonLapCompletePending = false;
  private tycoonLap = 1;
  /** 익스프레스 10단계 수령 완료 후 true — 다음 시즌 점수 획득 시 다음 회차 시작 */
  private seasonLapCompletePending = false;
  private seasonLap = 1;
  private botSim: BotSimulator;
  private tournamentActive = false;
  private tournamentEventId = 0;
  private tournamentSettled = false;
  /** 정산 팝업 확인 전 — season_settlement 레드닷 */
  private settlementAcknowledged = false;

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
    let tycoonLapRolled = false;
    let seasonLapRolled = false;

    // 1. 타이쿤 킬수 누적 및 포인트 지급
    if (this.data.tycoonEvent) {
      if (this.tycoonLapCompletePending) {
        this.beginNextTycoonLap();
        tycoonLapRolled = true;
      }
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
      if (this.data.expressEvent && this.seasonLapCompletePending) {
        this.beginNextSeasonLap();
        seasonLapRolled = true;
      }
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
      let tycoonClaimed: EventMilestoneConfig[] = [];
      let lapDoneBefore = false;
      let lapDoneNow = false;
      if (this.data.tycoonEvent) {
        lapDoneBefore = this.isTycoonMilestonesComplete();
        tycoonClaimed = this.checkTycoonMilestones();
        lapDoneNow = this.isTycoonMilestonesComplete();
        if (lapDoneNow && !lapDoneBefore) {
          this.tycoonLapCompletePending = true;
          this.tycoonPoints = 0;
          this.dispatchTycoonLapReset('lap_complete');
        }
      }

      let seasonClaimed: EventMilestoneConfig[] = [];
      let seasonLapDoneBefore = false;
      let seasonLapDoneNow = false;
      if (this.data.expressEvent && this.seasonMilestones.length > 0) {
        seasonLapDoneBefore = this.isSeasonMilestonesComplete();
        seasonClaimed = this.checkSeasonMilestones();
        seasonLapDoneNow = this.isSeasonMilestonesComplete();
        if (seasonLapDoneNow && !seasonLapDoneBefore) {
          this.seasonLapCompletePending = true;
          this.seasonPoints = 0;
          this.dispatchSeasonLapReset('lap_complete');
        }
      }

      eventStore.setMany({
        '/event/ticketMultiplier': mult,
        '/event/lastTpGain': finalTycoonGain,
        '/event/lastSeasonGain': finalSeasonGain,
      });
      if (tycoonClaimed.length > 0) {
        const last = tycoonClaimed[tycoonClaimed.length - 1]!;
        const next = this.nextMilestone();
        const allComplete = lapDoneNow && !lapDoneBefore;
        window.dispatchEvent(new CustomEvent('event:tycoonMilestoneComplete', {
          detail: {
            step: last.step,
            stepsClaimed: tycoonClaimed.length,
            earnedAssetKey: last.reward_asset_key,
            earnedLabel: this.scaleLabel(last.reward_qty_label),
            nextAssetKey: allComplete
              ? last.reward_asset_key
              : (next?.reward_asset_key ?? 'reward_energy'),
            nextLabel: allComplete ? TYCOON_ALL_COMPLETE_MSG : (next ? this.scaleLabel(next.reward_qty_label) : ''),
            nextGaugeTarget: this.tycoonGaugeForHud().gaugeTarget,
            allComplete,
          },
        }));
      }
      if (seasonClaimed.length > 0) {
        const last = seasonClaimed[seasonClaimed.length - 1]!;
        const next = this.nextSeasonMilestone();
        const allComplete = seasonLapDoneNow && !seasonLapDoneBefore;
        window.dispatchEvent(new CustomEvent('event:seasonMilestoneComplete', {
          detail: {
            step: last.step,
            stepsClaimed: seasonClaimed.length,
            earnedAssetKey: last.reward_asset_key,
            earnedLabel: this.scaleLabel(last.reward_qty_label),
            nextAssetKey: allComplete
              ? last.reward_asset_key
              : (next?.reward_asset_key ?? 'reward_lock'),
            nextLabel: allComplete ? TYCOON_ALL_COMPLETE_MSG : (next ? this.scaleLabel(next.reward_qty_label) : ''),
            nextGaugeTarget: this.seasonGaugeForHud().gaugeTarget,
            allComplete,
          },
        }));
      }
      this.syncHud();
      if (tycoonLapRolled) this.dispatchTycoonLapReset('next_lap');
      if (seasonLapRolled) this.dispatchSeasonLapReset('next_lap');
      window.dispatchEvent(new CustomEvent('event:currencyFly', {
        detail: {
          tycoonGain: finalTycoonGain,
          seasonGain: finalSeasonGain,
          tycoonAssetKey: this.data.tycoonEvent?.currency_asset_key ?? 'tycoon_coin',
          seasonAssetKey: (this.data.expressEvent || this.data.seasonEvent)?.currency_asset_key ?? 'season_coin',
        },
      }));
    }
    if ((tycoonLapRolled || seasonLapRolled) && finalTycoonGain <= 0 && finalSeasonGain <= 0) {
      this.syncHud();
      if (tycoonLapRolled) this.dispatchTycoonLapReset('next_lap');
      if (seasonLapRolled) this.dispatchSeasonLapReset('next_lap');
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

  dismissTycoonMilestonePopup() {
    eventStore.set('/event/tycoonMilestonePopupVisible', false);
    if (this.pendingTycoonPopups.length > 0) {
      window.setTimeout(() => this.showNextTycoonPopup(), 50);
    }
  }

  dismissSeasonMilestonePopup() {
    eventStore.set('/event/seasonMilestonePopupVisible', false);
    if (this.pendingSeasonPopups.length > 0) {
      window.setTimeout(() => this.showNextSeasonPopup(), 50);
    }
  }

  toggleMilestoneList() {
    const open = !eventStore.get('/event/milestoneListVisible');
    if (open) {
      window.dispatchEvent(new CustomEvent('redDot:markSeen', { detail: 'tycoon_lap_guide' }));
    }
    eventStore.setMany({
      '/event/milestoneListVisible': open,
      '/event/tournamentPanelVisible': open ? false : eventStore.get('/event/tournamentPanelVisible'),
      '/event/expressVisible': open ? false : eventStore.get('/event/expressVisible'),
      ...(open ? {} : { '/event/tycoonMilestonePopupVisible': false }),
    });
    if (open) this.showNextTycoonPopup();
  }

  toggleTournamentPanel() {
    const open = !eventStore.get('/event/tournamentPanelVisible');
    eventStore.setMany({
      '/event/tournamentPanelVisible': open,
      '/event/milestoneListVisible': open ? false : eventStore.get('/event/milestoneListVisible'),
      '/event/expressVisible': open ? false : eventStore.get('/event/expressVisible'),
      ...(open ? {} : { '/event/seasonMilestonePopupVisible': false }),
    });
    if (open) this.showNextSeasonPopup();
  }

  dismissTournamentPanel() {
    if (eventStore.get('/event/tournamentEnded')) {
      this.dismissSettlement();
      return;
    }
    eventStore.setMany({
      '/event/tournamentPanelVisible': false,
      '/event/seasonMilestonePopupVisible': false,
    });
  }

  dismissSettlement() {
    this.settlementAcknowledged = true;
    eventStore.setMany({
      '/event/settlementVisible': false,
      '/event/tournamentEnded': false,
      '/event/settlementClaimPending': false,
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
        this.pendingTycoonPopups.push({ milestone: m, lap: this.tycoonLap });
        this.showNextTycoonPopup();
        this.onRewardGranted?.(m.reward_bundle_id);
        claimed.push(m);
      }
    }
    return claimed;
  }

  private checkSeasonMilestones(): EventMilestoneConfig[] {
    const claimed: EventMilestoneConfig[] = [];
    for (const m of this.seasonMilestones) {
      if (this.claimedSeasonSteps.has(m.step)) continue;
      if (this.seasonPoints >= m.required_point) {
        this.claimedSeasonSteps.add(m.step);
        this.pendingSeasonPopups.push({ milestone: m, lap: this.seasonLap });
        this.showNextSeasonPopup();
        this.onRewardGranted?.(m.reward_bundle_id);
        claimed.push(m);
      }
    }
    return claimed;
  }

  private popupTitle(eventName: string, lap: number, step: number): string {
    return `${eventName} · ${lap}회차 ${step}단계 달성!`;
  }

  /** 타이쿤 보상 팝업 — 타이쿤 창(마일스톤 리스트)이 열렸을 때만 표시. 게임 중엔 안 뜸. 시즌과 독립. */
  private showNextTycoonPopup() {
    if (!eventStore.get('/event/milestoneListVisible')) return;
    if (eventStore.get('/event/tycoonMilestonePopupVisible')) return;
    const entry = this.pendingTycoonPopups.shift();
    if (!entry) return;
    const { milestone: m, lap } = entry;
    const name = this.data.tycoonEvent?.event_name ?? '타이쿤 챌린지';
    eventStore.setMany({
      '/event/tycoonMilestonePopupVisible': true,
      '/event/tycoonMilestonePopupTitle': this.popupTitle(name, lap, m.step),
      '/event/tycoonMilestonePopupLap': lap,
      '/event/tycoonMilestonePopupStep': m.step,
      '/event/tycoonMilestonePopupAssetKey': m.reward_asset_key,
      '/event/tycoonMilestonePopupLabel': this.scaleLabel(m.reward_qty_label),
    });
  }

  /** 시즌 보상 팝업 — 시즌 창(익스프레스/토너먼트)이 열렸을 때만 표시. 게임 중엔 안 뜸. 타이쿤과 독립. */
  private showNextSeasonPopup() {
    if (!eventStore.get('/event/expressVisible') && !eventStore.get('/event/tournamentPanelVisible')) return;
    if (eventStore.get('/event/seasonMilestonePopupVisible')) return;
    const entry = this.pendingSeasonPopups.shift();
    if (!entry) return;
    const { milestone: m, lap } = entry;
    const name = (this.data.expressEvent || this.data.seasonEvent)?.event_name ?? '시즌 익스프레스';
    eventStore.setMany({
      '/event/seasonMilestonePopupVisible': true,
      '/event/seasonMilestonePopupTitle': this.popupTitle(name, lap, m.step),
      '/event/seasonMilestonePopupLap': lap,
      '/event/seasonMilestonePopupStep': m.step,
      '/event/seasonMilestonePopupAssetKey': m.reward_asset_key,
      '/event/seasonMilestonePopupLabel': this.scaleLabel(m.reward_qty_label),
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
      '/event/settlementClaimPending': true,
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

  private dispatchTycoonLapReset(reason: 'lap_complete' | 'next_lap') {
    window.dispatchEvent(new CustomEvent('event:tycoonLapReset', {
      detail: { lap: this.tycoonLap, reason },
    }));
  }

  private dispatchSeasonLapReset(reason: 'lap_complete' | 'next_lap') {
    window.dispatchEvent(new CustomEvent('event:seasonLapReset', {
      detail: { lap: this.seasonLap, reason },
    }));
  }

  /** 회차 완료 후 다음 킬 카드부터 1~10단계 재시작 (TP·달성 기록 초기화) */
  private beginNextTycoonLap() {
    this.tycoonLapCompletePending = false;
    this.tycoonLap += 1;
    this.tycoonPoints = 0;
    this.claimedSteps.clear();
  }

  /** 익스프레스 회차 완료 후 다음 시즌 점수부터 1~10단계 재시작 */
  private beginNextSeasonLap() {
    this.seasonLapCompletePending = false;
    this.seasonLap += 1;
    this.seasonPoints = 0;
    this.claimedSeasonSteps.clear();
  }

  private tycoonMilestoneCap(): number {
    if (!this.milestones.length) return 1;
    return this.milestones[this.milestones.length - 1]!.required_point;
  }

  private isTycoonMilestonesComplete(): boolean {
    return this.milestones.length > 0
      && this.milestones.every(m => this.claimedSteps.has(m.step));
  }

  private seasonMilestoneCap(): number {
    if (!this.seasonMilestones.length) return 1;
    return this.seasonMilestones[this.seasonMilestones.length - 1]!.required_point;
  }

  private isSeasonMilestonesComplete(): boolean {
    return this.seasonMilestones.length > 0
      && this.seasonMilestones.every(m => this.claimedSeasonSteps.has(m.step));
  }

  /** HUD 게이지 분모 — 누적 TP (마일스톤 목록·로직용) */
  private tycoonNextMilestonePointForHud(): number {
    const next = this.nextMilestone();
    return next?.required_point ?? this.tycoonMilestoneCap();
  }

  /** HUD 게이지 — 현재 단계 구간만 표시 (이전 단계 달성 후 0부터 채움) */
  private milestoneGaugeSegment(
    points: number,
    milestones: EventMilestoneConfig[],
    claimedSteps: Set<number>,
    allComplete: boolean,
  ): { gaugePoints: number; gaugeTarget: number } {
    if (!milestones.length) return { gaugePoints: 0, gaugeTarget: 1 };
    const cap = milestones[milestones.length - 1]!.required_point;
    if (allComplete) return { gaugePoints: cap, gaugeTarget: cap };

    const next = milestones.find(m => !claimedSteps.has(m.step) && points < m.required_point);
    if (!next) return { gaugePoints: Math.min(points, cap), gaugeTarget: cap };

    const prev = milestones.find(m => m.step === next.step - 1);
    const base = prev?.required_point ?? 0;
    const target = next.required_point - base;
    const gaugePoints = Math.max(0, Math.min(target, points - base));
    return { gaugePoints, gaugeTarget: Math.max(1, target) };
  }

  private tycoonGaugeForHud(): { gaugePoints: number; gaugeTarget: number } {
    const allDone = this.tycoonLapCompletePending || this.isTycoonMilestonesComplete();
    return this.milestoneGaugeSegment(
      this.tycoonPoints,
      this.milestones,
      this.claimedSteps,
      allDone,
    );
  }

  private seasonGaugeForHud(): { gaugePoints: number; gaugeTarget: number } {
    const allDone = Boolean(this.data.expressEvent)
      && (this.seasonLapCompletePending || this.isSeasonMilestonesComplete());
    return this.milestoneGaugeSegment(
      this.seasonPoints,
      this.seasonMilestones,
      this.claimedSeasonSteps,
      allDone,
    );
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

  /** 익스프레스 HUD 게이지 분모 — 전부 달성 시 마지막 단계(5000) 고정 */
  private seasonNextMilestonePointForHud(): number {
    const next = this.nextSeasonMilestone();
    return next?.required_point ?? this.seasonMilestoneCap();
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
    const allTycoonDone = this.tycoonLapCompletePending || this.isTycoonMilestonesComplete();
    const allSeasonDone = Boolean(this.data.expressEvent)
      && (this.seasonLapCompletePending || this.isSeasonMilestonesComplete());
    const lastTycoon = this.milestones[this.milestones.length - 1];
    const lastSeason = this.seasonMilestones[this.seasonMilestones.length - 1];
    const tycoonGauge = this.tycoonGaugeForHud();
    const seasonGauge = this.seasonGaugeForHud();
    const patch: Parameters<typeof eventStore.setMany>[0] = {
      '/event/points': this.tycoonPoints,
      '/event/seasonPoints': this.seasonPoints,
      '/event/nextMilestonePoint': this.tycoonNextMilestonePointForHud(),
      '/event/gaugePoints': tycoonGauge.gaugePoints,
      '/event/gaugeTarget': tycoonGauge.gaugeTarget,
      '/event/seasonGaugePoints': seasonGauge.gaugePoints,
      '/event/seasonGaugeTarget': seasonGauge.gaugeTarget,
      '/event/tycoonAllMilestonesComplete': allTycoonDone,
      '/event/tycoonLap': this.tycoonLap,
      '/event/nextRewardAssetKey': next?.reward_asset_key
        ?? (allTycoonDone ? (lastTycoon?.reward_asset_key ?? 'reward_gem') : 'reward_dice'),
      '/event/nextRewardLabel': allTycoonDone ? TYCOON_ALL_COMPLETE_MSG : (next ? this.scaleLabel(next.reward_qty_label) : ''),
      '/event/nextSeasonMilestonePoint': this.data.expressEvent
        ? this.seasonNextMilestonePointForHud()
        : (nextSeason?.required_point ?? this.seasonPoints),
      '/event/seasonAllMilestonesComplete': allSeasonDone,
      '/event/seasonLap': this.seasonLap,
      '/event/nextSeasonRewardAssetKey': nextSeason?.reward_asset_key
        ?? (allSeasonDone ? (lastSeason?.reward_asset_key ?? 'reward_gem') : 'reward_lock'),
      '/event/nextSeasonRewardLabel': allSeasonDone
        ? TYCOON_ALL_COMPLETE_MSG
        : (nextSeason ? this.scaleLabel(nextSeason.reward_qty_label) : ''),
      '/event/timerText': this.data.tycoonEvent ? this.formatTimer(this.tycoonCycleSec) : '',
      '/event/seasonTimerText': (this.data.seasonEvent || this.data.expressEvent)
        ? this.formatTimer(this.seasonCycleSec) : '',
      '/event/seasonCoins': this.seasonCoins,
      '/event/classLevel': this.classLevel,
      '/event/milestoneRows': this.buildMilestoneRows(),
      '/event/classSubtitle': this.buildClassSubtitle(),
      '/event/tycoonPendingRewardCount': this.pendingTycoonPopups.length,
      '/event/seasonPendingRewardCount': this.pendingSeasonPopups.length,
      '/event/tycoonLapCompletePending': this.tycoonLapCompletePending,
      '/event/seasonLapCompletePending': this.seasonLapCompletePending,
      '/event/settlementClaimPending': this.tournamentSettled && !this.settlementAcknowledged,
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
    if (open) {
      window.dispatchEvent(new CustomEvent('redDot:markSeen', { detail: 'express_lap_guide' }));
    }
    eventStore.setMany({
      '/event/expressVisible': open,
      '/event/milestoneListVisible': open ? false : eventStore.get('/event/milestoneListVisible'),
      '/event/tournamentPanelVisible': open ? false : eventStore.get('/event/tournamentPanelVisible'),
      ...(open ? {} : { '/event/seasonMilestonePopupVisible': false }),
    });
    if (open) this.showNextSeasonPopup();
  }

  dismissExpressPanel() {
    eventStore.setMany({
      '/event/expressVisible': false,
      '/event/seasonMilestonePopupVisible': false,
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
