import { TreeEditors, TreeElements, TreePaths } from '../interfaces';
import { matchTreePath } from '../utils/match-tree-path';
import { TreeTransforms } from '../interfaces/transforms';
import type { NodeTransforms } from '../interfaces/transforms/node';

export const unwrapNodes: NodeTransforms['unwrapNodes'] = (
  editor,
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

  // if (TreePaths.isPath(at)) {
  //   const range = TreeEditors.range(editor, at);
  //   if (!range) {
  //     editor.onError({
  //       key: 'unwrapNodes.range',
  //       message: `Cannot unwrap nodes at path [${at}] because it could not be found.`,
  //       data: { path: at },
  //     });
  //     return;
  //   }
  //   at = range;
  // }

  const matches = TreeEditors.nodes(editor, { at, match });
  const pathRefs = Array.from(
    matches,
    ([, p]) => TreeEditors.pathRef(editor, p)
    // unwrapNode will call liftNode which does not support splitting the node when nested.
    // If we do not reverse the order and call it from top to the bottom, it will remove all blocks
    // that wrap target node. So we reverse the order.
  ).toReversed();

  for (const pathRef of pathRefs) {
    const path = pathRef.unref()!;
    const entry = TreeEditors.node(editor, path);

    if (!entry) {
      editor.onError({
        key: 'unwrapNodes.node',
        data: { path },
        message: `Cannot unwrap node at path [${path}] because it could not be found.`,
      });

      continue;
    }

    const [node] = entry;

    // const range = TreeEditors.range(editor, path);
    // if (!range) {
    //   editor.onError({
    //     key: 'unwrapNodes.range',
    //     message: `Cannot unwrap nodes at path [${path}] because it could not be found.`,
    //     data: { path },
    //   });
    //   continue;
    // }

    TreeTransforms.liftNodes(editor, {
      // at: range,
      at: path,
      match: (n) => TreeElements.isAncestor(node) && node.children.includes(n),
    });
  }
  // });
};
