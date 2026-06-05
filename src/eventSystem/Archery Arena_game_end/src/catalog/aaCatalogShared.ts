import { z } from 'zod';

/** 동적 문자열 바인딩 (상태키 or 리터럴) */
export const dynStr = z.string();

/** 동적 숫자 바인딩 (상태키 or 리터럴) */
export const dynNum = z.union([z.string(), z.number()]);

/** HUD 바인딩 prop — 상태 키를 직접 지정 */
export const hudBindProp = z.object({
  bind: z.string(),
});

export type DynStr = z.infer<typeof dynStr>;
export type DynNum = z.infer<typeof dynNum>;
export type HudBindProp = z.infer<typeof hudBindProp>;
