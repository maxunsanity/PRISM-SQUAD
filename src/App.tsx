import React, { useEffect, useLayoutEffect, useRef, useState, Component } from 'react';

/* 이벤트 UI 에러 격리 — 이벤트가 뻗어도 게임은 계속 */
class EventErrorBoundary extends Component<
  { children: React.ReactNode },
  { hasError: boolean }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError() { return { hasError: true }; }
  render() {
    if (this.state.hasError) return null; // 이벤트 UI 조용히 숨김
    return this.props.children;
  }
}
import { loadAllGameData, type GameData, type VfxConfig } from './game/data';
import { initEventMinigamesFromData } from './game/eventMinigameRegistry';
import { catalog } from './jsonRender/catalog';
import { prismHudSpec } from './jsonRender/prismHudSpec';
import { registry } from './jsonRender/registry';
import { CommonTopBar } from './jsonRender/registry';
import { hudStore } from './game/hudExternalStore';
import { Renderer3D } from './three/Renderer3D';
import { GameCore } from './game/GameCore';
import { ToastOverlay } from './jsonRender/ToastOverlay';
import { RewardDetailOverlay, type RewardDetailPayload } from './jsonRender/RewardDetailOverlay';
import { EventMinigameOverlay } from './jsonRender/EventMinigameOverlay';
import { getMinigameCurrencyService } from './game/minigameCurrency';
import {
  suspendEventMinigame,
  getActiveMinigameIframe,
  getActiveMinigameId,
} from './game/eventMinigameHost';
import {
  archeryWalletSyncMsg,
  setArcheryBowStands,
  archerySetClaimPending,
  archeryBundleToGrant,
  syncArcheryHud,
  ensureArcheryStarterBows,
  preloadArcheryCsvConfig,
} from './game/archeryMeta';
import { preloadRedDotConfig, refreshEventRedDots, markRedDotSeen } from './game/eventRedDots';
import { LobbyMenuDropdown } from './jsonRender/LobbyMenuDropdown';
import { SalesEventOverlay } from './eventSystem/sales/SalesEventOverlay';
import { bindSalesToCore, rebindSalesFromBundle, unbindSales } from './eventSystem/sales/salesRuntime';
import { loadAllSalesEventData } from './eventSystem/sales/loadSalesEventData';
import { mallMarvelsStore } from './eventSystem/mallMarvels/store';
import { driversJoyStore } from './eventSystem/driversJoy/store';
import { useSyncExternalStore } from 'react';
import {
  loadAllEventData,
  eventCatalog,
  eventHudSpec,
  EventHudRenderer,
  EventDataProvider,
  EventBridge,
  eventStore,
  eventModalOpen,
  EventCurrencyFlyOverlay,
  EventTooltipOverlay,
  eventHudLayerTop,
  EVENT_MILEAGE_WRAP_PAD,
  type EventData,
} from './eventSystem';

/** 전투 로비(하단 「전투」탭) — 상점·장비·도전·진화 등 다른 탭에서는 이벤트 HUD 숨김 */
function isBattleLobbyScreen(snap: ReturnType<typeof hudStore.getSnapshot>): boolean {
  if (!snap['/lobby/visible']) return false;
  return !snap['/shop/visible']
    && !snap['/equip/visible']
    && !snap['/challenge/visible']
    && !snap['/evolution/visible']
    && !snap['/talent/visible']
    && !snap['/energy/visible']
    && !snap['/avatar/visible'];
}

/** 인게임 전투 중(로비·결과·일시정지 제외) */
function isCombatScreen(snap: ReturnType<typeof hudStore.getSnapshot>): boolean {
  return !snap['/lobby/visible']
    && !snap['/result/visible']
    && !snap['/pause/visible'];
}

function shouldShowEventHud(snap: ReturnType<typeof hudStore.getSnapshot>): boolean {
  return isBattleLobbyScreen(snap) || isCombatScreen(snap);
}

/* ── 9:16 뷰포트 크기 계산 (JS) ── */
function calc916(): { w: number; h: number } {
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  if (vw / vh > 9 / 16) {
    // 가로가 9:16보다 넓음 → 세로 기준
    return { w: Math.floor(vh * 9 / 16), h: vh };
  } else {
    // 세로가 9:16보다 긴 (또는 딱 맞음) → 가로 기준
    return { w: vw, h: Math.floor(vw * 16 / 9) };
  }
}

/* ── 화면 플래시 오버레이 ── */
function FlashOverlay() {
  // 요청사항: 화면 전체 붉은/플래시 오버레이 연출 비활성화
  return null;
}

