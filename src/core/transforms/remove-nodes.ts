import { TreeEditors, TreeElements, TreePaths } from '../interfaces';
import type { TreeTransforms } from '../interfaces/transforms';
import { matchTreePath } from '../utils/match-tree-path';

export const removeNodes: (typeof TreeTransforms)['removeNodes'] = (
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

  const depths = TreeEditors.nodes(editor, { at, match });
  const pathRefs = Array.from(depths, ([, p]) =>
    TreeEditors.pathRef(editor, p)
  );

  for (const pathRef of pathRefs) {
    const path = pathRef.unref();

    if (path) {
      const entry = TreeEditors.node(editor, path);

      if (!entry) {
        editor.onError({
          key: 'removeNodes.node',
          data: { path },
          message: `Cannot remove node at path [${path}] because it could not be found.`,
        });

        continue;
      }

      const [node] = entry;
      editor.apply({ node, path, type: 'remove_node' });
    }
  }
  // })
};
