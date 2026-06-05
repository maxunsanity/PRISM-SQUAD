/**
 * eventExternalStore.ts — 이벤트 $state 브릿지 (hudExternalStore와 분리)
 * 경로 수정 시 eventHudSpec.ts + registry.tsx 동시 패치
 */

export type TournamentBotRow = {
  rank: number;
  name: string;
  points: number;
  isPlayer: boolean;
};

export type MilestoneRow = {
  step: number;
  required_point: number;
  reward_label: string;
  reward_asset_key: string;
  status: 'locked' | 'claimed';
};

type EventState = {
  '/event/visible': boolean;
  '/event/name': string;
  '/event/kind': string;
  '/event/themeKey': string;
  '/event/currencyAssetKey': string;
  '/event/points': number;
  /** 시즌 익스프레스 순위용 점수 (타이쿤 TP와 분리) */
  '/event/seasonPoints': number;
  '/event/nextMilestonePoint': number;
  /** 상단 게이지용 — 현재 단계 구간 진행 (누적 TP와 별도) */
  '/event/gaugePoints': number;
  '/event/gaugeTarget': number;
  /** mg_ty_01 전 단계 달성 시 true — 게이지는 max TP 기준·완료 표시 */
  '/event/tycoonAllMilestonesComplete': boolean;
  /** 타이쿤 마일스톤 회차 (1=첫 바퀴) */
  '/event/tycoonLap': number;
  '/event/nextRewardAssetKey': string;
  '/event/nextRewardLabel': string;
  '/event/nextSeasonMilestonePoint': number;
  '/event/seasonGaugePoints': number;
  '/event/seasonGaugeTarget': number;
  /** mg_se_01 전 단계 달성 시 true — 익스프레스 게이지 완료 표시 */
  '/event/seasonAllMilestonesComplete': boolean;
  /** 익스프레스 마일스톤 회차 (1=첫 바퀴) */
  '/event/seasonLap': number;
  '/event/nextSeasonRewardAssetKey': string;
  '/event/nextSeasonRewardLabel': string;
  '/event/timerText': string;
  '/event/seasonCoins': number;
  '/event/className': string;
  '/event/classLevel': number;
  '/event/seasonName': string;
  '/event/seasonThemeKey': string;
  '/event/seasonCurrencyAssetKey': string;
  '/event/seasonTimerText': string;
  '/event/seasonGroupSize': number;
  '/event/seasonBadgeLabel': string;
  '/event/tycoonBadgeLabel': string;
  '/event/tournamentVisible': boolean;
  '/event/tournamentRank': number;
  '/event/tournamentRows': TournamentBotRow[];
  /** 보상 팝업 — 타이쿤/시즌 독립 채널 (서로 막지 않음, 즉시 표시) */
  '/event/tycoonMilestonePopupVisible': boolean;
  '/event/tycoonMilestonePopupTitle': string;
  '/event/tycoonMilestonePopupLap': number;
  '/event/tycoonMilestonePopupStep': number;
  '/event/tycoonMilestonePopupAssetKey': string;
  '/event/tycoonMilestonePopupLabel': string;
  '/event/seasonMilestonePopupVisible': boolean;
  '/event/seasonMilestonePopupTitle': string;
  '/event/seasonMilestonePopupLap': number;
  '/event/seasonMilestonePopupStep': number;
  '/event/seasonMilestonePopupAssetKey': string;
  '/event/seasonMilestonePopupLabel': string;
  '/event/milestoneListVisible': boolean;
  '/event/milestoneRows': MilestoneRow[];
  '/event/tournamentPanelVisible': boolean;
  '/event/settlementVisible': boolean;
  '/event/settlementRank': number;
  '/event/settlementCoins': number;
  '/event/settlementBundleId': string;
  '/event/helpVisible': boolean;
  '/event/helpKind': string;
  '/event/classSubtitle': string;
  '/event/tournamentEnded': boolean;
  '/event/ticketMultiplier': number;
  /** 직전 처치로 받은 TP (배수 적용 후) — 상단 바 확인용 */
  '/event/lastTpGain': number;
  '/event/lastSeasonGain': number;
  '/event/expressVisible': boolean;
  '/event/expressTabVisible': boolean;
  '/event/expressTimerText': string;
  '/event/expressRewardAssetKey': string;
  '/event/expressName': string;
  '/event/expressTitle': string;
  '/event/expressRewardLabel': string;
  /** RedDotService — 마일스톤 보상 큐 (tycoon track) */
  '/event/tycoonPendingRewardCount': number;
  '/event/seasonPendingRewardCount': number;
  '/event/tycoonLapCompletePending': boolean;
  '/event/seasonLapCompletePending': boolean;
  '/event/settlementClaimPending': boolean;
};

