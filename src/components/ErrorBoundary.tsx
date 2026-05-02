import React from 'react';
import { Appearance, View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { LightColors, DarkColors } from '../constants/colors';
import { Typography } from '../constants/typography';
import { Spacing } from '../constants/spacing';
import { Radius } from '../constants/radius';

interface Props {
  children: React.ReactNode;
  fallbackMessage?: string;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

// ErrorBoundary cannot use the useTheme hook (class component, may render
// before ThemeProvider in worst-case crashes). Resolve theme via Appearance.
export class ErrorBoundary extends React.Component<Props, State> {
  state: State = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (!this.state.hasError) return this.props.children;

    const isDark = Appearance.getColorScheme() === 'dark';
    const palette = isDark ? DarkColors : LightColors;

    return (
      <View style={[styles.container, { backgroundColor: palette.background }]}>
        <Text style={styles.emoji}>⚠️</Text>
        <Text style={[styles.title, { color: palette.foreground }]}>
          {this.props.fallbackMessage ?? '發生錯誤'}
        </Text>
        <Text style={[styles.detail, { color: palette.subtleText }]} numberOfLines={3}>
          {this.state.error?.message}
        </Text>
        <TouchableOpacity
          style={[styles.button, { backgroundColor: palette.primary }]}
          onPress={this.handleReset}
          activeOpacity={0.7}
          accessibilityRole="button"
          accessibilityLabel="重試"
        >
          <Text style={[styles.buttonText, { color: palette.onPrimary }]}>重試</Text>
        </TouchableOpacity>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.xxl,
  },
  emoji: {
    fontSize: 40,
    marginBottom: Spacing.lg,
  },
  title: {
    ...Typography.cardTitle,
    marginBottom: Spacing.sm,
    textAlign: 'center',
  },
  detail: {
    ...Typography.bodyMedium,
    textAlign: 'center',
    marginBottom: Spacing.xl,
  },
  button: {
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.xl,
    borderRadius: Radius.xl,
    minHeight: 44,
    justifyContent: 'center',
  },
  buttonText: {
    ...Typography.toggleActive,
    fontSize: 15,
  },
});
