import { Pressable, StyleSheet, Text, View } from 'react-native';
import * as Haptics from 'expo-haptics';
import Animated, { useAnimatedStyle, useSharedValue, withSequence, withSpring, withTiming } from 'react-native-reanimated';
import type { Entry } from '../schema';
import { colors, withAlpha } from '../theme';

type Fact = Entry['quickFacts'][number];

export default function FactGrid({ facts, accent }: { facts: Fact[]; accent: string }) {
  return (
    <View style={styles.grid}>
      {facts.map((f, i) => (
        <FactTile key={i} fact={f} accent={accent} />
      ))}
    </View>
  );
}

function FactTile({ fact, accent }: { fact: Fact; accent: string }) {
  const s = useSharedValue(1);
  const r = useSharedValue(0);
  const style = useAnimatedStyle(() => ({ transform: [{ scale: s.value }, { rotate: `${r.value}deg` }] }));
  const emojiStyle = useAnimatedStyle(() => ({ transform: [{ scale: 2 - s.value }] }));

  return (
    <Pressable
      style={styles.cell}
      onPress={() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        s.value = withSequence(withTiming(0.92, { duration: 80 }), withSpring(1, { damping: 6 }));
        r.value = withSequence(withTiming(-3, { duration: 60 }), withTiming(3, { duration: 80 }), withSpring(0));
      }}
    >
      <Animated.View style={[styles.tile, { borderColor: withAlpha(accent, 0.3) }, style]}>
        <Animated.Text style={[styles.emoji, emojiStyle]}>{fact.emoji}</Animated.Text>
        <Text style={styles.value} numberOfLines={2} adjustsFontSizeToFit>
          {fact.value}
        </Text>
        <Text style={[styles.label, { color: accent }]} numberOfLines={1}>
          {fact.label}
        </Text>
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  grid: { flexDirection: 'row', flexWrap: 'wrap', marginHorizontal: -6 },
  cell: { width: '50%', padding: 6 },
  tile: {
    backgroundColor: colors.card,
    borderRadius: 22,
    padding: 16,
    borderWidth: 1,
    minHeight: 120,
    justifyContent: 'space-between',
  },
  emoji: { fontSize: 26 },
  value: { color: colors.text, fontSize: 21, fontWeight: '800', marginTop: 10, letterSpacing: -0.3 },
  label: { fontSize: 12, fontWeight: '800', letterSpacing: 1, textTransform: 'uppercase', marginTop: 4 },
});
