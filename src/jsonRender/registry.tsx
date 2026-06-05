/**
 * registry.tsx — type 문자열 → React 컴포넌트 매핑
 * 운영 UI 추가 시 operationalUi.ts 타입 추가 + 이 파일 JSX 구현 동시 패치
 */
import React, { useSyncExternalStore } from 'react';
import { createPortal } from 'react-dom';
import { hudStore, type SkillCardData, type LuckyTrainSkillItem, type MultOption, type TalentItem, type EquipItem, type ChallengeItem, type EvoNodeItem } from '../game/hudExternalStore';
import {
  EVENT_MINIGAME_ORDER,
  EVENT_MINIGAMES,
  openEventMinigame,
  type EventMinigameId,
} from '../game/eventMinigameHost';
import { eventStore } from '../eventSystem/tycoonSeason/store/eventExternalStore';
import {
  eventMiniCardStackIndex,
  eventSideTabShellStyle,
  eventSideTabStackTopPx,
  isBattleLobbyHud,
} from '../eventSystem/tycoonSeason/jsonRender/eventHudLayout';
import { EventRedDot } from './eventRedDot';
import { pickScopeRedDot } from '../game/redDot/redDotUi';
import { ShopScreenImpl } from './ShopScreen';
import { NavTabBar } from './NavTabBar';
import { EquipDetailPopup, renderEquipIcon, renderSlotTypeBadge, equipVisualSlotKind, GRADE_COLOR, GRADE_LABEL } from './equipUi';
import {
  SketchCloseButton,
  SketchPrimaryButton,
  SketchSecondaryButton,
} from './overlayUi';

/* ── 공통 유틸 ── */
function useHud() {
  return useSyncExternalStore(
    cb => hudStore.subscribe(cb),
    () => hudStore.getSnapshot(),
  );
}

function resolveValue(v: unknown, hud: ReturnType<typeof useHud>): unknown {
  if (v && typeof v === 'object' && '$state' in v) {
    const path = (v as { $state: string }).$state;
    return hud[path as keyof typeof hud];
  }
  return v;
}

/* ── HUD 컴포넌트 구현 ── */

function HudTimerImpl({ value }: { value: unknown }) {
  const hud = useHud();
  const v = resolveValue(value, hud) as string;
  return <span>{v}</span>;
}


function HudTopBarImpl() {
  const hud = useHud();
  const timer  = String(hud['/hud/timer'] ?? '00:00');
  const level  = Number(hud['/hud/level']    ?? 1);
  const expPct = Number(hud['/hud/expPct']   ?? 0);
  const kill   = Number(hud['/hud/killCount'] ?? 0);
  const gold   = Number(hud['/hud/gold']      ?? 0);
  const entryTickets = Number(hud['/lobby/entryTickets'] ?? 0);
  const stageNum = Number(hud['/hud/stage'] ?? hud['/lobby/selectedStage'] ?? 1);
  const stageName = String(hud['/lobby/stageName'] ?? '').trim();

  return (
    <div style={{
      width: '100%',
      background: '#F4EFE6',
      fontFamily: '"Segoe UI", Roboto, sans-serif',
      boxSizing: 'border-box',
      borderBottom: '3px solid #000000',
    }}>
      {/* 최상단 얇은 자원 바: 번개 / 스테이지 / 골드 */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '4px 10px',
        borderBottom: '2px solid #000000',
        background: '#EDE5D8',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, fontWeight: 900, color: '#000000' }}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="#FFB347">
            <path d="M19 10h-6V3L5 14h6v7z" stroke="#000000" strokeWidth="2" strokeLinejoin="round" />
          </svg>
          <span>{entryTickets.toLocaleString()}</span>
        </div>
        <div
          title={stageName || `스테이지 ${stageNum}`}
          style={{
            fontSize: 11,
            fontWeight: 900,
            color: '#000000',
            background: '#FFB347',
            border: '2px solid #000000',
            borderRadius: 20,
            padding: '2px 10px',
            boxShadow: '1.5px 1.5px 0 #000000',
            maxWidth: '46%',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            textAlign: 'center',
          }}
        >
          {stageName ? `S${stageNum} · ${stageName}` : `S${stageNum}`}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, fontWeight: 900, color: '#000000' }}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="#FFD700">
            <circle cx="12" cy="12" r="9" stroke="#000000" strokeWidth="2" />
          </svg>
          <span>{gold.toLocaleString()}</span>
        </div>
      </div>

      {/* 메인 HUD: [⏸] [타이머 크게] [킬수] */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '6px 10px 4px',
        boxSizing: 'border-box',
      }}>
        {/* 일시정지 버튼 */}
        <button
          onClick={() => window.dispatchEvent(new CustomEvent('prism:action', { detail: 'TOGGLE_PAUSE' }))}
          style={{
            width: 40, height: 40,
            background: '#F4EFE6',
            border: '2.5px solid #000000',
            borderRadius: 8,
            cursor: 'pointer',
            boxShadow: '2px 2px 0 #000000',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="#000000">
            <rect x="5" y="4" width="4" height="16" rx="1" />
            <rect x="15" y="4" width="4" height="16" rx="1" />
          </svg>
        </button>

        {/* 타이머 — 중앙 크게 */}
        <div style={{
          flex: 1,
          textAlign: 'center',
          fontSize: 34,
          fontWeight: 900,
          color: '#000000',
          letterSpacing: 3,
          lineHeight: 1,
          fontVariantNumeric: 'tabular-nums',
        }}>
          {timer}
        </div>

        {/* 킬수 박스 */}
        <div style={{
          background: '#ffffff',
          border: '2.5px solid #000000',
          borderRadius: 8,
          padding: '5px 8px',
          display: 'flex',
          alignItems: 'center',
          gap: 5,
          boxShadow: '2px 2px 0 #000000',
          flexShrink: 0,
          minWidth: 52,
          justifyContent: 'center',
        }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <ellipse cx="12" cy="10" rx="7" ry="6" fill="#000000" />
            <rect x="8" y="15" width="3" height="3" rx="1" fill="#000000" />
            <rect x="13" y="15" width="3" height="3" rx="1" fill="#000000" />
            <rect x="7" y="17" width="10" height="2" rx="1" fill="#000000" />
            <ellipse cx="9.5" cy="9.5" rx="2" ry="2.2" fill="#F4EFE6" />
            <ellipse cx="14.5" cy="9.5" rx="2" ry="2.2" fill="#F4EFE6" />
          </svg>
          <span style={{ fontWeight: 900, fontSize: 18, color: '#000000', minWidth: 24, textAlign: 'center' }}>{kill}</span>
        </div>
      </div>

      {/* XP 바 행 */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        padding: '2px 10px 7px',
        boxSizing: 'border-box',
      }}>
        <div style={{
          background: '#000000',
          color: '#F4EFE6',
          fontWeight: 900,
          fontSize: 11,
          borderRadius: 4,
          padding: '2px 6px',
          flexShrink: 0,
        }}>
          LV.{level}
        </div>
        <div style={{
          flex: 1,
          height: 14,
          border: '2.5px solid #000000',
          background: '#ffffff',
          borderRadius: 4,
          overflow: 'hidden',
          boxShadow: '1.5px 1.5px 0 #000000',
        }}>
          <div style={{
            width: `${expPct}%`,
            height: '100%',
            background: '#3DDC84',
            borderRight: expPct > 0 && expPct < 100 ? '2px solid #000000' : 'none',
            transition: 'width 0.3s ease',
          }} />
        </div>
      </div>
    </div>
  );
}


function HudExpBarImpl({ pct, level }: { pct: unknown; level: unknown }) {
  const hud = useHud();
  const p = resolveValue(pct, hud) as number;
  const lv = resolveValue(level, hud) as number;
  return (
    <div style={{
      position: 'relative', width: '100%', height: 24,
      background: '#ffffff',
      border: '2.5px solid #000000',
      boxShadow: '2px 2px 0 #000000',
      borderRadius: 6,
      overflow: 'hidden'
    }}>
      <div style={{ width: `${p}%`, height: '100%', background: '#3DDC84', borderRadius: 0, transition: 'width 0.2s' }} />
      <span style={{ position: 'absolute', left: 8, top: '50%', transform: 'translateY(-50%)', fontSize: 11, fontWeight: '900', color: '#000000' }}>
        LV.{lv}
      </span>
    </div>
  );
}

function HudKillCountImpl({ value }: { value: unknown }) {
  const hud = useHud();
  const v = resolveValue(value, hud) as number;
  return (
    <div style={{
      background: '#ffffff',
      border: '2.5px solid #000000',
      boxShadow: '2px 2px 0 #000000',
      padding: '4px 10px',
      color: '#000000',
      fontSize: 14,
      fontWeight: 900,
      display: 'inline-flex',
      alignItems: 'center',
      gap: 6,
      borderRadius: 8
    }}>
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
        <ellipse cx="12" cy="10" rx="7" ry="6" fill="#000000" />
        <rect x="8" y="15" width="3" height="3" rx="1" fill="#000000" />
        <rect x="13" y="15" width="3" height="3" rx="1" fill="#000000" />
        <rect x="7" y="17" width="10" height="2" rx="1" fill="#000000" />
        <ellipse cx="9.5" cy="9.5" rx="2" ry="2.2" fill="#ffffff" />
        <ellipse cx="14.5" cy="9.5" rx="2" ry="2.2" fill="#ffffff" />
      </svg>
      <span>{v}</span>
    </div>
  );
}

function HudGoldImpl({ value }: { value: unknown }) {
  const hud = useHud();
  const v = resolveValue(value, hud) as number;
  return (
    <div style={{
      background: '#ffffff',
      border: '2.5px solid #000000',
      boxShadow: '2px 2px 0 #000000',
      padding: '4px 10px',
      color: '#000000',
      fontSize: 14,
      fontWeight: 900,
      display: 'inline-flex',
      alignItems: 'center',
      gap: 6,
      borderRadius: 8
    }}>
      <svg width="15" height="15" viewBox="0 0 24 24" fill="#FFD700">
        <circle cx="12" cy="12" r="9" stroke="#000000" strokeWidth="2.5" />
      </svg>
      <span>{v.toLocaleString()}</span>
    </div>
  );
}

function HudPlayerHpImpl({ pct }: { pct: unknown }) {
  const hud = useHud();
  const p = resolveValue(pct, hud) as number;
  const color = p <= 30 ? '#ff4444' : '#FFB347';
  return (
    <div style={{
      position: 'absolute', bottom: -10, left: '10%', width: '80%', height: 8,
      background: '#ffffff', border: '1.5px solid #000000', borderRadius: 4,
      overflow: 'hidden', boxShadow: '1px 1px 0 #000000'
    }}>
      <div style={{ width: `${p}%`, height: '100%', background: color, transition: 'width 0.1s' }} />
    </div>
  );
}

function HudBossHpImpl({ pct, bossName }: { pct: unknown; bossName: unknown }) {
  const hud = useHud();
  const visible = hud['/hud/bossVisible'];
  const p = resolveValue(pct, hud) as number;
  const name = resolveValue(bossName, hud) as string;
  if (!visible) return null;
  return (
    <div style={{ position: 'absolute', top: 72, left: '10%', width: '80%', zIndex: 10 }}>
      <div style={{ color: '#000000', fontSize: 12, fontWeight: 900, marginBottom: 4, textShadow: '1px 1px 0 #ffffff' }}>😈 {name}</div>
      <div style={{
        height: 12, background: '#ffffff',
        border: '2px solid #000000', borderRadius: 6,
        overflow: 'hidden', boxShadow: '2px 2px 0 #000000'
      }}>
        <div style={{ width: `${p}%`, height: '100%', background: '#ff4444', transition: 'width 0.1s' }} />
      </div>
    </div>
  );
}

function HudPauseBtnImpl({ action: _action }: { action: string }) {
  return (
    <button
      style={{
        position: 'absolute',
        left: 12,
        top: 10,
        width: 36,
        height: 36,
        background: '#2b2b2b',
        border: '3px solid #000000',
        borderRadius: 0,
        cursor: 'pointer',
        flexShrink: 0,
        letterSpacing: 1,
      }}
      onClick={() => window.dispatchEvent(new CustomEvent('prism:action', { detail: 'TOGGLE_PAUSE' }))}
    >
      <svg width="14" height="14" viewBox="0 0 24 24" fill="#ffffff" style={{ display: 'block' }}>
        <rect x="5" y="4" width="4" height="16" rx="0.5" />
        <rect x="15" y="4" width="4" height="16" rx="0.5" />
      </svg>
    </button>
  );
}

/* ── 메인 로비 (탕탕특공대 레이아웃 미러링) ── */
/* ── 이벤트 미니 카드 (Lava Quest / Prize Drop) ── */
function getMinigameSketchIcon(id: string) {
  if (id === 'lava') {
    return (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
        {/* 화산 스케치 */}
        <path d="M 3 20 L 8 8 L 11 11 L 13 7 L 16 11 L 21 20 Z" fill="#FF8A65" stroke="#000000" strokeWidth="2.5" strokeLinejoin="round" />
        {/* 흘러내리는 용암 */}
        <path d="M 9 10 Q 11 14 10 16" fill="none" stroke="#E64A19" strokeWidth="2.2" strokeLinecap="round" />
        <path d="M 13 8 Q 12 12 14 15" fill="none" stroke="#E64A19" strokeWidth="2.2" strokeLinecap="round" />
        {/* 연기 */}
        <path d="M 8 5 Q 10 3 12 5 Q 14 3 16 5" fill="none" stroke="#000000" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    );
  }
  if (id === 'prize') {
    return (
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
        {/* 슬롯머신 본체 */}
        <rect x="4" y="4" width="16" height="16" rx="2" fill="#BA68C8" stroke="#000000" strokeWidth="2.5" />
        {/* 화면 영역 */}
        <rect x="7" y="7" width="10" height="6" fill="#FFFFFF" stroke="#000000" strokeWidth="1.8" />
        {/* 슬롯 심볼 */}
        <text x="8.5" y="12" fontSize="5.5" fontWeight="900" fill="#FF4455" fontFamily="monospace">7</text>
        <text x="11.5" y="12" fontSize="5.5" fontWeight="900" fill="#FF4455" fontFamily="monospace">7</text>
        <text x="14.5" y="12" fontSize="5.5" fontWeight="900" fill="#FF4455" fontFamily="monospace">7</text>
        {/* 레버 */}
        <line x1="20" y1="12" x2="22" y2="8" stroke="#000000" strokeWidth="2.5" strokeLinecap="round" />
        <circle cx="22" cy="7" r="2.2" fill="#FF4455" stroke="#000000" strokeWidth="1.8" />
      </svg>
    );
  }
  if (id === 'archery') {
    return (
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
        {/* 활 */}
        <path d="M 6 4 C 14 6 14 18 6 20" fill="none" stroke="#8D6E63" strokeWidth="2.5" strokeLinecap="round" />
        {/* 시위 */}
        <line x1="6" y1="4" x2="6" y2="20" stroke="#000000" strokeWidth="1" />
        {/* 화살 */}
        <line x1="4" y1="12" x2="16" y2="12" stroke="#000000" strokeWidth="2" strokeLinecap="round" />
        <polygon points="16,12 13,9 13,15" fill="#000000" />
        <path d="M 4 10 L 5 12 L 4 14" fill="none" stroke="#000000" strokeWidth="1.2" />
        {/* 과녁 */}
        <circle cx="16" cy="12" r="4.5" fill="#FFCDD2" stroke="#000000" strokeWidth="1.8" />
        <circle cx="16" cy="12" r="2.2" fill="#E53935" stroke="#000000" strokeWidth="1.2" />
      </svg>
    );
  }
  return null;
}

function EventMiniCards({ hud }: { hud: ReturnType<typeof useHud> }) {
  const eventSnap = useSyncExternalStore(
    cb => eventStore.subscribe(cb),
    () => eventStore.getSnapshot(),
  );
  const expressConfigured = Boolean(eventSnap['/event/expressTabVisible']);
  const seasonTabVisible = expressConfigured && isBattleLobbyHud(hud);
  const battleLobby = isBattleLobbyHud(hud);
  const showLava = Boolean(hud['/lobby/showLavaQuest']);
  const showPrize = Boolean(hud['/lobby/showPrizeDrop']);

  const visible = EVENT_MINIGAME_ORDER.filter(id => {
    const flag = EVENT_MINIGAMES[id].showFlag as keyof typeof hud;
    return Boolean(hud[flag]);
  });
  if (!visible.length) return null;

  const redDotCategoryFor = (id: EventMinigameId) => pickScopeRedDot(hud, id);

  const stackTop = (card: EventMinigameId) =>
    `${eventSideTabStackTopPx(battleLobby, eventMiniCardStackIndex(card, { seasonTabVisible, showLava, showPrize }))}px`;

  const tabStyle = (card: EventMinigameId): React.CSSProperties => ({
    position: 'absolute',
    right: 0,
    top: stackTop(card),
    ...eventSideTabShellStyle({
      transition: 'transform 0.2s ease-in-out, top 0.2s ease-in-out',
      zIndex: 48,
    }),
  });

  return (
    <>
      {visible.map(id => {
        const cfg = EVENT_MINIGAMES[id];
        const tickets = Number(hud[cfg.ticketPath as keyof typeof hud] ?? 0);
        const dotCategory = redDotCategoryFor(id);
        return (
          <div
            key={id}
            role="button"
            onClick={() => openEventMinigame(id)}
            style={tabStyle(id)}
            onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.05)'; }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; }}
          >
            <div style={{
              position: 'relative',
              width: 44, height: 44, borderRadius: '50%',
              border: '3px solid #000000', background: cfg.tabBg,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '1.5px 1.5px 0 #000000', fontSize: 24,
              margin: '0 auto',
            }}>
              {getMinigameSketchIcon(id) || cfg.emoji}
              <EventRedDot show={dotCategory !== null} category={dotCategory ?? undefined} />
            </div>
            <div style={{
              marginTop: 6, fontSize: 9, fontWeight: 900, color: '#000000', lineHeight: 1.1,
              textAlign: 'center', whiteSpace: 'nowrap', textTransform: 'uppercase', letterSpacing: '0.5px',
            }}>
              {cfg.label}
            </div>
            <div style={{
              marginTop: 5, fontSize: 10, fontWeight: 900,
              background: '#FFFFFF', border: '2px solid #000000',
              borderRadius: 6, padding: '2px 3px', color: '#000000',
              display: 'inline-block', boxShadow: '1px 1px 0 #000000',
              minWidth: 32, textAlign: 'center',
              whiteSpace: 'nowrap',
            }}>
              {tickets}{cfg.ticketUnit}
            </div>
          </div>
        );
      })}
    </>
  );
}

function LobbyToast() {
  const hud = useHud();
  if (!hud['/toast/visible']) return null;
  return (
    <div style={{
      position: 'absolute', bottom: 96, left: '50%', transform: 'translateX(-50%)',
      background: 'rgba(0,0,0,0.85)', color: '#fff', fontSize: 13, fontWeight: 700,
      padding: '10px 20px', borderRadius: 20, border: '1px solid rgba(255,214,0,0.4)',
      whiteSpace: 'nowrap', zIndex: 48,
    }}>
      {String(hud['/toast/text'] ?? '준비 중입니다')}
    </div>
  );
}

/* ── 챕터 보상용 네온 선물상자 SVG 아이콘 렌더러 ── */
function renderNeonGiftIcon(size = 30, color = '#000000') {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      {/* 상자 본체 */}
      <path d="M 4 10 L 20 10 L 18 21 L 6 21 Z" fill="#FFE082" stroke={color} strokeWidth="2.5" strokeLinejoin="round" />
      {/* 상자 뚜껑 */}
      <path d="M 2 6 L 22 6 L 22 10 L 2 10 Z" fill="#FFB300" stroke={color} strokeWidth="2.5" strokeLinejoin="round" />
      {/* 십자 벨트 */}
      <rect x="11" y="6" width="2" height="15" fill="#FF5252" />
      {/* 이쁜 리본 매듭 */}
      <path d="M 8 3 C 10 1, 12 6, 12 6 C 12 6, 14 1, 16 3 C 18 5, 13 6, 12 6 C 11 6, 6 5, 8 3 Z" fill="#FF5252" stroke={color} strokeWidth="1.8" strokeLinejoin="round" />
    </svg>
  );
}

/* ── 공통 재화 상단 바 (인게임 제외 모든 화면) ──
 * 햄버거 + 아바타 + PLAYER/LV/EXP + 번개·보석·골드 */
export function CommonTopBar() {
  const hud = useHud();
  const advLevel = Number(hud['/lobby/advLevel'] ?? 1);
  const advPct = Number(hud['/lobby/advExpPct'] ?? 0);
  const gems = Number(hud['/lobby/gems'] ?? 0);
  const metaGold = Number(hud['/lobby/metaGold'] ?? 0);
  const entryTickets = Number(hud['/lobby/entryTickets'] ?? 0);
  const fmtGold = (n: number) => n >= 1000 ? `${(n / 1000).toFixed(1)}K` : String(n);

  const Currency = ({ icon, val, onClick }: { icon: React.ReactNode; val: string; onClick?: () => void }) => (
    <div onClick={onClick} style={{
      display: 'flex', alignItems: 'center', gap: 6,
      background: '#F4EFE6', border: '2px solid #000000', borderRadius: 20,
      padding: '4px 10px', fontSize: 12, fontWeight: 900, color: '#000000',
      minHeight: 30, lineHeight: 1, boxShadow: '2px 2px 0 #000000',
      cursor: onClick ? 'pointer' : 'default',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{icon}</div>
      <span>{val}</span>
      {onClick && <span style={{
        marginLeft: 4, width: 14, height: 14, borderRadius: '50%', background: '#FFB347',
        color: '#000000', fontWeight: 900, fontSize: 11, display: 'flex', alignItems: 'center', justifyContent: 'center',
        border: '1.5px solid #000000', lineHeight: 1,
      }}>+</span>}
    </div>
  );

  return (
    <div style={{
      width: '100%', background: '#F4EFE6',
      borderBottom: '2px solid #000000',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '8px 12px', gap: 8, minHeight: 52, boxSizing: 'border-box',
      fontFamily: '"Segoe UI", Roboto, Helvetica, Arial, sans-serif',
    }}>
      {/* 좌: 햄버거 + 아바타 + 레벨 + EXP */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flex: '0 0 auto', minHeight: 36 }}>
        <button onClick={() => hudStore.set('/lobby/menuOpen', !hud['/lobby/menuOpen'])} style={{
          width: 36, height: 36, borderRadius: 0, background: '#F4EFE6',
          border: '2px solid #000000', color: '#000000', fontSize: 16, cursor: 'pointer',
          boxShadow: '2px 2px 0 #000000', outline: 'none',
          display: 'flex', alignItems: 'center', justifyContent: 'center', lineHeight: 1,
        }}>≡</button>
        <div
          onClick={() => window.dispatchEvent(new CustomEvent('lobby:openAvatar'))}
          style={{
            width: 36, height: 36, border: '2px solid #000000', borderRadius: 0, background: '#ffffff',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '2px 2px 0 #000000', cursor: 'pointer',
          }}
        >
          {renderAvatarIcon(28, false, hud['/lobby/selectedPlayerColorHex'] || '#7BE8F4')}
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', height: 36, marginTop: 1 }}>
          <div style={{ fontWeight: 900, fontSize: 11, lineHeight: 1.05, marginBottom: 2, color: '#000' }}>PLAYER 1</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <span style={{ color: '#000000', fontSize: 9, fontWeight: 900, lineHeight: 1 }}>LV.{advLevel}</span>
            <div style={{ width: 56, height: 6, background: '#ffffff', border: '1.5px solid #000000' }}>
              <div style={{ width: `${advPct}%`, height: '100%', background: '#3DDC84' }} />
            </div>
          </div>
        </div>
      </div>
      {/* 우: 재화 3종 */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, minHeight: 36 }}>
        <Currency
          icon={<svg width="14" height="14" viewBox="0 0 24 24" fill="#FFC200"><polygon points="13,2 4,14 11,14 11,22 20,10 13,10" stroke="#000000" strokeWidth="2.5" strokeLinejoin="round" /></svg>}
          val={`${entryTickets}`}
          onClick={() => window.dispatchEvent(new CustomEvent('energy:open'))}
        />
        <Currency
          icon={<svg width="14" height="14" viewBox="0 0 24 24" fill="#7BE8F4"><path d="M12 2L2 12l10 10 10-10z" stroke="#000000" strokeWidth="2.5" strokeLinejoin="round" /></svg>}
          val={gems.toLocaleString()}
        />
        <Currency
          icon={<svg width="14" height="14" viewBox="0 0 24 24" fill="#FFD700"><circle cx="12" cy="12" r="9" stroke="#000000" strokeWidth="2.5" /></svg>}
          val={fmtGold(metaGold)}
        />
      </div>
    </div>
  );
}

