import { z } from 'zod';

export const ActivityItemSchema = z.object({
  term: z.string(),
  description: z.string().nullable(),
});

export const YiJiResponseSchema = z.object({
  yi: z.array(ActivityItemSchema),
  ji: z.array(ActivityItemSchema),
});
