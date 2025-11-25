import type { TreeOperation } from './tree-operation';
import { type TreePath, TreePaths } from './tree-path';

/**
 * `PathRef` objects keep a specific path in a document synced over time as new
 * operations are applied to the editor. You can access their `current` property
 * at any time for the up-to-date path value.
 */

export type TreePathRef = {
  current: TreePath | null;
  unref: () => TreePath | null;
};

export const TreePathRefs = {
  /** Transform the path ref's current value by an operation. */
  transform(ref: TreePathRef, op: TreeOperation): void {
    const { current } = ref;

    if (current == null) {
      return;
    }

    const path = TreePaths.transform(current, op);
    ref.current = path;

    if (path == null) {
      ref.unref();
    }
  },
};