/* ── 스테이지 10종 디오라마 (2D 스케치 스타일 맵 프리뷰) ── */
function renderStageDiorama(stageNum: number, avatarColor: string) {
  const renderGrid = () => (
    <>
      <line x1="0" y1="30" x2="180" y2="30" stroke="#000000" strokeWidth="0.5" opacity="0.1" />
      <line x1="0" y1="60" x2="180" y2="60" stroke="#000000" strokeWidth="0.5" opacity="0.1" />
      <line x1="0" y1="90" x2="180" y2="90" stroke="#000000" strokeWidth="0.5" opacity="0.1" />
      <line x1="30" y1="0" x2="30" y2="120" stroke="#000000" strokeWidth="0.5" opacity="0.1" />
      <line x1="60" y1="0" x2="60" y2="120" stroke="#000000" strokeWidth="0.5" opacity="0.1" />
      <line x1="90" y1="0" x2="90" y2="120" stroke="#000000" strokeWidth="0.5" opacity="0.1" />
      <line x1="120" y1="0" x2="120" y2="120" stroke="#000000" strokeWidth="0.5" opacity="0.1" />
      <line x1="150" y1="0" x2="150" y2="120" stroke="#000000" strokeWidth="0.5" opacity="0.1" />
      <line x1="0" y1="120" x2="180" y2="120" stroke="#000000" strokeWidth="3" />
    </>
  );

  const renderEnemies = (color = "#ff6b6b") => (
    <>
      <div style={{ position: 'absolute', top: 38, right: 42 }}>
        <svg width="18" height="18" viewBox="0 0 24 24">
          <polygon points="12,2 22,22 2,22" fill={color} stroke="#000000" strokeWidth="2.5" />
        </svg>
      </div>
      <div style={{ position: 'absolute', bottom: 44, right: 38 }}>
        <svg width="16" height="16" viewBox="0 0 24 24">
          <polygon points="12,2 22,22 2,22" fill={color} stroke="#000000" strokeWidth="2.5" />
        </svg>
      </div>
    </>
  );

  const renderPlayer = () => (
    <div style={{ position: 'absolute', bottom: 24, left: '35%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      {renderAvatarIcon(32, false, avatarColor)}
    </div>
  );

  switch (stageNum) {
    case 1:
      return (
        <div style={{ position: 'relative', width: 180, height: 150 }}>
          <svg width="180" height="150" style={{ position: 'absolute', inset: 0, opacity: 0.85, pointerEvents: 'none' }}>
            {renderGrid()}
            <rect x="20" y="60" width="26" height="60" fill="rgba(0,0,0,0.03)" stroke="#000000" strokeWidth="1.8" />
            <circle cx="28" cy="70" r="1.5" fill="#000" /><circle cx="38" cy="70" r="1.5" fill="#000" />
            <circle cx="28" cy="85" r="1.5" fill="#000" /><circle cx="38" cy="85" r="1.5" fill="#000" />
            <rect x="58" y="40" width="34" height="80" fill="rgba(0,0,0,0.03)" stroke="#000000" strokeWidth="1.8" />
            <rect x="66" y="50" width="6" height="6" fill="#000" /><rect x="78" y="50" width="6" height="6" fill="#000" />
            <rect x="105" y="70" width="30" height="50" fill="rgba(0,0,0,0.03)" stroke="#000000" strokeWidth="1.8" />
          </svg>
          {renderPlayer()}
          {renderEnemies()}
        </div>
      );
    case 2:
      return (
        <div style={{ position: 'relative', width: 180, height: 150 }}>
          <svg width="180" height="150" style={{ position: 'absolute', inset: 0, opacity: 0.85, pointerEvents: 'none' }}>
            {renderGrid()}
            <line x1="0" y1="115" x2="180" y2="115" stroke="#000000" strokeWidth="2" strokeDasharray="6,4" />
            <rect x="15" y="50" width="45" height="65" fill="#CFD8DC" stroke="#000000" strokeWidth="2" rx="4" />
            <rect x="20" y="58" width="35" height="20" fill="#ECEFF1" stroke="#000000" strokeWidth="1.5" />
            <circle cx="28" cy="95" r="3" fill="#FFE082" stroke="#000000" strokeWidth="1.5" />
            <circle cx="48" cy="95" r="3" fill="#FFE082" stroke="#000000" strokeWidth="1.5" />
            <rect x="90" y="30" width="10" height="90" fill="#B0BEC5" stroke="#000000" strokeWidth="1.8" />
          </svg>
          {renderPlayer()}
          {renderEnemies()}
        </div>
      );
    case 3:
      return (
        <div style={{ position: 'relative', width: 180, height: 150 }}>
          <svg width="180" height="150" style={{ position: 'absolute', inset: 0, opacity: 0.85, pointerEvents: 'none' }}>
            {renderGrid()}
            <polygon points="10,120 40,50 60,50 90,120" fill="#FF8A80" stroke="#000000" strokeWidth="2" strokeLinejoin="round" />
            <path d="M 40 50 Q 50 65 60 50" stroke="#000000" strokeWidth="2" fill="none" />
            <path d="M 45 45 C 40 30, 50 25, 52 35 C 55 25, 65 30, 60 45" fill="none" stroke="#000000" strokeWidth="1.5" />
            <polygon points="100,120 120,80 130,85 150,120" fill="#90A4AE" stroke="#000000" strokeWidth="2" strokeLinejoin="round" />
            <path d="M 0 118 Q 45 110 90 118 Q 135 125 180 118" stroke="#FF5252" strokeWidth="2" fill="none" />
          </svg>
          {renderPlayer()}
          {renderEnemies("#FF5252")}
        </div>
      );
    case 4:
      return (
        <div style={{ position: 'relative', width: 180, height: 150 }}>
          <svg width="180" height="150" style={{ position: 'absolute', inset: 0, opacity: 0.85, pointerEvents: 'none' }}>
            {renderGrid()}
            <rect x="15" y="60" width="35" height="60" fill="#ECEFF1" stroke="#000000" strokeWidth="2" />
            <rect x="25" y="70" width="15" height="40" fill="#80DEEA" stroke="#000000" strokeWidth="1.5" rx="3" />
            <line x1="25" y1="80" x2="40" y2="80" stroke="#000000" strokeWidth="1" />
            <rect x="75" y="40" width="40" height="80" fill="#B0BEC5" stroke="#000000" strokeWidth="2" />
            <rect x="80" y="48" width="30" height="24" fill="#37474F" stroke="#000000" strokeWidth="1.5" />
            <path d="M 83 60 L 90 60 L 93 52 L 96 68 L 99 60 L 107 60" stroke="#00E676" strokeWidth="1.5" fill="none" />
            <circle cx="85" cy="85" r="2.5" fill="#FF1744" stroke="#000000" strokeWidth="1" />
            <circle cx="95" cy="85" r="2.5" fill="#FFE082" stroke="#000000" strokeWidth="1" />
            <circle cx="105" cy="85" r="2.5" fill="#2979FF" stroke="#000000" strokeWidth="1" />
            <rect x="135" y="30" width="30" height="20" fill="#78909C" stroke="#000000" strokeWidth="1.5" />
          </svg>
          {renderPlayer()}
          {renderEnemies("#00E676")}
        </div>
      );
    case 5:
      return (
        <div style={{ position: 'relative', width: 180, height: 150 }}>
          <svg width="180" height="150" style={{ position: 'absolute', inset: 0, opacity: 0.85, pointerEvents: 'none' }}>
            {renderGrid()}
            <polygon points="15,120 60,60 105,120" fill="#FFE082" stroke="#000000" strokeWidth="2" strokeLinejoin="round" />
            <line x1="60" y1="60" x2="60" y2="120" stroke="#000000" strokeWidth="1.5" strokeDasharray="3,3" />
            <path d="M 130 120 L 130 85 M 130 95 Q 120 95 120 85 M 130 105 Q 140 105 140 95" stroke="#000000" strokeWidth="3" strokeLinecap="round" fill="none" />
            <path d="M 10 40 Q 50 20 90 40 T 170 40" stroke="#000000" strokeWidth="1" strokeLinecap="round" fill="none" opacity="0.3" />
          </svg>
          {renderPlayer()}
          {renderEnemies("#FFB300")}
        </div>
      );
    case 6:
      return (
        <div style={{ position: 'relative', width: 180, height: 150 }}>
          <svg width="180" height="150" style={{ position: 'absolute', inset: 0, opacity: 0.85, pointerEvents: 'none' }}>
            {renderGrid()}
            <polygon points="10,120 30,70 50,120" fill="#E0F7FA" stroke="#000000" strokeWidth="2" strokeLinejoin="round" />
            <polygon points="40,120 70,50 100,120" fill="#80DEEA" stroke="#000000" strokeWidth="2" strokeLinejoin="round" />
            <circle cx="135" cy="108" r="12" fill="#FFFFFF" stroke="#000000" strokeWidth="2" />
            <circle cx="135" cy="88" r="8" fill="#FFFFFF" stroke="#000000" strokeWidth="2" />
            <circle cx="132" cy="86" r="1" fill="#000" /><circle cx="138" cy="86" r="1" fill="#000" />
            <polygon points="135,88 143,89 135,91" fill="#FF8A65" stroke="#000000" strokeWidth="1" />
          </svg>
          {renderPlayer()}
          {renderEnemies("#26C6DA")}
        </div>
      );
    case 7:
      return (
        <div style={{ position: 'relative', width: 180, height: 150 }}>
          <svg width="180" height="150" style={{ position: 'absolute', inset: 0, opacity: 0.85, pointerEvents: 'none' }}>
            {renderGrid()}
            <rect x="25" y="90" width="6" height="30" fill="#8D6E63" stroke="#000000" strokeWidth="1.8" />
            <polygon points="13,90 28,50 43,90" fill="#81C784" stroke="#000000" strokeWidth="2" strokeLinejoin="round" />
            <rect x="75" y="80" width="8" height="40" fill="#8D6E63" stroke="#000000" strokeWidth="1.8" />
            <polygon points="60,80 79,35 98,80" fill="#4CAF50" stroke="#000000" strokeWidth="2" strokeLinejoin="round" />
            <polygon points="110,120 135,85 160,120" fill="#FF8A65" stroke="#000000" strokeWidth="2" strokeLinejoin="round" />
          </svg>
          {renderPlayer()}
          {renderEnemies("#4CAF50")}
        </div>
      );
    case 8:
      return (
        <div style={{ position: 'relative', width: 180, height: 150 }}>
          <svg width="180" height="150" style={{ position: 'absolute', inset: 0, opacity: 0.85, pointerEvents: 'none' }}>
            {renderGrid()}
            <path d="M 10 90 C 10 75, 30 75, 45 80 C 60 75, 80 75, 85 90 C 85 105, 10 105, 10 90 Z" fill="#E1F5FE" stroke="#000000" strokeWidth="2" />
            <line x1="20" y1="102" x2="30" y2="115" stroke="#000000" strokeWidth="1.5" />
            <line x1="45" y1="102" x2="52" y2="115" stroke="#000000" strokeWidth="1.5" />
            <rect x="110" y="50" width="35" height="70" fill="#ECEFF1" stroke="#000000" strokeWidth="2" />
            <polygon points="105,50 127,20 150,50" fill="#90A4AE" stroke="#000000" strokeWidth="2" strokeLinejoin="round" />
          </svg>
          {renderPlayer()}
          {renderEnemies("#00B0FF")}
        </div>
      );
    case 9:
      return (
        <div style={{ position: 'relative', width: 180, height: 150 }}>
          <svg width="180" height="150" style={{ position: 'absolute', inset: 0, opacity: 0.85, pointerEvents: 'none' }}>
            {renderGrid()}
            <path d="M 15 120 A 25 25 0 0 1 65 120 Z" fill="#B2EBF2" stroke="#000000" strokeWidth="2.5" />
            <rect x="95" y="60" width="45" height="25" rx="10" fill="#FFE082" stroke="#000000" strokeWidth="2" />
            <rect x="110" y="45" width="12" height="15" fill="#FFE082" stroke="#000000" strokeWidth="2" />
            <path d="M 160 120 Q 155 100 162 80 T 158 50" fill="none" stroke="#000000" strokeWidth="2.5" strokeLinecap="round" />
          </svg>
          {renderPlayer()}
          {renderEnemies("#00ACC1")}
        </div>
      );
    case 10:
    default:
      return (
        <div style={{ position: 'relative', width: 180, height: 150 }}>
          <svg width="180" height="150" style={{ position: 'absolute', inset: 0, opacity: 0.85, pointerEvents: 'none' }}>
            {renderGrid()}
            <circle cx="35" cy="55" r="22" fill="#FFE082" stroke="#000000" strokeWidth="2" />
            <ellipse cx="35" cy="55" rx="35" ry="6" stroke="#000000" strokeWidth="2" fill="none" transform="rotate(-15, 35, 55)" />
            <rect x="100" y="60" width="35" height="20" fill="#ECEFF1" stroke="#000000" strokeWidth="2" />
            <rect x="85" y="45" width="10" height="50" fill="#2979FF" stroke="#000000" strokeWidth="1.5" />
            <rect x="140" y="45" width="10" height="50" fill="#2979FF" stroke="#000000" strokeWidth="1.5" />
            <line x1="95" y1="70" x2="145" y2="70" stroke="#000000" strokeWidth="2" />
          </svg>
          {renderPlayer()}
          {renderEnemies("#7E57C2")}
        </div>
      );
  }
}

function LobbyScreenImpl() {
  const hud = useHud();
  if (!hud['/lobby/visible']) return null;
  const selectedStage = Number(hud['/lobby/selectedStage'] ?? 1);
  const maxStages = Number(hud['/lobby/maxStages'] ?? 10);
  const entryTickets = Number(hud['/lobby/entryTickets'] ?? 0);
  const selectedMult = Number(hud['/lobby/selectedMult'] ?? 1);
  const multEnergyCost = Number(hud['/lobby/multEnergyCost'] ?? 5);
  const canStart = entryTickets >= multEnergyCost;
  const stageName = String(hud['/lobby/stageName'] ?? '');
  const bestTime = String(hud['/lobby/bestTime'] ?? '--:--');

  const toast = (msg: string) => window.dispatchEvent(new CustomEvent('lobby:toast', { detail: msg }));
  const prevStage = () => window.dispatchEvent(new CustomEvent('lobby:selectStage', { detail: Math.max(1, selectedStage - 1) }));
  const nextStage = () => window.dispatchEvent(new CustomEvent('lobby:selectStage', { detail: Math.min(maxStages, selectedStage + 1) }));

  /* 하단 탭 */
  return (
    <div style={{
      position: 'absolute', inset: 0, zIndex: 45,
      background: '#F4EFE6',
      display: 'flex', flexDirection: 'column',
      color: '#000000', fontFamily: '"Segoe UI", Roboto, Helvetica, Arial, sans-serif',
      overflow: 'hidden',
    }}>
      {/* 상단 재화 바는 App 레벨 CommonTopBar로 통일 — 영역만 확보 */}
      <div style={{ minHeight: 52, flexShrink: 0 }} />

      {/* ── 중앙: 스테이지 뷰 ── */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '0 16px', position: 'relative' }}>
        {/* 스테이지 제목 */}
        <div style={{ fontSize: 24, fontWeight: 900, letterSpacing: 1, color: '#000000' }}>{selectedStage}. {stageName}</div>
        <div style={{ color: '#555555', fontSize: 11, marginTop: 2, marginBottom: 18, fontWeight: 700 }}>최장 생존시간 {bestTime}</div>

        {/* 스테이지 디오라마 (미니 프리뷰) + 좌우 화살표 */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
          <button onClick={prevStage} disabled={selectedStage <= 1} style={{
            width: 34, height: 34, borderRadius: 0, background: '#F4EFE6',
            border: '2px solid #000000', color: selectedStage <= 1 ? '#888' : '#00',
            fontSize: 16, cursor: selectedStage <= 1 ? 'default' : 'pointer',
            boxShadow: selectedStage <= 1 ? 'none' : '2px 2px 0 #000000',
            outline: 'none', fontWeight: 900,
          }}>‹</button>
          <div style={{
            width: 180, height: 150, borderRadius: 0,
            background: '#e8dfd1',
            border: '3px solid #000000',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            position: 'relative', overflow: 'hidden',
            boxShadow: '4px 4px 0 #000000',
          }}>
            {renderStageDiorama(selectedStage, hud['/lobby/selectedPlayerColorHex'] || '#7BE8F4')}
          </div>
          <button onClick={nextStage} disabled={selectedStage >= maxStages} style={{
            width: 34, height: 34, borderRadius: 0, background: '#F4EFE6',
            border: '2px solid #000000', color: selectedStage >= maxStages ? '#888' : '#00',
            fontSize: 16, cursor: selectedStage >= maxStages ? 'default' : 'pointer',
            boxShadow: selectedStage >= maxStages ? 'none' : '2px 2px 0 #000000',
            outline: 'none', fontWeight: 900,
          }}>›</button>
        </div>

        {/* 챕터 보물상자 */}
        <div onClick={() => toast('챕터 보상 준비 중입니다')} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, marginBottom: 14, cursor: 'pointer' }}>
          {renderNeonGiftIcon(30, '#000000')}
          <div style={{ color: '#444444', fontSize: 10, fontWeight: 900 }}>챕터 보상</div>
        </div>

        {/* 배수 토글 + 게임 시작 (모노 GO식) */}
        <div style={{ display: 'flex', alignItems: 'stretch', gap: 12 }}>
          <button
            type="button"
            onClick={() => window.dispatchEvent(new CustomEvent('lobby:cycleMult'))}
            title={canStart ? `입장 시 번개 ${multEnergyCost} 소모` : `번개 ${entryTickets}/${multEnergyCost} — 배수를 낮추거나 충전하세요`}
            style={{
              minWidth: 94, padding: '10px 8px', cursor: 'pointer',
              background: '#F4EFE6',
              border: '2.5px solid #000000', borderRadius: 12,
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 4,
              boxShadow: '3px 3px 0 #000000', outline: 'none',
            }}
          >
            <span style={{ color: '#000000', fontWeight: 900, fontSize: 22 }}>×{selectedMult}</span>
            <span style={{ color: '#555555', fontWeight: 900, fontSize: 10 }}>배수</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="#FFC200" style={{ filter: 'drop-shadow(1px 1px 0 #000000)' }}>
                <polygon points="13,2 4,14 11,14 11,22 20,10 13,10" stroke="#000000" strokeWidth="2.5" strokeLinejoin="round" />
              </svg>
              <span style={{ color: canStart ? '#000000' : '#d32f2f', fontWeight: 900, fontSize: 13 }}>
                {multEnergyCost} 소모
              </span>
            </div>
          </button>
          <button
            type="button"
            disabled={!canStart}
            onClick={() => {
              if (!canStart) {
                window.dispatchEvent(new CustomEvent('energy:open'));
                return;
              }
              window.dispatchEvent(new CustomEvent('prism:action', { detail: 'START_GAME' }));
            }}
            style={{
              background: canStart ? '#FFB347' : '#cccccc',
              border: '2.5px solid #000000', borderRadius: 12,
              padding: '12px 32px', cursor: canStart ? 'pointer' : 'not-allowed',
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 2,
              boxShadow: canStart ? '3px 3px 0 #000000' : 'none',
              outline: 'none', opacity: canStart ? 1 : 0.65,
            }}
          >
            <span style={{ color: '#000000', fontWeight: 900, fontSize: 22 }}>게임 시작</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 2 }}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill={canStart ? '#FFC200' : '#888888'} style={{ filter: canStart ? 'drop-shadow(1px 1px 0 #000000)' : 'none' }}>
                <polygon points="13,2 4,14 11,14 11,22 20,10 13,10" stroke={canStart ? '#000000' : '#888888'} strokeWidth="2.5" strokeLinejoin="round" />
              </svg>
              <span style={{ color: canStart ? '#000000' : '#d32f2f', fontWeight: 900, fontSize: 13 }}>
                {canStart ? `${multEnergyCost} 소모` : '번개 부족'}
              </span>
            </div>
          </button>
        </div>
      </div>

      {/* ── 이벤트 카드 (Lava Quest / Prize Drop) ── */}
      <EventMiniCards hud={hud} />

      {/* ── 하단 네비게이션 탭 (전투 활성) ── */}
      <NavTabBar active="battle" />

      <LobbyToast />
    </div>
  );
}

function SceneTransitionImpl({ visibleState, text }: { visibleState: unknown; text: unknown }) {
  const hud = useHud();
  const visible = Boolean(resolveValue(visibleState, hud));
  const label = String(resolveValue(text, hud) ?? 'STAGE 1');
  if (!visible) return null;

  const isStageStart = label.toUpperCase().includes('STAGE') || label.toUpperCase().includes('LV.');

  return createPortal(
    <div style={{
      position: 'absolute', inset: 0, zIndex: 99999,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      pointerEvents: 'none',
      overflow: 'hidden',
    }}>
      <style>{`
        @keyframes stripeSlideIn {
          0% { transform: translateY(-120%) skewX(-15deg); }
          100% { transform: translateY(0) skewX(-15deg); }
        }
        @keyframes stripeSlideOut {
          0% { transform: translateY(0) skewX(-15deg); }
          100% { transform: translateY(120%) skewX(-15deg); }
        }
        @keyframes boxPop {
          0% { transform: scale(0) rotate(-5deg); opacity: 0; }
          25% { transform: scale(1.1) rotate(3deg); opacity: 1; }
          45% { transform: scale(0.95) rotate(-1deg); }
          65% { transform: scale(1) rotate(0deg); }
          100% { transform: scale(1) rotate(0deg); opacity: 1; }
        }
        @keyframes boxScaleDown {
          0% { transform: scale(1) rotate(0deg); opacity: 1; }
          30% { transform: scale(1.1) rotate(3deg); }
          100% { transform: scale(0) rotate(-10deg); opacity: 0; }
        }
        @keyframes screenShake {
          0%, 100% { transform: translate(0, 0); }
          10%, 30%, 50%, 70%, 90% { transform: translate(-4px, 4px); }
          20%, 40%, 60%, 80% { transform: translate(4px, -4px); }
        }
        .transition-stripe {
          position: absolute;
          top: -10%;
          height: 120%;
          background: #000000;
          border-left: 4px solid #FFE45C;
          border-right: 4px solid #FFE45C;
          box-shadow: 0 0 10px rgba(0,0,0,0.5);
          transform: translateY(-120%) skewX(-15deg);
        }
        .stripe-0 { left: -10%; width: 35%; animation: stripeSlideIn 0.7s cubic-bezier(0.25, 1, 0.5, 1) forwards, stripeSlideOut 0.8s cubic-bezier(0.76, 0, 0.24, 1) 1.85s forwards; }
        .stripe-1 { left: 20%; width: 35%; animation: stripeSlideIn 0.7s cubic-bezier(0.25, 1, 0.5, 1) 0.1s forwards, stripeSlideOut 0.8s cubic-bezier(0.76, 0, 0.24, 1) 1.95s forwards; }
        .stripe-2 { left: 50%; width: 35%; animation: stripeSlideIn 0.7s cubic-bezier(0.25, 1, 0.5, 1) 0.2s forwards, stripeSlideOut 0.8s cubic-bezier(0.76, 0, 0.24, 1) 2.05s forwards; }
        .stripe-3 { left: 80%; width: 35%; animation: stripeSlideIn 0.7s cubic-bezier(0.25, 1, 0.5, 1) 0.3s forwards, stripeSlideOut 0.8s cubic-bezier(0.76, 0, 0.24, 1) 2.15s forwards; }
        
        .transition-box {
          background: #F4EFE6;
          border: 4px solid #000000;
          border-radius: 16px;
          padding: 18px 36px;
          box-shadow: 6px 6px 0 #000000;
          z-index: 99999;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 6px;
          animation: boxPop 0.8s cubic-bezier(0.175, 0.885, 0.32, 1.1) 0.3s forwards, boxScaleDown 0.35s cubic-bezier(0.6, -0.28, 0.735, 0.045) 3.0s forwards;
          opacity: 0;
        }
        .shake-container {
          position: absolute;
          inset: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          animation: screenShake 0.3s ease-out 0.6s 1;
        }
      `}</style>
      
      <div className="transition-stripe stripe-0" />
      <div className="transition-stripe stripe-1" />
      <div className="transition-stripe stripe-2" />
      <div className="transition-stripe stripe-3" />

      {isStageStart && (
        <div className="shake-container">
          <div className="transition-box">
            <div style={{ fontSize: 12, fontWeight: 900, color: '#FF8A2A', letterSpacing: 3, textTransform: 'uppercase' }}>Ready...</div>
            <div style={{ fontSize: 26, fontWeight: 900, color: '#000000', letterSpacing: 1 }}>{label}</div>
            <div style={{
              background: '#FFE45C',
              border: '2.5px solid #000000',
              borderRadius: 8,
              padding: '3px 12px',
              fontSize: 14,
              fontWeight: 900,
              color: '#000000',
              boxShadow: '2.5px 2.5px 0 #000000',
              marginTop: 4,
              transform: 'rotate(-2deg)'
            }}>
              GO SQUAD! 🚀
            </div>
          </div>
        </div>
      )}
    </div>,
    document.body
  );
}

