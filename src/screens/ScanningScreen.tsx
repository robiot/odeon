import { useEffect, useMemo, useState } from 'react';
import { Dimensions, Pressable, StyleSheet, Text, View } from 'react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, {
  Easing,
  FadeIn,
  FadeInDown,
  FadeOut,
  FadeOutUp,
  ZoomIn,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { colors } from '../theme';

const { width: W, height: H } = Dimensions.get('window');

const STEPS = [
  'Locking on…',
  'Tracing edges…',
  'Reading shapes & colors…',
  'Asking Claude…',
  'Searching the archives…',
  'Digging up fun facts…',
  'Writing your entry…',
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

  // Animated values
  const zoom = useSharedValue(1);
  const sweep = useSharedValue(0);
  const spin = useSharedValue(0);
  const breathe = useSharedValue(0);
  const flash = useSharedValue(0);
  const dim = useSharedValue(0);

  useEffect(() => {
    zoom.value = withTiming(1.12, { duration: 14000, easing: Easing.out(Easing.quad) });
    dim.value = withTiming(1, { duration: 500 });
    sweep.value = withRepeat(withTiming(1, { duration: 1600, easing: Easing.inOut(Easing.sin) }), -1, true);
    spin.value = withRepeat(withTiming(1, { duration: 6000, easing: Easing.linear }), -1, false);
    breathe.value = withRepeat(withTiming(1, { duration: 900, easing: Easing.inOut(Easing.sin) }), -1, true);
  }, [zoom, dim, sweep, spin, breathe]);

  // Cycle status text + creep the progress toward ~95% while waiting.
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
    setPct(100);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    flash.value = withSequence(withDelay(250, withTiming(1, { duration: 180 })), withTiming(0, { duration: 500 }));
    const t = setTimeout(onFinished, 520);
    return () => clearTimeout(t);
  }, [done, flash, onFinished]);

  useEffect(() => {
    if (error) Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
  }, [error]);

  const photoStyle = useAnimatedStyle(() => ({ transform: [{ scale: zoom.value }] }));
  const dimStyle = useAnimatedStyle(() => ({ opacity: dim.value * 0.45 }));
  const laserStyle = useAnimatedStyle(() => ({ transform: [{ translateY: sweep.value * (H - 120) }] }));
  const ringA = useAnimatedStyle(() => ({ transform: [{ rotate: `${spin.value * 360}deg` }] }));
  const ringB = useAnimatedStyle(() => ({ transform: [{ rotate: `${-spin.value * 540}deg` }] }));
  const coreStyle = useAnimatedStyle(() => ({
    opacity: 0.5 + breathe.value * 0.5,
    transform: [{ scale: 0.8 + breathe.value * 0.4 }],
  }));
  const flashStyle = useAnimatedStyle(() => ({ opacity: flash.value }));

  // Random "feature points" that blink around the frame
  const points = useMemo(
    () =>
      Array.from({ length: 14 }, (_, i) => ({
        key: i,
        x: W * (0.12 + Math.random() * 0.76),
        y: H * (0.18 + Math.random() * 0.6),
        delay: Math.random() * 2000,
      })),
    [],
  );

  return (
    <View style={styles.fill}>
      <Animated.View style={[StyleSheet.absoluteFill, photoStyle]}>
        <Image source={{ uri }} style={StyleSheet.absoluteFill} contentFit="cover" />
      </Animated.View>
      <Animated.View style={[StyleSheet.absoluteFill, styles.dim, dimStyle]} />

      {!error && (
        <>
          {/* Grid */}
          <Animated.View entering={FadeIn.delay(150).duration(600)} pointerEvents="none" style={StyleSheet.absoluteFill}>
            {Array.from({ length: 7 }, (_, i) => (
              <View key={`v${i}`} style={[styles.gridV, { left: ((i + 1) * W) / 8 }]} />
            ))}
            {Array.from({ length: 13 }, (_, i) => (
              <View key={`h${i}`} style={[styles.gridH, { top: ((i + 1) * H) / 14 }]} />
            ))}
          </Animated.View>

          {/* Feature points */}
          {points.map((p) => (
            <Blip key={p.key} x={p.x} y={p.y} delay={p.delay} />
          ))}

          {/* Laser sweep */}
          <Animated.View pointerEvents="none" style={[styles.laserWrap, laserStyle]}>
            <LinearGradient
              colors={['transparent', 'rgba(92,242,255,0.28)', 'transparent']}
              style={styles.laserGlow}
            />
            <View style={styles.laser} />
          </Animated.View>

          {/* Reticle */}
          <View pointerEvents="none" style={[StyleSheet.absoluteFill, styles.center]}>
            <Animated.View entering={ZoomIn.springify().damping(12)} style={styles.center}>
              <Animated.View style={[styles.ringOuter, ringA]} />
              <Animated.View style={[styles.ringInner, ringB]} />
              <Animated.View style={[styles.core, coreStyle]} />
            </Animated.View>
          </View>

          <LinearGradient pointerEvents="none" colors={['transparent', 'rgba(2,6,12,0.85)']} style={styles.bottomShade} />

          {/* Status */}
          <View style={[styles.statusWrap, { paddingBottom: insets.bottom + 36 }]}>
            <Text style={styles.pct}>{Math.round(pct)}%</Text>
            <View style={styles.bar}>
              <View style={[styles.barFill, { width: `${pct}%` }]} />
            </View>
            <View style={styles.statusBox}>
              <Animated.Text
                key={done ? 'done' : step}
                entering={FadeInDown.duration(300)}
                exiting={FadeOutUp.duration(200)}
                style={styles.status}
              >
                {done ? 'Got it!' : STEPS[step]}
              </Animated.Text>
            </View>
          </View>

          <Pressable onPress={onCancel} style={[styles.cancel, { top: insets.top + 12 }]} hitSlop={12}>
            <Text style={styles.cancelText}>✕</Text>
          </Pressable>
        </>
      )}

      {error && (
        <Animated.View entering={FadeInDown.springify()} exiting={FadeOut} style={[styles.center, styles.fill, styles.errorWrap]}>
          <View style={styles.errorCard}>
            <Text style={styles.errorEmoji}>🤔</Text>
            <Text style={styles.errorTitle}>Scan failed</Text>
            <Text style={styles.errorBody}>{error}</Text>
            <View style={styles.row}>
              <Pressable style={[styles.btn, styles.btnGhost]} onPress={onCancel}>
                <Text style={styles.btnText}>New photo</Text>
              </Pressable>
              <Pressable style={[styles.btn, styles.btnPrimary]} onPress={onRetry}>
                <Text style={styles.btnText}>Retry</Text>
              </Pressable>
            </View>
          </View>
        </Animated.View>
      )}

      <Animated.View pointerEvents="none" style={[StyleSheet.absoluteFill, styles.flash, flashStyle]} />
    </View>
  );
}

