import { z } from 'zod';

export const DirectionsSchema = z.object({
  財神: z.string(),
  喜神: z.string(),
  福神: z.string(),
  陽貴: z.string(),
  陰貴: z.string(),
});

export const DirectionsResponseSchema = z.object({
  directions: DirectionsSchema,
});
