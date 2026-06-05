import { useEffect, useState, useRef } from 'react';
import ReactDOM from 'react-dom/client';
import {
  StateProvider,
  ActionProvider,
  VisibilityProvider,
} from '@json-render/react';
import { bootstrapGame } from './game/bootstrapGame';
import {
  GameJsonHud,
  overlayActionHandlers,
} from './jsonRender/GameJsonHud';
import { hudStore } from './game/hudExternalStore';
import { installPrizeHostBridge, notifyReady } from './hostBridge';
import { PrizeIntro } from './PrizeIntro';

const App = () => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const bootstrapRef = useRef(false);

  useEffect(() => {
    if (bootstrapRef.current) return;
    bootstrapRef.current = true;

    console.log('[App] Initializing Store...');
    // 호스트 브릿지 먼저 설치 — iframe onLoad init 메시지도 받기 위함
    installPrizeHostBridge();
    // Ensure initial state is visible to json-render
    const initialSnapshot = hudStore.getSnapshot();
    console.log('[App] Initial State:', initialSnapshot);

    // Tiny delay to ensure React Providers are settled
    const timer = setTimeout(() => {
      bootstrapGame()
        .then(() => {
          console.log('[App] Game Bootstrapped Successfully');
          setIsLoaded(true);
          // 호스트에 준비 신호 → host:walletSync 로 balance/missionLines 수신
          notifyReady();
        })
        .catch(err => {
          console.error('[App] Bootstrap failed:', err);
          setError(err.message);
        });
    }, 150);

    return () => clearTimeout(timer);
  }, []);

  return (
    <>
      {/* Loading/Error Overlay on top of Game Viewport */}
      {!isLoaded && (
        <div style={{ position: 'absolute', top: '110px', left: '3px', width: '360px', height: '396px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f0f0e8', zIndex: 5, borderRadius: '4px' }}>
          {error ? (
            <div style={{ color: 'red', textAlign: 'center', padding: '20px' }}>
              부팅 실패: {error}<br/>페이지를 새로고침 해주세요.
            </div>
          ) : (
            <div style={{ fontWeight: 800, color: '#1a1a1a' }}>뱅크 데이터 로딩 중...</div>
          )}
        </div>
      )}

      {/* HUD & Overlays Layer (JSON Render) */}
      <div id="hud-layer" style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 10 }}>
        <div style={{ pointerEvents: 'auto' }}>
          <GameJsonHud />
        </div>
      </div>

      {/* 입장/미션 인트로 (게임 자체 화면) */}
      <PrizeIntro />

      {/* Machine Area (Background) */}
      <div id="machine-area" style={{ position: 'absolute', top: '110px', left: '3px', width: '360px', height: '396px', zIndex: 1 }}>
        <div id="game-viewport" style={{ width: '100%', height: '100%' }}></div>
      </div>
    </>
  );
};

const rootElement = document.getElementById('prize-drop-root');
if (rootElement) {
  const root = ReactDOM.createRoot(rootElement);
  root.render(
    <StateProvider store={hudStore}>
      <ActionProvider handlers={overlayActionHandlers}>
        <VisibilityProvider>
          <App />
        </VisibilityProvider>
      </ActionProvider>
    </StateProvider>
  );
}
