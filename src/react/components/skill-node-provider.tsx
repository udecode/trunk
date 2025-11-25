'use client';

import { createAtomStore } from 'jotai-x';
import type { TreeElement, TreePath } from '../../core/interfaces';
import type { Nullable } from '../../core/utils/types';

export type TreeElementStore = {
  element: TreeElement;
  path: TreePath;
};

const initialState: Nullable<TreeElementStore> = {
  element: null,
  path: null,
};

export const { TreeElementProvider, useTreeElementStore } = createAtomStore(
  initialState as TreeElementStore,
  { name: 'treeElement' }
);
