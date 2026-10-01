import { Pressable, StyleSheet, Text, View } from 'react-native';
import * as Haptics from 'expo-haptics';
import Animated, { useAnimatedStyle, useSharedValue, withSequence, withSpring, withTiming } from 'react-native-reanimated';
import type { Entry } from '../schema';
import { FACT_ICONS } from '../icons';
import { colors, fonts, radius } from '../theme';

type Fact = Entry['quickFacts'][number];

export default function FactGrid({ facts }: { facts: Fact[] }) {
  return (
    <View style={styles.grid}>
      {facts.map((f, i) => (
        <FactTile key={i} fact={f} />
      ))}
    </View>
  );
}

function FactTile({ fact }: { fact: Fact }) {
  const Icon = FACT_ICONS[fact.icon] ?? FACT_ICONS.info;
  const s = useSharedValue(1);
  const lift = useSharedValue(0);
  const tileStyle = useAnimatedStyle(() => ({ transform: [{ scale: s.value }] }));
  const iconStyle = useAnimatedStyle(() => ({ transform: [{ translateY: -lift.value * 4 }, { rotate: `${lift.value * -8}deg` }] }));

  return (
    <Pressable
      style={styles.cell}
      onPress={() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        s.set(withSequence(withTiming(0.96, { duration: 90 }), withSpring(1, { damping: 12, stiffness: 260 })));
        lift.set(withSequence(withTiming(1, { duration: 140 }), withSpring(0, { damping: 8 })));
      }}
    >
      <Animated.View style={[styles.tile, tileStyle]}>
        <Animated.View style={[styles.iconBox, iconStyle]}>
          <Icon size={18} color={colors.accent} weight="regular" />
        </Animated.View>
        <View>
          <Text style={styles.value} numberOfLines={2} adjustsFontSizeToFit>
            {fact.value}
          </Text>
          <Text style={styles.label} numberOfLines={1}>
            {fact.label}
          </Text>
        </View>
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  grid: { flexDirection: 'row', flexWrap: 'wrap', marginHorizontal: -5 },
  cell: { width: '50%', padding: 5 },
  tile: {
    backgroundColor: colors.surface,
    borderRadius: radius.container,
    borderWidth: 1,
    borderColor: colors.hairline,
    padding: 16,
    minHeight: 132,
    justifyContent: 'space-between',
  },
  iconBox: {
    width: 34,
    height: 34,
    borderRadius: radius.inner,
    backgroundColor: colors.surfaceRaised,
    alignItems: 'center',
    justifyContent: 'center',
  },
  value: { color: colors.text, fontFamily: fonts.semibold, fontSize: 20, letterSpacing: -0.5, marginTop: 14 },
  label: { color: colors.muted, fontFamily: fonts.regular, fontSize: 13, marginTop: 3 },
});
