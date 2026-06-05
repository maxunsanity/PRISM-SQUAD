# PRISM SQUAD Host — RECIPE_CODE.md (v4)
---
doc_generation: mdv4
condense_policy: forbidden
modify_policy: copy_only_from_repo
---

> 검증된 소스 전문. 경로만 참조하는 구현 금지.


## R-CORE-01 eventMinigameRegistry.ts

> SSoT: `src/game/eventMinigameRegistry.ts` — RECIPE_CODE v4. 임의 수정 금지.

```typescript
/**
 * iframe 미니게임 이벤트 — Lava / Prize Drop / Archery 호스트 SSoT
 * 런타임 메타는 event_minigame_host_config.csv → loadAllGameData → initEventMinigamesFromData
 */
import type { EventMinigameHostConfig } from './data';

export type EventMinigameConfig = EventMinigameHostConfig & {
  id: EventMinigameId;
};

export type EventMinigameId = 'lava' | 'prize' | 'archery';

const FALLBACK: Record<EventMinigameId, EventMinigameConfig> = {
  lava: {
    id: 'lava',
    label: '라바',
    emoji: '🌋',
    tabBg: '#FFB347',
    src: '/event/lavaQuest/index.html',
    ticketPath: '/lobby/lavaTickets',
    ticketCost: 1,
    ticketUnit: '장',
    showFlag: '/lobby/showLavaQuest',
    persistKeys: ['lq_session_v1'],
    enabled: true,
  },
  prize: {
    id: 'prize',
    label: '퍼즐',
    emoji: '🎰',
    tabBg: '#B388FF',
    src: '/event/prizeDrop/index.html',
    ticketPath: '/lobby/prizeBalls',
    ticketCost: 1,
    ticketUnit: '개',
    showFlag: '/lobby/showPrizeDrop',
    persistKeys: [],
    enabled: true,
  },
  archery: {
    id: 'archery',
    label: '양궁',
    emoji: '🏹',
    tabBg: '#7EC8A8',
    src: '/event/archeryArena/index.html',
    ticketPath: '/lobby/archeryBowStands',
    ticketCost: 0,
    ticketUnit: '대',
    showFlag: '/lobby/showArcheryArena',
    persistKeys: ['aa_player_state', 'aa_event_meta', 'aa_ranking_bots', 'aa_ranking_dummy_schema'],
    enabled: true,
  },
};

let EVENT_MINIGAMES: Record<string, EventMinigameConfig> = { ...FALLBACK };
let EVENT_MINIGAME_ORDER: EventMinigameId[] = ['lava', 'prize', 'archery'];

function isKnownId(id: string): id is EventMinigameId {
  return id === 'lava' || id === 'prize' || id === 'archery';
}

/** CSV 로드 직후 App에서 1회 호출 */
export function initEventMinigamesFromData(rows: EventMinigameHostConfig[], order?: string[]) {
  const next: Record<string, EventMinigameConfig> = { ...FALLBACK };
  const ord: EventMinigameId[] = [];
  for (const row of rows) {
    if (!row.enabled || !isKnownId(row.id)) continue;
    next[row.id] = { ...row, id: row.id };
    ord.push(row.id);
  }
  if (order?.length) {
    for (const id of order) {
      if (isKnownId(id) && next[id] && !ord.includes(id)) ord.push(id);
    }
  }
  EVENT_MINIGAMES = next;
  EVENT_MINIGAME_ORDER = ord.length ? ord : ['lava', 'prize', 'archery'];
}

export { EVENT_MINIGAMES, EVENT_MINIGAME_ORDER };
```

## R-CORE-02 EventBridge.ts

> SSoT: `src/eventSystem/tycoonSeason/host/EventBridge.ts` — RECIPE_CODE v4. 임의 수정 금지.

```typescript
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
```

## R-CORE-03a attachEventBridge

> `src/game/GameCore.ts` — attachEventBridge() (메서드명 매칭)

```typescript

  attachEventBridge(bridge: EventBridge | null) {
    this.eventBridge = bridge;
  }
```

## R-CORE-03b _onEnemyDeath (onEnemyKilled 적립)

> `src/game/GameCore.ts` — _onEnemyDeath() (메서드명 매칭)

```typescript
  private _onEnemyDeath(enemyId: number) {
    this.killCount++;
    hudStore.set('/hud/killCount', this.killCount);

    const dead = this.enemySystem.enemies.find(e => e.id === enemyId && e.dead);
    if (!dead) return;

    /* 사망 VFX */
    this.vfxSystem.play('enemy_death', dead.x, dead.y);

    this.gold += dead.cfg.gold_drop;
    hudStore.set('/hud/gold', this.gold);

    /* 특수진화 포식자: 처치 시 확률 회복 (최대 HP의 2%) */
    if (this.predatorHealChance > 0 && Math.random() < this.predatorHealChance) {
      this._heal(Math.max(1, Math.round(this.maxHp * this.predatorHealRatio)));
    }

    /* 스테이지 XP 배율 적용 — stage_config.csv xp_mult */
    const stageXpMult = this.data.stages[this.currentStage - 1]?.xp_mult ?? 1.0;
    this.dropSystem.spawnXp(dead.x, dead.y, dead.cfg.exp_drop_type, stageXpMult);

    if (Math.random() < this.itemDropChance) {
      this.dropSystem.spawnRandomItem(dead.x, dead.y);
    }

    this.eventBridge?.onEnemyKilled(dead.cfg.enemy_id, this.ticketMultiplier);
    archeryOnEnemyKill();
    refreshEventRedDots();

    /* 이벤트 재화 — 30킬마다 티켓/볼 +1 */
    this.killAccumForTicket++;
    if (this.killAccumForTicket >= this._ct('kill_per_event_ticket', 30)) {
      this.killAccumForTicket = 0;
      this._addEventCurrency(1, 1);
    }
  }
```

## R-CORE-03c _onBossDeath (보스 적립)

> `src/game/GameCore.ts` — _onBossDeath() (메서드명 매칭)

