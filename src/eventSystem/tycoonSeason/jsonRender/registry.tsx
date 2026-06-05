/**
 * event registry — 레이아웃은 eventMonopolyUi, 데이터는 CSV+EventDataProvider
 */
import React, { useSyncExternalStore, createContext, useContext, useState, useEffect } from 'react';
import { eventStore, type MilestoneRow } from '../store/eventExternalStore';
import { getRankRewardForRank, type EventData } from '../data';
import {
  EventIcon,
  EventTournamentBoardModal,
  EventTournamentSideTab,
  EventTycoonMainModal,
  MonopolyMileageCapsule,
  EventAcquireRulesSection,
} from './eventMonopolyUi';
import { eventSideTabShellStyle, EVENT_SIDE_TAB_ICON } from './eventHudLayout';
import { hudStore } from '../../../game/hudExternalStore';
import { EventRedDot } from '../../../jsonRender/eventRedDot';
import { pickScopeRedDot } from '../../../game/redDot/redDotUi';
import { TYCOON_ALL_COMPLETE_MSG } from '../core/EventController';

const EventDataCtx = createContext<EventData | null>(null);

export function EventDataProvider({ data, children }: { data: EventData; children: React.ReactNode }) {
  return <EventDataCtx.Provider value={data}>{children}</EventDataCtx.Provider>;
}

function useEventHud() {
  return useSyncExternalStore(
    cb => eventStore.subscribe(cb),
    () => eventStore.getSnapshot(),
  );
}

function useEventData() {
  const d = useContext(EventDataCtx);
  if (!d) throw new Error('[event-ui] EventDataProvider required');
  return d;
}

function resolveValue(v: unknown, hud: ReturnType<typeof useEventHud>): unknown {
  if (v && typeof v === 'object' && '$state' in v) {
    const path = (v as { $state: string }).$state;
    return hud[path as keyof typeof hud];
  }
  return v;
}

function overlayBackdrop(onClose: () => void, children: React.ReactNode) {
  return (
    <div
      style={{
        position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.55)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50,
        pointerEvents: 'auto',
      }}
      onClick={onClose}
    >
      <div onClick={e => e.stopPropagation()} style={{ maxWidth: '92%', maxHeight: '80%' }}>
        {children}
      </div>
    </div>
  );
}

function EventTycoonMileageBarImpl(props: Record<string, unknown>) {
  const hud = useEventHud();
  const data = useEventData();
  if (!hud['/event/visible']) return null;

  const baseName = String(resolveValue(props.name, hud) ?? '');
  const lap = Number(hud['/event/tycoonLap'] ?? 1);
  const displayName = lap > 1 ? `${baseName} (${lap}회차)` : baseName;

  return (
    <MonopolyMileageCapsule
      data={data}
      name={displayName}
      points={Number(hud['/event/points'] ?? 0)}
      nextPoint={Math.max(1, Number(hud['/event/nextMilestonePoint'] ?? 1500))}
      gaugePoints={Number(hud['/event/gaugePoints'] ?? 0)}
      gaugeTarget={Math.max(1, Number(hud['/event/gaugeTarget'] ?? 1500))}
      currencyKey={String(resolveValue(props.currencyAssetKey, hud) ?? 'tycoon_coin')}
      rewardKey={String(resolveValue(props.rewardAssetKey, hud) ?? 'reward_dice')}
      rewardLabel={String(resolveValue(props.rewardLabel, hud) ?? '')}
      timerText={String(resolveValue(props.timerText, hud) ?? '')}
      ticketMult={Number(hud['/event/ticketMultiplier'] ?? 1)}
      lastTpGain={Number(hud['/event/lastTpGain'] ?? 0)}
      allMilestonesComplete={Boolean(hud['/event/tycoonAllMilestonesComplete'])}
      lap={lap}
      onOpenMilestones={() => window.dispatchEvent(new CustomEvent('event:toggleMilestoneList'))}
    />
  );
}

function EventTournamentLeaderboardImpl(props: Record<string, unknown>) {
  const hud = useEventHud();
  const data = useEventData();
  if (!hud['/event/tournamentVisible']) return null;

  return (
    <EventTournamentSideTab
      data={data}
      themeKey={String(resolveValue(props.seasonThemeKey, hud) ?? 'season_default')}
      seasonName={String(resolveValue(props.seasonName, hud) ?? '')}
      playerRank={Number(resolveValue(props.playerRank, hud) ?? 0)}
      onOpen={() => window.dispatchEvent(new CustomEvent('event:toggleTournamentPanel'))}
    />
  );
}

function EventMilestoneRewardPopupImpl(_props: Record<string, unknown>) {
  // 타이쿤·시즌 독립 채널 — 서로 막지 않고 각자 즉시 표시
  return (
    <>
      <RewardPopupChannel track="tycoon" />
      <RewardPopupChannel track="season" />
    </>
  );
}

