import type { TreeEditors } from '../interfaces/tree-editor';
import { TreeTransforms } from '../interfaces/transforms';

export const insertNode: (typeof TreeEditors)['insertNode'] = (
  editor,
  node,
  options
) => {
  TreeTransforms.insertNodes(editor, node, options);
};
