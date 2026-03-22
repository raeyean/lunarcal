// src/utils/zodiacStorage.ts
import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = 'userZodiac';

export async function getZodiac(): Promise<string | null> {
  return AsyncStorage.getItem(STORAGE_KEY);
}

export async function setZodiac(animal: string): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEY, animal);
}
