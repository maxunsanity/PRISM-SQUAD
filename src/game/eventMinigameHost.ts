/**
 * iframe 미니게임 단일 호스트 — 열기/닫기/교체/일시중지(라바 전투)
 */
import { hudStore } from './hudExternalStore';
import {
  EVENT_MINIGAMES,
  type EventMinigameId,
} from './eventMinigameRegistry';
import { getMinigameCurrencyService } from './minigameCurrency';
import { markRedDotSeen } from './redDot/redDotSeen';
import { refreshRedDots } from './redDot/RedDotService';

const MINIGAME_NEW_DOT: Record<EventMinigameId, string> = {
  lava: 'lava_new',
  prize: 'prize_new',
  archery: 'archery_new',
};

export { EVENT_MINIGAMES, EVENT_MINIGAME_ORDER, type EventMinigameId } from './eventMinigameRegistry';

const IFRAME_SELECTOR = '[data-prism-event-minigame]';
const GAME_SHELL_SELECTOR = '[data-prism-game-shell]';

/** iframe 포커스가 남으면 부모 window 키보드(WASD)가 먹히지 않음 — 라바 전투 진입 시 필수 */
export function focusPrismGameShell() {
  const iframe = getActiveMinigameIframe();
  if (iframe) iframe.blur();
  const active = document.activeElement;
  if (active instanceof HTMLElement && active !== iframe) {
    active.blur();
  }
  const shell = document.querySelector(GAME_SHELL_SELECTOR) as HTMLElement | null;
  if (!shell) return;
  if (!shell.hasAttribute('tabindex')) shell.setAttribute('tabindex', '-1');
  shell.focus({ preventScroll: true });
}

function syncLegacyIframeFields(patch: Record<string, unknown>) {
  const id = patch['/event/minigame/activeId'] as EventMinigameId | '' | undefined;
  const visible = patch['/event/minigame/visible'] as boolean | undefined;
  const mountKey = patch['/event/minigame/mountKey'] as number | undefined;
  const legacy: Record<string, unknown> = {};
  if (mountKey !== undefined) legacy['/iframe/mountKey'] = mountKey;
  if (visible !== undefined) legacy['/iframe/visible'] = visible;
  if (id !== undefined) {
    legacy['/iframe/src'] = id && EVENT_MINIGAMES[id as EventMinigameId]
      ? EVENT_MINIGAMES[id as EventMinigameId].src
      : '';
  }
  if (Object.keys(legacy).length) hudStore.setMany(legacy);
}

function postToActiveIframe(msg: Record<string, unknown>) {
  const el = document.querySelector(IFRAME_SELECTOR) as HTMLIFrameElement | null;
  el?.contentWindow?.postMessage(msg, '*');
}

/** 세션·저장 데이터 정리 (다른 미니게임 진입 시) */
export function disposeMinigameSession(id: EventMinigameId) {
  postToActiveIframe({ type: 'host:eventDispose', eventId: id });
  const cfg = EVENT_MINIGAMES[id];
  for (const key of cfg.persistKeys) {
    try { localStorage.removeItem(key); } catch { /* ignore */ }
  }
}

export function getActiveMinigameId(): EventMinigameId | '' {
  return (hudStore.getSnapshot()['/event/minigame/activeId'] as EventMinigameId | '') || '';
}

export function isEventMinigameOpen(): boolean {
  const s = hudStore.getSnapshot();
  return Boolean(s['/event/minigame/activeId'] && s['/event/minigame/visible']);
}

export function closeEventMinigame() {
  window.dispatchEvent(new CustomEvent('host:closeRewardDetail'));
  
  hudStore.setMany({
    '/scene/transitionText': 'RETURN TO LOBBY',
    '/scene/transitionVisible': true,
  });

  window.setTimeout(() => {
    const id = getActiveMinigameId();
    if (id) disposeMinigameSession(id);
    hudStore.setMany({
      '/event/minigame/activeId': '',
      '/event/minigame/visible': false,
      '/event/minigame/suspended': false,
      '/event/minigame/mountKey': Number(hudStore.getSnapshot()['/event/minigame/mountKey'] ?? 0),
    });
    syncLegacyIframeFields({
      '/event/minigame/activeId': '',
      '/event/minigame/visible': false,
      '/event/minigame/mountKey': hudStore.getSnapshot()['/event/minigame/mountKey'],
    });
  }, 850);

  window.setTimeout(() => {
    hudStore.set('/scene/transitionVisible', false);
  }, 2650);
}