function RewardPopupChannel({ track }: { track: 'tycoon' | 'season' }) {
  const hud = useEventHud() as Record<string, unknown>;
  const data = useEventData();
  const [isClaiming, setIsClaiming] = useState(false);
  const visible = Boolean(hud[`/event/${track}MilestonePopupVisible`]);
  const closeEvent = track === 'tycoon'
    ? 'event:closeTycoonMilestonePopup'
    : 'event:closeSeasonMilestonePopup';
  const eventName = track === 'tycoon'
    ? (data.tycoonEvent?.event_name ?? '타이쿤 챌린지')
    : ((data.expressEvent || data.seasonEvent)?.event_name ?? '시즌 익스프레스');

  useEffect(() => {
    if (visible) setIsClaiming(false);
  }, [visible]);

  if (!visible) return null;
  const title = String(hud[`/event/${track}MilestonePopupTitle`] ?? '보상 획득');
  const lap = Number(hud[`/event/${track}MilestonePopupLap`] ?? 1);
  const step = Number(hud[`/event/${track}MilestonePopupStep`] ?? 0);
  const assetKey = String(hud[`/event/${track}MilestonePopupAssetKey`] ?? 'reward_dice');
  const label = String(hud[`/event/${track}MilestonePopupLabel`] ?? '');

  const handleClaim = () => {
    if (isClaiming) return;
    setIsClaiming(true);
    setTimeout(() => {
      window.dispatchEvent(new CustomEvent(closeEvent));
    }, 150);
  };

  return (
    <div
      className={`reward-popup-overlay${isClaiming ? ' claiming' : ''}`}
      style={{ zIndex: 900 }}
      onClick={() => {
        if (!isClaiming) {
          window.dispatchEvent(new CustomEvent(closeEvent));
        }
      }}
    >
      <style>{`
        .reward-popup-overlay {
          position: absolute; inset: 0; background: rgba(0,0,0,0.5);
          display: flex; align-items: center; justify-content: center; pointer-events: auto;
          backdrop-filter: blur(3px);
        }
        @keyframes bgFadeOut {
          0% { background: rgba(0,0,0,0.5); backdrop-filter: blur(3px); }
          100% { background: rgba(0,0,0,0); backdrop-filter: blur(0px); }
        }
        .reward-popup-overlay.claiming {
          animation: bgFadeOut 0.15s cubic-bezier(0.25, 1, 0.5, 1) forwards;
          pointer-events: none;
        }
        @keyframes popupOpenBounce {
          0% { transform: scale(0.7) rotate(-3deg); opacity: 0; }
          50% { transform: scale(1.08) rotate(2deg); }
          75% { transform: scale(0.97) rotate(-1deg); }
          100% { transform: scale(1) rotate(0deg); opacity: 1; }
        }
        @keyframes cardClaimDisappear {
          0% { transform: scale(1) rotate(0deg); opacity: 1; }
          30% { transform: scale(1.1) rotate(3deg); }
          100% { transform: scale(0) rotate(-15deg); opacity: 0; }
        }
        @keyframes sunburstRotate {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        @keyframes floatDecor {
          0%, 100% { transform: translateY(0) scale(1); }
          50% { transform: translateY(-8px) scale(1.1); }
        }
        @keyframes rewardIconPulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.15); }
        }
        .reward-popup-card {
          background: #F4EFE6;
          border: 4px solid #000000;
          border-radius: 20px;
          padding: 32px 24px;
          text-align: center;
          min-width: 280px;
          color: #000000;
          box-shadow: 8px 8px 0 #000000;
          position: relative;
          animation: popupOpenBounce 0.45s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
          overflow: hidden;
        }
        .reward-popup-card.claiming {
          animation: cardClaimDisappear 0.15s cubic-bezier(0.6, -0.28, 0.735, 0.045) forwards;
          pointer-events: none;
        }
        .sunburst-glow {
          position: absolute;
          width: 220px;
          height: 220px;
          background: radial-gradient(circle, rgba(255,183,71,0.4) 0%, rgba(255,183,71,0) 70%);
          border-radius: 50%;
          z-index: 0;
          top: 45px;
          left: 50%;
          transform: translate(-50%, -50%);
          pointer-events: none;
          animation: sunburstRotate 12s linear infinite;
        }
        .sunburst-ray {
          position: absolute;
          top: 0; left: 0; right: 0; bottom: 0;
          background: repeating-conic-gradient(
            from 0deg,
            rgba(255, 183, 71, 0.15) 0deg 15deg,
            transparent 15deg 30deg
          );
          border-radius: 50%;
        }
        .popup-sparkle {
          position: absolute;
          font-size: 20px;
          animation: floatDecor 2s ease-in-out infinite;
          pointer-events: none;
        }
      `}</style>

      <div
        className={`reward-popup-card${isClaiming ? ' claiming' : ''}`}
        onClick={e => e.stopPropagation()}
      >
        <div className="sunburst-glow">
          <div className="sunburst-ray" />
        </div>

        <span className="popup-sparkle" style={{ top: 20, left: 30, animationDelay: '0s' }}>✨</span>
        <span className="popup-sparkle" style={{ top: 120, right: 30, animationDelay: '0.4s' }}>✨</span>
        <span className="popup-sparkle" style={{ bottom: 70, left: 24, animationDelay: '0.8s' }}>⭐</span>
        <span className="popup-sparkle" style={{ top: 60, right: 24, animationDelay: '1.2s' }}>🌸</span>

        <div style={{ marginBottom: 20, zIndex: 1, position: 'relative' }}>
          <div style={{ fontSize: 13, fontWeight: 900, color: '#000000', marginBottom: 6, opacity: 0.85 }}>{eventName}</div>
          {step > 0 ? (
            <>
              <div style={{
                display: 'inline-block', fontSize: 13, fontWeight: 900, marginBottom: 8,
                color: '#000000', background: '#FFE45C', border: '2.5px solid #000000',
                borderRadius: 999, padding: '4px 14px', boxShadow: '2px 2px 0 #000000',
              }}>
                {lap}회차
              </div>
              <div style={{
                fontSize: 22, fontWeight: 900, color: '#000000',
                textShadow: '1px 1px 0px rgba(0,0,0,0.1)',
              }}>
                {step}단계 달성!
              </div>
            </>
          ) : (
            <div style={{
              fontSize: 22, fontWeight: 900, color: '#000000',
              textShadow: '1px 1px 0px rgba(0,0,0,0.1)',
            }}>
              {title}
            </div>
          )}
        </div>

        <div style={{
          width: 90, height: 90, margin: '0 auto 16px', borderRadius: '50%',
          border: '3.5px solid #000000', background: '#FFFFFF',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '4px 4px 0 #000000', zIndex: 1, position: 'relative',
          animation: 'rewardIconPulse 2.5s ease-in-out infinite',
        }}>
          <EventIcon data={data} assetKey={assetKey} size={56} />
        </div>

        {label ? (
          <div style={{
            fontSize: 20, fontWeight: 900, marginBottom: 24, zIndex: 1, position: 'relative',
            color: '#000000', background: '#FFE45C', border: '2.5px solid #000000',
            borderRadius: 10, padding: '6px 16px', display: 'inline-block',
            boxShadow: '3px 3px 0 #000000', transform: 'rotate(-1.5deg)'
          }}>
            {label}
          </div>
        ) : null}

        <div style={{ marginTop: 8, zIndex: 1, position: 'relative' }}>
          <button
            type="button"
            onClick={handleClaim}
            style={{
              padding: '12px 36px', borderRadius: 12, border: '3.5px solid #000000',
              background: '#FFB347', color: '#000000', fontWeight: 900, fontSize: 17,
              cursor: 'pointer', boxShadow: '4px 4px 0 #000000',
              transition: 'transform 0.08s ease, box-shadow 0.08s ease',
              outline: 'none',
            }}
            onMouseDown={e => {
              e.currentTarget.style.transform = 'translate(2px, 2px)';
              e.currentTarget.style.boxShadow = '2px 2px 0 #000000';
            }}
            onMouseUp={e => {
              e.currentTarget.style.transform = 'none';
              e.currentTarget.style.boxShadow = '4px 4px 0 #000000';
            }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.03)'; }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'none'; }}
          >
            확인
          </button>
        </div>
      </div>
    </div>
  );
}

