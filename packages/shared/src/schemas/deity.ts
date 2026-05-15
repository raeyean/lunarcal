import { z } from 'zod';

export const DeityKindSchema = z.enum(['fo', 'pusa', 'shen', 'dao']);

export const DeityDaySchema = z.object({
  name: z.string(),
  deity: z.string(),
  kind: DeityKindSchema,
});

export const DeityResponseSchema = z.object({
  deity: DeityDaySchema.nullable(),
});

export const DeityListResponseSchema = z.object({
  days: z.array(
    z.object({
      lunarMonth: z.number(),
      lunarDay: z.number(),
      ...DeityDaySchema.shape,
    }),
  ),
});
