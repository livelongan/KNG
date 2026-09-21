import type { SnapshotOut } from 'mobx-state-tree';
import { types } from 'mobx-state-tree';

const THEME_MODE_STORAGE_KEY = 'theme-mode';

export type ThemeMode = 'light' | 'dark';

function isThemeMode(value: string | null): value is ThemeMode {
  return value === 'light' || value === 'dark';
}

function persistThemeMode(mode: ThemeMode) {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    localStorage.setItem(THEME_MODE_STORAGE_KEY, mode);
  } catch {
    // Ignore storage write failures in private/restricted contexts.
  }
}

export function getInitialThemeMode(): ThemeMode {
  if (typeof window === 'undefined') {
    return 'light';
  }

  const cachedMode = localStorage.getItem(THEME_MODE_STORAGE_KEY);
  if (isThemeMode(cachedMode)) {
    return cachedMode;
  }

  const prefersDark = window.matchMedia?.('(prefers-color-scheme: dark)').matches;
  return prefersDark ? 'dark' : 'light';
}

export const BaseStoreModel = types
  .model('BaseStoreModel')
  .props({
    language: types.string,
    themeMode: types.enumeration<ThemeMode>('ThemeMode', ['light', 'dark']),
  })
  .views(() => ({}))
  .actions((self) => ({
    setThemeMode(mode: ThemeMode) {
      self.themeMode = mode;
      persistThemeMode(mode);
    },
    toggleThemeMode() {
      const nextMode = self.themeMode === 'light' ? 'dark' : 'light';
      self.themeMode = nextMode;
      persistThemeMode(nextMode);
    },
  }));

export type BaseStoreType = SnapshotOut<typeof BaseStoreModel>;
