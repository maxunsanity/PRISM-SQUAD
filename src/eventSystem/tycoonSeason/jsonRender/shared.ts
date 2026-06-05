import { z } from 'zod';

export const eventBindProp = z.union([
  z.object({ $state: z.string().startsWith('/event/') }),
  z.string(),
  z.number(),
  z.boolean(),
]);
