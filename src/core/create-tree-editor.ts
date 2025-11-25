import { nanoid } from 'nanoid';

import type { TreeNodeData } from './interfaces/tree-element';
import type { TreeValue } from './interfaces/tree-editor';
import { apply } from './apply';
import {
  above,
  first,
  hasPath,
  insertNode,
  last,
  levels,
  next,
  node,
  nodes,
  parent,
  path,
  pathRef,
  previous,
  string,
} from './editor';
import { getDirtyPaths } from './get-dirty-paths';
import type { TreeEditor } from './interfaces/tree-editor';
import { onError } from './on-error';
import { pathRefs } from './path-refs';
import {
  insertNodes,
  liftNodes,
  moveNodes,
  removeNodes,
  setNodes,
  unsetNodes,
  unwrapNodes,
  wrapNodes,
} from './transforms';

/** Create a new `TreeEditor` object. */
export const createTreeEditor = <V extends TreeValue = TreeValue>({
  id,
  children,
  data,
}: {
  id?: string;
  children?: V;
  data?: TreeNodeData;
} = {}): TreeEditor<V> => {
  const editor: TreeEditor<V> = {
    id: id ?? nanoid(),
    children: children ?? ([] as any),
    data: data ?? {},
    operations: [],

    type: 'editor',
    // Editor interface
    above: (...args) => above(editor, ...args),
    // Core
    apply: (...args) => apply(editor, ...args),

    first: (...args) => first(editor, ...args),

    getDirtyPaths: (...args) => getDirtyPaths(editor, ...args),
    hasPath: (...args) => hasPath(editor, ...args),

    // Editor
    insertNode: (...args) => insertNode(editor, ...args),
    insertNodes: (...args) => insertNodes(editor, ...args),
    last: (...args) => last(editor, ...args),
    levels: (...args) => levels(editor, ...args),
    liftNodes: (...args) => liftNodes(editor, ...args),
    moveNodes: (...args) => moveNodes(editor, ...args),
    next: (...args) => next(editor, ...args),
    node: (...args) => node(editor, ...args),
    nodes: (...args) => nodes(editor, ...args),
    parent: (...args) => parent(editor, ...args),
    path: (...args) => path(editor, ...args),
    pathRef: (...args) => pathRef(editor, ...args),
    pathRefs: (...args) => pathRefs(editor, ...args),
    previous: (...args) => previous(editor, ...args),
    removeNodes: (...args) => removeNodes(editor, ...args),
    setNodes: (...args) => setNodes(editor, ...args),
    string: (...args) => string(editor, ...args),
    unsetNodes: (...args) => unsetNodes(editor, ...args),
    unwrapNodes: (...args) => unwrapNodes(editor, ...args),
    wrapNodes: (...args) => wrapNodes(editor, ...args),
    onChange: () => {},
    onError: (...args) => onError(editor, ...args),
  };

  return editor;
};
