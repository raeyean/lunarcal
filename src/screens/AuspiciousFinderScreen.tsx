// src/screens/AuspiciousFinderScreen.tsx
import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  FlatList,
  ActivityIndicator,
  StyleSheet,
  Modal,
  Animated,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../context/ThemeContext';
import { Fonts } from '../constants/typography';
import { ActivityPicker } from '../components/ActivityPicker';
import { ZodiacPicker } from '../components/ZodiacPicker';
import { AuspiciousResultCard } from '../components/AuspiciousResultCard';
import { IconButton } from '../components/IconButton';
import { scanChunk, AuspiciousResult } from '../utils/auspiciousScan';
import { getZodiac, setZodiac } from '../utils/zodiacStorage';
import { Spacing } from '../constants/spacing';
import { Radius } from '../constants/radius';

const RANGE_OPTIONS = [30, 60, 90, 180];
const SEPARATOR_STYLE = { height: 8 };
const ItemSeparator = () => <View style={SEPARATOR_STYLE} />;

interface AuspiciousFinderScreenProps {
  visible: boolean;
  onClose: () => void;
  onSelectDate: (year: number, month: number, day: number) => void;
}

export function AuspiciousFinderScreen({ visible, onClose, onSelectDate }: AuspiciousFinderScreenProps) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();

  const [activity, setActivity] = useState<string | null>(null);
  const [zodiac, setZodiacState] = useState<string | null>(null);
  const [range, setRange] = useState(90);
  const [results, setResults] = useState<AuspiciousResult[]>([]);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const nextStartDate = useRef<Date>(new Date());

  const [modalVisible, setModalVisible] = useState(false);
  const slideAnim = useRef(new Animated.Value(1000)).current;

  useEffect(() => {
    if (visible) {
      setModalVisible(true);
      getZodiac().then(saved => {
        if (saved) setZodiacState(saved);
      });
      Animated.spring(slideAnim, {
        toValue: 0,
        useNativeDriver: true,
        tension: 65,
        friction: 11,
      }).start();
    } else {
      Animated.timing(slideAnim, {
        toValue: 1000,
        duration: 200,
        useNativeDriver: true,
      }).start(() => setModalVisible(false));
    }
  }, [visible, slideAnim]);

  const handleZodiacSelect = useCallback((animal: string) => {
    setZodiacState(animal);
    setZodiac(animal);
  }, []);

  const handleSearch = useCallback(() => {
    if (!activity) return;

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const maxDate = new Date(today);
    maxDate.setDate(maxDate.getDate() + range);

    setLoading(true);
    setSearched(true);
    setSearchError(null);

    // Use setTimeout to let the UI update before scanning
    setTimeout(() => {
      try {
        const result = scanChunk(activity, zodiac, today, 30, maxDate);
        setResults(result.results);
        setHasMore(result.hasMore);
        nextStartDate.current = result.nextStartDate;
      } catch {
        setSearchError('搜索失敗，請稍後再試');
        setResults([]);
        setHasMore(false);
      } finally {
        setLoading(false);
      }
    }, 50);
  }, [activity, zodiac, range]);

  const handleLoadMore = useCallback(() => {
    if (!activity || loading || !hasMore) return;

    const maxDate = new Date();
    maxDate.setHours(0, 0, 0, 0);
    maxDate.setDate(maxDate.getDate() + range);

    setLoading(true);
    setTimeout(() => {
      try {
        const result = scanChunk(activity, zodiac, nextStartDate.current, 30, maxDate);
        setResults(prev => [...prev, ...result.results]);
        setHasMore(result.hasMore);
        nextStartDate.current = result.nextStartDate;
      } catch {
        setSearchError('載入失敗，請稍後再試');
        setHasMore(false);
      } finally {
        setLoading(false);
      }
    }, 50);
  }, [activity, zodiac, range, loading, hasMore]);

  const handleResultPress = useCallback((result: AuspiciousResult) => {
    onSelectDate(result.date.year, result.date.month, result.date.day);
    onClose();
  }, [onSelectDate, onClose]);

  const handleClose = useCallback(() => {
    // Reset search state on close
    setResults([]);
    setSearched(false);
    setHasMore(false);
    setSearchError(null);
    setActivity(null);
    onClose();
  }, [onClose]);

  const renderFooter = () => {
    if (loading) {
      return (
        <View style={styles.footer}>
          <ActivityIndicator color={colors.primary} />
          <Text style={[styles.footerText, { color: colors.muted }]}>載入更多...</Text>
        </View>
      );
    }
    if (searched && !hasMore && results.length > 0) {
      return (
        <View style={styles.footer}>
          <Text style={[styles.footerText, { color: colors.muted }]}>搜索範圍內沒有更多吉日</Text>
        </View>
      );
    }
    return null;
  };

  return (
    <Modal visible={modalVisible} animationType="none" transparent>
      <Animated.View style={[
        styles.container,
        { backgroundColor: colors.background, transform: [{ translateY: slideAnim }] },
      ]}>
        {/* Header */}
        <View style={[styles.header, { paddingTop: insets.top + Spacing.md }]}>
          <IconButton
            onPress={handleClose}
            accessibilityLabel="關閉"
            variant="ghost"
          >
            <Text style={[styles.closeIcon, { color: colors.muted }]}>{'✕'}</Text>
          </IconButton>
          <Text style={[styles.title, { color: colors.foreground }]}>擇吉日</Text>
          <View style={styles.headerSpacer} />
        </View>

        {!searched ? (
          <View style={styles.formContainer}>
            <ScrollView
              style={styles.formScroll}
              contentContainerStyle={[styles.formContent, { paddingBottom: 80 + insets.bottom }]}
            >
              {/* Activity Picker */}
              <Text style={[styles.sectionLabel, { color: colors.muted }]}>選擇活動</Text>
              <ActivityPicker selected={activity} onSelect={setActivity} />

              {/* Zodiac Picker */}
              <Text style={[styles.sectionLabel, { color: colors.muted, marginTop: Spacing.xl }]}>你的生肖</Text>
              <ZodiacPicker selected={zodiac} onSelect={handleZodiacSelect} />

              {/* Range Selector */}
              <Text style={[styles.sectionLabel, { color: colors.muted, marginTop: Spacing.xl }]}>搜索範圍</Text>
              <View style={styles.rangeRow}>
                {RANGE_OPTIONS.map(option => {
                  const isSelected = range === option;
                  return (
                    <TouchableOpacity
                      key={option}
                      style={[
                        styles.rangeChip,
                        {
                          backgroundColor: isSelected ? colors.primary : colors.surface,
                        },
                      ]}
                      onPress={() => setRange(option)}
                      accessibilityRole="button"
                      accessibilityLabel={`${option}天範圍`}
                      accessibilityState={{ selected: isSelected }}
                    >
                      <Text style={[
                        styles.rangeText,
                        { color: isSelected ? colors.onPrimary : colors.foreground },
                      ]}>
                        {option} 天
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </ScrollView>

            {/* Sticky Search CTA */}
            <View style={[
              styles.stickyFooter,
              {
                backgroundColor: colors.background,
                borderTopColor: colors.divider,
                paddingBottom: insets.bottom + Spacing.md,
              },
            ]}>
              <TouchableOpacity
                style={[
                  styles.searchButton,
                  { backgroundColor: activity ? colors.primary : colors.badgeBg },
                  !activity && { opacity: 0.5 },
                ]}
                onPress={handleSearch}
                disabled={!activity}
                accessibilityRole="button"
                accessibilityLabel="搜索吉日"
                accessibilityState={{ disabled: !activity }}
              >
                <Text style={[
                  styles.searchButtonText,
                  { color: activity ? colors.onPrimary : colors.muted },
                ]}>
                  搜索吉日
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <View style={styles.resultsContainer}>
            {/* Filter summary */}
            <View style={styles.filterSummary}>
              <View style={[styles.filterChip, { backgroundColor: colors.surface }]}>
                <Text style={[styles.filterChipText, { color: colors.primary }]}>{activity}</Text>
              </View>
              {zodiac && (
                <View style={[styles.filterChip, { backgroundColor: colors.surface }]}>
                  <Text style={[styles.filterChipText, { color: colors.primary }]}>{zodiac}</Text>
                </View>
              )}
              <View style={[styles.filterChip, { backgroundColor: colors.surface }]}>
                <Text style={[styles.filterChipText, { color: colors.muted }]}>{range} 天</Text>
              </View>
              <IconButton
                onPress={() => { setSearched(false); setResults([]); setHasMore(false); setSearchError(null); }}
                accessibilityLabel="修改搜尋條件"
                variant="ghost"
              >
                <Text style={[styles.modifyText, { color: colors.primary }]}>✎ 修改</Text>
              </IconButton>
            </View>

            {searchError && !loading ? (
              <View style={styles.emptyState}>
                <Text style={[styles.emptyTitle, { color: colors.foreground }]}>
                  搜索失敗
                </Text>
                <Text style={[styles.emptySubtitle, { color: colors.muted }]}>
                  {searchError}
                </Text>
                <TouchableOpacity
                  style={[styles.retryButton, { backgroundColor: colors.primary }]}
                  onPress={handleSearch}
                  accessibilityRole="button"
                  accessibilityLabel="重試"
                >
                  <Text style={[styles.retryButtonText, { color: colors.onPrimary }]}>
                    重試
                  </Text>
                </TouchableOpacity>
              </View>
            ) : results.length === 0 && !loading ? (
              <View style={styles.emptyState}>
                <Text style={[styles.emptyTitle, { color: colors.foreground }]}>
                  找不到吉日
                </Text>
                <Text style={[styles.emptySubtitle, { color: colors.muted }]}>
                  在未來 {range} 天內沒有適合「{activity}」的吉日，試試延長搜索範圍
                </Text>
              </View>
            ) : (
              <FlatList
                data={results}
                keyExtractor={(item) => `${item.date.year}-${item.date.month}-${item.date.day}`}
                renderItem={({ item }) => (
                  <AuspiciousResultCard
                    result={item}
                    matchedActivity={activity!}
                    onPress={() => handleResultPress(item)}
                  />
                )}
                contentContainerStyle={styles.resultsList}
                ItemSeparatorComponent={ItemSeparator}
                onEndReached={handleLoadMore}
                onEndReachedThreshold={0.3}
                ListHeaderComponent={
                  <Text style={[styles.resultCount, { color: colors.muted }]}>
                    找到 {results.length} 個吉日{hasMore ? '...' : ''}
                  </Text>
                }
                ListFooterComponent={renderFooter}
              />
            )}
          </View>
        )}
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.md,
  },
  headerSpacer: {
    width: 44,
    height: 44,
  },
  closeIcon: {
    fontSize: 18,
    fontWeight: '600',
  },
  formContainer: {
    flex: 1,
  },
  stickyFooter: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.md,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  title: {
    fontFamily: Fonts.outfitBold,
    fontSize: 18,
  },
  formScroll: {
    flex: 1,
  },
  formContent: {
    paddingHorizontal: Spacing.xl,
    paddingBottom: Spacing.xxxl,
  },
  sectionLabel: {
    fontFamily: Fonts.outfitSemiBold,
    fontSize: 12,
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: Spacing.md,
  },
  rangeRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  rangeChip: {
    flex: 1,
    borderRadius: Radius.md,
    paddingVertical: Spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 44,
  },
  rangeText: {
    fontFamily: Fonts.outfitSemiBold,
    fontSize: 13,
  },
  searchButton: {
    borderRadius: Radius.lg,
    paddingVertical: Spacing.lg,
    alignItems: 'center',
  },
  searchButtonText: {
    fontFamily: Fonts.outfitBold,
    fontSize: 16,
  },
  resultsContainer: {
    flex: 1,
  },
  filterSummary: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingHorizontal: Spacing.xl,
    paddingBottom: Spacing.md,
    flexWrap: 'wrap',
  },
  filterChip: {
    borderRadius: Radius.lg,
    paddingVertical: Spacing.xs,
    paddingHorizontal: Spacing.md,
  },
  filterChipText: {
    fontFamily: Fonts.interMedium,
    fontSize: 12,
  },
  modifyText: {
    fontFamily: Fonts.outfitSemiBold,
    fontSize: 13,
  },
  resultCount: {
    fontFamily: Fonts.inter,
    fontSize: 12,
    marginBottom: Spacing.md,
  },
  resultsList: {
    paddingHorizontal: Spacing.xl,
    paddingBottom: Spacing.xxxl,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.xxxl,
  },
  emptyTitle: {
    fontFamily: Fonts.outfitBold,
    fontSize: 18,
    marginBottom: Spacing.sm,
  },
  emptySubtitle: {
    fontFamily: Fonts.inter,
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  retryButton: {
    marginTop: Spacing.lg,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.xxl,
    borderRadius: Radius.lg,
    minHeight: 44,
    justifyContent: 'center',
  },
  retryButtonText: {
    fontFamily: Fonts.outfitBold,
    fontSize: 14,
  },
  footer: {
    alignItems: 'center',
    paddingVertical: Spacing.lg,
    gap: Spacing.sm,
  },
  footerText: {
    fontFamily: Fonts.inter,
    fontSize: 12,
  },
});
