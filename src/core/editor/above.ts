import { TreeEditors } from '../interfaces/tree-editor';
import { TreePaths } from '../interfaces/tree-path';

export const above: (typeof TreeEditors)['above'] = (editor, options = {}) => {
  const { at, match } = options;

  if (!at) {
    return;
  }

  const path = TreeEditors.path(editor, at);

  if (!path) {
    return editor.onError({
      key: 'above',
      data: { at },
      message:
        'Cannot get the node above a void node at the root of the document',
    });
  }

  const reverse = true;

  for (const [n, p] of TreeEditors.levels(editor, {
    at: path,
    match,
    reverse,
  })) {
    if (!TreePaths.equals(path, p)) {
      return [n, p];
    }
  }
};
