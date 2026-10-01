import { StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInLeft } from 'react-native-reanimated';
import type { Entry } from '../schema';
import { colors, withAlpha } from '../theme';

export default function Timeline({ items, accent }: { items: Entry['timeline']; accent: string }) {
  return (
    <View style={styles.card}>
      {items.map((t, i) => {
        const last = i === items.length - 1;
        return (
          <Animated.View key={i} entering={FadeInLeft.delay(700 + i * 120)} style={styles.row}>
            <View style={styles.rail}>
              <View style={[styles.dot, { backgroundColor: accent, shadowColor: accent }]} />
              {!last && <View style={[styles.line, { backgroundColor: withAlpha(accent, 0.3) }]} />}
            </View>
            <View style={[styles.body, !last && { paddingBottom: 18 }]}>
              <Text style={[styles.year, { color: accent }]}>{t.year}</Text>
              <Text style={styles.event}>{t.event}</Text>
            </View>
          </Animated.View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: colors.card, borderRadius: 22, padding: 18, borderWidth: 1, borderColor: colors.cardBorder },
  row: { flexDirection: 'row' },
  rail: { width: 22, alignItems: 'center' },
  dot: { width: 12, height: 12, borderRadius: 6, marginTop: 4, shadowOpacity: 0.9, shadowRadius: 6 },
  line: { flex: 1, width: 2, marginTop: 4 },
  body: { flex: 1, paddingLeft: 10 },
  year: { fontSize: 14, fontWeight: '900', letterSpacing: 0.5 },
  event: { color: colors.text, fontSize: 16, fontWeight: '600', marginTop: 2, lineHeight: 21 },
});
