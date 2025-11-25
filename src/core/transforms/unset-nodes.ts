import { TreeTransforms, type TreeNode } from '../interfaces';

import type { NodeTransforms } from '../interfaces/transforms/node';

export const unsetNodes: NodeTransforms['unsetNodes'] = (
  editor,
  props,
  options = {}
) => {
  const propsArray = Array.isArray(props) ? props : [props];

  const obj: Record<string, null> = {};

  for (const key of propsArray) {
    obj[key] = null;
  }

  TreeTransforms.setNodes(editor, obj as Partial<TreeNode>, options);
};
