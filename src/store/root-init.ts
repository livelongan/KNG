import { baseInitState } from './init-state/base';
import type { RootStore, RootStoreType } from './root-model';
import { RootStoreModel } from './root-model';

const rootInitStore: RootStoreType = {
  baseStore: { ...baseInitState },
};

let rootStore: RootStore | undefined;

export const rootInit = (): { rootStore: RootStore } => {
  if (!rootStore) {
    rootStore = RootStoreModel.create(rootInitStore);
  }

  return { rootStore };
};
