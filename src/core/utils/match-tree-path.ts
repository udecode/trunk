import { type TreeEditor, TreeEditors } from '../interfaces/tree-editor';
import type { TreeNode } from '../interfaces/tree-node';
import type { TreePath } from '../interfaces/tree-path';

export const matchTreePath = (
  editor: TreeEditor,
  path: TreePath
): ((node: TreeNode) => boolean) => {
  const [node] = TreeEditors.node(editor, path)!;

  return (n) => n === node;
};
