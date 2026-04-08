import { themeToCssVars } from './to-css';

export const colors = {
  primary: '215 65% 45%',
  accent: '215 45% 92%',
  background: '0 0% 100%',
  foreground: '220 15% 15%',
  success: '152 55% 42%',
  error: '0 72% 51%',
  warning: '38 92% 50%',
  info: '215 65% 45%',
  contrast: {
    100: '220 14% 96%',
    200: '220 13% 91%',
    300: '220 10% 78%',
    400: '220 8% 56%',
    500: '220 12% 35%',
  },
  primaryMix: {
    white: {
      75: '215 50% 93%',
    },
    black: {
      75: '215 50% 12%',
    },
  },
};

export const BaseColors = () => (
  <style data-makeswift="theme-base-colors">{`:root {
      ${themeToCssVars(colors).join('\n')}
    }
  `}</style>
);
