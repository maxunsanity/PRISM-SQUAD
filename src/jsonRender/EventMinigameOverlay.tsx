/**
 * iframe 미니게임 단일 셸 — App 최상위 (로비 mount와 무관)
 */
import { useSyncExternalStore } from 'react';
import { hudStore } from '../game/hudExternalStore';
import {
  EVENT_MINIGAMES,
  closeEventMinigame,
  type EventMinigameId,
} from '../game/eventMinigameHost';
import { archeryInitPayload } from '../game/archeryMeta';
import { SketchCloseButton } from './overlayUi';

export function EventMinigameOverlay() {
  const hud = useSyncExternalStore(
    cb => hudStore.subscribe(cb),
    () => hudStore.getSnapshot(),
  );

  const activeId = (hud['/event/minigame/activeId'] as EventMinigameId | '') || '';
  const visible = Boolean(hud['/event/minigame/visible']);
  const mountKey = Number(hud['/event/minigame/mountKey'] ?? 0);
  const cfg = activeId ? EVENT_MINIGAMES[activeId] : null;

  if (!cfg || !activeId) return null;

  return (
    <div
      style={{
        position: 'absolute',
        top: 84, left: 0, right: 0, bottom: 0,
        zIndex: 500,
        background: '#fff',
        display: visible ? 'block' : 'none',
        isolation: 'isolate',
        overflow: 'hidden',
        pointerEvents: visible ? 'auto' : 'none',
      }}
    >
      <iframe
        key={`${mountKey}:${activeId}`}
        data-prism-event-minigame
        src={cfg.src}
        style={{
          position: 'absolute', inset: 0,
          border: 'none', width: '100%', height: '100%',
          background: '#fff',
        }}
        title={cfg.label}
        allow="autoplay"
        onLoad={() => {
          if (activeId !== 'archery') return;
          const win = document.querySelector('[data-prism-event-minigame]') as HTMLIFrameElement | null;
          win?.contentWindow?.postMessage(
            { type: 'host:archeryInit', ...archeryInitPayload() },
            '*',
          );
        }}
      />
      <SketchCloseButton
        onClick={() => closeEventMinigame()}
        style={{ position: 'absolute', top: 8, right: 8, zIndex: 510 }}
      />
    </div>
  );
}
