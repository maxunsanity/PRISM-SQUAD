/**
 * Monopoly GO 레퍼런스형 이벤트 UI (타이쿤 캡슐 · 우측 토너먼트 탭 · 순위판 · 헬프)
 */
import React, { useSyncExternalStore, useEffect, useRef, useState } from 'react';
import { hudStore } from '../../../game/hudExternalStore';
import { EventRedDot } from '../../../jsonRender/eventRedDot';
import { pickScopeRedDot } from '../../../game/redDot/redDotUi';
import { EVENT_ANCHOR } from './eventHudAnchors';
import { EVENT_CAPSULE_BODY_MIN_H, EVENT_MILEAGE_WRAP_PAD, eventSideTabShellStyle, EVENT_SIDE_TAB_ICON } from './eventHudLayout';
import type { EventData, EventHelpAcquireRow, EventKind } from '../data';
import { getEventAsset, getRankRewardForRank } from '../data';
import { TYCOON_ALL_COMPLETE_MSG } from '../core/EventController';
import { eventStore, type MilestoneRow, type TournamentBotRow } from '../store/eventExternalStore';
import { scaleRewardQtyLabel } from '../core/rewardLabelScale';

export function openEventHelp(kind: 'tycoon' | 'season') {
  window.dispatchEvent(new CustomEvent('event:openHelp', { detail: kind }));
}

export function EventInfoButton({ onClick, size = 28 }: { onClick: () => void; size?: number }) {
  return (
    <button
      type="button"
      onClick={e => { e.stopPropagation(); onClick(); }}
      style={{
        width: size, height: size, borderRadius: '12px', border: '2px solid #fff',
        background: 'linear-gradient(180deg,#222,#111)', color: '#ddd',
        fontWeight: 900, fontSize: size * 0.55, cursor: 'pointer', flexShrink: 0,
        boxShadow: '0 4px 12px rgba(0,0,0,0.6)', lineHeight: 1, padding: 0,
      }}
      aria-label="도움말"
    >
      i
    </button>
  );
}

function avatarColor(name: string): string {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) % 360;
  return `hsl(${h}, 55%, 45%)`;
}

export function EventIcon({ data, assetKey, size, style: customStyle }: { data: EventData; assetKey: string; size: number; style?: React.CSSProperties }) {
  const asset = getEventAsset(data, assetKey);
  if (!asset) return <span style={{ fontSize: size * 0.7 }}>?</span>;

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    window.dispatchEvent(new CustomEvent('event:showTooltip', { detail: { assetKey } }));
  };

  const style: React.CSSProperties = {
    objectFit: 'cover',
    display: 'block',
    cursor: 'pointer',
    width: size,
    height: size,
    borderRadius: '50%',
    overflow: 'hidden',
    background: '#ffffff',
    ...customStyle,
  };

  if (asset.asset_type === 'icon' && asset.url) {
    return (
      <img
        src={asset.url}
        alt=""
        style={style}
        onClick={handleClick}
      />
    );
  }
  return (
    <span
      style={{ fontSize: size * 0.65, lineHeight: 1, cursor: 'pointer' }}
      onClick={handleClick}
    >
      {asset.fallback_text || '◆'}
    </span>
  );
}

function sectionTitleStyle(): React.CSSProperties {
  return {
    fontWeight: 900, fontSize: 14, textAlign: 'center', marginBottom: 8, marginTop: 4,
    background: '#e8dfd1',
    border: '2px solid #000000',
    borderRadius: 6, padding: '4px 8px',
    color: '#000000',
  };
}

/** CSV reward_label(예: 1장) × 입장(번개) 배수 */
export function scaleAcquireRewardLabel(label: string, ticketMult: number): string {
  return scaleRewardQtyLabel(label, ticketMult);
}

/** 메인 이벤트 창 공통 — 재화 획득 방법(미션) 블록 */
export function EventAcquireRulesSection({
  data,
  eventKind,
  ticketMult = 1,
  compact = false,
}: {
  data: EventData;
  eventKind: EventKind;
  ticketMult?: number;
  compact?: boolean;
}) {
  const help = data.helpByKind.get(eventKind);
  const acquireRows = data.helpAcquireByKind.get(eventKind) ?? [];
  if (acquireRows.length === 0) return null;

  return (
    <div style={{ marginBottom: compact ? 8 : 12 }}>
      <div style={sectionTitleStyle()}>
        {help?.acquire_section_title || '재화 획득 방법'}
      </div>
      {acquireRows.map(row => (
        <HelpAcquireRuleCard
          key={`${row.target_type}-${row.sort_order}`}
          data={data}
          row={row}
          compact={compact}
          ticketMult={ticketMult}
        />
      ))}
      {help?.body_1 ? (
        <div style={{ fontSize: 10, opacity: 0.88, padding: '0 4px', lineHeight: 1.4, color: '#f5f5f5' }}>
          · {help.body_1}
          {help.body_2 ? <> · {help.body_2}</> : null}
          {ticketMult > 1 ? <> · 현재 입장 배수 ×{ticketMult}</> : null}
        </div>
      ) : null}
    </div>
  );
}

