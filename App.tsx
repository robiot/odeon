import { useCallback, useRef, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import {
  useFonts,
  Geist_400Regular,
  Geist_500Medium,
  Geist_600SemiBold,
  Geist_700Bold,
} from '@expo-google-fonts/geist';
import { GeistMono_500Medium } from '@expo-google-fonts/geist-mono';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';
import CameraScreen from './src/screens/CameraScreen';
import ScanningScreen from './src/screens/ScanningScreen';
import ResultScreen from './src/screens/ResultScreen';
import { analyzeImage } from './src/claude';
import { toBase64Jpeg } from './src/prepareImage';
import type { Entry } from './src/schema';
import { colors } from './src/theme';

type State =
  | { phase: 'camera' }
  | { phase: 'scanning'; uri: string; entry: Entry | null; error: string | null }
  | { phase: 'result'; uri: string; entry: Entry };

export default function App() {
  const [fontsLoaded] = useFonts({
    Geist_400Regular,
    Geist_500Medium,
    Geist_600SemiBold,
    Geist_700Bold,
    GeistMono_500Medium,
  });
  const [state, setState] = useState<State>({ phase: 'camera' });
  // Bumped on every new scan so a stale response can't overwrite a newer one.
  const scanId = useRef(0);

  const analyze = useCallback(async (uri: string) => {
    const id = ++scanId.current;
    setState({ phase: 'scanning', uri, entry: null, error: null });
    try {
      const entry = await analyzeImage(await toBase64Jpeg(uri));
      if (id === scanId.current) setState({ phase: 'scanning', uri, entry, error: null });
    } catch (e) {
      if (id !== scanId.current) return;
      const message = e instanceof Error ? e.message : 'Something went wrong.';
      setState({ phase: 'scanning', uri, entry: null, error: message });
    }
  }, []);

  const reset = useCallback(() => {
    scanId.current++;
    setState({ phase: 'camera' });
  }, []);

  const showResult = useCallback(() => {
    setState((s) => (s.phase === 'scanning' && s.entry ? { phase: 'result', uri: s.uri, entry: s.entry } : s));
  }, []);

  if (!fontsLoaded) return <View style={styles.root} />;

  return (
    <SafeAreaProvider>
      <StatusBar style="light" />
      <View style={styles.root}>
        {state.phase === 'camera' && (
          <Animated.View key="camera" entering={FadeIn} exiting={FadeOut} style={styles.root}>
            <CameraScreen onCapture={analyze} />
          </Animated.View>
        )}
        {state.phase === 'scanning' && (
          <Animated.View key="scan" exiting={FadeOut.duration(250)} style={StyleSheet.absoluteFill}>
            <ScanningScreen
              uri={state.uri}
              done={!!state.entry}
              error={state.error}
              onFinished={showResult}
              onRetry={() => analyze(state.uri)}
              onCancel={reset}
            />
          </Animated.View>
        )}
        {state.phase === 'result' && (
          <Animated.View key="result" entering={FadeIn.duration(400)} style={styles.root}>
            <ResultScreen uri={state.uri} entry={state.entry} onScanAgain={reset} />
          </Animated.View>
        )}
      </View>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
});
