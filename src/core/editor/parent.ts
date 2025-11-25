import { TreeEditors } from '../interfaces/tree-editor';
import type { TreeAncestor, TreeNodeEntry } from '../interfaces/tree-node';
import { TreePaths } from '../interfaces/tree-path';

export const parent: (typeof TreeEditors)['parent'] = (
  editor,
  at,
  options = {}
) => {
  const path = TreeEditors.path(editor, at, options);

  if (!path) {
    return editor.onError({
      key: 'parent.path',
      data: { at },
      message: 'Cannot find the path',
    });
  }

  const parentPath = TreePaths.parent(path);

  if (!parentPath) {
    return editor.onError({
      key: 'parent',
      data: { at },
      message: 'Cannot find the parent path',
    });
  }

  const entry = TreeEditors.node(editor, parentPath);

  return entry as TreeNodeEntry<TreeAncestor>;
};
