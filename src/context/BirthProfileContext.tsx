import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import {
  getProfile,
  setProfile as writeProfile,
  clearProfile as wipeProfile,
  getSavedDates,
  addSavedDate as addSaved,
  removeSavedDate as removeSaved,
  updateSavedDate as updateSaved,
  clearSavedDates as wipeSavedDates,
  type ProfileInput,
} from '../utils/profileStorage';
import type { BirthProfile, SavedDate } from '@lunarcal/shared';

interface BirthProfileContextValue {
  profile: BirthProfile | null;
  savedDates: SavedDate[];
  isLoading: boolean;
  saveProfile: (input: ProfileInput) => Promise<void>;
  clearProfile: (alsoClearSavedDates: boolean) => Promise<void>;
  addSavedDate: (label: string, solarDate: string) => Promise<void>;
  removeSavedDate: (id: string) => Promise<void>;
  updateSavedDate: (id: string, patch: Partial<Pick<SavedDate, 'label' | 'solarDate'>>) => Promise<void>;
}

const BirthProfileContext = createContext<BirthProfileContextValue | null>(null);

export function BirthProfileProvider({ children }: { children: React.ReactNode }) {
  const [profile, setProfile] = useState<BirthProfile | null>(null);
  const [savedDates, setSavedDates] = useState<SavedDate[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [p, s] = await Promise.all([getProfile(), getSavedDates()]);
        if (!cancelled) {
          setProfile(p);
          setSavedDates(s);
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const saveProfile = useCallback(async (input: ProfileInput) => {
    const next = await writeProfile(input);
    setProfile(next);
  }, []);

  const clearProfile = useCallback(async (alsoClearSavedDates: boolean) => {
    await wipeProfile();
    if (alsoClearSavedDates) {
      await wipeSavedDates();
      setSavedDates([]);
    }
    setProfile(null);
  }, []);

  const addSavedDate = useCallback(async (label: string, solarDate: string) => {
    const created = await addSaved(label, solarDate);
    setSavedDates((prev) => [...prev, created]);
  }, []);

  const removeSavedDate = useCallback(async (id: string) => {
    await removeSaved(id);
    setSavedDates((prev) => prev.filter((d) => d.id !== id));
  }, []);

  const updateSavedDate = useCallback(
    async (id: string, patch: Partial<Pick<SavedDate, 'label' | 'solarDate'>>) => {
      const updated = await updateSaved(id, patch);
      if (!updated) return;
      setSavedDates((prev) => prev.map((d) => (d.id === id ? updated : d)));
    },
    [],
  );

  const value: BirthProfileContextValue = {
    profile,
    savedDates,
    isLoading,
    saveProfile,
    clearProfile,
    addSavedDate,
    removeSavedDate,
    updateSavedDate,
  };

  return (
    <BirthProfileContext.Provider value={value}>{children}</BirthProfileContext.Provider>
  );
}

export function useBirthProfile(): BirthProfileContextValue {
  const ctx = useContext(BirthProfileContext);
  if (!ctx) throw new Error('useBirthProfile must be used inside <BirthProfileProvider>');
  return ctx;
}
