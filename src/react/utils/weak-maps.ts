import type { TreeAncestor, TreeNode } from '../../core/interfaces';
import type { TreeReactEditor } from '../tree-react-editor';

import type { TreeNodeKey } from './treeNodeKey';

/**
 * Two weak maps that allow us rebuild a path given a node. They are populated
 * at render time such that after a render occurs we can always backtrack.
 */

export const NODE_TO_INDEX = new WeakMap<TreeNode, number>();

export const NODE_TO_PARENT = new WeakMap<TreeNode, TreeAncestor>();

/**
 * Weak maps that allow us to go between Tree nodes and DOM nodes. These are
 * used to resolve DOM event-related logic into Tree actions.
 */
export const EDITOR_TO_WINDOW = new WeakMap<TreeReactEditor, Window>();

export const EDITOR_TO_ELEMENT = new WeakMap<TreeReactEditor, HTMLElement>();

export const ELEMENT_TO_NODE = new WeakMap<HTMLElement, TreeNode>();

export const NODE_TO_ELEMENT = new WeakMap<TreeNode, HTMLElement>();

export const NODE_TO_KEY = new WeakMap<TreeNode, TreeNodeKey>();

export const EDITOR_TO_KEY_TO_ELEMENT = new WeakMap<
  TreeReactEditor,
  WeakMap<TreeNodeKey, HTMLElement>
>();

/** Weak maps for storing editor-related state. */

export const IS_READ_ONLY = new WeakMap<TreeReactEditor, boolean>();

/** Weak map for associating the context `onChange` context with the plugin. */
export const EDITOR_TO_ON_CHANGE = new WeakMap<TreeReactEditor, () => void>();
