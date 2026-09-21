import { getInitialThemeMode, type BaseStoreType } from '../store-model';

export const baseInitState: BaseStoreType = {
  language: 'en-US',
  themeMode: getInitialThemeMode(),
};