function HelpAcquireRuleCard({
  data,
  row,
  compact = false,
  ticketMult = 1,
}: {
  data: EventData;
  row: EventHelpAcquireRow;
  compact?: boolean;
  ticketMult?: number;
}) {
  const isBoss = row.target_type === 'boss';
  const huntText = isBoss
    ? '보스 1마리 사냥'
    : `일반 몬스터 ${row.kills_required}마리 사냥`;
  const rewardLabel = scaleAcquireRewardLabel(row.reward_label, ticketMult);

  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 8,
      background: '#FFFFFF',
      borderRadius: 8, border: '2px solid #000000',
      padding: compact ? '8px 6px' : '10px 8px', marginBottom: compact ? 6 : 10,
      boxShadow: '2px 2px 0 #000000',
      color: '#000000',
    }}>
      <div style={{
        width: compact ? 44 : 52, height: compact ? 44 : 52, borderRadius: 6, background: '#F4EFE6',
        border: '2px solid #000000', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
      }}>
        <EventIcon data={data} assetKey={row.left_icon_key} size={compact ? 32 : 38} />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontWeight: 900, fontSize: 14, marginBottom: 2, color: '#000000' }}>{row.row_title}</div>
        <div style={{ fontSize: 12, lineHeight: 1.3, fontWeight: 700, color: '#000000', opacity: 0.9 }}>{huntText}</div>
      </div>
      <div style={{ fontSize: 20, fontWeight: 900, color: '#000000', flexShrink: 0 }}>→</div>
      <div style={{
        width: 56, flexShrink: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2,
        background: '#FFB347', borderRadius: 6, padding: '6px 4px', border: '1.5px solid #000000',
        color: '#000000',
      }}>
        <EventIcon data={data} assetKey={row.reward_icon_key} size={36} />
        <span style={{ fontWeight: 900, fontSize: 13, color: '#000000' }}>{rewardLabel}</span>
        <span style={{ fontSize: 9, fontWeight: 700, opacity: 0.8 }}>획득</span>
      </div>
    </div>
  );
}

export function EventHelpPopup({
  data,
  visible,
  kind,
}: {
  data: EventData;
  visible: boolean;
  kind: string;
}) {
  const ticketMult = useSyncExternalStore(
    cb => eventStore.subscribe(cb),
    () => Number(eventStore.getSnapshot()['/event/ticketMultiplier'] ?? 1),
    () => 1,
  );
  if (!visible) return null;
  const eventKind: EventKind = kind === 'season' ? 'SEASON_TOURNAMENT' : 'TYCOON_MILEAGE';
  const help = data.helpByKind.get(eventKind);
  if (!help) return null;

  const acquireRows = data.helpAcquireByKind.get(eventKind) ?? [];
  const eventBoard = eventKind === 'SEASON_TOURNAMENT' ? data.seasonEvent : data.tycoonEvent;
  const displayTitle = eventBoard?.event_name || help.title;
  const tips = [help.body_1, help.body_2, help.body_3, help.body_4].filter(Boolean);

  return (
    <div
      style={{
        position: 'absolute', inset: 0, zIndex: 60, background: 'rgba(0,0,0,0.5)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', pointerEvents: 'auto',
      }}
      onClick={() => window.dispatchEvent(new CustomEvent('event:closeHelp'))}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          width: '92%', maxWidth: 340, maxHeight: '88%', display: 'flex', flexDirection: 'column',
          borderRadius: 8, border: '3px solid #000000',
          background: '#F4EFE6',
          color: '#000000', overflow: 'hidden', boxShadow: '4px 4px 0 #000000',
        }}
      >
        <div style={{
          background: '#FFB347', padding: '12px 12px 10px', position: 'relative', flexShrink: 0,
          borderBottom: '3px solid #000000',
        }}>
          <button
            type="button"
            onClick={() => window.dispatchEvent(new CustomEvent('event:closeHelp'))}
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
            <div style={{
              fontWeight: 900, fontSize: 18, color: '#000000',
            }}>
              {displayTitle}
            </div>
            <div style={{ fontSize: 12, fontWeight: 900, marginTop: 4, color: '#000000', opacity: 0.9 }}>{help.subtitle}</div>
          </div>
        </div>

        <div style={{ flex: 1, overflow: 'auto', padding: '12px 12px 4px', minHeight: 0 }}>
          <div style={{
            fontWeight: 900, fontSize: 15, textAlign: 'center', marginBottom: 10,
            background: '#e8dfd1', color: '#000000', border: '2px solid #000000', borderRadius: 6, padding: '6px 8px',
          }}>
            {help.acquire_section_title || '재화 획득 방법'}
          </div>

          {acquireRows.length > 0 ? (
            acquireRows.map(row => (
              <HelpAcquireRuleCard
                key={`${row.target_type}-${row.sort_order}`}
                data={data}
                row={row}
                ticketMult={ticketMult}
              />
            ))
          ) : (
            <div style={{ fontSize: 13, textAlign: 'center', opacity: 0.8, color: '#000000' }}>획득 규칙 CSV를 확인하세요.</div>
          )}

          <div style={{
            marginTop: 4, fontSize: 11, lineHeight: 1.45, color: '#000000',
            background: '#FFFFFF', border: '2px solid #000000', borderRadius: 8, padding: '8px 10px',
          }}>
            {tips.map((t, i) => (
              <div key={i} style={{ marginBottom: i < tips.length - 1 ? 4 : 0, fontWeight: 700 }}>· {t}</div>
            ))}
          </div>
        </div>

        <div style={{ padding: '8px 12px 12px', flexShrink: 0 }}>
          <button
            type="button"
            onClick={() => window.dispatchEvent(new CustomEvent('event:closeHelp'))}
            style={{
              width: '100%', padding: '11px 0', borderRadius: 8, border: '2px solid #000000',
              background: '#FFB347',
              color: '#000000', fontWeight: 900, fontSize: 16, cursor: 'pointer', boxShadow: '2px 2px 0 #000000',
            }}
          >
            확인
          </button>
        </div>
      </div>
    </div>
  );
}


/** ×N 배수 칩 — 모노폴리 GO 우하단 배수 뱃지 */
export function MultiplierChip({ mult }: { mult: number }) {
  if (mult <= 1) return null;
  return (
    <div style={{
      display: 'inline-flex', alignItems: 'center', gap: 3,
      background: 'linear-gradient(135deg,#FF8A2A,#E65100)',
      color: '#fff', fontWeight: 900, fontSize: 15, borderRadius: 20,
      padding: '5px 14px', boxShadow: '0 2px 8px rgba(0,0,0,0.35)',
      border: '2px solid rgba(255,255,255,0.5)', flexShrink: 0,
    }}>
      ×{mult}
    </div>
  );
}

