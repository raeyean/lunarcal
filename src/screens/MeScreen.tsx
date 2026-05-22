import React, { useMemo, useState } from 'react';
import { ScrollView, View, Text, Pressable, StyleSheet, Alert } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { useBirthProfile } from '../context/BirthProfileContext';
import { BaziChart } from '../components/BaziChart';
import { CompatStrip } from '../components/CompatStrip';
import { ProfileForm } from '../components/ProfileForm';
import { SavedDateRow } from '../components/SavedDateRow';
import { SavedDateForm } from '../components/SavedDateForm';
import type { SavedDate } from '@lunarcal/shared';

interface Props {
  onNavigateToDate: (year: number, month: number, day: number) => void;
}

const ZODIAC_MAP: Record<string, string> = {
  子: '鼠', 丑: '牛', 寅: '虎', 卯: '兔', 辰: '龍', 巳: '蛇',
  午: '馬', 未: '羊', 申: '猴', 酉: '雞', 戌: '狗', 亥: '豬',
};

function todaySolarDate(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export function MeScreen({ onNavigateToDate }: Props) {
  const { colors } = useTheme();
  const {
    profile, savedDates, isLoading,
    userBazi,
    saveProfile, clearProfile,
    addSavedDate, removeSavedDate, updateSavedDate,
  } = useBirthProfile();

  const [profileFormVisible, setProfileFormVisible] = useState(false);
  const [editingSaved, setEditingSaved] = useState<SavedDate | null>(null);
  const [adding, setAdding] = useState(false);

  const baziResult = useMemo(() => {
    if (!profile) return { kind: 'none' as const };
    if (!userBazi) return { kind: 'error' as const, code: 'ENGINE_FAILURE' as const };
    return { kind: 'ok' as const, chart: userBazi };
  }, [profile, userBazi]);

  const handleClearProfile = () => {
    Alert.alert(
      '清除個人資料？',
      '此操作無法復原。',
      [
        { text: '取消', style: 'cancel' },
        { text: '清除（保留已存日子）', style: 'destructive', onPress: () => clearProfile(false) },
        { text: '清除（含已存日子）', style: 'destructive', onPress: () => clearProfile(true) },
      ],
    );
  };

  if (isLoading) {
    return (
      <ScrollView style={{ flex: 1, backgroundColor: colors.background }}>
        <View style={[styles.skeletonBlock, { backgroundColor: colors.surface }]} />
        <View style={[styles.skeletonBlock, { backgroundColor: colors.surface }]} />
      </ScrollView>
    );
  }

  if (!profile) {
    return (
      <View style={[styles.empty, { backgroundColor: colors.background }]}>
        <Text style={[styles.emptyTitle, { color: colors.foreground }]}>無個人資料</Text>
        <Text style={[styles.emptyBody, { color: colors.muted }]}>輸入生辰可看每日運勢</Text>
        <Pressable
          style={[styles.cta, { backgroundColor: colors.primary }]}
          onPress={() => setProfileFormVisible(true)}
        >
          <Text style={styles.ctaText}>開始設定</Text>
        </Pressable>
        <ProfileForm
          visible={profileFormVisible}
          initial={null}
          onCancel={() => setProfileFormVisible(false)}
          onSubmit={async (input) => {
            await saveProfile(input);
            setProfileFormVisible(false);
          }}
        />
      </View>
    );
  }

  if (baziResult.kind === 'error') {
    return (
      <View style={[styles.empty, { backgroundColor: colors.background }]}>
        <Text style={[styles.emptyTitle, { color: colors.foreground }]}>個人資料異常</Text>
        <Text style={[styles.emptyBody, { color: colors.muted }]}>請重新輸入</Text>
        <Pressable
          style={[styles.cta, { backgroundColor: colors.primary }]}
          onPress={() => setProfileFormVisible(true)}
        >
          <Text style={styles.ctaText}>重新輸入</Text>
        </Pressable>
        <ProfileForm
          visible={profileFormVisible}
          initial={profile}
          onCancel={() => setProfileFormVisible(false)}
          onSubmit={async (input) => {
            await saveProfile(input);
            setProfileFormVisible(false);
          }}
        />
      </View>
    );
  }

  if (baziResult.kind !== 'ok') return null;
  const chart = baziResult.chart;
  const yearZhi = chart.year.zhi;

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.background }}
      contentContainerStyle={{ padding: 16 }}
    >
      <Text style={[styles.h1, { color: colors.foreground }]}>我的</Text>

      {/* Profile hero */}
      <View style={[styles.hero, { backgroundColor: colors.surface, borderColor: colors.line }]}>
        <View style={{ flex: 1 }}>
          <Text style={[styles.heroSub, { color: colors.muted }]}>
            {chart.source.solarDate.split('-')[0]} · {chart.year.ganZhi}年 · 屬{ZODIAC_MAP[yearZhi] ?? '?'}
          </Text>
          <Text style={[styles.heroMain, { color: colors.primary }]}>
            日主 {chart.dayMaster}{chart.dayMasterWuXing}
          </Text>
        </View>
        <Pressable
          onPress={() => setProfileFormVisible(true)}
          accessibilityLabel="編輯個人資料"
          style={styles.editBtn}
        >
          <Text style={[styles.editIcon, { color: colors.muted }]}>✎</Text>
        </Pressable>
      </View>

      <Text style={[styles.sectionLabel, { color: colors.muted }]}>八字四柱</Text>
      <BaziChart bazi={chart} />

      <Text style={[styles.sectionLabel, { color: colors.muted, marginTop: 20 }]}>今日對你</Text>
      <CompatStrip
        targetSolarDate={todaySolarDate()}
        onPress={() => {
          const d = new Date();
          onNavigateToDate(d.getFullYear(), d.getMonth() + 1, d.getDate());
        }}
      />

      <View style={styles.savedHeader}>
        <Text style={[styles.sectionLabel, { color: colors.muted, marginTop: 20 }]}>已存日子</Text>
        <Pressable
          onPress={() => setAdding(true)}
          style={[styles.addBtn, { borderColor: colors.primary }]}
          accessibilityLabel="新增日子"
        >
          <Text style={{ color: colors.primary, fontSize: 12 }}>+ 新增</Text>
        </Pressable>
      </View>
      {savedDates.length === 0 ? (
        <Text style={[styles.savedEmpty, { color: colors.muted }]}>尚未新增日子</Text>
      ) : (
        savedDates.map((d) => (
          <SavedDateRow
            key={d.id}
            item={d}
            onPress={() => {
              const [y, m, dd] = d.solarDate.split('-').map(Number);
              onNavigateToDate(y, m, dd);
            }}
            onEdit={() => setEditingSaved(d)}
            onDelete={() => removeSavedDate(d.id)}
          />
        ))
      )}

      <Text style={[styles.disclaimer, { color: colors.muted }]}>
        日柱對比僅作日常參考，{'\n'}非完整命理分析。
      </Text>
      <Pressable onPress={handleClearProfile} style={styles.clearBtn}>
        <Text style={[styles.clearText, { color: colors.primary }]}>清除個人資料</Text>
      </Pressable>

      <ProfileForm
        visible={profileFormVisible}
        initial={profile}
        onCancel={() => setProfileFormVisible(false)}
        onSubmit={async (input) => {
          await saveProfile(input);
          setProfileFormVisible(false);
        }}
      />
      <SavedDateForm
        visible={adding}
        onCancel={() => setAdding(false)}
        onSubmit={async (label, solarDate) => {
          await addSavedDate(label, solarDate);
          setAdding(false);
        }}
      />
      <SavedDateForm
        visible={editingSaved !== null}
        initialLabel={editingSaved?.label}
        initialSolarDate={editingSaved?.solarDate}
        onCancel={() => setEditingSaved(null)}
        onSubmit={async (label, solarDate) => {
          if (editingSaved) {
            await updateSavedDate(editingSaved.id, { label, solarDate });
          }
          setEditingSaved(null);
        }}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  emptyTitle: { fontSize: 18, fontWeight: '600' },
  emptyBody: { fontSize: 14, marginTop: 8, textAlign: 'center' },
  cta: { marginTop: 24, paddingHorizontal: 24, paddingVertical: 12, borderRadius: 12 },
  ctaText: { color: '#fff', fontWeight: '600' },
  h1: { fontSize: 24, fontWeight: '700', marginBottom: 12 },
  hero: {
    flexDirection: 'row',
    borderWidth: 1,
    borderRadius: 14,
    padding: 16,
    marginBottom: 20,
  },
  heroSub: { fontSize: 11 },
  heroMain: { fontSize: 22, fontWeight: '700', marginTop: 6 },
  editBtn: { padding: 8 },
  editIcon: { fontSize: 18 },
  sectionLabel: {
    fontSize: 11,
    marginBottom: 8,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  savedHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  addBtn: {
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    marginTop: 20,
  },
  savedEmpty: { fontSize: 12, fontStyle: 'italic', marginVertical: 8 },
  disclaimer: { fontSize: 11, textAlign: 'center', marginTop: 32, lineHeight: 16 },
  clearBtn: { alignItems: 'center', marginTop: 16, marginBottom: 32, paddingVertical: 12 },
  clearText: { fontSize: 13 },
  skeletonBlock: { height: 80, margin: 16, borderRadius: 12 },
});
