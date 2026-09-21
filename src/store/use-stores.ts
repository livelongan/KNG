import { useContext } from 'react';
import type { RootStore } from './root-model';
import { StoresContext } from './store-context';

export function useStores(): RootStore {
  const stores = useContext(StoresContext);

  if (!stores) {
    throw new Error('useStores must be used within RootStoreProvider');
  }

  return stores;
}
