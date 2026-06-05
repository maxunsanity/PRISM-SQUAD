import {
  loadPlayerState,
  savePlayerState,
  loadEventMeta,
  saveEventMeta,
} from './data.js';
import {
  ensureRanking,
  sortAndRank,
  applyMyScore,
  persistRanking,
  runBotTick,
} from './ranking.js';
import { calculateScore, attemptRolls, rollInt } from './mechanics.js';
import { mountArcheryThree, disposeArcheryThree, getThreeContext } from './three/setup.js';
import { buildTargetRings, ringHitPosition, addBulletHole, flashRing } from './three/target.js';
import { createArrowGroup, animateArrowFlight, createTrailLine, planArrowFlight, sampleFlightPosition, easeOutCubic } from './three/arrow_shot.js';
import * as Ui from './ui.js';
import {
  installHostBridge,
  getHostBowStands,
  getMissionLines,
  isClaimPending,
  isRoundBlocked,
  requestConsumeBow,
  notifyClaimPending,
  setOnBowConsumed,
  setOnBowDenied,
} from './hostBridge.js';

const BOW_EMPTY_MSG = '발이 부족합니다. 전투에서 몬스터를 처치하면 발을 받을 수 있어요.';

const COLORS = {
  OUTER: '#8B7355',
  MIDDLE: '#E8A020',
  CENTER: '#E84040',
  BULLSEYE: '#FFD700',
};

const HIT_LABELS = {
  OUTER: '외곽!',
  MIDDLE: '중간!',
  CENTER: '중심부!',
  BULLSEYE: 'Bullseye!!',
};

/** 기본값 — CSV(aa_integration_config) 로드 실패 시 폴백 */
const DEFAULT_INTEGRATION = {
  tournament_round_min: '30',
  bot_tick_ms: '60000',
  shots_per_bow: '5',
  event_meta_version: '3',
};

function spawnBullParticles(visualRow) {
  const host = document.getElementById('bullseye-particles');
  if (!host) return;
  host.innerHTML = '';
  const n = Number(visualRow.bullseye_particle_count) || 15;
  const dist = Number(visualRow.bullseye_particle_radius_px) || 100;
  const dur = Number(visualRow.bullseye_particle_duration_ms) || 1500;
  for (let i = 0; i < n; i++) {
    const p = document.createElement('span');
    p.className = 'bull-particle';
    const ang = (i / n) * Math.PI * 2 + Math.random() * 0.5;
    p.style.setProperty('--angle', `${ang}rad`);
    p.style.setProperty('--dist', `${dist}px`);
    p.style.animationDuration = `${dur}ms`;
    host.appendChild(p);
  }
}

