import './style.css';
import { loadAllData } from './data.js';
import { startGame } from './game.js';

loadAllData()
  .then(startGame)
  .catch((err) => {
    console.error(err);
    document.getElementById('app').innerHTML = `<p style="padding:16px">데이터 로드 실패: ${err.message}</p>`;
  });