function EventMilestoneListPopupImpl(props: Record<string, unknown>) {
  const hud = useEventHud();
  const data = useEventData();
  const visible = Boolean(hud['/event/milestoneListVisible']);
  const rows = (resolveValue(props.rows, hud) as MilestoneRow[]) ?? [];
  const points = Number(hud['/event/points'] ?? 0);
  const nextPoint = Math.max(1, Number(hud['/event/nextMilestonePoint'] ?? 1500));
  const gaugePoints = Number(hud['/event/gaugePoints'] ?? 0);
  const gaugeTarget = Math.max(1, Number(hud['/event/gaugeTarget'] ?? 1500));

  return (
    <EventTycoonMainModal
      data={data}
      visible={visible}
      onClose={() => window.dispatchEvent(new CustomEvent('event:toggleMilestoneList'))}
      eventName={String(hud['/event/name'] ?? '')}
      points={points}
      nextPoint={nextPoint}
      gaugePoints={gaugePoints}
      gaugeTarget={gaugeTarget}
      timerText={String(hud['/event/timerText'] ?? '')}
      milestoneRows={rows}
      themeKey={String(hud['/event/themeKey'] ?? 'tycoon_default')}
      ticketMult={Number(hud['/event/ticketMultiplier'] ?? 1)}
      allMilestonesComplete={Boolean(hud['/event/tycoonAllMilestonesComplete'])}
    />
  );
}

