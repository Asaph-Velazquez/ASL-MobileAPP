import { Colors } from '@/constants/theme';
import { useColorScheme as useSystemColorScheme } from '@/hooks/use-color-scheme';
import React, { createContext, useContext, useMemo, useState } from 'react';

type ColorScheme = 'light' | 'dark';

type ThemeContextValue = {
  scheme: ColorScheme;
  setScheme?: (s: ColorScheme | undefined) => void;
  colors: typeof Colors.light;
};

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

export function ThemeProviderWrapper({ children }: { children: React.ReactNode }) {
  const system = useSystemColorScheme() ?? 'light';
  const [override, setOverride] = useState<ColorScheme | undefined>(undefined);

  const scheme: ColorScheme = (override ?? system) as ColorScheme;

  const value = useMemo(() => ({ scheme, setScheme: setOverride, colors: Colors[scheme] }), [scheme]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  return ctx;
}

export default ThemeContext;