export function startGame(loaded) {
  const cfg = { ...DEFAULT_INTEGRATION, ...(loaded.integration ?? {}) };
  const SHOTS_PER_BOW = Math.max(1, Number(cfg.shots_per_bow) || 5);
  const EVENT_SESSION_MS = Math.max(1, Number(cfg.tournament_round_min) || 30) * 60 * 1000;
  const EVENT_META_VERSION = Math.max(1, Number(cfg.event_meta_version) || 3);
  const botTickFixed = Number(cfg.bot_tick_ms);
  const BOT_TICK_MS = botTickFixed > 0
    ? botTickFixed
    : 60 * 1000;
  const useRandomBotTick = !(botTickFixed > 0);

  const eventRow = loaded.events?.[0];
  if (!eventRow) throw new Error('aa_event_config.csv 에 이벤트 행이 없습니다');
  const visualRow =
    loaded.visual.find((v) => String(v.event_id) === String(eventRow.event_id)) || loaded.visual[0];
  if (!visualRow) throw new Error('aa_visual_config.csv 에 비주얼 행이 없습니다');
  const attemptRows = loaded.attempts.filter((a) => String(a.event_id) === String(eventRow.event_id));

  const groupSize = Number(eventRow.group_size) || 50;

  let player = loadPlayerState() || {
    bow_stands: 0,
    dice_count: 0,
    target_score: 0,
    rank_current: groupSize,
    combo_count: 0,
    total_attempts: 0,
    daily_free_used: false,
  };

  let meta = loadEventMeta();
  if (!meta || String(meta.eventId) !== String(eventRow.event_id) || meta.v !== EVENT_META_VERSION) {
    meta = {
      eventId: eventRow.event_id,
      endMs: Date.now() + EVENT_SESSION_MS,
      v: EVENT_META_VERSION,
      claimPending: false,
    };
    saveEventMeta(meta);
  }

  let endMs = meta.endMs;
  let eventEnded = Date.now() >= endMs;
  let claimPending = Boolean(meta.claimPending);
  if (claimPending) notifyClaimPending(true);

  let shootingBusy = false;
  let selectedType = null;
  let selectedShots = 1; // 1~5발 선택 (재화 1개 = 1발)

  installHostBridge(() => {
    queueMicrotask(() => {
      player.dice_count = getHostBowStands();
      renderMission();
      syncShotSelector();
      syncAttemptButton();
      refreshRank();
    });
  });
  setOnBowConsumed((n) => {
    runRound(n).catch((e) => {
      console.error(e);
      shootingBusy = false;
      disposeArcheryThree();
      goLobby();
    });
  });
  setOnBowDenied(() => Ui.toast(BOW_EMPTY_MSG));

  let entries = ensureRanking(groupSize);
  entries = applyMyScore(entries, player.target_score);
  persistRanking(entries);

  function refreshRank() {
    const ranked = sortAndRank(entries);
    const me = ranked.find((e) => e.is_me);
    player.rank_current = me?.rank ?? player.rank_current;
    player.dice_count = getHostBowStands();
    savePlayerState(player);
    Ui.renderRanking(ranked);
    Ui.updateLobbyHud(player, endMs);
    syncAttemptButton();
    return ranked;
  }

  refreshRank();

  let botTimer = null;
  function scheduleBotTickLoop() {
    if (botTimer) clearTimeout(botTimer);
    if (eventEnded) return;
    const delay = useRandomBotTick
      ? rollInt(Number(eventRow.bot_tick_min_ms), Number(eventRow.bot_tick_max_ms))
      : BOT_TICK_MS;
    botTimer = setTimeout(() => {
      const ranked = sortAndRank(entries);
      runBotTick(entries, ranked);
      refreshRank();
      scheduleBotTickLoop();
    }, delay);
  }
  scheduleBotTickLoop();

  let uiTimer = null;
  function startUiTick() {
    if (uiTimer) clearInterval(uiTimer);
    uiTimer = setInterval(() => {
      const wasLive = !eventEnded;
      eventEnded = Date.now() >= endMs;
      Ui.updateLobbyHud(player, endMs);
      if (wasLive && eventEnded) {
        Ui.toast('토너먼트가 종료되었습니다. 보상을 수령하세요.');
        Ui.setLobbyAttemptEnabled(false);
        document.getElementById('btn-attempt').disabled = true;
        claimPending = true;
        meta.claimPending = true;
        saveEventMeta(meta);
        notifyClaimPending(true);
        showResultFlow();
      }
    }, 250);
  }
  startUiTick();

  function startNewTournamentPeriod() {
    disposeArcheryThree();
    shootingBusy = false;
    endMs = Date.now() + EVENT_SESSION_MS;
    meta.endMs = endMs;
    meta.eventId = eventRow.event_id;
    meta.v = EVENT_META_VERSION;
    meta.claimPending = false;
    saveEventMeta(meta);
    eventEnded = false;
    claimPending = false;
    notifyClaimPending(false);
    player.target_score = 0;
    player.rank_current = groupSize;
    player.combo_count = 0;
    player.dice_count = getHostBowStands();
    savePlayerState(player);
    localStorage.removeItem('aa_ranking_bots');
    localStorage.removeItem('aa_ranking_dummy_schema');
    entries = ensureRanking(groupSize);
    entries = applyMyScore(entries, 0);
    persistRanking(entries);
    if (botTimer) clearTimeout(botTimer);
    scheduleBotTickLoop();
    Ui.setLobbyAttemptEnabled(true);
    syncAttemptButton();
    refreshRank();
    Ui.showScreen('screen-lobby');
  }

  function syncAttemptButton() {
    const btn = document.getElementById('btn-attempt');
    if (!btn) return;
    btn.disabled = eventEnded || isRoundBlocked() || shootingBusy;
    btn.classList.toggle('bow-empty', !eventEnded && !isRoundBlocked() && getHostBowStands() < 1);
  }

  function goLobby() {
    shootingBusy = false;
    player.dice_count = getHostBowStands();
    syncShotSelector();
    syncAttemptButton();
    Ui.showScreen('screen-lobby');
    refreshRank();
    Ui.scrollMyRankIntoViewIfNeeded();
  }

  async function runRound(shots) {
    const n = Math.max(1, Math.floor(shots) || 1);
    if (shootingBusy || isRoundBlocked()) return;
    const attemptRow = attemptRows.find((r) => r.attempt_type === 'SET5') || attemptRows[0];
    if (!attemptRow) return;
    shootingBusy = true;
    syncAttemptButton();

    const rankedBefore = sortAndRank(entries);
    const rankBefore = rankedBefore.find((e) => e.is_me)?.rank ?? player.rank_current;

    let totalGain = 0;
    for (let i = 0; i < n; i++) {
      player.combo_count += 1;
      const result = calculateScore(attemptRow, player.combo_count, eventRow);
      totalGain += result.score;
      await runShootingScene(result, rankBefore, rankBefore, {
        autoAdvance: true,
        shotIndex: i + 1,
        shotTotal: n,
      });
    }

    player.total_attempts += n;
    player.target_score += totalGain;
    player.dice_count = getHostBowStands();

    entries = applyMyScore(entries, player.target_score);
    persistRanking(entries);
    savePlayerState(player);

    const rankedAfter = sortAndRank(entries);
    const rankAfter = rankedAfter.find((e) => e.is_me)?.rank ?? player.rank_current;
    player.rank_current = rankAfter;
    savePlayerState(player);

    shootingBusy = false;
    applyRankFx(rankBefore, rankAfter);
    Ui.toast(`${n}발 합계 +${totalGain}점 (총 ${player.target_score}점)`);
    goLobby();
  }

  function showResultFlow() {
    const ranked = sortAndRank(entries);
    Ui.renderResultSnapshot(ranked);
    const hr = document.getElementById('result-hero-rank');
    if (hr) hr.textContent = `${player.rank_current}위`;
    const ts = document.getElementById('result-total-score');
    if (ts) ts.textContent = `총 점수: ${player.target_score}점`;
    Ui.showScreen('screen-result');
  }

  function buildRewardHtml(rewards, eventId, rank) {
    const rows = rewards.filter((r) => String(r.event_id) === String(eventId));
    const m = rows.find((x) => rank >= Number(x.rank_min) && rank <= Number(x.rank_max));
    if (!m) return '<p>이 순위 구간에 매핑된 보상 행이 없습니다.</p>';
    return `<p><strong>보상 등급</strong> ${m.reward_grade}</p><p><strong>번들 ID</strong> <span style="font-family:IBM Plex Mono,monospace">${m.reward_bundle_id}</span></p><p style="font-size:11px;color:#666;margin-top:8px">라이브에서는 서버·인벤토리 스펙과 연결합니다.</p>`;
  }

  function applyRankFx(rankBefore, rankAfter) {
    if (rankAfter < rankBefore) Ui.flashRankRise();
    if (rankAfter === 1 && rankBefore > 1) Ui.flashFirstPlace();
  }

  Ui.fillAttemptCards(attemptRows);
  Ui.updateLobbyHud(player, endMs);
  if (eventEnded) {
    Ui.setLobbyAttemptEnabled(false);
    document.getElementById('btn-attempt').disabled = true;
  }

  document.getElementById('btn-enter').onclick = () => goLobby();
  document.getElementById('btn-entry-close').onclick = () => goLobby();

  const dbgDice = document.getElementById('btn-add-dice');
  if (dbgDice) dbgDice.style.display = 'none';

  document.getElementById('btn-attempt').onclick = () => {
    if (eventEnded) {
      showResultFlow();
      return;
    }
    if (isClaimPending()) {
      Ui.toast('보상을 먼저 수령하세요');
      return;
    }
    if (shootingBusy) return;
    if (getHostBowStands() < selectedShots) {
      Ui.toast(BOW_EMPTY_MSG);
      if (window.parent !== window) {
        window.parent.postMessage({ type: 'aa:toast', message: BOW_EMPTY_MSG }, '*');
      }
      return;
    }
    requestConsumeBow(selectedShots);
  };

  /** 1~5발 선택 버튼 + 미션 배너 (재화 1개 = 1발) */
  function syncShotSelector() {
    const max = Math.max(1, Math.min(5, getHostBowStands()));
    if (selectedShots > max) selectedShots = Math.max(1, max);
    document.querySelectorAll('#shot-selector .shot-opt').forEach((b) => {
      const v = Number(b.dataset.shots);
      b.classList.toggle('selected', v === selectedShots);
      b.disabled = v > getHostBowStands();
    });
    const btn = document.getElementById('btn-attempt');
    if (btn && !eventEnded) btn.textContent = `🏹 ${selectedShots}발 도전`;
  }

  function renderMission() {
    const host = document.getElementById('lobby-mission');
    if (!host) return;
    const lines = getMissionLines();
    if (!lines.length) { host.innerHTML = ''; host.classList.add('hidden'); return; }
    host.classList.remove('hidden');
    host.innerHTML =
      '<div class="lm-title">📋 발 모으는 법</div>' +
      lines.map((l) => `<div class="lm-row"><span>${l.title}</span><span class="lm-r">→ 발 ${l.detail}</span></div>`).join('');
  }

  document.querySelectorAll('#shot-selector .shot-opt').forEach((b) => {
    b.onclick = () => {
      const v = Number(b.dataset.shots);
      if (v > getHostBowStands()) return;
      selectedShots = Math.max(1, Math.min(5, v));
      syncShotSelector();
    };
  });

  document.querySelectorAll('.attempt-card').forEach((card) => {
    card.onclick = () => {
      if (card.classList.contains('disabled')) return;
      document.querySelectorAll('.attempt-card').forEach((c) => c.classList.remove('selected'));
      card.classList.add('selected');
      selectedType = card.dataset.type;
      Ui.setAttemptConfirmEnabled(true);
    };
  });

  document.getElementById('btn-attempt-close').onclick = () => {
    selectedType = null;
    Ui.clearAttemptSelection();
    Ui.setAttemptConfirmEnabled(false);
    goLobby();
  };

  document.getElementById('btn-confirm-attempt').onclick = () => {
    if (!selectedType || shootingBusy) return;
    const attemptRow = attemptRows.find((r) => r.attempt_type === selectedType);
    if (!attemptRow) return;
    const cost = Number(attemptRow.cost_dice);
    if (player.dice_count < cost) {
      Ui.toast('재화 부족');
      return;
    }
    document.getElementById('btn-attempt').disabled = true;
    shootingBusy = true;

    const rankedBefore = sortAndRank(entries);
    const rankBefore = rankedBefore.find((e) => e.is_me)?.rank ?? player.rank_current;

    player.dice_count -= cost;
    const rolls = attemptRolls(selectedType);
    player.combo_count += rolls;
    player.total_attempts += rolls;

    const result = calculateScore(attemptRow, player.combo_count, eventRow);
    player.target_score += result.score;

    entries = applyMyScore(entries, player.target_score);
    persistRanking(entries);
    savePlayerState(player);

    const rankedAfter = sortAndRank(entries);
    const rankAfter = rankedAfter.find((e) => e.is_me)?.rank ?? player.rank_current;
    player.rank_current = rankAfter;
    savePlayerState(player);

    runShootingScene(result, rankBefore, rankAfter).catch((e) => {
      console.error(e);
      disposeArcheryThree();
      goLobby();
    });
  };

  async function runShootingScene(result, rankBefore, rankAfter, options = {}) {
    const { autoAdvance = false, shotIndex = 0, shotTotal = 0 } = options;
    Ui.setShootingNextVisible(false);
    const hud = document.getElementById('hit-target-hud');
    if (hud) {
      hud.textContent = '';
      hud.classList.add('hidden');
      hud.classList.remove('is-pop');
    }
    Ui.showScreen('screen-shooting');
    const shotBadge = document.getElementById('shooting-shot-badge');
    if (shotBadge) {
      if (autoAdvance && shotIndex > 0) {
        shotBadge.textContent = `${shotIndex} / ${shotTotal}발`;
        shotBadge.classList.remove('hidden');
      } else {
        shotBadge.classList.add('hidden');
      }
    }

    const container = document.getElementById('canvas-container');
    mountArcheryThree(container, visualRow);
    const { scene } = getThreeContext();
    const zoneSprites = {
      backdrop: visualRow.backdrop_sprite_url || '',
      OUTER:    visualRow.outer_sprite_url    || '',
      MIDDLE:   visualRow.middle_sprite_url   || '',
      CENTER:   visualRow.center_sprite_url   || '',
      BULLSEYE: visualRow.bullseye_sprite_url || '',
    };
    const { meshes, outerRadii } = buildTargetRings(scene, COLORS, zoneSprites);
    const hitVec = ringHitPosition(result.hit_zone, outerRadii);
    const arrow = createArrowGroup();
    const flightPlan = planArrowFlight(hitVec);

    const fly = Number(visualRow.arrow_flight_ms) || 300;
    const trailMs = Number(visualRow.trail_fade_ms) || 500;
    const pulseMs = Number(visualRow.hit_ring_pulse_ms) || 200;

    await animateArrowFlight(scene, arrow, hitVec, fly, flightPlan);
    const trailSegs = 20;
    const trailPts = [];
    for (let i = 0; i <= trailSegs; i++) {
      const u = i / trailSegs;
      const tt = easeOutCubic(u);
      trailPts.push(sampleFlightPosition(flightPlan, hitVec, tt));
    }
    await createTrailLine(scene, trailPts, trailMs);

    addBulletHole(scene, hitVec);
    Ui.shakeShootingFrame();
    const mesh = meshes[result.hit_zone] || meshes.BULLSEYE;
    await flashRing(mesh, pulseMs);

    if (hud) {
      const z = (result.hit_zone || 'OUTER').toLowerCase();
      hud.className = `hit-target-hud hit-${z}`;
      hud.innerHTML = `<span class="hud-hit">${HIT_LABELS[result.hit_zone] || ''}</span><span class="hud-sep">·</span><span class="hud-pts">+${result.score}점</span>`;
      hud.classList.remove('hidden', 'is-pop');
      void hud.offsetWidth;
      hud.classList.add('is-pop');
    }

    const popTotal = Math.max(900, Number(visualRow.score_popup_total_ms) || 1000);
    await new Promise((r) => setTimeout(r, popTotal));

    scene.remove(arrow);
    arrow.traverse((ch) => {
      if (ch.geometry) ch.geometry.dispose();
      if (ch.material) ch.material.dispose();
    });

    if (result.hit_zone === 'BULLSEYE' && !autoAdvance) {
      disposeArcheryThree();
      openBullseye(result.score, rankBefore, rankAfter);
      return;
    }

    if (autoAdvance) {
      if (result.hit_zone === 'BULLSEYE') spawnBullParticles(visualRow);
      scene.remove(arrow);
      arrow.traverse((ch) => {
        if (ch.geometry) ch.geometry.dispose();
        if (ch.material) ch.material.dispose();
      });
      disposeArcheryThree();
      return;
    }

    Ui.setShootingNextVisible(true);
    const nextBtn = document.getElementById('btn-shooting-next');
    nextBtn.onclick = () => {
      nextBtn.onclick = null;
      Ui.setShootingNextVisible(false);
      disposeArcheryThree();
      goLobby();
      applyRankFx(rankBefore, rankAfter);
    };
  }

  function openBullseye(points, rankBefore, rankAfter) {
    Ui.showScreen('screen-bullseye');
    spawnBullParticles(visualRow);
    const el = document.getElementById('bullseye-count');
    const ms = Number(visualRow.bullseye_countup_ms) || 800;
    const start = performance.now();
    const target = Number(points) || 100;
    function tick() {
      const t = Math.min(1, (performance.now() - start) / ms);
      el.textContent = String(Math.round(t * target));
      if (t < 1) requestAnimationFrame(tick);
    }
    tick();

    document.getElementById('btn-bullseye-confirm').onclick = () => {
      document.getElementById('bullseye-particles').innerHTML = '';
      goLobby();
      applyRankFx(rankBefore, rankAfter);
    };
  }

  document.getElementById('btn-claim-reward').onclick = () => {
    const panel = document.getElementById('reward-tier-desc');
    if (panel) panel.innerHTML = buildRewardHtml(loaded.rewards, eventRow.event_id, player.rank_current);
    Ui.showScreen('screen-reward');
  };

  document.getElementById('btn-reward-confirm').onclick = () => {
    const rows = loaded.rewards.filter((r) => String(r.event_id) === String(eventRow.event_id));
    const m = rows.find((x) => player.rank_current >= Number(x.rank_min) && player.rank_current <= Number(x.rank_max));
    const bundleId = m?.reward_bundle_id ?? '';
    const grantList = (loaded.bundleRewards?.[String(bundleId)] ?? []).map((r) => ({
      kind: r.kind,
      amount: r.amount,
      slotId: r.slotId,
    }));
    if (window.parent !== window) {
      window.parent.postMessage({
        type: 'event:grant',
        bundleId,
        rewards: grantList,
      }, '*');
      window.parent.postMessage({ type: 'aa:claimed' }, '*');
    }
    Ui.toast('보상을 수령했습니다');
    startNewTournamentPeriod();
  };
}
