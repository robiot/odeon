import { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withDelay, withTiming } from 'react-native-reanimated';
import type { Entry } from '../schema';
import { colors, fonts, easeOut } from '../theme';

type Stat = Entry['stats'][number];

const SEGMENTS = 28;

export default function StatBars({ stats }: { stats: Stat[] }) {
  return (
    <View style={styles.list}>
      {stats.map((s, i) => (
        <StatRow key={i} stat={s} delay={600 + i * 140} last={i === stats.length - 1} />
      ))}
    </View>
  );
}

/** A row of ticks that light up left to right, instead of a filled progress track. */
function StatRow({ stat, delay, last }: { stat: Stat; delay: number; last: boolean }) {
  const value = Math.max(0, Math.min(100, Math.round(stat.value)));
  const lit = Math.round((value / 100) * SEGMENTS);
  return (
    <View style={[styles.row, !last && styles.divider]}>
      <View style={styles.head}>
        <Text style={styles.label} numberOfLines={1}>
          {stat.label}
        </Text>
        <Text style={styles.value}>{value}</Text>
      </View>
      <View style={styles.ticks}>
        {Array.from({ length: SEGMENTS }, (_, i) => (
          <Tick key={i} on={i < lit} delay={delay + i * 20} />
        ))}
      </View>
    </View>
  );
}

function Tick({ on, delay }: { on: boolean; delay: number }) {
  const v = useSharedValue(0);
  useEffect(() => {
    if (on) v.set(withDelay(delay, withTiming(1, { duration: 320, easing: easeOut })));
  }, [on, delay, v]);
  const style = useAnimatedStyle(() => ({ opacity: v.value, transform: [{ scaleY: 0.4 + v.value * 0.6 }] }));
  return (
    <View style={styles.tickSlot}>
      <Animated.View style={[styles.tickOn, style]} />
    </View>
  );
}

const styles = StyleSheet.create({
  list: {},
  row: { paddingVertical: 14 },
  divider: { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.hairlineStrong },
  head: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 10 },
  label: { color: colors.text, fontFamily: fonts.medium, fontSize: 15 },
  value: { color: colors.muted, fontFamily: fonts.mono, fontSize: 14, fontVariant: ['tabular-nums'] },
  ticks: { flexDirection: 'row', gap: 2, height: 8 },
  tickSlot: { flex: 1, borderRadius: 1, backgroundColor: colors.surfaceRaised, overflow: 'hidden' },
  tickOn: { flex: 1, backgroundColor: colors.accent },
});
