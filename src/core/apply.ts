import { type TreePath, TreePaths } from './interfaces/tree-path';
import { TreeTransforms } from './interfaces/transforms/tree-transforms';
import { type TreeEditor, TreeEditors } from './interfaces/tree-editor';
import { TreePathRefs } from './interfaces/tree-path-ref';
import type { WithEditorFirstArg } from './utils/types';
import { DIRTY_PATH_KEYS, DIRTY_PATHS, FLUSHING } from './utils/weak-maps';

export const apply: WithEditorFirstArg<TreeEditor['apply']> = (editor, op) => {
  for (const ref of TreeEditors.pathRefs(editor)) {
    TreePathRefs.transform(ref, op);
  }

  const oldDirtyPaths = DIRTY_PATHS.get(editor) ?? [];
  const oldDirtyPathKeys = DIRTY_PATH_KEYS.get(editor) ?? new Set();
  let dirtyPaths: TreePath[];
  let dirtyPathKeys: Set<string>;

  const add = (path: TreePath | null) => {
    if (path) {
      const key = path.join(',');

      if (!dirtyPathKeys.has(key)) {
        dirtyPathKeys.add(key);
        dirtyPaths.push(path);
      }
    }
  };

  if (TreePaths.operationCanTransformPath(op)) {
    dirtyPaths = [];
    dirtyPathKeys = new Set();

    for (const path of oldDirtyPaths) {
      const newPath = TreePaths.transform(path, op);
      add(newPath);
    }
  } else {
    dirtyPaths = oldDirtyPaths;
    dirtyPathKeys = oldDirtyPathKeys;
  }

  const newDirtyPaths = editor.getDirtyPaths(op);

  for (const path of newDirtyPaths) {
    add(path);
  }

  DIRTY_PATHS.set(editor, dirtyPaths);
  DIRTY_PATH_KEYS.set(editor, dirtyPathKeys);
  TreeTransforms.transform(editor, op);
  editor.operations.push(op);

  if (!FLUSHING.get(editor)) {
    FLUSHING.set(editor, true);

    void Promise.resolve().then(() => {
      FLUSHING.set(editor, false);
      editor.onChange({ operation: op });
      editor.operations = [];
    });
  }
};
