import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../context/ThemeContext';
import { Fonts } from '../constants/typography';
import { Spacing } from '../constants/spacing';
import { Radius } from '../constants/radius';
import { AnimatedSheet } from './AnimatedSheet';
import { PressableScale } from './PressableScale';
import type { ActionMenuButton } from './ActionMenu';

export type { ActionMenuButton };

interface Request {
  title: string;
  message?: string;
  buttons: ActionMenuButton[];
}

let present: ((request: Request) => void) | null = null;

/**
 * Web version of `showActions` (issue #38). react-native-web's `Alert.alert` is
 * an empty function, so this hands the request to the mounted `ActionMenuHost`,
 * which shows it as a bottom sheet. Same arguments and button semantics as
 * `Alert.alert`: the `cancel` button sits apart at the bottom, and closing the
 * sheet (scrim click, Escape) counts as choosing it.
 */
export function showActions(title: string, message: string | undefined, buttons: ActionMenuButton[]) {
  if (!present) {
    console.warn('showActions: ActionMenuHost is not mounted');
    return;
  }
  present({ title, message, buttons });
}

/** Mount once near the app root, inside ThemeProvider and SafeAreaProvider. */
export function ActionMenuHost() {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const [request, setRequest] = useState<Request | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    present = (next) => {
      setRequest(next);
      setVisible(true);
    };
    return () => {
      present = null;
    };
  }, []);

  const cancel = request?.buttons.find((b) => b.style === 'cancel');
  const actions = request?.buttons.filter((b) => b.style !== 'cancel') ?? [];

  const choose = (button?: ActionMenuButton) => {
    setVisible(false);
    button?.onPress?.();
  };

  return (
    <AnimatedSheet
      visible={visible}
      onClose={() => choose(cancel)}
      onExited={() => setRequest(null)}
      style={{ paddingBottom: insets.bottom + Spacing.lg }}
    >
      {request ? (
        <View style={styles.body}>
          <Text style={[styles.title, { color: colors.foreground }]} accessibilityRole="header">
            {request.title}
          </Text>
          {request.message ? (
            <Text style={[styles.message, { color: colors.muted }]}>{request.message}</Text>
          ) : null}
          <View style={[styles.group, { backgroundColor: colors.surface, borderColor: colors.line }]}>
            {actions.map((b, i) => (
              <PressableScale
                key={`${i}-${b.text}`}
                onPress={() => choose(b)}
                accessibilityRole="button"
                style={[styles.action, i > 0 && { borderTopWidth: StyleSheet.hairlineWidth * 2, borderTopColor: colors.line }]}
              >
                <Text
                  style={[
                    styles.actionText,
                    { color: b.style === 'destructive' ? colors.primary : colors.foreground },
                  ]}
                >
                  {b.text}
                </Text>
              </PressableScale>
            ))}
          </View>
          <PressableScale
            onPress={() => choose(cancel)}
            accessibilityRole="button"
            style={[styles.group, styles.action, { backgroundColor: colors.surface, borderColor: colors.line }]}
          >
            <Text style={[styles.actionText, styles.cancelText, { color: colors.foreground }]}>
              {cancel?.text ?? '取消'}
            </Text>
          </PressableScale>
        </View>
      ) : null}
    </AnimatedSheet>
  );
}

const styles = StyleSheet.create({
  body: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.sm,
    gap: Spacing.md,
  },
  title: {
    fontFamily: Fonts.outfitBold,
    fontSize: 17,
    textAlign: 'center',
  },
  message: {
    fontFamily: Fonts.inter,
    fontSize: 14,
    textAlign: 'center',
    marginTop: -Spacing.sm,
  },
  group: {
    borderWidth: StyleSheet.hairlineWidth * 2,
    borderRadius: Radius.md,
    overflow: 'hidden',
  },
  action: {
    minHeight: 48,
    paddingHorizontal: Spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionText: {
    fontFamily: Fonts.inter,
    fontSize: 16,
  },
  cancelText: {
    fontFamily: Fonts.interSemiBold,
  },
});
