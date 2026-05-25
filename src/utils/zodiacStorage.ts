// src/utils/zodiacStorage.ts
import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = 'userZodiac';

const VALID_ZODIACS = new Set([
  '鼠', '牛', '虎', '兔', '龍', '蛇',
  '馬', '羊', '猴', '雞', '狗', '豬',
]);

export async function getZodiac(): Promise<string | null> {
  const value = await AsyncStorage.getItem(STORAGE_KEY);
  if (value === null) return null;
  return VALID_ZODIACS.has(value) ? value : null;
}

export async function setZodiac(animal: string): Promise<void> {
  if (!VALID_ZODIACS.has(animal)) {
    throw new Error(`Invalid zodiac animal: ${animal}`);
  }
  await AsyncStorage.setItem(STORAGE_KEY, animal);
}
