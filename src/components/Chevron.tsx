import React from 'react';
import { Text, View } from 'react-native';
import { SymbolView } from 'expo-symbols';

interface ChevronProps {
  expanded?: boolean;
  size?: number;
  color: string;
}

export function Chevron({ expanded = false, size = 14, color }: ChevronProps) {
  const rotation = expanded ? '180deg' : '0deg';

  return (
    <View style={{ transform: [{ rotate: rotation }] }}>
      <SymbolView
        name="chevron.down"
        size={size}
        tintColor={color}
        weight="semibold"
        resizeMode="scaleAspectFit"
        fallback={
          <Text style={{ color, fontSize: size, lineHeight: size * 1.1 }}>⌄</Text>
        }
      />
    </View>
  );
}
