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
  // Display tier — hero numerals, splash type
  displayXL: {
    fontFamily: Fonts.outfitBlack,
    fontSize: 76,
    letterSpacing: -2,
    lineHeight: 88,
  } as TextStyle,
  displayL: {
    fontFamily: Fonts.outfitBlack,
    fontSize: 36,
    letterSpacing: -1,
    lineHeight: 44,
  } as TextStyle,

  // Heading tier
  heroGanzhi: {
    fontFamily: Fonts.outfitBlack,
    fontSize: 40,
    letterSpacing: -1,
    lineHeight: 48,
  } as TextStyle,
  headingLG: {
    fontFamily: Fonts.outfitExtraBold,
    fontSize: 28,
    letterSpacing: -0.5,
    lineHeight: 34,
  } as TextStyle,
  screenHeader: {
    fontFamily: Fonts.outfitExtraBold,
    fontSize: 20,
    letterSpacing: -0.5,
    lineHeight: 26,
  } as TextStyle,
  cardTitle: {
    fontFamily: Fonts.outfitExtraBold,
    fontSize: 20,
    lineHeight: 26,
  } as TextStyle,
  clashName: {
    fontFamily: Fonts.outfitExtraBold,
    fontSize: 16,
    lineHeight: 22,
  } as TextStyle,
  calendarDay: {
    fontFamily: Fonts.outfitBold,
    fontSize: 18,
    lineHeight: 22,
  } as TextStyle,
  calendarDayActive: {
    fontFamily: Fonts.outfitExtraBold,
    fontSize: 18,
    lineHeight: 22,
  } as TextStyle,
  sectionTitle: {
    fontFamily: Fonts.outfitBold,
    fontSize: 14,
    letterSpacing: 1,
    lineHeight: 20,
  } as TextStyle,
  toggleActive: {
    fontFamily: Fonts.outfitBold,
    fontSize: 13,
    lineHeight: 18,
  } as TextStyle,
  weekDay: {
    fontFamily: Fonts.outfitSemiBold,
    fontSize: 13,
    lineHeight: 18,
  } as TextStyle,
  dateSummary: {
    fontFamily: Fonts.outfitBold,
    fontSize: 14,
    lineHeight: 20,
  } as TextStyle,

  // Body tier
  jieqiBanner: {
    fontFamily: Fonts.interMedium,
    fontSize: 13,
    lineHeight: 18,
  } as TextStyle,
  body: {
    fontFamily: Fonts.inter,
    fontSize: 12,
    lineHeight: 18,
  } as TextStyle,
  bodyMedium: {
    fontFamily: Fonts.interMedium,
    fontSize: 13,
    lineHeight: 18,
  } as TextStyle,
  monthEnglish: {
    fontFamily: Fonts.inter,
    fontSize: 12,
    lineHeight: 16,
  } as TextStyle,

  // Caption tier
  subtitle: {
    fontFamily: Fonts.inter,
    fontSize: 11,
    lineHeight: 16,
  } as TextStyle,
  badgeText: {
    fontFamily: Fonts.interMedium,
    fontSize: 11,
    lineHeight: 14,
  } as TextStyle,
  lunarDateCell: {
    fontFamily: Fonts.inter,
    fontSize: 10,
    lineHeight: 13,
  } as TextStyle,
  microCaption: {
    fontFamily: Fonts.interMedium,
    fontSize: 9,
    lineHeight: 12,
    letterSpacing: 0.4,
  } as TextStyle,
} as const;