function HudSkillSlotsImpl({ slots: _slots }: { slots: unknown }) {
  return null;
}

function HudBossWarningImpl() {
  const hud = useHud();
  if (!hud['/hud/bossWarningVisible']) return null;
  return (
    <div style={{
      position: 'absolute', top: 80, left: '50%', transform: 'translateX(-50%)',
      background: '#CC0000', color: '#fff', fontWeight: 'bold', fontSize: 20,
      padding: '8px 24px', borderRadius: 0, zIndex: 20,
      border: '2px solid #FF4444',
      boxShadow: '0 0 16px #CC000088',
    }}>
      ⚠️ BOSS WARNING ⚠️
    </div>
  );
}

function BossIntroImpl() {
  const hud = useHud();
  const phase = Number(hud['/bossIntro/phase'] ?? 0);
  const bossName = String(hud['/hud/bossName'] ?? 'TITAN');
  if (phase === 0) return null;

  if (phase === 1) {
    /* Phase 1 — WARNING 빨간 비네트 + 맥동 경고 */
    return (
      <div style={{
        position: 'absolute', inset: 0, zIndex: 55, pointerEvents: 'none',
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        background: 'radial-gradient(circle, rgba(100,0,0,0.2) 0%, rgba(80,0,0,0.65) 100%)',
        boxShadow: 'inset 0 0 140px 60px rgba(220,0,0,0.5)',
        animation: 'bossWarnPulse 0.45s ease-in-out infinite alternate',
      }}>
        <div style={{ fontSize: 52, marginBottom: 8, filter: 'drop-shadow(0 0 12px #FF0000)' }}>⚠️</div>
        <div style={{
          color: '#FF2222', fontWeight: 900, fontSize: 44, letterSpacing: 8,
          textShadow: '0 0 20px rgba(255,0,0,1), 0 0 40px rgba(255,0,0,0.5)',
        }}>WARNING</div>
        <div style={{
          color: '#FFB0B0', fontSize: 16, marginTop: 10, fontWeight: 700, letterSpacing: 2,
        }}>최종 보스가 등장합니다</div>
      </div>
    );
  }

  if (phase === 2) {
    /* Phase 2 — 퍼플 암전 + 보스 이름 등장 */
    return (
      <div style={{
        position: 'absolute', inset: 0, zIndex: 55, pointerEvents: 'none',
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        background: 'radial-gradient(circle at 50% 55%, rgba(80,0,160,0.5) 0%, rgba(5,0,15,0.92) 100%)',
      }}>
        <div style={{
          fontSize: 72, filter: 'drop-shadow(0 0 24px #CC00FF)',
          animation: 'bossEyePulse 0.6s ease-in-out infinite alternate',
        }}>👁️</div>
        <div style={{
          color: '#CC44FF', fontWeight: 900, fontSize: 40, letterSpacing: 6, marginTop: 12,
          textShadow: '0 0 24px rgba(200,80,255,1), 0 0 60px rgba(160,0,255,0.6)',
          animation: 'bossNameSlide 0.4s cubic-bezier(0.22,1,0.36,1) both',
        }}>{bossName}</div>
        <div style={{
          color: '#CC88FF', fontSize: 14, marginTop: 8, letterSpacing: 3,
          fontWeight: 700, opacity: 0.9,
        }}>FINAL BOSS</div>
        <div style={{
          position: 'absolute', inset: 0,
          background: 'repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(120,0,200,0.04) 3px, rgba(120,0,200,0.04) 4px)',
          pointerEvents: 'none',
        }} />
      </div>
    );
  }

  /* Phase 3 — 등장 충격파 (보스 스폰 직후) */
  return (
    <div style={{
      position: 'absolute', inset: 0, zIndex: 55, pointerEvents: 'none',
      background: 'radial-gradient(circle at 50% 60%, rgba(180,80,255,0.35) 0%, transparent 65%)',
      animation: 'bossShockFade 0.8s ease-out both',
    }} />
  );
}

