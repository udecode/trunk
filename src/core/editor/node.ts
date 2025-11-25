import { TreeEditors } from '../interfaces/tree-editor';
import { TreeNodes } from '../interfaces/tree-node';

export const node: (typeof TreeEditors)['node'] = (
  editor,
  at,
  options = {}
) => {
  const path = TreeEditors.path(editor, at, options);

  if (!path) {
    return editor.onError({
      key: 'node',
      data: { at },
      message: 'Cannot find the path',
    });
  }

  const node = TreeNodes.get(editor, path);

  if (!node) {
    return editor.onError({
      key: 'node',
      data: { at },
      message: 'Cannot get the node',
    });
  }

  return [node, path];
};
