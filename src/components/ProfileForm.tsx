import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  Pressable,
  StyleSheet,
  Switch,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useTheme } from '../context/ThemeContext';
import { Typography, Fonts } from '../constants/typography';
import type { BirthProfile } from '@lunarcal/shared';
import type { ProfileInput } from '../utils/profileStorage';

interface Props {
  visible: boolean;
  initial?: BirthProfile | null;
  onCancel: () => void;
  onSubmit: (input: ProfileInput) => Promise<void>;
}

function toYmd(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function toHm(d: Date): string {
  const h = String(d.getHours()).padStart(2, '0');
  const m = String(d.getMinutes()).padStart(2, '0');
  return `${h}:${m}`;
}

function fromYmd(s: string): Date {
  const [y, m, d] = s.split('-').map(Number);
  return new Date(y, m - 1, d);
}

function fromHm(s: string): Date {
  const [h, m] = s.split(':').map(Number);
  const d = new Date();
  d.setHours(h, m, 0, 0);
  return d;
}

export function ProfileForm({ visible, initial, onCancel, onSubmit }: Props) {
  const { colors } = useTheme();
  const [dateValue, setDateValue] = useState<Date>(
    initial ? fromYmd(initial.solarDate) : new Date(1990, 0, 1),
  );
  const [timeKnown, setTimeKnown] = useState<boolean>(initial?.solarTime != null);
  const [timeValue, setTimeValue] = useState<Date>(
    initial?.solarTime ? fromHm(initial.solarTime) : new Date(2000, 0, 1, 12, 0),
  );
  const [gender, setGender] = useState<'male' | 'female' | null>(initial?.gender ?? null);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!visible) return;
    if (initial) {
      setDateValue(fromYmd(initial.solarDate));
      setTimeKnown(initial.solarTime != null);
      setTimeValue(initial.solarTime ? fromHm(initial.solarTime) : new Date(2000, 0, 1, 12, 0));
      setGender(initial.gender);
    } else {
      setDateValue(new Date(1990, 0, 1));
      setTimeKnown(false);
      setTimeValue(new Date(2000, 0, 1, 12, 0));
      setGender(null);
    }
    setError(null);
  }, [visible, initial]);

  const handleSubmit = async () => {
    setError(null);
    const today = new Date();
    today.setHours(23, 59, 59, 999);
    if (dateValue > today) {
      setError('出生日期不可在未來');
      return;
    }
    if (dateValue.getFullYear() < 1900) {
      setError('出生日期需在 1900 年後');
      return;
    }
    const input: ProfileInput = {
      solarDate: toYmd(dateValue),
      solarTime: timeKnown ? toHm(timeValue) : null,
      gender,
    };
    try {
      setSubmitting(true);
      await onSubmit(input);
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
        <Text style={[styles.title, { color: colors.foreground }]}>個人資料</Text>

        <Text style={[styles.label, { color: colors.muted }]}>出生日期</Text>
        <DateTimePicker
          value={dateValue}
          mode="date"
          display={Platform.OS === 'ios' ? 'compact' : 'default'}
          maximumDate={new Date()}
          minimumDate={new Date(1900, 0, 1)}
          onChange={(_, d) => d && setDateValue(d)}
          accessibilityLabel="出生日期"
        />

        <View style={styles.toggleRow}>
          <Text style={[styles.label, { color: colors.muted, flex: 1 }]}>出生時辰</Text>
          <Switch
            value={timeKnown}
            onValueChange={setTimeKnown}
            accessibilityLabel="出生時辰是否已知"
          />
          <Text style={[styles.toggleHint, { color: colors.muted }]}>
            {timeKnown ? '已知' : '未知'}
          </Text>
        </View>
        {timeKnown && (
          <DateTimePicker
            value={timeValue}
            mode="time"
            display={Platform.OS === 'ios' ? 'compact' : 'default'}
            onChange={(_, d) => d && setTimeValue(d)}
            accessibilityLabel="出生時辰"
          />
        )}

        <Text style={[styles.label, { color: colors.muted, marginTop: 16 }]}>性別 (選填)</Text>
        <View style={styles.genderRow}>
          {(['male', 'female', null] as const).map((g) => {
            const lbl = g === 'male' ? '男' : g === 'female' ? '女' : '不指定';
            const selected = gender === g;
            return (
              <Pressable
                key={String(g)}
                onPress={() => setGender(g)}
                style={[
                  styles.genderBtn,
                  {
                    borderColor: colors.line,
                    backgroundColor: selected ? colors.primary : colors.surface,
                  },
                ]}
                accessibilityRole="button"
                accessibilityState={{ selected }}
                accessibilityLabel={`性別 ${lbl}`}
              >
                <Text style={{ fontFamily: Fonts.interMedium, color: selected ? colors.onPrimary : colors.foreground }}>{lbl}</Text>
              </Pressable>
            );
          })}
        </View>

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
            style={[
              styles.btn,
              styles.btnPrimary,
              { backgroundColor: colors.primary, opacity: submitting ? 0.6 : 1 },
            ]}
            accessibilityRole="button"
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
  label: { ...Typography.microCaption, marginTop: 12, marginBottom: 6 },
  toggleRow: { flexDirection: 'row', alignItems: 'center', marginTop: 16 },
  toggleHint: { ...Typography.subtitle, marginLeft: 8 },
  genderRow: { flexDirection: 'row', gap: 8 },
  genderBtn: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 10,
  },
  actions: { flexDirection: 'row', marginTop: 32, gap: 12 },
  btn: { flex: 1, padding: 14, borderRadius: 12, alignItems: 'center' },
  btnLabel: { ...Typography.toggleActive },
  btnGhost: { borderWidth: 1 },
  btnPrimary: {},
  error: { ...Typography.subtitle, marginTop: 12 },
});
