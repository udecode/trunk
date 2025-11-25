import { isPlainObject } from 'is-plain-object';

import type { TreeNode } from './tree-node';
import { TreeNodes } from './tree-node';
import type { TreePath } from './tree-path';
import { TreePaths } from './tree-path';

export type InsertTreeNodeOperation = {
  node: TreeNode;
  path: TreePath;
  type: 'insert_node';
};

export type MoveTreeNodeOperation = {
  newPath: TreePath;
  path: TreePath;
  type: 'move_node';
};

export type RemoveTreeNodeOperation = {
  node: TreeNode;
  path: TreePath;
  type: 'remove_node';
};

export type SetTreeNodeOperation = {
  newProperties: Partial<TreeNode>;
  path: TreePath;
  properties: Partial<TreeNode>;
  type: 'set_node';
};

export type TreeNodeOperation =
  | InsertTreeNodeOperation
  | MoveTreeNodeOperation
  | RemoveTreeNodeOperation
  | SetTreeNodeOperation;

export type TreeOperation = TreeNodeOperation;

export const TreeOperations = {
  inverse(op: TreeOperation): TreeOperation {
    switch (op.type) {
      case 'insert_node': {
        return { ...op, type: 'remove_node' };
      }
      case 'move_node': {
        const { newPath, path } = op;

        // PERF: in this case the move operation is a no-op anyways.
        if (TreePaths.equals(newPath, path)) {
          return op;
        }
        // If the move happens completely within a single parent the path and
        // newPath are stable with respect to each other.
        if (TreePaths.isSibling(path, newPath)) {
          return { ...op, newPath: path, path: newPath };
        }

        // If the move does not happen within a single parent it is possible
        // for the move to impact the true path to the location where the node
        // was removed from and where it was inserted. We have to adjust for this
        // and find the original path. We can accomplish this (only in non-sibling)
        // moves by looking at the impact of the move operation on the node
        // after the original move path.
        const inversePath = TreePaths.transform(path, op)!;
        const inverseNewPath = TreePaths.transform(TreePaths.next(path)!, op)!;

        return { ...op, newPath: inverseNewPath, path: inversePath };
      }
      case 'remove_node': {
        return { ...op, type: 'insert_node' };
      }
      case 'set_node': {
        const { newProperties, properties } = op;

        return { ...op, newProperties: properties, properties: newProperties };
      }
    }
  },

  isNodeOperation(value: any): value is TreeNodeOperation {
    return TreeOperations.isOperation(value) && value.type.endsWith('_node');
  },

  isOperation(value: any): value is TreeOperation {
    if (!isPlainObject(value)) {
      return false;
    }

    switch (value.type) {
      case 'insert_node': {
        return TreePaths.isPath(value.path) && TreeNodes.isNode(value.node);
      }
      case 'move_node': {
        return TreePaths.isPath(value.path) && TreePaths.isPath(value.newPath);
      }
      case 'remove_node': {
        return TreePaths.isPath(value.path) && TreeNodes.isNode(value.node);
      }
      case 'set_node': {
        return (
          TreePaths.isPath(value.path) &&
          isPlainObject(value.properties) &&
          isPlainObject(value.newProperties)
        );
      }
      default: {
        return false;
      }
    }
  },

  isOperationList(value: any): value is TreeOperation[] {
    return (
      Array.isArray(value) &&
      value.every((val) => TreeOperations.isOperation(val))
    );
  },
};
