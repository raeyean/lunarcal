import React from 'react';
import { View } from 'react-native';
import Svg, { Path } from 'react-native-svg';

interface ChevronProps {
  expanded?: boolean;
  size?: number;
  color: string;
}

/**
 * Chevron rendered with SVG strokes — no SF Symbols / font glyph dependency,
 * so it renders identically on iOS, Android, and web.
 */
export function Chevron({ expanded = false, size = 14, color }: ChevronProps) {
  const rotation = expanded ? '180deg' : '0deg';
  const stroke = Math.max(1.5, size / 8);

  return (
    <View style={{ transform: [{ rotate: rotation }] }}>
      <Svg width={size} height={size} viewBox="0 0 24 24">
        <Path
          d="M5 9l7 7 7-7"
          stroke={color}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
      </Svg>
    </View>
  );
}
