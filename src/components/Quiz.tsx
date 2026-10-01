import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import * as Haptics from 'expo-haptics';
import Animated, { FadeInDown, useAnimatedStyle, useSharedValue, withSequence, withTiming } from 'react-native-reanimated';
import type { Entry } from '../schema';
import { colors, withAlpha } from '../theme';

export default function Quiz({ quiz, accent }: { quiz: Entry['quiz']; accent: string }) {
  const [picked, setPicked] = useState<number | null>(null);
  const shake = useSharedValue(0);
  const shakeStyle = useAnimatedStyle(() => ({ transform: [{ translateX: shake.value }] }));
  const answered = picked !== null;
  const correct = picked === quiz.answerIndex;

  const choose = (i: number) => {
    if (answered) return;
    setPicked(i);
    if (i === quiz.answerIndex) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } else {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      shake.value = withSequence(
        withTiming(-10, { duration: 50 }),
        withTiming(10, { duration: 60 }),
        withTiming(-6, { duration: 60 }),
        withTiming(0, { duration: 50 }),
      );
    }
  };

  return (
    <Animated.View style={[styles.card, { borderColor: withAlpha(accent, 0.35) }, shakeStyle]}>
      <Text style={styles.q}>{quiz.question}</Text>
      <View style={styles.options}>
        {quiz.options.map((o, i) => {
          const isAnswer = i === quiz.answerIndex;
          const bg = !answered
            ? '#1E2330'
            : isAnswer
              ? withAlpha(colors.good, 0.22)
              : i === picked
                ? withAlpha(colors.bad, 0.22)
                : '#1A1E29';
          const border = !answered ? 'transparent' : isAnswer ? colors.good : i === picked ? colors.bad : 'transparent';
          return (
            <Pressable key={i} onPress={() => choose(i)} style={[styles.opt, { backgroundColor: bg, borderColor: border }]}>
              <Text style={[styles.optLetter, { color: accent }]}>{String.fromCharCode(65 + i)}</Text>
              <Text style={[styles.optText, answered && !isAnswer && i !== picked && { opacity: 0.45 }]}>{o}</Text>
              {answered && isAnswer && <Text style={styles.mark}>✓</Text>}
              {answered && !isAnswer && i === picked && <Text style={styles.mark}>✗</Text>}
            </Pressable>
          );
        })}
      </View>
      {answered && (
        <Animated.View entering={FadeInDown.springify()} style={styles.result}>
          <Text style={styles.resultTitle}>{correct ? '🎉 Nailed it!' : '😅 Not quite!'}</Text>
          <Text style={styles.resultBody}>{quiz.explanation}</Text>
        </Animated.View>
      )}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: colors.card, borderRadius: 22, padding: 18, borderWidth: 1 },
  q: { color: colors.text, fontSize: 19, fontWeight: '800', lineHeight: 25 },
  options: { marginTop: 14, gap: 10 },
  opt: { flexDirection: 'row', alignItems: 'center', borderRadius: 16, paddingVertical: 14, paddingHorizontal: 14, borderWidth: 1.5 },
  optLetter: { fontWeight: '900', fontSize: 15, width: 24 },
  optText: { color: colors.text, fontSize: 16, fontWeight: '600', flex: 1 },
  mark: { color: colors.text, fontSize: 18, fontWeight: '900' },
  result: { marginTop: 14 },
  resultTitle: { color: colors.text, fontSize: 17, fontWeight: '800' },
  resultBody: { color: colors.muted, fontSize: 15, marginTop: 4, lineHeight: 21 },
});
