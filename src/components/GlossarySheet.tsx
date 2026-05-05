import React, { useEffect, useRef } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableWithoutFeedback,
  StyleSheet,
  Animated,
} from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { Typography, Fonts } from '../constants/typography';
import { Spacing } from '../constants/spacing';
import { Radius } from '../constants/radius';
import { IconButton } from './IconButton';

export type GlossaryTermId =
  | 'tianGanDiZhi'
  | 'jianChu'
  | 'pengZuBaiJi'
  | 'jieqi'
  | 'jiShen'
  | 'yiJi'
  | 'yi'
  | 'ji'
  | 'fangwei'
  | 'xiuSong';

interface GlossaryEntry {
  title: string;
  description: string;
}

const GLOSSARY: Record<GlossaryTermId, GlossaryEntry> = {
  tianGanDiZhi: {
    title: '天干地支',
    description:
      '天干地支 — 中國傳統紀年法。十天干配十二地支，組成六十甲子循環。用於記錄年、月、日、時。',
  },
  jianChu: {
    title: '建除十二神',
    description:
      '建除十二神 — 古代曆法以建、除、滿、平、定、執、破、危、成、收、開、閉十二神輪值，用於判斷每日宜忌。',
  },
  pengZuBaiJi: {
    title: '彭祖百忌',
    description:
      '彭祖百忌 — 相傳彭祖根據天干地支歸納的每日禁忌，提醒在特定日子避免特定行為。',
  },
  jieqi: {
    title: '節氣',
    description:
      '節氣 — 一年分二十四節氣，反映季節氣候變化，指導農事活動。',
  },
  jiShen: {
    title: '吉神宜趨',
    description:
      '吉神宜趨 — 當日當值的吉神方位與宜行之事。',
  },
  yiJi: {
    title: '宜忌',
    description:
      '宜忌 — 根據黃曆判斷當日適合（宜）與不宜（忌）進行的活動。',
  },
  yi: {
    title: '宜',
    description:
      '宜 — 黃曆中當日推薦進行的事項。古人依據天干地支、值日星神、節氣等綜合推算，列出當日順利吉祥之事，例如祭祀、嫁娶、出行、開市、動土等，提醒擇吉日行事，可順勢而為。',
  },
  ji: {
    title: '忌',
    description:
      '忌 — 黃曆中當日不宜進行的事項。傳統擇日學認為某些行為在特定日子易遇阻滯或不順，例如安葬、入宅、開市、嫁娶等，建議避開以免招致沖煞，宜延後或另擇吉日。',
  },
  fangwei: {
    title: '方位',
    description:
      '方位 — 當日吉凶方位指引，包含財神、喜神、貴神所在。',
  },
  xiuSong: {
    title: '二十八宿',
    description:
      '二十八宿 — 古代天文劃分黃道附近恆星為二十八宿，用於擇日及占卜。',
  },
};

interface GlossarySheetProps {
  visible: boolean;
  termId: GlossaryTermId | null;
  onClose: () => void;
}

export function GlossarySheet({ visible, termId, onClose }: GlossarySheetProps) {
  const { colors } = useTheme();
  const slideAnim = useRef(new Animated.Value(300)).current;
  const [modalVisible, setModalVisible] = React.useState(false);

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
        toValue: 300,
        duration: 200,
        useNativeDriver: true,
      }).start(() => setModalVisible(false));
    }
  }, [visible]);

  const entry = termId ? GLOSSARY[termId] : null;

  return (
    <Modal visible={modalVisible} animationType="none" transparent statusBarTranslucent>
      <View style={styles.container}>
        <TouchableWithoutFeedback onPress={onClose}>
          <View style={[styles.overlay, { backgroundColor: colors.overlay }]} />
        </TouchableWithoutFeedback>
        <Animated.View
          style={[
            styles.sheet,
            {
              backgroundColor: colors.background,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          <View style={styles.header}>
            <Text style={[styles.title, { color: colors.foreground }]}>
              {entry?.title ?? ''}
            </Text>
            <IconButton
              onPress={onClose}
              accessibilityLabel="關閉"
              variant="ghost"
              style={styles.closeButton}
            >
              <Text style={[styles.closeGlyph, { color: colors.primary }]}>✕</Text>
            </IconButton>
          </View>
          {entry ? (
            <Text style={[styles.description, { color: colors.subtleText }]}>
              {entry.description}
            </Text>
          ) : null}
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
  },
  sheet: {
    borderTopLeftRadius: Radius.xl,
    borderTopRightRadius: Radius.xl,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.md,
    paddingHorizontal: Spacing.xl,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  title: {
    ...Typography.cardTitle,
  },
  closeButton: {
    minWidth: 44,
    minHeight: 44,
  },
  closeGlyph: {
    fontFamily: Fonts.outfitSemiBold,
    fontSize: 16,
  },
  description: {
    fontFamily: Fonts.inter,
    fontSize: 15,
    lineHeight: 24,
  },
});
