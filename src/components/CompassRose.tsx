import React from 'react';
import { View } from 'react-native';
import Svg, { Circle, Line, Text as SvgText, G } from 'react-native-svg';
import { useTheme } from '../context/ThemeContext';
import { Fonts } from '../constants/typography';

interface CompassRoseProps {
  /** keyed by 财神/喜神/福神/阳贵/阴贵 → cardinal name (e.g. "正北") */
  directions: Record<string, string>;
  size?: number;
}

const DIR_ANGLES: Record<string, number> = {
  正北: 0, 北: 0, '東北': 45, 正東: 90, 東: 90,
  '東南': 135, '正南': 180, 南: 180, '西南': 225,
  '正西': 270, 西: 270, '西北': 315,
  // simplified fallbacks
  '东北': 45, '东南': 135, '正东': 90, '东': 90,
};

/** Editorial compass rose used by the Daily / Detail views. */
export function CompassRose({ directions, size = 200 }: CompassRoseProps) {
  const { colors } = useTheme();
  const cx = size / 2, cy = size / 2, r = size * 0.39;
  const items = Object.entries(directions);
  const markerColors = [colors.primary, colors.accent, colors.deityShen, colors.deityDao, colors.info];

  const a11yLabel = items.length
    ? `方位羅盤：${items.map(([name, dir]) => `${name}在${dir}`).join('；')}`
    : '方位羅盤';

  return (
    <View
      style={{ alignItems: 'center', paddingVertical: 4 }}
      accessible
      accessibilityRole="image"
      accessibilityLabel={a11yLabel}
    >
      <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <Circle cx={cx} cy={cy} r={r} fill="none" stroke={colors.line} strokeWidth={1} />
        <Circle cx={cx} cy={cy} r={r * 0.66} fill="none" stroke={colors.lineSoft} strokeWidth={0.5} />
        {[0, 45, 90, 135, 180, 225, 270, 315].map(a => {
          const rad = ((a - 90) * Math.PI) / 180;
          const x1 = cx + Math.cos(rad) * (r - 4);
          const y1 = cy + Math.sin(rad) * (r - 4);
          const x2 = cx + Math.cos(rad) * (r + 4);
          const y2 = cy + Math.sin(rad) * (r + 4);
          return (
            <Line key={a} x1={x1} y1={y1} x2={x2} y2={y2} stroke={colors.inkSoft} strokeWidth={1} />
          );
        })}
        {[['北', 0], ['東', 90], ['南', 180], ['西', 270]].map(([t, a]) => {
          const rad = (((a as number) - 90) * Math.PI) / 180;
          const x = cx + Math.cos(rad) * (r + 14);
          const y = cy + Math.sin(rad) * (r + 14) + 4;
          return (
            <SvgText
              key={t as string}
              x={x}
              y={y}
              fontSize={11}
              fill={colors.muted}
              textAnchor="middle"
              fontFamily={Fonts.outfitBold}
            >
              {t as string}
            </SvgText>
          );
        })}
        {items.map(([name, dir], i) => {
          const a = DIR_ANGLES[dir] ?? 0;
          const rad = ((a - 90) * Math.PI) / 180;
          const x = cx + Math.cos(rad) * (r * 0.55);
          const y = cy + Math.sin(rad) * (r * 0.55);
          const fill = markerColors[i % markerColors.length];
          return (
            <G key={name}>
              <Circle cx={x} cy={y} r={14} fill={fill} opacity={0.92} />
              <SvgText
                x={x}
                y={y + 4}
                fontSize={11}
                fill={colors.onPrimary}
                textAnchor="middle"
                fontFamily={Fonts.outfitBold}
              >
                {name[0]}
              </SvgText>
            </G>
          );
        })}
        <Circle cx={cx} cy={cy} r={4} fill={colors.foreground} />
      </Svg>
    </View>
  );
}
