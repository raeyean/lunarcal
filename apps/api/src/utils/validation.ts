/**
 * Validate a (year, month, day) tuple as a real Gregorian date.
 * Catches impossible dates like 2026/2/30 or 2026/4/31 that pass simple range checks.
 */
export function isValidSolarDate(year: number, month: number, day: number): boolean {
  if (!Number.isInteger(year) || !Number.isInteger(month) || !Number.isInteger(day)) return false;
  if (month < 1 || month > 12) return false;
  if (day < 1 || day > 31) return false;
  const date = new Date(year, month - 1, day);
  return date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day;
}
