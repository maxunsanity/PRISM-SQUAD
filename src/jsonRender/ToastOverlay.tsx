/** 구매·로비 공통 토스트 (상점 z-index 위에 표시) */
import { useSyncExternalStore } from 'react';
import { hudStore } from '../game/hudExternalStore';

export function ToastOverlay({ zIndex = 60 }: { zIndex?: number }) {
  const hud = useSyncExternalStore(
    cb => hudStore.subscribe(cb),
    () => hudStore.getSnapshot(),
  );
  if (!hud['/toast/visible']) return null;
  return (
    <div style={{
      position: 'absolute', bottom: 96, left: '50%', transform: 'translateX(-50%)',
      background: 'rgba(0,0,0,0.9)', color: '#fff', fontSize: 13, fontWeight: 700,
      padding: '10px 20px', borderRadius: 20, border: '1px solid rgba(255,214,0,0.5)',
      whiteSpace: 'nowrap', maxWidth: '92%', textAlign: 'center',
      zIndex, pointerEvents: 'none',
      boxShadow: '0 4px 20px rgba(0,0,0,0.5)',
    }}>
      {String(hud['/toast/text'] ?? '')}
    </div>
  );
}
