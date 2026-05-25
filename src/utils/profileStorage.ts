/**
 * Local-only persistence for birth profile and saved dates.
 *
 * PRIVACY: Birth profile data (date, time, gender) and saved-date data MUST stay on-device.
 * Never include any value from this module in network requests, analytics events, or
 * crash-report payloads.
 */
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  BirthProfileSchema,
  SavedDateSchema,
  SavedDatesArraySchema,
  type BirthProfile,
  type SavedDate,
} from '@lunarcal/shared';
import { uuid } from './uuid';

const KEY_PROFILE = '@lunarcal/birthProfile';
const KEY_SAVED_DATES = '@lunarcal/savedDates';

export type ProfileInput = {
  solarDate: string;
  solarTime: string | null;
  gender: 'male' | 'female' | null;
};

export async function getProfile(): Promise<BirthProfile | null> {
  try {
    const raw = await AsyncStorage.getItem(KEY_PROFILE);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    const result = BirthProfileSchema.safeParse(parsed);
    if (!result.success) {
      console.warn('[profileStorage] profile schema mismatch, treating as absent');
      return null;
    }
    return result.data;
  } catch (e) {
    console.warn('[profileStorage] getProfile failed', e);
    return null;
  }
}

export async function setProfile(input: ProfileInput): Promise<BirthProfile> {
  const now = new Date().toISOString();
  const existing = await getProfile();
  const profile: BirthProfile = {
    version: 1,
    solarDate: input.solarDate,
    solarTime: input.solarTime,
    gender: input.gender,
    createdAt: existing?.createdAt ?? now,
    updatedAt: now,
  };
  const validated = BirthProfileSchema.parse(profile);     // throws on bad input
  await AsyncStorage.setItem(KEY_PROFILE, JSON.stringify(validated));
  return validated;
}

export async function clearProfile(): Promise<void> {
  await AsyncStorage.removeItem(KEY_PROFILE);
}

export async function getSavedDates(): Promise<SavedDate[]> {
  try {
    const raw = await AsyncStorage.getItem(KEY_SAVED_DATES);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    // Filter out malformed individual items rather than rejecting the whole array.
    const good: SavedDate[] = [];
    for (const item of parsed) {
      const r = SavedDateSchema.safeParse(item);
      if (r.success) good.push(r.data);
      else console.warn('[profileStorage] dropped malformed saved date', item);
    }
    return good;
  } catch (e) {
    console.warn('[profileStorage] getSavedDates failed', e);
    return [];
  }
}

async function writeSavedDates(items: SavedDate[]): Promise<void> {
  const validated = SavedDatesArraySchema.parse(items);
  await AsyncStorage.setItem(KEY_SAVED_DATES, JSON.stringify(validated));
}

export async function addSavedDate(label: string, solarDate: string): Promise<SavedDate> {
  const item: SavedDate = {
    id: uuid(),
    label: label.trim(),
    solarDate,
    createdAt: new Date().toISOString(),
  };
  const current = await getSavedDates();
  const next = [...current, item];
  await writeSavedDates(next);
  return item;
}

export async function removeSavedDate(id: string): Promise<void> {
  const current = await getSavedDates();
  await writeSavedDates(current.filter((d) => d.id !== id));
}

export async function updateSavedDate(
  id: string,
  patch: Partial<Pick<SavedDate, 'label' | 'solarDate'>>,
): Promise<SavedDate | null> {
  const current = await getSavedDates();
  const idx = current.findIndex((d) => d.id === id);
  if (idx === -1) return null;
  const updated: SavedDate = { ...current[idx], ...patch };
  const next = [...current];
  next[idx] = updated;
  await writeSavedDates(next);
  return updated;
}

export async function clearSavedDates(): Promise<void> {
  await AsyncStorage.removeItem(KEY_SAVED_DATES);
}
