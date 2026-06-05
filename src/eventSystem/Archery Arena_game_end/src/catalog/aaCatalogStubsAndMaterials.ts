/**
 * Archery Arena — CSV 데이터 경로 스텁 및 머티리얼 레지스트리
 *
 * 실제 CSV 파일은 /public/ 아래에 위치.
 * json-render 카탈로그가 이 경로를 참조해 데이터를 바인딩한다.
 */

export const AA_CSV_PATHS = {
  /** 도전 시도 설정 (attempt_type, dice_cost, score_min, score_max 등) */
  attemptConfig: 'aa_attempt_config.csv',

  /** 이벤트 메타 설정 (event_id, group_size, event_name 등) */
  eventConfig: 'aa_event_config.csv',

  /** 비주얼 설정 (bullseye_particle_count, bullseye_particle_radius_px 등) */
  visualConfig: 'aa_visual_config.csv',

  /** 순위 구간·bundle_id (UI) */
  rankRewardConfig: 'aa_rank_reward_config.csv',

  /** PRISM·세션·5발·100킬 (key-value) — 배포: /event/archeryArena/ */
  integrationConfig: 'aa_integration_config.csv',

  /** event:grant SSoT */
  bundleRewardConfig: 'aa_bundle_reward_config.csv',
} as const;

export type AACsvKey = keyof typeof AA_CSV_PATHS;

/**
 * HUD 머티리얼 정의
 * json-render 렌더러가 참조하는 스타일 토큰
 */
export const AA_HUD_MATERIALS = {
  hudBg: 'rgba(0,0,0,0.45)',
  hudText: '#ffffff',
  hudAccent: '#FFD700',
  hudRadius: 4,
  hudPadding: '4px 8px',
  hudFontSize: 11,
  hudFontFamily: 'monospace',
} as const;