```typescript
  private _onBossDeath() {
    this.eventBridge?.onEnemyKilled('final_boss', this.ticketMultiplier);
    this._addEventCurrency(1, 1); // 보스 처치 보너스
    const bossX = this.bossCtrl.x;
    const bossY = this.bossCtrl.y;
    const bossName = this.bossCtrl.cfg.boss_name;
    this.bossCtrl.dispose();

    hudStore.setMany({
      '/hud/bossVisible': false,
      '/hud/bossWarningVisible': false,
      '/bossIntro/phase': 0,
      '/rushWave/visible': false,
      '/bossDeath/bossName': bossName,
    });

    this.pendingStageAdvance = this.currentStage < this.maxStages;
    this.bossDeathPending = true;
    this.invincTimer = this._ct('boss_death_invuln_sec', 5);

    /* Phase 1: 폭발 플래시 (0ms) */
    hudStore.set('/bossDeath/phase', 1);
    this.vfxSystem.play('boss_spawn', bossX, bossY);

    /* Phase 1 연속 폭발 */
    window.setTimeout(() => this.vfxSystem.play('boss_spawn', bossX + 30, bossY - 20), this._hostPat('boss_death_vfx2_ms', 200));
    window.setTimeout(() => this.vfxSystem.play('boss_spawn', bossX - 25, bossY + 30), this._hostPat('boss_death_vfx3_ms', 380));
    window.setTimeout(() => this.vfxSystem.play('boss_spawn', bossX, bossY), this._hostPat('boss_death_vfx4_ms', 550));

    window.setTimeout(() => {
      hudStore.set('/bossDeath/phase', 2);
    }, this._hostPat('boss_death_phase2_ms', 700));

    window.setTimeout(() => {
      hudStore.set('/bossDeath/phase', 3);
    }, this._hostPat('boss_death_phase3_ms', 2200));

    /* 결과창 (3500ms) */
    this.bossDeathTimer = window.setTimeout(() => {
      hudStore.set('/bossDeath/phase', 0);
      this.bossDeathPending = false;
      this.bossDeathTimer = null;
      this._stageClear();
    }, this._ct('boss_death_result_delay_ms', 3500));
  }
```

## R-CORE-03d startLavaQuestMode

> `src/game/GameCore.ts` — startLavaQuestMode() (메서드명 매칭)

```typescript
  startLavaQuestMode(level: number, isLast: boolean) {
    this.lavaQuestMode = true;
    this.lavaQuestLevel = level;
    this.lavaQuestIsLast = isLast;
    this.lavaQuestElapsed = 0;

    const hostRule = this.data.lavaQuestHost.find(
      r => level >= r.level_min && level <= r.level_max,
    ) ?? this.data.lavaQuestHost[this.data.lavaQuestHost.length - 1];
    const bossId = hostRule?.boss_id ?? 'titan';
    const bossCfg = this.data.bosses.find(b => b.boss_id === bossId) ?? this.data.finalBoss;
    const spawnOverride = hostRule?.boss_spawn_sec_override ?? 50;
    (bossCfg as { spawn_time_seconds: number }).spawn_time_seconds = spawnOverride;
    this.lavaQuestBossCfg = bossCfg;
    this.bossCtrl.reconfigure(bossCfg);

    this.ticketMultiplier = 1;
    this._resetSpawnSchedule();
    this._equipStartSkill();
    this._applyTalents();
    hudStore.set('/lobby/visible', false);
    hudStore.set('/game/lavaQuestActive', true);
    hudStore.setMany({
      '/scene/transitionText': `LAVA QUEST  Lv.${level}`,
      '/scene/transitionVisible': true,
      '/hud/stage': level,
      '/lobby/stageName': '라바 퀘스트',
      '/hud/hpPct': 100,
      '/pause/visible': false,
    });
    this._setGameState('PAUSED');
    focusPrismGameShell();
    if (this.transitionTimer !== null) window.clearTimeout(this.transitionTimer);
    this.transitionTimer = window.setTimeout(() => {
      hudStore.setMany({
        '/scene/transitionVisible': false,
        '/pause/visible': false,
      });
      this._spawnInitialXp();
      this._setGameState('PLAYING');
      focusPrismGameShell();
      this.transitionTimer = null;
    }, this._ct('scene_transition_ms', 3400));
  }
```

## R-CORE-03e grantReward (iframe 보상)

> `src/game/GameCore.ts` — grantReward() (메서드명 매칭)

```typescript

  grantReward(rewards: Array<{ kind: string; amount?: number; slotId?: string }
```

## R-CORE-04 App.tsx — EventBridge 초기화

```typescript
/* 3) EventBridge 초기화 — useEffect로 React 렌더 후 실행 (store 업데이트 정상 반영) */
  useEffect(() => {
    if (!eventData || !coreRef.current) return;
    const bridge = new EventBridge(eventData);
    coreRef.current.attachEventBridge(bridge);
    eventBridgeRef.current = bridge;
    return () => {
      eventBridgeRef.current?.dispose();
      eventBridgeRef.current = null;
      coreRef.current?.attachEventBridge(null);
    };
  }, [eventData]);
```

## R-CORE-05 App.tsx — postMessage 브릿지