function BossDeathImpl() {
  const hud = useHud();
  const phase = Number(hud['/bossDeath/phase'] ?? 0);
  const bossName = String(hud['/bossDeath/bossName'] ?? 'TITAN');
  if (phase === 0) return null;

  if (phase === 1) {
    /* Phase 1 — 폭발 플래시 */
    return (
      <div style={{
        position: 'absolute', inset: 0, zIndex: 65, pointerEvents: 'none',
        background: 'rgba(255,220,100,0.55)',
        animation: 'bossDeathFlash 0.7s ease-out both',
      }} />
    );
  }

  if (phase === 2) {
    /* Phase 2 — VICTORY */
    return (
      <div style={{
        position: 'absolute', inset: 0, zIndex: 65, pointerEvents: 'none',
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        background: 'radial-gradient(circle, rgba(255,200,0,0.18) 0%, rgba(0,0,0,0.55) 100%)',
      }}>
        <div style={{
          color: '#FFD600', fontWeight: 900, fontSize: 56, letterSpacing: 8,
          textShadow: '0 0 30px rgba(255,220,0,1), 0 0 80px rgba(255,160,0,0.7)',
          animation: 'bossVictoryPop 0.5s cubic-bezier(0.22,1,0.36,1) both',
        }}>VICTORY!</div>
        <div style={{
          color: '#FFF', fontWeight: 700, fontSize: 18, marginTop: 10, letterSpacing: 4,
          textShadow: '0 0 12px rgba(255,200,0,0.8)',
          animation: 'bossVictoryPop 0.5s 0.15s cubic-bezier(0.22,1,0.36,1) both',
        }}>{bossName} 처치</div>
        <div style={{
          marginTop: 20, display: 'flex', gap: 6,
        }}>
          {['★','★','★'].map((s, i) => (
            <span key={i} style={{
              fontSize: 36, color: '#FFD600',
              filter: 'drop-shadow(0 0 8px #FFB300)',
              animation: `bossStarPop 0.4s ${0.3 + i * 0.12}s cubic-bezier(0.22,1,0.36,1) both`,
            }}>{s}</span>
          ))}
        </div>
      </div>
    );
  }

  /* Phase 3 — 페이드아웃 */
  return (
    <div style={{
      position: 'absolute', inset: 0, zIndex: 65, pointerEvents: 'none',
      background: 'rgba(0,0,0,0)',
      animation: 'bossDeathFadeOut 1.3s ease-in both',
    }}>
      <div style={{
        position: 'absolute', inset: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <div style={{
          color: '#FFD600', fontWeight: 900, fontSize: 56, letterSpacing: 8,
          textShadow: '0 0 30px rgba(255,220,0,0.8)',
          opacity: 0.6,
        }}>VICTORY!</div>
      </div>
    </div>
  );
}

function RushWarningImpl() {
  const hud = useHud();
  if (!hud['/rushWave/visible']) return null;
  return (
    <div style={{
      position: 'absolute', top: 120, left: '50%', transform: 'translateX(-50%)',
      background: 'rgba(180, 40, 0, 0.92)', color: '#fff',
      fontWeight: 900, fontSize: 22, letterSpacing: 2,
      padding: '10px 28px', borderRadius: 0, zIndex: 25,
      border: '2px solid #FF6622',
      boxShadow: '0 0 24px rgba(255, 102, 34, 0.6)',
      textAlign: 'center',
      animation: 'none',
    }}>
      ⚠️ RUSH INCOMING ⚠️
      <div style={{ fontSize: 11, fontWeight: 400, marginTop: 4, opacity: 0.85 }}>
        대규모 적 무리가 몰려옵니다
      </div>
    </div>
  );
}

function renderSkillIcon(skillId: string, size = 44): React.ReactNode {
  switch (skillId) {
    case 'kunai':
      return (
        <svg width={size} height={size} viewBox="0 0 48 48">
          <path d="M24 6 L34 24 L24 42 L14 24 Z" fill="none" stroke="#FF5388" strokeWidth="4.5" filter="drop-shadow(0 0 5px #FF5388)"/>
          <circle cx="24" cy="24" r="3.5" fill="#FF5388"/>
        </svg>
      );
    case 'ghost_shuriken':
      return (
        <svg width={size} height={size} viewBox="0 0 48 48">
          <path d="M24 4 L36 24 L24 44 L12 24 Z" fill="none" stroke="#00F0FF" strokeWidth="4.5" filter="drop-shadow(0 0 6px #00F0FF)"/>
          <path d="M24 10 L31 24 L24 38 L17 24 Z" fill="none" stroke="#00F0FF" strokeWidth="2" strokeDasharray="3 3"/>
        </svg>
      );
    case 'boomerang':
      return (
        <svg width={size} height={size} viewBox="0 0 48 48">
          <path d="M14 14 L34 14 L34 34" fill="none" stroke="#00A0FF" strokeWidth="5.5" strokeLinecap="round" strokeLinejoin="round" filter="drop-shadow(0 0 5px #00A0FF)"/>
        </svg>
      );
    case 'twin_boomerang':
      return (
        <svg width={size} height={size} viewBox="0 0 48 48">
          <circle cx="24" cy="24" r="15" fill="none" stroke="#00FFFF" strokeWidth="4.5" filter="drop-shadow(0 0 5px #00FFFF)"/>
          <circle cx="24" cy="24" r="9" fill="none" stroke="#00FFFF" strokeWidth="2"/>
        </svg>
      );
    case 'molotov':
      return (
        <svg width={size} height={size} viewBox="0 0 48 48">
          <circle cx="24" cy="24" r="16" fill="none" stroke="#FF6633" strokeWidth="4.5" filter="drop-shadow(0 0 5px #FF6633)"/>
          <path d="M16 24 A8 8 0 0 1 32 24" fill="none" stroke="#FF3300" strokeWidth="3"/>
        </svg>
      );
    case 'napalm':
      return (
        <svg width={size} height={size} viewBox="0 0 48 48">
          <circle cx="24" cy="24" r="18" fill="none" stroke="#FF3300" strokeWidth="5.5" filter="drop-shadow(0 0 8px #FF3300)"/>
          <circle cx="24" cy="24" r="10" fill="#FF8800" opacity="0.6"/>
        </svg>
      );
    case 'guardian':
      return (
        <svg width={size} height={size} viewBox="0 0 48 48">
          <circle cx="24" cy="24" r="13" fill="none" stroke="#E5E5E5" strokeWidth="3"/>
          <rect x="21" y="4" width="6" height="40" fill="#E5E5E5" transform="rotate(30 24 24)"/>
          <rect x="21" y="4" width="6" height="40" fill="#E5E5E5" transform="rotate(120 24 24)"/>
        </svg>
      );
    case 'eternal_guardian':
      return (
        <svg width={size} height={size} viewBox="0 0 48 48">
          <circle cx="24" cy="24" r="15" fill="none" stroke="#FFD600" strokeWidth="4.5" filter="drop-shadow(0 0 6px #FFD600)"/>
          <polygon points="24,2 28,16 42,16 31,25 35,39 24,30 13,39 17,25 6,16 20,16" fill="none" stroke="#FFD600" strokeWidth="2.5"/>
        </svg>
      );
    case 'rocket':
      return (
        <svg width={size} height={size} viewBox="0 0 48 48">
          <rect x="20" y="8" width="8" height="28" rx="4" fill="none" stroke="#FF6633" strokeWidth="4.5" filter="drop-shadow(0 0 5px #FF6633)"/>
          <polygon points="20,36 28,36 24,44" fill="#FF3300"/>
        </svg>
      );
    case 'cluster_rocket':
      return (
        <svg width={size} height={size} viewBox="0 0 48 48">
          <rect x="17" y="6" width="14" height="28" rx="6" fill="none" stroke="#FF3300" strokeWidth="4.5" filter="drop-shadow(0 0 6px #FF3300)"/>
          <circle cx="24" cy="28" r="3.5" fill="#FFCC00"/>
          <polygon points="14,34 34,34 24,44" fill="#FF5500"/>
        </svg>
      );
    case 'drone':
      return (
        <svg width={size} height={size} viewBox="0 0 48 48">
          <rect x="14" y="14" width="20" height="20" rx="3" fill="none" stroke="#8F9DB6" strokeWidth="4.5" filter="drop-shadow(0 0 5px #8F9DB6)"/>
          <circle cx="24" cy="24" r="6.5" fill="#FF533D"/>
        </svg>
      );
    case 'soccer_ball':
      return (
        <svg width={size} height={size} viewBox="0 0 48 48">
          <circle cx="24" cy="24" r="16" fill="none" stroke="#80E5B0" strokeWidth="4.5" filter="drop-shadow(0 0 6px #80E5B0)"/>
          <polygon points="24,14 29,24 19,24" fill="#80E5B0"/>
        </svg>
      );
    case 'quantum_ball':
      return (
        <svg width={size} height={size} viewBox="0 0 48 48">
          <circle cx="24" cy="24" r="16" fill="none" stroke="#00FFCC" strokeWidth="5.5" filter="drop-shadow(0 0 8px #00FFCC)"/>
          <circle cx="24" cy="24" r="6" fill="#00FFCC" opacity="0.8"/>
        </svg>
      );
    case 'drill_shot':
      return (
        <svg width={size} height={size} viewBox="0 0 48 48">
          <polygon points="24,4 36,36 12,36" fill="none" stroke="#00F0FF" strokeWidth="4.5" filter="drop-shadow(0 0 6px #00F0FF)"/>
          <path d="M24 12 Q20 20 24 28" fill="none" stroke="#00F0FF" strokeWidth="2.5"/>
        </svg>
      );
    case 'whistling_arrow':
      return (
        <svg width={size} height={size} viewBox="0 0 48 48">
          <polygon points="24,2 34,32 24,26 14,32" fill="none" stroke="#00F0FF" strokeWidth="4.5" filter="drop-shadow(0 0 8px #00F0FF)"/>
          <line x1="24" y1="26" x2="24" y2="44" stroke="#00F0FF" strokeWidth="3" strokeDasharray="3 3"/>
        </svg>
      );
    case 'dimensional_blade':
      return (
        <svg width={size} height={size} viewBox="0 0 48 48">
          <path d="M8 40 Q24 20 40 8" fill="none" stroke="#FF55FF" strokeWidth="4.5" strokeLinecap="round" filter="drop-shadow(0 0 6px #FF55FF)"/>
        </svg>
      );
    case 'void_slash':
      return (
        <svg width={size} height={size} viewBox="0 0 48 48">
          <circle cx="24" cy="24" r="16" fill="none" stroke="#FF55FF" strokeWidth="5.5" filter="drop-shadow(0 0 8px #FF55FF)"/>
          <path d="M12 12 L36 36 M36 12 L12 36" stroke="#FF55FF" strokeWidth="2.5"/>
        </svg>
      );
    case 'debuff_aura':
      return (
        <svg width={size} height={size} viewBox="0 0 48 48">
          <rect x="10" y="10" width="28" height="28" rx="4" fill="none" stroke="#80E5B0" strokeWidth="4.0" filter="drop-shadow(0 0 5px #80E5B0)"/>
          <circle cx="24" cy="24" r="8" fill="#9900FF" filter="drop-shadow(0 0 6px #9900FF)"/>
          <circle cx="16" cy="16" r="3" fill="#9900FF"/>
          <circle cx="32" cy="32" r="3" fill="#9900FF"/>
        </svg>
      );
    case 'elasticShoes':
      return (
        <svg width={size} height={size} viewBox="0 0 48 48">
          <path d="M14 34 L24 24 L34 34 M14 24 L24 14 L34 24" fill="none" stroke="#80E5B0" strokeWidth="4.5" filter="drop-shadow(0 0 5px #80E5B0)"/>
        </svg>
      );
    case 'highFuel':
      return (
        <svg width={size} height={size} viewBox="0 0 48 48">
          <circle cx="24" cy="24" r="10" fill="none" stroke="#FF8800" strokeWidth="3"/>
          <circle cx="24" cy="24" r="17" fill="none" stroke="#FF5500" strokeWidth="4.5" filter="drop-shadow(0 0 5px #FF5500)"/>
        </svg>
      );
    case 'exoskeleton':
      return (
        <svg width={size} height={size} viewBox="0 0 48 48">
          <polygon points="24,6 38,14 38,34 24,42 10,34 10,14" fill="none" stroke="#C099FF" strokeWidth="4.5" filter="drop-shadow(0 0 5px #C099FF)"/>
        </svg>
      );
    case 'ninjaScroll':
      return (
        <svg width={size} height={size} viewBox="0 0 48 48">
          <polygon points="24,6 40,24 24,42 8,24" fill="none" stroke="#FFCC00" strokeWidth="4.5" filter="drop-shadow(0 0 5px #FFCC00)"/>
          <circle cx="24" cy="24" r="5" fill="#FFCC00"/>
        </svg>
      );
    case 'lightning':
      return (
        <svg width={size} height={size} viewBox="0 0 48 48">
          <polygon points="26,4 12,24 22,24 20,44 34,24 24,24" fill="none" stroke="#FFD600" strokeWidth="4.5" strokeLinejoin="round" filter="drop-shadow(0 0 6px #FFD600)" />
        </svg>
      );
    case 'mine':
      return (
        <svg width={size} height={size} viewBox="0 0 48 48">
          <line x1="24" y1="6" x2="24" y2="42" stroke="#FF5500" strokeWidth="4" strokeLinecap="round" />
          <line x1="6" y1="24" x2="42" y2="24" stroke="#FF5500" strokeWidth="4" strokeLinecap="round" />
          <line x1="11.3" y1="11.3" x2="36.7" y2="36.7" stroke="#FF5500" strokeWidth="3" strokeLinecap="round" />
          <line x1="11.3" y1="36.7" x2="36.7" y2="11.3" stroke="#FF5500" strokeWidth="3" strokeLinecap="round" />
          <circle cx="24" cy="24" r="11" fill="#121620" stroke="#FF5500" strokeWidth="4.5" filter="drop-shadow(0 0 6px #FF5500)" />
          <circle cx="24" cy="24" r="4.5" fill="#FF5500" />
        </svg>
      );
    case 'shotgun':
      return (
        <svg width={size} height={size} viewBox="0 0 48 48">
          <circle cx="10" cy="38" r="4.5" fill="#00F0FF" />
          <line x1="10" y1="38" x2="40" y2="20" stroke="#00F0FF" strokeWidth="3.5" strokeLinecap="round" filter="drop-shadow(0 0 4px #00F0FF)" />
          <line x1="10" y1="38" x2="36" y2="10" stroke="#00F0FF" strokeWidth="3.5" strokeLinecap="round" filter="drop-shadow(0 0 4px #00F0FF)" />
          <line x1="10" y1="38" x2="42" y2="30" stroke="#00F0FF" strokeWidth="3.5" strokeLinecap="round" filter="drop-shadow(0 0 4px #00F0FF)" />
          <line x1="10" y1="38" x2="26" y2="8" stroke="#00F0FF" strokeWidth="2.5" strokeLinecap="round" opacity="0.7" />
          <line x1="10" y1="38" x2="42" y2="40" stroke="#00F0FF" strokeWidth="2.5" strokeLinecap="round" opacity="0.7" />
        </svg>
      );
    case 'energyCube':
      return (
        <svg width={size} height={size} viewBox="0 0 48 48">
          <polygon points="24,8 38,15 38,33 24,40 10,33 10,15" fill="none" stroke="#00FFCC" strokeWidth="4" strokeLinejoin="round" filter="drop-shadow(0 0 5px #00FFCC)" />
          <line x1="24" y1="8" x2="24" y2="40" stroke="#00FFCC" strokeWidth="2.5" />
          <line x1="10" y1="15" x2="24" y2="22.5" stroke="#00FFCC" strokeWidth="2.5" />
          <line x1="38" y1="15" x2="24" y2="22.5" stroke="#00FFCC" strokeWidth="2.5" />
          <circle cx="24" cy="22.5" r="4.5" fill="#00FFCC" filter="drop-shadow(0 0 4px #00FFCC)" />
        </svg>
      );
    case 'fitnessGuide':
      return (
        <svg width={size} height={size} viewBox="0 0 48 48">
          <polygon points="24,40 6,22 6,12 18,8 24,14 30,8 42,12 42,22" fill="none" stroke="#FF4455" strokeWidth="4.5" strokeLinejoin="round" filter="drop-shadow(0 0 6px #FF4455)" />
          <polygon points="24,30 14,20 14,15 20,13 24,17 28,13 34,15 34,20" fill="#FF4455" opacity="0.6" />
        </svg>
      );
    /* ── 드론 B (좌상단) ── */
    case 'drone_b':
      return (
        <svg width={size} height={size} viewBox="0 0 48 48">
          <rect x="14" y="14" width="20" height="20" rx="3" fill="none" stroke="#5BC8FF" strokeWidth="4.5" filter="drop-shadow(0 0 5px #5BC8FF)"/>
          <circle cx="24" cy="24" r="6.5" fill="#FF9C33"/>
          <line x1="6" y1="6" x2="16" y2="16" stroke="#5BC8FF" strokeWidth="2.5" strokeLinecap="round"/>
          <line x1="42" y1="6" x2="32" y2="16" stroke="#5BC8FF" strokeWidth="2.5" strokeLinecap="round"/>
        </svg>
      );
    /* ── 탄약 추진기 ── */
    case 'ammoBooster':
      return (
        <svg width={size} height={size} viewBox="0 0 48 48">
          {/* 탄창 몸체 */}
          <rect x="16" y="10" width="16" height="26" rx="3" fill="none" stroke="#FFB347" strokeWidth="4" filter="drop-shadow(0 0 6px #FFB347)"/>
          {/* 탄창 바닥 결합부 */}
          <rect x="20" y="36" width="8" height="5" rx="1.5" fill="#FFB347" opacity="0.8"/>
          {/* 탄알 3개 */}
          <rect x="20" y="14" width="8" height="4" rx="2" fill="#FFB347" opacity="0.9"/>
          <rect x="20" y="20" width="8" height="4" rx="2" fill="#FFB347" opacity="0.7"/>
          <rect x="20" y="26" width="8" height="4" rx="2" fill="#FFB347" opacity="0.5"/>
          {/* 속도선 */}
          <line x1="6" y1="18" x2="13" y2="18" stroke="#FFD600" strokeWidth="2.5" strokeLinecap="round" filter="drop-shadow(0 0 3px #FFD600)"/>
          <line x1="4" y1="24" x2="13" y2="24" stroke="#FFD600" strokeWidth="2.5" strokeLinecap="round" filter="drop-shadow(0 0 3px #FFD600)"/>
          <line x1="6" y1="30" x2="13" y2="30" stroke="#FFD600" strokeWidth="2.5" strokeLinecap="round" filter="drop-shadow(0 0 3px #FFD600)"/>
        </svg>
      );
    /* ── 자동 기본 공격 ── */
    case 'auto_basic':
      return (
        <svg width={size} height={size} viewBox="0 0 48 48">
          {/* 총열 */}
          <rect x="10" y="20" width="28" height="8" rx="3" fill="none" stroke="#7BE8F4" strokeWidth="3.5" filter="drop-shadow(0 0 5px #7BE8F4)"/>
          {/* 총구 */}
          <rect x="36" y="21" width="6" height="6" rx="1" fill="#7BE8F4"/>
          {/* 손잡이 */}
          <rect x="14" y="28" width="7" height="10" rx="2" fill="none" stroke="#7BE8F4" strokeWidth="3"/>
          {/* 발사 섬광 */}
          <line x1="42" y1="20" x2="46" y2="16" stroke="#FFD600" strokeWidth="2.5" strokeLinecap="round" filter="drop-shadow(0 0 4px #FFD600)"/>
          <line x1="42" y1="24" x2="46" y2="24" stroke="#FFD600" strokeWidth="2.5" strokeLinecap="round"/>
          <line x1="42" y1="28" x2="46" y2="32" stroke="#FFD600" strokeWidth="2.5" strokeLinecap="round"/>
        </svg>
      );
    /* ── 리볼버 ── */
    case 'auto_revolver':
      return (
        <svg width={size} height={size} viewBox="0 0 48 48">
          {/* 총열 */}
          <rect x="10" y="19" width="26" height="10" rx="4" fill="none" stroke="#C099FF" strokeWidth="4" filter="drop-shadow(0 0 6px #C099FF)"/>
          {/* 실린더 (원통) */}
          <circle cx="22" cy="24" r="7" fill="none" stroke="#C099FF" strokeWidth="3"/>
          <circle cx="22" cy="24" r="3" fill="#C099FF" opacity="0.6"/>
          {/* 총구 */}
          <rect x="34" y="21" width="7" height="6" rx="2" fill="#C099FF"/>
        </svg>
      );
    /* ── 자동 샷건 ── */
    case 'auto_shotgun':
      return (
        <svg width={size} height={size} viewBox="0 0 48 48">
          {/* 이중 총열 */}
          <rect x="10" y="16" width="26" height="6" rx="2.5" fill="none" stroke="#FF8A2A" strokeWidth="3.5" filter="drop-shadow(0 0 5px #FF8A2A)"/>
          <rect x="10" y="26" width="26" height="6" rx="2.5" fill="none" stroke="#FF8A2A" strokeWidth="3.5" filter="drop-shadow(0 0 5px #FF8A2A)"/>
          {/* 총구 섬광들 */}
          <line x1="36" y1="16" x2="42" y2="10" stroke="#FFD600" strokeWidth="2.5" strokeLinecap="round"/>
          <line x1="36" y1="19" x2="44" y2="19" stroke="#FFD600" strokeWidth="2.5" strokeLinecap="round"/>
          <line x1="36" y1="29" x2="44" y2="29" stroke="#FFD600" strokeWidth="2.5" strokeLinecap="round"/>
          <line x1="36" y1="32" x2="42" y2="38" stroke="#FFD600" strokeWidth="2.5" strokeLinecap="round"/>
        </svg>
      );
    /* ── 자동 드릴건 ── */
    case 'auto_drill':
      return (
        <svg width={size} height={size} viewBox="0 0 48 48">
          {/* 드릴 본체 */}
          <rect x="10" y="19" width="22" height="10" rx="3" fill="none" stroke="#00F0FF" strokeWidth="4" filter="drop-shadow(0 0 6px #00F0FF)"/>
          {/* 드릴 콘 */}
          <polygon points="32,19 32,29 44,24" fill="#00F0FF" filter="drop-shadow(0 0 4px #00F0FF)"/>
          {/* 나선 홈 */}
          <line x1="16" y1="19" x2="20" y2="29" stroke="#005588" strokeWidth="2" strokeLinecap="round"/>
          <line x1="22" y1="19" x2="26" y2="29" stroke="#005588" strokeWidth="2" strokeLinecap="round"/>
        </svg>
      );
    default: {
      return <div style={{ fontSize: size * 0.7 }}>❓</div>;
    }
  }
}

function SkillModalImpl({ cards }: { cards: unknown }) {
  const hud = useHud();
  const visible = hud['/modal/visible'];
  const cardList = resolveValue(cards, hud) as SkillCardData[];

  // 반응형 스케일 감지 추가 (모바일 짤림 방지)
  const [scale, setScale] = React.useState(1);
  React.useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      // 기준 너비를 440px로 넉넉하게 확장하여 큰 카드가 안 잘리도록 처리
      if (width < 440) {
        setScale(Math.max(0.65, width / 440));
      } else {
        setScale(1);
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  if (!visible) return null;

  /* ── EVO 전용 팝업 분기 ── */
  const evoCard = cardList.find(c => c.is_evolution);
  if (evoCard?.evo_recipe) {
    const recipe = evoCard.evo_recipe;
    return (
      <div style={{
        position: 'absolute', inset: 0,
        background: 'rgba(5, 0, 20, 0.88)',
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        zIndex: 40, fontFamily: '"Segoe UI", Roboto, Helvetica, Arial, sans-serif',
      }}>
        {/* 황금 글로우 배경 */}
        <div style={{
          position: 'absolute', top: '30%', left: '50%',
          transform: 'translate(-50%, -50%)',
          width: 300, height: 300, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(204,85,255,0.15) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />

        {/* 배너 */}
        <div style={{
          background: 'linear-gradient(90deg, #8A2BE2, #CC55FF, #8A2BE2)',
          padding: '10px 28px', marginBottom: 20,
          boxShadow: '0 0 20px rgba(204,85,255,0.5)',
          textAlign: 'center',
        }}>
          <div style={{ color: '#fff', fontWeight: 900, fontSize: 18, letterSpacing: 2 }}>🔥 돌파 조합!</div>
          <div style={{ color: '#E0B0FF', fontSize: 11, marginTop: 2 }}>Evolution 조건 충족 — 진화 스킬 등장</div>
        </div>

        {/* 레시피 행 */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20,
          background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(204,85,255,0.3)',
          padding: '10px 16px',
        }}>
          {[
            { icon: recipe.active_icon, name: recipe.active_name, lv: '★★★★★ Lv.5' },
          ].map(item => (
            <div key={item.name} style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 28 }}>{item.icon}</div>
              <div style={{ color: '#fff', fontSize: 10, fontWeight: 700 }}>{item.name}</div>
              <div style={{ color: '#FFD600', fontSize: 9 }}>{item.lv}</div>
            </div>
          ))}
          <div style={{ color: '#CC55FF', fontSize: 20, fontWeight: 900 }}>+</div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 28 }}>{recipe.passive_icon}</div>
            <div style={{ color: '#fff', fontSize: 10, fontWeight: 700 }}>{recipe.passive_name}</div>
            <div style={{ color: '#7BE8F4', fontSize: 9 }}>Lv.1+</div>
          </div>
          <div style={{ color: '#CC55FF', fontSize: 20, fontWeight: 900 }}>→</div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 28 }}>⚡</div>
            <div style={{ color: '#CC55FF', fontSize: 10, fontWeight: 900 }}>진화</div>
            <div style={{ color: '#FFD600', fontSize: 9 }}>EVO</div>
          </div>
        </div>

        {/* EVO 결과 카드 */}
        <div style={{
          background: 'linear-gradient(180deg, #1a0030 0%, #0d001a 100%)',
          border: '2px solid #CC55FF',
          boxShadow: '0 0 24px rgba(204,85,255,0.4)',
          padding: '16px 24px',
          textAlign: 'center',
          marginBottom: 20,
          minWidth: 220,
        }}>
          <div style={{
            background: 'linear-gradient(90deg, #8A2BE2, #CC55FF)',
            color: '#fff', fontSize: 10, fontWeight: 900,
            padding: '3px 12px', display: 'inline-block', marginBottom: 12,
            letterSpacing: 1,
          }}>⭐ EVOLUTION</div>
          <div style={{ fontSize: 52, marginBottom: 8 }}>{evoCard.icon}</div>
          <div style={{ color: '#CC55FF', fontWeight: 900, fontSize: 20, marginBottom: 8 }}>{evoCard.skill_name}</div>
          <div style={{ color: '#ccc', fontSize: 12, lineHeight: 1.5, marginBottom: 12 }}>{evoCard.description}</div>
        </div>

        {/* 진화시키기 버튼 */}
        <button
          onClick={() => window.dispatchEvent(new CustomEvent('prism:skillSelect', { detail: evoCard.skill_id }))}
          style={{
            background: 'linear-gradient(90deg, #8A2BE2, #CC55FF)',
            color: '#fff', border: 'none',
            padding: '14px 40px', fontSize: 16, fontWeight: 900,
            cursor: 'pointer', letterSpacing: 1,
            boxShadow: '0 0 20px rgba(204,85,255,0.5)',
            marginBottom: 8,
          }}>
          🔥 진화시키기
        </button>
        {/* 나머지 일반 카드도 선택 가능 */}
        {cardList.filter(c => !c.is_evolution).length > 0 && (
          <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
            {cardList.filter(c => !c.is_evolution).map(card => (
              <button
                key={card.skill_id}
                onClick={() => window.dispatchEvent(new CustomEvent('prism:skillSelect', { detail: card.skill_id }))}
                style={{
                  background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.2)',
                  color: '#aaa', padding: '6px 14px', fontSize: 11, cursor: 'pointer',
                }}>
                {card.icon} {card.skill_name}
              </button>
            ))}
          </div>
        )}
      </div>
    );
  }

  const activeSlots = (hud['/hud/activeSkillSlots'] as string[]) ?? [];
  const passiveSlots = (hud['/hud/passiveSkillSlots'] as string[]) ?? [];
  const maxSlots = 6;
  const pad = (arr: string[]) => {
    const out = [...arr];
    while (out.length < maxSlots) out.push('');
    return out.slice(0, maxSlots);
  };
  const paddedActive = pad(activeSlots);
  const paddedPassive = pad(passiveSlots);

  return (
    <div style={{
      position: 'absolute', inset: 0,
      background: 'rgba(5, 10, 20, 0.72)',
      backdropFilter: 'blur(8px)',
      WebkitBackdropFilter: 'blur(8px)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 40,
      fontFamily: '"Segoe UI", Roboto, Helvetica, Arial, sans-serif',
      overflow: 'hidden',
    }}>
      {/* 동적 스케일 래퍼 */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        transform: `scale(${scale})`,
        transformOrigin: 'center center',
        transition: 'transform 0.1s ease-out',
        width: '100%',
      }}>
        {/* ── 스킬 선택 배너: 기울기 유지, 끝까지 각짐 ── */}
        <div style={{
          background: '#FFD600',
          border: '3px solid #111',
          borderRadius: 0,
          padding: '6px 48px',
          color: '#111',
          fontSize: 15,
          fontWeight: '900',
          marginBottom: 12,
          boxShadow: '0 4px 0 #00000044, 0 0 15px rgba(255,214,0,0.5)',
          transform: 'skewX(-8deg)',
          letterSpacing: '2px',
          flexShrink: 0,
        }}>
          <span style={{ display: 'inline-block', transform: 'skewX(8deg)' }}>스킬 선택</span>
        </div>

        {/* ── ACTIVE / PASSIVE 슬롯바: 완전 각진 ── */}
        <div style={{
          display: 'flex', flexDirection: 'column', gap: 6,
          background: 'rgba(15, 25, 45, 0.85)',
          border: '1.5px solid rgba(0, 240, 255, 0.4)',
          borderRadius: 0,
          padding: '8px 12px',
          boxShadow: '0 0 15px rgba(0, 240, 255, 0.1)',
          marginBottom: 20, zIndex: 41, width: 'fit-content', minWidth: 268,
          flexShrink: 0,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{
              width: 54, color: '#00F0FF', fontSize: 9, fontWeight: 900,
              letterSpacing: '1px',
              borderLeft: '2px solid #00F0FF', paddingLeft: 4,
            }}>ACTIVE</span>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 26px)', gap: 4 }}>
              {paddedActive.map((icon, idx) => (
                <div key={`a-${icon}-${idx}`} style={{
                  width: 26, height: 26,
                  borderRadius: 0,
                  border: `1.5px solid ${icon ? '#00F0FF' : 'rgba(0,240,255,0.2)'}`,
                  background: icon ? 'rgba(0,240,255,0.12)' : 'rgba(5,10,20,0.6)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  {icon ? renderSkillIcon(icon, 18) : null}
                </div>
              ))}
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{
              width: 54, color: '#80E5B0', fontSize: 9, fontWeight: 900,
              letterSpacing: '1px',
              borderLeft: '2px solid #80E5B0', paddingLeft: 4,
            }}>PASSIVE</span>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 26px)', gap: 4 }}>
              {paddedPassive.map((icon, idx) => (
                <div key={`p-${icon}-${idx}`} style={{
                  width: 26, height: 26,
                  borderRadius: 0,
                  border: `1.5px solid ${icon ? '#80E5B0' : 'rgba(128,229,176,0.2)'}`,
                  background: icon ? 'rgba(128,229,176,0.12)' : 'rgba(5,10,20,0.6)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  {icon ? renderSkillIcon(icon, 18) : null}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── 가로 카드 컨테이너 ── */}
        <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start', flexShrink: 0 }}>
          {cardList.map((card, idx) => {
            const isEvo = card.is_evolution;
            const neonColor = isEvo ? '#CC55FF' : '#00F0FF';
            return (
              <div key={card.skill_id} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, flexShrink: 0 }}>
                <button
                  onClick={() => window.dispatchEvent(new CustomEvent('prism:skillSelect', { detail: card.skill_id }))}
                  style={{
                    position: 'relative',
                    background: 'rgba(15, 25, 45, 0.92)',
                    borderRadius: 0,
                    padding: '0 0 8px 0',
                    width: 136,
                    height: 234,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    border: `2px solid ${neonColor}`,
                    cursor: 'pointer',
                    boxShadow: `0 0 12px ${neonColor}33`,
                    color: '#fff',
                    overflow: 'hidden',
                    outline: 'none',
                  }}
                >
                  {/* EVO 뱃지 */}
                  {isEvo && (
                    <span style={{
                      position: 'absolute', top: 4, left: 4,
                      background: 'linear-gradient(90deg, #CC55FF, #8A2BE2)',
                      color: '#fff', fontSize: 9, borderRadius: 0,
                      padding: '2px 5px', fontWeight: 'bold',
                      border: '1px solid #E0B0FF', zIndex: 2,
                    }}>⚡ EVO</span>
                  )}
                  {/* New! 뱃지: 기울기 스타일 적용 */}
                  {!isEvo && card.is_new && (
                    <span style={{
                      position: 'absolute', top: 0, right: 0,
                      background: '#FF4500', color: '#fff', fontSize: 9,
                      borderRadius: 0,
                      padding: '3px 8px', fontWeight: 'bold',
                      boxShadow: '0 0 5px #FF450088',
                      transform: 'skewX(-8deg)',
                      zIndex: 2,
                    }}>New!</span>
                  )}

                  {/* 카드 헤더: 기울기 유지 */}
                  <div style={{
                    width: '100%',
                    background: isEvo
                      ? 'linear-gradient(90deg, #8A2BE2, #CC55FF)'
                      : '#FFD600',
                    color: isEvo ? '#fff' : '#111',
                    textAlign: 'center',
                    fontSize: 13,
                    fontWeight: '900',
                    padding: '7px 4px',
                    borderBottom: `2px solid ${neonColor}`,
                    marginTop: isEvo ? 18 : 0,
                    letterSpacing: '0.5px',
                  }}>
                    {card.skill_name}
                  </div>

                  {/* 중앙 아이콘 */}
                  <div style={{
                    flex: 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    filter: `drop-shadow(0 0 6px ${neonColor}44)`,
                  }}>
                    {renderSkillIcon(card.skill_id, 46)}
                  </div>

                  {/* 하단 설명 */}
                  <div style={{
                    fontSize: 11, color: '#d1d9e6',
                    padding: '0 8px', textAlign: 'center',
                    height: 42,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    lineHeight: '15px', marginBottom: 4,
                  }}>
                    {card.description}
                  </div>

                  {/* 레벨 별점 */}
                  <div style={{
                    fontSize: 12, color: '#FFD600',
                    letterSpacing: '0.5px',
                    textShadow: '0 0 4px rgba(255,214,0,0.4)',
                  }}>
                    {'★'.repeat(card.current_level)}{'☆'.repeat(Math.max(0, card.max_level - card.current_level))}
                  </div>
                </button>

                {/* 하단 단축 번호: 직사각형으로 변경 */}
                <div style={{
                  width: 28, height: 20,
                  borderRadius: 0,
                  background: 'rgba(15,25,45,0.85)',
                  border: `1.5px solid ${neonColor}`,
                  color: '#fff',
                  fontSize: 11,
                  fontWeight: 'bold',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontFamily: 'monospace',
                  marginTop: 2,
                  transform: 'skewX(-4deg)',
                }}>
                  {idx + 1}
                </div>
              </div>
            );
          })}
        </div>

        {/* 가이드 텍스트 */}
        <div style={{
          marginTop: 20,
          color: '#ffffff88',
          fontSize: 11,
          fontWeight: 'bold',
          letterSpacing: '2px',
          flexShrink: 0,
        }}>
          배울 스킬을 선택하세요
        </div>
      </div>
    </div>
  );
}

function ResultScreenImpl(_props: Record<string, unknown>) {
  const hud = useHud();
  const visible = hud['/result/visible'];

  const [showRewards] = React.useState(true);
  if (!visible) return null;

  const isVictory    = Boolean(hud['/result/isVictory']);
  const survivalTime = String(hud['/result/survivalTime'] ?? '00:00');
  const kill         = Number(hud['/result/killCount']    ?? 0);
  const level        = Number(hud['/result/finalLevel']   ?? 1);
  const gold         = Number(hud['/result/goldEarned']   ?? 0);
  const exp          = Number(hud['/result/totalXpEarned'] ?? 0);
  const stage        = Number(hud['/lobby/selectedStage'] ?? 1);

  const fmt = (n: number) => n.toLocaleString();

  return (
    <div style={{
      position: 'absolute', inset: 0,
      background: '#F4EFE6',
      display: 'flex', flexDirection: 'column',
      zIndex: 46,
      fontFamily: '"Segoe UI", Roboto, sans-serif',
    }}>
      {/* 상단 배너: 클리어! / 실패 */}
      <div style={{
        background: isVictory ? '#FFB347' : '#FF4455',
        borderBottom: '3px solid #000000',
        padding: '18px 20px',
        textAlign: 'center',
        position: 'relative',
      }}>
        {/* 배너 리본 꼬리 */}
        <div style={{
          position: 'absolute', left: -8, top: '50%', transform: 'translateY(-50%)',
          width: 0, height: 0,
          borderTop: '24px solid transparent',
          borderBottom: '24px solid transparent',
          borderRight: `16px solid ${isVictory ? '#FF8A2A' : '#CC0022'}`,
        }} />
        <div style={{
          position: 'absolute', right: -8, top: '50%', transform: 'translateY(-50%)',
          width: 0, height: 0,
          borderTop: '24px solid transparent',
          borderBottom: '24px solid transparent',
          borderLeft: `16px solid ${isVictory ? '#FF8A2A' : '#CC0022'}`,
        }} />
        <span style={{ color: '#000000', fontSize: 28, fontWeight: 900, letterSpacing: 2 }}>
          {isVictory ? '클리어!' : '실패'}
        </span>
      </div>

      {/* 메인 스탯 박스 */}
      <div style={{
        margin: '14px 12px 10px',
        background: '#ffffff',
        border: '3px solid #000000',
        borderRadius: 10,
        padding: '16px 14px',
        textAlign: 'center',
        boxShadow: '4px 4px 0 #000000',
        flexShrink: 0,
      }}>
        {/* 타이머 크게 */}
        <div style={{
          fontSize: 52, fontWeight: 900, color: '#000000', lineHeight: 1,
          letterSpacing: 3, fontVariantNumeric: 'tabular-nums',
        }}>
          {survivalTime}
        </div>

        <div style={{ marginTop: 10, display: 'flex', gap: 8, justifyContent: 'center', flexWrap: 'wrap' as const }}>
          {/* 스테이지 */}
          <div style={{ background: '#EDE5D8', border: '2px solid #000000', borderRadius: 6, padding: '4px 14px', fontSize: 13, fontWeight: 900, color: '#000000', boxShadow: '2px 2px 0 #000000' }}>
            S{stage} 스테이지
          </div>
          {/* 레벨 */}
          <div style={{ background: '#EDE5D8', border: '2px solid #000000', borderRadius: 6, padding: '4px 14px', fontSize: 13, fontWeight: 900, color: '#000000', boxShadow: '2px 2px 0 #000000' }}>
            LV.{level}
          </div>
        </div>

        {/* 킬수 */}
        <div style={{
          marginTop: 12, background: '#F4EFE6', border: '2.5px solid #000000', borderRadius: 8,
          padding: '10px 14px', display: 'flex', alignItems: 'center', gap: 10,
          justifyContent: 'center', boxShadow: '2px 2px 0 #000000',
        }}>
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
            <ellipse cx="12" cy="10" rx="7" ry="6" fill="#000000" />
            <rect x="8" y="15" width="3" height="3" rx="1" fill="#000000" />
            <rect x="13" y="15" width="3" height="3" rx="1" fill="#000000" />
            <rect x="7" y="17" width="10" height="2" rx="1" fill="#000000" />
            <ellipse cx="9.5" cy="9.5" rx="2" ry="2.2" fill="#F4EFE6" />
            <ellipse cx="14.5" cy="9.5" rx="2" ry="2.2" fill="#F4EFE6" />
          </svg>
          <span style={{ fontSize: 26, fontWeight: 900, color: '#000000' }}>{fmt(kill)}</span>
        </div>
      </div>

      {/* 보상 박스 */}
      <div style={{
        margin: '0 12px', flex: 1, minHeight: 90,
        background: '#ffffff', border: '2.5px solid #000000', borderRadius: 8,
        padding: '12px', overflowY: 'auto' as const,
        boxShadow: '3px 3px 0 #000000',
      }}>
        <div style={{ fontSize: 11, fontWeight: 900, color: '#555555', marginBottom: 8, borderBottom: '2px solid #000000', paddingBottom: 6 }}>
          보상
        </div>
        {showRewards && (gold > 0 || exp > 0) ? (
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' as const }}>
            {gold > 0 && (
              <div style={{
                width: 64, height: 64,
                background: '#FFB347',
                border: '2.5px solid #000000',
                borderRadius: 8,
                display: 'flex', flexDirection: 'column' as const,
                alignItems: 'center', justifyContent: 'center',
                gap: 3, boxShadow: '2px 2px 0 #000000',
              }}>
                <svg width="26" height="26" viewBox="0 0 24 24" fill="#FFD700">
                  <circle cx="12" cy="12" r="9" stroke="#000000" strokeWidth="2" />
                  <circle cx="12" cy="12" r="6" fill="#FFF176" stroke="#000000" strokeWidth="1.5" />
                </svg>
                <div style={{ color: '#000000', fontSize: 9, fontWeight: 900 }}>x{fmt(gold)}</div>
              </div>
            )}
            {exp > 0 && (
              <div style={{
                width: 64, height: 64,
                background: '#3DDC84',
                border: '2.5px solid #000000',
                borderRadius: 8,
                display: 'flex', flexDirection: 'column' as const,
                alignItems: 'center', justifyContent: 'center',
                gap: 3, boxShadow: '2px 2px 0 #000000',
              }}>
                <div style={{ color: '#000000', fontSize: 15, fontWeight: 900, lineHeight: 1 }}>EXP</div>
                <div style={{ color: '#000000', fontSize: 9, fontWeight: 900 }}>x{fmt(exp)}</div>
              </div>
            )}
          </div>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 70, color: '#888888', fontSize: 13, fontWeight: 700 }}>—</div>
        )}
      </div>

      {/* 하단 버튼 바 */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 8,
        padding: '12px',
        background: '#EDE5D8', borderTop: '3px solid #000000',
        flexShrink: 0,
      }}>
        <button
          onClick={() => window.dispatchEvent(new CustomEvent('lobby:toast', { detail: '통계 준비 중입니다' }))}
          style={{
            width: 56, height: 56, background: '#ffffff', border: '2.5px solid #000000',
            borderRadius: 8, cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            outline: 'none', flexShrink: 0, boxShadow: '2px 2px 0 #000000',
          }}
        >
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
            <rect x="3"  y="13" width="4.5" height="8"  rx="1" fill="#000000" />
            <rect x="10" y="8"  width="4.5" height="13" rx="1" fill="#000000" />
            <rect x="17" y="3"  width="4.5" height="18" rx="1" fill="#000000" />
          </svg>
        </button>
        <button
          onClick={() => window.dispatchEvent(new CustomEvent('prism:action', { detail: 'EXIT' }))}
          style={{
            flex: 1, height: 56,
            background: '#FFB347',
            border: '2.5px solid #000000', borderRadius: 8,
            color: '#000000',
            fontFamily: '"Segoe UI", Roboto, sans-serif',
            fontSize: 22, fontWeight: 900,
            cursor: 'pointer', letterSpacing: 1,
            outline: 'none', boxShadow: '3px 3px 0 #000000',
          }}
        >
          확인
        </button>
      </div>
    </div>
  );
}

