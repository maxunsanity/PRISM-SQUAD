/**
 * equipUi.tsx — 장비 화면 UI (우리 스타일: 어두운 회색 + 단순 프레임)
 */
import React, { useEffect, useState } from 'react';
import type { EquipItem } from '../game/hudExternalStore';

export const GRADE_COLOR: Record<string, string> = {
  LEGEND: '#FF8A2A', EPIC: '#FFE45C', RARE: '#6BD5E8', COMMON: '#D4CFC5', EMPTY: '#E2D9C8',
};

export const GRADE_LABEL: Record<string, string> = {
  LEGEND: '전설', EPIC: '에픽', RARE: '레어', COMMON: '일반', EMPTY: '—',
};

const STAT_LABEL: Record<string, { short: string; name: string }> = {
  power: { short: 'ATK', name: '공격력' },
  hp:    { short: 'HP',  name: '체력' },
  speed: { short: 'SPD', name: '이속' },
};

/* ── 슬롯 종류 뱃지 ── */
export function renderSlotTypeBadge(slotId: string, size = 12) {
  const s = size;
  const wrap = (child: React.ReactNode) => (
    <div style={{
      width: s + 8, height: s + 8, borderRadius: 4,
      background: '#ffffff', border: '2px solid #000000',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      {child}
    </div>
  );
  const stroke = '#000000';
  switch (slotId) {
    case 'weapon':
      return wrap(
        <svg width={s} height={s} viewBox="0 0 24 24">
          <path d="M4 10h14l2 2h2v2h-3l-2 4h-3l1-5H8l-1 3H4z" fill={stroke} />
        </svg>,
      );
    case 'necklace':
      return wrap(
        <svg width={s} height={s} viewBox="0 0 24 24">
          <path d="M6 8c2 6 10 6 12 0M12 14l2 4h-4l2-4z" fill="none" stroke={stroke} strokeWidth="2" />
        </svg>,
      );
    case 'gloves':
      return wrap(
        <svg width={s} height={s} viewBox="0 0 24 24">
          <path d="M8 11h8v8H8zM10 6h1v5M13 5h1v6M16 6h1v5" fill="none" stroke={stroke} strokeWidth="2" strokeLinecap="round" />
        </svg>,
      );
    case 'armor':
      return wrap(
        <svg width={s} height={s} viewBox="0 0 24 24">
          <path d="M7 6h10l3 4v10H4V10l3-4z" fill="none" stroke={stroke} strokeWidth="2" />
        </svg>,
      );
    case 'belt':
      return wrap(
        <svg width={s} height={s} viewBox="0 0 24 24">
          <rect x="3" y="10" width="18" height="4" rx="1" fill={stroke} />
          <circle cx="12" cy="12" r="2" fill="#3a3a3a" stroke={stroke} strokeWidth="1" />
        </svg>,
      );
    case 'boots':
      return wrap(
        <svg width={s} height={s} viewBox="0 0 24 24">
          <path d="M7 5h5v12h8v4H7z" fill="none" stroke={stroke} strokeWidth="2" strokeLinejoin="round" />
        </svg>,
      );
    default:
      return wrap(<span style={{ color: stroke, fontSize: s - 2 }}>?</span>);
  }
}

/** slot_id가 기본 6종이 아닐 때 slot_name(NECKLACE 등)으로 뱃지·SVG 매핑 */
export function equipVisualSlotKind(slotId: string, slotName: string): string {
  const base = ['weapon', 'necklace', 'gloves', 'armor', 'belt', 'boots', 'weapon_shotgun', 'weapon_drill'];
  if (base.includes(slotId)) return slotId;
  const sn = String(slotName || '').toUpperCase();
  if (sn === 'WEAPON') return 'weapon';
  if (sn === 'NECKLACE') return 'necklace';
  if (sn === 'GLOVES') return 'gloves';
  if (sn === 'ARMOR') return 'armor';
  if (sn === 'BELT') return 'belt';
  if (sn === 'BOOTS') return 'boots';
  return slotId;
}

/* ── 장비 아이콘 (SVG + CSV emoji 폴백) ── */
export function renderEquipIcon(slotId: string, grade: string, size = 32, fallbackEmoji?: string) {
  const col = GRADE_COLOR[grade] ?? '#FFFFFF';
  const fs  = {};
  const knownSvg = ['weapon', 'necklace', 'gloves', 'armor', 'belt', 'boots', 'weapon_shotgun', 'weapon_drill'];
  if (fallbackEmoji && !knownSvg.includes(slotId)) {
    return (
      <span style={{ fontSize: Math.round(size * 0.78), lineHeight: 1, userSelect: 'none' }}>
        {fallbackEmoji}
      </span>
    );
  }

  // 샷건/드릴건: 총 실루엣 기준으로 구분
  if (slotId === 'weapon_shotgun') {
    return (
      <svg width={size} height={size} viewBox="0 0 32 32" style={fs}>
        <g stroke="#000000" strokeWidth="2.4" strokeLinecap="round" fill="none">
          <line x1="16" y1="16" x2="26" y2="9" stroke={col} />
          <line x1="16" y1="16" x2="28" y2="16" stroke={col} />
          <line x1="16" y1="16" x2="26" y2="23" stroke={col} />
          <line x1="16" y1="16" x2="22" y2="6" />
          <line x1="16" y1="16" x2="22" y2="26" />
        </g>
        <circle cx="12" cy="16" r="4" fill="none" stroke="#000000" strokeWidth="2.4" />
      </svg>
    );
  }
  if (slotId === 'weapon_drill') {
    return (
      <svg width={size} height={size} viewBox="0 0 32 32" style={fs}>
        {/* 바디 */}
        <path d="M6 11 L20 11 L22 13 L22 19 L15 19 L13.5 24 L9.5 24 L10.5 19 L6 19 Z"
          fill={col} stroke="#000000" strokeWidth="2.4" strokeLinejoin="round" strokeLinecap="round" />
        {/* 드릴 총구(원뿔/나선) */}
        <path d="M22 14 L28 16 L22 18 Z" fill="none" stroke="#000000" strokeWidth="2.4" strokeLinejoin="round" />
        <line x1="23" y1="16" x2="27.2" y2="16" stroke="#000000" strokeWidth="1.8" strokeLinecap="round" />
        <line x1="24" y1="15" x2="26.5" y2="16" stroke="#000000" strokeWidth="1.2" strokeLinecap="round" />
        {/* 트리거 */}
        <line x1="12.5" y1="19" x2="11.2" y2="22.8" stroke="#000000" strokeWidth="2" strokeLinecap="round" />
      </svg>
    );
  }

  switch (slotId) {
    case 'weapon':
      return (
        <svg width={size} height={size} viewBox="0 0 32 32" style={fs}>
          <path d="M 5 10 L 24 10 L 24 15 L 16 15 L 15 20 L 10 20 L 11 15 L 5 15 Z"
            fill={col} stroke="#000000" strokeWidth="2.6" strokeLinejoin="round" strokeLinecap="round" />
          <line x1="24" y1="12.5" x2="28" y2="12.5" stroke="#000000" strokeWidth="2.6" strokeLinecap="round" />
          <circle cx="9" cy="12.5" r="1.4" fill="#000000" />
        </svg>
      );
    case 'necklace':
      return (
        <svg width={size} height={size} viewBox="0 0 32 32" style={fs}>
          <path d="M 6 8 C 10 20, 22 20, 26 8" fill="none" stroke="#000000" strokeWidth="3" strokeLinecap="round" />
          <polygon points="16,16 20,22 16,28 12,22" fill={col} stroke="#000000" strokeWidth="2.5" />
          <circle cx="16" cy="22" r="2.5" fill="#000000" />
        </svg>
      );
    case 'gloves':
      return (
        <svg width={size} height={size} viewBox="0 0 32 32" style={fs}>
          <rect x="9" y="12" width="14" height="15" rx="3" fill={col} stroke="#000000" strokeWidth="3" />
          <line x1="9" y1="17" x2="23" y2="17" stroke="#000000" strokeWidth="2.5" />
          <rect x="11" y="6" width="3" height="6" rx="1.5" fill="#000000" />
          <rect x="14.5" y="5" width="3" height="7" rx="1.5" fill="#000000" />
          <rect x="18" y="6" width="3" height="6" rx="1.5" fill="#000000" />
        </svg>
      );
    case 'armor':
      return (
        <svg width={size} height={size} viewBox="0 0 32 32" style={fs}>
          <path d="M 8 7 L 24 7 L 28 13 L 24 27 L 8 27 L 4 13 Z" fill={col} stroke="#000000" strokeWidth="3" />
          <line x1="8"  y1="13" x2="24" y2="13" stroke="#000000" strokeWidth="2.5" />
          <line x1="16" y1="7"  x2="16" y2="27" stroke="#000000" strokeWidth="2" strokeDasharray="3 3" />
        </svg>
      );
    case 'belt':
      return (
        <svg width={size} height={size} viewBox="0 0 32 32" style={fs}>
          <line x1="4" y1="16" x2="28" y2="16" stroke="#000000" strokeWidth="5.5" strokeLinecap="round" />
          <polygon points="16,10 22,16 16,22 10,16" fill={col} stroke="#000000" strokeWidth="2.5" />
          <circle cx="16" cy="16" r="2.5" fill="#000000" />
        </svg>
      );
    case 'boots':
      return (
        <svg width={size} height={size} viewBox="0 0 32 32" style={fs}>
          <path d="M 8 6 L 14 6 L 14 18 L 26 22 L 26 26 L 8 26 Z" fill={col} stroke="#000000" strokeWidth="3" strokeLinejoin="round" />
          <line x1="14" y1="12" x2="8" y2="15" stroke="#000000" strokeWidth="2.5" />
          <line x1="14" y1="16" x2="8" y2="19" stroke="#000000" strokeWidth="2.5" />
        </svg>
      );
    default:
      if (fallbackEmoji) {
        return (
          <span style={{ fontSize: Math.round(size * 0.78), lineHeight: 1, userSelect: 'none' }}>
            {fallbackEmoji}
          </span>
        );
      }
      return <span>＋</span>;
  }
}

/* ── 스탯 아이콘 ── */
function StatIcon({ statType }: { statType: string }) {
  const col = '#000000';
  if (statType === 'hp') {
    return (
      <svg width={18} height={18} viewBox="0 0 24 24">
        <path d="M12 21s-7-4.5-7-11a4 4 0 0 1 7-2 4 4 0 0 1 7 2c0 6.5-7 11-7 11z"
          fill="#FF4455" stroke={col} strokeWidth="2.5" />
      </svg>
    );
  }
  if (statType === 'speed') {
    return (
      <svg width={18} height={18} viewBox="0 0 24 24">
        <path d="M7 5h5v12h8v4H7z" fill="none" stroke={col} strokeWidth="2.5" />
      </svg>
    );
  }
  return (
    <svg width={18} height={18} viewBox="0 0 24 24">
      <line x1="4"  y1="20" x2="20" y2="4"  stroke={col} strokeWidth="3"   strokeLinecap="round" />
      <line x1="14" y1="4"  x2="20" y2="4"  stroke={col} strokeWidth="2"   strokeLinecap="round" />
      <line x1="20" y1="4"  x2="20" y2="10" stroke={col} strokeWidth="2"   strokeLinecap="round" />
    </svg>
  );
}

/* ── 레벨업 VFX ── */
const PARTICLE_ANGLES = Array.from({ length: 18 }, (_, i) => (i / 18) * 360);
const STAR_ANGLES     = [30, 95, 150, 210, 285, 340];

function EquipLevelUpVfx({ active, accent }: { active: boolean; accent: string }) {
  if (!active) return null;
  return (
    <div className="equip-lv-vfx-root" aria-hidden>
      <div className="equip-lv-vfx-flash" style={{ boxShadow: `0 0 24px ${accent}` }} />
      <div className="equip-lv-vfx-ring"  style={{ borderColor: accent }} />
      <div className="equip-lv-vfx-ring equip-lv-vfx-ring--late" />
      <div className="equip-lv-vfx-label">LEVEL UP!</div>
      {PARTICLE_ANGLES.map((deg, i) => (
        <span
          key={`p-${deg}`}
          className="equip-lv-vfx-particle"
          style={{
            ['--a' as string]: `${deg}deg`,
            ['--d' as string]: `${44 + (i % 3) * 12}px`,
            background:  i % 2 === 0 ? accent : '#FFD600',
            boxShadow:   `0 0 6px ${accent}`,
            animationDelay: `${i * 0.02}s`,
          }}
        />
      ))}
      {STAR_ANGLES.map((deg, i) => (
        <span
          key={`s-${deg}`}
          className="equip-lv-vfx-star"
          style={{
            ['--a' as string]: `${deg}deg`,
            ['--d' as string]: `${32 + (i % 2) * 8}px`,
            color: accent,
            animationDelay: `${0.05 + i * 0.04}s`,
          }}
        >
          ✦
        </span>
      ))}
    </div>
  );
}

/* ══════════════════════════════════════════
   장비 상세 팝업 (우리 스타일)
══════════════════════════════════════════ */
export function EquipDetailPopup({
  item, gold, onClose, onEquip, onUpgrade, onUnequip, readOnly = false,
}: {
  item: EquipItem;
  gold: number;
  onClose:   () => void;
  onEquip:   () => void;
  onUpgrade: () => void;
  onUnequip: () => void;
  /** 이벤트 보상 미리보기 — 장착/레벨업 숨김 */
  readOnly?: boolean;
}) {
  const gc        = GRADE_COLOR[item.grade]  ?? '#aaa';
  const gradeName = GRADE_LABEL[item.grade]  ?? item.grade;
  const stat      = STAT_LABEL[item.stat_type] ?? STAT_LABEL.power;
  const maxed      = item.next_cost <= 0;
  const canUpgrade = !maxed && gold >= item.next_cost;

  const [lvVfx,    setLvVfx]    = useState(false);
  const [modalPulse, setModalPulse] = useState(false);

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | undefined;
    const onSuccess = (e: Event) => {
      const d = (e as CustomEvent<{ slotId: string }>).detail;
      if (d?.slotId !== item.slot_id) return;
      setLvVfx(true);
      setModalPulse(true);
      if (timer) clearTimeout(timer);
      timer = setTimeout(() => { setLvVfx(false); setModalPulse(false); }, 900);
    };
    window.addEventListener('equip:upgradeSuccess', onSuccess);
    return () => {
      window.removeEventListener('equip:upgradeSuccess', onSuccess);
      if (timer) clearTimeout(timer);
    };
  }, [item.slot_id]);

  const fmtGold = (n: number) => n >= 1000 ? `${(n / 1000).toFixed(1)}K` : String(n);

  return (
    <div
      role="dialog"
      style={{
        position: 'absolute', inset: 0, zIndex: 55,
        background: 'rgba(0,0,0,0.5)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '12px 10px 72px',
        pointerEvents: 'auto',
      }}
      onClick={onClose}
    >
      <div
        className={modalPulse ? 'equip-lv-modal-pulse' : undefined}
        style={{
          width: '100%', maxWidth: 340, maxHeight: '90%',
          background: '#F4EFE6',
          border: '3px solid #000000',
          borderRadius: 8,
          boxShadow: '4px 4px 0 #000000',
          overflow: 'hidden',
          display: 'flex', flexDirection: 'column',
          fontFamily: '"Segoe UI", Roboto, sans-serif',
          color: '#000000',
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* ── 헤더 바 ── */}
        <div style={{
          background: '#F4EFE6',
          borderBottom: '2.5px solid #000000',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '10px 12px',
          flexShrink: 0,
        }}>
          {/* 등급 뱃지 */}
          <div style={{
            background: gc, color: '#000000',
            fontSize: 11, fontWeight: 900, padding: '3px 10px',
            border: '2px solid #000000',
            borderRadius: 12,
            boxShadow: '1px 1px 0 #000000',
          }}>
            {gradeName}
          </div>
          {/* 아이템 이름 */}
          <div style={{ flex: 1, textAlign: 'center', fontSize: 16, fontWeight: 900, color: '#000000', paddingLeft: 8, paddingRight: 8 }}>
            {item.item_name}
          </div>
          {/* 닫기 버튼 */}
          <button
            type="button"
            onClick={onClose}
            style={{
              background: '#ffffff', border: '2px solid #000000', borderRadius: 6,
              color: '#000000', fontSize: 16, width: 30, height: 30,
              cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
              outline: 'none', flexShrink: 0,
              boxShadow: '1.5px 1.5px 0 #000000',
            }}
          >
            ✕
          </button>
        </div>

        {/* ── 아이콘 + 스탯 정보 ── */}
        <div style={{
          display: 'flex', gap: 12, padding: '14px 14px 10px',
          alignItems: 'flex-start', flexShrink: 0,
        }}>
          {/* 아이콘 박스 */}
          <div style={{ position: 'relative', flexShrink: 0 }}>
            <div
              className={lvVfx ? 'equip-lv-icon-pop' : undefined}
              style={{
                position: 'relative', width: 90, height: 90,
                background: '#ffffff',
                border: '3px solid #000000',
                borderRadius: 8,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '2.5px 2.5px 0 #000000',
                transition: 'border-color 0.15s, box-shadow 0.15s',
              }}
            >
              {renderEquipIcon(item.slot_id, item.grade, 56, item.icon)}
              <EquipLevelUpVfx active={lvVfx} accent={gc} />
            </div>
            {/* 슬롯 뱃지 좌상단 */}
            <div style={{ position: 'absolute', top: -6, left: -6 }}>
              {renderSlotTypeBadge(equipVisualSlotKind(item.slot_id, item.slot_name), 14)}
            </div>
            {/* 레벨 표시 */}
            <div style={{
              marginTop: 6, textAlign: 'center',
              fontSize: 11, fontWeight: 900, color: '#000000',
            }}>
              레벨: {item.current_level}/{item.max_level}
            </div>
          </div>

          {/* 우측 정보 */}
          <div style={{ flex: 1 }}>
            {/* 스탯 박스 */}
            <div style={{
              background: '#ffffff', border: '2px solid #000000', borderRadius: 6,
              padding: '8px 10px', marginBottom: 8,
              display: 'flex', alignItems: 'center', gap: 8,
              boxShadow: '2px 2px 0 #000000',
            }}>
              <StatIcon statType={item.stat_type} />
              <span style={{ fontWeight: 900, fontSize: 13, color: '#000000' }}>{stat.short}</span>
              <span style={{ marginLeft: 'auto', fontWeight: 900, fontSize: 20, color: '#000000' }}>
                {item.current_stat.replace(/^[A-Z]+\s+/, '')}
              </span>
            </div>

            {/* 설명 */}
            <div style={{ fontSize: 11, color: '#333333', lineHeight: 1.5, marginBottom: 6, fontWeight: 700 }}>
              {item.description}
            </div>

            {/* 슬롯 타입 뱃지 */}
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 5,
              background: '#ffffff', border: '2.5px solid #000000',
              borderRadius: 6, padding: '3px 8px',
              fontSize: 10, fontWeight: 900, color: '#000000',
              boxShadow: '1.5px 1.5px 0 #000000',
            }}>
              {renderSlotTypeBadge(item.slot_id, 10)}
              <span>{item.slot_name}</span>
            </div>
          </div>
        </div>

        {/* ── 등급 스킬 ── */}
        <div style={{ padding: '0 14px 10px', flex: 1, overflowY: 'auto', minHeight: 0 }}>
          <div style={{ fontWeight: 900, fontSize: 12, color: '#000000', marginBottom: 6 }}>등급 스킬</div>
          {[
            { col: '#6BD5E8', label: `${stat.name} +10%`,   locked: false },
            { col: '#D4CFC5', label: '추가 효과 (준비 중)',  locked: true  },
            { col: '#FFE45C', label: '강화 효과 (준비 중)',  locked: true  },
            { col: '#FF8A2A', label: `${stat.name} +15%`,   locked: true  },
          ].map((sk, i) => (
            <div key={i} style={{
              display: 'flex', alignItems: 'center', gap: 8, marginBottom: 5,
              background: '#ffffff', border: '2px solid #000000', borderRadius: 6,
              padding: '7px 10px',
              boxShadow: '1.5px 1.5px 0 #000000',
            }}>
              <div style={{
                width: 22, height: 22, borderRadius: 4,
                background: sk.locked ? '#E8DFD1' : sk.col,
                border: '2px solid #000000',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 11,
              }}>
                {sk.locked ? '🔒' : '✓'}
              </div>
              <span style={{ fontSize: 11, fontWeight: 900, color: sk.locked ? '#555555' : '#000000' }}>
                {sk.label}
              </span>
            </div>
          ))}
        </div>

        {/* ── 업그레이드 비용 ── */}
        {!readOnly && !maxed && (
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
            padding: '6px 14px',
            borderTop: '2px solid #000000',
            fontSize: 13, fontWeight: 900, color: '#000000',
            flexShrink: 0,
          }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="10" fill="#FFE45C" stroke="#000000" strokeWidth="2" />
              <text x="12" y="16" textAnchor="middle" fontSize="11" fill="#000000" fontWeight="900">G</text>
            </svg>
            <span>{fmtGold(gold)} / {item.next_cost}</span>
          </div>
        )}
        {!readOnly && maxed && (
          <div style={{
            textAlign: 'center', padding: '6px 14px',
            fontSize: 12, fontWeight: 900, color: '#000000',
            borderTop: '2px solid #000000', flexShrink: 0,
          }}>
            MAX LEVEL
          </div>
        )}

        {/* ── 하단 버튼 바 ── */}
        {!readOnly && (
        <div style={{
          display: 'flex', gap: 8, padding: '10px 12px',
          background: '#F4EFE6', borderTop: '2.5px solid #000000',
          flexShrink: 0,
        }}>
          {/* 장착 / 장착됨 버튼 */}
          <button
            type="button"
            disabled={item.equipped}
            onClick={() => { if (!item.equipped) onEquip(); }}
            style={{
              flex: 1, padding: '13px 6px',
              background: item.equipped ? '#E8DFD1' : '#ffffff',
              border: '2.5px solid #000000',
              borderRadius: 8,
              color: '#000000',
              fontFamily: '"Segoe UI", Roboto, sans-serif',
              fontSize: 14, fontWeight: 900,
              cursor: item.equipped ? 'default' : 'pointer',
              outline: 'none',
              boxShadow: item.equipped ? 'none' : '2.5px 2.5px 0 #000000',
            }}
          >
            {item.equipped ? '장착됨' : '장착'}
          </button>

          {/* 레벨업 버튼 */}
          <button
            type="button"
            disabled={!canUpgrade}
            onClick={() => { if (canUpgrade) onUpgrade(); }}
            style={{
              flex: 1, padding: '13px 6px',
              background: canUpgrade ? '#FFB347' : '#E8DFD1',
              border: '2.5px solid #000000',
              borderRadius: 8,
              color: '#000000',
              fontFamily: '"Segoe UI", Roboto, sans-serif',
              fontSize: 14, fontWeight: 900,
              cursor: canUpgrade ? 'pointer' : 'not-allowed',
              outline: 'none',
              boxShadow: canUpgrade ? '2.5px 2.5px 0 #000000' : 'none',
              transform: lvVfx ? 'scale(0.96)' : 'scale(1)',
              transition: 'transform 0.1s',
            }}
          >
            레벨업
          </button>
        </div>
        )}

        {/* ── 장비 해제 버튼 (equipped일 때만) ── */}
        {!readOnly && item.equipped && (
          <div style={{
            padding: '8px 12px 12px',
            background: '#F4EFE6',
            flexShrink: 0,
          }}>
            <button
              type="button"
              onClick={onUnequip}
              style={{
                width: '100%', padding: '10px',
                background: '#ffffff',
                border: '2.5px solid #000000',
                borderRadius: 8,
                color: '#000000',
                fontFamily: '"Segoe UI", Roboto, sans-serif',
                fontSize: 13, fontWeight: 900,
                cursor: 'pointer',
                outline: 'none',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                boxShadow: '2.5px 2.5px 0 #000000',
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path d="M7 6h10l3 4v10H4V10l3-4z" fill="none" stroke="#000000" strokeWidth="2" />
                <line x1="9" y1="3" x2="15" y2="3" stroke="#000000" strokeWidth="2" strokeLinecap="round" />
                <line x1="8" y1="14" x2="16" y2="14" stroke="#000000" strokeWidth="2" strokeLinecap="round" />
              </svg>
              장비 해제
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
