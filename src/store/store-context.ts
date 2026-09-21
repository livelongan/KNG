import type { ReactNode } from 'react';
import { createContext, createElement } from 'react';
import { rootInit } from './root-init';
import type { RootStore } from './root-model';

type RootStoreProviderProps = {
  children: ReactNode;
};

export const StoresContext = createContext<RootStore | null>(null);

export function RootStoreProvider({ children }: RootStoreProviderProps) {
  const { rootStore } = rootInit();
  return createElement(StoresContext.Provider, { value: rootStore }, children);
}