/** 몬스터 처치 카드 — 모노폴리 "타일 카드" 대체 */
export function KillRewardCards({ data, themeKey: _themeKey, ticketMult = 1 }: {
  data: EventData;
  themeKey: string;
  ticketMult?: number;
}) {
  /* 표시할 몬스터: 기본(basic), 강적(bloater), 보스(final_boss) 3종 */
  const targets = [
    { key: 'basic',      label: '기본 몬스터', emoji: '👾', bgColor: '#E3F2FD', accent: '#1565C0' },
    { key: 'bloater',    label: '강적',        emoji: '💢', bgColor: '#FFF3E0', accent: '#E65100' },
    { key: 'final_boss', label: '보스',        emoji: '💀', bgColor: '#FCE4EC', accent: '#B71C1C' },
  ];

  return (
    <div>
      <div style={{
        fontWeight: 900, fontSize: 13, textAlign: 'center',
        margin: '8px 0 6px', color: '#fff', textShadow: '0 1px 3px rgba(0,0,0,0.5)',
      }}>
        몬스터를 처치하세요
      </div>
      <div style={{ display: 'flex', gap: 6, justifyContent: 'center', marginBottom: 6 }}>
        {targets.map(t => {
          const row = data.killRewards.get(t.key);
          if (!row) return null;
          const tycoonEarn = row.tycoon_point_base * ticketMult;
          const seasonEarn = row.season_point_base * ticketMult;
          return (
            <div key={t.key} style={{
              flex: 1, background: t.bgColor, borderRadius: 12,
              border: `2px solid ${t.accent}`, padding: '8px 4px',
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
              boxShadow: '0 2px 6px rgba(0,0,0,0.18)',
            }}>
              <div style={{ fontSize: 22 }}>{t.emoji}</div>
              <div style={{ fontSize: 10, fontWeight: 800, color: t.accent, textAlign: 'center', lineHeight: 1.2 }}>
                {t.label}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 3, width: '100%', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 3, fontWeight: 900, fontSize: 11, color: '#FF8A2A' }}>
                  <EventIcon data={data} assetKey="tycoon_coin" size={14} />
                  +{tycoonEarn}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 3, fontWeight: 900, fontSize: 11, color: '#7BE8F4' }}>
                  <EventIcon data={data} assetKey="season_coin" size={14} />
                  +{seasonEarn}
                </div>
              </div>
            </div>
          );
        })}
      </div>
      {/* 배수 안내 */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        background: 'rgba(0,0,0,0.22)', borderRadius: 10, padding: '6px 10px',
        fontSize: 11, color: '#ffe0b2', fontWeight: 700, marginBottom: 6,
      }}>
        <span>입장권 배수로 더 많이 획득하세요</span>
        <MultiplierChip mult={ticketMult} />
      </div>
    </div>
  );
}

