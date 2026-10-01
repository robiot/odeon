import { useEffect, useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { CameraView, useCameraPermissions, type CameraType } from 'expo-camera';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withSpring,
  withTiming,
  Easing,
  FadeIn,
} from 'react-native-reanimated';
import { colors } from '../theme';

type Props = { onCapture: (uri: string) => void };

export default function CameraScreen({ onCapture }: Props) {
  const [permission, requestPermission] = useCameraPermissions();
  const [facing, setFacing] = useState<CameraType>('back');
  const [ready, setReady] = useState(false);
  const [busy, setBusy] = useState(false);
  const cameraRef = useRef<CameraView>(null);
  const insets = useSafeAreaInsets();

  const press = useSharedValue(1);
  const pulse = useSharedValue(0);
  const flash = useSharedValue(0);

  useEffect(() => {
    pulse.value = withRepeat(withTiming(1, { duration: 1800, easing: Easing.out(Easing.quad) }), -1, false);
  }, [pulse]);

  const shutterStyle = useAnimatedStyle(() => ({ transform: [{ scale: press.value }] }));
  const ringStyle = useAnimatedStyle(() => ({
    opacity: 0.6 * (1 - pulse.value),
    transform: [{ scale: 1 + pulse.value * 0.45 }],
  }));
  const flashStyle = useAnimatedStyle(() => ({ opacity: flash.value }));

  if (!permission) return <View style={styles.fill} />;

  if (!permission.granted) {
    return (
      <View style={[styles.fill, styles.center, { padding: 32 }]}>
        <Text style={styles.bigEmoji}>📸</Text>
        <Text style={styles.permTitle}>Let Odeon see</Text>
        <Text style={styles.permBody}>Point your camera at anything and get its story in seconds.</Text>
        <Pressable style={styles.permButton} onPress={requestPermission}>
          <Text style={styles.permButtonText}>Enable camera</Text>
        </Pressable>
      </View>
    );
  }

  const capture = async () => {
    if (!cameraRef.current || !ready || busy) return;
    setBusy(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    press.value = withSequence(withTiming(0.82, { duration: 90 }), withSpring(1, { damping: 8 }));
    flash.value = withSequence(withTiming(0.9, { duration: 60 }), withTiming(0, { duration: 350 }));
    try {
      const photo = await cameraRef.current.takePictureAsync({ quality: 0.8, shutterSound: false });
      if (photo?.uri) onCapture(photo.uri);
    } finally {
      setBusy(false);
    }
  };

  return (
    <View style={styles.fill}>
      <CameraView
        ref={cameraRef}
        style={StyleSheet.absoluteFill}
        facing={facing}
        onCameraReady={() => setReady(true)}
      />

      {/* Viewfinder brackets */}
      <View pointerEvents="none" style={[StyleSheet.absoluteFill, styles.center]}>
        <View style={styles.finder}>
          <View style={[styles.corner, styles.tl]} />
          <View style={[styles.corner, styles.tr]} />
          <View style={[styles.corner, styles.bl]} />
          <View style={[styles.corner, styles.br]} />
        </View>
      </View>

      {/* Top bar */}
      <Animated.View entering={FadeIn.duration(600)} style={[styles.topBar, { paddingTop: insets.top + 10 }]}>
        <View style={styles.brand}>
          <View style={styles.led} />
          <Text style={styles.brandText}>ODEON</Text>
        </View>
        <Text style={styles.hint}>Point at anything</Text>
      </Animated.View>

      {/* Bottom controls */}
      <View style={[styles.bottom, { paddingBottom: insets.bottom + 28 }]}>
        <View style={styles.sideSlot} />
        <Pressable onPress={capture} hitSlop={20} accessibilityLabel="Scan">
          <View style={styles.center}>
            <Animated.View style={[styles.pulseRing, ringStyle]} />
            <Animated.View style={[styles.ball, shutterStyle]}>
              <View style={styles.ballTop} />
              <View style={styles.ballBand} />
              <View style={styles.ballButtonOuter}>
                <View style={styles.ballButtonInner} />
              </View>
            </Animated.View>
          </View>
        </Pressable>
        <Pressable
          style={styles.sideSlot}
          onPress={() => {
            Haptics.selectionAsync();
            setFacing((f) => (f === 'back' ? 'front' : 'back'));
          }}
          accessibilityLabel="Flip camera"
        >
          <View style={styles.flip}>
            <Text style={styles.flipText}>⟲</Text>
          </View>
        </Pressable>
      </View>

      <Animated.View pointerEvents="none" style={[StyleSheet.absoluteFill, styles.flash, flashStyle]} />
    </View>
  );
}

const BALL = 84;
const CORNER = 34;

const styles = StyleSheet.create({
  fill: { flex: 1, backgroundColor: '#000' },
  center: { alignItems: 'center', justifyContent: 'center' },
  bigEmoji: { fontSize: 64, marginBottom: 16 },
  permTitle: { color: colors.text, fontSize: 28, fontWeight: '800', marginBottom: 8 },
  permBody: { color: colors.muted, fontSize: 16, textAlign: 'center', marginBottom: 28, lineHeight: 22 },
  permButton: { backgroundColor: colors.red, paddingHorizontal: 28, paddingVertical: 16, borderRadius: 999 },
  permButtonText: { color: colors.white, fontSize: 17, fontWeight: '700' },
  finder: { width: '74%', aspectRatio: 0.85 },
  corner: { position: 'absolute', width: CORNER, height: CORNER, borderColor: 'rgba(255,255,255,0.85)' },
  tl: { top: 0, left: 0, borderTopWidth: 3, borderLeftWidth: 3, borderTopLeftRadius: 14 },
  tr: { top: 0, right: 0, borderTopWidth: 3, borderRightWidth: 3, borderTopRightRadius: 14 },
  bl: { bottom: 0, left: 0, borderBottomWidth: 3, borderLeftWidth: 3, borderBottomLeftRadius: 14 },
  br: { bottom: 0, right: 0, borderBottomWidth: 3, borderRightWidth: 3, borderBottomRightRadius: 14 },
  topBar: { position: 'absolute', top: 0, left: 0, right: 0, alignItems: 'center' },
  brand: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.45)',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
  },
  led: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.scan,
    marginRight: 8,
    shadowColor: colors.scan,
    shadowOpacity: 1,
    shadowRadius: 6,
  },
  brandText: { color: colors.white, fontWeight: '900', letterSpacing: 4, fontSize: 14 },
  hint: { color: 'rgba(255,255,255,0.85)', marginTop: 10, fontSize: 14, fontWeight: '600' },
  bottom: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  sideSlot: { width: 56, height: 56, alignItems: 'center', justifyContent: 'center' },
  flip: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(0,0,0,0.45)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  flipText: { color: colors.white, fontSize: 24, fontWeight: '700' },
  pulseRing: {
    position: 'absolute',
    width: BALL + 16,
    height: BALL + 16,
    borderRadius: (BALL + 16) / 2,
    borderWidth: 3,
    borderColor: colors.white,
  },
  ball: {
    width: BALL,
    height: BALL,
    borderRadius: BALL / 2,
    backgroundColor: colors.white,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 4,
    borderColor: '#111',
  },
  ballTop: { position: 'absolute', top: 0, left: 0, right: 0, height: '50%', backgroundColor: colors.red },
  ballBand: { position: 'absolute', left: 0, right: 0, height: 6, backgroundColor: '#111' },
  ballButtonOuter: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#111',
    alignItems: 'center',
    justifyContent: 'center',
  },
  ballButtonInner: { width: 18, height: 18, borderRadius: 9, backgroundColor: colors.white },
  flash: { backgroundColor: colors.white },
});
