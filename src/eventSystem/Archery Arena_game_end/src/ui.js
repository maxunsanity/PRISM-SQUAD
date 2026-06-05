const SCREENS = [
  'screen-entry',
  'screen-lobby',
  'screen-attempt',
  'screen-shooting',
  'screen-bullseye',
  'screen-result',
  'screen-reward',
];

export function showScreen(id) {
  for (const s of SCREENS) {
    const el = document.getElementById(s);
    if (!el) continue;
    if (s === id) el.classList.remove('hidden');
    else el.classList.add('hidden');
  }
}

export function formatCountdown(ms) {
  if (ms <= 0) return '00:00:00';
  const totalSec = Math.floor(ms / 1000);
  const h = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const sec = totalSec % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
}

/** 1시간 미만이면 M:SS (예: 1:00), 이상이면 긴 포맷 */
export function formatEventRemain(ms) {
  if (ms <= 0) return '00:00';
  const sec = Math.ceil(ms / 1000);
  if (sec < 3600) {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  }
  return formatCountdown(ms);
}

export function toast(msg, ms = 2200) {
  const el = document.getElementById('toast');
  if (!el) return;
  el.textContent = msg;
  el.classList.remove('hidden');
  clearTimeout(toast._t);
  toast._t = setTimeout(() => el.classList.add('hidden'), ms);
}

export function renderRanking(ranked) {
  const list = document.getElementById('ranking-list');
  if (!list) return;
  list.innerHTML = '';
  ranked.forEach((e) => {
    const row = document.createElement('div');
    row.className = 'rank-item';
    if (e.rank <= 3) row.classList.add(`r${e.rank}`);
    if (e.is_me) row.classList.add('me');
    if (e.rank > 10) row.classList.add('compressed');
    row.dataset.playerId = e.id;
    const name = e.is_me ? '나 (YOU)' : e.display_name;
    let badgeStyle = '';
    if (e.rank === 1) badgeStyle = 'color:var(--gold2)';
    else if (e.rank === 2) badgeStyle = 'color:#999';
    else if (e.rank === 3) badgeStyle = 'color:var(--brown)';
    else if (e.is_me) badgeStyle = 'color:var(--blue)';
    const bs = badgeStyle ? ` style="${badgeStyle}"` : '';
    row.innerHTML = `<span class="rank-badge"${bs}>${e.rank}</span><span class="rank-name">${name}</span><span class="rank-score">${e.score}</span>`;
    list.appendChild(row);
  });
}

export function clearAttemptSelection() {
  document.querySelectorAll('.attempt-card').forEach((c) => c.classList.remove('selected'));
}

/** 로비에서 내 행이 리스트 뷰포트 안에 들어오도록 (sticky 제거 후 대체) */
export function scrollMyRankIntoViewIfNeeded() {
  const list = document.getElementById('ranking-list');
  const meRow = list?.querySelector('.rank-item.me');
  if (meRow && list) {
    meRow.scrollIntoView({ block: 'nearest', inline: 'nearest' });
  }
}

export function shakeShootingFrame() {
  const fr = document.querySelector('#screen-shooting .mobile-frame');
  if (!fr) return;
  fr.classList.remove('screen-shake');
  void fr.offsetWidth;
  fr.classList.add('screen-shake');
  setTimeout(() => fr.classList.remove('screen-shake'), 500);
}

export function flashRankRise() {
  const me = document.querySelector('.rank-item.me');
  if (me) {
    me.classList.remove('rank-rise');
    void me.offsetWidth;
    me.classList.add('rank-rise');
  }
}

export function flashFirstPlace() {
  const app = document.getElementById('app');
  if (!app) return;
  app.classList.remove('first-place-flash');
  void app.offsetWidth;
  app.classList.add('first-place-flash');
}

export function updateLobbyHud(player, endMs) {
  const remain = Math.max(0, endMs - Date.now());
  const t = formatEventRemain(remain);
  const htEntry = document.getElementById('header-timer-entry');
  const htLobby = document.getElementById('header-timer-lobby');
  const htShoot = document.getElementById('header-timer-shooting');
  const htAttempt = document.getElementById('header-timer-attempt');
  const popTimer = document.getElementById('entry-popup-timer');
  const urgent = remain > 0 && remain <= 10_000;
  if (htEntry) {
    htEntry.textContent = t;
    htEntry.classList.toggle('timer-urgent', urgent);
  }
  if (htLobby) {
    htLobby.textContent = t;
    htLobby.classList.toggle('timer-urgent', urgent);
  }
  if (htShoot) {
    htShoot.textContent = t;
    htShoot.classList.toggle('timer-urgent', urgent);
  }
  if (htAttempt) {
    htAttempt.textContent = t;
    htAttempt.classList.toggle('timer-urgent', urgent);
  }
  if (popTimer) popTimer.textContent = `⏱ ${t}`;

  const r = document.getElementById('lobby-stat-rank');
  const s = document.getElementById('lobby-stat-score');
  const d = document.getElementById('lobby-stat-dice');
  if (r) r.textContent = String(player.rank_current);
  if (s) s.textContent = String(player.target_score);
  if (d) d.textContent = `🏹 ${player.dice_count ?? player.bow_stands ?? 0}`;
}

export function updateAttemptPanel(player) {
  const el = document.getElementById('attempt-dice-display');
  if (el) el.textContent = String(player.dice_count);
}

export function setAttemptConfirmEnabled(ok) {
  const b = document.getElementById('btn-confirm-attempt');
  if (b) b.disabled = !ok;
}

export function setShootingNextVisible(vis) {
  const b = document.getElementById('btn-shooting-next');
  if (!b) return;
  b.classList.toggle('hidden', !vis);
}

export function fillAttemptCards(attemptRows) {
  const byType = Object.fromEntries(attemptRows.map((row) => [row.attempt_type, row]));
  for (const type of ['SINGLE', 'SET3', 'SET5']) {
    const card = document.querySelector(`.attempt-card[data-type="${type}"]`);
    const row = byType[type];
    if (!card || !row) continue;
    const label = card.querySelector('.ac-label');
    const cost = card.querySelector('.ac-cost');
    const sc = card.querySelector('.ac-score');
    if (label) label.textContent = row.label || label.textContent;
    if (cost) cost.textContent = `🎲 ×${row.cost_dice}`;
    if (sc) sc.textContent = `${row.score_min}~${row.score_max}점`;
  }
}

export function renderResultSnapshot(ranked, topN = 10) {
  const el = document.getElementById('result-ranking-snapshot');
  if (!el) return;
  el.innerHTML = '';
  ranked.slice(0, topN).forEach((e) => {
    const row = document.createElement('div');
    row.className = 'snapshot-row';
    if (e.rank <= 3) row.classList.add(`r${e.rank}`);
    if (e.is_me) row.classList.add('me');
    const name = e.is_me ? '나 (YOU)' : e.display_name;
    row.innerHTML = `<span class="snapshot-rank">${e.rank}</span><span class="snapshot-name">${name}</span><span class="snapshot-score">${e.score}</span>`;
    el.appendChild(row);
  });
}

export function syncAttemptCardsDisabled(player, attemptRows) {
  attemptRows.forEach((row) => {
    const card = document.querySelector(`.attempt-card[data-type="${row.attempt_type}"]`);
    if (!card) return;
    const cost = Number(row.cost_dice);
    card.classList.toggle('disabled', player.dice_count < cost);
  });
}

export function setLobbyAttemptEnabled(enabled) {
  const b = document.getElementById('btn-attempt');
  if (b) b.disabled = !enabled;
}
