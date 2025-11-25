import type {
  NodeMatch,
  PropsCompare,
  PropsMerge,
  TreeEditor,
} from '../tree-editor';
import type { TreeNode } from '../tree-node';
import type { TreePath } from '../tree-path';
import type { TreeLocation } from '../tree-location';

export type NodeInsertNodesOptions<T extends TreeNode> = {
  at?: TreeLocation;
  match?: NodeMatch<T>;
  select?: boolean;
};

export type NodeTransforms = {
  /**
   * Insert nodes in the editor at the specified location or (if not defined)
   * the current selection or (if not defined) the end of the document.
   */
  insertNodes: <T extends TreeNode>(
    editor: TreeEditor,
    nodes: TreeNode | TreeNode[],
    options?: NodeInsertNodesOptions<T>
  ) => void;

  /**
   * Lift nodes at a specific location upwards in the document tree, splitting
   * their parent in two if necessary.
   */
  liftNodes: <T extends TreeNode>(
    editor: TreeEditor,
    options?: {
      at?: TreeLocation;
      match?: NodeMatch<T>;
    }
  ) => void;

  /** Move the nodes at a location to a new location. */
  moveNodes: <T extends TreeNode>(
    editor: TreeEditor,
    options: {
      to: TreePath;
      at?: TreeLocation;
      match?: NodeMatch<T>;
    }
  ) => void;

  /** Remove the nodes at a specific location in the document. */
  removeNodes: <T extends TreeNode>(
    editor: TreeEditor,
    options?: {
      at?: TreeLocation;
      match?: NodeMatch<T>;
    }
  ) => void;

  /** Set new properties on the nodes at a location. */
  setNodes: <T extends TreeNode>(
    editor: TreeEditor,
    props: Partial<T>,
    options?: {
      at?: TreeLocation;
      compare?: PropsCompare;
      match?: NodeMatch<T>;
      merge?: PropsMerge;
    }
  ) => void;

  /** Unset properties on the nodes at a location. */
  unsetNodes: <T extends TreeNode>(
    editor: TreeEditor,
    props: string[] | string,
    options?: {
      at?: TreeLocation;
      match?: NodeMatch<T>;
    }
  ) => void;

  /**
   * Unwrap the nodes at a location from a parent node, splitting the parent if
   * necessary to ensure that only the content in the range is unwrapped.
   */
  unwrapNodes: <T extends TreeNode>(
    editor: TreeEditor,
    options?: {
      at?: TreeLocation;
      match?: NodeMatch<T>;
    }
  ) => void;

  /**
   * Wrap the nodes at a location in a new container node, splitting the edges
   * of the range first to ensure that only the content in the range is
   * wrapped.
   */
  wrapNodes: <T extends TreeNode>(
    editor: TreeEditor,
    element: Element,
    options?: {
      at?: TreeLocation;
      match?: NodeMatch<T>;
    }
  ) => void;
};

export const NodeTransforms: NodeTransforms = {
  insertNodes(editor, nodes, options) {
    editor.insertNodes(nodes, options);
  },
  liftNodes(editor, options) {
    editor.liftNodes(options);
  },
  moveNodes(editor, options) {
    editor.moveNodes(options);
  },
  removeNodes(editor, options) {
    editor.removeNodes(options);
  },
  setNodes(editor, props, options) {
    editor.setNodes(props, options);
  },
  unsetNodes(editor, props, options) {
    editor.unsetNodes(props, options);
  },
  unwrapNodes(editor, options) {
    editor.unwrapNodes(options);
  },
  wrapNodes(editor, element, options) {
    editor.wrapNodes(element, options);
  },
};
