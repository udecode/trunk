import type { TreeNode, TreePath } from '../interfaces';

export const pathsByLevel = (
  editor: TreeNode,
  {
    maxDepth = Number.POSITIVE_INFINITY,
  }: {
    maxDepth?: number;
  } = {}
): TreePath[][] => {
  const pathsByLevel: TreePath[][] = [[]]; // Initialize with the root level

  // Initialize queue for breadth-first traversal, each item is [node, path]
  const queue: [TreeNode, TreePath][] = [[editor, []]];

  while (queue.length > 0) {
    const [node, path] = queue.shift()!;

    // Add the path to the appropriate level
    const level = path.length;

    if (level > maxDepth) return pathsByLevel;
    if (!pathsByLevel[level]) {
      pathsByLevel[level] = [];
    }

    pathsByLevel[level].push(path);

    // Enqueue children for future processing
    if (node.children) {
      node.children.forEach((child, index) => {
        queue.push([child, [...path, index]]);
      });
    }
  }

  return pathsByLevel;
};
