import type {
  TreeAncestor,
  TreeDescendant,
  TreeNode,
  TreeNodeEntry,
} from './tree-node';
import type { TreeNodeData } from './tree-element';
import type { TreeOperation } from './tree-operation';
import type { TreePath } from './tree-path';
import type { TreePathRef } from './tree-path-ref';
import type { TreeSpan } from './tree-location';
export type { TreeSpan } from './tree-location';
import { isEditor } from '../editor';
import { findNode } from '../editor-extension/findNode';
import { pathsByLevel } from '../editor-extension/pathsByLevel';
import { sibling } from '../editor-extension/sibling';
import { traverseNodes } from '../editor-extension/traverseNodes';
import type { NodeInsertNodesOptions } from './transforms/node';
import type { TreeEditorError } from './tree-errors';
import type { TreeLocation } from './tree-location';
import type { OmitFirstArg } from '../utils/types';
import type { TreeTransforms } from './transforms';

export type EditorAboveOptions<T extends TreeAncestor> = {
  at?: TreeLocation;
  match?: NodeMatch<T>;
};

export type EditorLevelsOptions<T extends TreeNode> = {
  at?: TreeLocation;
  match?: NodeMatch<T> | undefined;
  reverse?: boolean;
};

export type EditorNextOptions<T extends TreeDescendant> = {
  at?: TreeLocation;
  match?: NodeMatch<T>;
};

export type EditorNodeOptions = {
  depth?: number;
};

export type EditorNodesOptions<T extends TreeNode> = {
  at?: TreeLocation | TreeSpan;
  match?: NodeMatch<T>;
  reverse?: boolean;
};

export type EditorParentOptions = {
  depth?: number;
};

export type EditorPathOptions = {
  depth?: number;
};

export type EditorPreviousOptions<T extends TreeNode> = {
  at?: TreeLocation;
  match?: NodeMatch<T>;
};

export type TreeEditor<V extends TreeValue = TreeValue> = {
  id: string;
  children: V;
  data: V[number]['data'];
  first: OmitFirstArg<typeof TreeEditors.first>;
  hasPath: OmitFirstArg<typeof TreeEditors.hasPath>;
  insertNode: OmitFirstArg<typeof TreeEditors.insertNode>;
  insertNodes: OmitFirstArg<typeof TreeTransforms.insertNodes>;
  last: OmitFirstArg<typeof TreeEditors.last>;
  liftNodes: OmitFirstArg<typeof TreeTransforms.liftNodes>;
  // Overrideable core transforms.
  moveNodes: OmitFirstArg<typeof TreeTransforms.moveNodes>;
  node: OmitFirstArg<typeof TreeEditors.node>;
  operations: TreeOperation[];
  parent: OmitFirstArg<typeof TreeEditors.parent>;
  path: OmitFirstArg<typeof TreeEditors.path>;
  pathRef: OmitFirstArg<typeof TreeEditors.pathRef>;
  pathRefs: OmitFirstArg<typeof TreeEditors.pathRefs>;
  // normalize: OmitFirstArg<typeof TreeEditors.normalize>;
  removeNodes: OmitFirstArg<typeof TreeTransforms.removeNodes>;
  string: OmitFirstArg<typeof TreeEditors.string>;
  // Overrideable core queries.
  type: 'editor';
  // setNormalizing: OmitFirstArg<typeof TreeEditors.setNormalizing>;
  unsetNodes: OmitFirstArg<typeof TreeTransforms.unsetNodes>;
  unwrapNodes: OmitFirstArg<typeof TreeTransforms.unwrapNodes>;
  // withoutNormalizing: OmitFirstArg<typeof TreeEditors.withoutNormalizing>;
  wrapNodes: OmitFirstArg<typeof TreeTransforms.wrapNodes>;
  above: <T extends TreeAncestor>(
    options?: EditorAboveOptions<T>
  ) => TreeNodeEntry<T> | undefined;
  apply: (operation: TreeOperation) => void;
  getDirtyPaths: (operation: TreeOperation) => TreePath[];
  levels: <T extends TreeNode>(
    options?: EditorLevelsOptions<T>
  ) => Generator<TreeNodeEntry<T>, void, undefined>;
  next: <T extends TreeDescendant>(
    options?: EditorNextOptions<T>
  ) => TreeNodeEntry<T> | undefined;
  nodes: <T extends TreeNode>(
    options?: EditorNodesOptions<T>
  ) => Generator<TreeNodeEntry<T>, void, undefined>;
  previous: <T extends TreeNode>(
    options?: EditorPreviousOptions<T>
  ) => TreeNodeEntry<T> | undefined;
  // select: OmitFirstArg<typeof TreeTransforms.select>;
  setNodes: <T extends TreeNode>(
    props: Partial<T>,
    options?: {
      at?: TreeLocation;
      compare?: PropsCompare;
      match?: NodeMatch<T>;
      merge?: PropsMerge;
    }
  ) => void;
  onChange: (options?: { operation?: TreeOperation }) => void;
  onError: (context: TreeEditorError) => any;
};

