import {
  TreeEditors,
  TreeElements,
  TreePaths,
  TreeTransforms,
} from '../interfaces';
import { matchTreePath } from '../utils/match-tree-path';

import type { NodeTransforms } from '../interfaces/transforms/node';

export const wrapNodes: NodeTransforms['wrapNodes'] = (
  editor,
  element,
  options = {}
) => {
  // TreeEditors.withoutNormalizing(editor, () => {
  const { at } = options;
  let { match } = options;

  if (!at) {
    return;
  }
  if (match == null) {
    match = TreePaths.isPath(at)
      ? matchTreePath(editor, at)
      : (n) => TreeElements.isElement(n);
  }

  const roots = Array.from(
    TreeEditors.nodes(editor, {
      at,
      match: (n) => TreeEditors.isEditor(n),
    })
  );

  for (const [, rootPath] of roots) {
    const matches = Array.from(
      TreeEditors.nodes(editor, { at: rootPath, match })
    );

    if (matches.length > 0) {
      const [first] = matches;
      const last = matches.at(-1)!;
      const [, firstPath] = first;
      const [, lastPath] = last;

      if (firstPath.length === 0 && lastPath.length === 0) {
        // if there's no matching parent - usually means the node is an editor - don't do anything
        continue;
      }

      const commonPath = TreePaths.equals(firstPath, lastPath)
        ? TreePaths.parent(firstPath)
        : TreePaths.common(firstPath, lastPath);

      if (!commonPath) {
        editor.onError({
          key: 'wrapNodes.commonPath',
          data: { firstPath, lastPath },
          message: 'Could not find commonPath',
        });

        continue;
      }

      const depth = commonPath.length + 1;
      const wrapperPath = TreePaths.next(lastPath.slice(0, depth));

      if (!wrapperPath) {
        editor.onError({
          key: 'wrapNodes.wrapperPath',
          data: { depth, lastPath },
          message: 'Could not find wrapperPath',
        });

        continue;
      }

      const wrapper: any = { ...element, children: [] };
      TreeTransforms.insertNodes(editor, wrapper, { at: wrapperPath });

      TreeTransforms.moveNodes(editor, {
        at,
        to: wrapperPath.concat(0),
      });
    }
  }
  // });
};
