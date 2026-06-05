/**
 * 호스트 ↔ 양궁 iframe — 이식 가능 지갑 계약 (host-agnostic)
 *
 *   양궁 → 호스트 :  aa:ready                                   (준비됨)
 *   호스트 → 양궁 :  host:walletSync { balance, missionLines?, claimPending? }
 *   양궁 → 호스트 :  aa:walletChanged { balance }               (소비 후 잔액 저장)
 *
 * 재화 = "발"(1 balance = 1발). 소비 판정은 양궁이 자체 처리(N발 = N 차감),
 * 호스트는 balance(숫자)만 주고받고 게임 규칙을 모른다 → 어느 호스트든 그대로 붙는다.
 * 토너먼트 보상 수령(claimPending)만 별도: notifyClaimPending / aa:claimed.
 */
let balance = 0;          // 보유 발 (재화)
let hostClaimPending = false;
let hostRoundBlocked = false;
let missionLines = [];
let onConsumed = null;    // (n) => void
let onDenied = null;

export function getHostBowStands() {
  return balance;
}
export function getMissionLines() {
  return missionLines;
}
export function isClaimPending() {
  return hostClaimPending;
}
export function isRoundBlocked() {
  return hostRoundBlocked || hostClaimPending;
}
export function setOnBowConsumed(fn) {
  onConsumed = fn;
}
export function setOnBowDenied(fn) {
  onDenied = fn;
}

function post(msg) {
  if (window.parent !== window) window.parent.postMessage(msg, '*');
}

export function notifyHostReady() {
  post({ type: 'aa:ready' });
}

export function notifyClaimPending(pending) {
  hostClaimPending = pending;
  post({ type: 'aa:claimPending', pending });
}

/** N발 소비 — 양궁이 자체 판정, 호스트엔 잔액만 통지(저장) */
export function requestConsumeBow(n = 1) {
  const need = Math.max(1, Math.floor(n));
  if (balance < need) {
    onDenied?.();
    return false;
  }
  balance -= need;
  post({ type: 'aa:walletChanged', balance });
  onConsumed?.(need);
  return true;
}

export function applyHostInit(data) {
  balance = Math.max(0, Math.floor(Number(data?.balance ?? 0)));
  missionLines = Array.isArray(data?.missionLines) ? data.missionLines : missionLines;
  hostClaimPending = Boolean(data?.claimPending);
  hostRoundBlocked = Boolean(data?.roundBlocked ?? hostClaimPending);
}

export function installHostBridge(onInit) {
  window.addEventListener('message', (ev) => {
    const t = ev.data?.type;
    if (t === 'host:walletSync') {
      applyHostInit(ev.data);
      onInit?.();
      return;
    }
    if (t === 'host:eventDispose') {
      if (ev.data?.eventId === 'archery') {
        balance = 0;
        hostClaimPending = false;
      }
    }
  });
  queueMicrotask(() => notifyHostReady());
}
