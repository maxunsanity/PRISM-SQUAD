import React, { useSyncExternalStore } from 'react';
import { hudExternalStore } from '../game/hudExternalStore.js';

export function GameJsonHud(): React.ReactElement {
  const state = useSyncExternalStore(
    hudExternalStore.subscribe,
    hudExternalStore.getSnapshot,
  );
  return (
    <div style={{ position: 'absolute', top: 8, right: 8, background: 'rgba(0,0,0,0.45)', color: '#fff', padding: '4px 8px', borderRadius: 4, fontSize: 11, fontFamily: 'monospace', lineHeight: 1.6 }}>
      <div>🎯 {state.myScore}점</div>
      <div>🏆 {state.myRank}위</div>
      <div>🎲 {state.diceCount}</div>
      <div>⏱ {state.timeLeft}</div>
    </div>
  );
}
