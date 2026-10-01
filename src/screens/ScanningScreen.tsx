import { useEffect, useState } from 'react';
import { Dimensions, Pressable, StyleSheet, Text, View } from 'react-native';
import { Image } from 'expo-image';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { WarningCircleIcon, XIcon } from '../icons';
import Animated, {
  Easing,
  FadeIn,
  FadeInDown,
  FadeOut,
  FadeOutUp,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { colors, fonts, radius, easeOut } from '../theme';

const { width: W, height: H } = Dimensions.get('window');

const STEPS = [
  'Locking on',
  'Tracing edges',
  'Reading shapes and colors',
  'Asking Claude',
  'Searching the archives',
  'Finding the good facts',
  'Writing your entry',
];

type Props = {
  uri: string;
  done: boolean;
  error: string | null;
  onFinished: () => void;
  onRetry: () => void;
  onCancel: () => void;
};

export default function ScanningScreen({ uri, done, error, onFinished, onRetry, onCancel }: Props) {
  const insets = useSafeAreaInsets();
  const [step, setStep] = useState(0);
  const [pct, setPct] = useState(0);

  const zoom = useSharedValue(1);
  const sweep = useSharedValue(0);
  const spin = useSharedValue(0);
  const breathe = useSharedValue(0);
  const flash = useSharedValue(0);
  const dim = useSharedValue(0);

  useEffect(() => {
    zoom.set(withTiming(1.1, { duration: 14000, easing: easeOut }));
    dim.set(withTiming(1, { duration: 600, easing: easeOut }));
    sweep.set(withRepeat(withTiming(1, { duration: 2200, easing: Easing.inOut(Easing.cubic) }), -1, true));
    spin.set(withRepeat(withTiming(1, { duration: 2400, easing: Easing.linear }), -1, false));
    breathe.set(withRepeat(withTiming(1, { duration: 1400, easing: Easing.inOut(Easing.sin) }), -1, true));
  }, [zoom, dim, sweep, spin, breathe]);

  // Cycle status text and creep the progress toward ~95% while waiting.
  useEffect(() => {
    if (done || error) return;
    const s = setInterval(() => setStep((i) => Math.min(i + 1, STEPS.length - 1)), 1700);
    const p = setInterval(() => setPct((v) => v + (95 - v) * 0.02), 120);
    const tick = setInterval(() => Haptics.selectionAsync(), 1700);
    return () => {
      clearInterval(s);
      clearInterval(p);
      clearInterval(tick);
    };
  }, [done, error]);

  // Finish: snap to 100%, flash, buzz, hand off.
  useEffect(() => {
    if (!done) return;
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    flash.set(withSequence(withDelay(250, withTiming(1, { duration: 180 })), withTiming(0, { duration: 500 })));
    const t = setTimeout(onFinished, 520);
    return () => clearTimeout(t);
  }, [done, flash, onFinished]);

  useEffect(() => {
    if (error) Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
  }, [error]);

  const photoStyle = useAnimatedStyle(() => ({ transform: [{ scale: zoom.value }] }));
  const dimStyle = useAnimatedStyle(() => ({ opacity: dim.value * 0.5 }));
  const laserStyle = useAnimatedStyle(() => ({ transform: [{ translateY: sweep.value * (H * 0.62) }] }));
  const arcStyle = useAnimatedStyle(() => ({ transform: [{ rotate: `${spin.value * 360}deg` }] }));
  const bracketStyle = useAnimatedStyle(() => ({ transform: [{ scale: 1 - breathe.value * 0.06 }] }));
  const flashStyle = useAnimatedStyle(() => ({ opacity: flash.value }));

  const [points] = useState(makePoints);
  const shownPct = done ? 100 : pct;

  return (
    <View style={styles.fill}>
      <Animated.View style={[StyleSheet.absoluteFill, photoStyle]}>
        <Image source={{ uri }} style={StyleSheet.absoluteFill} contentFit="cover" />
      </Animated.View>
      <Animated.View style={[StyleSheet.absoluteFill, styles.dim, dimStyle]} />

      {!error && (
        <>
          {points.map((p) => (
            <Blip key={p.key} x={p.x} y={p.y} delay={p.delay} />
          ))}

          {/* Sweep */}
          <Animated.View pointerEvents="none" style={[styles.laserWrap, { top: H * 0.14 }, laserStyle]}>
            <LinearGradient colors={['transparent', 'rgba(255,255,255,0.10)']} style={styles.laserTrail} />
            <View style={styles.laser} />
          </Animated.View>

          {/* Reticle */}
          <View pointerEvents="none" style={[StyleSheet.absoluteFill, styles.center]}>
            <Animated.View entering={FadeIn.duration(500)} style={[styles.reticle, bracketStyle]}>
              <View style={[styles.rCorner, styles.tl]} />
              <View style={[styles.rCorner, styles.tr]} />
              <View style={[styles.rCorner, styles.bl]} />
              <View style={[styles.rCorner, styles.br]} />
            </Animated.View>
            <Animated.View style={[styles.arc, arcStyle]} />
            <View style={styles.core} />
          </View>

          <LinearGradient pointerEvents="none" colors={['transparent', colors.bg]} style={styles.bottomShade} />

          <View style={[styles.statusWrap, { paddingBottom: insets.bottom + 36 }]}>
            <Text style={styles.pct}>
              {Math.round(shownPct)}
              <Text style={styles.pctSign}>%</Text>
            </Text>
            <View style={styles.bar}>
              <View style={[styles.barFill, { width: `${shownPct}%` }]} />
            </View>
            <View style={styles.statusBox}>
              <Animated.Text
                key={done ? 'done' : step}
                entering={FadeInDown.duration(350).easing(easeOut)}
                exiting={FadeOutUp.duration(200)}
                style={styles.status}
              >
                {done ? 'Identified' : STEPS[step]}
              </Animated.Text>
            </View>
          </View>

          <Pressable
            onPress={onCancel}
            hitSlop={12}
            accessibilityRole="button"
            accessibilityLabel="Cancel"
            style={[styles.cancel, { top: insets.top + 12 }]}
          >
            <BlurView intensity={40} tint="dark" style={styles.cancelInner}>
              <XIcon size={18} color={colors.text} weight="bold" />
            </BlurView>
          </Pressable>
        </>
      )}

      {error && (
        <Animated.View entering={FadeIn.duration(250)} exiting={FadeOut} style={[styles.errorWrap, { paddingBottom: insets.bottom + 20 }]}>
          <Animated.View entering={FadeInDown.duration(500).easing(easeOut)} style={styles.errorCard}>
            <WarningCircleIcon size={28} color={colors.text} weight="light" />
            <Text style={styles.errorTitle}>Couldn’t identify that</Text>
            <Text style={styles.errorBody}>{error}</Text>
            <View style={styles.row}>
              <Pressable style={({ pressed }) => [styles.btn, styles.btnGhost, pressed && styles.pressed]} onPress={onCancel}>
                <Text style={[styles.btnText, { color: colors.text }]}>Retake</Text>
              </Pressable>
              <Pressable style={({ pressed }) => [styles.btn, styles.btnPrimary, pressed && styles.pressed]} onPress={onRetry}>
                <Text style={[styles.btnText, { color: colors.bg }]}>Try again</Text>
              </Pressable>
            </View>
          </Animated.View>
        </Animated.View>
      )}

      <Animated.View pointerEvents="none" style={[StyleSheet.absoluteFill, styles.flash, flashStyle]} />
    </View>
  );
}

/** Feature points that flicker around the frame. */
function makePoints() {
  return Array.from({ length: 12 }, (_, i) => ({
    key: i,
    x: W * (0.14 + Math.random() * 0.72),
    y: H * (0.2 + Math.random() * 0.5),
    delay: Math.random() * 2400,
  }));
}

function Blip({ x, y, delay }: { x: number; y: number; delay: number }) {
  const v = useSharedValue(0);
  useEffect(() => {
    v.set(withDelay(
      delay,
      withRepeat(withSequence(withTiming(1, { duration: 260 }), withTiming(0, { duration: 1100 })), -1, false),
    ));
  }, [v, delay]);
  const style = useAnimatedStyle(() => ({ opacity: v.value * 0.9 }));
  return <Animated.View pointerEvents="none" style={[styles.blip, { left: x - 2, top: y - 2 }, style]} />;
}

const RETICLE = 168;
const R_CORNER = 22;

const styles = StyleSheet.create({
  fill: { flex: 1, backgroundColor: colors.bg },
  center: { alignItems: 'center', justifyContent: 'center' },
  pressed: { transform: [{ scale: 0.97 }] },
  dim: { backgroundColor: colors.bg },
  laserWrap: { position: 'absolute', left: 0, right: 0, height: 72, justifyContent: 'flex-end' },
  laserTrail: { ...StyleSheet.absoluteFill },
  laser: { height: 1, backgroundColor: 'rgba(255,255,255,0.85)' },
  reticle: { position: 'absolute', width: RETICLE, height: RETICLE },
  rCorner: { position: 'absolute', width: R_CORNER, height: R_CORNER, borderColor: colors.text },
  tl: { top: 0, left: 0, borderTopWidth: 1.5, borderLeftWidth: 1.5, borderTopLeftRadius: radius.inner },
  tr: { top: 0, right: 0, borderTopWidth: 1.5, borderRightWidth: 1.5, borderTopRightRadius: radius.inner },
  bl: { bottom: 0, left: 0, borderBottomWidth: 1.5, borderLeftWidth: 1.5, borderBottomLeftRadius: radius.inner },
  br: { bottom: 0, right: 0, borderBottomWidth: 1.5, borderRightWidth: 1.5, borderBottomRightRadius: radius.inner },
  arc: {
    position: 'absolute',
    width: 56,
    height: 56,
    borderRadius: 28,
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.15)',
    borderTopColor: colors.text,
  },
  core: { width: 6, height: 6, borderRadius: 3, backgroundColor: colors.text },
  blip: { position: 'absolute', width: 4, height: 4, borderRadius: 2, backgroundColor: colors.text },
  bottomShade: { position: 'absolute', left: 0, right: 0, bottom: 0, height: 300 },
  statusWrap: { position: 'absolute', bottom: 0, left: 0, right: 0, alignItems: 'center', paddingHorizontal: 40 },
  pct: { color: colors.text, fontFamily: fonts.mono, fontSize: 56, letterSpacing: -2, fontVariant: ['tabular-nums'] },
  pctSign: { color: colors.muted, fontSize: 28, letterSpacing: 0 },
  bar: { width: '100%', height: 2, borderRadius: 1, backgroundColor: 'rgba(255,255,255,0.12)', marginTop: 14, overflow: 'hidden' },
  barFill: { height: '100%', backgroundColor: colors.text },
  statusBox: { alignSelf: 'stretch', height: 22, marginTop: 16 },
  status: { position: 'absolute', left: 0, right: 0, textAlign: 'center', color: colors.muted, fontFamily: fonts.medium, fontSize: 15 },
  cancel: { position: 'absolute', left: 16 },
  cancelInner: { width: 40, height: 40, borderRadius: radius.pill, overflow: 'hidden', alignItems: 'center', justifyContent: 'center' },
  errorWrap: { ...StyleSheet.absoluteFill, justifyContent: 'flex-end', paddingHorizontal: 16, backgroundColor: 'rgba(0,0,0,0.55)' },
  errorCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.container + 8,
    borderWidth: 1,
    borderColor: colors.hairline,
    padding: 24,
  },
  errorTitle: { color: colors.text, fontFamily: fonts.semibold, fontSize: 22, letterSpacing: -0.5, marginTop: 16 },
  errorBody: { color: colors.muted, fontFamily: fonts.regular, fontSize: 15, lineHeight: 22, marginTop: 6, marginBottom: 24 },
  row: { flexDirection: 'row', gap: 10, alignSelf: 'stretch' },
  btn: { flex: 1, paddingVertical: 16, borderRadius: radius.pill, alignItems: 'center' },
  btnGhost: { borderWidth: 1, borderColor: colors.hairlineStrong },
  btnPrimary: { backgroundColor: colors.text },
  btnText: { fontFamily: fonts.semibold, fontSize: 15 },
  flash: { backgroundColor: colors.text },
});
