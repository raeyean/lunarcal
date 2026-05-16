/**
 * Apply an alpha (0..1) to a color string. Accepts:
 *   #rgb       → rgba(r,g,b,a)
 *   #rrggbb    → rgba(r,g,b,a)
 *   #rrggbbaa  → rgba(r,g,b,a)   (input alpha replaced)
 *   rgb(...)   → rgba(...)
 *   rgba(...)  → rgba with replaced alpha
 * For unrecognised input the original string is returned.
 */
export function withOpacity(color: string, alpha: number): string {
  const a = Math.min(1, Math.max(0, alpha));

  if (color.startsWith('#')) {
    const hex = color.slice(1);
    let r: number, g: number, b: number;
    if (hex.length === 3) {
      r = parseInt(hex[0] + hex[0], 16);
      g = parseInt(hex[1] + hex[1], 16);
      b = parseInt(hex[2] + hex[2], 16);
    } else if (hex.length === 6 || hex.length === 8) {
      r = parseInt(hex.slice(0, 2), 16);
      g = parseInt(hex.slice(2, 4), 16);
      b = parseInt(hex.slice(4, 6), 16);
    } else {
      return color;
    }
    return `rgba(${r},${g},${b},${a})`;
  }

  const rgbMatch = color.match(/^rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/i);
  if (rgbMatch) {
    return `rgba(${rgbMatch[1]},${rgbMatch[2]},${rgbMatch[3]},${a})`;
  }

  return color;
}
