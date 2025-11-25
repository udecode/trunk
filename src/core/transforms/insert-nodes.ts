import { castArray } from 'lodash';
import { TreeEditors, type TreeNode, TreePaths } from '../interfaces';
import type { TreeTransforms } from '../interfaces/transforms';

export const insertNodes: (typeof TreeTransforms)['insertNodes'] = (
  editor,
  nodeOrNodes,
  options = {}
) => {
  // Editor.withoutNormalizing(editor, () => {
  const { match } = options;
  let { at } = options;

  const nodes = castArray<TreeNode>(nodeOrNodes);

  if (nodes.length === 0) {
    return;
  }
  if (!at) {
    at = [0];
    //   at = getDefaultInsertLocation(editor);
    //   select = true;
  }
  if (match) {
    const [entry] = TreeEditors.nodes(editor, {
      at,
      match,
    });

    if (entry) {
      const [, path] = entry;
      at = path;
    }
  }

  const parentPath = TreePaths.parent(at);

  if (!parentPath) {
    return editor.onError({
      key: 'insertNodes.parent',
      data: { at },
      message: 'Cannot find the parent path',
    });
  }

  let index = at.at(-1)!;

  for (const node of nodes) {
    const path = parentPath.concat(index);
    index++;
    editor.apply({ node, path, type: 'insert_node' });
    at = TreePaths.next(at);

    if (!at) {
      return editor.onError({
        key: 'insertNodes.next',
        data: { at },
        message: 'Cannot find the next path',
      });
    }
  }

  // if (select) {
  //   const point = Editor.end(editor, at);
  //
  //   if (point) {
  //     Transforms.select(editor, point);
  //   }
  // }
  // });
};