```typescript
/* 4) 라바 퀘스트 ↔ 스퀘어 postMessage 브릿지 */
  useEffect(() => {
    const onMessage = (ev: MessageEvent) => {
      if (!ev.data) return;
      if (ev.data.type === 'aa:ready') {
        postToArcheryIframe({ type: 'host:archeryInit', ...archeryInitPayload() });
        return;
      }
      if (ev.data.type === 'aa:consumeBow') {
        const ok = archeryConsumeBow();
        postToArcheryIframe({
          type: ok ? 'host:bowConsumed' : 'host:bowDenied',
          ...archeryInitPayload(),
        });
        if (!ok) {
          const msg = '활대가 없습니다. 전투에서 몬스터 100마리 처치 시 활대 1개(5발)를 받을 수 있어요.';
          window.dispatchEvent(new CustomEvent('lobby:toast', { detail: msg }));
        }
        syncArcheryHud();
        return;
      }
      if (ev.data.type === 'aa:toast') {
        const msg = String(ev.data.message ?? '');
        if (msg) window.dispatchEvent(new CustomEvent('lobby:toast', { detail: msg }));
        return;
      }
      if (ev.data.type === 'aa:claimPending') {
        archerySetClaimPending(Boolean(ev.data.pending));
        refreshEventRedDots();
        return;
      }
      if (ev.data.type === 'aa:claimed') {
        archerySetClaimPending(false);
        postToArcheryIframe({ type: 'host:archeryInit', ...archeryInitPayload() });
        refreshEventRedDots();
        return;
      }
      /* 라바 퀘스트 도전 시작 → 스퀘어 게임 진입 */
      if (ev.data.type === 'lq:start_attempt') {
        const { level, isLastLevel } = ev.data as { level: number; isLastLevel: boolean };
        suspendEventMinigame();
        coreRef.current?.startLavaQuestMode(level, isLastLevel);
        return;
      }
      /* 이벤트 보상 실지급 (Prize Drop 마일스톤 / Lava Quest 단계 보상 공통) */
      if (ev.data.type === 'event:grant') {
        const rewards = (ev.data.rewards ?? []) as Array<{ kind: string; amount?: number; slotId?: string }>;
        const bundleId = ev.data.bundleId as string | undefined;
        const resolved = rewards.length
          ? rewards
          : (bundleId ? archeryBundleToGrant(bundleId) : []);
        coreRef.current?.grantReward(resolved);
        refreshEventRedDots();
        return;
      }
      if (ev.data.type === 'event:showRewardDetail') {
        coreRef.current?.refreshEquipHud();
        const detail = {
          kind: String(ev.data.kind ?? 'gold'),
          slotId: ev.data.slotId as string | undefined,
          label: ev.data.label as string | undefined,
          icon: ev.data.icon as string | undefined,
          amount: Number(ev.data.amount ?? 0) || undefined,
        } satisfies RewardDetailPayload;
        window.dispatchEvent(new CustomEvent('host:showRewardDetail', { detail }));
        return;
      }
    };
    window.addEventListener('message', onMessage);
```

## R-CORE-06 App.tsx — showEventHud 분기

```typescript
const iframeOpen = Boolean(hudSnap['/event/minigame/activeId'] && hudSnap['/event/minigame/visible']);
  /* 타이쿤·시즌: 일반 스테이지·라바 호스트 전투 모두 표시. 라바/퍼즐 iframe UI만 숨김 */
  const showEventHud = shouldShowEventHud(hudSnap) && !iframeOpen;
  const eventOverlayOpen = eventModalOpen
```

## R-CORE-07 prismHudSpec.ts

> SSoT: `src/jsonRender/prismHudSpec.ts` — RECIPE_CODE v4. 임의 수정 금지.

```typescript
/**
 * prismHudSpec.ts — HUD Spec 주문서
 * $state 경로 수정 시 hudExternalStore.ts + registry.tsx도 동시 패치
 */
import type { CatalogElement } from './catalog';

export const prismHudSpec: CatalogElement[] = [
  {
    type: 'PrismHudTopBar',
    visible: true,
    props: {},
  },
  {
    type: 'PrismLobbyScreen',
    visible: false,       // hudStore '/lobby/visible' 로 동적 제어
    props: {},
  },
  {
    type: 'PrismSceneTransition',
    visible: true,
    props: {
      visibleState: { $state: '/scene/transitionVisible' },
      text: { $state: '/scene/transitionText' },
    },
  },
  {
    type: 'PrismHudPauseBtn',
    visible: false,  // TopBar에 통합됨
    props: { action: 'TOGGLE_PAUSE' },
  },
  {
    type: 'PrismHudTimer',
    visible: false,  // TopBar에 통합됨
    props: { value: { $state: '/hud/timer' } },
  },
  {
    type: 'PrismHudExpBar',
    visible: false,  // TopBar에 통합됨
    props: {
      pct:   { $state: '/hud/expPct' },
      level: { $state: '/hud/level' },
    },
  },
  {
    type: 'PrismHudKillCount',
    visible: false,  // TopBar에 통합됨
    props: { value: { $state: '/hud/killCount' } },
  },
  {
    type: 'PrismHudGold',
    visible: false,  // TopBar에 통합됨
    props: { value: { $state: '/hud/gold' } },
  },
  {
    type: 'PrismHudPlayerHp',
    visible: true,
    props: { pct: { $state: '/hud/hpPct' } },
  },
  {
    type: 'PrismHudSkillSlots',
    visible: true,
    props: { slots: { $state: '/hud/activeSkillSlots' } },
  },
  {
    type: 'PrismHudBossHp',
    visible: false,       // hudStore '/hud/bossVisible' 로 동적 제어
    props: {
      pct:      { $state: '/hud/bossHpPct' },
      bossName: { $state: '/hud/bossName' },
    },
  },
  {
    type: 'PrismHudBossWarning',
    visible: false,       // hudStore '/hud/bossWarningVisible' 로 동적 제어
    props: {},
  },
  {
    type: 'PrismPauseScreen',
    visible: true,
    props: {},
  },
  {
    type: 'PrismRushWarning',
    visible: false,       // hudStore '/rushWave/visible' 로 동적 제어
    props: {},
  },
  {
    type: 'PrismBossIntro',
    visible: false,
    props: {},
  },
  {
    type: 'PrismBossDeath',
    visible: false,       // hudStore '/bossDeath/phase' 로 동적 제어
    props: {},
  },
  {
    type: 'PrismAdventureUp',
    visible: false,       // hudStore '/advUp/visible' 로 동적 제어
    props: {
      level:      { $state: '/advUp/level' },
      rewardGem:  { $state: '/advUp/rewardGem' },
      rewardGold: { $state: '/advUp/rewardGold' },
    },
  },
  {
    type: 'PrismChallengeScreen',
    visible: false,
    props: { items: { $state: '/challenge/items' } },
  },
  {
    type: 'PrismEvolutionScreen',
    visible: false,
    props: { items: { $state: '/evolution/items' }, gold: { $state: '/evolution/gold' }, dna: { $state: '/evolution/dna' } },
  },
  {
    type: 'PrismEquipScreen',
    visible: false,       // hudStore '/equip/visible' 로 동적 제어
    props: {
      items: { $state: '/equip/items' },
      gold:  { $state: '/equip/gold' },
      atk:   { $state: '/equip/atk' },
      hp:    { $state: '/equip/hp' },
      spd:   { $state: '/equip/spd' },
      weapons: { $state: '/equip/weapons' },
      selectedWeaponId: { $state: '/equip/selectedWeaponId' },
    },
  },
  {
    type: 'PrismShopScreen',
    visible: false,
    props: {
      cashKrw:     { $state: '/shop/cashKrw' },
      gems:        { $state: '/shop/gems' },
      metaGold:    { $state: '/shop/metaGold' },
      energy:      { $state: '/shop/energy' },
      supplyKeys:  { $state: '/shop/supplyKeys' },
      defensePity: { $state: '/shop/defensePity' },
      purchasedGemIds: { $state: '/shop/purchasedGemIds' },
      gemPacks:    { $state: '/shop/gemPacks' },
      goldPacks:   { $state: '/shop/goldPacks' },
      boxes:       { $state: '/shop/boxes' },
      maxEnergy:   { $state: '/shop/maxEnergy' },
      showResetButton: { $state: '/shop/showResetButton' },
      testCashKrw: { $state: '/shop/testCashKrw' },
    },
  },
  {
    type: 'PrismTalentScreen',
    visible: false,       // hudStore '/talent/visible' 로 동적 제어
    props: {
      items: { $state: '/talent/items' },
      gold:  { $state: '/talent/gold' },
    },
  },
  {
    type: 'PrismBattlePopup',
    visible: false,       // hudStore '/battle/visible' 로 동적 제어
    props: {
      options:      { $state: '/battle/options' },
      selectedMult: { $state: '/battle/selectedMult' },
      energy:       { $state: '/battle/energy' },
    },
  },
  {
    type: 'PrismEnergyShop',
    visible: false,       // hudStore '/energy/visible' 로 동적 제어
    props: {
      cur:  { $state: '/energy/cur' },
      gems: { $state: '/energy/gems' },
    },
  },
  {
    type: 'PrismLuckyTrain',
    visible: false,       // hudStore '/luckyTrain/visible' 로 동적 제어
    props: {
      gold:       { $state: '/luckyTrain/gold' },
      skills:     { $state: '/luckyTrain/skills' },
      selectedId: { $state: '/luckyTrain/selectedId' },
    },
  },
  {
    type: 'PrismSkillModal',
    visible: false,       // hudStore '/modal/visible' 로 동적 제어
    props: { cards: { $state: '/modal/cards' } },
  },
  {
    type: 'PrismResultScreen',
    visible: false,       // hudStore '/result/visible' 로 동적 제어
    props: {
      isVictory:    { $state: '/result/isVictory' },
      killCount:    { $state: '/result/killCount' },
      survivalTime: { $state: '/result/survivalTime' },
      finalLevel:   { $state: '/result/finalLevel' },
      goldEarned:   { $state: '/result/goldEarned' },
    },
  },
  {
    type: 'PrismAvatarSelect',
    visible: false,
    props: {},
  },
];
```

