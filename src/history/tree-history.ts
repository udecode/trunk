import { isPlainObject } from 'is-plain-object';

import { type TreeOperation, TreeOperations } from '../core/interfaces';

export type TreeHistory = {
  redos: Batch[];
  undos: Batch[];
};

/**
 * `History` objects hold all of the operations that are applied to a value, so
 * they can be undone or redone as necessary.
 */

type Batch = {
  operations: TreeOperation[];
};

export const TreeHistorys = {
  /** Check if a value is a `History` object. */
  isHistory(value: any): value is TreeHistory {
    return (
      isPlainObject(value) &&
      Array.isArray(value.redos) &&
      Array.isArray(value.undos) &&
      (value.redos.length === 0 ||
        TreeOperations.isOperationList(value.redos[0].operations)) &&
      (value.undos.length === 0 ||
        TreeOperations.isOperationList(value.undos[0].operations))
    );
  },
};
