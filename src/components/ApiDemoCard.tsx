import React from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { useYiJi, useDirections, useDeity } from '../api/hooks';
import { useTheme } from '../context/ThemeContext';
import { Spacing } from '../constants/spacing';
import { Radius } from '../constants/radius';
import { Typography } from '../constants/typography';

interface ApiDemoCardProps {
  year: number;
  month: number;
  day: number;
  lunarMonth: number;
  lunarDay: number;
}

export function ApiDemoCard({ year, month, day, lunarMonth, lunarDay }: ApiDemoCardProps) {
  const { colors } = useTheme();

  const yijiQuery = useYiJi(year, month, day);
  const directionsQuery = useDirections(year, month, day);
  const deityQuery = useDeity(lunarMonth, lunarDay);

  const loading = yijiQuery.isLoading || directionsQuery.isLoading || deityQuery.isLoading;
  const error =
    yijiQuery.error?.message ??
    directionsQuery.error?.message ??
    deityQuery.error?.message ??
    null;

  const yiji = yijiQuery.data;
  const directions = directionsQuery.data;
  const deity = deityQuery.data;

  // Cache-state indicators per hook
  const allFetchedFromCache =
    !yijiQuery.isFetching && !directionsQuery.isFetching && !deityQuery.isFetching;

  return (
    <View
      style={[
        styles.card,
        { backgroundColor: colors.surfaceElevated, borderColor: colors.subtleBorder },
      ]}
    >
      <View style={styles.headerRow}>
        <Text style={[Typography.microCaption, { color: colors.accent }]}>
          ⚡ FROM API {allFetchedFromCache && yiji ? '· cached' : ''}
        </Text>
        <Text style={[Typography.subtitle, { color: colors.muted }]}>
          3 endpoints · {year}/{month}/{day}
        </Text>
      </View>

      {loading && (
        <View style={styles.centerRow}>
          <ActivityIndicator color={colors.primary} />
          <Text style={[Typography.body, { color: colors.muted, marginLeft: Spacing.sm }]}>
            Fetching 3 endpoints in parallel…
          </Text>
        </View>
      )}

      {error && !loading && (
        <Text style={[Typography.body, { color: colors.primary }]}>Error: {error}</Text>
      )}

      {!loading && yiji && directions && deity && (
        <View>
          <Section label={`/api/yiji  ·  total: 宜${yiji.yi.length} 忌${yiji.ji.length}`} colors={colors}>
            <Row
              label="宜"
              items={yijiDisplay(yiji.yi.map(y => y.term))}
              accent={colors.primary}
              text={colors.foreground}
            />
            <Row
              label="忌"
              items={yijiDisplay(yiji.ji.map(j => j.term))}
              accent={colors.ji}
              text={colors.foreground}
            />
          </Section>

          <Section label="/api/directions" colors={colors}>
            {(Object.entries(directions.directions) as [string, string][]).map(([k, v]) => (
              <Row key={k} label={k} items={[v]} accent={colors.accent} text={colors.foreground} />
            ))}
          </Section>

          <Section label="/api/deity" colors={colors}>
            {deity.deity ? (
              <>
                <Row label="名" items={[deity.deity.name]} accent={colors.accent} text={colors.foreground} />
                <Row label="神" items={[deity.deity.deity]} accent={colors.accent} text={colors.foreground} />
                <Row label="類" items={[deity.deity.kind]} accent={colors.accent} text={colors.muted} />
              </>
            ) : (
              <Text style={[Typography.body, { color: colors.muted }]}>—  no deity day</Text>
            )}
          </Section>
        </View>
      )}
    </View>
  );
}

// Match other surfaces (EditorialDaily, TodayWidget): slice 6 + overflow badge.
function yijiDisplay(items: string[]): string[] {
  if (items.length <= 6) return items;
  return [...items.slice(0, 6), `+${items.length - 6} 更多`];
}

interface SectionProps {
  label: string;
  children: React.ReactNode;
  colors: ReturnType<typeof useTheme>['colors'];
}

function Section({ label, children, colors }: SectionProps) {
  return (
    <View style={styles.section}>
      <Text style={[Typography.microCaption, styles.sectionLabel, { color: colors.muted }]}>
        {label}
      </Text>
      {children}
    </View>
  );
}

interface RowProps {
  label: string;
  items: string[];
  accent: string;
  text: string;
}

function Row({ label, items, accent, text }: RowProps) {
  return (
    <View style={styles.row}>
      <Text style={[Typography.bodyMedium, { color: accent, width: 36 }]}>{label}</Text>
      <Text style={[Typography.body, { color: text, flex: 1 }]} numberOfLines={2}>
        {items.length === 0 ? '—' : items.join('、')}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    marginHorizontal: Spacing.lg,
    marginTop: Spacing.lg,
    padding: Spacing.lg,
    borderRadius: Radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  centerRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  section: {
    marginTop: Spacing.md,
    paddingTop: Spacing.sm,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(0,0,0,0.05)',
  },
  sectionLabel: {
    marginBottom: Spacing.xs,
    letterSpacing: 0.5,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 2,
  },
});
