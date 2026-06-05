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
import { archeryWalletSyncMsg } from '../game/archeryMeta';
import { getMinigameCurrencyService } from '../game/minigameCurrency';
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
          const win = document.querySelector('[data-prism-event-minigame]') as HTMLIFrameElement | null;
          if (activeId === 'archery') {
            win?.contentWindow?.postMessage(archeryWalletSyncMsg(), '*');
          } else if (activeId === 'prize') {
            const svc = getMinigameCurrencyService();
            const rows = (svc?.getAcquireRows('prize') ?? [])
              .filter(r => r.enabled)
              .sort((a, b) => a.sort_order - b.sort_order);
            win?.contentWindow?.postMessage(
              {
                type: 'host:walletSync',
                balance: svc?.getPrizeBalls() ?? 0,
                missionLines: rows.map(r => ({ title: `${r.row_title} ${r.kills_required}마리`, detail: r.reward_label })),
              },
              '*',
            );
          }
        }}
      />
      <SketchCloseButton
        onClick={() => closeEventMinigame()}
        style={{ position: 'absolute', top: 8, right: 8, zIndex: 510 }}
      />
    </div>
  );
}
