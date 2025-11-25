import { TreeEditors } from '../interfaces/tree-editor';

export const last: (typeof TreeEditors)['last'] = (editor, at) => {
  const path = TreeEditors.path(editor, at, {});

  if (!path) {
    return editor.onError({
      key: 'last',
      data: { at },
      message: 'Cannot get the last node',
    });
  }

  return TreeEditors.node(editor, path);
};
