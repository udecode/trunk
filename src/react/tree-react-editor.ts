import type { ScrollIntoArea } from '../core/utils/types';

import {
  type TreeEditor,
  TreeEditors,
  type TreeNode,
  type TreePath,
  type TreeValue,
} from '../core/interfaces';
import { type DOMNode, isDOMElement, isDOMNode } from './utils/dom';
import { TreeNodeKey } from './utils/treeNodeKey';
import {
  EDITOR_TO_ELEMENT,
  EDITOR_TO_KEY_TO_ELEMENT,
  EDITOR_TO_WINDOW,
  ELEMENT_TO_NODE,
  IS_READ_ONLY,
  NODE_TO_INDEX,
  NODE_TO_KEY,
  NODE_TO_PARENT,
} from './utils/weak-maps';

/** A React and DOM-specific version of the `Editor` interface. */

export interface TreeReactEditor<V extends TreeValue = TreeValue>
  extends TreeEditor<V> {
  scrollIntoView: ScrollIntoArea;
  hasTarget: (
    editor: TreeReactEditor,
    target: EventTarget | null
  ) => target is DOMNode;
  insertData: (data: DataTransfer) => void;
  setFragmentData: (
    data: DataTransfer,
    originEvent?: 'copy' | 'cut' | 'drag'
  ) => void;

  setScrollIntoView: (fn: ScrollIntoArea) => () => void;
}

export type TreeReactEditorInterface = {
  /** Blur the editor. */
  blur: (editor: TreeReactEditor) => void;

  /** Find a key for a Tree node. */
  findKey: (editor: TreeReactEditor, node: TreeNode) => TreeNodeKey;

  /** Find the path of Tree node. */
  findPath: (editor: TreeReactEditor, node: TreeNode) => TreePath | undefined;

  /** Focus the editor. */
  focus: (
    editor: TreeReactEditor,
    options?: Parameters<ScrollIntoArea>[1] & {
      at?: TreePath;
    }
  ) => void;

  /** Return the host window of the current editor. */
  getWindow: (editor: TreeReactEditor) => Window;

  /** Check if a DOM node is within the editor. */
  hasDOMNode: (editor: TreeReactEditor, target: DOMNode) => boolean;

  /** Check if the target is in the editor. */
  hasTarget: (
    editor: TreeReactEditor,
    target: EventTarget | null
  ) => target is DOMNode;

  /** Insert data from a `DataTransfer` into the editor. */
  insertData: (editor: TreeReactEditor, data: DataTransfer) => void;

  /** Check if the editor is in read-only mode. */
  isReadOnly: (editor: TreeReactEditor) => boolean;

  /** Sets data from the currently selected fragment on a `DataTransfer`. */
  setFragmentData: (
    editor: TreeReactEditor,
    data: DataTransfer,
    originEvent?: 'copy' | 'cut' | 'drag'
  ) => void;

  /** Find the native DOM element from a Tree node. */
  toDOMNode: (
    editor: TreeReactEditor,
    node: TreeNode
  ) => HTMLElement | undefined;

  /** Find a Tree node from a native DOM `element`. */
  toTreeNode: (
    editor: TreeReactEditor,
    domNode: DOMNode
  ) => TreeNode | undefined;
};

