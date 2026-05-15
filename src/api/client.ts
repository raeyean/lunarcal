import { z } from 'zod';
import {
  YiJiResponseSchema,
  DirectionsResponseSchema,
  DeityResponseSchema,
  DeityListResponseSchema,
} from '@lunarcal/shared';

const BASE_URL = (
  process.env.EXPO_PUBLIC_API_TRIGGER_URL ?? 'https://api-oi2eku5jpq-de.a.run.app'
).replace(/\/$/, '');

async function fetchJson<S extends z.ZodTypeAny>(
  path: string,
  schema: S,
): Promise<z.infer<S>> {
  const res = await fetch(`${BASE_URL}${path}`);
  if (!res.ok) {
    throw new Error(`API ${res.status} ${res.statusText}: ${path}`);
  }
  const json = await res.json();
  return schema.parse(json);
}

export type YiJiResponse = z.infer<typeof YiJiResponseSchema>;
export type DirectionsResponse = z.infer<typeof DirectionsResponseSchema>;
export type DeityResponse = z.infer<typeof DeityResponseSchema>;
export type DeityListResponse = z.infer<typeof DeityListResponseSchema>;

export const api = {
  yiji: (year: number, month: number, day: number) =>
    fetchJson(`/api/yiji/${year}/${month}/${day}`, YiJiResponseSchema),
  directions: (year: number, month: number, day: number) =>
    fetchJson(`/api/directions/${year}/${month}/${day}`, DirectionsResponseSchema),
  deity: (lunarMonth: number, lunarDay: number) =>
    fetchJson(`/api/deity/${lunarMonth}/${lunarDay}`, DeityResponseSchema),
  deityList: () =>
    fetchJson('/api/deity', DeityListResponseSchema),
};
