import type { TreeEditor } from './interfaces/tree-editor';
import { TreeNodes } from './interfaces/tree-node';
import { type TreePath, TreePaths } from './interfaces/tree-path';
import type { WithEditorFirstArg } from './utils/types';

/** Get the "dirty" paths generated from an operation. */
export const getDirtyPaths: WithEditorFirstArg<TreeEditor['getDirtyPaths']> = (
  _editor,
  op
) => {
  switch (op.type) {
    case 'insert_node': {
      const { node, path } = op;
      const levels = TreePaths.levels(path);
      const descendants: TreePath[] = Array.from(
        TreeNodes.nodes(node),
        ([, p]) => path.concat(p)
      );

      return [...levels, ...descendants];
    }
    case 'move_node': {
      const { newPath, path } = op;

      if (TreePaths.equals(path, newPath)) {
        return [];
      }

      const oldAncestors: TreePath[] = [];
      const newAncestors: TreePath[] = [];

      for (const ancestor of TreePaths.ancestors(path)) {
        const p = TreePaths.transform(ancestor, op)!;
        oldAncestors.push(p);
      }

      for (const ancestor of TreePaths.ancestors(newPath)) {
        const p = TreePaths.transform(ancestor, op)!;
        newAncestors.push(p);
      }

      const newParent = newAncestors.at(-1)!;
      const newIndex = newPath.at(-1)!;
      const resultPath = newParent.concat(newIndex);

      return [...oldAncestors, ...newAncestors, resultPath];
    }
    case 'remove_node': {
      const { path } = op;
      const ancestors = TreePaths.ancestors(path);

      return [...ancestors];
    }
    case 'set_node': {
      const { path } = op;

      return TreePaths.levels(path);
    }

    default: {
      return [];
    }
  }
};
