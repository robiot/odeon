import { StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import type { Entry } from '../schema';
import { colors, fonts, easeOut } from '../theme';

export default function Timeline({ items }: { items: Entry['timeline'] }) {
  return (
    <View>
      {items.map((t, i) => {
        const last = i === items.length - 1;
        return (
          <Animated.View key={i} entering={FadeInDown.delay(700 + i * 100).duration(600).easing(easeOut)} style={styles.row}>
            <Text style={styles.year} numberOfLines={1} adjustsFontSizeToFit>
              {t.year}
            </Text>
            <View style={styles.rail}>
              <View style={[styles.node, last && styles.nodeLast]} />
              {!last && <View style={styles.line} />}
            </View>
            <Text style={[styles.event, !last && { paddingBottom: 22 }]}>{t.event}</Text>
          </Animated.View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row' },
  year: { width: 76, color: colors.muted, fontFamily: fonts.mono, fontSize: 13, paddingTop: 2 },
  rail: { width: 22, alignItems: 'center' },
  node: { width: 9, height: 9, borderRadius: 5, borderWidth: 1.5, borderColor: colors.text, marginTop: 6 },
  nodeLast: { backgroundColor: colors.accent, borderColor: colors.accent },
  line: { flex: 1, width: StyleSheet.hairlineWidth, backgroundColor: colors.hairlineStrong, marginTop: 4 },
  event: { flex: 1, color: colors.text, fontFamily: fonts.regular, fontSize: 16, lineHeight: 22, paddingLeft: 10 },
});