function EventTournamentPanelImpl(_props: Record<string, unknown>) {
  const hud = useEventHud();
  const data = useEventData();
  const panelOpen = Boolean(hud['/event/tournamentPanelVisible']);
  const ended = Boolean(hud['/event/tournamentEnded']);
  if (!panelOpen) return null;

  return (
    <EventTournamentBoardModal
      data={data}
      visible
      ended={ended}
      rows={hud['/event/tournamentRows']}
      playerRank={Number(hud['/event/tournamentRank'] ?? 0)}
      className={String(hud['/event/className'] ?? '')}
      classSubtitle={String(hud['/event/classSubtitle'] ?? '')}
      seasonName={String(hud['/event/seasonName'] ?? '')}
      pointIconKey={String(hud['/event/seasonCurrencyAssetKey'] ?? 'season_coin')}
      themeKey={String(hud['/event/seasonThemeKey'] ?? 'season_default')}
      ticketMult={Number(hud['/event/ticketMultiplier'] ?? 1)}
      onClose={() => {
        if (ended) window.dispatchEvent(new CustomEvent('event:closeSettlement'));
        else window.dispatchEvent(new CustomEvent('event:closeTournamentPanel'));
      }}
      onCollect={() => window.dispatchEvent(new CustomEvent('event:closeSettlement'))}
      onInfo={() => window.dispatchEvent(new CustomEvent('event:openHelp', { detail: 'SEASON_TOURNAMENT' }))}
      seasonPoints={Number(hud['/event/seasonPoints'] ?? 0)}
      nextMilestonePoint={Number(hud['/event/nextSeasonMilestonePoint'] ?? 1500)}
      seasonGaugePoints={Number(hud['/event/seasonGaugePoints'] ?? 0)}
      seasonGaugeTarget={Math.max(1, Number(hud['/event/seasonGaugeTarget'] ?? 1))}
    />
  );
}

function EventTournamentSettlementPopupImpl() {
  return null;
}

function SeasonExpressSideTabImpl(props: Record<string, unknown>) {
  const hud = useEventHud();
  const data = useEventData();
  const lobbyHud = useSyncExternalStore(
    cb => hudStore.subscribe(cb),
    () => hudStore.getSnapshot(),
  );
  const visible = Boolean(hud['/event/expressTabVisible']);
  const expressDot = pickScopeRedDot(lobbyHud, 'express');
  const [tabSuck, setTabSuck] = useState(false);

  useEffect(() => {
    const onAbsorb = () => {
      setTabSuck(true);
      window.setTimeout(() => setTabSuck(false), 780);
    };
    window.addEventListener('event:seasonTabAbsorb', onAbsorb);
    return () => window.removeEventListener('event:seasonTabAbsorb', onAbsorb);
  }, []);

  if (!visible) return null;

  const name = String(resolveValue(props.name, hud) ?? '익스프레스');
  const timerText = String(resolveValue(props.timerText, hud) ?? '');
  const icon = EVENT_SIDE_TAB_ICON;

  const displayName = name === '시즌 익스프레스' ? '시즌' : name.slice(0, 4);

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => window.dispatchEvent(new CustomEvent('event:toggleExpressPanel'))}
      style={eventSideTabShellStyle({
        position: 'relative',
        transition: 'transform 0.2s ease-in-out',
      })}
      onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.05)'; }}
      onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; }}
    >
      <div
        data-event-anchor="season-tab"
        className={tabSuck ? 'event-season-tab-suck' : ''}
        style={{
          position: 'relative',
          width: icon.size, height: icon.size, margin: '0 auto', borderRadius: '50%', overflow: 'visible',
          border: icon.border, background: icon.bg,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: icon.shadow, transform: 'translateZ(0)',
        }}
      >
        <EventRedDot show={expressDot !== null} category={expressDot ?? undefined} />
        <div style={{ width: '100%', height: '100%', borderRadius: '50%', overflow: 'hidden' }}>
          <EventIcon data={data} assetKey="season_coin" size={40} style={{ background: '#FFB347', borderRadius: '50%' }} />
        </div>
      </div>
      
      <div style={{
        marginTop: 6, fontSize: 9, fontWeight: 900, color: '#000000', lineHeight: 1.1,
        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
        textTransform: 'uppercase', letterSpacing: '0.5px',
      }}>
        {displayName}
      </div>

      <div style={{
        marginTop: 5, fontSize: 10, fontWeight: 900,
        background: '#FFFFFF',
        borderRadius: 6, padding: '2px 3px',
        color: '#000000', border: '1.5px solid #000000',
        boxShadow: '1px 1px 0 #000000',
        display: 'inline-block',
      }}>
        {timerText ? timerText.split(' ')[0] : '대기'}
      </div>
    </div>
  );
}