/* ── 일시정지 화면 (탕탕 원작: 무기/지원품 그리드 + 통계/홈/계속하기/사운드) ── */
function PauseScreenImpl() {
  const hud = useHud();
  if (!hud['/pause/visible']) return null;

  const activeSlots  = (hud['/hud/activeSkillSlots']  as string[]) ?? [];
  const passiveSlots = (hud['/hud/passiveSkillSlots'] as string[]) ?? [];
  const resume = () => window.dispatchEvent(new CustomEvent('prism:action', { detail: 'TOGGLE_PAUSE' }));
  const giveUp = () => window.dispatchEvent(new CustomEvent('prism:action', { detail: 'GIVE_UP' }));

  /* 6슬롯 패딩 */
  const pad = (arr: string[]) => {
    const out = arr.filter(Boolean).slice(0, 6);
    while (out.length < 6) out.push('');
    return out;
  };
  const weapons  = pad(activeSlots);
  const supports = pad(passiveSlots);

  /* ── 스킬 그리드 (원작: 밝은 회색 테마) ── */
  const SkillGrid = ({ title, slots }: { title: string; slots: string[] }) => (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
      {/* 노란 헤더 */}
      <div style={{
        background: '#FFB347',
        color: '#000000',
        fontFamily: '"Segoe UI", Roboto, sans-serif',
        fontWeight: 900,
        fontSize: 13,
        textAlign: 'center',
        padding: '7px 4px',
        borderRadius: '6px 6px 0 0',
        border: '2px solid #000000',
        borderBottom: 'none',
      }}>{title}</div>

      {/* 회색 그리드 */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: 6,
        padding: 8,
        background: '#F4EFE6',
        border: '2px solid #000000',
        borderRadius: '0 0 6px 6px',
        flex: 1,
      }}>
        {slots.map((id, i) => (
          <div key={i} style={{
            aspectRatio: '1',
            borderRadius: 6,
            background: id ? '#ffffff' : 'rgba(0, 0, 0, 0.04)',
            border: id ? '2px solid #000000' : '2px dashed #000000',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexDirection: 'column',
            position: 'relative',
            boxShadow: id ? '1.5px 1.5px 0 #000000' : 'none',
          }}>
            {id ? (
              <>
                {renderSkillIcon(id, 36)}
                {/* 별점 (원작 스타일: 1스타 표시) */}
                <div style={{
                  position: 'absolute',
                  bottom: 3,
                  left: 0, right: 0,
                  display: 'flex',
                  justifyContent: 'center',
                  gap: 1,
                }}>
                  {[0,1,2,3,4].map(si => (
                    <span key={si} style={{ fontSize: 7, color: si === 0 ? '#FFD600' : '#cccccc' }}>★</span>
                  ))}
                </div>
              </>
            ) : null}
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div style={{
      position: 'absolute', inset: 0,
      background: 'rgba(0, 0, 0, 0.4)',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'flex-end',
      zIndex: 40,
      fontFamily: '"Segoe UI", Roboto, sans-serif',
    }}>
      {/* 중앙 스킬 패널 (게임 화면 중간에 떠 있음) */}
      <div style={{
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '0 12px',
      }}>
        <div style={{ display: 'flex', gap: 10, width: '100%', maxWidth: 380 }}>
          <SkillGrid title="무기 스킬" slots={weapons}  />
          <SkillGrid title="지원품"   slots={supports} />
        </div>
      </div>

      {/* 하단 버튼 바 */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        padding: '12px 12px',
        background: '#F4EFE6',
        borderTop: '3px solid #000000',
      }}>
        {/* 통계 버튼 */}
        <button
          onClick={() => window.dispatchEvent(new CustomEvent('lobby:toast', { detail: '통계 준비 중입니다' }))}
          style={{
            width: 56, height: 56,
            background: '#ffffff',
            border: '2.5px solid #000000',
            borderRadius: 8,
            cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            outline: 'none',
            flexShrink: 0,
            boxShadow: '2px 2px 0 #000000',
          }}
        >
          <svg width="30" height="30" viewBox="0 0 24 24" fill="none">
            <rect x="3"  y="13" width="4.5" height="8" rx="1" fill="#000000" stroke="#000000" strokeWidth="1" />
            <rect x="10" y="8"  width="4.5" height="13" rx="1" fill="#000000" stroke="#000000" strokeWidth="1" />
            <rect x="17" y="3"  width="4.5" height="18" rx="1" fill="#000000" stroke="#000000" strokeWidth="1" />
          </svg>
        </button>

        {/* 계속하기 버튼 */}
        <button
          onClick={resume}
          style={{
            flex: 1,
            height: 56,
            background: '#FFB347',
            border: '2.5px solid #000000',
            borderRadius: 8,
            color: '#000000',
            fontFamily: '"Segoe UI", Roboto, sans-serif',
            fontSize: 20,
            fontWeight: 900,
            cursor: 'pointer',
            letterSpacing: 1,
            outline: 'none',
            boxShadow: '3px 3px 0 #000000',
          }}
        >
          계속하기
        </button>

        {/* 집(포기) 버튼 */}
        <button
          onClick={giveUp}
          style={{
            width: 56, height: 56,
            background: '#ffffff',
            border: '2.5px solid #000000',
            borderRadius: 8,
            cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            outline: 'none',
            flexShrink: 0,
            boxShadow: '2px 2px 0 #000000',
          }}
        >
          <svg width="30" height="30" viewBox="0 0 24 24" fill="none">
            <path d="M3 10.5L12 3L21 10.5V20C21 20.55 20.55 21 20 21H15V15H9V21H4C3.45 21 3 20.55 3 20V10.5Z" fill="#000000" stroke="#000000" strokeWidth="1"/>
          </svg>
        </button>

        {/* 사운드 버튼 */}
        <button
          onClick={() => window.dispatchEvent(new CustomEvent('lobby:toast', { detail: '사운드 설정 준비 중' }))}
          style={{
            width: 56, height: 56,
            background: '#ffffff',
            border: '2.5px solid #000000',
            borderRadius: 8,
            cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            outline: 'none',
            flexShrink: 0,
            boxShadow: '2px 2px 0 #000000',
          }}
        >
          <svg width="30" height="30" viewBox="0 0 24 24" fill="none">
            <path d="M3 9V15H7L12 20V4L7 9H3Z" fill="#000000"/>
            <path d="M16.5 12C16.5 10.23 15.48 8.71 14 7.97V16.02C15.48 15.29 16.5 13.77 16.5 12Z" fill="#000000"/>
            <path d="M14 3.23V5.29C16.89 6.15 19 8.83 19 12C19 15.17 16.89 17.85 14 18.71V20.77C18.01 19.86 21 16.28 21 12C21 7.72 18.01 4.14 14 3.23Z" fill="#000000"/>
          </svg>
        </button>
      </div>
    </div>
  );
}


/* ── 모험 레벨업 팝업 ── */
function AdventureUpImpl({ level: lvProp, rewardGem: gemProp, rewardGold: goldProp }: {
  level: unknown; rewardGem: unknown; rewardGold: unknown;
}) {
  const hud = useHud();
  if (!hud['/advUp/visible']) return null;
  const lv = Number(resolveValue(lvProp, hud) ?? 1);
  const gem = Number(resolveValue(gemProp, hud) ?? 0);
  const gold = Number(resolveValue(goldProp, hud) ?? 0);

  const close = () => window.dispatchEvent(new CustomEvent('advUp:close'));

  return (
    <div style={{
      position: 'absolute', inset: 0, zIndex: 52,
      background: 'rgba(0,0,0,0.5)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontFamily: '"Segoe UI", Roboto, Helvetica, Arial, sans-serif',
    }}>
      <div style={{
        width: '84%', maxWidth: 320, textAlign: 'center',
        background: '#F4EFE6',
        border: '3px solid #000000', borderRadius: 12,
        padding: '24px 20px', boxShadow: '4px 4px 0 #000000',
        color: '#000000',
      }}>
        <div style={{ display: 'flex', justifyContent: 'center', margin: '8px 0' }}>{getCommonSketchIcon('medal', 48)}</div>
        <div style={{
          display: 'inline-block', background: '#FFB347', color: '#000000',
          fontSize: 11, fontWeight: 900, padding: '4px 12px', border: '2px solid #000000',
          borderRadius: 12, margin: '8px 0', boxShadow: '1.5px 1.5px 0 #000000',
        }}>모험 레벨업!</div>
        <div style={{ fontSize: 28, fontWeight: 900, color: '#000000' }}>LV.{lv} 달성!</div>
        <div style={{ fontSize: 10, color: '#555555', letterSpacing: 2, marginBottom: 18, fontWeight: 700 }}>ADVENTURE LEVEL {lv}</div>

        <div style={{ display: 'flex', justifyContent: 'center', gap: 16, marginBottom: 20 }}>
          <div style={{ textAlign: 'center', background: '#ffffff', border: '2px solid #000000', borderRadius: 8, padding: '8px 12px', boxShadow: '2px 2px 0 #000000', flex: 1 }}>
            <div style={{ display: 'flex', justifyContent: 'center', margin: '4px 0' }}>{getCommonSketchIcon('gem', 24)}</div>
            <div style={{ color: '#000000', fontWeight: 900, fontSize: 16 }}>+{gem}</div>
            <div style={{ color: '#555555', fontSize: 9, fontWeight: 700 }}>보석</div>
          </div>
          <div style={{ textAlign: 'center', background: '#ffffff', border: '2px solid #000000', borderRadius: 8, padding: '8px 12px', boxShadow: '2px 2px 0 #000000', flex: 1 }}>
            <div style={{ display: 'flex', justifyContent: 'center', margin: '4px 0' }}>{getCommonSketchIcon('moneyBag', 24)}</div>
            <div style={{ color: '#000000', fontWeight: 900, fontSize: 16 }}>+{gold}</div>
            <div style={{ color: '#555555', fontSize: 9, fontWeight: 700 }}>골드</div>
          </div>
        </div>

        <button onClick={close} style={{
          width: '100%', padding: '12px', background: '#FFB347', color: '#000000',
          border: '2.5px solid #000000', borderRadius: 8, fontWeight: 900, fontSize: 15, cursor: 'pointer',
          boxShadow: '3px 3px 0 #000000',
        }}>확인</button>
      </div>
    </div>
  );
}

/* ── 도전 화면 ── */
/* ── 도전 화면 전용 네온 SVG 아이콘 렌더러 ── */
function renderChallengeSkullIcon(size = 24, color = '#ffffff', crossBones = false) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24">
      {crossBones && (
        <>
          <line x1="3" y1="21" x2="21" y2="3" stroke="#000000" strokeWidth="2.2" strokeLinecap="round" />
          <line x1="3" y1="3" x2="21" y2="21" stroke="#000000" strokeWidth="2.2" strokeLinecap="round" />
        </>
      )}
      {/* 해골 돔 */}
      <path d="M 6 12 C 6 5.5, 18 5.5, 18 12 L 17 17 C 17 18.2, 15 19, 15 19 H 9 C 9 19, 7 18.2, 7 17 Z" fill={color} stroke="#000000" strokeWidth="2.5" strokeLinejoin="round" />
      {/* 눈구멍 */}
      <circle cx="9.5" cy="11.5" r="2.2" fill="#000000" stroke="#000000" strokeWidth="1.8" />
      <circle cx="14.5" cy="11.5" r="2.2" fill="#000000" stroke="#000000" strokeWidth="1.8" />
      {/* 콧구멍 */}
      <polygon points="12,13 10.8,14.8 13.2,14.8" fill="#000000" />
      {/* 이빨 */}
      <line x1="9.5" y1="17.2" x2="9.5" y2="19" stroke="#000000" strokeWidth="2" />
      <line x1="12" y1="17.2" x2="12" y2="19" stroke="#000000" strokeWidth="2" />
      <line x1="14.5" y1="17.2" x2="14.5" y2="19" stroke="#000000" strokeWidth="2" />
    </svg>
  );
}

function renderChallengeLockIcon(size = 24, color = '#777') {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24">
      <path d="M 6 10 L 6 7 C 6 3.5, 18 3.5, 18 7 L 18 10" fill="none" stroke="#000000" strokeWidth="2.5" strokeLinecap="round" />
      <rect x="4" y="10" width="16" height="11" rx="2" fill={color} stroke="#000000" strokeWidth="2.5" />
      <circle cx="12" cy="14.5" r="1.8" fill="#000000" />
      <line x1="12" y1="16" x2="12" y2="18.5" stroke="#000000" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}


const CHALLENGE_MODE_INTRO_TIPS = [
  '카드 = 스테이지 미션 (노말 → 하드 → 헬 순서로 해금).',
  '맵·보스는 로비 전투와 같고, 적만 도전 배율만큼 강해집니다.',
  '상세 창에서 번개 배수를 고른 뒤 「도전 시작」으로 입장합니다.',
  '보스 클리어 시 미션 완료 · DNA·골드는 최초 1회.',
];

function challengePlayTips(stage: number): string[] {
  return [
    `${stage}스테이지 맵으로 입장 — 로비 「전투」와 동일한 플레이`,
    '아래 배수 버튼으로 번개 소모량 조절 (타이쿤·이벤트 보상 배수)',
    '보스 처치 = 이 미션 클리어',
  ];
}

function ChallengeHelpSectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      fontWeight: 900, fontSize: 15, textAlign: 'center', marginBottom: 10,
      background: '#e8dfd1', color: '#000000', border: '2px solid #000000', borderRadius: 6, padding: '6px 8px',
    }}>
      {children}
    </div>
  );
}

function ChallengeHelpTipsBox({ tips }: { tips: string[] }) {
  return (
    <div style={{
      marginTop: 4, fontSize: 11, lineHeight: 1.45, color: '#000000',
      background: '#FFFFFF', border: '2px solid #000000', borderRadius: 8, padding: '8px 10px',
    }}>
      {tips.map((t, i) => (
        <div key={i} style={{ marginBottom: i < tips.length - 1 ? 4 : 0, fontWeight: 700 }}>· {t}</div>
      ))}
    </div>
  );
}

// 2D 스케치 공통 아이콘 렌더러
function getCommonSketchIcon(type: string, size = 24): React.ReactNode {
  const strokeColor = '#000000';
  const normalized = type.trim();
  
  if (normalized === 'medal') {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={{ display: 'block', margin: '0 auto' }}>
        <path d="M 8 2 L 12 10 L 16 2 Z" fill="#FF4455" stroke={strokeColor} strokeWidth="2" strokeLinejoin="round" />
        <path d="M 10 2 L 12 10 L 14 2 Z" fill="#ffffff" stroke={strokeColor} strokeWidth="1" />
        <circle cx="12" cy="15" r="6" fill="#FFD700" stroke={strokeColor} strokeWidth="2.5" />
        <circle cx="12" cy="15" r="3.5" fill="#FFF176" stroke={strokeColor} strokeWidth="1.5" />
      </svg>
    );
  }
  if (normalized === 'moneyBag') {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={{ display: 'block', margin: '0 auto' }}>
        <path d="M 6 12 C 6 8, 8 7, 12 7 C 16 7, 18 8, 18 12 C 18 17, 16 20, 12 20 C 8 20, 6 17, 6 12 Z" fill="#A5D6A7" stroke={strokeColor} strokeWidth="2.5" strokeLinejoin="round" />
        <path d="M 9 7 C 9 6, 10 4, 12 4 C 14 4, 15 6, 15 7 Z" fill="#81C784" stroke={strokeColor} strokeWidth="2" />
        <line x1="8.5" y1="8" x2="15.5" y2="8" stroke={strokeColor} strokeWidth="2.5" />
        <path d="M 12 10 Q 10.5 11 12 12 Q 13.5 13 12 14 M 12 9 L 12 15" fill="none" stroke={strokeColor} strokeWidth="2" strokeLinecap="round" />
      </svg>
    );
  }
  if (normalized === 'gem' || normalized === 'gems' || normalized === 'dna' || normalized === '💎') {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={{ display: 'inline-block', verticalAlign: 'middle' }}>
        <polygon points="12,2 18,8 18,16 12,22 6,16 6,8" fill="#7BE8F4" stroke={strokeColor} strokeWidth="2.2" strokeLinejoin="round"/>
        <polygon points="12,5 16,9 16,15 12,19 8,15 8,9" fill="#ffffff" stroke={strokeColor} strokeWidth="1.2" strokeLinejoin="round"/>
      </svg>
    );
  }
  if (normalized === 'gold' || normalized === '🪙') {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={{ display: 'inline-block', verticalAlign: 'middle' }}>
        <circle cx="12" cy="12" r="9" fill="#FFD700" stroke={strokeColor} strokeWidth="2.2" />
        <circle cx="12" cy="12" r="6" fill="#FFF176" stroke={strokeColor} strokeWidth="1.5" />
      </svg>
    );
  }
  if (normalized === 'lock' || normalized === '🔒') {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={{ display: 'inline-block', verticalAlign: 'middle' }}>
        <rect x="5" y="11" width="14" height="10" rx="2" fill="#FFE082" stroke={strokeColor} strokeWidth="2.5" />
        <path d="M8 11 V7 C8 4.8 9.8 3 12 3 C14.2 3 16 4.8 16 7 V11" fill="none" stroke={strokeColor} strokeWidth="2.5" strokeLinecap="round" />
        <circle cx="12" cy="15" r="1.5" fill="#000000" />
        <line x1="12" y1="16.5" x2="12" y2="18.5" stroke="#000000" strokeWidth="2" strokeLinecap="round" />
      </svg>
    );
  }
  if (normalized === 'hp' || normalized === '❤️') {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={{ display: 'inline-block', verticalAlign: 'middle' }}>
        <path d="M12 21 C 12 21, 3 13, 3 8 C 3 4.5, 6 2.5, 9.5 3.5 C 11 4, 12 5.5, 12 5.5 C 12 5.5, 13 4, 14.5 3.5 C 18 2.5, 21 4.5, 21 8 C 21 13, 12 21, 12 21 Z" fill="#FF4455" stroke={strokeColor} strokeWidth="2.5" strokeLinejoin="round" />
        <path d="M14.5 5 C 16.5 4, 19 5.5, 19 8 C 19 11.5, 12 18.5, 12 18.5" fill="none" stroke="#FFFFFF" strokeWidth="1.5" strokeLinecap="round" opacity="0.6" />
      </svg>
    );
  }
  if (normalized === 'attack' || normalized === '⚔️') {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={{ display: 'inline-block', verticalAlign: 'middle' }}>
        <path d="M 18 3 L 21 6 L 10 17 L 7 17 L 7 14 Z" fill="#ECEFF1" stroke={strokeColor} strokeWidth="2.2" strokeLinejoin="round" />
        <path d="M 6 18 L 3 21 C 2.5 21.5, 2.5 22.5, 3 23 C 3.5 23.5, 4.5 23.5, 5 23 L 8 20 Z" fill="#8D6E63" stroke={strokeColor} strokeWidth="2" />
        <line x1="5" y1="19" x2="8" y2="16" stroke={strokeColor} strokeWidth="2.2" />
        <path d="M 6 3 L 3 6 L 14 17 L 17 17 L 17 14 Z" fill="#ECEFF1" stroke={strokeColor} strokeWidth="2.2" strokeLinejoin="round" />
        <path d="M 18 18 L 21 21 C 21.5 21.5, 21.5 22.5, 21 23 C 20.5 23.5, 19.5 23.5, 19 23 L 16 20 Z" fill="#8D6E63" stroke={strokeColor} strokeWidth="2" />
        <line x1="19" y1="19" x2="16" y2="16" stroke={strokeColor} strokeWidth="2.2" />
      </svg>
    );
  }
  if (normalized === 'dna' || normalized === '🧬') {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={{ display: 'inline-block', verticalAlign: 'middle' }}>
        <path d="M 4.5 6 C 6 8.5, 9.5 12.5, 12 12.5 C 14.5 12.5, 18 8.5, 19.5 6" stroke={strokeColor} strokeWidth="2.5" strokeLinecap="round" />
        <path d="M 4.5 18 C 6 15.5, 9.5 11.5, 12 11.5 C 14.5 11.5, 18 15.5, 19.5 18" stroke={strokeColor} strokeWidth="2.5" strokeLinecap="round" />
        <line x1="8" y1="9" x2="8" y2="15" stroke="#B388FF" strokeWidth="2.5" strokeLinecap="round" />
        <line x1="12" y1="10" x2="12" y2="14" stroke="#B388FF" strokeWidth="2.5" strokeLinecap="round" />
        <line x1="16" y1="9" x2="16" y2="15" stroke="#B388FF" strokeWidth="2.5" strokeLinecap="round" />
      </svg>
    );
  }
  if (normalized === 'luckyTrain' || normalized === 'slotMachine' || normalized === '🎰') {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={{ display: 'inline-block', verticalAlign: 'middle' }}>
        {/* 슬롯머신 본체 */}
        <rect x="4" y="6" width="16" height="14" rx="2" fill="#CFD8DC" stroke={strokeColor} strokeWidth="2.5" />
        <rect x="7" y="9" width="10" height="5" fill="#ffffff" stroke={strokeColor} strokeWidth="2" />
        {/* 슬롯 선들 */}
        <line x1="10" y1="9" x2="10" y2="14" stroke={strokeColor} strokeWidth="1.5" />
        <line x1="14" y1="9" x2="14" y2="14" stroke={strokeColor} strokeWidth="1.5" />
        {/* 레버 */}
        <path d="M 20 16 L 22 16 L 22 10" fill="none" stroke={strokeColor} strokeWidth="2" strokeLinecap="round" />
        <circle cx="22" cy="8" r="2" fill="#FF4455" stroke={strokeColor} strokeWidth="1.5" />
        {/* 장식 */}
        <rect x="8" y="16" width="8" height="2" fill="#FFB347" />
      </svg>
    );
  }
  return null;
}

function ChallengeRuleCard({
  icon,
  title,
  desc,
  rightLabel,
  rightSub,
  accent = '#FFB347',
}: {
  icon: React.ReactNode;
  title: string;
  desc: string;
  rightLabel: string;
  rightSub?: string;
  accent?: string;
}) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 8,
      background: '#FFFFFF', borderRadius: 8, border: '2px solid #000000',
      padding: '10px 8px', marginBottom: 10, boxShadow: '2px 2px 0 #000000', color: '#000000',
    }}>
      <div style={{
        width: 52, height: 52, borderRadius: 6, background: '#F4EFE6',
        border: '2px solid #000000', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
      }}>
        {icon}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontWeight: 900, fontSize: 14, marginBottom: 2 }}>{title}</div>
        <div style={{ fontSize: 12, lineHeight: 1.3, fontWeight: 700, opacity: 0.9 }}>{desc}</div>
      </div>
      <div style={{ fontSize: 20, fontWeight: 900, flexShrink: 0 }}>→</div>
      <div style={{
        width: 56, flexShrink: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2,
        background: accent, borderRadius: 6, padding: '6px 4px', border: '1.5px solid #000000',
      }}>
        <span style={{ fontWeight: 900, fontSize: 13 }}>{rightLabel}</span>
        {rightSub ? <span style={{ fontSize: 9, fontWeight: 700, opacity: 0.8 }}>{rightSub}</span> : null}
      </div>
    </div>
  );
}

/** 도전 상세 모달 전용 — 로비와 동일 재화·배수·입장 (로비 UI는 건드리지 않음) */
function ChallengeDetailCurrencyBar() {
  const hud = useHud();
  const entryTickets = Number(hud['/lobby/entryTickets'] ?? 0);
  const gems = Number(hud['/lobby/gems'] ?? 0);
  const metaGold = Number(hud['/lobby/metaGold'] ?? 0);
  const fmtGold = (n: number) => n >= 1000 ? `${(n / 1000).toFixed(1)}K` : String(n);
  const chip = (icon: React.ReactNode, val: string, onClick?: () => void) => (
    <div onClick={onClick} style={{
      display: 'flex', alignItems: 'center', gap: 6,
      background: '#F4EFE6', border: '2px solid #000000', borderRadius: 20,
      padding: '4px 10px', fontSize: 12, fontWeight: 900, color: '#000000',
      minHeight: 30, boxShadow: '2px 2px 0 #000000', cursor: onClick ? 'pointer' : 'default',
    }}>
      {icon}<span>{val}</span>
      {onClick ? (
        <span style={{
          marginLeft: 4, width: 14, height: 14, borderRadius: '50%', background: '#FFB347',
          color: '#000000', fontWeight: 900, fontSize: 11, display: 'flex', alignItems: 'center', justifyContent: 'center',
          border: '1.5px solid #000000',
        }}>+</span>
      ) : null}
    </div>
  );
  return (
    <div style={{ display: 'flex', justifyContent: 'center', gap: 6, marginBottom: 10, flexWrap: 'wrap' }}>
      {chip(
        <svg width="14" height="14" viewBox="0 0 24 24" fill="#FFC200"><polygon points="13,2 4,14 11,14 11,22 20,10 13,10" stroke="#000000" strokeWidth="2.5" strokeLinejoin="round" /></svg>,
        `${entryTickets}`,
        () => window.dispatchEvent(new CustomEvent('energy:open')),
      )}
      {chip(
        <svg width="14" height="14" viewBox="0 0 24 24" fill="#7BE8F4"><path d="M12 2L2 12l10 10 10-10z" stroke="#000000" strokeWidth="2.5" strokeLinejoin="round" /></svg>,
        gems.toLocaleString(),
      )}
      {chip(
        <svg width="14" height="14" viewBox="0 0 24 24" fill="#FFD700"><circle cx="12" cy="12" r="9" stroke="#000000" strokeWidth="2.5" /></svg>,
        fmtGold(metaGold),
      )}
    </div>
  );
}

