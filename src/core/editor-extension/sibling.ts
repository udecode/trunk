import {
  type TreeEditor,
  TreeEditors,
  type TreeNodeEntry,
  type TreePath,
  TreePaths,
} from '../interfaces';

/**
 * Get the previous sibling node. If there is no previous sibling, get the
 * previous cousin at the same level.
 */
export const sibling = (
  editor: TreeEditor,
  target: TreePath,
  {
    reverse,
  }: {
    reverse?: boolean;
  } = {}
): TreeNodeEntry | undefined => {
  const paths = TreeEditors.pathsByLevel(editor, {
    maxDepth: target.length,
  });
  const targetLevel = target.length;

  const siblingPath = reverse
    ? TreePaths.previous(target)
    : TreePaths.next(target);

  if (siblingPath) {
    const siblingNode = TreeEditors.node(editor, siblingPath);

    if (siblingNode) {
      return TreeEditors.node(editor, siblingPath);
    }
  }

  // Get the list of paths at the target level
  const pathsAtLevel = paths[targetLevel];

  // Find the index of the target path
  const targetIndex = pathsAtLevel.findIndex((path) =>
    TreePaths.equals(path, target)
  );

  // If the target path is found and it's not the first in the list, return the previous path
  if (reverse ? targetIndex > 0 : targetIndex < pathsAtLevel.length - 1) {
    return TreeEditors.node(
      editor,
      pathsAtLevel[targetIndex + (reverse ? -1 : 1)]
    );
  }
};
