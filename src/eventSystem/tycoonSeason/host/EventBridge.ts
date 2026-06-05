import type { EventData } from '../data';
import { EventController } from '../core/EventController';
import { hudStore } from '../../../game/hudExternalStore';
import { eventStore } from '../store/eventExternalStore';

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
    const onCloseTycoon = () => this.ctrl.dismissTycoonMilestonePopup();
    const onCloseSeason = () => this.ctrl.dismissSeasonMilestonePopup();
    const onToggleMilestoneList = () => this.ctrl.toggleMilestoneList();
    const onToggleTournament = () => this.ctrl.toggleTournamentPanel();
    const onCloseTournament = () => this.ctrl.dismissTournamentPanel();
    const onCloseSettlement = () => this.ctrl.dismissSettlement();
    const onOpenHelp = (e: Event) => {
      const kind = (e as CustomEvent).detail as 'tycoon' | 'season';
      if (kind === 'tycoon' || kind === 'season') this.ctrl.openHelp(kind);
    };
    const onCloseHelp = () => this.ctrl.dismissHelp();
    const onToggleExpress = () => {
      const open = !eventStore.get('/event/expressVisible');
      hudStore.setMany({
        '/scene/transitionText': open ? 'SEASON EXPRESS' : 'RETURN TO LOBBY',
        '/scene/transitionVisible': true,
      });
      window.setTimeout(() => {
        this.ctrl.toggleExpressPanel();
      }, 850);
      window.setTimeout(() => {
        hudStore.set('/scene/transitionVisible', false);
      }, 2650);
    };
    const onCloseExpress = () => {
      hudStore.setMany({
        '/scene/transitionText': 'RETURN TO LOBBY',
        '/scene/transitionVisible': true,
      });
      window.setTimeout(() => {
        this.ctrl.dismissExpressPanel();
      }, 850);
      window.setTimeout(() => {
        hudStore.set('/scene/transitionVisible', false);
      }, 2650);
    };

    window.addEventListener('event:closeTycoonMilestonePopup', onCloseTycoon);
    window.addEventListener('event:closeSeasonMilestonePopup', onCloseSeason);
    window.addEventListener('event:toggleMilestoneList', onToggleMilestoneList);
    window.addEventListener('event:toggleTournamentPanel', onToggleTournament);
    window.addEventListener('event:closeTournamentPanel', onCloseTournament);
    window.addEventListener('event:closeSettlement', onCloseSettlement);
    window.addEventListener('event:openHelp', onOpenHelp);
    window.addEventListener('event:closeHelp', onCloseHelp);
    window.addEventListener('event:toggleExpressPanel', onToggleExpress);
    window.addEventListener('event:closeExpress', onCloseExpress);

    this.unbind = () => {
      window.removeEventListener('event:closeTycoonMilestonePopup', onCloseTycoon);
      window.removeEventListener('event:closeSeasonMilestonePopup', onCloseSeason);
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