function SeasonExpressPanelImpl(props: Record<string, unknown>) {
  const hud = useEventHud();
  const data = useEventData();
  const visible = Boolean(hud['/event/expressVisible']);
  if (!visible) return null;

  const baseTitle = String(resolveValue(props.title, hud) ?? '스프린트 익스프레스');
  const lap = Number(hud['/event/seasonLap'] ?? 1);
  const title = lap > 1 ? `${baseTitle} (${lap}회차)` : baseTitle;
  const timerText = String(resolveValue(props.timerText, hud) ?? '');
  void String(hud['/event/seasonThemeKey'] ?? 'season_default');
  const ticketMult = Number(hud['/event/ticketMultiplier'] ?? 1);
  const rows = (hud['/event/tournamentRows'] as any[]) ?? [];
  const eventId = data.expressEvent?.event_id ?? 10002;

  const showRows = rows.slice(0, 50);
  const myRow = showRows.find(r => r.isPlayer);
  const otherRows = showRows.filter(r => !r.isPlayer);
  const gaugePoints = Number(hud['/event/seasonGaugePoints'] ?? 0);
  const gaugeTarget = Math.max(1, Number(hud['/event/seasonGaugeTarget'] ?? 1500));
  const allMilestonesComplete = Boolean(hud['/event/seasonAllMilestonesComplete']);
  const nextRewardKey = String(hud['/event/nextSeasonRewardAssetKey'] ?? 'reward_lock');
  const pct = allMilestonesComplete
    ? 100
    : Math.min(100, (gaugePoints / gaugeTarget) * 100);

  const modalBorder = '#000000';
  const modalBg = '#F4EFE6';

  const avatarColor = (name: string) => {
    let h = 0;
    for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) % 360;
    return `hsl(${h}, 50%, 45%)`;
  };

  const renderSquareRankRow = (r: any, isPlayer: boolean) => {
    const reward = getRankRewardForRank(data, eventId, r.rank);
    const maxPts = 5000;
    const barPct = Math.min(100, (r.points / maxPts) * 100);

    return (
      <div key={`${r.rank}-${r.name}`} style={{
        display: 'flex', alignItems: 'center', gap: 5, padding: '6px 8px', marginBottom: 6,
        borderRadius: 8,
        background: isPlayer ? '#7BE8F4' : '#ffffff',
        border: isPlayer ? '2.5px solid #000000' : '2px solid #000000',
        boxShadow: isPlayer ? '3px 3px 0 #000000' : '2px 2px 0 #000000',
        color: '#000000',
      }}>
        <div style={{ width: 18, textAlign: 'center', fontWeight: 900, fontSize: 11, color: '#000000' }}>
          {r.rank}
        </div>
        <div style={{
          width: 26, height: 26, borderRadius: '50%', background: avatarColor(r.name),
          border: '2px solid #000000', display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 11, fontWeight: 900, color: '#fff', flexShrink: 0,
        }}>
          {r.name.slice(0, 1)}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 11, fontWeight: 900, color: '#000000', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {r.name}{isPlayer ? ' (나)' : ''}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 2 }}>
            <EventIcon data={data} assetKey="season_coin" size={12} style={{ background: '#ffffff', borderRadius: '50%' }} />
            <span style={{ fontWeight: 900, fontSize: 11, color: '#000000', minWidth: 32 }}>
              {r.points.toLocaleString()}
            </span>
            <div style={{ flex: 1, height: 6, borderRadius: 3, background: '#FFFFFF', border: '1.5px solid #000000', overflow: 'hidden', position: 'relative' }}>
              <div style={{ width: `${barPct}%`, height: '100%', background: '#FFB347', borderRight: barPct > 0 && barPct < 100 ? '1.5px solid #000000' : 'none' }} />
            </div>
          </div>
        </div>
        {reward && (
          <div style={{ display: 'flex', gap: 4, flexShrink: 0 }}>
            {reward.dice_label && (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', background: '#FFFFFF', border: '1.5px solid #000000', borderRadius: 6, padding: '2px 4px', minWidth: 32, boxShadow: '1px 1px 0 #000000' }}>
                <EventIcon data={data} assetKey="reward_energy" size={12} style={{ background: '#ffffff', borderRadius: '50%' }} />
                <span style={{ fontSize: 7, fontWeight: 900, color: '#000000' }}>{reward.dice_label}</span>
              </div>
            )}
            {reward.token_label && (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', background: '#FFB347', border: '1.5px solid #000000', borderRadius: 6, padding: '2px 4px', minWidth: 32, boxShadow: '1px 1px 0 #000000' }}>
                <EventIcon data={data} assetKey="season_coin" size={12} style={{ background: '#FFB347', borderRadius: '50%' }} />
                <span style={{ fontSize: 7, fontWeight: 900, color: '#000000' }}>{reward.token_label}</span>
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  return overlayBackdrop(
    () => window.dispatchEvent(new CustomEvent('event:closeExpress')),
    <div style={{
      background: modalBg,
      borderRadius: 18,
      border: `4px solid ${modalBorder}`,
      boxShadow: '6px 6px 0 #000000',
      overflow: 'hidden',
      color: '#000000',
      fontFamily: '"Segoe UI", Roboto, Helvetica, Arial, sans-serif',
      position: 'relative',
      display: 'flex',
      flexDirection: 'column',
      maxHeight: '80%',
      width: '100%',
    }}>
      <button
        type="button"
        onClick={() => window.dispatchEvent(new CustomEvent('event:closeExpress'))}
        style={{
          position: 'absolute', right: 12, top: 12,
          width: 26, height: 26, borderRadius: '50%', border: '2px solid #000000',
          background: '#F4EFE6', color: '#000000', fontWeight: 900, cursor: 'pointer',
          lineHeight: 1, padding: 0, outline: 'none', transition: 'all 0.2s', zIndex: 3,
          boxShadow: '1.5px 1.5px 0 #000000',
        }}
        onMouseDown={e => { e.currentTarget.style.transform = 'translate(1px, 1px)'; e.currentTarget.style.boxShadow = '0.5px 0.5px 0 #000000'; }}
        onMouseUp={e => { e.currentTarget.style.transform = 'translate(0px, 0px)'; e.currentTarget.style.boxShadow = '1.5px 1.5px 0 #000000'; }}
      >×</button>

      <div style={{
        background: '#FFB347',
        padding: '14px 20px 10px',
        textAlign: 'center',
        borderBottom: '3px solid #000000',
        flexShrink: 0,
      }}>
        <div style={{
          fontSize: 20, fontWeight: 900, color: '#000000',
          letterSpacing: '1px',
        }}>
          {title}
        </div>
        <div style={{
          fontSize: 11, fontWeight: 900, color: '#000000', marginTop: 4,
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4
        }}>
          ⏱ {timerText || '진행 중'}
        </div>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '10px 12px 2px' }}>
          {/* 모노폴리 GO 스타일 게이지 바 컨테이너 (시즌 익스프레스용) */}
          <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '4px 8px 12px', boxSizing: 'border-box' }}>
            <div style={{ width: '100%', maxWidth: 320, position: 'relative', display: 'flex', alignItems: 'center', height: 48 }}>
              
              {/* 좌측 동그란 획득 재화 뱃지 */}
              <div style={{
                width: 44, height: 44, borderRadius: '50%',
                background: '#ffffff',
                border: '2px solid #000000',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                zIndex: 10, position: 'absolute', left: 0,
                boxShadow: '2px 2px 0 #000000',
              }}>
                <EventIcon data={data} assetKey="season_coin" size={38} style={{ background: '#ffffff', borderRadius: '50%' }} />
              </div>

              {/* 중앙 게이지 바 트랙 */}
              <div style={{
                flex: 1, height: 22, background: '#FFFFFF',
                borderRadius: 11, border: '2px solid #000000',
                position: 'relative', overflow: 'hidden',
                margin: '0 20px',
              }}>
                <div
                  key={`express-gauge-${lap}`}
                  style={{
                    width: `${pct}%`, height: '100%',
                    background: '#3DDC84',
                    borderRight: pct > 0 && pct < 100 ? '2px solid #000000' : 'none',
                    transition: 'width 0.2s',
                  }}
                />
                <div style={{
                  position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: '#000000', fontWeight: 900, fontSize: allMilestonesComplete ? 8 : 11,
                  padding: allMilestonesComplete ? '0 8px' : 0,
                }}>
                  {allMilestonesComplete ? TYCOON_ALL_COMPLETE_MSG : `${gaugePoints}/${gaugeTarget}`}
                </div>
              </div>

              {/* 우측 다음 보상 뱃지 */}
              <div style={{
                width: 48, height: 48, borderRadius: '50%',
                background: '#ffffff',
                border: '2px solid #000000',
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                zIndex: 10, position: 'absolute', right: 0,
                boxShadow: '2px 2px 0 #000000',
              }}>
                <EventIcon data={data} assetKey={nextRewardKey} size={42} style={{ background: '#ffffff', borderRadius: '50%' }} />
              </div>

            </div>
          </div>

          <EventAcquireRulesSection data={data} eventKind="SEASON_EXPRESS" ticketMult={ticketMult} compact />

        <div style={{
          fontWeight: 900, fontSize: 12, textAlign: 'center',
          margin: '10px 0 6px', color: '#000000',
          background: '#e8dfd1', borderRadius: 6, padding: '5px 8px',
          border: '2px solid #000000',
        }}>
          스프린트 익스프레스 순위 경쟁
        </div>

        <div style={{ marginBottom: 8, maxHeight: '180px', overflowY: 'auto', paddingRight: '2px' }}>
          {otherRows.map(r => (
            <React.Fragment key={`${r.rank}-${r.name}`}>
              {renderSquareRankRow(r, false)}
              {r.rank === 6 && (
                <div style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                  background: 'rgba(76, 175, 80, 0.15)', border: '1.5px dashed #4CAF50',
                  color: '#2E7D32', fontWeight: 900, fontSize: 10, padding: '3px 0',
                  margin: '6px 0', borderRadius: 6, textShadow: '0 1px 1px rgba(255,255,255,0.3)',
                  textAlign: 'center', width: '100%', boxSizing: 'border-box'
                }}>
                  ▲ 클래스 업그레이드 경계 ▲
                </div>
              )}
            </React.Fragment>
          ))}
        </div>
      </div>

      {myRow && (
        <div style={{ padding: '8px 12px', flexShrink: 0, background: '#e8dfd1', borderTop: '3px solid #000000' }}>
          <div style={{ fontSize: 10, color: '#000000', fontWeight: 900, marginBottom: 4 }}>내 순위</div>
          {renderSquareRankRow(myRow, true)}
        </div>
      )}

      <div style={{ padding: '6px 12px 12px', flexShrink: 0, borderTop: '1px solid rgba(0,0,0,0.1)' }}>
        <button
          type="button"
          onClick={() => window.dispatchEvent(new CustomEvent('event:closeExpress'))}
          style={{
            width: '100%', padding: '10px 0', borderRadius: 12, border: '2.5px solid #000000',
            background: '#FFB347',
            color: '#000000', fontWeight: 900, fontSize: 15, cursor: 'pointer',
            boxShadow: '3px 3px 0 #000000',
            outline: 'none', transition: 'transform 0.1s, box-shadow 0.1s',
          }}
          onMouseDown={e => { e.currentTarget.style.transform = 'translate(1.5px, 1.5px)'; e.currentTarget.style.boxShadow = '1.5px 1.5px 0 #000000'; }}
          onMouseUp={e => { e.currentTarget.style.transform = 'translate(0px, 0px)'; e.currentTarget.style.boxShadow = '3px 3px 0 #000000'; }}
        >
          닫기
        </button>
      </div>
    </div>
  );
}

