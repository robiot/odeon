import { useState } from 'react';
import { Dimensions, FlatList, StyleSheet, Text, View } from 'react-native';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, withAlpha } from '../theme';

const CARD_W = Dimensions.get('window').width - 40;
const GAP = 12;

export default function FunFacts({ facts, accent }: { facts: string[]; accent: string }) {
  const [page, setPage] = useState(0);

  return (
    <View>
      <FlatList
        data={facts}
        horizontal
        keyExtractor={(_, i) => String(i)}
        showsHorizontalScrollIndicator={false}
        snapToInterval={CARD_W + GAP}
        decelerationRate="fast"
        style={{ marginHorizontal: -20 }}
        contentContainerStyle={{ paddingHorizontal: 20, gap: GAP }}
        onMomentumScrollEnd={(e) => {
          const p = Math.round(e.nativeEvent.contentOffset.x / (CARD_W + GAP));
          if (p !== page) Haptics.selectionAsync();
          setPage(p);
        }}
        renderItem={({ item, index }) => (
          <LinearGradient
            colors={[withAlpha(accent, 0.35), withAlpha(accent, 0.08)]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[styles.card, { borderColor: withAlpha(accent, 0.4) }]}
          >
            <View style={styles.head}>
              <Text style={styles.bulb}>💡</Text>
              <Text style={[styles.num, { color: accent }]}>
                {index + 1}/{facts.length}
              </Text>
            </View>
            <Text style={styles.text}>{item}</Text>
          </LinearGradient>
        )}
      />
      <View style={styles.dots}>
        {facts.map((_, i) => (
          <View
            key={i}
            style={[styles.dot, i === page && { backgroundColor: accent, width: 22 }]}
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { width: CARD_W, minHeight: 150, borderRadius: 24, padding: 20, borderWidth: 1 },
  head: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  bulb: { fontSize: 28 },
  num: { fontSize: 13, fontWeight: '900', letterSpacing: 1 },
  text: { color: colors.text, fontSize: 20, fontWeight: '700', lineHeight: 27 },
  dots: { flexDirection: 'row', justifyContent: 'center', gap: 6, marginTop: 14 },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.cardBorder },
});
