import type { ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { colors, fonts, easeOut } from '../theme';

export default function Section({ title, index, children }: { title: string; index: number; children: ReactNode }) {
  return (
    <Animated.View entering={FadeInDown.delay(260 + index * 90).duration(700).easing(easeOut)} style={styles.wrap}>
      <Text style={styles.title}>{title}</Text>
      <View>{children}</View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrap: { marginTop: 44, paddingHorizontal: 20 },
  title: { color: colors.text, fontFamily: fonts.semibold, fontSize: 20, letterSpacing: -0.4, marginBottom: 14 },
});
