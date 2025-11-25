import { createDraft, finishDraft } from 'immer';

import type { TreeAncestor } from '../tree-node';
import { TreeNodes } from '../tree-node';
import type { TreeEditor } from '../tree-editor';
import type { TreeOperation } from '../tree-operation';
import { TreePaths } from '../tree-path';

export type GeneralTransforms = {
  /** Transform the editor by an operation. */
  transform: (editor: TreeEditor, op: TreeOperation) => void;
};

const applyToDraft = (editor: TreeEditor, op: TreeOperation) => {
  switch (op.type) {
    case 'insert_node': {
      const { node, path } = op;
      const parent = TreeNodes.parent(editor, path);

      if (!parent) {
        return editor.onError({
          key: 'apply.insert_node.parent',
          data: { path },
          message: `Cannot apply an "insert_node" operation at path [${path}] because it has no parent.`,
        });
      }

      const index = path.at(-1)!;

      if (index > parent.children.length) {
        return editor.onError({
          key: 'apply.insert_node.index',
          data: { parent, path },
          message: `Cannot apply an "insert_node" operation at path [${path}] because the destination is past the end of the node.`,
        });
      }

      parent.children.splice(index, 0, node);

      break;
    }
    case 'move_node': {
      const { newPath, path } = op;

      if (TreePaths.isAncestor(path, newPath)) {
        return editor.onError({
          key: 'apply.move_node.ancestor',
          data: { newPath, path },
          message: `Cannot move a path [${path}] to new path [${newPath}] because the destination is inside itself.`,
        });
      }

      const node = TreeNodes.get(editor, path);

      if (!node) {
        return editor.onError({
          key: 'apply.move_node.node',
          data: { newPath, path },
          message: `Cannot apply a "move_node" operation at path [${path}] because it could not be found.`,
        });
      }

      const parent = TreeNodes.parent(editor, path);

      if (!parent) {
        return editor.onError({
          key: 'apply.move_node.parent',
          data: { newPath, path },
          message: `Cannot apply a "move_node" operation at path [${path}] because it has no parent.`,
        });
      }

      const index = path.at(-1)!;

      // This is tricky, but since the `path` and `newPath` both refer to
      // the same snapshot in time, there's a mismatch. After either
      // removing the original position, the second step's path can be out
      // of date. So instead of using the `op.newPath` directly, we
      // transform `op.path` to ascertain what the `newPath` would be after
      // the operation was applied.
      parent.children.splice(index, 1);
      const truePath = TreePaths.transform(path, op)!;

      const newParentPath = TreePaths.parent(truePath);

      if (!newParentPath) {
        return editor.onError({
          key: 'apply.move_node.newParent',
          data: { newPath, path },
          message: `Cannot apply a "move_node" operation at path [${path}] because it has no parent.`,
        });
      }

      const newParent = TreeNodes.get(editor, newParentPath) as TreeAncestor;
      const newIndex = truePath.at(-1)!;

      newParent.children.splice(newIndex, 0, node);

      break;
    }
    case 'remove_node': {
      const { path } = op;
      const index = path.at(-1)!;
      const parent = TreeNodes.parent(editor, path);

      if (!parent) {
        return editor.onError({
          key: 'apply.remove_node.parent',
          data: { path },
          message: `Cannot apply a "remove_node" operation at path [${path}] because it has no parent.`,
        });
      }

      parent.children.splice(index, 1);

      break;
    }
    case 'set_node': {
      const { newProperties, path, properties } = op;

      if (path.length === 0) {
        return editor.onError({
          key: 'apply.set_node.root',
          data: { newProperties, path, properties },
          message: 'Cannot set properties on the root node!',
        });
      }

      const node = TreeNodes.get(editor, path);

      if (!node) {
        return editor.onError({
          key: 'apply.set_node.node',
          data: { newProperties, path, properties },
          message: `Cannot apply a "set_node" operation at path [${path}] because it could not be found.`,
        });
      }

      for (const key in newProperties) {
        if (Object.hasOwn(newProperties, key)) {
          if (key === 'children' || key === 'text') {
            return editor.onError({
              key: 'apply.set_node.children',
              data: { key, newProperties, path, properties },
              message: `Cannot set the "${key}" property of nodes!`,
            });
          }

          const value = (newProperties as Record<string, unknown>)[key];

          if (value == null) {
            delete (node as Record<string, unknown>)[key];
          } else {
            (node as Record<string, unknown>)[key] = value;
          }
        }
      }

      // properties that were previously defined, but are now missing, must be deleted
      for (const key in properties) {
        if (
          Object.hasOwn(properties, key) &&
          !Object.hasOwn(newProperties, key)
        ) {
          delete (node as Record<string, unknown>)[key];
        }
      }

      break;
    }
  }
};

export const GeneralTransforms: GeneralTransforms = {
  transform(editor: TreeEditor, op: TreeOperation): void {
    editor.children = createDraft(editor.children);

    try {
      applyToDraft(editor, op);
    } finally {
      editor.children = finishDraft(editor.children);
    }
  },
};
