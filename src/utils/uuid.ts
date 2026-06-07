/**
 * RFC 4122 v4 UUID generator.
 *
 * Prefers expo-crypto's native CSPRNG (getRandomValues) when the native module
 * is available — i.e. in standalone / dev-client builds. Falls back to
 * Math.random in environments where the native module is absent (e.g. Expo Go),
 * so the app never hard-crashes at startup.
 *
 * These IDs key local-only AsyncStorage records (saved dates). They never leave
 * the device and are not security-sensitive, so the Math.random fallback is
 * acceptable; the CSPRNG path is used wherever the native module exists.
 */

function fillRandom(bytes: Uint8Array): void {
  try {
    // Lazy require so a missing native module doesn't throw at import time.
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const Crypto = require('expo-crypto');
    if (Crypto && typeof Crypto.getRandomValues === 'function') {
      Crypto.getRandomValues(bytes);
      return;
    }
  } catch {
    // expo-crypto native module unavailable (e.g. Expo Go) — fall through.
  }
  for (let i = 0; i < bytes.length; i++) {
    bytes[i] = Math.floor(Math.random() * 256);
  }
}

export function uuid(): string {
  const bytes = new Uint8Array(16);
  fillRandom(bytes);
  // Version 4
  bytes[6] = (bytes[6] & 0x0f) | 0x40;
  // Variant bits
  bytes[8] = (bytes[8] & 0x3f) | 0x80;
  const hex = Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}
