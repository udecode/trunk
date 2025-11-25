import type { TreeEditor } from '../interfaces/tree-editor';
import type { TreePath } from '../interfaces/tree-path';
import type { TreePathRef } from '../interfaces/tree-path-ref';

export const DIRTY_PATHS = new WeakMap<TreeEditor, TreePath[]>();

export const DIRTY_PATH_KEYS = new WeakMap<TreeEditor, Set<string>>();

export const FLUSHING = new WeakMap<TreeEditor, boolean>();

export const NORMALIZING = new WeakMap<TreeEditor, boolean>();

export const PATH_REFS = new WeakMap<TreeEditor, Set<TreePathRef>>();
// export const POINT_REFS: WeakMap<TreeEditor, Set<PointRef>> = new WeakMap()
// export const RANGE_REFS: WeakMap<TreeEditor, Set<RangeRef>> = new WeakMap()