/* ── HUD 렌더러 ── */
function PrismHudRenderer({ slot }: { slot: 'top' | 'bar' | 'modal' }) {
  useSyncExternalStore(
    cb => hudStore.subscribe(cb),
    () => hudStore.getSnapshot(),
  );

  const topTypes = new Set([
    'PrismHudTopBar',
  ]);
  const barTypes = new Set([
    'PrismHudBossHp', 'PrismHudBossWarning', 'PrismHudSkillSlots', 'PrismRushWarning',
  ]);
  const modalTypes = new Set([
    'PrismLobbyScreen', 'PrismSkillModal', 'PrismResultScreen', 'PrismSceneTransition', 'PrismLuckyTrain', 'PrismPauseScreen', 'PrismBossIntro', 'PrismBossDeath', 'PrismBattlePopup', 'PrismEnergyShop', 'PrismTalentScreen', 'PrismEquipScreen', 'PrismShopScreen', 'PrismChallengeScreen', 'PrismEvolutionScreen', 'PrismAdventureUp', 'PrismAvatarSelect',
  ]);

  const elements = catalog.validate(prismHudSpec);
  return (
    <>
      {elements.map((el, i) => {
        const inSlot = slot === 'top'
          ? topTypes.has(el.type)
          : slot === 'bar'
            ? barTypes.has(el.type)
            : modalTypes.has(el.type);
        if (!inSlot) return null;
        const fn = registry[el.type];
        if (!fn) return null;
        return (
          <React.Fragment key={i}>
            {fn((el as { props: Record<string, unknown> }).props)}
          </React.Fragment>
        );
      })}
    </>
  );
}