export const eventRegistry: Record<string, (props: Record<string, unknown>) => React.ReactNode> = {
  EventTycoonMileageBar: (props) => <EventTycoonMileageBarImpl {...props} />,
  EventTournamentLeaderboard: (props) => <EventTournamentLeaderboardImpl {...props} />,
  EventMilestoneRewardPopup: (props) => <EventMilestoneRewardPopupImpl {...props} />,
  EventMilestoneListPopup: (props) => <EventMilestoneListPopupImpl {...props} />,
  EventTournamentPanel: (props) => <EventTournamentPanelImpl {...props} />,
  EventTournamentSettlementPopup: () => <EventTournamentSettlementPopupImpl />,
  SeasonExpressPanel: (props) => <SeasonExpressPanelImpl {...props} />,
  SeasonExpressSideTab: (props) => <SeasonExpressSideTabImpl {...props} />,
};

const TOOLTIP_DETAILS: Record<string, { title: string; desc: string }> = {
  reward_dice: {
    title: '주사위 (Dice)',
    desc: '보드판을 이동하기 위해 필요한 필수 소모 아이템입니다. 주사위를 굴리면 무작위 숫자가 나와 앞으로 전진하며 다양한 보상 칸에 안착할 수 있습니다. 🎲',
  },
  reward_gold: {
    title: '골드 (Gold)',
    desc: '게임 내 건물 업그레이드, 장비 강화, 다양한 인게임 재화 구매 등 다양한 콘텐츠에서 범용적으로 사용되는 기본 재화입니다. 💰',
  },
  reward_gem: {
    title: '다이아 (Gem)',
    desc: '상점에서 특수 상자를 즉시 구매해 개봉하거나, 에너지를 고속 충전할 수 있는 고가치의 프리미엄 보석 재화입니다. 💎',
  },
  reward_energy: {
    title: '에너지 (Energy)',
    desc: '인게임 스테이지 전투에 진입할 때 소모되는 피로도(행동력)입니다. 일정 시간마다 자동으로 충전되며, 다이아나 보상을 통해서도 추가 획득할 수 있습니다. ⚡',
  },
  reward_dna: {
    title: 'DNA 캡슐',
    desc: '캐릭터의 고유 잠재력을 개방하고, 연구소에서 영구 능력치를 강화하는 스페셜 성장 핵심 소재입니다. 🧬',
  },
  reward_lock: {
    title: '비밀의 자물쇠 보상',
    desc: '어떤 아이템인지 랜덤 도착하면 공개되는 비밀 보상입니다! 킬 카운트 마일스톤에 도달해 자물쇠를 푸는 순간 신비로운 아이템 중 하나가 랜덤하게 제공됩니다. 🔓✨',
  },
  season_coin: {
    title: '시즌 코인 (Tournament Point)',
    desc: '시즌 토너먼트 랭킹을 갱신하고 더 높은 등급(클래스)으로 레벨업하기 위해 사용되는 토너먼트용 포인트입니다. 🏆',
  },
  tycoon_coin: {
    title: '타이쿤 코인 (Tycoon Point)',
    desc: '타이쿤 마일스톤 게이지를 채워서 단계별 풍성한 주사위, 다이아 등 누적 달성 보상을 잠금해제하기 위한 이벤트 포인트입니다. 🟠',
  },
};

