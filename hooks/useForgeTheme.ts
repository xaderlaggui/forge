import { useColorScheme } from 'react-native';
import { DarkTheme, LightTheme } from '../constants/ForgeTheme';
import { useThemeStore } from '../stores/themeStore';

/**
 * useForgeTheme — Returns the active theme palette based on:
 *  1. User preference stored in themeStore (light | dark | system)
 *  2. System color scheme when preference === 'system'
 *
 * Usage: const { T, isDark } = useForgeTheme();
 */
export function useForgeTheme() {
  const preference   = useThemeStore(s => s.preference);
  const systemScheme = useColorScheme(); // 'light' | 'dark' | null

  const resolvedScheme =
    preference === 'system'
      ? (systemScheme ?? 'dark')
      : preference;

  const isDark = resolvedScheme === 'dark';
  const T      = isDark ? DarkTheme : LightTheme;

  return { T, isDark, resolvedScheme, preference };
}
