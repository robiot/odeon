import type { ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { colors } from '../theme';

export default function Section({ title, index, children }: { title: string; index: number; children: ReactNode }) {
  return (
    <Animated.View entering={FadeInDown.delay(200 + index * 110).springify().damping(16)} style={styles.wrap}>
      <Text style={styles.title}>{title}</Text>
      <View>{children}</View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrap: { marginTop: 28, paddingHorizontal: 20 },
  title: {
    color: colors.muted,
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 1.6,
    textTransform: 'uppercase',
    marginBottom: 12,
  },
});
