import * as Crypto from 'expo-crypto';

/**
 * RFC 4122 v4 UUID generator using expo-crypto getRandomValues (CSPRNG).
 * Uses native CSPRNG on iOS/Android and Web Crypto API on web.
 */
export function uuid(): string {
  const bytes = new Uint8Array(16);
  Crypto.getRandomValues(bytes);
  // Set version 4
  bytes[6] = (bytes[6] & 0x0f) | 0x40;
  // Set variant bits
  bytes[8] = (bytes[8] & 0x3f) | 0x80;
  const hex = Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join('');
  return `${hex.slice(0,8)}-${hex.slice(8,12)}-${hex.slice(12,16)}-${hex.slice(16,20)}-${hex.slice(20)}`;
}
