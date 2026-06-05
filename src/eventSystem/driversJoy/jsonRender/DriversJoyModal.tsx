import React from 'react';
import { useSyncExternalStore } from 'react';
import { driversJoyStore } from '../store';

type Props = { onPurchase: () => void };

function RewardCard({ label }: { label: string }) {
  const cleanLabel = label.trim();
  const parts = cleanLabel.split(/\s+/);
  const iconPart = parts[0];
  const textPart = parts.slice(1).join(' ');

  let icon: React.ReactNode = null;
  let bg = '#FFFFFF';
  let badgeText = '';

  if (iconPart.includes('⚡')) {
    bg = '#FFF9C4'; // 번개 연노랑
    badgeText = '에너지 충전';
    icon = (
      <svg width="40" height="40" viewBox="0 0 24 24" fill="none" style={{ margin: '0 auto 4px', display: 'block' }}>
        <path d="M13,2 L3,14 L11,14 L9,22 L19,10 L11,10 Z" fill="#FFF176" stroke="#000000" strokeWidth="2.5" strokeLinejoin="round" />
        <path d="M11,5 L6,13 L10,13 L8,19 L16,10 L11,10 Z" fill="#FFFFFF" opacity="0.6" />
      </svg>
    );
  } else if (iconPart.includes('🪙')) {
    bg = '#FFE082'; // 골드 황토색
    badgeText = '자금 지원';
    icon = (
      <svg width="40" height="40" viewBox="0 0 24 24" fill="none" style={{ margin: '0 auto 4px', display: 'block' }}>
        <circle cx="10" cy="14" r="7" fill="#FFB300" stroke="#000000" strokeWidth="2.2" />
        <circle cx="10" cy="14" r="4.5" fill="#FFE082" stroke="#000000" strokeWidth="1.5" />
        <circle cx="15" cy="11" r="7" fill="#FFA000" stroke="#000000" strokeWidth="2.2" />
        <circle cx="15" cy="11" r="4.5" fill="#FFD54F" stroke="#000000" strokeWidth="1.5" />
      </svg>
    );
  } else if (iconPart.includes('🎁') || iconPart.includes('📦')) {
    bg = '#E1BEE7'; // 상자 연보라
    badgeText = '특수 보급';
    icon = (
      <svg width="40" height="40" viewBox="0 0 24 24" fill="none" style={{ margin: '0 auto 4px', display: 'block' }}>
        <path d="M 4 10 L 20 10 L 18 21 L 6 21 Z" fill="#FFE082" stroke="#000000" strokeWidth="2.5" strokeLinejoin="round" />
        <path d="M 2 6 L 22 6 L 22 10 L 2 10 Z" fill="#FFB300" stroke="#000000" strokeWidth="2.5" strokeLinejoin="round" />
        <rect x="11" y="6" width="2" height="15" fill="#FF5252" />
        <path d="M 8 3 C 10 1, 12 6, 12 6 C 12 6, 14 1, 16 3 Z" fill="#FF5252" stroke="#000000" strokeWidth="1.5" />
      </svg>
    );
  } else {
    bg = '#E8DFD1';
    icon = (
      <span style={{ fontSize: 24, display: 'block', margin: '4px 0' }}>🎁</span>
    );
  }

  return (
    <div style={{
      width: 82,
      background: bg,
      border: '2.5px solid #000000',
      borderRadius: 10,
      padding: '10px 4px 6px',
      boxShadow: '3px 3px 0 #000000',
      position: 'relative',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'space-between',
    }}>
      {badgeText && (
        <div style={{
          position: 'absolute', top: -7, left: '50%', transform: 'translateX(-50%)',
          background: '#000000', color: '#FFFFFF', fontSize: 7, fontWeight: 900,
          padding: '2px 5px', borderRadius: 4, whiteSpace: 'nowrap',
          border: '1px solid #000000',
        }}>
          {badgeText}
        </div>
      )}
      <div style={{ marginTop: badgeText ? 4 : 0 }}>
        {icon}
      </div>
      <div style={{
        fontSize: 10, fontWeight: 900, color: '#000000',
        textAlign: 'center', marginTop: 4, background: '#FFFFFF',
        border: '1.8px solid #000000', borderRadius: 5,
        padding: '2px 4px', width: '90%', whiteSpace: 'nowrap',
        boxShadow: '1px 1px 0 #000000',
      }}>
        {textPart || cleanLabel}
      </div>
    </div>
  );
}

