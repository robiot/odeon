import { useState } from 'react';
import { Dimensions, FlatList, StyleSheet, Text, View } from 'react-native';
import * as Haptics from 'expo-haptics';
import { LightbulbIcon } from '../icons';
import Animated, { useAnimatedStyle, withTiming } from 'react-native-reanimated';
import { colors, fonts, radius, easeOut } from '../theme';

const CARD_W = Dimensions.get('window').width - 56;
const GAP = 10;

export default function FunFacts({ facts }: { facts: string[] }) {
  const [page, setPage] = useState(0);

  return (
    <View>
      <View style={styles.segments}>
        {facts.map((_, i) => (
          <Segment key={i} active={i === page} />
        ))}
      </View>
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
        renderItem={({ item }) => (
          <View style={styles.card}>
            <LightbulbIcon size={22} color={colors.accent} weight="regular" />
            <Text style={styles.text}>{item}</Text>
          </View>
        )}
      />
    </View>
  );
}

function Segment({ active }: { active: boolean }) {
  const style = useAnimatedStyle(() => ({
    opacity: withTiming(active ? 1 : 0.18, { duration: 300, easing: easeOut }),
  }));
  return <Animated.View style={[styles.segment, style]} />;
}

const styles = StyleSheet.create({
  segments: { flexDirection: 'row', gap: 4, marginBottom: 12 },
  segment: { flex: 1, height: 2, borderRadius: 1, backgroundColor: colors.text },
  card: {
    width: CARD_W,
    minHeight: 168,
    borderRadius: radius.container,
    borderWidth: 1,
    borderColor: colors.hairline,
    backgroundColor: colors.surface,
    padding: 20,
    justifyContent: 'space-between',
  },
  text: { color: colors.text, fontFamily: fonts.medium, fontSize: 20, lineHeight: 27, letterSpacing: -0.3, marginTop: 20 },
});
