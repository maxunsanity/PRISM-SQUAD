import { hudStore } from './hudExternalStore';
import { notifyWalletChanged } from '../hostBridge';

export const gameStore = {
  getSnapshot() {
    // JSON-pointer(중첩) 스토어 — get(path)로 읽어야 라이브 값(직접 키 접근은 stale)
    return {
      ballCount: hudStore.get('/hud/ball_count') as number,
      multiplier: hudStore.get('/hud/multiplier') as number,
    };
  },
  subscribe(listener: () => void): () => void {
    return hudStore.subscribe(listener);
  },
  useBall(): boolean {
    const current = hudStore.get('/hud/ball_count') as number;
    if (current <= 0) return false;
    const next = current - 1;
    hudStore.update({ '/hud/ball_count': next });
    // 소비는 퍼즐이 자체 처리 — 호스트엔 남은 잔액만 통지(저장)
    notifyWalletChanged(next);
    return true;
  },
  addBalls(n: number) {
    const current = hudStore.get('/hud/ball_count') as number;
    const next = current + n;
    hudStore.update({ '/hud/ball_count': next });
    // 환불 등 증가분도 호스트에 잔액 통지(저장)
    notifyWalletChanged(next);
  },
  setMultiplier(v: number) {
    hudStore.update({ '/hud/multiplier': v });
  },
};
