import { Dimensions, Pressable, StyleSheet, Text, View } from 'react-native';
import { Image } from 'expo-image';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { CameraIcon, XIcon } from '../icons';
import Animated, {
  FadeIn,
  FadeInDown,
  interpolate,
  Extrapolation,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
} from 'react-native-reanimated';
import type { Entry } from '../schema';
import { colors, fonts, radius, easeOut } from '../theme';
import Section from '../components/Section';
import FactGrid from '../components/FactGrid';
import StatBars from '../components/StatBars';
import FunFacts from '../components/FunFacts';
import Timeline from '../components/Timeline';
import Quiz from '../components/Quiz';

const { height: H } = Dimensions.get('window');
const HERO = Math.round(H * 0.58);

function entryNumber(name: string) {
  let h = 0;
  for (const c of name.toLowerCase()) h = (h * 31 + c.charCodeAt(0)) >>> 0;
  return String((h % 999) + 1).padStart(3, '0');
}

export default function ResultScreen({ uri, entry, onScanAgain }: { uri: string; entry: Entry; onScanAgain: () => void }) {
  const insets = useSafeAreaInsets();
  const y = useSharedValue(0);
  const onScroll = useAnimatedScrollHandler((e) => {
    y.set(e.contentOffset.y);
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
    opacity: interpolate(y.value, [HERO - 140, HERO - 70], [0, 1], Extrapolation.CLAMP),
  }));

  const confidence = Math.round(Math.max(0, Math.min(100, entry.confidence)));
  const scanAgain = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onScanAgain();
  };
  let section = 0;

  return (
    <View style={styles.fill}>
      <Animated.ScrollView
        onScroll={onScroll}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: insets.bottom + 128 }}
      >
        {/* Hero */}
        <View style={{ height: HERO }}>
          <Animated.View style={[StyleSheet.absoluteFill, heroStyle]}>
            <Animated.View entering={FadeIn.duration(600)} style={StyleSheet.absoluteFill}>
              <Image source={{ uri }} style={StyleSheet.absoluteFill} contentFit="cover" accessibilityLabel={entry.name} />
            </Animated.View>
          </Animated.View>
          <LinearGradient
            colors={['rgba(0,0,0,0.45)', 'transparent', 'rgba(0,0,0,0.7)', colors.bg]}
            locations={[0, 0.28, 0.72, 1]}
            style={StyleSheet.absoluteFill}
          />

          <Animated.View entering={FadeInDown.delay(250).duration(800).easing(easeOut)} style={styles.heroText}>
            <Text style={styles.category}>{entry.category}</Text>
            <Text style={styles.name} adjustsFontSizeToFit numberOfLines={2}>
              {entry.name}
            </Text>
            <Text style={styles.tagline}>{entry.tagline}</Text>
            <View style={styles.meta}>
              <Text style={styles.metaText}>No. {entryNumber(entry.name)}</Text>
              <View style={styles.metaRule} />
              <Text style={styles.metaText}>{confidence}% match</Text>
            </View>
          </Animated.View>
        </View>

        <Animated.Text entering={FadeInDown.delay(380).duration(800).easing(easeOut)} style={styles.summary}>
          {entry.summary}
        </Animated.Text>

        {entry.quickFacts.length > 0 && (
          <Section title="At a glance" index={section++}>
            <FactGrid facts={entry.quickFacts} />
          </Section>
        )}

        {entry.stats.length > 0 && (
          <Section title="Stats" index={section++}>
            <StatBars stats={entry.stats} />
          </Section>
        )}

        {entry.funFacts.length > 0 && (
          <Section title="Did you know" index={section++}>
            <FunFacts facts={entry.funFacts} />
          </Section>
        )}

        {entry.timeline.length > 0 && (
          <Section title="Timeline" index={section++}>
            <Timeline items={entry.timeline} />
          </Section>
        )}

        {entry.quiz.options.length > 0 && (
          <Section title="Quick quiz" index={section++}>
            <Quiz quiz={entry.quiz} />
          </Section>
        )}
      </Animated.ScrollView>

      {/* Sticky compact header */}
      <Animated.View pointerEvents="none" style={[styles.compact, headerStyle]}>
        <BlurView intensity={50} tint="dark" style={[styles.compactInner, { paddingTop: insets.top + 10 }]}>
          <Text style={styles.compactText} numberOfLines={1}>
            {entry.name}
          </Text>
        </BlurView>
      </Animated.View>

      <Pressable
        onPress={scanAgain}
        hitSlop={12}
        accessibilityRole="button"
        accessibilityLabel="Close"
        style={[styles.close, { top: insets.top + 10 }]}
      >
        <BlurView intensity={40} tint="dark" style={styles.closeInner}>
          <XIcon size={18} color={colors.text} weight="bold" />
        </BlurView>
      </Pressable>

      {/* Scan again */}
      <Animated.View
        entering={FadeInDown.delay(700).duration(700).easing(easeOut)}
        style={[styles.ctaWrap, { paddingBottom: insets.bottom + 14 }]}
      >
        <LinearGradient colors={['transparent', colors.bg]} style={StyleSheet.absoluteFill} pointerEvents="none" />
        <Pressable onPress={scanAgain} style={({ pressed }) => [styles.cta, pressed && { transform: [{ scale: 0.98 }] }]}>
          <Text style={styles.ctaText}>Scan another</Text>
          <View style={styles.ctaIcon}>
            <CameraIcon size={18} color={colors.text} weight="regular" />
          </View>
        </Pressable>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1, backgroundColor: colors.bg },
  heroText: { position: 'absolute', left: 20, right: 20, bottom: 0 },
  category: { color: colors.accent, fontFamily: fonts.medium, fontSize: 14, marginBottom: 6 },
  name: { color: colors.text, fontFamily: fonts.semibold, fontSize: 42, lineHeight: 45, letterSpacing: -1.6 },
  tagline: { color: 'rgba(244,244,243,0.72)', fontFamily: fonts.regular, fontSize: 17, lineHeight: 23, marginTop: 8 },
  meta: { flexDirection: 'row', alignItems: 'center', marginTop: 16 },
  metaText: { color: colors.muted, fontFamily: fonts.mono, fontSize: 12, fontVariant: ['tabular-nums'] },
  metaRule: { width: 16, height: StyleSheet.hairlineWidth, backgroundColor: colors.faint, marginHorizontal: 10 },
  summary: {
    color: colors.text,
    fontFamily: fonts.regular,
    fontSize: 19,
    lineHeight: 28,
    letterSpacing: -0.2,
    marginTop: 26,
    paddingHorizontal: 20,
  },
  compact: { position: 'absolute', top: 0, left: 0, right: 0 },
  compactInner: {
    paddingBottom: 14,
    paddingHorizontal: 72,
    alignItems: 'center',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.hairline,
    overflow: 'hidden',
  },
  compactText: { color: colors.text, fontFamily: fonts.semibold, fontSize: 16, letterSpacing: -0.2 },
  close: { position: 'absolute', left: 16 },
  closeInner: { width: 40, height: 40, borderRadius: radius.pill, overflow: 'hidden', alignItems: 'center', justifyContent: 'center' },
  ctaWrap: { position: 'absolute', left: 0, right: 0, bottom: 0, paddingTop: 36, paddingHorizontal: 20 },
  cta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.text,
    borderRadius: radius.pill,
    paddingLeft: 26,
    paddingRight: 7,
    paddingVertical: 7,
  },
  ctaText: { color: colors.bg, fontFamily: fonts.semibold, fontSize: 16 },
  ctaIcon: {
    width: 44,
    height: 44,
    borderRadius: radius.pill,
    backgroundColor: colors.bg,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
