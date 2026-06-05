// @prizedrop-catalog-role #공통Zod #hudBindProp #bindRefProps
import { z } from 'zod';

export const hudBindProp = z.union([
  z.object({ $state: z.string().regex(/^\/hud\//).describe('hudStore 경로 — GameJsonHud Spec·syncHud 과 세트') }),
  z.string(),
  z.number(),
  z.boolean(),
]);

export const bindRefProps = z.object({
  bindsTo: z.string().optional().describe('같은 Spec 내 다른 element id 참조'),
});

export const emptySceneProps = z.object({});
