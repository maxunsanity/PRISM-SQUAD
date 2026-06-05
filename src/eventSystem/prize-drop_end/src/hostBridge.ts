/**
 * 호스트 ↔ prize-drop 이식 가능 지갑 계약 (host-agnostic)
 *
 *   퍼즐 → 호스트 :  pd:ready                                  (준비됨)
 *   호스트 → 퍼즐 :  host:walletSync { balance, missionLines? } (보유량[+획득안내])
 *   퍼즐 → 호스트 :  pd:walletChanged { balance }              (남은 보유량 저장 요청)
 *
 * 어느 호스트(스퀘어 / 모노폴리GO …)든 위 3개 메시지만 구현하면 그대로 붙는다.
 * 호스트는 게임 내부 규칙을 전혀 모르고 balance(숫자)만 주고받는다.
 * standalone(window.parent === window)이면 hosted=false → 내부 기본값으로 동작.
 */
import { hudStore } from './game/hudExternalStore';

export type MissionLine = { title: string; detail: string };

let hosted = false;

export function isPrizeHosted(): boolean {
  return hosted;
}

function applyBalance(n: unknown) {
  hudStore.update({ '/hud/ball_count': Math.max(0, Math.floor(Number(n) || 0)) });
}

/** 부팅 완료 후 호스트에 준비 신호 → host:walletSync 수신 대기 */
export function notifyReady() {
  if (window.parent !== window) {
    window.parent.postMessage({ type: 'pd:ready' }, '*');
  }
}

/** 잔액 변동(소비 등) 후 호스트에 저장 요청 */
export function notifyWalletChanged(balance: number) {
  if (window.parent !== window) {
    window.parent.postMessage({ type: 'pd:walletChanged', balance: Math.max(0, Math.floor(balance)) }, '*');
  }
}

/** 메시지 리스너 설치 — 부트스트랩보다 먼저 호출(onLoad sync도 받기 위함) */
export function installPrizeHostBridge() {
  window.addEventListener('message', (ev) => {
    if (ev.data?.type !== 'host:walletSync') return;
    hosted = true;
    applyBalance(ev.data.balance);
    const lines = Array.isArray(ev.data.missionLines) ? (ev.data.missionLines as MissionLine[]) : [];
    hudStore.update({ '/hud/mission_lines': lines });
  });
}
