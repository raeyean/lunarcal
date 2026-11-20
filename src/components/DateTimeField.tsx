import React from 'react';
import DateTimePicker from '@react-native-community/datetimepicker';
import type { DateTimeFieldProps } from './dateTimeFieldTypes';

/**
 * Date/time picker field. On iOS and Android this is the community DateTimePicker
 * with the props passed straight through; the web build uses DateTimeField.web.tsx.
 */
export function DateTimeField(props: DateTimeFieldProps) {
  return <DateTimePicker {...props} />;
}
