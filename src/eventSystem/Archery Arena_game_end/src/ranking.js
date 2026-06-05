import { rollInt } from './mechanics.js';
import { loadBots, saveBots } from './data.js';

const ME_ID = 'player_me';

/** localStorage 더미 데이터 버전 — 스키마 바꾸면 봇 분포만 초기화됨 */
export const RANKING_DUMMY_SCHEMA = 'v2-lowtier';

const SCHEMA_KEY = 'aa_ranking_dummy_schema';

function makeBotName(i) {
  return `궁수${String(i).padStart(2, '0')}`;
}

/**
 * 테스트용: 점수 0인 약한 봇 다수 + 상위권만 점수 보유 → 플레이어(0)는 항상 꼴찌 부근,
 * 첫 시도(소량 점수)만으로도 등수가 오름. 동점 시 플레이어는 맨 뒤(꼴찌)로 정렬.
 */
export function buildInitialRanking(groupSize) {
  const list = [];
  list.push({
    id: ME_ID,
    display_name: '나',
    score: 0,
    is_me: true,
    is_bot: false,
  });
  const weakZeros = 22;
  for (let i = 1; i < groupSize; i++) {
    let score;
    if (i <= weakZeros) score = 0;
    else score = rollInt(6, 340);
    list.push({
      id: `bot_${i}`,
      display_name: makeBotName(i),
      score,
      is_me: false,
      is_bot: true,
    });
  }
  return list;
}

export function mergeSavedBots(list, saved) {
  if (!saved || !Array.isArray(saved)) return list;
  const byId = new Map(saved.map((s) => [s.id, s]));
  return list.map((e) => {
    if (byId.has(e.id)) {
      const s = byId.get(e.id);
      return { ...e, score: Number(s.score) || 0 };
    }
    return e;
  });
}

export function ensureRanking(groupSize) {
  const schema = localStorage.getItem(SCHEMA_KEY);
  const saved = loadBots();
  let list = buildInitialRanking(groupSize);
  if (schema === RANKING_DUMMY_SCHEMA && saved && saved.length === groupSize) {
    list = mergeSavedBots(list, saved);
  } else {
    saveBots(
      list.map(({ id, display_name, score, is_me, is_bot }) => ({
        id,
        display_name,
        score,
        is_me,
        is_bot,
      }))
    );
    localStorage.setItem(SCHEMA_KEY, RANKING_DUMMY_SCHEMA);
  }
  return list;
}

export function persistRanking(entries) {
  saveBots(entries.map(({ id, display_name, score, is_me, is_bot }) => ({ id, display_name, score, is_me, is_bot })));
}

/**
 * 점수 내림차순. 동점이면 플레이어(`is_me`)를 항상 그 등급 맨 뒤 → 꼴찌 패턴 유지·역전 체감↑
 */
export function sortAndRank(entries) {
  const sorted = [...entries].sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    if (a.is_me === b.is_me) return 0;
    return a.is_me ? 1 : -1;
  });
  sorted.forEach((e, idx) => {
    e.rank = idx + 1;
  });
  return sorted;
}

export function applyMyScore(entries, newScore) {
  return entries.map((e) => (e.is_me ? { ...e, score: newScore } : e));
}

/**
 * Pick 1..3 bots that are not currently rank 1 (spec: rank1 bot rarely boosted).
 */
export function pickBotsToBoost(ranked) {
  const first = ranked[0];
  const pool = ranked.filter((e) => e.is_bot && e.id !== first?.id);
  const n = rollInt(1, 3);
  const picks = [];
  const copy = [...pool];
  for (let k = 0; k < n && copy.length; k++) {
    const idx = rollInt(0, copy.length - 1);
    picks.push(copy.splice(idx, 1)[0]);
  }
  return picks;
}

export function runBotTick(entries, ranked) {
  const boost = pickBotsToBoost(ranked);
  for (const b of boost) {
    const add = rollInt(1, 50);
    b.score += add;
  }
  persistRanking(entries);
}

export { ME_ID };
