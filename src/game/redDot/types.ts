/** 레드닷 3축 — claim(보상) / action(사용 가능) / new(미방문) */
export type RedDotCategory = 'claim' | 'action' | 'new';

export type RedDotConfigRow = {
  dot_id: string;
  category: RedDotCategory;
  enabled: boolean;
  hud_path: string;
  resolver_key: string;
  min_int: number;
  bubble_to: string;
  note: string;
};

export type RedDotResolver = (ctx: RedDotResolverContext) => boolean;

export type RedDotResolverContext = {
  minInt: number;
  /** 2차 패스 집계용 — 동일 refresh 내 이미 계산된 dot */
  partial?: Record<string, boolean>;
  /** new_first_visit 등 — CSV dot_id */
  dotId?: string;
};
