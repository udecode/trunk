import {
  type EditorNodesOptions,
  type TreeEditor,
  TreeEditors,
  type TreeNode,
  type TreeNodeEntry,
} from '../interfaces';

/** Find node matching the condition. */
export const findNode = <T extends TreeNode>(
  editor: TreeEditor,
  options: EditorNodesOptions<T> = {}
): TreeNodeEntry<T> | undefined => {
  const nodeEntries = [...TreeEditors.nodes(editor, options)];

  for (const [node, path] of nodeEntries) {
    return [node, path];
  }
};
