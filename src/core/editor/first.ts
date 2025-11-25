import { TreeEditors } from '../interfaces/tree-editor';

export const first: (typeof TreeEditors)['first'] = (editor, at) => {
  const path = TreeEditors.path(editor, at, {});

  if (!path) {
    return editor.onError({
      key: 'first',
      data: { at },
      message: 'Cannot get the first node',
    });
  }

  return TreeEditors.node(editor, path);
};