## R-CORE-08 eventMinigameHost.ts

> SSoT: `src/game/eventMinigameHost.ts` — RECIPE_CODE v4. 임의 수정 금지.

```typescript
/**
 * iframe 미니게임 단일 호스트 — 열기/닫기/교체/일시중지(라바 전투)
 */
import { hudStore, type HudState } from './hudExternalStore';
import {
  EVENT_MINIGAMES,
  type EventMinigameId,
} from './eventMinigameRegistry';
import { markRedDotSeen } from './redDot/redDotSeen';
import { refreshRedDots } from './redDot/RedDotService';

const MINIGAME_NEW_DOT: Record<EventMinigameId, string> = {
  lava: 'lava_new',
  prize: 'prize_new',
  archery: 'archery_new',
};

export { EVENT_MINIGAMES, EVENT_MINIGAME_ORDER, type EventMinigameId } from './eventMinigameRegistry';

const IFRAME_SELECTOR = '[data-prism-event-minigame]';
const GAME_SHELL_SELECTOR = '[data-prism-game-shell]';

/** iframe 포커스가 남으면 부모 window 키보드(WASD)가 먹히지 않음 — 라바 전투 진입 시 필수 */
export function focusPrismGameShell() {
  const iframe = getActiveMinigameIframe();
  if (iframe) iframe.blur();
  const active = document.activeElement;
  if (active instanceof HTMLElement && active !== iframe) {
    active.blur();
  }
  const shell = document.querySelector(GAME_SHELL_SELECTOR) as HTMLElement | null;
  if (!shell) return;
  if (!shell.hasAttribute('tabindex')) shell.setAttribute('tabindex', '-1');
  shell.focus({ preventScroll: true });
}

function syncLegacyIframeFields(patch: Record<string, unknown>) {
  const id = patch['/event/minigame/activeId'] as EventMinigameId | '' | undefined;
  const visible = patch['/event/minigame/visible'] as boolean | undefined;
  const mountKey = patch['/event/minigame/mountKey'] as number | undefined;
  const legacy: Record<string, unknown> = {};
  if (mountKey !== undefined) legacy['/iframe/mountKey'] = mountKey;
  if (visible !== undefined) legacy['/iframe/visible'] = visible;
  if (id !== undefined) {
    legacy['/iframe/src'] = id && EVENT_MINIGAMES[id as EventMinigameId]
      ? EVENT_MINIGAMES[id as EventMinigameId].src
      : '';
  }
  if (Object.keys(legacy).length) hudStore.setMany(legacy);
}

function postToActiveIframe(msg: Record<string, unknown>) {
  const el = document.querySelector(IFRAME_SELECTOR) as HTMLIFrameElement | null;
  el?.contentWindow?.postMessage(msg, '*');
}

/** 세션·저장 데이터 정리 (다른 미니게임 진입 시) */
export function disposeMinigameSession(id: EventMinigameId) {
  postToActiveIframe({ type: 'host:eventDispose', eventId: id });
  const cfg = EVENT_MINIGAMES[id];
  for (const key of cfg.persistKeys) {
    try { localStorage.removeItem(key); } catch { /* ignore */ }
  }
}

export function getActiveMinigameId(): EventMinigameId | '' {
  return (hudStore.getSnapshot()['/event/minigame/activeId'] as EventMinigameId | '') || '';
}

export function isEventMinigameOpen(): boolean {
  const s = hudStore.getSnapshot();
  return Boolean(s['/event/minigame/activeId'] && s['/event/minigame/visible']);
}

export function closeEventMinigame() {
  window.dispatchEvent(new CustomEvent('host:closeRewardDetail'));
  
  hudStore.setMany({
    '/scene/transitionText': 'RETURN TO LOBBY',
    '/scene/transitionVisible': true,
  });

  window.setTimeout(() => {
    const id = getActiveMinigameId();
    if (id) disposeMinigameSession(id);
    hudStore.setMany({
      '/event/minigame/activeId': '',
      '/event/minigame/visible': false,
      '/event/minigame/suspended': false,
      '/event/minigame/mountKey': Number(hudStore.getSnapshot()['/event/minigame/mountKey'] ?? 0),
    });
    syncLegacyIframeFields({
      '/event/minigame/activeId': '',
      '/event/minigame/visible': false,
      '/event/minigame/mountKey': hudStore.getSnapshot()['/event/minigame/mountKey'],
    });
  }, 850);

  window.setTimeout(() => {
    hudStore.set('/scene/transitionVisible', false);
  }, 2650);
}

/** 쇼핑몰·드라이버 등 다른 풀스크린 UI 진입 시 */
export function hideEventMinigameForOverlay() {
  if (!getActiveMinigameId()) return;
  closeEventMinigame();
}

/**
 * 미니게임 입장 — 항상 이전 세션 종료 후 remount (라바↔퍼즐 동일 규칙)
 */
export function openEventMinigame(id: EventMinigameId) {
  const cfg = EVENT_MINIGAMES[id];
  markRedDotSeen(MINIGAME_NEW_DOT[id]);
  refreshRedDots();
  const snap = hudStore.getSnapshot();
  if (cfg.ticketCost > 0) {
    const ticketKey = cfg.ticketPath as keyof HudState;
    const tickets = Number(snap[ticketKey] ?? 0);
    if (tickets < cfg.ticketCost) {
      window.dispatchEvent(new CustomEvent('lobby:toast', { detail: '재화가 부족합니다' }));
      return;
    }
    hudStore.set(ticketKey, (tickets - cfg.ticketCost) as HudState[typeof ticketKey]);
  }

  hudStore.setMany({
    '/scene/transitionText': id === 'lava' ? 'LAVA QUEST' : id === 'prize' ? 'PUZZLE DROP' : 'ARCHERY ARENA',
    '/scene/transitionVisible': true,
  });

  window.setTimeout(() => {
    const prev = getActiveMinigameId();
    if (prev) disposeMinigameSession(prev);

    window.dispatchEvent(new CustomEvent('host:closeRewardDetail'));

    const mountKey = Number(snap['/event/minigame/mountKey'] ?? 0) + 1;
    hudStore.setMany({
      '/event/minigame/activeId': id,
      '/event/minigame/visible': true,
      '/event/minigame/suspended': false,
      '/event/minigame/mountKey': mountKey,
    });
    syncLegacyIframeFields({
      '/event/minigame/activeId': id,
      '/event/minigame/visible': true,
      '/event/minigame/mountKey': mountKey,
    });
  }, 850);

  window.setTimeout(() => {
    hudStore.set('/scene/transitionVisible', false);
  }, 2650);
}

/** 라바 — 스퀘어 전투 진입 (iframe DOM 유지, 세션 유지) */
export function suspendEventMinigame() {
  window.dispatchEvent(new CustomEvent('host:closeRewardDetail'));
  const iframe = getActiveMinigameIframe();
  if (iframe) iframe.setAttribute('inert', '');
  hudStore.setMany({
    '/event/minigame/visible': false,
    '/event/minigame/suspended': true,
  });
  syncLegacyIframeFields({ '/event/minigame/visible': false });
  focusPrismGameShell();
}

/** 라바 — 전투 종료 후 iframe 복귀 */
export function resumeEventMinigame() {
  if (!getActiveMinigameId()) return;
  getActiveMinigameIframe()?.removeAttribute('inert');
  hudStore.setMany({
    '/event/minigame/visible': true,
    '/event/minigame/suspended': false,
  });
  syncLegacyIframeFields({ '/event/minigame/visible': true });
}

export function getActiveMinigameIframe(): HTMLIFrameElement | null {
  return document.querySelector(IFRAME_SELECTOR) as HTMLIFrameElement | null;
}

/** @deprecated — eventMinigameHost 사용 */
export const closeEventIframe = closeEventMinigame;
export const openEventIframe = (src: string) => {
  const id = (Object.keys(EVENT_MINIGAMES) as EventMinigameId[]).find(
    k => EVENT_MINIGAMES[k].src === src,
  );
  if (id) openEventMinigame(id);
};
export const hideEventIframeForOverlay = hideEventMinigameForOverlay;
```

