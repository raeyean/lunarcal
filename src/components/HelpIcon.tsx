import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface HelpIconProps {
  size?: number;
  color: string;
}

/**
 * Cross-platform circular question-mark badge.
 * Drawn with View + Text so it renders identically on iOS, Android, and web —
 * no dependency on SF Symbols (which is iOS-only and falls back to a bare
 * glyph on Android, often making the icon invisible or hard to spot).
 */
export function HelpIcon({ size = 16, color }: HelpIconProps) {
  const borderWidth = Math.max(1, Math.round(size / 14));
  return (
    <View
      style={[
        styles.circle,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          borderWidth,
          borderColor: color,
        },
      ]}
    >
      <Text
        style={{
          color,
          fontSize: Math.round(size * 0.72),
          lineHeight: Math.round(size * 0.86),
          fontWeight: '700',
          textAlign: 'center',
          includeFontPadding: false,
        }}
        allowFontScaling={false}
      >
        ?
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  circle: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
