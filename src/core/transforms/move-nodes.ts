import { TreeEditors, TreeElements, TreePaths } from '../interfaces';
import { matchTreePath } from '../utils/match-tree-path';

import type { NodeTransforms } from '../interfaces/transforms/node';

export const moveNodes: NodeTransforms['moveNodes'] = (editor, options) => {
  // TreeEditors.withoutNormalizing(editor, () => {
  const { at, to } = options;
  let { match } = options;

  if (!at) {
    return;
  }
  if (match == null) {
    match = TreePaths.isPath(at)
      ? matchTreePath(editor, at)
      : (n) => TreeElements.isElement(n);
  }

  const toRef = TreeEditors.pathRef(editor, to);
  const targets = TreeEditors.nodes(editor, { at, match });
  const pathRefs = Array.from(targets, ([, p]) =>
    TreeEditors.pathRef(editor, p)
  );

  for (const pathRef of pathRefs) {
    const path = pathRef.unref()!;
    const newPath = toRef.current!;

    if (path.length > 0) {
      editor.apply({ newPath, path, type: 'move_node' });
    }
    if (
      toRef.current &&
      TreePaths.isSibling(newPath, path) &&
      TreePaths.isAfter(newPath, path)
    ) {
      // When performing a sibling move to a later index, the path at the destination is shifted
      // to before the insertion point instead of after. To ensure our group of nodes are inserted
      // in the correct order we increment toRef to account for that
      const nextPath = TreePaths.next(toRef.current);

      if (nextPath) {
        toRef.current = nextPath;
      } else {
        editor.onError({
          key: 'moveNodes.next',
          data: { toRef },
          message: `Cannot move nodes to a path [${toRef.current}] because it has no next path.`,
        });
      }
    }
  }

  toRef.unref();
  // });
};