## R-CORE-09 hudExternalStore.ts ($state 전체 SSoT)

> SSoT: `src/game/hudExternalStore.ts` — RECIPE_CODE v4. 임의 수정 금지.

```typescript
/**
 * hudExternalStore.ts — $state 브릿지
 * $state 경로 수정 시 반드시 동시 패치:
 *   1) 이 파일 키  2) prismHudSpec.ts $state 문자열  3) registry.tsx
 */

type HudState = {
  '/lobby/visible': boolean;
  '/lobby/selectedStage': number;
  '/lobby/maxStages': number;
  '/lobby/stageEnemyMult': number;
  '/lobby/ticketSummary': string;
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
  '/lobby/selectedPlayerId': string;
  '/lobby/selectedPlayerColorHex': string;
  '/avatar/visible': boolean;
  '/avatar/players': AvatarItem[];
  '/avatar/selectedId': string;
  '/lobby/advLevel': number;
  '/lobby/advExpPct': number;
  '/lobby/gems': number;
  '/lobby/metaGold': number;
  '/meta/avatarProfileLimit': number;
  '/lobby/entryTickets': number;
  '/lobby/lavaTickets': number;        // 라바 티켓
  '/lobby/prizeBalls': number;         // 프라이즈 볼
  '/lobby/archeryBowStands': number;   // 양궁 활대
  '/lobby/showLavaQuest': boolean;     // 이벤트 카드 노출
  '/lobby/showPrizeDrop': boolean;     // 이벤트 카드 노출
  '/lobby/showArcheryArena': boolean;  // 양궁 아레나 탭
  '/archery/killsTowardBow': number;
  '/archery/claimPending': boolean;
  '/event/redDot/lava': boolean;
  '/event/redDot/prize': boolean;
  '/event/redDot/archery': boolean;
  '/event/redDot/tycoon': boolean;
  '/event/redDot/season': boolean;
  '/event/redDot/express': boolean;
  '/event/redDot/mall': boolean;
  '/event/redDot/drivers': boolean;
  /** CSV red_dot_config → hud_path (claim/action/new) */
  '/redDot/tycoon/claim': boolean;
  '/redDot/tycoon/action': boolean;
  '/redDot/tycoon/new': boolean;
  '/redDot/season/claim': boolean;
  '/redDot/season/action': boolean;
  '/redDot/season/new': boolean;
  '/redDot/express/claim': boolean;
  '/redDot/express/action': boolean;
  '/redDot/lava/claim': boolean;
  '/redDot/lava/action': boolean;
  '/redDot/lava/new': boolean;
  '/redDot/prize/claim': boolean;
  '/redDot/prize/action': boolean;
  '/redDot/prize/new': boolean;
  '/redDot/archery/claim': boolean;
  '/redDot/archery/action': boolean;
  '/redDot/archery/new': boolean;
  '/redDot/event_stack/any': boolean;
  '/redDot/mall/claim': boolean;
  '/redDot/mall/new': boolean;
  '/redDot/drivers/action': boolean;
  '/redDot/drivers/new': boolean;
  '/redDot/nav/shop': boolean;
  '/redDot/nav/shop/new': boolean;
  '/redDot/nav/equip': boolean;
  '/redDot/nav/equip/new': boolean;
  '/redDot/nav/equip/action': boolean;
  '/redDot/nav/challenge': boolean;
  '/redDot/nav/challenge/new': boolean;
  '/redDot/nav/challenge/action': boolean;
  '/redDot/nav/evolution': boolean;
  '/redDot/nav/evolution/new': boolean;
  '/redDot/nav/evolution/action': boolean;
  '/redDot/nav/battle': boolean;
  '/lobby/showMallMarvels': boolean;   // 쇼핑몰의 경이로움 사이드 탭
  '/lobby/showDriversJoy': boolean;    // 드라이버의 기쁨 사이드 탭
  '/lobby/menuOpen': boolean;          // 햄버거 메뉴 (App z55 레이어)
  /** @deprecated 레거시 — eventMinigameHost가 동기화 */
  '/iframe/visible': boolean;
  '/iframe/src': string;
  '/iframe/mountKey': number;
  /** iframe 미니게임 단일 호스트 (lava | prize) */
  '/event/minigame/activeId': string;
  '/event/minigame/visible': boolean;
  '/event/minigame/suspended': boolean;
  '/event/minigame/mountKey': number;
  '/game/lavaQuestActive': boolean;    // 라바 퀘스트 호스트 전투 모드 (GameCore 웨이브·보스 분기)
  '/lobby/selectedMult': number;
  '/lobby/multEnergyCost': number;
  '/lobby/stageName': string;
  '/lobby/bestTime': string;
  '/toast/visible': boolean;
  '/toast/text': string;
  '/advUp/visible': boolean;
  '/advUp/level': number;
  '/advUp/rewardGem': number;
  '/advUp/rewardGold': number;
  '/challenge/visible': boolean;
  '/challenge/items': ChallengeItem[];
  '/evolution/visible': boolean;
  '/evolution/items': EvoNodeItem[];
  '/evolution/gold': number;
  '/evolution/dna': number;
  '/equip/visible': boolean;
  '/equip/items': EquipItem[];
  '/equip/gold': number;
  '/equip/atk': number;
  '/equip/hp': number;
  '/equip/spd': number;
  '/equip/weapons': WeaponItem[];
  '/equip/selectedWeaponId': string;
  '/shop/visible': boolean;
  '/shop/cashKrw': number;
  '/shop/gems': number;
  '/shop/metaGold': number;
  '/shop/energy': number;
  '/shop/supplyKeys': number;
  '/shop/defensePity': number;
  '/shop/purchasedGemIds': string[];
  '/shop/gemPacks': ShopGemPackHud[];
  '/shop/goldPacks': ShopGoldPackHud[];
  '/shop/boxes': ShopBoxHud[];
  '/shop/maxEnergy': number;
  '/shop/showResetButton': boolean;
  '/shop/testCashKrw': number;
  '/talent/visible': boolean;
  '/talent/items': TalentItem[];
  '/talent/gold': number;
  '/battle/visible': boolean;
  '/battle/options': MultOption[];
  '/battle/selectedMult': number;
  '/battle/energy': number;
  '/battle/maxEnergy': number;
  '/energy/visible': boolean;
  '/energy/cur': number;
  '/energy/max': number;
  '/energy/gems': number;
  '/rushWave/visible': boolean;
  '/bossIntro/phase': 0 | 1 | 2 | 3; // 0=없음, 1=WARNING, 2=스폰연출, 3=등장충격
  '/bossDeath/phase': 0 | 1 | 2 | 3; // 0=없음, 1=폭발플래시, 2=VICTORY, 3=페이드
  '/bossDeath/bossName': string;
  '/pause/visible': boolean;
  '/luckyTrain/visible': boolean;
  '/luckyTrain/gold': number;
  '/luckyTrain/skills': LuckyTrainSkillItem[];
  '/luckyTrain/selectedId': string;
  '/result/visible': boolean;
  '/result/isVictory': boolean;
  '/result/killCount': number;
  '/result/survivalTime': string;
  '/result/finalLevel': number;
  '/result/totalXpEarned': number;
  '/result/goldEarned': number;
  '/result/tycoonEarned': number;
  '/result/ticketMultiplier': number;
  '/vfx/flashOpacity': number;
  '/vfx/flashColor': string;
};

export interface ChallengeItem {
  challenge_id: number;
  stage: number;
  stage_name: string;
  difficulty: number;
  difficulty_name: string;
  enemy_hp_mult: number;
  enemy_dmg_mult: number;
  reward_dna: number;
  reward_gold: number;
  prereq_id: number;
  prereq_label: string;
  cleared: boolean;
  unlocked: boolean;
}

export interface ShopGemPackHud {
  pack_id: string;
  label: string;
  gems: number;
  bonus_gems: number;
  price_krw: number;
}

export interface ShopGoldPackHud {
  pack_id: string;
  label: string;
  sublabel: string;
  gold: number;
  gem_cost: number;
  is_free: boolean;
}

export interface ShopBoxHud {
  box_id: string;
  label: string;
  subtitle: string;
  gem_cost: number;
  key_cost: number;
  pity_max: number;
  banner_title: string;
  banner_desc: string;
}

export interface EvoNodeItem {
  evo_id: number;
  order: number;
  branch: number;         // 0=일반(골드), 1=특수(DNA)
  node_name: string;
  node_title: string;
  node_description: string;
  icon: string;
  ability_type: string;
  effect_label: string;   // "공격력 +6%"
  cost_type: string;      // gold / dna
  cost_amount: number;
  unlocked: boolean;
  affordable: boolean;
  available: boolean;     // prereq 충족 + 미해금
}

export interface AvatarItem {
  player_id: string;
  max_hp: number;
  base_speed: number;
  color_hex: string;
  unlocked: boolean;
  selected: boolean;
}

export interface EquipItem {
  slot_id: string;
  slot_name: string;
  item_name: string;
  icon: string;
  grade: string;
  stat_type: 'power' | 'hp' | 'speed';
  current_level: number;
  max_level: number;
  current_stat: string;   // "ATK +36%"
  next_cost: number;      // 0 = 만렙
  description: string;
  equipped: boolean;      // 장착 여부 (스탯 반영 + 머리 위 버프 아이콘)
  skill_id: string;       // 무기 아이템: 장착 시 기본 공격 스킬 (그 외 빈값)
}

export interface WeaponItem {
  weapon_id: string;
  item_name: string;
  icon: string;
  grade: string;
  skill_id: string;
  description: string;
  selected: boolean;
}

export interface TalentItem {
  talent_id: string;
  talent_name: string;
  description: string;
  icon: string;
  current_level: number;
  max_level: number;
  current_effect: string;   // 현재 효과 표시 ("+30%")
  next_effect: string;      // 다음 레벨 효과 ("+45%")
  next_cost: number;        // 다음 레벨 비용 (0 = 만렙)
}

export interface MultOption {
  mult: number;       // 배수 (1/2/5/10/50/100)
  energy: number;     // 소모 번개
  affordable: boolean;
}

export interface LuckyTrainSkillItem {
  skill_id: string;
  skill_name: string;
  icon: string;
  description: string;
  skill_type: string;
  gold_cost: number;
  owned_level: number; // 0 = 미보유
}

export interface SkillCardData {
  skill_id: string;
  skill_name: string;
  icon: string;
  description: string;
  current_level: number;
  max_level: number;
  is_new: boolean;
  is_evolution?: boolean;
  evo_recipe?: {
    active_icon: string;
    active_name: string;
    passive_icon: string;
    passive_name: string;
  };
}

type Listener = () => void;

class HudExternalStore {
  private state: HudState = {
    '/lobby/visible': true,
    '/lobby/selectedStage': 1,
    '/lobby/maxStages': 10,
    '/lobby/stageEnemyMult': 1.0,
    '/lobby/ticketSummary': '',
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
    '/lobby/selectedPlayerId': 'default',
    '/lobby/selectedPlayerColorHex': '#7BE8F4',
    '/avatar/visible': false,
    '/avatar/players': [],
    '/avatar/selectedId': 'default',
    '/lobby/advLevel': 1,
    '/lobby/advExpPct': 0,
    '/lobby/gems': 500,
    '/lobby/metaGold': 0,
    '/meta/avatarProfileLimit': 16,
    '/lobby/entryTickets': 10,
    '/lobby/lavaTickets': 3,
    '/lobby/prizeBalls': 5,
    '/lobby/archeryBowStands': 5,
    '/lobby/showLavaQuest': true,
    '/lobby/showPrizeDrop': true,
    '/lobby/showArcheryArena': true,
    '/archery/killsTowardBow': 0,
    '/archery/claimPending': false,
    '/event/redDot/lava': false,
    '/event/redDot/prize': false,
    '/event/redDot/archery': false,
    '/event/redDot/tycoon': false,
    '/event/redDot/season': false,
    '/event/redDot/express': false,
    '/event/redDot/mall': false,
    '/event/redDot/drivers': false,
    '/redDot/tycoon/claim': false,
    '/redDot/tycoon/action': false,
    '/redDot/tycoon/new': false,
    '/redDot/season/claim': false,
    '/redDot/season/action': false,
    '/redDot/season/new': false,
    '/redDot/express/claim': false,
    '/redDot/express/action': false,
    '/redDot/lava/claim': false,
    '/redDot/lava/action': false,
    '/redDot/lava/new': false,
    '/redDot/prize/claim': false,
    '/redDot/prize/action': false,
    '/redDot/prize/new': false,
    '/redDot/archery/claim': false,
    '/redDot/archery/action': false,
    '/redDot/archery/new': false,
    '/redDot/event_stack/any': false,
    '/redDot/mall/claim': false,
    '/redDot/mall/new': false,
    '/redDot/drivers/action': false,
    '/redDot/drivers/new': false,
    '/redDot/nav/shop': false,
    '/redDot/nav/shop/new': false,
    '/redDot/nav/equip': false,
    '/redDot/nav/equip/new': false,
    '/redDot/nav/equip/action': false,
    '/redDot/nav/challenge': false,
    '/redDot/nav/challenge/new': false,
    '/redDot/nav/challenge/action': false,
    '/redDot/nav/evolution': false,
    '/redDot/nav/evolution/new': false,
    '/redDot/nav/evolution/action': false,
    '/redDot/nav/battle': false,
    '/lobby/showMallMarvels': true,
    '/lobby/showDriversJoy': true,
    '/lobby/menuOpen': false,
    '/iframe/visible': false,
    '/iframe/src': '',
    '/iframe/mountKey': 0,
    '/event/minigame/activeId': '',
    '/event/minigame/visible': false,
    '/event/minigame/suspended': false,
    '/event/minigame/mountKey': 0,
    '/game/lavaQuestActive': false,
    '/lobby/selectedMult': 1,
    '/lobby/multEnergyCost': 5,
    '/lobby/stageName': '야생 거리',
    '/lobby/bestTime': '--:--',
    '/toast/visible': false,
    '/toast/text': '',
    '/advUp/visible': false,
    '/advUp/level': 1,
    '/advUp/rewardGem': 0,
    '/advUp/rewardGold': 0,
    '/challenge/visible': false,
    '/challenge/items': [],
    '/evolution/visible': false,
    '/evolution/items': [],
    '/evolution/gold': 0,
    '/evolution/dna': 0,
    '/equip/visible': false,
    '/equip/items': [],
    '/equip/gold': 0,
    '/equip/atk': 0,
    '/equip/hp': 0,
    '/equip/spd': 0,
    '/equip/weapons': [],
    '/equip/selectedWeaponId': 'revolver',
    '/shop/visible': false,
    '/shop/cashKrw': 1_000_000,
    '/shop/gems': 500,
    '/shop/metaGold': 0,
    '/shop/energy': 0,
    '/shop/supplyKeys': 0,
    '/shop/defensePity': 0,
    '/shop/purchasedGemIds': [],
    '/shop/gemPacks': [],
    '/shop/goldPacks': [],
    '/shop/boxes': [],
    '/shop/maxEnergy': 60,
    '/shop/showResetButton': true,
    '/shop/testCashKrw': 1_000_000,
    '/talent/visible': false,
    '/talent/items': [],
    '/talent/gold': 0,
    '/battle/visible': false,
    '/battle/options': [],
    '/battle/selectedMult': 1,
    '/battle/energy': 10,
    '/battle/maxEnergy': 60,
    '/energy/visible': false,
    '/energy/cur': 10,
    '/energy/max': 60,
    '/energy/gems': 0,
    '/rushWave/visible': false,
    '/bossIntro/phase': 0,
    '/bossDeath/phase': 0,
    '/bossDeath/bossName': '',
    '/pause/visible': false,
    '/luckyTrain/visible': false,
    '/luckyTrain/gold': 0,
    '/luckyTrain/skills': [],
    '/luckyTrain/selectedId': '',
    '/modal/visible': false,
    '/modal/cards': [],
    '/result/visible': false,
    '/result/isVictory': false,
    '/result/killCount': 0,
    '/result/survivalTime': '00:00',
    '/result/finalLevel': 1,
    '/result/totalXpEarned': 0,
    '/result/goldEarned': 0,
    '/result/tycoonEarned': 0,
    '/result/ticketMultiplier': 1,
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
```

