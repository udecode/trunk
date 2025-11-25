import {
  type TreeNode,
  type TreeNodeEntry,
  type TreePath,
  TreePaths,
} from '../interfaces';

/** Get the last child of a node or null if no children. */
export const getLastChild = <T extends TreeNode = TreeNode>(
  nodeEntry: TreeNodeEntry<T>
): TreeNodeEntry<T> | null => {
  const [node, path] = nodeEntry;

  if (node.children.length === 0) return null;

  const children = node.children as T[];

  return [children.at(-1) as T, path.concat([children.length - 1])];
};

/** Get last child path. If there is no child, last index is 0. */
export const getLastChildPath = <T extends TreeNode = TreeNode>(
  nodeEntry: TreeNodeEntry<T>
): TreePath => {
  const lastChild = getLastChild(nodeEntry);

  if (!lastChild) return nodeEntry[1].concat([-1]);

  return lastChild[1];
};

/** Is the child path the last one of the parent. */
export const isLastChild = <T extends TreeNode = TreeNode>(
  parentEntry: TreeNodeEntry<T>,
  childPath: TreePath
): boolean => {
  const lastChildPath = getLastChildPath(parentEntry);

  return TreePaths.equals(lastChildPath, childPath);
};
