/**
 * 로비 햄버거 메뉴 — modal(30) 밖 App 레이어(z55)에서 렌더 (이벤트 HUD 40 위)
 */
import React from 'react';
import { hudStore } from '../game/hudExternalStore';

function useHud() {
  return React.useSyncExternalStore(
    cb => hudStore.subscribe(cb),
    () => hudStore.getSnapshot(),
  );
}

export function LobbyMenuDropdown() {
  const hud = useHud();
  if (!hud['/lobby/menuOpen'] || !hud['/lobby/visible']) return null;

  const close = () => hudStore.set('/lobby/menuOpen', false);

  const requestSessionReset = () => {
    const ok = window.confirm('세션 데이터를 초기화할까요?\n(장비/특성/진화/재화 저장값이 기본값으로 돌아갑니다)');
    if (!ok) return;
    window.dispatchEvent(new CustomEvent('prism:action', { detail: 'RESET_SESSION' }));
    close();
  };

  return (
    <>
      <div
        role="presentation"
        onClick={close}
        style={{ position: 'absolute', inset: 0, zIndex: 54, pointerEvents: 'auto' }}
      />
      <div style={{
        position: 'absolute', top: 52, left: 12, zIndex: 55,
        minWidth: 180, background: '#F4EFE6',
        border: '2px solid #000000',
        boxShadow: '3px 3px 0 #000000',
        padding: 6, display: 'flex', flexDirection: 'column', gap: 4,
        pointerEvents: 'auto',
      }}>
        {[
          { key: '/lobby/showLavaQuest' as const, icon: '🌋', label: 'Lava Quest' },
          { key: '/lobby/showPrizeDrop' as const, icon: '🎰', label: 'Prize Drop' },
          { key: '/lobby/showMallMarvels' as const, icon: '🛍️', label: '쇼핑몰의 경이로움' },
          { key: '/lobby/showDriversJoy' as const, icon: '🚗', label: '드라이버의 기쁨' },
          { key: '/lobby/showArcheryArena' as const, icon: '🏹', label: '양궁 아레나' },
        ].map(({ key, icon, label }) => {
          const on = Boolean(hud[key]);
          return (
            <button
              key={key}
              type="button"
              onClick={() => hudStore.set(key, !on)}
              style={{
                width: '100%', textAlign: 'left',
                background: on ? '#e8dfd1' : 'transparent',
                color: '#000000',
                border: '1.5px solid #000000',
                padding: '7px 10px', fontWeight: 900, fontSize: 12, cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: 6,
              }}
            >
              <span>{icon}</span>
              <span style={{ flex: 1 }}>{label}</span>
              <span style={{
                fontSize: 10, fontWeight: 900,
                color: '#000000',
                background: on ? '#3DDC84' : '#ccc',
                border: '1px solid #000000',
                borderRadius: 4, padding: '1px 5px',
              }}>{on ? 'ON' : 'OFF'}</span>
            </button>
          );
        })}
        <div style={{ height: 2, background: '#000000', margin: '2px 0' }} />
        <button
          type="button"
          onClick={requestSessionReset}
          style={{
            width: '100%', textAlign: 'left',
            background: '#FF8A2A', color: '#000000',
            border: '2px solid #000000',
            padding: '7px 10px', fontWeight: 900, fontSize: 12, cursor: 'pointer',
          }}
        >
          세션 초기화
        </button>
      </div>
    </>
  );
}