/** 순위 행 — TP 진행 바 포함 */
function RankRow({
  r, data, eventId, pointIconKey, rowPlayerBg: _rowPlayerBg, isPlayer,
}: {
  r: TournamentBotRow;
  data: EventData;
  eventId: number;
  pointIconKey: string;
  rowPlayerBg: string;
  isPlayer: boolean;
}) {
  const reward = getRankRewardForRank(data, eventId, r.rank);
  const maxPts = 5000;
  const barPct = Math.min(100, (r.points / maxPts) * 100);

  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 6, padding: '6px 8px', marginBottom: 6,
      borderRadius: 8,
      background: isPlayer ? '#7BE8F4' : '#ffffff',
      border: isPlayer ? '2.5px solid #000000' : '2px solid #000000',
      boxShadow: isPlayer ? '3px 3px 0 #000000' : '2px 2px 0 #000000',
      color: '#000000',
    }}>
      <div style={{ width: 20, textAlign: 'center', fontWeight: 900, fontSize: 11, color: '#000000', flexShrink: 0 }}>
        {r.rank}
      </div>
      <div style={{
        width: 26, height: 26, borderRadius: '50%', background: avatarColor(r.name),
        border: '2px solid #000000', flexShrink: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 11, fontWeight: 900, color: '#fff',
      }}>
        {r.name.slice(0, 1)}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 11, fontWeight: 900, color: '#000000', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {r.name}{isPlayer ? ' (나)' : ''}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 2 }}>
          <EventIcon data={data} assetKey={pointIconKey} size={12} style={{ background: '#ffffff', borderRadius: '50%' }} />
          <span style={{ fontWeight: 900, fontSize: 11, color: '#000000', minWidth: 32 }}>
            {r.points.toLocaleString()}
          </span>
          <div style={{ flex: 1, height: 6, borderRadius: 3, background: '#FFFFFF', border: '1.5px solid #000000', overflow: 'hidden' }}>
            <div style={{ width: `${barPct}%`, height: '100%', background: '#FFB347', borderRight: barPct > 0 && barPct < 100 ? '1.5px solid #000000' : 'none' }} />
          </div>
        </div>
      </div>
      {reward ? (
        <div style={{ display: 'flex', gap: 4, flexShrink: 0 }}>
          {reward.dice_label ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', background: '#FFFFFF', border: '1.5px solid #000000', borderRadius: 6, padding: '2px 4px', minWidth: 32, boxShadow: '1px 1px 0 #000000' }}>
              <EventIcon data={data} assetKey="reward_energy" size={12} style={{ background: '#ffffff', borderRadius: '50%' }} />
              <span style={{ fontSize: 7, fontWeight: 800, color: '#000000' }}>{reward.dice_label}</span>
            </div>
          ) : null}
          {reward.token_label ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', background: '#FFB347', border: '1.5px solid #000000', borderRadius: 6, padding: '2px 4px', minWidth: 32, boxShadow: '1px 1px 0 #000000' }}>
              <EventIcon data={data} assetKey="season_coin" size={12} style={{ background: '#FFB347', borderRadius: '50%' }} />
              <span style={{ fontSize: 7, fontWeight: 800, color: '#000000' }}>{reward.token_label}</span>
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

export function EventTournamentBoardModal({
  data,
  visible,
  ended,
  rows,
  playerRank: _playerRank,
  className,
  classSubtitle,
  seasonName,
  pointIconKey,
  themeKey: _themeKey,
  ticketMult: _ticketMult = 1,
  onClose,
  onCollect,
  onInfo,
  seasonGaugePoints = 0,
  seasonGaugeTarget = 1,
}: {
  data: EventData;
  visible: boolean;
  ended: boolean;
  rows: TournamentBotRow[];
  playerRank: number;
  className: string;
  classSubtitle: string;
  seasonName: string;
  pointIconKey: string;
  themeKey: string;
  ticketMult?: number;
  onClose: () => void;
  onCollect?: () => void;
  onInfo?: () => void;
  seasonPoints?: number;
  nextMilestonePoint?: number;
  seasonGaugePoints?: number;
  seasonGaugeTarget?: number;
}) {
  if (!visible) return null;

  const modalBorder = '#000000';
  const modalBg = '#F4EFE6';
  const rowPlayerBg = '#7BE8F4';
  const heroUrl = getEventAsset(data, 'tournament_hero')?.url ?? '/event/assets/tournament_hero.png';
  const eventId = data.seasonEvent?.event_id ?? 10002;
  const showRows = rows.slice(0, 50);
  const myRow = showRows.find(r => r.isPlayer);
  const otherRows = showRows.filter(r => !r.isPlayer);
  // 바·숫자 모두 현재 마일스톤 "구간" 기준(단계 넘으면 0부터). seasonGaugePoints / seasonGaugeTarget.
  const pct = Math.min(100, (seasonGaugePoints / Math.max(1, seasonGaugeTarget)) * 100);

  return (
    <div
      style={{
        position: 'absolute', inset: 0, zIndex: 55, background: 'rgba(0,0,0,0.55)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', pointerEvents: 'auto',
      }}
      onClick={onClose}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          width: '94%', maxWidth: 360, maxHeight: '92%', display: 'flex', flexDirection: 'column',
          borderRadius: 18, border: `4px solid ${modalBorder}`, background: modalBg,
          boxShadow: '6px 6px 0 #000000', overflow: 'hidden',
        }}
      >
        {/* 상단 헤더 이미지 */}
        <div style={{ position: 'relative', flexShrink: 0 }}>
          <div style={{ width: '100%', height: 130, overflow: 'hidden', background: '#87CEEB', borderBottom: '3px solid #000000' }}>
            <img src={heroUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center top' }} />
            <div style={{
              position: 'absolute', top: 8, left: 10, right: 10,
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            }}>
              <EventInfoButton onClick={() => onInfo?.()} size={28} />
              <button
                type="button"
                onClick={e => { e.stopPropagation(); }}
                style={{
                  width: 28, height: 28, borderRadius: '50%', border: '2px solid #000000',
                  background: '#FFB347', color: '#000000', fontWeight: 900, fontSize: 16,
                  cursor: 'pointer', boxShadow: '1.5px 1.5px 0 #000000',
                  lineHeight: 1, padding: 0,
                }}
              >
                🏆
              </button>
            </div>
          </div>

          <div style={{ textAlign: 'center', padding: '10px 12px 4px', background: modalBg }}>
            <div style={{
              fontWeight: 900, fontSize: 22, lineHeight: 1.1, color: '#000000',
            }}>
              {className || seasonName}
            </div>
            {classSubtitle ? (
              <div style={{ fontSize: 12, color: '#000000', marginTop: 4, fontWeight: 900, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 3 }}>
                <EventIcon data={data} assetKey="season_coin" size={13} style={{ background: '#ffffff', borderRadius: '50%' }} />
                {classSubtitle}
              </div>
            ) : null}
            {ended ? (
              <div style={{ marginTop: 4, fontWeight: 900, fontSize: 14, color: '#B71C1C' }}>
                이벤트가 종료되었습니다!
              </div>
            ) : null}
          </div>
        </div>

        <div style={{ flex: 1, overflow: 'auto', padding: '4px 8px 4px', minHeight: 0 }}>
          {/* 게이지 바 컨테이너 */}
          <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '4px 8px 12px', boxSizing: 'border-box' }}>
            <div style={{ width: '100%', maxWidth: 320, position: 'relative', display: 'flex', alignItems: 'center', height: 48 }}>
              
              {/* 좌측 동그란 획득 재화 뱃지 */}
              <div style={{
                width: 44, height: 44, borderRadius: '50%',
                background: '#ffffff', border: '2px solid #000000',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                zIndex: 10, position: 'absolute', left: 0,
                boxShadow: '2px 2px 0 #000000',
              }}>
                <EventIcon data={data} assetKey={pointIconKey} size={38} style={{ background: '#ffffff', borderRadius: '50%' }} />
              </div>

              {/* 중앙 게이지 바 트랙 */}
              <div style={{
                flex: 1, height: 22, background: '#FFFFFF',
                borderRadius: 11, border: '2px solid #000000',
                position: 'relative', overflow: 'hidden', margin: '0 20px',
              }}>
                <div style={{
                  width: `${pct}%`, height: '100%',
                  background: '#3DDC84',
                  borderRight: pct > 0 && pct < 100 ? '2px solid #000000' : 'none',
                  transition: 'width 0.2s',
                }} />
                <div style={{
                  position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: '#000000', fontWeight: 900, fontSize: 11,
                }}>
                  {seasonGaugePoints}/{seasonGaugeTarget}
                </div>
              </div>

              {/* 우측 자물쇠 보상 뱃지 */}
              <div style={{
                width: 48, height: 48, borderRadius: '50%',
                background: '#ffffff', border: '2px solid #000000',
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                zIndex: 10, position: 'absolute', right: 0,
                boxShadow: '2px 2px 0 #000000',
              }}>
                <EventIcon data={data} assetKey="reward_lock" size={42} style={{ background: '#ffffff', borderRadius: '50%' }} />
              </div>

            </div>
          </div>

          <div style={sectionTitleStyle()}>
            {data.helpByKind.get('SEASON_TOURNAMENT')?.mission_section_title || '순위 경쟁'}
          </div>
          
          {/* 순위 리스트 */}
          <div style={{ maxHeight: '210px', overflowY: 'auto', paddingRight: '2px', marginBottom: '8px' }}>
            {otherRows.map(r => (
              <React.Fragment key={`${r.rank}-${r.name}`}>
                <RankRow
                  r={r}
                  data={data}
                  eventId={eventId}
                  pointIconKey={pointIconKey}
                  rowPlayerBg={rowPlayerBg}
                  isPlayer={false}
                />
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

        {/* 내 순위 고정 */}
        {myRow ? (
          <div style={{ padding: '8px 12px', flexShrink: 0, background: '#e8dfd1', borderTop: '3px solid #000000' }}>
            <RankRow r={myRow} data={data} eventId={eventId} pointIconKey={pointIconKey} rowPlayerBg={rowPlayerBg} isPlayer />
          </div>
        ) : null}

        <div style={{ padding: '6px 12px 12px', flexShrink: 0, borderTop: '1px solid rgba(0,0,0,0.1)' }}>
          {ended ? (
            <button
              type="button"
              onClick={onCollect}
              style={{
                width: '100%', padding: '10px 0', borderRadius: 12, border: '2.5px solid #000000',
                background: '#3DDC84', color: '#000000',
                fontWeight: 900, fontSize: 16, cursor: 'pointer',
                boxShadow: '3px 3px 0 #000000',
                outline: 'none', transition: 'transform 0.1s, box-shadow 0.1s',
              }}
              onMouseDown={e => { e.currentTarget.style.transform = 'translate(1.5px, 1.5px)'; e.currentTarget.style.boxShadow = '1.5px 1.5px 0 #000000'; }}
              onMouseUp={e => { e.currentTarget.style.transform = 'translate(0px, 0px)'; e.currentTarget.style.boxShadow = '3px 3px 0 #000000'; }}
            >
              수집
            </button>
          ) : (
            <button
              type="button"
              onClick={onClose}
              style={{
                width: '100%', padding: '10px 0', borderRadius: 12, border: '2.5px solid #000000',
                background: '#FFB347', color: '#000000',
                fontWeight: 900, fontSize: 15, cursor: 'pointer',
                boxShadow: '3px 3px 0 #000000',
                outline: 'none', transition: 'transform 0.1s, box-shadow 0.1s',
              }}
              onMouseDown={e => { e.currentTarget.style.transform = 'translate(1.5px, 1.5px)'; e.currentTarget.style.boxShadow = '1.5px 1.5px 0 #000000'; }}
              onMouseUp={e => { e.currentTarget.style.transform = 'translate(0px, 0px)'; e.currentTarget.style.boxShadow = '3px 3px 0 #000000'; }}
            >
              닫기
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export function EventTournamentSideTab({
  data,
  themeKey: _themeKey,
  seasonName,
  playerRank,
  onOpen,
}: {
  data: EventData;
  themeKey: string;
  seasonName: string;
  playerRank: number;
  onOpen: () => void;
}) {
  const border = '#000000';
  const bg = '#F4EFE6';
  const iconUrl = getEventAsset(data, 'tournament_tab_icon')?.url ?? getEventAsset(data, 'tournament_hero')?.url ?? '';

  const icon = EVENT_SIDE_TAB_ICON;
  const seasonDot = useSyncExternalStore(
    cb => hudStore.subscribe(cb),
    () => pickScopeRedDot(hudStore.getSnapshot(), 'season'),
  );
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onOpen}
      style={eventSideTabShellStyle({ background: bg, borderColor: border })}
    >
      <div style={{
        position: 'relative',
        width: icon.size, height: icon.size, margin: '0 auto', borderRadius: '50%', overflow: 'visible',
        border: icon.border, background: icon.bg,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        boxShadow: icon.shadow,
      }}>
        <EventRedDot show={seasonDot !== null} category={seasonDot ?? undefined} />
        {iconUrl ? (
          <img src={iconUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', background: '#FFB347' }} />
        ) : (
          <span style={{ fontSize: 24, background: '#FFB347' }}>🏆</span>
        )}
      </div>
      <div style={{
        marginTop: 6, fontSize: 9, fontWeight: 900, color: '#000000', lineHeight: 1.1,
        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
      }}>
        {seasonName.slice(0, 6)}
      </div>
      <div style={{
        marginTop: 5, fontSize: 10, fontWeight: 900,
        background: '#FFFFFF',
        borderRadius: 6, padding: '2px 4px',
        color: '#000000', border: '1.5px solid #000000',
        boxShadow: '1.5px 1.5px 0 #000000',
        display: 'inline-block',
      }}>
        #{playerRank || '-'}
      </div>
    </div>
  );
}

/** Monopoly GO 스타일 상단 마일리지 캡슬 바 */
export function MonopolyMileageCapsule({
  data, name, gaugePoints, gaugeTarget, currencyKey, rewardKey, rewardLabel,
  timerText, ticketMult: _ticketMult, lastTpGain: _lastTpGain, onOpenMilestones,
  allMilestonesComplete = false, lap = 1,
}: {
  data: EventData; name: string; points: number; nextPoint: number;
  /** 바 채움용 — 현재 단계 구간 (표시 숫자와 분리) */
  gaugePoints: number; gaugeTarget: number;
  currencyKey: string; rewardKey: string; rewardLabel: string;
  timerText: string; ticketMult: number; lastTpGain: number;
  onOpenMilestones: () => void;
  allMilestonesComplete?: boolean;
  lap?: number;
}) {
  const fillTarget = Math.max(1, gaugeTarget);
  const fillPct = allMilestonesComplete
    ? 100
    : Math.min(100, (gaugePoints / fillTarget) * 100);
  /** 단계 달성 연출 중에만 덮어씀 — 평소엔 fillPct(store) 직결 */
  const [tierAnimPct, setTierAnimPct] = useState<number | null>(null);
  const barPct = tierAnimPct ?? fillPct;
  const [gaugeSuck, setGaugeSuck] = useState(false);
  const [currencySuck, setCurrencySuck] = useState(false);
  const [rewardKeyShown, setRewardKeyShown] = useState(rewardKey);
  const [rewardLabelShown, setRewardLabelShown] = useState(rewardLabel);
  const [rewardSwap, setRewardSwap] = useState<'idle' | 'out' | 'in'>('idle');
  const tierBusyRef = useRef(false);
  const lapRef = useRef(lap);

  useEffect(() => {
    if (lap === lapRef.current) return;
    lapRef.current = lap;
    tierBusyRef.current = false;
    setTierAnimPct(null);
    setRewardKeyShown(rewardKey);
    setRewardLabelShown(rewardLabel);
  }, [lap, rewardKey, rewardLabel]);

  const tycoonDot = useSyncExternalStore(
    cb => hudStore.subscribe(cb),
    () => pickScopeRedDot(hudStore.getSnapshot(), 'tycoon'),
  );

  useEffect(() => {
    if (!tierBusyRef.current && rewardSwap === 'idle') {
      setRewardKeyShown(rewardKey);
      setRewardLabelShown(rewardLabel);
    }
  }, [rewardKey, rewardLabel, rewardSwap]);

  useEffect(() => {
    const onAbsorb = () => {
      if (tierBusyRef.current) return;
      setGaugeSuck(true);
      setCurrencySuck(true);
      window.setTimeout(() => {
        setGaugeSuck(false);
        setCurrencySuck(false);
      }, 780);
    };

    const onTier = (e: Event) => {
      const d = (e as CustomEvent<{
        nextAssetKey?: string;
        nextLabel?: string;
        allComplete?: boolean;
        earnedAssetKey?: string;
      }>).detail;
      tierBusyRef.current = true;
      setGaugeSuck(true);
      if (d?.allComplete) {
        setTierAnimPct(100);
        setRewardKeyShown(d.earnedAssetKey || d.nextAssetKey || rewardKey);
        setRewardLabelShown(TYCOON_ALL_COMPLETE_MSG);
        setRewardSwap('idle');
        tierBusyRef.current = false;
        setGaugeSuck(false);
        return;
      }
      setTierAnimPct(100);
      window.setTimeout(() => {
        setRewardSwap('out');
        window.setTimeout(() => {
          setRewardKeyShown(d?.nextAssetKey || rewardKey);
          setRewardLabelShown(d?.nextLabel || rewardLabel);
          setRewardSwap('in');
          setTierAnimPct(0);
          window.setTimeout(() => {
            setTierAnimPct(null);
            setRewardSwap('idle');
            tierBusyRef.current = false;
            setGaugeSuck(false);
          }, 320);
        }, 220);
      }, 280);
    };

    const onLapReset = () => {
      tierBusyRef.current = false;
      setTierAnimPct(null);
      setGaugeSuck(false);
    };

    window.addEventListener('event:tycoonGaugeAbsorb', onAbsorb);
    window.addEventListener('event:tycoonMilestoneComplete', onTier);
    window.addEventListener('event:tycoonLapReset', onLapReset);
    return () => {
      window.removeEventListener('event:tycoonGaugeAbsorb', onAbsorb);
      window.removeEventListener('event:tycoonMilestoneComplete', onTier);
      window.removeEventListener('event:tycoonLapReset', onLapReset);
    };
  }, [rewardKey, rewardLabel]);

  return (
    <div style={{
      width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', pointerEvents: 'auto',
      padding: `${EVENT_MILEAGE_WRAP_PAD.top}px ${EVENT_MILEAGE_WRAP_PAD.sides}px ${EVENT_MILEAGE_WRAP_PAD.bottom}px`,
      boxSizing: 'border-box',
    }}>
      <div
        role="button"
        tabIndex={0}
        onClick={onOpenMilestones}
        style={{
          width: '100%', maxWidth: 320, position: 'relative', cursor: 'pointer',
          display: 'flex', alignItems: 'center',
          background: '#F4EFE6', border: '2.5px solid #000000', borderRadius: '24px',
          padding: '16px 14px 14px', boxShadow: '3px 3px 0 #000000', boxSizing: 'border-box',
          minHeight: EVENT_CAPSULE_BODY_MIN_H,
        }}
      >
        {/* 상단 걸치기 타이틀 (이벤트 이름 뱃지) */}
        <div style={{
          position: 'absolute', top: -12, left: '50%', transform: 'translateX(-50%)',
          background: '#FFB347', border: '2px solid #000000', borderRadius: 14,
          padding: '3px 12px', fontWeight: 900, fontSize: 11, color: '#000000',
          boxShadow: '2px 2px 0 #000000', whiteSpace: 'nowrap', zIndex: 15,
        }}>
          {name}
        </div>

        {/* 좌측 동그란 획득 재화 뱃지 */}
        <div
          className={currencySuck ? 'event-currency-icon-suck' : ''}
          style={{
            width: 40, height: 40, borderRadius: '50%',
            background: '#ffffff', border: '2px solid #000000',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0, boxShadow: '1px 1px 0 #000000', overflow: 'hidden',
            transform: 'translateZ(0)',
          }}
        >
          <EventIcon data={data} assetKey={currencyKey} size={36} style={{ background: '#ffffff', borderRadius: '50%' }} />
        </div>

        {/* 중앙 게이지 바 트랙 */}
        <div
          data-event-anchor={EVENT_ANCHOR.tycoonGauge}
          className={gaugeSuck ? 'event-gauge-track-suck' : ''}
          style={{
            flex: 1, height: 18, background: '#FFFFFF',
            borderRadius: 9, border: '2px solid #000000',
            position: 'relative', overflow: 'hidden', margin: '0 6px',
          }}
        >
          <div
            className="event-mileage-bar-fill"
            style={{
              width: `${barPct}%`, height: '100%',
              background: '#3DDC84',
              borderRight: barPct > 0 && barPct < 100 ? '2px solid #000000' : 'none',
              transition: tierAnimPct !== null ? 'width 0.28s ease-out' : 'width 0.45s ease-out',
            }}
          />
          <div style={{
            position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#000000', fontWeight: 900, fontSize: allMilestonesComplete ? 7 : 10,
            padding: allMilestonesComplete ? '0 6px' : 0,
            textAlign: 'center', lineHeight: 1.15,
          }}>
            {allMilestonesComplete ? TYCOON_ALL_COMPLETE_MSG : `${gaugePoints}/${gaugeTarget}`}
          </div>
        </div>

        {/* 우측 동그란 다음 보상 뱃지 */}
        <div
          data-event-anchor={EVENT_ANCHOR.tycoonReward}
          className={rewardSwap === 'out' ? 'event-reward-badge-swap-out' : rewardSwap === 'in' ? 'event-reward-badge-swap-in' : ''}
          style={{
            width: 44, height: 44, borderRadius: '50%',
            background: '#ffffff', border: '2px solid #000000',
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0, position: 'relative', boxShadow: '1px 1px 0 #000000',
            transform: 'translateZ(0)',
            transformOrigin: 'center center',
            overflow: 'visible',
          }}
        >
          <EventRedDot show={tycoonDot !== null} category={tycoonDot ?? undefined} style={{ top: -2, right: -2 }} />
          <div style={{ width: '100%', height: '100%', borderRadius: '50%', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <EventIcon data={data} assetKey={rewardKeyShown} size={40} style={{ background: '#ffffff', borderRadius: '50%' }} />
          </div>
          {rewardLabelShown && !allMilestonesComplete ? (
            <span style={{
              fontSize: 8, fontWeight: 900, color: '#000000',
              background: '#FFB347', borderRadius: 6,
              padding: '1px 4px', position: 'absolute', bottom: -4, zIndex: 12,
              lineHeight: 1, border: '1.5px solid #000000',
              boxShadow: '1px 1px 0 #000000',
            }}>
              {rewardLabelShown.replace('×', '')}
            </span>
          ) : null}
        </div>

        {/* 하단 걸치기 타이머 */}
        {timerText ? (
          <div style={{
            position: 'absolute', bottom: -10, left: '50%', transform: 'translateX(-50%)',
            background: '#F4EFE6', color: '#000000', fontSize: 9, fontWeight: 900,
            padding: '2px 10px', borderRadius: 10, whiteSpace: 'nowrap', zIndex: 15,
            border: '2px solid #000000', boxShadow: '2px 2px 0 #000000',
            letterSpacing: '0.5px',
          }}>
            ⏱ {timerText}
          </div>
        ) : null}
      </div>
    </div>
  );
}

/** 타이쿤 메인 이벤트 창 — 획득 방법 + 마일스톤 미션 한 화면 */
export function EventTycoonMainModal({
  data,
  visible,
  onClose,
  eventName,
  gaugePoints,
  gaugeTarget,
  timerText,
  milestoneRows,
  themeKey: _themeKey,
  ticketMult = 1,
  allMilestonesComplete = false,
}: {
  data: EventData;
  visible: boolean;
  onClose: () => void;
  eventName: string;
  points: number;
  nextPoint: number;
  gaugePoints: number;
  gaugeTarget: number;
  timerText: string;
  milestoneRows: MilestoneRow[];
  themeKey: string;
  ticketMult?: number;
  allMilestonesComplete?: boolean;
}) {
  if (!visible) return null;

  const help = data.helpByKind.get('TYCOON_MILEAGE');
  const pct = allMilestonesComplete
    ? 100
    : Math.min(100, (gaugePoints / Math.max(1, gaugeTarget)) * 100);
  
  const nextMilestone = milestoneRows.find(r => r.status === 'locked') || milestoneRows[milestoneRows.length - 1];
  const rewardKey = nextMilestone?.reward_asset_key || 'reward_dice';
  const rewardLabel = nextMilestone?.reward_label || '';

  return (
    <div
      style={{
        position: 'absolute', inset: 0, zIndex: 1, background: 'rgba(0,0,0,0.5)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', pointerEvents: 'auto',
      }}
      onClick={onClose}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          width: '94%', maxWidth: 360, maxHeight: '88%', display: 'flex', flexDirection: 'column',
          borderRadius: 8, border: '3px solid #000000',
          background: '#F4EFE6',
          color: '#000000', overflow: 'hidden', boxShadow: '4px 4px 0 #000000',
        }}
      >
        <div style={{
          background: '#FFB347', borderBottom: '3px solid #000000', padding: '12px 12px 10px', flexShrink: 0,
        }}>
          <button
            type="button"
            onClick={onClose}
            style={{
              position: 'absolute', right: 22, marginTop: -2,
              width: 26, height: 26, borderRadius: 6, border: '2px solid #000000', background: '#F4EFE6',
              color: '#000000', fontWeight: 900, cursor: 'pointer', lineHeight: 1, padding: 0, zIndex: 2,
              boxShadow: '2px 2px 0 #000000',
            }}
          >
            ×
          </button>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontWeight: 900, fontSize: 20, color: '#000000' }}>{eventName}</div>
            <div style={{ fontSize: 12, fontWeight: 900, marginTop: 4, marginBottom: 8, color: '#000000' }}>{help?.subtitle || '타이쿤 이벤트'}</div>
            
            {/* 개편된 타이쿤 상세 모달용 둥근 게이지 바 */}
            <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '0 8px 6px', boxSizing: 'border-box' }}>
              <div style={{ width: '100%', maxWidth: 320, position: 'relative', display: 'flex', alignItems: 'center', height: 48 }}>
                
                {/* 좌측 동그란 획득 재화 뱃지 */}
                <div style={{
                  width: 44, height: 44, borderRadius: '50%',
                  background: '#F4EFE6',
                  border: '2.5px solid #000000',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  zIndex: 10, position: 'absolute', left: 0,
                  boxShadow: '2px 2px 0 #000000',
                }}>
                  <div style={{ width: '100%', height: '100%', borderRadius: '50%', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <EventIcon data={data} assetKey={data.tycoonEvent?.currency_asset_key || 'tycoon_coin'} size={44} />
                  </div>
                </div>

                {/* 중앙 게이지 바 트랙 */}
                <div style={{
                  flex: 1, height: 22, background: '#FFFFFF',
                  borderRadius: 11, border: '2.5px solid #000000',
                  position: 'relative', overflow: 'hidden',
                  margin: '0 20px 0 20px',
                }}>
                  <div style={{
                    width: `${pct}%`, height: '100%',
                    background: '#FFB347',
                    borderRight: pct > 0 && pct < 100 ? '2px solid #000000' : 'none',
                    transition: 'width 0.2s',
                  }} />
                  <div style={{
                    position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: '#000000', fontWeight: 900, fontSize: allMilestonesComplete ? 8 : 11,
                    padding: allMilestonesComplete ? '0 8px' : 0,
                    textAlign: 'center', lineHeight: 1.15,
                  }}>
                    {allMilestonesComplete ? TYCOON_ALL_COMPLETE_MSG : `${gaugePoints}/${gaugeTarget}`}
                  </div>
                </div>

                {/* 우측 동그란 다음 보상 뱃지 */}
                <div style={{
                  width: 48, height: 48, borderRadius: '50%',
                  background: '#F4EFE6',
                  border: '2.5px solid #000000',
                  display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                  zIndex: 10, position: 'absolute', right: 0,
                  boxShadow: '2px 2px 0 #000000',
                }}>
                  <div style={{ width: '100%', height: '100%', borderRadius: '50%', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <EventIcon data={data} assetKey={rewardKey} size={48} />
                  </div>
                  {rewardLabel && !allMilestonesComplete ? (
                    <span style={{
                      fontSize: 8, fontWeight: 900, color: '#000000',
                      background: '#FFB347', borderRadius: 5,
                      padding: '0px 4px', position: 'absolute', bottom: -2, zIndex: 12,
                      lineHeight: 1, border: '1.5px solid #000000',
                    }}>
                      {rewardLabel.replace('×', '')}
                    </span>
                  ) : null}
                </div>

              </div>
            </div>

            {timerText ? <div style={{ fontSize: 11, marginTop: 4, fontWeight: 900, color: '#000000' }}>⏱ {timerText}</div> : null}
          </div>
        </div>

        <div style={{ flex: 1, overflow: 'auto', padding: '10px 10px 4px', minHeight: 0 }}>
          <EventAcquireRulesSection data={data} eventKind="TYCOON_MILEAGE" ticketMult={ticketMult} compact />

          <div style={sectionTitleStyle()}>
            {help?.mission_section_title || '마일스톤 미션'}
          </div>
          {milestoneRows.map(r => (
            <div
              key={r.step}
              style={{
                display: 'flex', alignItems: 'center', gap: 8, padding: '8px 6px', marginBottom: 6,
                borderRadius: 8,
                background: r.status === 'claimed' ? '#e8dfd1' : '#FFFFFF',
                border: '2px solid #000000',
                boxShadow: r.status === 'claimed' ? 'none' : '2px 2px 0 #000000',
                opacity: r.status === 'claimed' ? 0.7 : 1,
                color: '#000000',
              }}
            >
              <span style={{
                width: 32, height: 32, borderRadius: '50%', background: '#FFB347', color: '#000000',
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: 13, flexShrink: 0,
                border: '1.5px solid #000000',
              }}>
                {r.step}
              </span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 12, fontWeight: 900 }}>목표 {r.required_point} TP</div>
                <div style={{ fontSize: 10, fontWeight: 700, opacity: 0.8 }}>{r.status === 'claimed' ? '수령 완료' : '달성 시 보상'}</div>
              </div>
              <EventIcon data={data} assetKey={r.reward_asset_key} size={28} />
              <span style={{ fontSize: 11, fontWeight: 900, minWidth: 36, textAlign: 'right' }}>{r.reward_label}</span>
              {r.status === 'claimed' ? <span style={{ fontWeight: 900, color: '#000000', marginLeft: 4 }}>✓</span> : null}
            </div>
          ))}
        </div>

        <div style={{ padding: '8px 12px 12px', flexShrink: 0 }}>
          <button
            type="button"
            onClick={onClose}
            style={{
              width: '100%', padding: '11px 0', borderRadius: 8, border: '2px solid #000000',
              background: '#FFB347', color: '#000000',
              boxShadow: '2px 2px 0 #000000',
              fontWeight: 900, fontSize: 16, cursor: 'pointer',
            }}
          >
            닫기
          </button>
        </div>
      </div>
    </div>
  );}

export function useEventHudSnap() {
  return eventStore.getSnapshot();
}
