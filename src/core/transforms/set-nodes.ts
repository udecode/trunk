import {
  TreeEditors,
  TreeElements,
  type TreeNode,
  TreePaths,
} from '../interfaces';
import type { NodeTransforms } from '../interfaces/transforms/node';
import { matchTreePath } from '../utils/match-tree-path';

export const setNodes: NodeTransforms['setNodes'] = (
  editor,
  props: Partial<TreeNode>,
  options = {}
) => {
  // TreeEditors.withoutNormalizing(editor, () => {
  const { merge } = options;
  const { at } = options;
  let { compare, match } = options;

  if (!at) {
    return;
  }
  if (match == null) {
    match = TreePaths.isPath(at)
      ? matchTreePath(editor, at)
      : (n) => TreeElements.isElement(n);
  }
  if (!compare) {
    compare = (prop, nodeProp) => prop !== nodeProp;
  }

  for (const [node, path] of TreeEditors.nodes(editor, {
    at,
    match,
  })) {
    const properties: Partial<TreeNode> = {};
    const newProperties: Partial<TreeNode> = {};

    // You can't set properties on the editor node.
    if (path.length === 0) {
      continue;
    }

    let hasChanges = false;

    for (const k in props) {
      if (k === 'children' || k === 'text') {
        continue;
      }
      if (compare(props[k], node[k])) {
        hasChanges = true;

        // Omit new properties from the old properties list

        if (Object.hasOwn(node, k)) properties[k] = node[k];
        // Omit properties that have been removed from the new properties list
        if (merge) {
          if (props[k] != null) newProperties[k] = merge(node[k], props[k]);
        } else if (props[k] != null) newProperties[k] = props[k];
      }
    }

    if (hasChanges) {
      editor.apply({
        newProperties,
        path,
        properties,
        type: 'set_node',
      });
    }
  }
  // });
};
