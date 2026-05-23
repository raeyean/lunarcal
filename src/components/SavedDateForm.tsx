import React, { useState, useEffect } from 'react';
import { Modal, View, Text, TextInput, Pressable, StyleSheet, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useTheme } from '../context/ThemeContext';
import { Typography } from '../constants/typography';

interface Props {
  visible: boolean;
  initialLabel?: string;
  initialSolarDate?: string;
  onCancel: () => void;
  onSubmit: (label: string, solarDate: string) => Promise<void>;
}

function toYmd(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}
function fromYmd(s: string): Date {
  const [y, m, d] = s.split('-').map(Number);
  return new Date(y, m - 1, d);
}

export function SavedDateForm({ visible, initialLabel, initialSolarDate, onCancel, onSubmit }: Props) {
  const { colors } = useTheme();
  const [label, setLabel] = useState(initialLabel ?? '');
  const [date, setDate] = useState<Date>(initialSolarDate ? fromYmd(initialSolarDate) : new Date());
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!visible) return;
    setLabel(initialLabel ?? '');
    setDate(initialSolarDate ? fromYmd(initialSolarDate) : new Date());
    setError(null);
  }, [visible, initialLabel, initialSolarDate]);

  const handleSubmit = async () => {
    const trimmed = label.trim();
    if (!trimmed) { setError('請輸入名稱'); return; }
    if (trimmed.length > 50) { setError('名稱不可超過 50 字'); return; }
    if (date.getFullYear() < 1900 || date.getFullYear() > 2100) {
      setError('日期需在 1900–2100 之間');
      return;
    }
    try {
      setSubmitting(true);
      await onSubmit(trimmed, toYmd(date));
    } catch {
      setError('儲存失敗，請重試');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="formSheet"
      onRequestClose={onCancel}
    >
      <SafeAreaView edges={['top', 'left', 'right']} style={[styles.container, { backgroundColor: colors.background }]}>
        <Text style={[styles.title, { color: colors.foreground }]}>
          {initialLabel ? '編輯日子' : '新增日子'}
        </Text>

        <Text style={[styles.label, { color: colors.muted }]}>名稱</Text>
        <TextInput
          value={label}
          onChangeText={setLabel}
          placeholder="婚禮、生日…"
          placeholderTextColor={colors.muted}
          style={[styles.input, { borderColor: colors.line, color: colors.foreground }]}
          maxLength={50}
          accessibilityLabel="名稱"
        />

        <Text style={[styles.label, { color: colors.muted }]}>日期</Text>
        <DateTimePicker
          value={date}
          mode="date"
          display={Platform.OS === 'ios' ? 'compact' : 'default'}
          minimumDate={new Date(1900, 0, 1)}
          maximumDate={new Date(2100, 11, 31)}
          onChange={(_, d) => d && setDate(d)}
          accessibilityLabel="日期"
        />

        {error && <Text style={[styles.error, { color: colors.danger }]}>{error}</Text>}

        <View style={styles.actions}>
          <Pressable
            onPress={onCancel}
            style={[styles.btn, styles.btnGhost, { borderColor: colors.line }]}
          >
            <Text style={[styles.btnLabel, { color: colors.foreground }]}>取消</Text>
          </Pressable>
          <Pressable
            onPress={handleSubmit}
            disabled={submitting}
            style={[styles.btn, { backgroundColor: colors.primary, opacity: submitting ? 0.6 : 1 }]}
          >
            <Text style={[styles.btnLabel, { color: colors.onPrimary }]}>
              {submitting ? '儲存中…' : '儲存'}
            </Text>
          </Pressable>
        </View>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24 },
  title: { ...Typography.screenHeader, marginBottom: 24 },
  label: { ...Typography.microCaption, marginTop: 16, marginBottom: 6 },
  input: { ...Typography.bodyMedium, borderWidth: 1, borderRadius: 10, padding: 10 },
  actions: { flexDirection: 'row', marginTop: 32, gap: 12 },
  btn: { flex: 1, padding: 14, borderRadius: 12, alignItems: 'center' },
  btnLabel: { ...Typography.toggleActive },
  btnGhost: { borderWidth: 1 },
  error: { ...Typography.subtitle, marginTop: 12 },
});
