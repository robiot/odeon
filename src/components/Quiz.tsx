import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import * as Haptics from 'expo-haptics';
import { CheckIcon, XIcon } from '../icons';
import Animated, { FadeInDown, useAnimatedStyle, useSharedValue, withSequence, withTiming } from 'react-native-reanimated';
import type { Entry } from '../schema';
import { colors, fonts, radius, easeOut } from '../theme';

export default function Quiz({ quiz }: { quiz: Entry['quiz'] }) {
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
      shake.set(withSequence(
        withTiming(-8, { duration: 50 }),
        withTiming(8, { duration: 60 }),
        withTiming(-4, { duration: 60 }),
        withTiming(0, { duration: 50 }),
      ));
    }
  };

  return (
    <Animated.View style={[styles.card, shakeStyle]}>
      <Text style={styles.q}>{quiz.question}</Text>
      <View style={styles.options}>
        {quiz.options.map((o, i) => {
          const isAnswer = i === quiz.answerIndex;
          const isWrongPick = answered && !isAnswer && i === picked;
          const showRight = answered && isAnswer;
          const dimmed = answered && !isAnswer && i !== picked;
          return (
            <Pressable
              key={i}
              onPress={() => choose(i)}
              disabled={answered}
              style={({ pressed }) => [
                styles.opt,
                showRight && styles.optRight,
                isWrongPick && styles.optWrong,
                pressed && styles.pressed,
              ]}
            >
              <Text style={[styles.optKey, dimmed && styles.dim]}>{String.fromCharCode(65 + i)}</Text>
              <Text style={[styles.optText, dimmed && styles.dim]}>{o}</Text>
              {showRight && <CheckIcon size={18} color={colors.good} weight="bold" />}
              {isWrongPick && <XIcon size={18} color={colors.bad} weight="bold" />}
            </Pressable>
          );
        })}
      </View>
      {answered && (
        <Animated.View entering={FadeInDown.duration(500).easing(easeOut)} style={styles.result}>
          <Text style={[styles.resultTitle, { color: correct ? colors.good : colors.text }]}>
            {correct ? 'Correct.' : 'Not quite.'}
          </Text>
          <Text style={styles.resultBody}>{quiz.explanation}</Text>
        </Animated.View>
      )}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.container,
    borderWidth: 1,
    borderColor: colors.hairline,
    padding: 18,
  },
  q: { color: colors.text, fontFamily: fonts.semibold, fontSize: 19, lineHeight: 25, letterSpacing: -0.4 },
  options: { marginTop: 16, gap: 8 },
  opt: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: radius.pill,
    paddingVertical: 15,
    paddingHorizontal: 18,
    borderWidth: 1,
    borderColor: colors.hairlineStrong,
  },
  optRight: { borderColor: colors.good, backgroundColor: 'rgba(134,207,156,0.08)' },
  optWrong: { borderColor: colors.bad, backgroundColor: 'rgba(227,130,111,0.08)' },
  pressed: { transform: [{ scale: 0.98 }] },
  optKey: { color: colors.faint, fontFamily: fonts.mono, fontSize: 13, width: 24 },
  optText: { color: colors.text, fontFamily: fonts.medium, fontSize: 16, flex: 1 },
  dim: { opacity: 0.35 },
  result: { marginTop: 16, paddingTop: 16, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.hairlineStrong },
  resultTitle: { fontFamily: fonts.semibold, fontSize: 16 },
  resultBody: { color: colors.muted, fontFamily: fonts.regular, fontSize: 15, lineHeight: 22, marginTop: 4 },
});