const defaults: EventState = {
  '/event/visible': false,
  '/event/name': '',
  '/event/kind': '',
  '/event/themeKey': 'tycoon_default',
  '/event/currencyAssetKey': 'tycoon_coin',
  '/event/points': 0,
  '/event/seasonPoints': 0,
  '/event/nextMilestonePoint': 1500,
  '/event/gaugePoints': 0,
  '/event/gaugeTarget': 1500,
  '/event/tycoonAllMilestonesComplete': false,
  '/event/tycoonLap': 1,
  '/event/nextRewardAssetKey': 'reward_dice',
  '/event/nextRewardLabel': '',
  '/event/nextSeasonMilestonePoint': 1500,
  '/event/seasonGaugePoints': 0,
  '/event/seasonGaugeTarget': 1500,
  '/event/seasonAllMilestonesComplete': false,
  '/event/seasonLap': 1,
  '/event/nextSeasonRewardAssetKey': 'reward_lock',
  '/event/nextSeasonRewardLabel': '',
  '/event/timerText': '',
  '/event/seasonCoins': 0,
  '/event/className': '',
  '/event/classLevel': 1,
  '/event/seasonName': '',
  '/event/seasonThemeKey': 'season_default',
  '/event/seasonCurrencyAssetKey': 'season_coin',
  '/event/seasonTimerText': '',
  '/event/seasonGroupSize': 50,
  '/event/seasonBadgeLabel': '시즌',
  '/event/tycoonBadgeLabel': '타이쿤',
  '/event/tournamentVisible': false,
  '/event/tournamentRank': 0,
  '/event/tournamentRows': [],
  '/event/tycoonMilestonePopupVisible': false,
  '/event/tycoonMilestonePopupTitle': '',
  '/event/tycoonMilestonePopupLap': 1,
  '/event/tycoonMilestonePopupStep': 0,
  '/event/tycoonMilestonePopupAssetKey': 'reward_dice',
  '/event/tycoonMilestonePopupLabel': '',
  '/event/seasonMilestonePopupVisible': false,
  '/event/seasonMilestonePopupTitle': '',
  '/event/seasonMilestonePopupLap': 1,
  '/event/seasonMilestonePopupStep': 0,
  '/event/seasonMilestonePopupAssetKey': 'reward_dice',
  '/event/seasonMilestonePopupLabel': '',
  '/event/milestoneListVisible': false,
  '/event/milestoneRows': [],
  '/event/tournamentPanelVisible': false,
  '/event/settlementVisible': false,
  '/event/settlementRank': 0,
  '/event/settlementCoins': 0,
  '/event/settlementBundleId': '',
  '/event/helpVisible': false,
  '/event/helpKind': '',
  '/event/classSubtitle': '',
  '/event/tournamentEnded': false,
  '/event/ticketMultiplier': 1,
  '/event/lastTpGain': 0,
  '/event/lastSeasonGain': 0,
  '/event/expressVisible': false,
  '/event/expressTabVisible': false,
  '/event/expressTimerText': '',
  '/event/expressRewardAssetKey': '',
  '/event/expressName': '',
  '/event/expressTitle': '',
  '/event/expressRewardLabel': '',
  '/event/tycoonPendingRewardCount': 0,
  '/event/seasonPendingRewardCount': 0,
  '/event/tycoonLapCompletePending': false,
  '/event/seasonLapCompletePending': false,
  '/event/settlementClaimPending': false,
};

type Listener = () => void;

function eventValuesEqual(a: unknown, b: unknown): boolean {
  if (a === b) return true;
  if (typeof a !== typeof b) return false;
  if (Array.isArray(a) && Array.isArray(b)) {
    if (a.length !== b.length) return false;
    return a.every((item, i) => eventValuesEqual(item, b[i]));
  }
  if (a && b && typeof a === 'object' && typeof b === 'object') {
    const ak = Object.keys(a as object);
    const bk = Object.keys(b as object);
    if (ak.length !== bk.length) return false;
    return ak.every(k => eventValuesEqual(
      (a as Record<string, unknown>)[k],
      (b as Record<string, unknown>)[k],
    ));
  }
  return false;
}

class EventExternalStore {
  private state: EventState = { ...defaults };
  private listeners = new Set<Listener>();

  subscribe(fn: Listener) {
    this.listeners.add(fn);
    return () => this.listeners.delete(fn);
  }

  getSnapshot(): EventState {
    return this.state;
  }

  get<K extends keyof EventState>(path: K): EventState[K] {
    return this.state[path];
  }

  set<K extends keyof EventState>(path: K, value: EventState[K]) {
    if (this.state[path] === value) return;
    this.state = { ...this.state, [path]: value };
    this.listeners.forEach(fn => fn());
  }

  setMany(patch: Partial<EventState>) {
    const next = { ...this.state };
    let changed = false;
    for (const key of Object.keys(patch) as (keyof EventState)[]) {
      const v = patch[key];
      if (v === undefined) continue;
      if (eventValuesEqual(next[key], v)) continue;
      (next as Record<keyof EventState, EventState[keyof EventState]>)[key] = v;
      changed = true;
    }
    if (!changed) return;
    this.state = next;
    this.listeners.forEach(fn => fn());
  }

  reset() {
    this.state = { ...defaults };
    this.listeners.forEach(fn => fn());
  }
}

export const eventStore = new EventExternalStore();

/** 이벤트 모달이 열려 있으면 App 모달 레이어가 클릭을 받도록 */
export function eventModalOpen(snapshot: EventState = eventStore.getSnapshot()): boolean {
  return snapshot['/event/milestoneListVisible']
    || snapshot['/event/tournamentPanelVisible']
    || snapshot['/event/settlementVisible']
    || snapshot['/event/helpVisible']
    || snapshot['/event/expressVisible'];
}
