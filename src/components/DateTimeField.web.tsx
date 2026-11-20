import React, { useState } from 'react';
import { useTheme } from '../context/ThemeContext';
import { Fonts } from '../constants/typography';
import type { DateTimeFieldProps, DateTimePickerEvent } from './dateTimeFieldTypes';

const pad = (n: number) => String(n).padStart(2, '0');

function toYmd(d: Date): string {
  return `${String(d.getFullYear()).padStart(4, '0')}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

function toHm(d: Date): string {
  return `${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

/**
 * Turns the input's string into a Date, or returns null when the string is empty,
 * malformed or outside [minimumDate, maximumDate].
 * Dates are built from local components (local midnight), never parsed as UTC.
 */
function parse(
  raw: string,
  mode: DateTimeFieldProps['mode'],
  base: Date,
  min?: Date,
  max?: Date,
): Date | null {
  if (mode === 'date') {
    const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(raw);
    if (!m) return null;
    if ((min && raw < toYmd(min)) || (max && raw > toYmd(max))) return null;
    const d = new Date(base);
    d.setFullYear(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
    d.setHours(0, 0, 0, 0);
    return d;
  }
  const m = /^(\d{2}):(\d{2})/.exec(raw);
  if (!m) return null;
  const d = new Date(base);
  d.setHours(Number(m[1]), Number(m[2]), 0, 0);
  return d;
}

/**
 * Web DateTimeField: the browser's native date/time input, with the same
 * value/onChange contract as the community DateTimePicker. Invalid, cleared or
 * out-of-range input never reaches onChange; the field snaps back to the last
 * valid value on blur.
 */
export function DateTimeField({
  value,
  mode,
  minimumDate,
  maximumDate,
  onChange,
  accessibilityLabel,
}: DateTimeFieldProps) {
  const { colors, isDark } = useTheme();
  const format = mode === 'date' ? toYmd : toHm;
  const valueStr = format(value);

  // Draft lets the user type through intermediate states (e.g. year 0001 → 1985)
  // without the controlled input snapping back on every keystroke.
  const [draft, setDraft] = useState(valueStr);
  const [syncedValue, setSyncedValue] = useState(valueStr);
  if (syncedValue !== valueStr) {
    setSyncedValue(valueStr);
    setDraft(valueStr);
  }

  const handleChange = (raw: string) => {
    setDraft(raw);
    const next = parse(raw, mode, value, minimumDate, maximumDate);
    if (!next) return;
    const event: DateTimePickerEvent = {
      type: 'set',
      nativeEvent: { timestamp: next.getTime(), utcOffset: -next.getTimezoneOffset() },
    };
    onChange(event, next);
  };

  return (
    <input
      type={mode}
      value={draft}
      min={mode === 'date' && minimumDate ? toYmd(minimumDate) : undefined}
      max={mode === 'date' && maximumDate ? toYmd(maximumDate) : undefined}
      aria-label={accessibilityLabel}
      onChange={(e) => handleChange(e.currentTarget.value)}
      onBlur={() => setDraft(valueStr)}
      style={{
        colorScheme: isDark ? 'dark' : 'light',
        color: colors.foreground,
        backgroundColor: colors.surface,
        border: `1px solid ${colors.line}`,
        borderRadius: 8,
        padding: '6px 10px',
        fontFamily: Fonts.inter,
        fontSize: 16,
        minHeight: 36,
      }}
    />
  );
}