export const TreeReactEditors: TreeReactEditorInterface = {
  blur: (editor) => {
    const el = TreeReactEditors.toDOMNode(editor, editor);

    if (!el) {
      editor.onError({
        key: 'ReactEditor.blur.toDOMNode',
        message:
          'Cannot blur-sm the editor because its DOM node is not mounted.',
      });

      return;
    }

    // IS_FOCUSED.set(editor, false);

    el.blur();
  },

  findKey: (_, node) => {
    let key = NODE_TO_KEY.get(node);

    if (!key) {
      key = new TreeNodeKey();
      NODE_TO_KEY.set(node, key);
    }

    return key;
  },

  findPath: (editor, node) => {
    const path: TreePath = [];
    let child = node;

    while (true) {
      const parent = NODE_TO_PARENT.get(child);

      if (parent == null) {
        if (TreeEditors.isEditor(child)) {
          return path;
        }
        break;
      }

      const i = NODE_TO_INDEX.get(child);

      if (i == null) {
        break;
      }

      path.unshift(i);
      child = parent;
    }

    return editor.onError({
      key: 'ReactEditor.findPath',
      message: `Unable to find the path for Tree node: ${JSON.stringify(node)}`,
    });
  },

  focus: (editor, { at = [], ...options } = {}) => {
    const entry = TreeEditors.node(editor, at);

    if (!entry) return;

    const el = TreeReactEditors.toDOMNode(editor, entry[0]);

    if (!el) {
      editor.onError({
        key: 'TreeReactEditors.focus.toDOMNode',
        message: 'Cannot focus the editor without a DOM node',
      });

      return;
    }

    // IS_FOCUSED.set(editor, true);

    el.focus({ preventScroll: true });

    editor.scrollIntoView(el, options);
  },

  getWindow: (editor) => {
    const window = EDITOR_TO_WINDOW.get(editor);

    if (!window) {
      throw new Error('Unable to find a host window element for this editor');
    }

    return window;
  },

  hasDOMNode: (editor, target) => {
    const editorEl = TreeReactEditors.toDOMNode(editor, editor);
    let targetEl: HTMLElement | null | undefined;

    // COMPAT: In Firefox, reading `target.nodeType` will throw an error if
    // target is originating from an internal "restricted" element (e.g. a
    // stepper arrow on a number input). (2018/05/04)
    // https://github.com/ianstormtaylor/slate/issues/1819
    try {
      targetEl = (
        isDOMElement(target) ? target : target.parentElement
      ) as HTMLElement;
    } catch (error) {
      if (
        !(error instanceof Error) ||
        !error.message.includes(
          'Permission denied to access property "nodeType"'
        )
      ) {
        throw error;
      }
    }

    if (!targetEl) {
      return false;
    }

    return targetEl.closest('[data-trunk-editor]') === editorEl;
  },

  hasTarget: (editor, target): target is DOMNode =>
    isDOMNode(target) && TreeReactEditors.hasDOMNode(editor, target),

  insertData: (editor, data) => {
    editor.insertData(data);
  },

  isReadOnly: (editor) => !!IS_READ_ONLY.get(editor),

  setFragmentData: (editor, data, originEvent) =>
    editor.setFragmentData(data, originEvent),

  toDOMNode: (editor, node) => {
    const KEY_TO_ELEMENT = EDITOR_TO_KEY_TO_ELEMENT.get(editor);
    const domNode = TreeEditors.isEditor(node)
      ? EDITOR_TO_ELEMENT.get(editor)
      : KEY_TO_ELEMENT?.get(TreeReactEditors.findKey(editor, node));

    if (!domNode) {
      return editor.onError({
        key: 'ReactEditor.toDOMNode',
        data: { node },
        message: `Cannot resolve a DOM node from Tree node: ${JSON.stringify(
          node
        )}`,
      });
    }

    return domNode;
  },

  toTreeNode: (editor, domNode) => {
    let domEl = isDOMElement(domNode) ? domNode : domNode.parentElement;

    if (domEl && !Object.hasOwn((domEl as any).dataset, 'treeNode')) {
      domEl = domEl.closest('[data-tree-node]');
    }

    const node = domEl ? ELEMENT_TO_NODE.get(domEl as HTMLElement) : null;

    if (!node) {
      return editor.onError({
        key: 'ReactEditor.toTreeNode',
        data: { domEl, ELEMENT_TO_NODE },
        message: `Cannot resolve a Tree node from DOM node: ${JSON.stringify(
          domEl
        )}`,
      });
    }

    return node;
  },
};
