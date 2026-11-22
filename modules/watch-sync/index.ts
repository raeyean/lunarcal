import { Platform } from 'react-native';
import { requireOptionalNativeModule } from 'expo-modules-core';

type WatchSyncNativeModule = {
  syncZodiac(zodiac: string): boolean;
};

/**
 * Push the zodiac selection to the paired Apple Watch.
 * No-ops (returns false) on Android/Web or when the native
 * module is unavailable — same graceful-fallback pattern as expo-crypto usage.
 */
export function syncZodiacToWatch(zodiac: string): boolean {
  if (Platform.OS !== 'ios') return false;
  const native = requireOptionalNativeModule<WatchSyncNativeModule>('WatchSync');
  if (!native) return false;
  try {
    return native.syncZodiac(zodiac);
  } catch {
    return false;
  }
}
