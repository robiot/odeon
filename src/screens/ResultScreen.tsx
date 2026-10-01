import { Dimensions, Pressable, StyleSheet, Text, View } from 'react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, {
  FadeIn,
  FadeInDown,
  FadeInUp,
  ZoomIn,
  interpolate,
  Extrapolation,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
} from 'react-native-reanimated';
import type { Entry } from '../schema';
import { colors, safeColor, withAlpha } from '../theme';
import Section from '../components/Section';
import FactGrid from '../components/FactGrid';
import StatBars from '../components/StatBars';
import FunFacts from '../components/FunFacts';
import Timeline from '../components/Timeline';
import Quiz from '../components/Quiz';

const { width: W, height: H } = Dimensions.get('window');
const HERO = Math.round(H * 0.56);

function entryNumber(name: string) {
  let h = 0;
  for (const c of name.toLowerCase()) h = (h * 31 + c.charCodeAt(0)) >>> 0;
  return '#' + String((h % 999) + 1).padStart(3, '0');
}

export default function ResultScreen({ uri, entry, onScanAgain }: { uri: string; entry: Entry; onScanAgain: () => void }) {
  const insets = useSafeAreaInsets();
  const accent = safeColor(entry.accentColor);
  const y = useSharedValue(0);
  const onScroll = useAnimatedScrollHandler((e) => {
    y.value = e.contentOffset.y;
  });

  // Parallax + stretch on the hero photo
  const heroStyle = useAnimatedStyle(() => ({
    transform: [
      { translateY: interpolate(y.value, [-HERO, 0, HERO], [-HERO / 2, 0, HERO * 0.45], Extrapolation.CLAMP) },
      { scale: interpolate(y.value, [-HERO, 0], [2, 1], Extrapolation.CLAMP) },
    ],
  }));
  // Compact header fades in once the title scrolls away
  const headerStyle = useAnimatedStyle(() => ({
    opacity: interpolate(y.value, [HERO - 160, HERO - 80], [0, 1], Extrapolation.CLAMP),
  }));

  const confidence = Math.round(Math.max(0, Math.min(100, entry.confidence)));
  let section = 0;

  return (
    <View style={styles.fill}>
      <Animated.ScrollView
        onScroll={onScroll}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: insets.bottom + 120 }}
      >
        {/* Hero */}
        <View style={{ height: HERO, overflow: 'visible' }}>
          <Animated.View style={[StyleSheet.absoluteFill, heroStyle]}>
            <Animated.View entering={FadeIn.duration(500)} style={StyleSheet.absoluteFill}>
              <Image source={{ uri }} style={StyleSheet.absoluteFill} contentFit="cover" />
            </Animated.View>
          </Animated.View>
          <LinearGradient
            colors={['rgba(11,13,18,0.5)', 'transparent', withAlpha(colors.bg, 0.75), colors.bg]}
            locations={[0, 0.3, 0.75, 1]}
            style={StyleSheet.absoluteFill}
          />

          <View style={[styles.heroTop, { top: insets.top + 12 }]}>
            <Animated.View entering={FadeInDown.delay(150)} style={styles.numPill}>
              <View style={[styles.led, { backgroundColor: accent, shadowColor: accent }]} />
              <Text style={styles.numText}>ODEON {entryNumber(entry.name)}</Text>
            </Animated.View>
            <Animated.View entering={FadeInDown.delay(250)} style={styles.confPill}>
              <Text style={styles.confText}>{confidence}% match</Text>
            </Animated.View>
          </View>

          <View style={styles.heroBottom}>
            <Animated.View
              entering={ZoomIn.delay(200).springify().damping(10)}
              style={[styles.emojiBadge, { backgroundColor: withAlpha(accent, 0.25), borderColor: accent }]}
            >
              <Text style={styles.emoji}>{entry.emoji}</Text>
            </Animated.View>
            <Animated.View entering={FadeInUp.delay(280).springify()}>
              <View style={[styles.chip, { backgroundColor: withAlpha(accent, 0.2) }]}>
                <Text style={[styles.chipText, { color: accent }]}>{entry.category}</Text>
              </View>
              <Text style={styles.name} adjustsFontSizeToFit numberOfLines={2}>
                {entry.name}
              </Text>
              <Text style={styles.tagline}>{entry.tagline}</Text>
            </Animated.View>
          </View>
        </View>

        {/* Summary */}
        <Animated.View entering={FadeInDown.delay(380).springify()} style={styles.summaryWrap}>
          <View style={[styles.summaryBar, { backgroundColor: accent }]} />
          <Text style={styles.summary}>{entry.summary}</Text>
        </Animated.View>

        {entry.quickFacts.length > 0 && (
          <Section title="At a glance" index={section++}>
            <FactGrid facts={entry.quickFacts} accent={accent} />
          </Section>
        )}

        {entry.stats.length > 0 && (
          <Section title="Stats" index={section++}>
            <StatBars stats={entry.stats} accent={accent} />
          </Section>
        )}

        {entry.funFacts.length > 0 && (
          <Section title="Did you know?" index={section++}>
            <FunFacts facts={entry.funFacts} accent={accent} />
          </Section>
        )}

        {entry.timeline.length > 0 && (
          <Section title="Timeline" index={section++}>
            <Timeline items={entry.timeline} accent={accent} />
          </Section>
        )}

        {entry.quiz.options.length > 0 && (
          <Section title="Quick quiz" index={section++}>
            <Quiz quiz={entry.quiz} accent={accent} />
          </Section>
        )}
      </Animated.ScrollView>

      {/* Sticky compact header */}
      <Animated.View pointerEvents="none" style={[styles.compact, { paddingTop: insets.top + 8 }, headerStyle]}>
        <Text style={styles.compactText} numberOfLines={1}>
          {entry.emoji} {entry.name}
        </Text>
      </Animated.View>

      {/* Scan again */}
      <Animated.View entering={FadeInUp.delay(700).springify()} style={[styles.ctaWrap, { paddingBottom: insets.bottom + 16 }]}>
        <LinearGradient colors={['transparent', colors.bg]} style={StyleSheet.absoluteFill} pointerEvents="none" />
        <Pressable
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            onScanAgain();
          }}
          style={({ pressed }) => [styles.cta, pressed && { transform: [{ scale: 0.97 }] }]}
        >
          <Text style={styles.ctaText}>📸  Scan something else</Text>
        </Pressable>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1, backgroundColor: colors.bg },
  heroTop: { position: 'absolute', left: 16, right: 16, flexDirection: 'row', justifyContent: 'space-between' },
  numPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 999,
  },
  led: { width: 8, height: 8, borderRadius: 4, marginRight: 7, shadowOpacity: 1, shadowRadius: 5 },
  numText: { color: colors.white, fontWeight: '900', letterSpacing: 2, fontSize: 12 },
  confPill: { backgroundColor: 'rgba(0,0,0,0.5)', paddingHorizontal: 12, paddingVertical: 7, borderRadius: 999 },
  confText: { color: colors.white, fontWeight: '700', fontSize: 12 },
  heroBottom: { position: 'absolute', left: 20, right: 20, bottom: 4 },
  emojiBadge: {
    width: 64,
    height: 64,
    borderRadius: 20,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  emoji: { fontSize: 34 },
  chip: { alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8, marginBottom: 8 },
  chipText: { fontWeight: '800', fontSize: 12, letterSpacing: 1, textTransform: 'uppercase' },
  name: { color: colors.text, fontSize: 40, fontWeight: '900', letterSpacing: -1, lineHeight: 44 },
  tagline: { color: 'rgba(244,246,251,0.8)', fontSize: 17, fontWeight: '600', marginTop: 6 },
  summaryWrap: { flexDirection: 'row', marginTop: 22, marginHorizontal: 20 },
  summaryBar: { width: 4, borderRadius: 2, marginRight: 14 },
  summary: { flex: 1, color: colors.text, fontSize: 18, lineHeight: 26, fontWeight: '500' },
  compact: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    paddingBottom: 12,
    paddingHorizontal: 60,
    backgroundColor: 'rgba(11,13,18,0.92)',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.cardBorder,
    alignItems: 'center',
  },
  compactText: { color: colors.text, fontSize: 16, fontWeight: '800', maxWidth: W - 120 },
  ctaWrap: { position: 'absolute', left: 0, right: 0, bottom: 0, paddingTop: 30, paddingHorizontal: 20 },
  cta: {
    backgroundColor: colors.red,
    borderRadius: 999,
    paddingVertical: 18,
    alignItems: 'center',
    shadowColor: colors.red,
    shadowOpacity: 0.5,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 6 },
  },
  ctaText: { color: colors.white, fontSize: 17, fontWeight: '800' },
});