/* ── 메인 App ── */
export default function App() {
  const canvasRef  = useRef<HTMLCanvasElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const coreRef    = useRef<GameCore | null>(null);
  const rendRef    = useRef<Renderer3D | null>(null);
  const eventBridgeRef = useRef<EventBridge | null>(null);

  const [gameData, setGameData] = useState<GameData | null>(null);
  const [eventData, setEventData] = useState<EventData | null>(null);
  const [error,    setError   ] = useState<string | null>(null);

  /* ── 9:16 뷰포트 크기 (JS 계산) ── */
  const [vp, setVp] = useState<{ w: number; h: number }>(calc916);

  /* 모달 레이어 클릭 통과 제어용 hud 구독 (훅은 early return보다 위) */
  const hudSnap = useSyncExternalStore(cb => hudStore.subscribe(cb), () => hudStore.getSnapshot());
  const eventSnap = useSyncExternalStore(cb => eventStore.subscribe(cb), () => eventStore.getSnapshot());
  const mallSnap = useSyncExternalStore(cb => mallMarvelsStore.subscribe(cb), () => mallMarvelsStore.getSnapshot());
  const driversSnap = useSyncExternalStore(cb => driversJoyStore.subscribe(cb), () => driversJoyStore.getSnapshot());

  useLayoutEffect(() => {
    // 초기 크기 보정
    setVp(calc916());

    const onResize = () => setVp(calc916());
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  /* 다른 로비 탭(상점·장비 등)으로 나가면 이벤트 팝업 닫기 */
  useEffect(() => {
    if (!hudSnap['/lobby/visible']) return;
    if (isBattleLobbyScreen(hudSnap)) return;
    eventStore.setMany({
      '/event/milestoneListVisible': false,
      '/event/tournamentPanelVisible': false,
      '/event/helpVisible': false,
      '/event/tycoonMilestonePopupVisible': false,
      '/event/seasonMilestonePopupVisible': false,
    });
  }, [
    hudSnap['/lobby/visible'],
    hudSnap['/shop/visible'],
    hudSnap['/equip/visible'],
    hudSnap['/challenge/visible'],
    hudSnap['/evolution/visible'],
    hudSnap['/talent/visible'],
    hudSnap['/energy/visible'],
    hudSnap['/avatar/visible'],
  ]);

  /* 1) CSV 로드 — 게임과 이벤트 완전 분리. 이벤트 실패해도 게임은 실행 */
  useEffect(() => {
    loadAllGameData()
      .then(data => {
        catalog.validate(prismHudSpec);
        initEventMinigamesFromData(data.eventMinigames, data.eventMinigameOrder);
        hudStore.set('/meta/avatarProfileLimit', data.meta.avatarProfileLimit);
        setGameData(data);
      })
      .catch(err => setError(String(err)));

    /* 이벤트는 독립 로드 — 실패해도 게임에 영향 없음 */
    loadAllEventData()
      .then(ev => {
        try { eventCatalog.validate(eventHudSpec); } catch (_) { /* 이벤트 스펙 오류 무시 */ }
        setEventData(ev);
      })
      .catch(() => {
        /* 이벤트 로드 실패 → eventData=null 유지, 게임은 계속 */
        setEventData(null);
      });

    loadAllSalesEventData()
      .then(bundle => {
        if (coreRef.current) rebindSalesFromBundle(coreRef.current, bundle);
      })
      .catch(() => { /* bindSalesToCore 기본값 유지 */ });
  }, []);

  /* 2) Three.js + GameCore 초기화 — 게임 데이터만 준비되면 바로 시작 */
  useLayoutEffect(() => {
    if (!gameData || !canvasRef.current || !wrapperRef.current) return;
    if (vp.w <= 0 || vp.h <= 0) return;

    const canvas = canvasRef.current;
    canvas.width = vp.w;
    canvas.height = vp.h;

    try {
      const fallbackVfx: VfxConfig = {
        vfx_id: 'fallback',
        particle_count: 0,
        particle_size_min: 0,
        particle_size_max: 0,
        particle_life_frames: 0,
        particle_speed: 0,
        bloom_strength: 0.9,
        bloom_radius: 0.35,
        bloom_threshold: 0.1,
        screen_shake_intensity: 0,
        screen_shake_duration_frames: 0,
        flash_duration_frames: 0,
        particle_color_hex: '',
        particle_sprite_url: '',
      };
      const vfxDefault = gameData.vfx.get('enemy_death')
        ?? [...gameData.vfx.values()][0]
        ?? fallbackVfx;

      const renderer = new Renderer3D(canvas, gameData.map, vfxDefault, vp.w, vp.h, gameData.rendererConfig);
      const core = new GameCore(gameData, renderer, wrapperRef.current);
      renderer.start();

      rendRef.current = renderer;
      coreRef.current = core;
      bindSalesToCore(core);

      hudStore.setMany({
        '/hud/timer':     '00:00',
        '/hud/hpPct':    100,
        '/hud/level':    1,
        '/hud/expPct':   0,
        '/hud/killCount': 0,
        '/hud/gold':     0,
      });

      return () => {
        unbindSales();
        eventBridgeRef.current?.dispose();
        eventBridgeRef.current = null;
        core.attachEventBridge(null);
        core.dispose();
        renderer.dispose();
        rendRef.current = null;
        coreRef.current = null;
      };
    } catch (err) {
      setError(`게임 초기화 실패: ${String(err)}`);
      return;
    }
  }, [gameData]);

  /* 창 리사이즈 시 캔버스·카메라만 갱신 (게임 재시작 없음) */
  useLayoutEffect(() => {
    if (!rendRef.current || !canvasRef.current || !coreRef.current) return;
    if (vp.w <= 0 || vp.h <= 0) return;
    canvasRef.current.width = vp.w;
    canvasRef.current.height = vp.h;
    rendRef.current.setViewportSize(vp.w, vp.h);
  }, [vp.w, vp.h]);

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

  /* 이벤트 레드닷 — 타이쿤·시즌 store 변경 시 */
  useEffect(() => {
    void Promise.all([preloadArcheryCsvConfig(), preloadRedDotConfig()]).then(() => {
      ensureArcheryStarterBows();
      syncArcheryHud();
      refreshEventRedDots();
    });
    const onMarkSeen = (e: Event) => {
      const id = String((e as CustomEvent<string>).detail ?? '');
      if (id) {
        markRedDotSeen(id);
        refreshEventRedDots();
      }
    };
    window.addEventListener('redDot:markSeen', onMarkSeen);
    const unsub = eventStore.subscribe(() => refreshEventRedDots());
    const unsubMall = mallMarvelsStore.subscribe(() => refreshEventRedDots());
    const unsubDrivers = driversJoyStore.subscribe(() => refreshEventRedDots());
    const t = window.setInterval(() => refreshEventRedDots(), 5000);
    return () => {
      unsub();
      unsubMall();
      unsubDrivers();
      window.clearInterval(t);
      window.removeEventListener('redDot:markSeen', onMarkSeen);
    };
  }, []);

  function postToArcheryIframe(msg: Record<string, unknown>) {
    if (getActiveMinigameId() !== 'archery') return;
    getActiveMinigameIframe()?.contentWindow?.postMessage(msg, '*');
  }

  function postToPrizeIframe(msg: Record<string, unknown>) {
    if (getActiveMinigameId() !== 'prize') return;
    getActiveMinigameIframe()?.contentWindow?.postMessage(msg, '*');
  }

  /** 이식 가능 지갑 동기화 — balance(필수) + 획득규칙 안내(선택, 호스트 제공 데이터) */
  function prizeWalletSyncMsg() {
    const svc = getMinigameCurrencyService();
    const rows = (svc?.getAcquireRows('prize') ?? [])
      .filter(r => r.enabled)
      .sort((a, b) => a.sort_order - b.sort_order);
    const missionLines = rows.map(r => ({
      title: `${r.row_title} ${r.kills_required}마리`,
      detail: r.reward_label,
    }));
    return { type: 'host:walletSync', balance: svc?.getPrizeBalls() ?? 0, missionLines };
  }

  /* 4) 라바 퀘스트 ↔ 스퀘어 postMessage 브릿지 */
  useEffect(() => {
    const onMessage = (ev: MessageEvent) => {
      if (!ev.data) return;
      if (ev.data.type === 'aa:ready') {
        postToArcheryIframe(archeryWalletSyncMsg());
        return;
      }
      if (ev.data.type === 'aa:walletChanged') {
        setArcheryBowStands(Number(ev.data.balance ?? 0));
        syncArcheryHud();
        refreshEventRedDots();
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
        postToArcheryIframe(archeryWalletSyncMsg());
        refreshEventRedDots();
        return;
      }
      /* 퍼즐(Prize Drop) ↔ 스퀘어 = 이식 가능 지갑 계약 (호스트는 balance만 주고받음) */
      if (ev.data.type === 'pd:ready') {
        postToPrizeIframe(prizeWalletSyncMsg());
        return;
      }
      if (ev.data.type === 'pd:walletChanged') {
        const svc = getMinigameCurrencyService();
        svc?.setPrizeBalls(Number(ev.data.balance ?? 0));
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
    return () => window.removeEventListener('message', onMessage);
  }, []);

  /* ── 공통 레터박스 래퍼 ── */
  const letterbox = (children: React.ReactNode) => (
    <div style={{
      width: '100%', height: '100%',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: '#000',
    }}>
      {children}
    </div>
  );

  /* 에러 */
  if (error) {
    return letterbox(
      <div style={{
        width: vp.w, height: vp.h,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: '#1a1a2e', color: '#FF6680', padding: 24,
        flexDirection: 'column',
      }}>
        <div style={{ fontSize: 20, marginBottom: 8 }}>로드 실패</div>
        <div style={{ fontSize: 12, opacity: 0.7 }}>{error}</div>
      </div>
    );
  }

  /* 로딩 */
  if (!gameData) {
    return letterbox(
      <div style={{
        width: vp.w, height: vp.h,
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        background: '#1a1a2e', color: '#7BE8F4',
      }}>
        <div style={{ fontSize: 32, fontWeight: 'bold', letterSpacing: 6 }}>PRISM SQUAD</div>
        <div style={{ marginTop: 16, fontSize: 14, color: '#ffffff66' }}>데이터 로딩 중...</div>
      </div>
    );
  }

  const iframeOpen = Boolean(hudSnap['/event/minigame/activeId'] && hudSnap['/event/minigame/visible']);
  /* 타이쿤·시즌: 일반 스테이지·라바 호스트 전투 모두 표시. 라바/퍼즐 iframe UI만 숨김 */
  const showEventHud = shouldShowEventHud(hudSnap) && !iframeOpen;
  const eventOverlayOpen = eventModalOpen(eventSnap);
  const salesModalOpen = Boolean(mallSnap['/mallMarvels/modalOpen'] || driversSnap['/driversJoy/modalOpen']);

  const battleLobbyScreen = isBattleLobbyScreen(hudSnap);

  const anyModalOpen = Boolean(
    hudSnap['/lobby/visible'] || hudSnap['/pause/visible'] || hudSnap['/modal/visible'] ||
    hudSnap['/result/visible'] || hudSnap['/battle/visible'] || hudSnap['/energy/visible'] || hudSnap['/luckyTrain/visible'] ||
    hudSnap['/challenge/visible'] || hudSnap['/evolution/visible'] || hudSnap['/equip/visible'] ||
    hudSnap['/shop/visible'] ||
    hudSnap['/talent/visible'] || hudSnap['/advUp/visible'] || hudSnap['/avatar/visible'] ||
    Number(hudSnap['/bossIntro/phase'] ?? 0) > 0 || hudSnap['/scene/transitionVisible'],
  ) || eventOverlayOpen || salesModalOpen;

  /* 게임 */
  return letterbox(
    <div
      ref={wrapperRef}
      data-prism-game-shell
      tabIndex={-1}
      style={{
        position: 'relative',
        width:  vp.w,
        height: vp.h,
        overflow: 'hidden',
        background: '#1a1a2e',
        flexShrink: 0,
        outline: 'none',
      }}
    >
      {/* Three.js 캔버스 */}
      <canvas
        ref={canvasRef}
        width={vp.w}
        height={vp.h}
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', display: 'block' }}
      />

      {/* 상단 바 — 인게임은 인게임 HUD, 그 외 모든 화면은 공통 재화 바 */}
      {isCombatScreen(hudSnap) ? (
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0,
          pointerEvents: 'auto', zIndex: 10,
        }}>
          <PrismHudRenderer slot="top" />
        </div>
      ) : (
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0,
          pointerEvents: 'auto',
          zIndex: 55,   // 로비/상점/이벤트 등 모든 화면 위에 공통 바
        }}>
          <CommonTopBar />
        </div>
      )}

      {/* 이벤트 HUD — ErrorBoundary로 격리. 이벤트가 뻗어도 게임 지속 */}
      <EventErrorBoundary>
        {eventData ? (
          <EventDataProvider data={eventData}>
            {showEventHud && !eventOverlayOpen ? (
              <>
                <div style={{
                  position: 'absolute',
                  top: eventHudLayerTop(battleLobbyScreen),
                  left: 0, right: 0,
                  pointerEvents: 'none',
                  zIndex: battleLobbyScreen ? 40 : 11,
                }}>
                  <EventHudRenderer slot="mileage" />
                </div>
                <div style={{
                  position: 'absolute',
                  top: eventHudLayerTop(battleLobbyScreen),
                  right: 0,
                  paddingTop: EVENT_MILEAGE_WRAP_PAD.top,
                  pointerEvents: 'none',
                  zIndex: battleLobbyScreen ? 40 : 11,
                }}>
                  <EventHudRenderer slot="tournament" />
                </div>
              </>
            ) : null}
            {showEventHud ? (
              <div style={{
                position: 'absolute', inset: 0, zIndex: 60,
                pointerEvents: eventOverlayOpen ? 'auto' : 'none',
              }}>
                <EventHudRenderer slot="modal" />
              </div>
            ) : null}
            <EventCurrencyFlyOverlay data={eventData} />
            <EventTooltipOverlay />
          </EventDataProvider>
        ) : null}
      </EventErrorBoundary>

      {/* 로비 햄버거 메뉴 — 이벤트(40) 위, 로비 modal(30)과 분리 */}
      {battleLobbyScreen ? <LobbyMenuDropdown /> : null}

      {/* 세일 이벤트 (쇼핑몰 / 드라이버) — 래퍼는 통과, 탭·모달만 클릭 수신 */}
      <div style={{
        position: 'absolute', inset: 0, zIndex: salesModalOpen ? 62 : 48,
        pointerEvents: 'none',
      }}>
        <SalesEventOverlay />
      </div>

      {/* 상단 바형 HUD */}
      <div style={{
        position: 'absolute', top: 118, left: 0, right: 0,
        padding: '0 14px', pointerEvents: 'auto',
        zIndex: 10,
      }}>
        <PrismHudRenderer slot="bar" />
      </div>

      {/* 모달/전환 레이어 — 모달이 떠있을 때만 클릭 수신(아니면 상단 HUD로 통과) */}
      <div style={{ position: 'absolute', inset: 0, zIndex: 30, pointerEvents: anyModalOpen ? 'auto' : 'none' }}>
        <PrismHudRenderer slot="modal" />
        {!iframeOpen ? <ToastOverlay zIndex={60} /> : null}
      </div>

      {/* iframe 미니게임 (Lava / Prize) — 로비·전투와 분리된 단일 셸 */}
      <EventMinigameOverlay />

      {/* 미니게임 위 토스트 (호스트 메시지가 iframe에 가려지지 않도록) */}
      {iframeOpen ? (
        <div style={{ position: 'absolute', inset: 0, zIndex: 530, pointerEvents: 'none' }}>
          <ToastOverlay zIndex={1} />
        </div>
      ) : null}

      {/* 이벤트 iframe 보상 설명 — iframe(z500) 위에 표시 */}
      <div style={{
        position: 'absolute', inset: 0, zIndex: iframeOpen ? 520 : 63,
        pointerEvents: 'none',
      }}>
        <RewardDetailOverlay />
      </div>

      {/* 화면 플래시 */}
      <FlashOverlay />
    </div>
  );
}
