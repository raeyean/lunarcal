import { z } from 'zod';

export const BirthProfileSchema = z.object({
  version: z.literal(1),
  solarDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  solarTime: z.string().regex(/^\d{2}:\d{2}$/).nullable(),
  gender: z.enum(['male', 'female']).nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const SavedDateSchema = z.object({
  id: z.string().uuid(),
  label: z.string().min(1).max(50),
  solarDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  createdAt: z.string(),
});

export const SavedDatesArraySchema = z.array(SavedDateSchema);

export type BirthProfileInput = z.infer<typeof BirthProfileSchema>;
export type SavedDateInput = z.infer<typeof SavedDateSchema>;
