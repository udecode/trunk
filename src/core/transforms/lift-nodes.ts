import {
  type TreeAncestor,
  TreeEditors,
  TreeElements,
  type TreeNodeEntry,
  TreePaths,
  TreeTransforms,
} from '../interfaces';
import { matchTreePath } from '../utils/match-tree-path';

import type { NodeTransforms } from '../interfaces/transforms/node';

export const liftNodes: NodeTransforms['liftNodes'] = (
  editor,
  options = {}
) => {
  // TreeEditors.withoutNormalizing(editor, () => {
  const { at } = options;
  let { match } = options;

  if (match == null) {
    match = TreePaths.isPath(at)
      ? matchTreePath(editor, at)
      : (n) => TreeElements.isElement(n);
  }
  if (!at) {
    return;
  }

  const matches = TreeEditors.nodes(editor, { at, match });
  const pathRefs = Array.from(matches, ([, p]) =>
    TreeEditors.pathRef(editor, p)
  );

  for (const pathRef of pathRefs) {
    const path = pathRef.unref();

    if (!path) {
      editor.onError({
        key: 'liftNodes.path.unref',
        data: { path },
        message: `Cannot lift nodes at a path [${path}] because it could not be unref'd.`,
      });

      continue;
    }
    if (path.length < 2) {
      editor.onError({
        key: 'liftNodes.depth',
        data: { path },
        message: `Cannot lift node at a path [${path}] because it has a depth of less than \`2\`.`,
      });

      return;
    }

    const parentPath = TreePaths.parent(path);

    if (!parentPath) {
      return editor.onError({
        key: 'liftNodes.parent',
        data: { path },
        message: `Cannot lift node at a path [${path}] because it has no parent path.`,
      });
    }

    const parentNodeEntry = TreeEditors.node(editor, parentPath);
    const [parent] = parentNodeEntry as TreeNodeEntry<TreeAncestor>;
    const index = path.at(-1);
    const { length } = parent.children;

    if (length === 1) {
      const toPath = TreePaths.next(parentPath);

      if (!toPath) {
        return editor.onError({
          key: 'liftNodes.next',
          data: { parentPath, path },
          message: `Cannot lift node at a path [${path}] because it has no next path.`,
        });
      }

      TreeTransforms.moveNodes(editor, { at: path, to: toPath });
      TreeTransforms.removeNodes(editor, { at: parentPath });
    } else if (index === 0) {
      TreeTransforms.moveNodes(editor, { at: path, to: parentPath });
    } else if (index === length - 1) {
      const toPath = TreePaths.next(parentPath);

      if (!toPath) {
        return editor.onError({
          key: 'liftNodes.next.last',
          data: { path },
          message: `Cannot lift node at a path [${path}] because it has no next path.`,
        });
      }

      TreeTransforms.moveNodes(editor, { at: path, to: toPath });
    } else {
      const splitPath = TreePaths.next(path);
      const toPath = TreePaths.next(parentPath);

      if (!splitPath || !toPath) {
        return editor.onError({
          key: 'liftNodes.next.split',
          data: { path },
          message: `Cannot lift node at a path [${path}] because it has no next path.`,
        });
      }

      // TreeTransforms.splitNodes(editor, { at: splitPath, voids });
      TreeTransforms.moveNodes(editor, { at: path, to: toPath });
    }
  }
  // });
};
