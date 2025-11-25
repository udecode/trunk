import type { TreeNode } from '../interfaces';
import type { TreePath } from '../interfaces/tree-path';

export const traverseNodes = <N extends TreeNode = TreeNode>(
  root: N,
  consumer: (node: N, path: TreePath) => boolean | undefined,
  {
    order = 'pre-order',
    rootPath = [],
  }: {
    order?: 'post-order' | 'pre-order';
    rootPath?: TreePath;
  } = {}
) => {
  const { children } = root;
  const consumeRoot = () => consumer(root, rootPath);

  if (order === 'pre-order' && consumeRoot()) return true;

  for (let i = 0; i < children.length; i++) {
    const child = children[i];
    const path = [...rootPath, i];

    if (traverseNodes(child, consumer as any, { order, rootPath: path })) {
      break;
    }
  }

  if (order === 'post-order' && consumeRoot()) return true;
};