/** 쇼핑몰·드라이버 등 다른 풀스크린 UI 진입 시 */
export function hideEventMinigameForOverlay() {
  if (!getActiveMinigameId()) return;
  closeEventMinigame();
}

/**
 * 미니게임 입장 — 항상 이전 세션 종료 후 remount (라바↔퍼즐 동일 규칙)
 */
export function openEventMinigame(id: EventMinigameId) {
  const cfg = EVENT_MINIGAMES[id];
  markRedDotSeen(MINIGAME_NEW_DOT[id]);
  refreshRedDots();
  /* 라바 — 단독 iframe, 호스트 재화 차감 없음 */
  if (cfg.ticketCost > 0 && id !== 'lava') {
    const svc = getMinigameCurrencyService();
    if (!svc?.tryConsume(id, cfg.ticketCost)) {
      window.dispatchEvent(new CustomEvent('lobby:toast', { detail: '재화가 부족합니다' }));
      return;
    }
  }
  const snap = hudStore.getSnapshot();

  hudStore.setMany({
    '/scene/transitionText': id === 'lava' ? 'LAVA QUEST' : id === 'prize' ? 'PUZZLE DROP' : 'ARCHERY ARENA',
    '/scene/transitionVisible': true,
  });

  window.setTimeout(() => {
    const prev = getActiveMinigameId();
    if (prev) disposeMinigameSession(prev);

    window.dispatchEvent(new CustomEvent('host:closeRewardDetail'));

    const mountKey = Number(snap['/event/minigame/mountKey'] ?? 0) + 1;
    hudStore.setMany({
      '/event/minigame/activeId': id,
      '/event/minigame/visible': true,
      '/event/minigame/suspended': false,
      '/event/minigame/mountKey': mountKey,
    });
    syncLegacyIframeFields({
      '/event/minigame/activeId': id,
      '/event/minigame/visible': true,
      '/event/minigame/mountKey': mountKey,
    });
  }, 850);

  window.setTimeout(() => {
    hudStore.set('/scene/transitionVisible', false);
  }, 2650);
}

/** 라바 — 스퀘어 전투 진입 (iframe DOM 유지, 세션 유지) */
export function suspendEventMinigame() {
  window.dispatchEvent(new CustomEvent('host:closeRewardDetail'));
  const iframe = getActiveMinigameIframe();
  if (iframe) iframe.setAttribute('inert', '');
  hudStore.setMany({
    '/event/minigame/visible': false,
    '/event/minigame/suspended': true,
  });
  syncLegacyIframeFields({ '/event/minigame/visible': false });
  focusPrismGameShell();
}

/** 라바 — 전투 종료 후 iframe 복귀 */
export function resumeEventMinigame() {
  if (!getActiveMinigameId()) return;
  getActiveMinigameIframe()?.removeAttribute('inert');
  hudStore.setMany({
    '/event/minigame/visible': true,
    '/event/minigame/suspended': false,
  });
  syncLegacyIframeFields({ '/event/minigame/visible': true });
}

export function getActiveMinigameIframe(): HTMLIFrameElement | null {
  return document.querySelector(IFRAME_SELECTOR) as HTMLIFrameElement | null;
}

/** @deprecated — eventMinigameHost 사용 */
export const closeEventIframe = closeEventMinigame;
export const openEventIframe = (src: string) => {
  const id = (Object.keys(EVENT_MINIGAMES) as EventMinigameId[]).find(
    k => EVENT_MINIGAMES[k].src === src,
  );
  if (id) openEventMinigame(id);
};
export const hideEventIframeForOverlay = hideEventMinigameForOverlay;
