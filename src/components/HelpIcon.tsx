import React from 'react';
import { Text } from 'react-native';
import { SymbolView } from 'expo-symbols';

interface HelpIconProps {
  size?: number;
  color: string;
}

export function HelpIcon({ size = 16, color }: HelpIconProps) {
  return (
    <SymbolView
      name="questionmark.circle"
      size={size}
      tintColor={color}
      weight="regular"
      resizeMode="scaleAspectFit"
      fallback={
        <Text
          style={{
            color,
            fontSize: size,
            fontWeight: '600',
            lineHeight: size * 1.1,
          }}
        >
          ?
        </Text>
      }
    />
  );
}
