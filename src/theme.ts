import { Easing } from 'react-native-reanimated';

/** Plain black canvas, one gray family, one accent. */
export const colors = {
  bg: '#000000',
  surface: '#0D0D0D',
  surfaceRaised: '#161616',
  hairline: 'rgba(255,255,255,0.08)',
  hairlineStrong: 'rgba(255,255,255,0.16)',
  text: '#F4F4F3',
  muted: '#8E8E8C',
  faint: '#5C5C5A',
  accent: '#C8E66E',
  onAccent: '#0B0F02',
  good: '#86CF9C',
  bad: '#E3826F',
};

export const fonts = {
  regular: 'Geist_400Regular',
  medium: 'Geist_500Medium',
  semibold: 'Geist_600SemiBold',
  bold: 'Geist_700Bold',
  mono: 'GeistMono_500Medium',
};

/** Shape rule: containers 20, inner elements 12, anything you press is a pill. */
export const radius = { container: 20, inner: 12, pill: 999 };

/** Expo-out style curve used for every entrance. */
export const easeOut = Easing.bezier(0.16, 1, 0.3, 1);