function ChallengeDetailEntryRow({ onStart }: { onStart: () => void }) {
  const hud = useHud();
  const entryTickets = Number(hud['/lobby/entryTickets'] ?? 0);
  const selectedMult = Number(hud['/lobby/selectedMult'] ?? 1);
  const multEnergyCost = Number(hud['/lobby/multEnergyCost'] ?? 5);
  const canStart = entryTickets >= multEnergyCost;

  return (
    <div style={{ display: 'flex', alignItems: 'stretch', gap: 10 }}>
      <button
        type="button"
        onClick={() => window.dispatchEvent(new CustomEvent('lobby:cycleMult'))}
        style={{
          minWidth: 94, padding: '10px 8px', cursor: 'pointer',
          background: '#F4EFE6', border: '2.5px solid #000000', borderRadius: 12,
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 4,
          boxShadow: '3px 3px 0 #000000', outline: 'none', flexShrink: 0,
        }}
      >
        <span style={{ fontWeight: 900, fontSize: 22 }}>×{selectedMult}</span>
        <span style={{ color: '#555', fontWeight: 900, fontSize: 10 }}>배수</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="#FFC200" style={{ filter: 'drop-shadow(1px 1px 0 #000000)' }}>
            <polygon points="13,2 4,14 11,14 11,22 20,10 13,10" stroke="#000000" strokeWidth="2.5" strokeLinejoin="round" />
          </svg>
          <span style={{ color: canStart ? '#000' : '#d32f2f', fontWeight: 900, fontSize: 13 }}>{multEnergyCost} 소모</span>
        </div>
      </button>
      <button
        type="button"
        disabled={!canStart}
        onClick={() => {
          if (!canStart) {
            window.dispatchEvent(new CustomEvent('energy:open'));
            return;
          }
          onStart();
        }}
        style={{
          flex: 1,
          background: canStart ? '#FFB347' : '#cccccc',
          border: '2.5px solid #000000', borderRadius: 12,
          padding: '12px 16px', cursor: canStart ? 'pointer' : 'not-allowed',
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 2,
          boxShadow: canStart ? '3px 3px 0 #000000' : 'none',
          outline: 'none', opacity: canStart ? 1 : 0.65,
        }}
      >
        <span style={{ fontWeight: 900, fontSize: 22 }}>도전 시작</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill={canStart ? '#FFC200' : '#888'}>
            <polygon points="13,2 4,14 11,14 11,22 20,10 13,10" stroke={canStart ? '#000' : '#888'} strokeWidth="2.5" strokeLinejoin="round" />
          </svg>
          <span style={{ color: canStart ? '#000' : '#d32f2f', fontWeight: 900, fontSize: 13 }}>
            {canStart ? `${multEnergyCost} 소모` : '번개 부족'}
          </span>
        </div>
      </button>
    </div>
  );
}

function ChallengeDetailModal({
  item,
  onClose,
  onStart,
}: {
  item: ChallengeItem;
  onClose: () => void;
  onStart: () => void;
}) {
  const diffColor = item.difficulty === 1 ? '#FFB347' : item.difficulty === 2 ? '#FF8A2A' : '#FF4455';
  const diffTag = item.difficulty === 1 ? 'NORMAL' : item.difficulty === 2 ? 'HARD' : 'HELL';
  const playTips = challengePlayTips(item.stage);
  if (item.cleared) playTips.push('클리어 완료 — 보상은 최초 1회만 지급됩니다');

  return (
    <div
      style={{
        position: 'absolute', inset: 0, zIndex: 60, background: 'rgba(0,0,0,0.5)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', pointerEvents: 'auto',
      }}
      onClick={onClose}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          width: '92%', maxWidth: 340, maxHeight: '88%', display: 'flex', flexDirection: 'column',
          borderRadius: 8, border: '3px solid #000000', background: '#F4EFE6', color: '#000000',
          overflow: 'hidden', boxShadow: '4px 4px 0 #000000',
        }}
      >
        <div style={{
          background: '#FFB347', padding: '12px 12px 10px', position: 'relative', flexShrink: 0,
          borderBottom: '3px solid #000000',
        }}>
          <button
            type="button"
            onClick={onClose}
            style={{
              position: 'absolute', right: 10, top: 10,
              width: 26, height: 26, borderRadius: 6, border: '2px solid #000000', background: '#F4EFE6',
              color: '#000000', fontWeight: 900, cursor: 'pointer', lineHeight: 1, padding: 0,
              boxShadow: '2px 2px 0 #000000',
            }}
          >
            ×
          </button>
          <div style={{ textAlign: 'center', paddingTop: 4 }}>
            <div style={{ fontWeight: 900, fontSize: 18, color: '#000000' }}>{item.difficulty_name}</div>
            <div style={{ fontSize: 12, fontWeight: 900, marginTop: 4, opacity: 0.9 }}>
              {item.stage}. {item.stage_name} · {diffTag}
            </div>
          </div>
        </div>

        <div style={{ flex: 1, overflow: 'auto', padding: '12px 12px 4px', minHeight: 0 }}>
          <ChallengeHelpSectionTitle>플레이 안내</ChallengeHelpSectionTitle>
          <ChallengeHelpTipsBox tips={playTips} />

          <ChallengeHelpSectionTitle>도전 난이도 (적 강화)</ChallengeHelpSectionTitle>
          <ChallengeRuleCard
            icon={getCommonSketchIcon('hp', 28)}
            title="적 체력"
            desc="이 미션(노말/하드/헬) 적용값"
            rightLabel={`×${item.enemy_hp_mult.toFixed(1)}`}
            rightSub="체력"
            accent={diffColor}
          />
          <ChallengeRuleCard
            icon={getCommonSketchIcon('attack', 28)}
            title="적 피해"
            desc="이 미션(노말/하드/헬) 적용값"
            rightLabel={`×${item.enemy_dmg_mult.toFixed(1)}`}
            rightSub="피해"
            accent={diffColor}
          />

          <ChallengeHelpSectionTitle>클리어 보상 (최초 1회)</ChallengeHelpSectionTitle>
          <ChallengeRuleCard
            icon={getCommonSketchIcon('dna', 28)}
            title="DNA"
            desc="도전 최초 클리어 시"
            rightLabel={`+${item.reward_dna}`}
            rightSub="획득"
          />
          <ChallengeRuleCard
            icon={getCommonSketchIcon('gold', 28)}
            title="골드"
            desc="도전 최초 클리어 시"
            rightLabel={item.reward_gold.toLocaleString()}
            rightSub="획득"
          />

          {!item.unlocked && (
            <>
              <ChallengeHelpSectionTitle>해금 조건</ChallengeHelpSectionTitle>
              <div style={{
                textAlign: 'center', padding: '10px 8px', fontSize: 12, fontWeight: 900,
                background: '#E8DFD1', border: '2px solid #000000', borderRadius: 8,
                boxShadow: '2px 2px 0 #000000', marginBottom: 8,
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
                  {getCommonSketchIcon('lock', 14)}
                  <span>{item.prereq_label ? `「${item.prereq_label}」 클리어 후 도전 가능` : '이전 난이도 클리어 필요'}</span>
                </div>
              </div>
            </>
          )}
        </div>

        <div style={{ padding: '8px 12px 12px', flexShrink: 0, borderTop: '2px solid #000000', background: '#F4EFE6' }}>
          {item.unlocked ? (
            <>
              <ChallengeDetailCurrencyBar />
              <ChallengeDetailEntryRow onStart={onStart} />
            </>
          ) : (
            <button
              type="button"
              onClick={onClose}
              style={{
                width: '100%', padding: '11px 0', borderRadius: 8, border: '2px solid #000000',
                background: '#E8DFD1', color: '#555555', fontWeight: 900, fontSize: 16,
                cursor: 'pointer', boxShadow: '2px 2px 0 #000000',
              }}
            >
              확인
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

/* ── 2D 스케치 공통 뒤로가기 버튼 컴포넌트 ── */
function SketchBackButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      style={{
        background: '#FFFFFF',
        border: '2px solid #000000',
        borderRadius: 6,
        width: 28,
        height: 28,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        boxShadow: '1.5px 1.5px 0 #000000',
        padding: 0,
        outline: 'none',
      }}
      onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.05)'; }}
      onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; }}
    >
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
        <path d="M 20 12 L 4 12 M 10 6 L 4 12 L 10 18" stroke="#000000" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </button>
  );
}

/* ── 도전 화면 ── */
function ChallengeScreenImpl({ items: itemsProp }: { items: unknown }) {
  const hud = useHud();
  const [selected, setSelected] = React.useState<ChallengeItem | null>(null);
  if (!hud['/challenge/visible']) return null;
  const items = (resolveValue(itemsProp, hud) as ChallengeItem[]) ?? [];
  const close = () => window.dispatchEvent(new CustomEvent('challenge:close'));
  const start = (id: number) => window.dispatchEvent(new CustomEvent('challenge:start', { detail: id }));

  /* 스테이지별 그룹화 */
  const byStage = new Map<number, ChallengeItem[]>();
  for (const it of items) {
    if (!byStage.has(it.stage)) byStage.set(it.stage, []);
    byStage.get(it.stage)!.push(it);
  }
  const stages = [...byStage.keys()].sort((a, b) => a - b);

  return (
    <div style={{
      position: 'absolute', top: 52, left: 0, right: 0, bottom: 0, zIndex: 47,
      background: '#F4EFE6',
      display: 'flex', flexDirection: 'column', color: '#000000',
      fontFamily: '"Segoe UI", Roboto, Helvetica, Arial, sans-serif',
    }}>
      {/* 헤더 */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 14px', borderBottom: '3px solid #000000', background: '#EDE5D8' }}>
        <SketchBackButton onClick={close} />
        <div style={{ fontWeight: 900, fontSize: 16, color: '#000000', display: 'flex', alignItems: 'center', gap: 6 }}>
          {renderChallengeSkullIcon(20, '#FF4455')}
          <span>도전 모드</span>
        </div>
      </div>

      {/* 안내 박스 */}
      <div style={{ margin: '10px 14px 8px' }}>
        <div style={{
          marginTop: 2, fontSize: 11, lineHeight: 1.45, color: '#000000',
          background: '#FFFFFF', border: '2.5px solid #000000', borderRadius: 10, padding: '10px 12px',
          boxShadow: '2.5px 2.5px 0 #000000'
        }}>
          <div style={{ fontWeight: 900, fontSize: 12, marginBottom: 4, display: 'flex', alignItems: 'center', gap: 4 }}>
            <span>💡</span> 도전 모드 안내
          </div>
          {CHALLENGE_MODE_INTRO_TIPS.map((t, i) => (
            <div key={i} style={{ marginBottom: i < CHALLENGE_MODE_INTRO_TIPS.length - 1 ? 3 : 0, fontWeight: 700, opacity: 0.8 }}>· {t}</div>
          ))}
        </div>
      </div>

      {/* 리스트 영역 */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '0 14px 12px' }}>
        {stages.map(st => {
          const group = byStage.get(st)!;
          const name = group[0].stage_name;
          return (
            <div key={st} style={{ marginBottom: 20 }}>
              {/* 스테이지 제목 배너 */}
              <div style={{
                background: '#EDE5D8', color: '#000000', fontWeight: 900, fontSize: 13,
                textAlign: 'center', padding: '7px', borderRadius: 8, marginBottom: 10,
                border: '3px solid #000000',
                boxShadow: '3px 3px 0 #000000',
              }}>{st}. {name}</div>
              
              {/* 난이도 카드 삼형제 */}
              <div style={{ display: 'flex', gap: 8 }}>
                {group.map(c => {
                  if (!c.unlocked) {
                    return (
                      <button type="button" key={c.challenge_id} onClick={() => setSelected(c)} style={{
                        flex: 1, aspectRatio: '0.68', borderRadius: 10, overflow: 'hidden',
                        background: '#E0D8CB', border: '3px solid #000000',
                        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                        padding: 8, textAlign: 'center', position: 'relative',
                        color: '#555555', cursor: 'pointer', opacity: 0.55,
                        boxShadow: '3px 3px 0 #000000',
                      }}>
                        <div style={{ marginBottom: 6 }}>
                          {renderChallengeLockIcon(24, '#E0D8CB')}
                        </div>
                        <div style={{ fontSize: 9, color: '#555555', lineHeight: 1.3, fontWeight: 900 }}>이전 난이도</div>
                        <div style={{ fontSize: 8, color: '#555555', fontWeight: 700 }}>클리어 필요</div>
                      </button>
                    );
                  }

                  /* 2D 스케치 컨셉 파스텔 톤 맵핑 */
                  const cardBg = c.difficulty === 1 ? '#ffffff' : c.difficulty === 2 ? '#FFF8E1' : '#FFEBEE';
                  const badgeBg = c.difficulty === 1 ? '#ffffff' : c.difficulty === 2 ? '#FFB347' : '#FF5252';
                  const badgeColor = c.difficulty === 3 ? '#ffffff' : '#000000';
                  const diffText = c.difficulty === 1 ? 'NORMAL' : c.difficulty === 2 ? 'HARD' : 'HELL';
                  const isCleared = c.cleared;

                  return (
                    <button key={c.challenge_id} onClick={() => setSelected(c)} style={{
                      flex: 1, aspectRatio: '0.68', borderRadius: 10, overflow: 'hidden',
                      background: cardBg,
                      border: '3px solid #000000',
                      boxShadow: '3.5px 3.5px 0 #000000',
                      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'space-between',
                      padding: '8px 6px', textAlign: 'center', cursor: 'pointer',
                      color: '#000000',
                    }}>
                      {/* 난이도 뱃지 */}
                      <div style={{ 
                        fontSize: 8, fontWeight: 900, color: badgeColor, background: badgeBg, 
                        border: '2px solid #000000', borderRadius: 6, padding: '2px 4px', width: '100%',
                        boxSizing: 'border-box'
                      }}>
                        {diffText}
                      </div>

                      {/* 난이도 명칭 */}
                      <div style={{ fontSize: 11, fontWeight: 900, color: '#000000', lineHeight: 1.2, margin: '4px 0' }}>
                        {c.difficulty_name}
                      </div>

                      {/* 배율 수치 */}
                      <div style={{ fontSize: 8, fontWeight: 800, color: '#555555', lineHeight: 1.2 }}>
                        HP ×{c.enemy_hp_mult.toFixed(1)}<br />DMG ×{c.enemy_dmg_mult.toFixed(1)}
                      </div>

                      {/* 별 클리어 상태 표시 */}
                      <div style={{ display: 'flex', gap: 2, justifyContent: 'center', marginTop: 4 }}>
                        <span style={{ 
                          fontSize: 14, 
                          color: isCleared ? '#FFCA28' : '#CCCCCC',
                          textShadow: isCleared ? '1px 1px 0 #000000' : 'none'
                        }}>
                          {isCleared ? '★' : '☆'}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {selected ? (
        <ChallengeDetailModal
          item={selected}
          onClose={() => setSelected(null)}
          onStart={() => {
            if (selected.unlocked) {
              setSelected(null);
              start(selected.challenge_id);
            }
          }}
        />
      ) : null}

      <NavTabBar active="challenge" />
    </div>
  );
}

/* ── 진화 화면 (일반=골드 메인라인 / 특수=DNA 분기) ── */
/* 진화 트리 전용 2D 스케치 SVG 아이콘 렌더러 */
function renderEvoNodeIcon(icon: string, size = 32): React.ReactNode {
  const strokeColor = '#000000';
  switch (icon) {
    case '🛡️':
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <path d="M12 2 L4 5 L4 11 C4 16.5 12 21 12 21 C12 21 20 16.5 20 11 L20 5 Z" fill="#ECEFF1" stroke={strokeColor} strokeWidth="2.5" strokeLinejoin="round" />
          <path d="M12 5 L7 7 L7 11 C7 14.5 12 18 12 18 C12 18 17 14.5 17 11 L17 7 Z" fill="#FFFFFF" stroke={strokeColor} strokeWidth="1.5" />
        </svg>
      );
    case '❤️':
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <path d="M12 21 C 12 21, 3 13, 3 8 C 3 4.5, 6 2.5, 9.5 3.5 C 11 4, 12 5.5, 12 5.5 C 12 5.5, 13 4, 14.5 3.5 C 18 2.5, 21 4.5, 21 8 C 21 13, 12 21, 12 21 Z" fill="#FF4455" stroke={strokeColor} strokeWidth="2.5" strokeLinejoin="round" />
          <path d="M14.5 5 C 16.5 4, 19 5.5, 19 8 C 19 11.5, 12 18.5, 12 18.5" fill="none" stroke="#FFFFFF" strokeWidth="1.5" strokeLinecap="round" opacity="0.6" />
        </svg>
      );
    case '💪':
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          {/* 덤벨 2D 핸드드로잉 */}
          <rect x="9" y="5" width="6" height="14" rx="2.5" fill="#CFD8DC" stroke={strokeColor} strokeWidth="2.5" />
          <rect x="3" y="7" width="6" height="10" rx="1.5" fill="#90A4AE" stroke={strokeColor} strokeWidth="2.5" />
          <rect x="15" y="7" width="6" height="10" rx="1.5" fill="#90A4AE" stroke={strokeColor} strokeWidth="2.5" />
          <line x1="6" y1="7" x2="6" y2="17" stroke="#FFFFFF" strokeWidth="1.2" opacity="0.5" />
          <line x1="18" y1="7" x2="18" y2="17" stroke="#FFFFFF" strokeWidth="1.2" opacity="0.5" />
        </svg>
      );
    case '🍖':
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          {/* 고기 뼈다귀 */}
          <rect x="5" y="10" width="14" height="4" fill="#FFFFFF" stroke={strokeColor} strokeWidth="2" />
          <circle cx="4" cy="10" r="2.5" fill="#FFFFFF" stroke={strokeColor} strokeWidth="2" />
          <circle cx="4" cy="14" r="2.5" fill="#FFFFFF" stroke={strokeColor} strokeWidth="2" />
          <circle cx="20" cy="10" r="2.5" fill="#FFFFFF" stroke={strokeColor} strokeWidth="2" />
          <circle cx="20" cy="14" r="2.5" fill="#FFFFFF" stroke={strokeColor} strokeWidth="2" />
          {/* 고기 덩어리 */}
          <rect x="7" y="6" width="10" height="12" rx="3" fill="#FF8A65" stroke={strokeColor} strokeWidth="2.5" />
          <ellipse cx="11" cy="9" rx="2" ry="1" fill="#FFFFFF" stroke="none" opacity="0.4" />
        </svg>
      );
    case '⚔️':
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          {/* 대각선 교차형 2D 검 */}
          <path d="M 18 3 L 21 6 L 10 17 L 7 17 L 7 14 Z" fill="#ECEFF1" stroke={strokeColor} strokeWidth="2.2" strokeLinejoin="round" />
          <path d="M 6 18 L 3 21 C 2.5 21.5, 2.5 22.5, 3 23 C 3.5 23.5, 4.5 23.5, 5 23 L 8 20 Z" fill="#8D6E63" stroke={strokeColor} strokeWidth="2" />
          <line x1="5" y1="19" x2="8" y2="16" stroke={strokeColor} strokeWidth="2.2" />
          
          <path d="M 6 3 L 3 6 L 14 17 L 17 17 L 17 14 Z" fill="#ECEFF1" stroke={strokeColor} strokeWidth="2.2" strokeLinejoin="round" />
          <path d="M 18 18 L 21 21 C 21.5 21.5, 21.5 22.5, 21 23 C 20.5 23.5, 19.5 23.5, 19 23 L 16 20 Z" fill="#8D6E63" stroke={strokeColor} strokeWidth="2" />
          <line x1="19" y1="19" x2="16" y2="16" stroke={strokeColor} strokeWidth="2.2" />
        </svg>
      );
    case '👟':
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          {/* 속도 신발 */}
          <path d="M 4 15 L 8 10 L 16 10 L 20 14 L 16 18 L 8 18 Z" fill="#B0D4FF" stroke={strokeColor} strokeWidth="2.5" strokeLinejoin="round" />
          <path d="M 6 18 Q 4 21 8 21 L 18 21 Q 20 21 20 18" fill="none" stroke={strokeColor} strokeWidth="2" strokeLinecap="round" />
          <line x1="9" y1="13" x2="14" y2="13" stroke="#FFFFFF" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      );
    case '🍴':
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          {/* 포식자 나이프/포크 */}
          <path d="M 7 4 L 7 12 M 5 4 L 5 9 M 9 4 L 9 9 M 7 12 L 7 20" fill="none" stroke={strokeColor} strokeWidth="2.2" strokeLinecap="round" />
          <path d="M 14 4 L 18 4 L 18 12 L 14 12 Z M 16 12 L 16 20" fill="#CFD8DC" stroke={strokeColor} strokeWidth="2.2" strokeLinejoin="round" />
        </svg>
      );
    case '⚡':
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <polygon points="14,2 6,13 12,13 10,22 18,11 12,11" fill="#FFE45C" stroke={strokeColor} strokeWidth="2.5" strokeLinejoin="round" />
          <polygon points="13,4 8,11 12,11 11,18 16,11 12,11" fill="#FFFFFF" opacity="0.6" />
        </svg>
      );
    case '🧲':
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <path d="M6 7 L6 14 C6 17.3 8.7 20 12 20 C15.3 20 18 17.3 18 14 L18 7" fill="#ECEFF1" stroke={strokeColor} strokeWidth="3" strokeLinecap="round" />
          <path d="M6 7 L6 11" fill="none" stroke="#FF4455" strokeWidth="4" strokeLinecap="round" />
          <path d="M18 7 L18 11" fill="none" stroke="#6BD5E8" strokeWidth="4" strokeLinecap="round" />
        </svg>
      );
    default:
      // 이모지 폴백 방지: 2D 보석으로 기본 렌더링
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <polygon points="12,2 18,8 18,16 12,22 6,16 6,8" fill="#E0F7FA" stroke={strokeColor} strokeWidth="2.5" strokeLinejoin="round"/>
        </svg>
      );
  }
}

function EvoNode({ n, selected, onSelect }: { n: EvoNodeItem; selected: boolean; onSelect: (id: number) => void }) {
  const costIcon = n.cost_type === 'dna' ? '💎' : '🪙';
  
  const ring = '#000000';
  const hasGlow = n.unlocked || n.available;
  const isLocked = !n.available && !n.unlocked;
  const contentOpacity = isLocked ? 0.35 : 1;

  return (
    <button
      onClick={() => onSelect(n.evo_id)}
      style={{
        width: 76, 
        borderRadius: 8,
        padding: '6px 4px 5px',
        background: n.unlocked 
          ? '#FF8A2A' 
          : n.available 
            ? '#FFE45C' 
            : '#E8DFD1',
        border: `3.5px solid ${ring}`, 
        cursor: 'pointer',
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center', 
        gap: 2,
        boxShadow: selected
          ? '0 0 0 2.5px #000000'
          : hasGlow 
          ? '3.5px 3.5px 0 #000000' 
          : 'none', 
        position: 'relative',
        outline: 'none',
        zIndex: 2,
      }}>
      <div style={{ 
        width: 32, 
        height: 32, 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        filter: isLocked ? 'grayscale(1) opacity(0.25)' : 'none',
        opacity: contentOpacity,
      }}>
        {renderEvoNodeIcon(n.icon, 32)}
      </div>
      <span style={{ fontSize: 9, fontWeight: 900, color: '#000000', opacity: contentOpacity }}>
        {n.unlocked ? '✓ 완료' : `${costIcon}${n.cost_amount}`}
      </span>
    </button>
  );
}

