import type { DateTimePickerEvent } from '@react-native-community/datetimepicker';

export type { DateTimePickerEvent };

/**
 * Props shared by the native and web DateTimeField implementations.
 * Mirrors the subset of @react-native-community/datetimepicker that the forms use.
 */
export interface DateTimeFieldProps {
  value: Date;
  mode: 'date' | 'time';
  /** Native only. Ignored on web. */
  display?: 'default' | 'compact';
  minimumDate?: Date;
  maximumDate?: Date;
  onChange: (event: DateTimePickerEvent, date?: Date) => void;
  accessibilityLabel?: string;
}
