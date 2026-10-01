import { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, { Easing, useAnimatedStyle, useSharedValue, withDelay, withTiming } from 'react-native-reanimated';
import type { Entry } from '../schema';
import { colors, withAlpha } from '../theme';

type Stat = Entry['stats'][number];

export default function StatBars({ stats, accent }: { stats: Stat[]; accent: string }) {
  return (
    <View style={styles.card}>
      {stats.map((s, i) => (
        <StatRow key={i} stat={s} accent={accent} delay={500 + i * 150} />
      ))}
    </View>
  );
}

function StatRow({ stat, accent, delay }: { stat: Stat; accent: string; delay: number }) {
  const value = Math.max(0, Math.min(100, Math.round(stat.value)));
  const w = useSharedValue(0);
  useEffect(() => {
    w.value = withDelay(delay, withTiming(value, { duration: 900, easing: Easing.out(Easing.cubic) }));
  }, [w, value, delay]);
  const fill = useAnimatedStyle(() => ({ width: `${w.value}%` }));

  return (
    <View style={styles.row}>
      <Text style={styles.label} numberOfLines={1}>
        {stat.label}
      </Text>
      <View style={[styles.track, { backgroundColor: withAlpha(accent, 0.15) }]}>
        <Animated.View style={[styles.fill, { backgroundColor: accent }, fill]} />
      </View>
      <Text style={styles.value}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: colors.card, borderRadius: 22, padding: 18, gap: 14, borderWidth: 1, borderColor: colors.cardBorder },
  row: { flexDirection: 'row', alignItems: 'center' },
  label: { color: colors.text, fontSize: 14, fontWeight: '700', width: 78 },
  track: { flex: 1, height: 12, borderRadius: 6, overflow: 'hidden' },
  fill: { height: '100%', borderRadius: 6 },
  value: { color: colors.muted, fontSize: 14, fontWeight: '800', width: 36, textAlign: 'right', fontVariant: ['tabular-nums'] },
});