function EvolutionScreenImpl({ items: itemsProp, gold: goldProp, dna: dnaProp }: { items: unknown; gold: unknown; dna: unknown }) {
  const hud = useHud();
  const visible = Boolean(hud['/evolution/visible']);
  const items = (resolveValue(itemsProp, hud) as EvoNodeItem[]) ?? [];
  void goldProp; // 골드는 공통 상단바에서 표시
  const dna = Number(resolveValue(dnaProp, hud) ?? 0);
  const close = () => window.dispatchEvent(new CustomEvent('evolution:close'));
  const unlock = (id: number) => window.dispatchEvent(new CustomEvent('evolution:unlock', { detail: id }));

  const main = items.filter(n => n.branch === 0).sort((a, b) => a.order - b.order);
  const special = items.filter(n => n.branch === 1).sort((a, b) => a.order - b.order);
  
  const [selectedId, setSelectedId] = React.useState<number | null>(null);

  React.useEffect(() => {
    if (selectedId === null) return;
    const exists = items.some(n => n.evo_id === selectedId);
    if (!exists) setSelectedId(null);
  }, [items, selectedId]);

  if (!visible) return null;
  const selected = selectedId === null ? null : (items.find(n => n.evo_id === selectedId) ?? null);
  const canUnlockSelected = !!selected && selected.available && selected.affordable;
  const selectedCostIcon = selected?.cost_type === 'dna' ? '💎' : '🪙';

  return (
    <div style={{
      position: 'absolute', top: 52, left: 0, right: 0, bottom: 0, zIndex: 47,
      background: '#F4EFE6',
      display: 'flex', flexDirection: 'column', color: '#000000',
      fontFamily: '"Segoe UI", Roboto, Helvetica, Arial, sans-serif',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', borderBottom: '2.5px solid #000000', background: '#F4EFE6' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <SketchBackButton onClick={close} />
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontWeight: 900, fontSize: 16, color: '#000000' }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M 6 19 C 6 19, 10 15, 12 15 C 14 15, 18 19, 18 19" stroke="#000000" strokeWidth="2.5" strokeLinecap="round" />
              <path d="M 6 5 C 6 5, 10 9, 12 9 C 14 9, 18 5, 18 5" stroke="#000000" strokeWidth="2.5" strokeLinecap="round" />
              <path d="M 12 9 L 12 15" stroke="#000000" strokeWidth="2.5" strokeLinecap="round" />
              <circle cx="12" cy="7" r="1.5" fill="#000000" />
              <circle cx="12" cy="17" r="1.5" fill="#000000" />
            </svg>
            <span>진화</span>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 6 }}>
          {/* 골드는 공통 상단바와 중복 — DNA만 표시 */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 4, background: '#ffffff', border: '2px solid #000000', borderRadius: 12, padding: '4px 9px', color: '#000000', fontWeight: 900, fontSize: 12, boxShadow: '1.5px 1.5px 0 #000000' }}>
            {getCommonSketchIcon('gem', 12)}
            <span>{dna}</span>
          </div>
        </div>
      </div>

      {/* 트리 영역 (좌우 2열 배치) */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
        padding: '16px 8px 30px',
        display: 'flex',
        justifyContent: 'center',
        gap: 16,
        position: 'relative'
      }}>
        {/* 왼쪽: 일반 진화 컬럼 */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1, maxWidth: 160 }}>
          <div style={{
            fontWeight: 900,
            fontSize: 12,
            color: '#000000',
            background: '#FFE45C',
            border: '2.5px solid #000000',
            borderRadius: 12,
            padding: '5px 10px',
            boxShadow: '2px 2px 0 #000000',
            marginBottom: 20,
            display: 'flex',
            alignItems: 'center',
            gap: 4,
            whiteSpace: 'nowrap'
          }}>
            {getCommonSketchIcon('gold', 14)}
            <span>일반 진화 (스탯)</span>
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 32, width: '100%', position: 'relative' }}>
            {main.map((n, i) => {
              const mainLineOn = n.unlocked || (i > 0 && main[i-1].unlocked);
              return (
                <div key={n.evo_id} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative', width: 76 }}>
                  {i > 0 && (
                    <div style={{
                      position: 'absolute',
                      top: -36,
                      left: '50%',
                      transform: 'translateX(-50%)',
                      width: 0,
                      height: 38,
                      borderLeft: mainLineOn ? '3.5px solid #000000' : '3.5px dashed #000000',
                      opacity: mainLineOn ? 1 : 0.25,
                      zIndex: 1,
                    }} />
                  )}
                  <EvoNode n={n} selected={selectedId === n.evo_id} onSelect={setSelectedId} />
                </div>
              );
            })}
          </div>
        </div>

        {/* 수직 구분선 */}
        <div style={{ width: 2, borderLeft: '2px dashed #000000', opacity: 0.15, alignSelf: 'stretch', margin: '10px 0' }} />

        {/* 오른쪽: 특수 진화 컬럼 */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1, maxWidth: 160 }}>
          <div style={{
            fontWeight: 900,
            fontSize: 12,
            color: '#000000',
            background: '#B388FF',
            border: '2.5px solid #000000',
            borderRadius: 12,
            padding: '5px 10px',
            boxShadow: '2px 2px 0 #000000',
            marginBottom: 20,
            display: 'flex',
            alignItems: 'center',
            gap: 4,
            whiteSpace: 'nowrap'
          }}>
            {getCommonSketchIcon('gem', 14)}
            <span>특수 진화 (능력)</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 32, width: '100%', position: 'relative' }}>
            {special.map((n, i) => {
              const lineOn = n.unlocked || (i > 0 && special[i-1].unlocked);
              return (
                <div key={n.evo_id} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative', width: 76 }}>
                  {i > 0 && (
                    <div style={{
                      position: 'absolute',
                      top: -36,
                      left: '50%',
                      transform: 'translateX(-50%)',
                      width: 0,
                      height: 38,
                      borderLeft: lineOn ? '3.5px solid #000000' : '3.5px dashed #000000',
                      opacity: lineOn ? 1 : 0.25,
                      zIndex: 1,
                    }} />
                  )}
                  <EvoNode n={n} selected={selectedId === n.evo_id} onSelect={setSelectedId} />
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* 노드 정보 팝업 */}
      {selected && (
        <div style={{
          position: 'absolute',
          left: 18,
          top: 112,
          width: 168,
          background: '#F4EFE6',
          border: '3px solid #000000',
          boxShadow: '4px 4px 0 #000000',
          zIndex: 12,
          pointerEvents: 'auto',
          borderRadius: 8,
          fontFamily: '"Segoe UI", Roboto, sans-serif',
        }}>
          <div style={{
            background: '#FFB347',
            color: '#000000',
            fontWeight: 900,
            fontSize: 14,
            textAlign: 'center',
            padding: '6px 8px 5px',
            borderBottom: '2.5px solid #000000',
            position: 'relative',
          }}>
            {selected.node_title || selected.node_name}
            <button
              onClick={() => setSelectedId(null)}
              style={{
                position: 'absolute',
                right: 6,
                top: '50%',
                transform: 'translateY(-50%)',
                background: '#F4EFE6',
                border: '1.5px solid #000000',
                borderRadius: 4,
                width: 16,
                height: 16,
                fontSize: 10,
                fontWeight: 900,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                boxShadow: '1px 1px 0 #000000',
                padding: 0,
              }}
            >
              ×
            </button>
          </div>
          <div style={{ color: '#000000', fontWeight: 900, fontSize: 24, lineHeight: 1.05, padding: '8px 10px 0' }}>
            {selected.effect_label.replace('피해감소', '피해감소 ')}
          </div>
          <div style={{ color: '#555555', fontSize: 10, fontWeight: 700, padding: '7px 10px 10px', lineHeight: 1.4 }}>
            {selected.node_description || '능력을 강화합니다.'}
          </div>
          {!selected.unlocked && (
            <div style={{ padding: '0 10px 10px' }}>
              <button
                onClick={() => canUnlockSelected && unlock(selected.evo_id)}
                disabled={!canUnlockSelected}
                style={{
                  width: '100%',
                  background: canUnlockSelected ? '#FFB347' : '#E8DFD1',
                  border: '2.5px solid #000000',
                  color: '#000000',
                  fontWeight: 900,
                  fontSize: 14,
                  cursor: canUnlockSelected ? 'pointer' : 'not-allowed',
                  padding: '6px 0',
                  borderRadius: 8,
                  boxShadow: canUnlockSelected ? '2px 2px 0 #000000' : 'none',
                }}
              >
                잠금해제
              </button>
              <div style={{ textAlign: 'center', color: '#000000', fontWeight: 900, marginTop: 6, fontSize: 10 }}>
                {selectedCostIcon} x {selected.cost_amount}
              </div>
              {!selected.available && (
                <div style={{ textAlign: 'center', color: '#555555', fontSize: 9, fontWeight: 700, marginTop: 3 }}>
                  선행 노드 해금 필요
                </div>
              )}
            </div>
          )}
        </div>
      )}

      <NavTabBar active="evolution" />
    </div>
  );
}

// 2D 스케치 큐브 아바타 아이콘 렌더러
function renderAvatarIcon(size = 42, _showGlow = false, colorHex = '#7BE8F4') {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 256 256"
      style={{ overflow: 'visible' }}
    >
      {/* 1. 전체 입체 실루엣 채우기 */}
      <path d="M 128 70 L 70 105 L 70 175 L 128 210 L 186 175 L 186 105 Z" fill="#ffffff" stroke="#000000" strokeWidth="8" strokeLinejoin="round" />
      
      {/* 면 채우기 (단색 명암 스케치 룩) */}
      {/* 윗면 (원래 색) */}
      <path d="M 128 70 L 70 105 L 128 140 L 186 105 Z" fill={colorHex} stroke="#000000" strokeWidth="6" strokeLinejoin="round" />
      
      {/* 좌측면 (원래 색 + 어두운 2D 그림자) */}
      <path d="M 70 105 L 128 140 L 128 210 L 70 175 Z" fill={colorHex} stroke="#000000" strokeWidth="6" strokeLinejoin="round" />
      <path d="M 70 105 L 128 140 L 128 210 L 70 175 Z" fill="rgba(0, 0, 0, 0.25)" />
      
      {/* 우측 앞면 (얼굴면) */}
      <path d="M 128 140 L 186 105 L 186 175 L 128 210 Z" fill={colorHex} stroke="#000000" strokeWidth="6" strokeLinejoin="round" />
      <path d="M 128 140 L 186 105 L 186 175 L 128 210 Z" fill="rgba(0, 0, 0, 0.08)" />

      {/* 내부 실선들 강조 */}
      <line x1="128" y1="140" x2="128" y2="210" stroke="#000000" strokeWidth="6" strokeLinecap="round" />

      {/* 눈 (우측 앞면 배치) */}
      <circle cx="144" cy="153" r="6" fill="#000000" />
      <circle cx="168" cy="140" r="6" fill="#000000" />

    </svg>
  );
}


function EquipScreenImpl({ items: itemsProp, gold: goldProp, atk: atkProp, hp: hpProp }: {
  items: unknown; gold: unknown; atk: unknown; hp: unknown; spd: unknown;
}) {
  const hud = useHud();
  const [selectedSlot, setSelectedSlot] = React.useState<string>('weapon');
  const [popupSlot, setPopupSlot] = React.useState<string | null>(null);
  const [sortMode, setSortMode] = React.useState<'level' | 'grade'>('level');
  if (!hud['/equip/visible']) return null;

  const items = (resolveValue(itemsProp, hud) as EquipItem[]) ?? [];
  const gold = Number(resolveValue(goldProp, hud) ?? 0);
  const atk = Number(resolveValue(atkProp, hud) ?? 0);
  const hp = Number(resolveValue(hpProp, hud) ?? 0);
  const baseAtk = 22, baseHp = 100;
  const totalAtk = Math.round(baseAtk * (1 + atk));
  const totalHp = baseHp + hp;

  const upgrade = (id: string) => window.dispatchEvent(new CustomEvent('equip:upgrade', { detail: id }));
  const equip = (id: string) => window.dispatchEvent(new CustomEvent('equip:equip', { detail: id }));
  const unequip = (id: string) => window.dispatchEvent(new CustomEvent('equip:unequip', { detail: id }));
  const close = () => window.dispatchEvent(new CustomEvent('equip:close'));
  const openPopup = (id: string) => { setSelectedSlot(id); setPopupSlot(id); };

  const bySlot = (id: string) => items.find(i => i.slot_id === id);
  const equippedWeapon = items.find(i => i.skill_id && i.equipped);
  const weaponSlotId = equippedWeapon?.slot_id ?? 'weapon';
  const leftSlots = [weaponSlotId, 'necklace', 'gloves'];
  const rightSlots = ['armor', 'belt', 'boots'];
  const popupItem = popupSlot ? bySlot(popupSlot) : null;

  const GRADE_ORDER: Record<string, number> = { LEGEND: 0, EPIC: 1, RARE: 2, COMMON: 3, EMPTY: 4 };
  const sortedItems = [...items].sort((a, b) =>
    sortMode === 'level'
      ? b.current_level - a.current_level
      : (GRADE_ORDER[a.grade] ?? 9) - (GRADE_ORDER[b.grade] ?? 9));

  /* 슬롯 버튼 (캐릭터 양옆) — 2D 스케치 스타일 */
  const SlotBtn = ({ id }: { id: string }) => {
    const it = bySlot(id);
    const sel = id === selectedSlot;
    const equipped = !!it?.equipped;
    return (
      <button onClick={() => it && openPopup(id)} style={{
        width: 56, height: 56, borderRadius: 8,
        background: it ? '#ffffff' : '#E8DFD1',
        border: `2.5px solid ${sel ? '#FF8A2A' : '#000000'}`,
        boxShadow: sel ? '3px 3px 0 #FF8A2A' : it ? '2px 2px 0 #000000' : 'none',
        display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative',
        cursor: it ? 'pointer' : 'default', opacity: it ? (equipped ? 1 : 0.65) : 0.35,
      }}>
        {it ? renderEquipIcon(it.slot_id, it.grade, 34, it.icon) : <span style={{ fontSize: 22, color: '#000000', opacity: 0.25 }}>＋</span>}
        {it && <div style={{ position: 'absolute', top: -5, left: -5 }}>{renderSlotTypeBadge(id, 9)}</div>}
        {it && <span style={{ position: 'absolute', top: -6, right: -6, background: '#000000', borderRadius: 4, fontSize: 8, fontWeight: 900, color: '#ffffff', padding: '0 3px' }}>Lv.{it.current_level}</span>}
        {equipped && <span style={{ position: 'absolute', bottom: -6, left: '50%', transform: 'translateX(-50%)', background: '#000000', color: '#ffffff', borderRadius: 7, fontSize: 9, fontWeight: 900, width: 14, height: 14, lineHeight: '14px', textAlign: 'center' }}>✓</span>}
      </button>
    );
  };

  return (
    <div style={{
      position: 'absolute', top: 52, left: 0, right: 0, bottom: 0, zIndex: 47,
      background: '#F4EFE6',
      display: 'flex', flexDirection: 'column', color: '#000000',
      fontFamily: '"Segoe UI", Roboto, Helvetica, Arial, sans-serif',
    }}>
      {/* 헤더 */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', borderBottom: '2.5px solid #000000', background: '#F4EFE6' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <SketchBackButton onClick={close} />
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontWeight: 900, fontSize: 16, color: '#000000' }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M 17 3 L 21 6 L 10 17 L 7 17 L 7 14 Z" fill="#ECEFF1" stroke="#000000" strokeWidth="2" strokeLinejoin="round" />
              <path d="M 6 18 L 3 21 C 2.5 21.5, 2.5 22.5, 3 23 C 3.5 23.5, 4.5 23.5, 5 23 L 8 20 Z" fill="#8D6E63" stroke="#000000" strokeWidth="1.8" />
              <path d="M 13 8 L 16 11" stroke="#000000" strokeWidth="2" />
            </svg>
            <span>나의 장비</span>
          </div>
        </div>
        {/* 골드는 공통 상단바와 중복 — 제거 */}
      </div>

      {/* ATK / HP 바 */}
      <div style={{ display: 'flex', gap: 8, padding: '10px 14px' }}>
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 6, background: '#ffffff', border: '2px solid #000000', borderRadius: 6, padding: '6px 10px', boxShadow: '2px 2px 0 #000000' }}>
          <span style={{ fontSize: 12, fontWeight: 900, color: '#000000' }}>⚔ ATK</span>
          <span style={{ marginLeft: 'auto', fontSize: 16, fontWeight: 900, color: '#000000' }}>{totalAtk}</span>
        </div>
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 6, background: '#ffffff', border: '2px solid #000000', borderRadius: 6, padding: '6px 10px', boxShadow: '2px 2px 0 #000000' }}>
          <span style={{ fontSize: 12, fontWeight: 900, color: '#000000' }}>❤ HP</span>
          <span style={{ marginLeft: 'auto', fontSize: 16, fontWeight: 900, color: '#000000' }}>{totalHp}</span>
        </div>
      </div>

      {/* 캐릭터 + 6슬롯 */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '8px 16px 14px', position: 'relative',
        background: '#EDE5D8', borderTop: '2px solid #000000', borderBottom: '2px solid #000000',
      }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {leftSlots.map(id => <SlotBtn key={id} id={id} />)}
        </div>
        <div className="prism-idle-char" style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {(() => {
            const w = equippedWeapon;
            if (!w) return null;
            return (
              <div style={{ position: 'absolute', right: -12, top: '50%', transform: 'translateY(-8%)', zIndex: 0 }}>
                <div className="prism-gun-spin">{renderEquipIcon(w.slot_id, w.grade, 42)}</div>
              </div>
            );
          })()}
          <div style={{ position: 'relative', zIndex: 1 }}>{renderAvatarIcon(120, false)}</div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {rightSlots.map(id => <SlotBtn key={id} id={id} />)}
        </div>
      </div>

      {/* 보유 장비 그리드 */}
      <div style={{ flex: 1, background: '#F4EFE6', padding: '10px 14px', overflowY: 'auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
          <button onClick={() => setSortMode(m => m === 'level' ? 'grade' : 'level')} style={{
            background: '#FFB347', color: '#000000', border: '2px solid #000000', borderRadius: 6,
            padding: '4px 10px', fontWeight: 900, fontSize: 11, cursor: 'pointer', boxShadow: '2px 2px 0 #000000',
          }}>{sortMode === 'level' ? '레벨별 ▾' : '등급별 ▾'}</button>
          <span style={{ color: '#555555', fontSize: 11, fontWeight: 700 }}>보유 장비</span>
          <span style={{ width: 60 }} />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
          {sortedItems.map(it => {
            const gc = GRADE_COLOR[it.grade] ?? '#888';
            const sel = it.slot_id === selectedSlot;
            return (
              <button key={it.slot_id} onClick={() => openPopup(it.slot_id)} style={{
                aspectRatio: '1', position: 'relative', borderRadius: 8,
                background: '#ffffff', border: `2.5px solid ${sel ? '#FF8A2A' : '#000000'}`,
                boxShadow: sel ? '3px 3px 0 #FF8A2A' : '2px 2px 0 #000000',
                display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
              }}>
                {renderEquipIcon(it.slot_id, it.grade, 34, it.icon)}
                <div style={{ position: 'absolute', top: 2, left: 2 }}>{renderSlotTypeBadge(equipVisualSlotKind(it.slot_id, it.slot_name), 10)}</div>
                <span style={{ position: 'absolute', top: 2, right: 2, background: gc, color: '#000000', fontSize: 6, fontWeight: 900, padding: '1px 3px', borderRadius: 2, border: '1px solid #000000' }}>{GRADE_LABEL[it.grade] ?? it.grade}</span>
                <span style={{ position: 'absolute', bottom: 2, right: 3, fontSize: 8, fontWeight: 900, color: '#000000' }}>Lv.{it.current_level}</span>
                {it.equipped && <span style={{ position: 'absolute', bottom: 2, left: 2, background: '#000000', color: '#ffffff', fontSize: 8, fontWeight: 900, width: 13, height: 13, lineHeight: '13px', textAlign: 'center', borderRadius: 3 }}>✓</span>}
              </button>
            );
          })}
        </div>
      </div>

      <NavTabBar active="equip" />

      {popupItem && (
        <EquipDetailPopup
          item={popupItem}
          gold={gold}
          onClose={() => setPopupSlot(null)}
          onEquip={() => { if (!popupItem.equipped) equip(popupItem.slot_id); }}
          onUpgrade={() => upgrade(popupItem.slot_id)}
          onUnequip={() => { unequip(popupItem.slot_id); setPopupSlot(null); }}
        />
      )}
    </div>
  );
}