function Blip({ x, y, delay }: { x: number; y: number; delay: number }) {
  const v = useSharedValue(0);
  useEffect(() => {
    v.value = withDelay(
      delay,
      withRepeat(withSequence(withTiming(1, { duration: 300 }), withTiming(0, { duration: 900 })), -1, false),
    );
  }, [v, delay]);
  const style = useAnimatedStyle(() => ({ opacity: v.value, transform: [{ scale: 0.6 + v.value * 0.8 }] }));
  return (
    <Animated.View pointerEvents="none" style={[styles.blip, { left: x - 5, top: y - 5 }, style]}>
      <View style={styles.blipDot} />
    </Animated.View>
  );
}

const RING = 180;

const styles = StyleSheet.create({
  fill: { flex: 1, backgroundColor: '#000' },
  center: { alignItems: 'center', justifyContent: 'center' },
  dim: { backgroundColor: '#02060C' },
  gridV: { position: 'absolute', top: 0, bottom: 0, width: StyleSheet.hairlineWidth, backgroundColor: 'rgba(92,242,255,0.18)' },
  gridH: { position: 'absolute', left: 0, right: 0, height: StyleSheet.hairlineWidth, backgroundColor: 'rgba(92,242,255,0.18)' },
  laserWrap: { position: 'absolute', left: 0, right: 0, top: 30, height: 60, justifyContent: 'center' },
  laserGlow: { ...StyleSheet.absoluteFill },
  laser: {
    height: 2,
    backgroundColor: colors.scan,
    shadowColor: colors.scan,
    shadowOpacity: 1,
    shadowRadius: 10,
    elevation: 8,
  },
  ringOuter: {
    position: 'absolute',
    width: RING,
    height: RING,
    borderRadius: RING / 2,
    borderWidth: 2,
    borderColor: colors.scan,
    borderStyle: 'dashed',
    opacity: 0.85,
  },
  ringInner: {
    position: 'absolute',
    width: RING * 0.62,
    height: RING * 0.62,
    borderRadius: RING * 0.31,
    borderWidth: 3,
    borderColor: 'rgba(255,255,255,0.9)',
    borderTopColor: 'transparent',
    borderBottomColor: 'transparent',
  },
  core: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: colors.scan,
    shadowColor: colors.scan,
    shadowOpacity: 1,
    shadowRadius: 12,
  },
  blip: { position: 'absolute', width: 10, height: 10, borderRadius: 5, borderWidth: 1.5, borderColor: colors.scan, alignItems: 'center', justifyContent: 'center' },
  blipDot: { width: 3, height: 3, borderRadius: 2, backgroundColor: colors.white },
  statusWrap: { position: 'absolute', bottom: 0, left: 0, right: 0, alignItems: 'center', paddingHorizontal: 40 },
  pct: { color: colors.white, fontSize: 44, fontWeight: '900', fontVariant: ['tabular-nums'], letterSpacing: -1 },
  bar: { width: '100%', height: 6, borderRadius: 3, backgroundColor: 'rgba(255,255,255,0.15)', marginTop: 10, overflow: 'hidden' },
  barFill: { height: '100%', backgroundColor: colors.scan, borderRadius: 3 },
  statusBox: { alignSelf: 'stretch', height: 24, marginTop: 14 },
  status: { position: 'absolute', left: 0, right: 0, textAlign: 'center', color: 'rgba(255,255,255,0.9)', fontSize: 16, fontWeight: '600' },
  bottomShade: { position: 'absolute', left: 0, right: 0, bottom: 0, height: 280 },
  cancel: { position: 'absolute', left: 16, width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(0,0,0,0.5)', alignItems: 'center', justifyContent: 'center' },
  cancelText: { color: colors.white, fontSize: 18, fontWeight: '700' },
  errorWrap: { ...StyleSheet.absoluteFill, backgroundColor: 'rgba(0,0,0,0.55)', padding: 24 },
  errorCard: { width: '100%', backgroundColor: colors.card, borderRadius: 28, padding: 24, alignItems: 'center', borderWidth: 1, borderColor: colors.cardBorder },
  errorEmoji: { fontSize: 48 },
  errorTitle: { color: colors.text, fontSize: 22, fontWeight: '800', marginTop: 8 },
  errorBody: { color: colors.muted, fontSize: 15, textAlign: 'center', marginTop: 8, marginBottom: 20, lineHeight: 21 },
  row: { flexDirection: 'row', gap: 12, alignSelf: 'stretch' },
  btn: { flex: 1, paddingVertical: 14, borderRadius: 999, alignItems: 'center' },
  btnGhost: { backgroundColor: '#262C3A' },
  btnPrimary: { backgroundColor: colors.red },
  btnText: { color: colors.white, fontWeight: '700', fontSize: 16 },
  flash: { backgroundColor: colors.white },
});