## R-CORE-10 eventMinigameRegistry.ts (iframe 등록)

> SSoT: `src/game/eventMinigameRegistry.ts` — RECIPE_CODE v4. 임의 수정 금지.

```typescript
/**
 * iframe 미니게임 이벤트 — Lava / Prize Drop / Archery 호스트 SSoT
 * 런타임 메타는 event_minigame_host_config.csv → loadAllGameData → initEventMinigamesFromData
 */
import type { EventMinigameHostConfig } from './data';

export type EventMinigameConfig = EventMinigameHostConfig & {
  id: EventMinigameId;
};

export type EventMinigameId = 'lava' | 'prize' | 'archery';

const FALLBACK: Record<EventMinigameId, EventMinigameConfig> = {
  lava: {
    id: 'lava',
    label: '라바',
    emoji: '🌋',
    tabBg: '#FFB347',
    src: '/event/lavaQuest/index.html',
    ticketPath: '/lobby/lavaTickets',
    ticketCost: 1,
    ticketUnit: '장',
    showFlag: '/lobby/showLavaQuest',
    persistKeys: ['lq_session_v1'],
    enabled: true,
  },
  prize: {
    id: 'prize',
    label: '퍼즐',
    emoji: '🎰',
    tabBg: '#B388FF',
    src: '/event/prizeDrop/index.html',
    ticketPath: '/lobby/prizeBalls',
    ticketCost: 1,
    ticketUnit: '개',
    showFlag: '/lobby/showPrizeDrop',
    persistKeys: [],
    enabled: true,
  },
  archery: {
    id: 'archery',
    label: '양궁',
    emoji: '🏹',
    tabBg: '#7EC8A8',
    src: '/event/archeryArena/index.html',
    ticketPath: '/lobby/archeryBowStands',
    ticketCost: 0,
    ticketUnit: '대',
    showFlag: '/lobby/showArcheryArena',
    persistKeys: ['aa_player_state', 'aa_event_meta', 'aa_ranking_bots', 'aa_ranking_dummy_schema'],
    enabled: true,
  },
};

let EVENT_MINIGAMES: Record<string, EventMinigameConfig> = { ...FALLBACK };
let EVENT_MINIGAME_ORDER: EventMinigameId[] = ['lava', 'prize', 'archery'];

function isKnownId(id: string): id is EventMinigameId {
  return id === 'lava' || id === 'prize' || id === 'archery';
}

/** CSV 로드 직후 App에서 1회 호출 */
export function initEventMinigamesFromData(rows: EventMinigameHostConfig[], order?: string[]) {
  const next: Record<string, EventMinigameConfig> = { ...FALLBACK };
  const ord: EventMinigameId[] = [];
  for (const row of rows) {
    if (!row.enabled || !isKnownId(row.id)) continue;
    next[row.id] = { ...row, id: row.id };
    ord.push(row.id);
  }
  if (order?.length) {
    for (const id of order) {
      if (isKnownId(id) && next[id] && !ord.includes(id)) ord.push(id);
    }
  }
  EVENT_MINIGAMES = next;
  EVENT_MINIGAME_ORDER = ord.length ? ord : ['lava', 'prize', 'archery'];
}

export { EVENT_MINIGAMES, EVENT_MINIGAME_ORDER };
```

---

조립 절차 전문: `ATTACH_MODULES_v4.md`
