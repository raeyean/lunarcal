import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

interface Props {
  children: React.ReactNode;
  fallbackMessage?: string;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

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

    return (
      <View style={styles.container}>
        <Text style={styles.emoji}>⚠️</Text>
        <Text style={styles.title}>
          {this.props.fallbackMessage ?? '發生錯誤'}
        </Text>
        <Text style={styles.detail} numberOfLines={3}>
          {this.state.error?.message}
        </Text>
        <TouchableOpacity style={styles.button} onPress={this.handleReset} activeOpacity={0.7}>
          <Text style={styles.buttonText}>重試</Text>
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
    padding: 32,
    backgroundColor: '#FFFFFF',
  },
  emoji: {
    fontSize: 40,
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 8,
    textAlign: 'center',
  },
  detail: {
    fontSize: 13,
    color: '#78788A',
    textAlign: 'center',
    marginBottom: 24,
  },
  button: {
    backgroundColor: '#f04324',
    paddingVertical: 10,
    paddingHorizontal: 28,
    borderRadius: 20,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
  },
});
