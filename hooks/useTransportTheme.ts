import { useTheme } from '@/components/BothComponents/theme-provider';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';

const palettes = {
  light: {
    surface: '#FFFFFF', panel: '#F4F2ED', border: '#D6D9DE', muted: '#55554E',
    accent: '#742099', selected: '#F8F1FC', blue: '#2468B4', teal: '#087F8C', orange: '#B65339',
    success: '#245B2A', successBackground: '#E3F0DB', danger: '#AB2924', dangerBackground: '#FCE6E0',
    warning: '#815600', warningBackground: '#FFF4DA', blueBackground: '#EAF2FF',
  },
  dark: {
    surface: '#1B2026', panel: '#242B33', border: '#52606E', muted: '#CDD3DA',
    accent: '#DAACF3', selected: '#392447', blue: '#8CC5FF', teal: '#78D5D9', orange: '#FFB59B',
    success: '#A4DFAB', successBackground: '#193B2B', danger: '#FFAAA3', dangerBackground: '#442522',
    warning: '#F5CE7C', warningBackground: '#3B321D', blueBackground: '#1C334D',
  },
};

export function useTransportTheme() {
  const context = useTheme();
  const system = useColorScheme();
  const scheme = context?.scheme ?? system ?? 'light';
  return { ...palettes[scheme], background: Colors[scheme].background, text: Colors[scheme].text };
}
