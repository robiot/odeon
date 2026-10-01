import { useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { CameraView, useCameraPermissions, type CameraType } from 'expo-camera';
import * as Haptics from 'expo-haptics';
import { BlurView } from 'expo-blur';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { CameraRotateIcon, ApertureIcon } from '../icons';
import Animated, {
  FadeIn,
  FadeInDown,
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { colors, fonts, radius, easeOut } from '../theme';

type Props = { onCapture: (uri: string) => void };

export default function CameraScreen({ onCapture }: Props) {
  const [permission, requestPermission] = useCameraPermissions();
  const [facing, setFacing] = useState<CameraType>('back');
  const [ready, setReady] = useState(false);
  const [busy, setBusy] = useState(false);
  const cameraRef = useRef<CameraView>(null);
  const insets = useSafeAreaInsets();

  const press = useSharedValue(1);
  const flash = useSharedValue(0);
  const flipTurn = useSharedValue(0);

  const shutterStyle = useAnimatedStyle(() => ({ transform: [{ scale: press.value }] }));
  const flashStyle = useAnimatedStyle(() => ({ opacity: flash.value }));
  const flipStyle = useAnimatedStyle(() => ({ transform: [{ rotate: `${flipTurn.value * 180}deg` }] }));

  if (!permission) return <View style={styles.fill} />;

  if (!permission.granted) {
    return (
      <View style={[styles.fill, styles.permWrap, { paddingBottom: insets.bottom + 32 }]}>
        <Animated.View entering={FadeInDown.duration(700).easing(easeOut)}>
          <ApertureIcon size={40} color={colors.text} weight="light" />
          <Text style={styles.permTitle}>Point at anything.{'\n'}Get its story.</Text>
          <Text style={styles.permBody}>Odeon needs your camera to see what you’re looking at.</Text>
        </Animated.View>
        <Animated.View entering={FadeInDown.delay(150).duration(700).easing(easeOut)}>
          <Pressable
            style={({ pressed }) => [styles.permButton, pressed && styles.pressed]}
            onPress={requestPermission}
          >
            <Text style={styles.permButtonText}>Allow camera</Text>
          </Pressable>
        </Animated.View>
      </View>
    );
  }

  const capture = async () => {
    if (!cameraRef.current || !ready || busy) return;
    setBusy(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    press.set(withSequence(withTiming(0.88, { duration: 90 }), withSpring(1, { damping: 12, stiffness: 220 })));
    flash.set(withSequence(withTiming(0.85, { duration: 60 }), withTiming(0, { duration: 380 })));
    try {
      const photo = await cameraRef.current.takePictureAsync({ quality: 0.8, shutterSound: false });
      if (photo?.uri) onCapture(photo.uri);
    } finally {
      setBusy(false);
    }
  };

  const flip = () => {
    Haptics.selectionAsync();
    flipTurn.set(withSpring(flipTurn.value + 1, { damping: 14 }));
    setFacing((f) => (f === 'back' ? 'front' : 'back'));
  };

  return (
    <View style={styles.fill}>
      <CameraView ref={cameraRef} style={StyleSheet.absoluteFill} facing={facing} onCameraReady={() => setReady(true)} />

      {/* Viewfinder corners */}
      <View pointerEvents="none" style={[StyleSheet.absoluteFill, styles.center]}>
        <View style={styles.finder}>
          <View style={[styles.corner, styles.tl]} />
          <View style={[styles.corner, styles.tr]} />
          <View style={[styles.corner, styles.bl]} />
          <View style={[styles.corner, styles.br]} />
        </View>
      </View>

      <Animated.View entering={FadeIn.duration(800)} style={[styles.topBar, { paddingTop: insets.top + 14 }]}>
        <Text style={styles.wordmark}>Odeon</Text>
      </Animated.View>

      <View style={[styles.bottom, { paddingBottom: insets.bottom + 28 }]}>
        <Text style={styles.hint}>Tap to identify</Text>
        <View style={styles.controls}>
          <View style={styles.side} />
          <Pressable onPress={capture} hitSlop={16} accessibilityRole="button" accessibilityLabel="Identify">
            <Animated.View style={[styles.shutterRing, shutterStyle]}>
              <View style={styles.shutterCore} />
            </Animated.View>
          </Pressable>
          <Pressable onPress={flip} hitSlop={12} accessibilityRole="button" accessibilityLabel="Flip camera" style={styles.side}>
            <BlurView intensity={40} tint="dark" style={styles.flip}>
              <Animated.View style={flipStyle}>
                <CameraRotateIcon size={22} color={colors.text} weight="regular" />
              </Animated.View>
            </BlurView>
          </Pressable>
        </View>
      </View>

      <Animated.View pointerEvents="none" style={[StyleSheet.absoluteFill, styles.flash, flashStyle]} />
    </View>
  );
}

const SHUTTER = 78;
const CORNER = 26;

const styles = StyleSheet.create({
  fill: { flex: 1, backgroundColor: colors.bg },
  center: { alignItems: 'center', justifyContent: 'center' },
  pressed: { transform: [{ scale: 0.97 }] },
  permWrap: { justifyContent: 'space-between', paddingHorizontal: 24, paddingTop: '38%' },
  permTitle: { color: colors.text, fontFamily: fonts.semibold, fontSize: 34, lineHeight: 38, letterSpacing: -1, marginTop: 24 },
  permBody: { color: colors.muted, fontFamily: fonts.regular, fontSize: 16, lineHeight: 24, marginTop: 14, maxWidth: 300 },
  permButton: { backgroundColor: colors.text, paddingVertical: 18, borderRadius: radius.pill, alignItems: 'center' },
  permButtonText: { color: colors.bg, fontFamily: fonts.semibold, fontSize: 16 },
  finder: { width: '72%', aspectRatio: 0.82 },
  corner: { position: 'absolute', width: CORNER, height: CORNER, borderColor: 'rgba(255,255,255,0.9)' },
  tl: { top: 0, left: 0, borderTopWidth: 1.5, borderLeftWidth: 1.5, borderTopLeftRadius: radius.inner },
  tr: { top: 0, right: 0, borderTopWidth: 1.5, borderRightWidth: 1.5, borderTopRightRadius: radius.inner },
  bl: { bottom: 0, left: 0, borderBottomWidth: 1.5, borderLeftWidth: 1.5, borderBottomLeftRadius: radius.inner },
  br: { bottom: 0, right: 0, borderBottomWidth: 1.5, borderRightWidth: 1.5, borderBottomRightRadius: radius.inner },
  topBar: { position: 'absolute', top: 0, left: 0, right: 0, paddingHorizontal: 24 },
  wordmark: { color: colors.text, fontFamily: fonts.semibold, fontSize: 20, letterSpacing: -0.6 },
  bottom: { position: 'absolute', bottom: 0, left: 0, right: 0, alignItems: 'center' },
  hint: { color: 'rgba(255,255,255,0.75)', fontFamily: fonts.medium, fontSize: 14, marginBottom: 22 },
  controls: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', alignSelf: 'stretch', paddingHorizontal: 36 },
  side: { width: 48, height: 48 },
  flip: { width: 48, height: 48, borderRadius: radius.pill, overflow: 'hidden', alignItems: 'center', justifyContent: 'center' },
  shutterRing: {
    width: SHUTTER,
    height: SHUTTER,
    borderRadius: SHUTTER / 2,
    borderWidth: 3,
    borderColor: colors.text,
    alignItems: 'center',
    justifyContent: 'center',
  },
  shutterCore: { width: SHUTTER - 16, height: SHUTTER - 16, borderRadius: (SHUTTER - 16) / 2, backgroundColor: colors.text },
  flash: { backgroundColor: colors.text },
});
