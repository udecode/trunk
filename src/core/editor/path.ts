import type { TreeEditors } from '../interfaces/tree-editor';

export const path: (typeof TreeEditors)['path'] = (
  _editor,
  at,
  options = {}
) => {
  const { depth } = options;

  if (depth != null) {
    return at.slice(0, depth);
  }

  return at;
};
