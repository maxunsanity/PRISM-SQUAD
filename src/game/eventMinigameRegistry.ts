/**
 * iframe 미니게임 이벤트 — Lava / Prize Drop / Archery 호스트 SSoT
 * 런타임 메타는 event_minigame_host_config.csv → loadAllGameData → initEventMinigamesFromData
 */
import type { EventMinigameHostConfig } from './data';

export type EventMinigameConfig = EventMinigameHostConfig & {
  id: EventMinigameId;
};

export type EventMinigameId = 'lava' | 'prize' | 'archery';

const FALLBACK: Record<EventMinigameId, EventMinigameConfig> = {
  lava: {
    id: 'lava',
    label: '라바',
    emoji: '🌋',
    tabBg: '#FFB347',
    src: '/event/lavaQuest/index.html',
    ticketPath: '',
    ticketCost: 0,
    ticketUnit: '장',
    showFlag: '/lobby/showLavaQuest',
    persistKeys: ['lq_session_v1'],
    durationHours: 48,
    enabled: true,
  },
  prize: {
    id: 'prize',
    label: '퍼즐',
    emoji: '🎰',
    tabBg: '#B388FF',
    src: '/event/prizeDrop/index.html',
    ticketPath: '/lobby/prizeBalls',
    ticketCost: 0,
    ticketUnit: '개',
    showFlag: '/lobby/showPrizeDrop',
    persistKeys: [],
    durationHours: 24,
    enabled: true,
  },
  archery: {
    id: 'archery',
    label: '양궁',
    emoji: '🏹',
    tabBg: '#7EC8A8',
    src: '/event/archeryArena/index.html',
    ticketPath: '/lobby/archeryBowStands',
    ticketCost: 0,
    ticketUnit: '발',
    showFlag: '/lobby/showArcheryArena',
    persistKeys: ['aa_player_state', 'aa_event_meta', 'aa_ranking_bots', 'aa_ranking_dummy_schema'],
    durationHours: 48,
    enabled: true,
  },
};

let EVENT_MINIGAMES: Record<string, EventMinigameConfig> = { ...FALLBACK };
let EVENT_MINIGAME_ORDER: EventMinigameId[] = ['lava', 'prize', 'archery'];

function isKnownId(id: string): id is EventMinigameId {
  return id === 'lava' || id === 'prize' || id === 'archery';
}

/** CSV 로드 직후 App에서 1회 호출 */
export function initEventMinigamesFromData(rows: EventMinigameHostConfig[], order?: string[]) {
  const next: Record<string, EventMinigameConfig> = { ...FALLBACK };
  const ord: EventMinigameId[] = [];
  for (const row of rows) {
    if (!row.enabled || !isKnownId(row.id)) continue;
    next[row.id] = { ...row, id: row.id };
    ord.push(row.id);
  }
  if (order?.length) {
    for (const id of order) {
      if (isKnownId(id) && next[id] && !ord.includes(id)) ord.push(id);
    }
  }
  EVENT_MINIGAMES = next;
  EVENT_MINIGAME_ORDER = ord.length ? ord : ['lava', 'prize', 'archery'];
}

export { EVENT_MINIGAMES, EVENT_MINIGAME_ORDER };
