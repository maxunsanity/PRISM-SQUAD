/**
 * NavTabBar.tsx — 하단 탭바 (상점/장비/전투/도전/진화) 공통
 */
import { useSyncExternalStore } from 'react';
import { hudStore } from '../game/hudExternalStore';
import { hasNavTabRedDot, pickNavTabRedDot } from '../game/redDot/redDotUi';
import { EventRedDot } from './eventRedDot';

export type NavTabKey = 'shop' | 'equip' | 'battle' | 'challenge' | 'evolution';

function renderTabIcon(key: string, active: boolean, size = 20) {
  const strokeCol = active ? '#000000' : '#888888';

  switch (key) {
    case 'shop':
      return (
        <svg width={size} height={size} viewBox="0 0 24 24">
          <polygon points="4,9 12,3 20,9" fill="none" stroke={strokeCol} strokeWidth="2.5" />
          <rect x="5" y="9" width="14" height="11" fill="none" stroke={strokeCol} strokeWidth="2.5" />
          <rect x="10" y="13" width="4" height="7" fill={strokeCol} />
        </svg>
      );
    case 'equip':
      return (
        <svg width={size} height={size} viewBox="0 0 24 24">
          <path d="M 4 4 L 20 4 L 20 12 C 20 18, 12 22, 12 22 C 12 22, 4 18, 4 12 Z" fill="none" stroke={strokeCol} strokeWidth="2.5" />
          <line x1="12" y1="4" x2="12" y2="22" stroke={strokeCol} strokeWidth="1.5" strokeDasharray="2 2" />
        </svg>
      );
    case 'battle':
      return (
        <svg width={size} height={size} viewBox="0 0 24 24">
          <line x1="3" y1="21" x2="21" y2="3" stroke={strokeCol} strokeWidth="3" strokeLinecap="round" />
          <line x1="21" y1="21" x2="3" y2="3" stroke={strokeCol} strokeWidth="3" strokeLinecap="round" opacity="0.6" />
        </svg>
      );
    case 'challenge':
      return (
        <svg width={size} height={size} viewBox="0 0 24 24">
          <path d="M 6 10 C 6 6, 18 6, 18 10 C 18 13, 16 15, 16 17 L 8 17 C 8 15, 6 13, 6 10 Z" fill="none" stroke={strokeCol} strokeWidth="2.5" />
          <rect x="9" y="17" width="6" height="4" fill="none" stroke={strokeCol} strokeWidth="2" />
          <circle cx="10" cy="11" r="1.5" fill={strokeCol} />
          <circle cx="14" cy="11" r="1.5" fill={strokeCol} />
        </svg>
      );
    case 'evolution':
      return (
        <svg width={size} height={size} viewBox="0 0 24 24">
          <path d="M 5 4 C 10 12, 14 12, 19 20" fill="none" stroke={strokeCol} strokeWidth="2.5" strokeLinecap="round" />
          <path d="M 19 4 C 14 12, 10 12, 5 20" fill="none" stroke={strokeCol} strokeWidth="2.5" strokeLinecap="round" opacity="0.6" />
          <line x1="9" y1="8" x2="15" y2="8" stroke={strokeCol} strokeWidth="2" />
          <line x1="12" y1="12" x2="12" y2="12" stroke={strokeCol} strokeWidth="2" />
          <line x1="9" y1="16" x2="15" y2="16" stroke={strokeCol} strokeWidth="2" />
        </svg>
      );
    default:
      return <span>❔</span>;
  }
}

export function NavTabBar({ active }: { active: NavTabKey }) {
  const hud = useSyncExternalStore(
    cb => hudStore.subscribe(cb),
    () => hudStore.getSnapshot(),
  );

  const close = () => {
    hudStore.set('/lobby/menuOpen', false);
    ['equip', 'talent', 'challenge', 'evolution', 'shop'].forEach(k =>
      window.dispatchEvent(new CustomEvent(`${k}:close`)));
  };
  const go = (open: string) => { close(); window.dispatchEvent(new CustomEvent(open)); };
  const tabs = [
    { key: 'shop' as const, label: '상점', action: () => go('lobby:openShop') },
    { key: 'equip' as const, label: '장비', action: () => go('lobby:openEquip') },
    { key: 'battle' as const, label: '전투', action: close },
    { key: 'challenge' as const, label: '도전', action: () => go('lobby:openChallenge') },
    { key: 'evolution' as const, label: '진화', action: () => go('lobby:openEvolution') },
  ];
  return (
    <div style={{ display: 'flex', borderTop: '3px solid #000000', background: '#F4EFE6', flexShrink: 0 }}>
      {tabs.map(t => {
        const showDot = t.key !== active && hasNavTabRedDot(hud, t.key);
        const category = showDot ? pickNavTabRedDot(hud, t.key) ?? undefined : undefined;
        return (
          <button key={t.key} type="button" onClick={t.action} style={{
            flex: 1, padding: '10px 0 8px', background: t.key === active ? '#e8dfd1' : 'transparent',
            border: 'none',
            color: t.key === active ? '#000000' : '#888888', cursor: 'pointer',
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2,
            position: 'relative',
          }}>
            <div style={{ position: 'relative' }}>
              {renderTabIcon(t.key, t.key === active)}
              <EventRedDot show={showDot} category={category} style={{ top: -2, right: -6 }} />
            </div>
            <span style={{ fontSize: 10, fontWeight: 900 }}>{t.label}</span>
          </button>
        );
      })}
    </div>
  );
}
