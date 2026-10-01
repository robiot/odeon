export const colors = {
  bg: '#0B0D12',
  card: '#151922',
  cardBorder: '#232938',
  text: '#F4F6FB',
  muted: '#8A93A6',
  red: '#E8383D',
  white: '#FFFFFF',
  scan: '#5CF2FF',
  good: '#3DDC84',
  bad: '#FF5A5F',
};

/** Adds alpha to a #RRGGBB color. Falls back to the scan color for bad input. */
export function withAlpha(hex: string, alpha: number) {
  const clean = /^#[0-9a-fA-F]{6}$/.test(hex) ? hex : colors.scan;
  const a = Math.round(Math.max(0, Math.min(1, alpha)) * 255)
    .toString(16)
    .padStart(2, '0');
  return clean + a;
}

export function safeColor(hex: string) {
  return /^#[0-9a-fA-F]{6}$/.test(hex) ? hex : colors.scan;
}
