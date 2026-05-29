import { z } from 'zod';

/** HUD 동적 바인딩 prop — $state 경로 or 리터럴 */
export const hudBindProp = z.union([
  z.object({ $state: z.string().startsWith('/') }),
  z.string(),
  z.number(),
  z.boolean(),
]);

export type HudBindProp = z.infer<typeof hudBindProp>;
