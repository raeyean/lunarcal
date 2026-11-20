import React, { useEffect } from 'react';
import { Text, StyleSheet } from 'react-native';
import { DateTimePickerAndroid } from '@react-native-community/datetimepicker';
import { useTheme } from '../context/ThemeContext';
import { Fonts } from '../constants/typography';
import { PressableScale } from './PressableScale';
import type { DateTimeFieldProps } from './dateTimeFieldTypes';

const pad = (n: number) => String(n).padStart(2, '0');

function formatValue(d: Date, mode: DateTimeFieldProps['mode']): string {
  return mode === 'date'
    ? `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
    : `${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

/**
 * Android DateTimeField. The community DateTimePicker component renders nothing
 * on Android and opens its dialog from an effect on mount and on every prop
 * change (issue #34), so this shows the current value as a pressable and
 * opens the dialog imperatively only when tapped.
 */
export function DateTimeField({
  value,
  mode,
  minimumDate,
  maximumDate,
  onChange,
  accessibilityLabel,
}: DateTimeFieldProps) {
  const { colors } = useTheme();
  const label = formatValue(value, mode);

  // Close an open dialog if the form unmounts underneath it.
  useEffect(() => () => {
    void DateTimePickerAndroid.dismiss(mode);
  }, [mode]);

  const open = () => {
    DateTimePickerAndroid.open({
      value,
      mode,
      minimumDate,
      maximumDate,
      is24Hour: true,
      onValueChange: (event, date) => {
        onChange({ type: 'set', nativeEvent: event.nativeEvent }, date);
      },
    });
  };

  return (
    <PressableScale
      onPress={open}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ? `${accessibilityLabel} ${label}` : label}
      style={[styles.field, { backgroundColor: colors.surface, borderColor: colors.line }]}
    >
      <Text style={[styles.text, { color: colors.foreground }]}>{label}</Text>
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  field: {
    borderWidth: StyleSheet.hairlineWidth * 2,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    minHeight: 40,
    justifyContent: 'center',
  },
  text: {
    fontFamily: Fonts.inter,
    fontSize: 16,
  },
});
