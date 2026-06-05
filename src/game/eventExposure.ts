/**
 * 이벤트 노출 시간 — 사이드탭 남은시간 카운트다운 (호스트가 노출 관리)
 *  - 각 이벤트의 duration_hours(event_minigame_host_config.csv)로 endMs 산정.
 *  - 최초 노출 시점을 영속(localStorage)해 카운트다운 → 만료 시 탭 숨김.
 *  - duration_hours<=0 이면 상시 노출(무기한).
 */
const KEY = 'prism_event_exposure_v1';

type EpochMap = Record<string, number>;

function load(): EpochMap {
  try { return JSON.parse(localStorage.getItem(KEY) || '{}') as EpochMap; }
  catch { return {}; }
}
function save(m: EpochMap) {
  try { localStorage.setItem(KEY, JSON.stringify(m)); } catch { /* ignore */ }
}

/** 이벤트 종료 시각(ms). 최초 호출 시 now+duration 으로 앵커 후 영속. */
export function getEventEndMs(id: string, durationHours: number): number {
  if (!(durationHours > 0)) return Infinity; // 무기한 노출
  const m = load();
  if (!m[id] || !Number.isFinite(m[id])) {
    m[id] = Date.now() + durationHours * 3600_000;
    save(m);
  }
  return m[id];
}

/** 남은 시간(ms). 무기한이면 Infinity, 만료면 <=0. */
export function getEventRemainMs(id: string, durationHours: number): number {
  const end = getEventEndMs(id, durationHours);
  return end === Infinity ? Infinity : end - Date.now();
}

/** 남은시간 표기 — 시즌/타이쿤/쇼핑몰/드라이버 컨트롤러 formatTimer 와 동일 규칙.
 *  초 없음, 아이콘 없음: "H시간 M분" / "M분" (무기한이면 빈 문자열) */
export function formatRemain(ms: number): string {
  if (ms === Infinity) return '';
  if (ms <= 0) return '종료';
  const sec = Math.floor(ms / 1000);
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  if (h > 0) return `${h}시간 ${m}분`;
  return `${m}분`;
}
