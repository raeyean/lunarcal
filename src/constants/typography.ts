import { TextStyle } from 'react-native';

export const Fonts = {
  outfit: 'Outfit_400Regular',
  outfitMedium: 'Outfit_500Medium',
  outfitSemiBold: 'Outfit_600SemiBold',
  outfitBold: 'Outfit_700Bold',
  outfitExtraBold: 'Outfit_800ExtraBold',
  outfitBlack: 'Outfit_900Black',
  inter: 'Inter_400Regular',
  interMedium: 'Inter_500Medium',
  interSemiBold: 'Inter_600SemiBold',
} as const;

export const Typography = {
  heroGanzhi: {
    fontFamily: Fonts.outfitBlack,
    fontSize: 40,
    letterSpacing: -1,
    lineHeight: 48,
  } as TextStyle,
  screenHeader: {
    fontFamily: Fonts.outfitExtraBold,
    fontSize: 20,
    letterSpacing: -0.5,
  } as TextStyle,
  calendarDay: {
    fontFamily: Fonts.outfitBold,
    fontSize: 18,
  } as TextStyle,
  calendarDayActive: {
    fontFamily: Fonts.outfitExtraBold,
    fontSize: 18,
  } as TextStyle,
  cardTitle: {
    fontFamily: Fonts.outfitExtraBold,
    fontSize: 20,
  } as TextStyle,
  sectionTitle: {
    fontFamily: Fonts.outfitBold,
    fontSize: 14,
    letterSpacing: 1,
  } as TextStyle,
  toggleActive: {
    fontFamily: Fonts.outfitBold,
    fontSize: 13,
  } as TextStyle,
  weekDay: {
    fontFamily: Fonts.outfitSemiBold,
    fontSize: 13,
  } as TextStyle,
  lunarDateCell: {
    fontFamily: Fonts.inter,
    fontSize: 10,
  } as TextStyle,
  jieqiBanner: {
    fontFamily: Fonts.interMedium,
    fontSize: 13,
  } as TextStyle,
  body: {
    fontFamily: Fonts.inter,
    fontSize: 12,
  } as TextStyle,
  bodyMedium: {
    fontFamily: Fonts.interMedium,
    fontSize: 13,
  } as TextStyle,
  subtitle: {
    fontFamily: Fonts.inter,
    fontSize: 11,
  } as TextStyle,
  monthEnglish: {
    fontFamily: Fonts.inter,
    fontSize: 12,
  } as TextStyle,
  dateSummary: {
    fontFamily: Fonts.outfitBold,
    fontSize: 14,
  } as TextStyle,
  clashName: {
    fontFamily: Fonts.outfitExtraBold,
    fontSize: 16,
  } as TextStyle,
  badgeText: {
    fontFamily: Fonts.interMedium,
    fontSize: 11,
  } as TextStyle,
} as const;
