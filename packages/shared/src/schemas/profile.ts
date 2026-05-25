/**
 * Zod schemas for locally-persisted profile data.
 *
 * Note: solarDate/solarTime regexes validate FORMAT only, not calendar validity.
 * Semantic validation (e.g. month <= 12, hour <= 23) is the responsibility of
 * computeBazi (see packages/shared/src/bazi/compute.ts).
 *
 * The inferred types (BirthProfile, SavedDate) are the canonical type definitions
 * for these shapes — bazi/types.ts re-exports them.
 */
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

export type BirthProfile = z.infer<typeof BirthProfileSchema>;
export type SavedDate = z.infer<typeof SavedDateSchema>;