function DriversJoyCar() {
  return (
    <div style={{ position: 'relative', display: 'inline-block', margin: '10px 0' }}>
      <svg width="120" height="70" viewBox="0 0 100 50" fill="none" style={{ display: 'block', margin: '0 auto' }}>
        <ellipse cx="50" cy="44" rx="42" ry="4" fill="rgba(0,0,0,0.15)" />
        <path d="M 12 18 L 4 14 L 6 22 Z" fill="#D32F2F" stroke="#000000" strokeWidth="2.5" strokeLinejoin="round" />
        <path d="M 4 14 L 18 17" stroke="#000000" strokeWidth="2" />
        <path d="M 10 32 L 18 20 C 22 14, 40 12, 50 12 L 72 15 C 80 17, 85 24, 90 28 L 94 32 Q 98 34 96 38 L 90 40 L 14 40 C 12 40, 10 36, 10 32 Z" fill="#FF5252" stroke="#000000" strokeWidth="2.8" strokeLinejoin="round" />
        <path d="M 24 22 Q 38 16 52 16 L 70 18" stroke="#FFCDD2" strokeWidth="2" strokeLinecap="round" />
        <path d="M 45 15 L 56 15 L 68 22 L 40 22 Z" fill="#E0F7FA" stroke="#000000" strokeWidth="2.2" strokeLinejoin="round" />
        <path d="M 38 18 L 42 15 L 44 22 L 36 22 Z" fill="#E0F7FA" stroke="#000000" strokeWidth="2" strokeLinejoin="round" />
        <polygon points="90,32 94,30 94,36 88,36" fill="#FFF59D" stroke="#000000" strokeWidth="2" />
        <path d="M 22 40 A 8 8 0 0 1 38 40" fill="none" stroke="#000000" strokeWidth="2.5" />
        <path d="M 68 40 A 8 8 0 0 1 84 40" fill="none" stroke="#000000" strokeWidth="2.5" />
        <circle cx="30" cy="40" r="7.5" fill="#37474F" stroke="#000000" strokeWidth="2.5" />
        <circle cx="30" cy="40" r="3" fill="#ECEFF1" stroke="#000000" strokeWidth="1.8" />
        <circle cx="76" cy="40" r="7.5" fill="#37474F" stroke="#000000" strokeWidth="2.5" />
        <circle cx="76" cy="40" r="3" fill="#ECEFF1" stroke="#000000" strokeWidth="1.8" />
      </svg>
      <span style={{ position: 'absolute', top: -5, right: -15, fontSize: 18 }}>✨</span>
      <span style={{ position: 'absolute', bottom: -5, left: -10, fontSize: 16 }}>💨</span>
    </div>
  );
}

export function DriversJoyModal({ onPurchase }: Props) {
  const snap = useSyncExternalStore(
    cb => driversJoyStore.subscribe(cb),
    () => driversJoyStore.getSnapshot(),
  );
  if (!snap['/driversJoy/modalOpen']) return null;

  const close = () => driversJoyStore.set('/driversJoy/modalOpen', false);
  const rewards = snap['/driversJoy/rewards'];
  const disabled = snap['/driversJoy/ctaDisabled'];

  return (
    <div
      style={{
        position: 'absolute', inset: 0, zIndex: 62, background: 'rgba(0,0,0,0.5)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', pointerEvents: 'auto',
      }}
      onClick={close}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          width: '92%', maxWidth: 340, display: 'flex', flexDirection: 'column',
          borderRadius: 8, border: '3px solid #000000', background: '#F4EFE6', color: '#000000',
          overflow: 'hidden', boxShadow: '4px 4px 0 #000000',
        }}
      >
        <div style={{
          background: '#3DDC84', padding: '12px 12px 10px', position: 'relative',
          borderBottom: '3px solid #000000',
        }}>
          <button
            type="button"
            onClick={close}
            style={{
              position: 'absolute', right: 10, top: 10,
              width: 26, height: 26, borderRadius: 6, border: '2px solid #000000', background: '#F4EFE6',
              fontWeight: 900, cursor: 'pointer', lineHeight: 1, padding: 0,
              boxShadow: '2px 2px 0 #000000',
            }}
          >
            ×
          </button>
          <div style={{ textAlign: 'center', paddingTop: 4 }}>
            <div style={{ fontWeight: 900, fontSize: 18, textShadow: '1px 1px 0 rgba(255,255,255,0.4)' }}>
              {snap['/driversJoy/title']}
            </div>
            <div style={{ fontSize: 11, fontWeight: 900, marginTop: 4 }}>⏱ {snap['/driversJoy/timerText']}</div>
          </div>
        </div>

        <div style={{ padding: '12px 12px 16px', textAlign: 'center', background: '#EDE5D8' }}>
          <div style={{
            background: '#FFE082', border: '2.5px solid #000000', borderRadius: 8,
            padding: '4px 8px', fontSize: 10, fontWeight: 900, display: 'inline-block',
            boxShadow: '1.5px 1.5px 0 #000000', textTransform: 'uppercase', marginBottom: 8,
          }}>
            🔥 1회 한정 특별 공급 🔥
          </div>

          <DriversJoyCar />

          <div style={{
            display: 'flex', gap: 10, justifyContent: 'center', marginTop: 14,
            paddingTop: 8, borderTop: '2px dashed rgba(0,0,0,0.15)'
          }}>
            {rewards.map((r, i) => (
              <RewardCard key={i} label={r.label ?? r.reward_type} />
            ))}
          </div>
        </div>

        <div style={{ padding: '10px 12px 14px', borderTop: '3px solid #000000', background: '#F4EFE6' }}>
          <div style={{ textAlign: 'center', fontSize: 11, fontWeight: 900, marginBottom: 8, color: '#333333' }}>
            구매 {snap['/driversJoy/remainingLabel']}
          </div>
          <button
            type="button"
            disabled={disabled}
            onClick={() => !disabled && onPurchase()}
            style={{
              width: '100%', padding: '10px 0', borderRadius: 8, border: '2px solid #000000',
              background: disabled ? '#cccccc' : '#3DDC84',
              color: '#000000', fontWeight: 900, fontSize: 17,
              cursor: disabled ? 'not-allowed' : 'pointer',
              boxShadow: disabled ? 'none' : '3px 3px 0 #000000',
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            }}
          >
            <div>{snap['/driversJoy/ctaLabel']}</div>
            {!disabled && (
              <div style={{ fontSize: 10, fontWeight: 500, marginTop: 1, opacity: 0.95 }}>
                즉시 활성화 및 특별 보상 수령 🚀
              </div>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
