import './style.css';
import { loadAllData } from './data.js';

/**
 * game.js(Three·UI)는 데이터 로드 후 dynamic import — 번들 초기화 순환/TDZ 방지
 */
async function boot() {
  const loaded = await loadAllData();
  const { startGame } = await import('./game.js');
  startGame(loaded);
}

boot().catch((err) => {
  console.error(err);
  const app = document.getElementById('app');
  if (app) {
    app.innerHTML = `<p style="padding:16px;font-weight:700;">데이터 로드 실패: ${err?.message ?? err}</p>`;
  }
});
