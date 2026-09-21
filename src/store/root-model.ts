import type { IAnyStateTreeNode, Instance, SnapshotOut } from 'mobx-state-tree';
import { getRoot, types } from 'mobx-state-tree';
import { BaseStoreModel } from './store-model';

export const RootStoreModel = types.model('RootStoreModel').props({
  baseStore: BaseStoreModel,
});

export type RootStore = Instance<typeof RootStoreModel>;
export type RootStoreType = SnapshotOut<typeof RootStoreModel>;

export const getRootStore = (target: IAnyStateTreeNode): RootStore => {
  return getRoot(target) as RootStore;
};