/* ── 영구 특성 화면 ── */
function TalentScreenImpl({ items: itemsProp, gold: goldProp }: { items: unknown; gold: unknown }) {
  const hud = useHud();
  if (!hud['/talent/visible']) return null;
  const items = (resolveValue(itemsProp, hud) as TalentItem[]) ?? [];
  const gold = Number(resolveValue(goldProp, hud) ?? 0);

  const upgrade = (id: string) => window.dispatchEvent(new CustomEvent('talent:upgrade', { detail: id }));
  const close = () => window.dispatchEvent(new CustomEvent('talent:close'));

  return (
    <div style={{
      position: 'absolute', top: 52, left: 0, right: 0, bottom: 0, zIndex: 47,
      background: '#F4EFE6',
      display: 'flex', flexDirection: 'column', color: '#000000',
      fontFamily: '"Segoe UI", Roboto, Helvetica, Arial, sans-serif',
    }}>
      {/* 헤더 */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '12px 14px', borderBottom: '2.5px solid #000000', background: '#F4EFE6',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <button onClick={close} style={{
            background: 'transparent', border: 'none', color: '#000000', fontSize: 20, cursor: 'pointer', fontWeight: 900,
          }}>←</button>
          <div style={{ fontWeight: 900, fontSize: 16, color: '#000000' }}>영구 특성</div>
        </div>
        {/* 골드는 공통 상단바와 중복 — 제거 */}
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '14px' }}>
        <div style={{ color: '#555555', fontSize: 10, fontWeight: 900, letterSpacing: 1, marginBottom: 10, borderBottom: '2px solid #000000', paddingBottom: 6 }}>
          영구 업그레이드 — 스테이지 전환 시 유지
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {items.map(t => {
            const maxed = t.next_cost <= 0;
            const canBuy = !maxed && gold >= t.next_cost;
            return (
              <div key={t.talent_id} style={{
                display: 'flex', alignItems: 'center', gap: 12,
                background: '#ffffff', border: '2.5px solid #000000',
                padding: '12px', borderRadius: 8, boxShadow: '3px 3px 0 #000000',
              }}>
                {/* 아이콘 */}
                <div style={{
                  width: 46, height: 46, borderRadius: 8, flexShrink: 0,
                  background: '#E8DFD1', border: '2px solid #000000',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24,
                }}>{t.icon}</div>

                {/* 정보 */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 900, fontSize: 13, color: '#000000' }}>{t.talent_name}</div>
                  <div style={{ color: '#555555', fontSize: 10, marginTop: 1 }}>{t.description}</div>
                  {/* 레벨 도트 */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 6 }}>
                    {Array.from({ length: t.max_level }, (_, i) => (
                      <div key={i} style={{
                        width: 10, height: 10, borderRadius: '50%',
                        background: i < t.current_level ? '#000000' : '#D0C5B4',
                        border: '1.5px solid #000000',
                      }} />
                    ))}
                    <span style={{ color: '#555555', fontSize: 10, marginLeft: 4, fontWeight: 700 }}>LV.{t.current_level} / {t.max_level}</span>
                  </div>
                </div>

                {/* 효과 + 업그레이드 */}
                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                  <div style={{ color: '#000000', fontWeight: 900, fontSize: 14 }}>{t.current_effect}</div>
                  {maxed ? (
                    <div style={{ background: '#FFB347', border: '2px solid #000000', borderRadius: 6, fontSize: 11, fontWeight: 900, color: '#000000', marginTop: 4, padding: '3px 8px', boxShadow: '2px 2px 0 #000000' }}>MAX</div>
                  ) : (
                    <>
                      <button
                        onClick={() => canBuy && upgrade(t.talent_id)}
                        disabled={!canBuy}
                        style={{
                          marginTop: 4, padding: '5px 10px',
                          background: canBuy ? '#FFB347' : '#E8DFD1',
                          color: '#000000', border: '2px solid #000000', borderRadius: 6,
                          fontWeight: 900, fontSize: 11, cursor: canBuy ? 'pointer' : 'not-allowed',
                          whiteSpace: 'nowrap', boxShadow: canBuy ? '2px 2px 0 #000000' : 'none',
                        }}>업그레이드 🪙{t.next_cost}</button>
                      <div style={{ color: '#555555', fontSize: 9, marginTop: 2, fontWeight: 700 }}>→ {t.next_effect}</div>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/* ── 배틀 티켓 선택 팝업 ── */
/* ── 번개 배수 선택 팝업 ── */
function BattlePopupImpl({ options: optProp, selectedMult: selProp, energy: enProp }: { options: unknown; selectedMult: unknown; energy: unknown }) {
  const hud = useHud();
  if (!hud['/battle/visible']) return null;
  const options = (resolveValue(optProp, hud) as MultOption[]) ?? [];
  const selectedMult = Number(resolveValue(selProp, hud) ?? 1);
  const energy = Number(resolveValue(enProp, hud) ?? 0);

  const sel = options.find(o => o.mult === selectedMult) ?? options[0];
  const canEnter = sel && sel.affordable;

  const select = (m: number) => window.dispatchEvent(new CustomEvent('battle:selectMult', { detail: m }));
  const confirm = () => window.dispatchEvent(new CustomEvent('battle:confirm'));
  const close = () => window.dispatchEvent(new CustomEvent('battle:close'));

  return (
    <div style={{
      position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.5)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 50, fontFamily: '"Segoe UI", Roboto, Helvetica, Arial, sans-serif',
    }}>
      <div style={{
        width: '92%', maxWidth: 420,
        background: '#F4EFE6', border: '3px solid #000000',
        padding: '20px 18px', borderRadius: 12,
        boxShadow: '6px 6px 0 rgba(0,0,0,1)',
        color: '#000000'
      }}>
        <div style={{ fontWeight: 900, fontSize: 20, textAlign: 'center', letterSpacing: 0.5, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="#FFC200" style={{ filter: 'drop-shadow(1.5px 1.5px 0 #000000)' }}>
            <polygon points="13,2 4,14 11,14 11,22 20,10 13,10" stroke="#000000" strokeWidth="2.5" strokeLinejoin="round" />
          </svg>
          번개 배수 선택
        </div>
        <div style={{ color: '#555555', fontSize: 11, fontWeight: 700, textAlign: 'center', marginTop: 4, marginBottom: 8 }}>
          번개를 더 걸수록 타이쿤 재화가 배수로 증가합니다.
        </div>
        <div style={{
          textAlign: 'center', marginBottom: 16, fontSize: 14, fontWeight: 900,
          background: '#ffffff', border: '2px solid #000000', padding: '6px 12px',
          display: 'inline-block', position: 'relative', left: '50%', transform: 'translateX(-50%)',
          boxShadow: '2px 2px 0 #000000',
        }}>
          보유 ⚡ {energy}
        </div>

        {/* 배수 버튼 그리드 (3×2) */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, marginBottom: 16 }}>
          {options.map(o => {
            const isSel = o.mult === selectedMult;
            return (
              <button key={o.mult} onClick={() => o.affordable && select(o.mult)} disabled={!o.affordable}
                style={{
                  padding: '12px 4px', borderRadius: 8,
                  background: isSel ? '#FFB347' : o.affordable ? '#ffffff' : '#e8dfd1',
                  border: `2.5px solid ${o.affordable ? '#000000' : '#888888'}`,
                  boxShadow: o.affordable ? '2px 2px 0 #000000' : 'none',
                  color: o.affordable ? '#000000' : '#888888',
                  cursor: o.affordable ? 'pointer' : 'not-allowed',
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
                  outline: 'none',
                  transform: isSel ? 'translateY(1px)' : 'none',
                }}>
                <span style={{ fontWeight: 900, fontSize: 20 }}>×{o.mult}</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill={o.affordable ? "#FFC200" : "#888888"}>
                    <polygon points="13,2 4,14 11,14 11,22 20,10 13,10" stroke={o.affordable ? "#000000" : "#888888"} strokeWidth="2" strokeLinejoin="round" />
                  </svg>
                  <span style={{ fontSize: 11, fontWeight: 900 }}>{o.energy}</span>
                </div>
              </button>
            );
          })}
        </div>

        <button onClick={confirm} disabled={!canEnter} style={{
          width: '100%', padding: '14px',
          background: canEnter ? '#FFB347' : '#cccccc',
          color: '#000000',
          border: '2.5px solid #000000', borderRadius: 8,
          fontWeight: 900, fontSize: 16,
          boxShadow: canEnter ? '3px 3px 0 #000000' : 'none',
          cursor: canEnter ? 'pointer' : 'not-allowed', marginBottom: 8,
          outline: 'none',
        }}>
          {sel ? `⚡ ${sel.energy} 소모 — ×${sel.mult} 배수로 입장` : '입장'}
        </button>
        <button onClick={close} style={{
          width: '100%', padding: '10px',
          background: '#ffffff',
          color: '#000000',
          border: '2.5px solid #000000', borderRadius: 8,
          fontWeight: 900, fontSize: 14,
          boxShadow: '3px 3px 0 #000000',
          cursor: 'pointer',
          outline: 'none',
        }}>취소</button>
      </div>
    </div>
  );
}

/* ── 에너지(번개) 충전 상점 ── */
function EnergyShopImpl({ cur: curProp, gems: gemsProp }: { cur: unknown; gems: unknown }) {
  const hud = useHud();
  if (!hud['/energy/visible']) return null;
  const cur  = Number(resolveValue(curProp,  hud) ?? 0);
  const gems = Number(resolveValue(gemsProp, hud) ?? 0);
  const buy   = (k: string) => window.dispatchEvent(new CustomEvent('energy:buy',   { detail: k }));
  const close = ()          => window.dispatchEvent(new CustomEvent('energy:close'));

  /* SVG 아이콘 헬퍼 */
  const BoltIcon = ({ size = 28, color = '#FFC200' }: { size?: number; color?: string }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <polygon points="13,2 4,14 11,14 11,22 20,10 13,10" fill={color} stroke="#000000" strokeWidth="2" strokeLinejoin="round" />
    </svg>
  );

  const GemIcon = ({ size = 22 }: { size?: number }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <polygon points="12,2 22,8 22,16 12,22 2,16 2,8" fill="#7BE8F4" stroke="#000000" strokeWidth="2" strokeLinejoin="round" />
    </svg>
  );

  const TvIcon = ({ size = 24 }: { size?: number }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <rect x="2" y="5" width="20" height="14" rx="2" stroke="#000000" strokeWidth="2.5" fill="#ffffff" />
      <line x1="8" y1="21" x2="16" y2="21" stroke="#000000" strokeWidth="2.5" strokeLinecap="round" />
      <line x1="12" y1="19" x2="12" y2="21" stroke="#000000" strokeWidth="2.5" />
    </svg>
  );

  /* 카드 컴포넌트 */
  const Card = ({
    icon, count, label, btnIcon, btnLabel, canAfford, onBuy,
  }: {
    icon: React.ReactNode;
    count: string;
    label: string;
    btnIcon: React.ReactNode;
    btnLabel: string;
    canAfford: boolean;
    onBuy: () => void;
  }) => (
    <div style={{
      flex: 1,
      background: '#ffffff',
      border: '2.5px solid #000000',
      borderRadius: 12,
      padding: '18px 10px',
      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8,
      boxShadow: '3px 3px 0 #000000',
    }}>
      {/* 아이콘 */}
      <div style={{ display: 'flex', gap: 2 }}>{icon}</div>

      {/* 수량 */}
      <div style={{
        color: '#000000',
        fontSize: 24, fontWeight: 900,
      }}>
        ×{count}
      </div>

      {/* 라벨 */}
      <div style={{ color: '#555555', fontSize: 11, fontWeight: 900 }}>{label}</div>

      {/* 구매 버튼 */}
      <button
        onClick={onBuy}
        disabled={!canAfford}
        style={{
          width: '100%',
          padding: '9px 0',
          background: canAfford
            ? '#FFB347'
            : '#cccccc',
          border: '2px solid #000000',
          borderRadius: 8,
          color: '#000000',
          fontSize: 13, fontWeight: 900,
          cursor: canAfford ? 'pointer' : 'not-allowed',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5,
          outline: 'none',
          boxShadow: canAfford ? '2px 2px 0 #000000' : 'none',
        }}
      >
        {btnIcon}
        {btnLabel}
      </button>
    </div>
  );

  return (
    <div style={{
      position: 'absolute', inset: 0,
      background: 'rgba(0,0,0,0.5)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 55,
      fontFamily: '"Segoe UI", Roboto, Helvetica, Arial, sans-serif',
    }}>
      <div style={{
        width: '86%', maxWidth: 340,
        background: '#F4EFE6',
        border: '3.5px solid #000000',
        borderRadius: 16,
        overflow: 'hidden',
        boxShadow: '6px 6px 0 #000000',
      }}>
        {/* 헤더 바 */}
        <div style={{
          background: '#e8dfd1',
          borderBottom: '3.5px solid #000000',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '12px 14px',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <BoltIcon size={24} color="#FFC200" />
            <span style={{ color: '#000000', fontSize: 17, fontWeight: 900 }}>에너지 구매</span>
          </div>
          <button
            onClick={close}
            style={{
              background: '#ffffff', border: '2.5px solid #000000', borderRadius: 8,
              color: '#000000', fontSize: 16, width: 32, height: 32,
              cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
              outline: 'none', fontWeight: 900,
              boxShadow: '2px 2px 0 #000000',
            }}
          >
            ✕
          </button>
        </div>

        {/* 보유량 표시 */}
        <div style={{
          display: 'flex', gap: 14, alignItems: 'center',
          padding: '10px 14px', borderBottom: '2.5px solid #000000',
          background: '#ffffff',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: '#F4EFE6', border: '2px solid #000000', borderRadius: 20, padding: '4px 12px', boxShadow: '2px 2px 0 #000000' }}>
            <BoltIcon size={14} color="#FFC200" />
            <span style={{ color: '#000000', fontSize: 13, fontWeight: 900 }}>{cur}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: '#F4EFE6', border: '2px solid #000000', borderRadius: 20, padding: '4px 12px', boxShadow: '2px 2px 0 #000000' }}>
            <GemIcon size={14} />
            <span style={{ color: '#000000', fontSize: 13, fontWeight: 900 }}>{gems.toLocaleString()}</span>
          </div>
        </div>

        {/* 카드 두 개 */}
        <div style={{ display: 'flex', gap: 12, padding: '16px' }}>
          <Card
            icon={<><BoltIcon size={24} /><BoltIcon size={24} /></>}
            count="15"
            label="보석으로 구매"
            btnIcon={<GemIcon size={14} />}
            btnLabel="×100"
            canAfford={gems >= 100}
            onBuy={() => buy('gem')}
          />
          <Card
            icon={<BoltIcon size={24} />}
            count="5"
            label="광고 시청"
            btnIcon={<TvIcon size={16} />}
            btnLabel="무료"
            canAfford={true}
            onBuy={() => buy('ad')}
          />
        </div>
      </div>
    </div>
  );
}


/* ── 행운 열차 ── */
function LuckyTrainImpl({ gold: goldProp, skills: skillsProp, selectedId: selectedIdProp }: {
  gold: unknown; skills: unknown; selectedId: unknown;
}) {
  const hud = useHud();
  const visible = hud['/luckyTrain/visible'];
  const gold = resolveValue(goldProp, hud) as number ?? 0;
  const skills = resolveValue(skillsProp, hud) as LuckyTrainSkillItem[] ?? [];
  const selectedId = resolveValue(selectedIdProp, hud) as string ?? '';

  if (!visible) return null;

  const selected = skills.find(s => s.skill_id === selectedId) ?? skills[0] ?? null;
  const canBuy = selected && selected.owned_level === 0 && gold >= selected.gold_cost;

  const handleSelect = (skillId: string) => {
    window.dispatchEvent(new CustomEvent('luckyTrain:select', { detail: skillId }));
  };
  const handleBuy = () => {
    if (!canBuy) return;
    window.dispatchEvent(new CustomEvent('luckyTrain:buy', { detail: selected.skill_id }));
  };
  const handleClose = () => {
    window.dispatchEvent(new CustomEvent('luckyTrain:close'));
  };

  return (
    <div style={{
      position: 'absolute', inset: 0,
      background: 'rgba(0,0,0,0.5)',
      display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
      zIndex: 40,
      fontFamily: '"Segoe UI", Roboto, Helvetica, Arial, sans-serif',
    }}>
      <div style={{
        width: '100%', maxWidth: 420,
        background: '#F4EFE6',
        border: '3.5px solid #000000',
        borderBottom: 'none',
        borderRadius: '16px 16px 0 0',
        padding: '0 0 18px',
        maxHeight: '88vh',
        display: 'flex', flexDirection: 'column',
        boxSizing: 'border-box',
      }}>
        {/* 헤더 */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '16px 16px 12px',
          borderBottom: '2.5px solid #000000',
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#000000', fontWeight: 900, fontSize: 18, letterSpacing: 0.5 }}>
              {getCommonSketchIcon('luckyTrain', 20)}
              <span>행운 열차</span>
            </div>
            <div style={{ color: '#555555', fontSize: 11, fontWeight: 900, marginTop: 2 }}>골드를 소비해 스킬을 즉시 획득</div>
          </div>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 4,
            background: '#ffffff', border: '2px solid #000000',
            borderRadius: 20, padding: '4px 12px',
            color: '#000000', fontWeight: 900, fontSize: 14,
            boxShadow: '2px 2px 0 #000000',
          }}>
            {getCommonSketchIcon('gold', 14)}
            <span>{gold.toLocaleString()}</span>
          </div>
        </div>

        {/* 스킬 그리드 */}
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)',
          gap: 8, padding: '14px 12px',
          overflowY: 'auto', flex: 1,
        }}>
          {skills.map(skill => {
            const isOwned = skill.owned_level > 0;
            const isSelected = skill.skill_id === selectedId;
            return (
              <div
                key={skill.skill_id}
                onClick={() => handleSelect(skill.skill_id)}
                style={{
                  background: isSelected
                    ? '#FFB347'
                    : isOwned ? '#c5f0f5' : '#ffffff',
                  border: isSelected ? '2.5px solid #000000' : '2px solid #000000',
                  boxShadow: isSelected || !isOwned ? '2px 2px 0 #000000' : 'none',
                  borderRadius: 8,
                  padding: '8px 4px',
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
                  cursor: isOwned ? 'default' : 'pointer',
                  opacity: isOwned ? 0.75 : 1,
                  position: 'relative',
                }}>
                {isOwned && (
                  <div style={{
                    position: 'absolute', top: -4, right: -4,
                    background: '#FFB347', color: '#000000',
                    fontSize: 8, fontWeight: 900, padding: '1px 4px', borderRadius: 4,
                    border: '1.5px solid #000000',
                  }}>Lv.{skill.owned_level}</div>
                )}
                <div style={{ fontSize: 24, filter: 'drop-shadow(1px 1px 0 rgba(0,0,0,0.15))' }}>{skill.icon}</div>
                <div style={{ color: '#000000', fontSize: 9, fontWeight: 900, textAlign: 'center', lineHeight: 1.2 }}>{skill.skill_name}</div>
                <div style={{
                  color: '#333333',
                  fontSize: 9, fontWeight: 900,
                }}>
                  {isOwned ? '보유' : (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <span>{skill.gold_cost}</span>
                      {getCommonSketchIcon('gold', 10)}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* 선택 스킬 정보 + 구매 */}
        {selected && (
          <div style={{ padding: '8px 12px 0', borderTop: '2.5px solid #000000' }}>
            <div style={{
              display: 'flex', alignItems: 'center', gap: 12,
              background: '#ffffff', border: '2.5px solid #000000', borderRadius: 10, padding: '10px 12px',
              marginBottom: 12, boxShadow: '2px 2px 0 #000000',
            }}>
              <div style={{ fontSize: 32 }}>{selected.icon}</div>
              <div style={{ flex: 1 }}>
                <div style={{ color: '#000000', fontWeight: 900, fontSize: 14 }}>{selected.skill_name}</div>
                <div style={{ color: '#555555', fontSize: 11, fontWeight: 700, marginTop: 2 }}>{selected.description}</div>
              </div>
              {selected.owned_level === 0 && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 3, color: '#000000', fontWeight: 900, fontSize: 14 }}>
                  <span>{selected.gold_cost}</span>
                  {getCommonSketchIcon('gold', 12)}
                </div>
              )}
            </div>
            <button
              onClick={handleBuy}
              disabled={!canBuy}
              style={{
                width: '100%', padding: '12px',
                background: canBuy ? '#FFB347' : '#cccccc',
                color: '#000000',
                border: '2.5px solid #000000', borderRadius: 8,
                fontWeight: 900, fontSize: 15, cursor: canBuy ? 'pointer' : 'not-allowed',
                marginBottom: 8,
                boxShadow: canBuy ? '3px 3px 0 #000000' : 'none',
                outline: 'none',
              }}>
              {selected.owned_level > 0 ? (
                '이미 보유 중'
              ) : canBuy ? (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
                  {getCommonSketchIcon('gold', 16)}
                  <span>구매하기</span>
                </div>
              ) : (
                `골드 부족 (${(selected.gold_cost - gold).toLocaleString()} 더 필요)`
              )}
            </button>
            <button
              onClick={handleClose}
              style={{
                width: '100%', padding: '10px',
                background: '#ffffff', color: '#000000',
                border: '2.5px solid #000000', borderRadius: 8,
                fontWeight: 900, fontSize: 13, cursor: 'pointer',
                boxShadow: '3px 3px 0 #000000',
                outline: 'none',
              }}>
              전투로 돌아가기
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

/* ── 아바타 선택 팝업 모달 ── */
interface AvatarItem {
  player_id: string;
  max_hp: number;
  base_speed: number;
  color_hex: string;
  unlocked: boolean;
  selected: boolean;
}

function AvatarSelectModalImpl() {
  const hud = useHud();
  const avatarLimit = Number(hud['/meta/avatarProfileLimit'] ?? 16);
  const players = ((resolveValue(hud['/avatar/players'], hud) as AvatarItem[]) ?? []).slice(0, avatarLimit);
  const selectedId = String(hud['/avatar/selectedId'] ?? 'default');
  
  // 현재 보고 있는(임시 선택) 캐릭터 ID (로컬 상태) - 훅은 조건문 위에 선언해야 함
  const [activeId, setActiveId] = React.useState<string>(selectedId);

  // 모달이 열릴 때 선택된 캐릭터 ID를 activeId에 동기화
  React.useEffect(() => {
    if (hud['/avatar/visible']) {
      setActiveId(selectedId);
    }
  }, [hud['/avatar/visible'], selectedId]);

  if (!hud['/avatar/visible']) return null;

  const close = () => window.dispatchEvent(new CustomEvent('avatar:close'));
  const equip = () => {
    if (!activeId || activeId === selectedId) return;
    window.dispatchEvent(new CustomEvent('avatar:select', { detail: activeId }));
  };

  const activeChar = players.find(p => p.player_id === activeId);
  const canEquip = Boolean(activeChar && activeId !== selectedId);

  return (
    <div style={{
      position: 'absolute', inset: 0, zIndex: 55,
      background: '#F4EFE6',
      display: 'flex', flexDirection: 'column', color: '#000000',
      fontFamily: '"Segoe UI", Roboto, Helvetica, Arial, sans-serif',
    }}>
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '12px 14px', borderBottom: '2.5px solid #000000', background: '#F4EFE6',
        flexShrink: 0,
      }}>
        <div style={{ fontWeight: 900, fontSize: 16, color: '#000000' }}>플레이어 정보</div>
        <SketchCloseButton onClick={close} />
      </div>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflowY: 'auto', padding: '12px 14px', minHeight: 0 }}>
        {/* 상단 메인 프리뷰 카드 */}
        {activeChar && (
          <div style={{
            background: '#ffffff',
            border: '2.5px solid #000000',
            boxShadow: '3px 3px 0 #000000',
            padding: 14,
            marginBottom: 16,
            display: 'flex',
            alignItems: 'center',
            gap: 16,
            color: '#000000',
          }}>
            <div style={{
              width: 80, height: 80,
              border: '2.5px solid #000000',
              boxShadow: '2px 2px 0 #000000',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: '#ffffff',
            }}>
              {renderAvatarIcon(64, false, activeChar.color_hex)}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 900, fontSize: 16, color: '#000000', textTransform: 'uppercase' }}>
                {activeChar.player_id === 'default' ? 'DEFAULT CUBE' : activeChar.player_id.replace('_', ' ')}
              </div>
              <div style={{ fontSize: 10, color: '#555555', marginTop: 2, marginBottom: 8, fontWeight: 700 }}>플레이어 ID: {activeChar.player_id}</div>
              
              {/* 스탯 표시 */}
              <div style={{ display: 'flex', gap: 14, fontSize: 11, fontWeight: 900 }}>
                <div>체력 <span style={{ color: '#FF4455' }}>{activeChar.max_hp}</span></div>
                <div>이속 <span style={{ color: '#FFE45C' }}>{activeChar.base_speed}</span></div>
              </div>
            </div>
          </div>
        )}

        {/* 프로필 사진들 탭 헤더 */}
        <div style={{ display: 'flex', borderBottom: '2px solid #000000', marginBottom: 12 }}>
          <div style={{ padding: '8px 16px', borderBottom: '3px solid #000000', fontWeight: 900, fontSize: 13, color: '#000000' }}>
            프로필 사진들
          </div>
        </div>

        {/* 프로필 16종 (4×4) */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: 10,
        }}>
          {players.map(p => {
            const isActive = p.player_id === activeId;
            const isEquipped = p.player_id === selectedId;
            return (
              <div 
                key={p.player_id}
                onClick={() => setActiveId(p.player_id)}
                style={{
                  aspectRatio: '1',
                  border: isActive ? '3px solid #000000' : '2px solid rgba(0,0,0,0.15)',
                  boxShadow: isActive ? '3px 3px 0 #000000' : 'none',
                  background: isEquipped ? '#FFFDF9' : '#ffffff',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  position: 'relative',
                  transform: isActive ? 'translate(-1px, -1px)' : 'none',
                }}
              >
                {renderAvatarIcon(36, false, p.color_hex)}
                {isEquipped && (
                  <div style={{
                    position: 'absolute',
                    bottom: 2,
                    background: '#FFE45C',
                    color: '#000000',
                    fontSize: 8,
                    fontWeight: 900,
                    padding: '1px 4px',
                    lineHeight: 1,
                    border: '1.5px solid #000000',
                  }}>사용중</div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div style={{
        display: 'flex', gap: 10, padding: '12px 14px',
        borderTop: '2.5px solid #000000', background: '#F4EFE6', flexShrink: 0,
      }}>
        <SketchSecondaryButton onClick={close} style={{ flex: 1 }}>
          나가기
        </SketchSecondaryButton>
        <SketchPrimaryButton
          onClick={equip}
          disabled={!canEquip}
          style={{
            flex: 1,
            opacity: canEquip ? 1 : 0.45,
            cursor: canEquip ? 'pointer' : 'not-allowed',
            boxShadow: canEquip ? '3px 3px 0 #000000' : 'none',
          }}
        >
          {activeId === selectedId ? '사용중' : '장착'}
        </SketchPrimaryButton>
      </div>
    </div>
  );
}

/* ── registry 맵 ── */
type RegistryFn = (props: Record<string, unknown>) => React.ReactElement | null;

export const registry: Record<string, RegistryFn> = {
  PrismHudTopBar:      () => <HudTopBarImpl />,
  PrismLobbyScreen:    () => <LobbyScreenImpl />,
  PrismSceneTransition:(p) => <SceneTransitionImpl visibleState={p['visibleState']} text={p['text']} />,
  PrismHudTimer:       (p) => <HudTimerImpl value={p['value']} />,
  PrismHudExpBar:      (p) => <HudExpBarImpl pct={p['pct']} level={p['level']} />,
  PrismHudKillCount:   (p) => <HudKillCountImpl value={p['value']} />,
  PrismHudGold:        (p) => <HudGoldImpl value={p['value']} />,
  PrismHudPlayerHp:    (p) => <HudPlayerHpImpl pct={p['pct']} />,
  PrismHudBossHp:      (p) => <HudBossHpImpl pct={p['pct']} bossName={p['bossName']} />,
  PrismHudPauseBtn:    (p) => <HudPauseBtnImpl action={p['action'] as string} />,
  PrismHudSkillSlots:  (p) => <HudSkillSlotsImpl slots={p['slots']} />,
  PrismHudBossWarning: () => <HudBossWarningImpl />,
  PrismPauseScreen:    () => <PauseScreenImpl />,
  PrismRushWarning:    () => <RushWarningImpl />,
  PrismBossIntro:      () => <BossIntroImpl />,
  PrismBossDeath:      () => <BossDeathImpl />,
  PrismTalentScreen:   (p) => <TalentScreenImpl items={p['items']} gold={p['gold']} />,
  PrismEquipScreen:    (p) => <EquipScreenImpl items={p['items']} gold={p['gold']} atk={p['atk']} hp={p['hp']} spd={p['spd']} />,
  PrismShopScreen:     (p) => <ShopScreenImpl cashKrw={p['cashKrw']} gems={p['gems']} metaGold={p['metaGold']} energy={p['energy']} supplyKeys={p['supplyKeys']} defensePity={p['defensePity']} purchasedGemIds={p['purchasedGemIds']} gemPacks={p['gemPacks']} goldPacks={p['goldPacks']} boxes={p['boxes']} maxEnergy={p['maxEnergy']} showResetButton={p['showResetButton']} testCashKrw={p['testCashKrw']} />,
  PrismChallengeScreen:(p) => <ChallengeScreenImpl items={p['items']} />,
  PrismEvolutionScreen:(p) => <EvolutionScreenImpl items={p['items']} gold={p['gold']} dna={p['dna']} />,
  PrismAdventureUp:    (p) => <AdventureUpImpl level={p['level']} rewardGem={p['rewardGem']} rewardGold={p['rewardGold']} />,
  PrismBattlePopup:    (p) => <BattlePopupImpl options={p['options']} selectedMult={p['selectedMult']} energy={p['energy']} />,
  PrismEnergyShop:     (p) => <EnergyShopImpl cur={p['cur']} gems={p['gems']} />,
  PrismLuckyTrain:     (p) => <LuckyTrainImpl gold={p['gold']} skills={p['skills']} selectedId={p['selectedId']} />,
  PrismSkillModal:     (p) => <SkillModalImpl cards={p['cards']} />,
  PrismResultScreen:   (p) => <ResultScreenImpl {...p} />,
  PrismAvatarSelect:   () => <AvatarSelectModalImpl />,
};
