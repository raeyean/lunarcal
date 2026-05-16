import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { Radius } from '../constants/radius';
import { withOpacity } from '../constants/colorUtils';

interface DragHandleProps {
  style?: ViewStyle;
}

export function DragHandle({ style }: DragHandleProps) {
  const { colors } = useTheme();

  return (
    <View style={[styles.wrapper, style]} accessible={false}>
      <View style={[styles.handle, { backgroundColor: withOpacity(colors.muted, 0.5) }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  handle: {
    width: 36,
    height: 4,
    borderRadius: Radius.pill,
  },
});