export function EventTooltipOverlay() {
  const [activeKey, setActiveKey] = useState<string | null>(null);
  const data = useContext(EventDataCtx);

  useEffect(() => {
    const onShow = (e: Event) => {
      const detail = (e as CustomEvent<{ assetKey: string }>).detail;
      if (detail?.assetKey) {
        setActiveKey(detail.assetKey);
      }
    };
    window.addEventListener('event:showTooltip', onShow);
    return () => window.removeEventListener('event:showTooltip', onShow);
  }, []);

  if (!activeKey || !data) return null;

  const info = TOOLTIP_DETAILS[activeKey] || {
    title: '미지의 보상',
    desc: '무엇이 들어있는지 알 수 없는 보상입니다. 킬 미션을 완수하여 이 칸에 도달해 잠금을 풀어보세요!',
  };

  return (
    <div
      style={{
        position: 'absolute', inset: 0, zIndex: 90, background: 'rgba(0,0,0,0.65)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', pointerEvents: 'auto',
      }}
      onClick={() => setActiveKey(null)}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: 'linear-gradient(180deg,#3a1d52,#1d0a2d)', borderRadius: 18, padding: 22,
          border: '3px solid #ffb300', textAlign: 'center', maxWidth: 280, width: '85%', color: '#fff',
          boxShadow: '0 8px 24px rgba(0,0,0,0.8), 0 0 12px rgba(255, 179, 0, 0.3)',
          fontFamily: '"Segoe UI", Roboto, sans-serif'
        }}
      >
        <div style={{ fontSize: 18, fontWeight: 900, marginBottom: 14, color: '#FFD54F', textShadow: '0 1.5px 3px rgba(0,0,0,0.5)' }}>
          {info.title}
        </div>
        <div style={{
          width: 68, height: 68, margin: '0 auto 14px', borderRadius: '50%', background: '#fff',
          display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2.5px solid #FFD54F',
          boxShadow: '0 3px 6px rgba(0,0,0,0.4)'
        }}>
          <EventIcon data={data} assetKey={activeKey} size={44} />
        </div>
        <div style={{ fontSize: 12, fontWeight: 500, lineHeight: 1.6, marginBottom: 18, color: '#f5f5f5', padding: '0 4px', textAlign: 'center', wordBreak: 'keep-all' }}>
          {info.desc}
        </div>
        <button
          type="button"
          onClick={() => setActiveKey(null)}
          style={{
            width: '100%', padding: '9px 0', borderRadius: 10, border: 'none',
            background: 'linear-gradient(180deg, #FFB347 0%, #F57C00 100%)',
            color: '#111', fontWeight: 900, fontSize: 14, cursor: 'pointer',
            boxShadow: '0 3px 0 #B26A00, 0 2px 4px rgba(0,0,0,0.3)',
            outline: 'none', transition: 'all 0.1s',
          }}
          onMouseDown={e => { e.currentTarget.style.transform = 'translateY(2.5px)'; e.currentTarget.style.boxShadow = '0 0.5px 0 #B26A00'; }}
          onMouseUp={e => { e.currentTarget.style.transform = 'translateY(0px)'; e.currentTarget.style.boxShadow = '0 3px 0 #B26A00'; }}
        >
          확인
        </button>
      </div>
    </div>
  );
}