export type TreeValue<T extends TreeNodeData = TreeNodeData> =
  TreeDescendant<T>[];

export const TreeEditors = {
  findNode,
  pathsByLevel,
  sibling,
  traverseNodes,
  above: <T extends TreeAncestor>(
    editor: TreeEditor,
    options?: EditorAboveOptions<T>
  ): TreeNodeEntry<T> | undefined => editor.above(options),

  first: (editor: TreeEditor, at: TreeLocation): TreeNodeEntry | undefined =>
    editor.first(at),

  // deleteFragment(editor, options) {
  //   editor.deleteFragment(options)
  // },

  hasPath: (editor: TreeEditor, path: TreePath): boolean =>
    editor.hasPath(path),

  // fragment(editor, at) {
  //   return editor.fragment(at)
  // },

  insertNode: <T extends TreeNode>(
    editor: TreeEditor,
    node: TreeNode,
    options?: NodeInsertNodesOptions<T>
  ): void => {
    editor.insertNode(node, options);
  },

  // insertFragment(editor, fragment, options) {
  //   editor.insertFragment(fragment, options)
  // },

  isEditor: (value: any): value is TreeEditor => isEditor(value),

  isFirstNode: (editor: TreeEditor, node: TreeNode): boolean =>
    editor.children[0] === node,

  // isNormalizing(editor) {
  //   return editor.isNormalizing()
  // },

  last: (editor: TreeEditor, at: TreeLocation): TreeNodeEntry | undefined =>
    editor.last(at),

  levels: <T extends TreeNode>(
    editor: TreeEditor,
    options?: EditorLevelsOptions<T>
  ): Generator<TreeNodeEntry<T>, void, undefined> => editor.levels(options),

  next<T extends TreeDescendant>(
    editor: TreeEditor,
    options?: EditorNextOptions<T>
  ): TreeNodeEntry<T> | undefined {
    return editor.next(options);
  },

  node: (
    editor: TreeEditor,
    at: TreeLocation,
    options?: EditorNodeOptions
  ): TreeNodeEntry | undefined => editor.node(at, options),

  nodes: <T extends TreeNode>(
    editor: TreeEditor,
    options?: EditorNodesOptions<T>
  ): Generator<TreeNodeEntry<T>, void, undefined> => editor.nodes(options),

  // normalize(editor, options) {
  //   editor.normalize(options)
  // },

  parent: (
    editor: TreeEditor,
    at: TreeLocation,
    options?: EditorParentOptions
  ): TreeNodeEntry<TreeAncestor> | undefined => editor.parent(at, options),

  path: (
    editor: TreeEditor,
    at: TreeLocation,
    options?: EditorPathOptions
  ): TreePath | undefined => editor.path(at, options),

  pathRef: (editor: TreeEditor, path: TreePath): TreePathRef =>
    editor.pathRef(path),

  pathRefs: (editor: TreeEditor): Set<TreePathRef> => editor.pathRefs(),

  previous: <T extends TreeNode>(
    editor: TreeEditor,
    options?: EditorPreviousOptions<T>
  ): TreeNodeEntry<T> | undefined => editor.previous(options),

  // setNormalizing(editor, isNormalizing) {
  //   editor.setNormalizing(isNormalizing)
  // },

  // start(editor, at) {
  //   return editor.start(at)
  // },

  string: (editor: TreeEditor, at: TreeLocation): string => editor.string(at),

  // withoutNormalizing(editor, fn: () => void) {
  //   editor.withoutNormalizing(fn)
  // },
};

/** A helper type for narrowing matched nodes with a predicate. */

export type NodeMatch<T extends TreeNode> =
  | ((node: TreeNode, path: TreePath) => boolean)
  | ((node: TreeNode, path: TreePath) => node is T);

export type PropsCompare = (
  prop: Partial<TreeNode>,
  node: Partial<TreeNode>
) => boolean;

export type PropsMerge = (
  prop: Partial<TreeNode>,
  node: Partial<TreeNode>
) => object;
