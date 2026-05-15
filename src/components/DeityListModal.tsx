import React, { useEffect, useRef, useState, useMemo } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  Animated,
  TouchableWithoutFeedback,
  FlatList,
  ActivityIndicator,
} from 'react-native';
import { useDeityList } from '../api/hooks';
import { useTheme } from '../context/ThemeContext';
import { Typography } from '../constants/typography';
import { Spacing } from '../constants/spacing';
import { Radius } from '../constants/radius';
import { deityColor, DEITY_LABEL, type DeityKind } from '../constants/colors';
import { IconButton } from './IconButton';

interface DeityListModalProps {
  visible: boolean;
  onClose: () => void;
}

interface DeityRow {
  lunarMonth: number;
  lunarDay: number;
  name: string;
  deity: string;
  kind: DeityKind;
}

export function DeityListModal({ visible, onClose }: DeityListModalProps) {
  const { colors } = useTheme();
  const [modalVisible, setModalVisible] = useState(false);
  const slideAnim = useRef(new Animated.Value(1000)).current;

  const { data, isLoading, error } = useDeityList();

  useEffect(() => {
    if (visible) {
      setModalVisible(true);
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

  const rows = useMemo<DeityRow[]>(() => {
    if (!data) return [];
    return [...data.days].sort((a, b) => {
      if (a.lunarMonth !== b.lunarMonth) return a.lunarMonth - b.lunarMonth;
      return a.lunarDay - b.lunarDay;
    });
  }, [data]);

  return (
    <Modal visible={modalVisible} animationType="none" transparent statusBarTranslucent>
      <View style={styles.container}>
        <TouchableWithoutFeedback onPress={onClose}>
          <View style={[styles.overlay, { backgroundColor: colors.overlay }]} />
        </TouchableWithoutFeedback>
        <Animated.View
          style={[
            styles.sheet,
            { backgroundColor: colors.background, transform: [{ translateY: slideAnim }] },
          ]}
        >
          <View style={styles.header}>
            <View>
              <Text style={[styles.title, { color: colors.foreground }]}>神誕日曆</Text>
              <Text style={[Typography.subtitle, { color: colors.muted }]}>
                {rows.length > 0 ? `${rows.length} 個神誕日 · 來自 /api/deity` : 'from /api/deity'}
              </Text>
            </View>
            <IconButton onPress={onClose} accessibilityLabel="關閉" variant="ghost">
              <Text style={[styles.closeButton, { color: colors.primary }]}>完成</Text>
            </IconButton>
          </View>

          {isLoading && (
            <View style={styles.center}>
              <ActivityIndicator color={colors.primary} />
              <Text style={[Typography.body, { color: colors.muted, marginTop: Spacing.sm }]}>
                Loading…
              </Text>
            </View>
          )}

          {error && !isLoading && (
            <View style={styles.center}>
              <Text style={[Typography.body, { color: colors.primary }]}>
                Error: {error.message}
              </Text>
            </View>
          )}

          {!isLoading && !error && rows.length > 0 && (
            <FlatList
              data={rows}
              keyExtractor={(item) => `${item.lunarMonth}-${item.lunarDay}`}
              renderItem={({ item }) => (
                <DeityRowView item={item} colors={colors} />
              )}
              contentContainerStyle={styles.listContent}
              ItemSeparatorComponent={() => (
                <View style={[styles.divider, { backgroundColor: colors.divider }]} />
              )}
            />
          )}
        </Animated.View>
      </View>
    </Modal>
  );
}

interface DeityRowViewProps {
  item: DeityRow;
  colors: ReturnType<typeof useTheme>['colors'];
}

function DeityRowView({ item, colors }: DeityRowViewProps) {
  const accent = deityColor(item.kind, colors);
  return (
    <View style={styles.row}>
      <View style={[styles.datePill, { backgroundColor: accent + '20' }]}>
        <Text style={[Typography.bodyMedium, { color: accent }]}>
          {item.lunarMonth}.{item.lunarDay}
        </Text>
      </View>
      <View style={styles.rowBody}>
        <Text style={[Typography.bodyMedium, { color: colors.foreground }]}>{item.name}</Text>
        <Text style={[Typography.subtitle, { color: colors.muted }]}>{item.deity}</Text>
      </View>
      <View style={[styles.kindChip, { borderColor: accent }]}>
        <View style={[styles.kindDot, { backgroundColor: accent }]} />
        <Text style={[Typography.microCaption, { color: accent }]}>
          {DEITY_LABEL[item.kind]}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'flex-end' },
  overlay: { ...StyleSheet.absoluteFillObject },
  sheet: {
    height: '85%',
    borderTopLeftRadius: Radius.xl,
    borderTopRightRadius: Radius.xl,
    paddingTop: Spacing.lg,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: Spacing.xl,
    paddingBottom: Spacing.md,
  },
  title: {
    ...Typography.headingLG,
  },
  closeButton: {
    ...Typography.bodyMedium,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    paddingHorizontal: Spacing.xl,
    paddingBottom: Spacing.xxl,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.md,
    gap: Spacing.md,
  },
  datePill: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: Radius.sm,
    minWidth: 48,
    alignItems: 'center',
  },
  rowBody: { flex: 1 },
  kindChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: Radius.pill,
    borderWidth: StyleSheet.hairlineWidth,
  },
  kindDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
  },
});
