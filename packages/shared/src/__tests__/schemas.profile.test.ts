import { describe, it, expect } from 'vitest';
import {
  BirthProfileSchema,
  SavedDateSchema,
  SavedDatesArraySchema,
} from '../schemas/profile';

const validProfile = {
  version: 1,
  solarDate: '1990-06-15',
  solarTime: '14:30',
  gender: 'male',
  createdAt: '2026-05-18T00:00:00.000Z',
  updatedAt: '2026-05-18T00:00:00.000Z',
};

describe('BirthProfileSchema', () => {
  it('accepts a full valid profile', () => {
    expect(BirthProfileSchema.safeParse(validProfile).success).toBe(true);
  });

  it('accepts profile with null time and null gender', () => {
    const p = { ...validProfile, solarTime: null, gender: null };
    expect(BirthProfileSchema.safeParse(p).success).toBe(true);
  });

  it('rejects unknown version', () => {
    expect(BirthProfileSchema.safeParse({ ...validProfile, version: 2 }).success).toBe(false);
  });

  it('rejects malformed date', () => {
    expect(BirthProfileSchema.safeParse({ ...validProfile, solarDate: '1990/6/15' }).success).toBe(false);
  });

  it('rejects unexpected gender values', () => {
    expect(BirthProfileSchema.safeParse({ ...validProfile, gender: 'other' }).success).toBe(false);
  });
});

const validSaved = {
  id: '550e8400-e29b-41d4-a716-446655440000',
  label: '婚禮',
  solarDate: '2026-10-20',
  createdAt: '2026-05-18T00:00:00.000Z',
};

describe('SavedDateSchema', () => {
  it('accepts valid saved date', () => {
    expect(SavedDateSchema.safeParse(validSaved).success).toBe(true);
  });

  it('rejects empty label', () => {
    expect(SavedDateSchema.safeParse({ ...validSaved, label: '' }).success).toBe(false);
  });

  it('rejects malformed id', () => {
    expect(SavedDateSchema.safeParse({ ...validSaved, id: 'not-a-uuid' }).success).toBe(false);
  });
});

describe('SavedDatesArraySchema', () => {
  it('accepts empty array', () => {
    expect(SavedDatesArraySchema.safeParse([]).success).toBe(true);
  });

  it('accepts array of valid saved dates', () => {
    expect(SavedDatesArraySchema.safeParse([validSaved, validSaved]).success).toBe(true);
  });

  it('rejects whole array if one item is bad', () => {
    expect(
      SavedDatesArraySchema.safeParse([validSaved, { ...validSaved, label: '' }]).success,
    ).toBe(false);
  });
});
