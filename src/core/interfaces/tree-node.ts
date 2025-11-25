import type { TreeNodeData } from './tree-element';
import {
  type TreeElement,
  type TreeElementEntry,
  TreeElements,
} from './tree-element';
import type { TreePath } from './tree-path';
import { TreePaths } from './tree-path';
import type { TreeEditor, TreeValue } from './tree-editor';
import { TreeEditors } from './tree-editor';
import {
  getLastChild,
  getLastChildPath,
  isLastChild,
} from '../editor-extension/getLastChild';

/**
 * The `TreeNode` union type represents all of the different types of nodes that
 * occur in a Slate document tree.
 */

export type TreeNode<T extends TreeNodeData = TreeNodeData> =
  | TreeEditor<TreeValue<T>>
  | TreeElement<T>;

export type TreeNodeAncestorsOptions = {
  reverse?: boolean;
};

export type TreeNodeChildrenOptions = {
  reverse?: boolean;
};

export type TreeNodeDescendantsOptions = {
  from?: TreePath;
  reverse?: boolean;
  to?: TreePath;
  pass?: (node: TreeNodeEntry) => boolean;
};

export type TreeNodeElementsOptions = {
  from?: TreePath;
  reverse?: boolean;
  to?: TreePath;
  pass?: (node: TreeNodeEntry) => boolean;
};

export type TreeNodeLevelsOptions = {
  reverse?: boolean;
};

export type TreeNodeNodesOptions = {
  from?: TreePath;
  reverse?: boolean;
  to?: TreePath;
  pass?: (entry: TreeNodeEntry) => boolean;
};

const IS_NODE_LIST_CACHE = new WeakMap<any[], boolean>();

export const TreeNodes = {
  isLastChild,
  lastChild: getLastChild,

  lastChildPath: getLastChildPath,
  /** Get the node at a specific path, asserting that it's an ancestor node. */
  ancestor(root: TreeNode, path: TreePath): TreeAncestor | undefined {
    return TreeNodes.get(root, path);
  },

  // ---

  /**
   * Return a generator of all the ancestor nodes above a specific path.
   *
   * By default the order is top-down, from highest to lowest ancestor in the
   * tree, but you can pass the `reverse: true` option to go bottom-up.
   */
  *ancestors(
    root: TreeNode,
    path: TreePath,
    options: TreeNodeAncestorsOptions = {}
  ): Generator<TreeNodeEntry<TreeAncestor>, void, undefined> {
    for (const p of TreePaths.ancestors(path, options)) {
      const n = TreeNodes.ancestor(root, p);

      if (!n) continue;

      const entry: TreeNodeEntry<TreeAncestor> = [n, p];
      yield entry;
    }
  },

  /** Get the child of a node at a specific index. */
  child(root: TreeNode, index: number): TreeDescendant | undefined {
    // if (Text.isText(root)) {
    //   return;
    // }

    const c = root.children[index];

    if (c == null) {
      return;
    }

    return c;
  },

  *children(
    root: TreeNode,
    path: TreePath,
    options: TreeNodeChildrenOptions = {}
  ): Generator<TreeNodeEntry<TreeDescendant>, void, undefined> | undefined {
    const { reverse = false } = options;
    const ancestor = TreeNodes.ancestor(root, path);

    if (!ancestor) return;

    const { children } = ancestor;
    let index = reverse ? children.length - 1 : 0;

    while (reverse ? index >= 0 : index < children.length) {
      const child = TreeNodes.child(ancestor, index);

      if (!child) continue;

      const childPath = path.concat(index);
      yield [child, childPath];
      index = reverse ? index - 1 : index + 1;
    }
  },

  common(
    root: TreeNode,
    path: TreePath,
    another: TreePath
  ): TreeNodeEntry | undefined {
    const p = TreePaths.common(path, another);
    const n = TreeNodes.get(root, p);

    if (!n) return;

    return [n, p];
  },

  descendant(root: TreeNode, path: TreePath): TreeDescendant | undefined {
    const node = TreeNodes.get(root, path);

    if (TreeEditors.isEditor(node)) {
      return;
    }

    return node;
  },

  *descendants(
    root: TreeNode,
    options: TreeNodeDescendantsOptions = {}
  ): Generator<TreeNodeEntry<TreeDescendant>, void, undefined> {
    for (const [node, path] of TreeNodes.nodes(root, options)) {
      if (path.length > 0) {
        // NOTE: we have to coerce here because checking the path's length does
        // guarantee that `node` is not a `Editor`, but TypeScript doesn't know.
        yield [node, path] as TreeNodeEntry<TreeDescendant>;
      }
    }
  },

  *elements(
    root: TreeNode,
    options: TreeNodeElementsOptions = {}
  ): Generator<TreeElementEntry, void, undefined> {
    for (const [node, path] of TreeNodes.nodes(root, options)) {
      if (TreeElements.isElement(node)) {
        yield [node, path];
      }
    }
  },

  extractProps(node: TreeNode): TreeNodeProps {
    if (TreeElements.isAncestor(node)) {
      const { children, ...properties } = node;

      return properties;
    }
    const { text, ...properties } = node as any;

    return properties;
  },

  first(root: TreeNode, path: TreePath): TreeNodeEntry | undefined {
    const p = path.slice();
    let n = TreeNodes.get(root, p);

    if (!n) return;

    while (n) {
      // if (Text.isText(n) || n.children.length === 0) {
      if (n.children.length === 0) {
        break;
      }
      n = n.children[0];
      p.push(0);
    }

    return [n, p];
  },

  get(root: TreeNode, path: TreePath): TreeNode | undefined {
    let node = root;

    for (const p of path) {
      if (!node.children[p]) {
        return;
      }

      node = node.children[p];
    }

    return node;
  },

  has(root: TreeNode, path: TreePath): boolean {
    let node = root;

    for (const p of path) {
      if (!node.children[p]) {
        return false;
      }

      node = node.children[p];
    }

    return true;
  },

  isLeaf: (root: TreeNode) => root.children.length === 0,

  isNode(value: any): value is TreeNode {
    return TreeElements.isElement(value) || TreeEditors.isEditor(value);
  },

  isNodeList(value: any): value is TreeNode[] {
    if (!Array.isArray(value)) {
      return false;
    }

    const cachedResult = IS_NODE_LIST_CACHE.get(value);

    if (cachedResult !== undefined) {
      return cachedResult;
    }

    const isNodeList = value.every((val) => TreeNodes.isNode(val));
    IS_NODE_LIST_CACHE.set(value, isNodeList);

    return isNodeList;
  },

  last(root: TreeNode, path: TreePath): TreeNodeEntry | undefined {
    const p = path.slice();
    let n = TreeNodes.get(root, p);

    if (!n) return;

    while (n) {
      if (n.children.length === 0) {
        break;
      }
      const i: number = n.children.length - 1;
      n = n.children[i];
      p.push(i);
    }

    return [n, p];
  },

  *levels(
    root: TreeNode,
    path: TreePath,
    options: TreeNodeLevelsOptions = {}
  ): Generator<TreeNodeEntry, void, undefined> {
    for (const p of TreePaths.levels(path, options)) {
      const n = TreeNodes.get(root, p);

      if (!n) break;

      yield [n, p];
    }
  },

  matches(node: TreeNode, props: Partial<TreeNode>): boolean {
    return (
      TreeElements.isElement(node) &&
      TreeElements.isElementProps(props) &&
      TreeElements.matches(node, props)
    );
  },

  *nodes(
    root: TreeNode,
    options: TreeNodeNodesOptions = {}
  ): Generator<TreeNodeEntry, void, undefined> {
    const { pass, reverse = false } = options;
    const { from = [], to } = options;
    const visited = new Set();
    let p: TreePath = [];
    let n = root;

    while (true) {
      if (
        to &&
        (reverse ? TreePaths.isBefore(p, to) : TreePaths.isAfter(p, to))
      ) {
        break;
      }
      if (!visited.has(n)) {
        yield [n, p];
      }
      // If we're allowed to go downward and we haven't descended yet, do.
      if (
        !visited.has(n) &&
        n.children.length > 0 &&
        (pass == null || pass([n, p]) === false)
      ) {
        visited.add(n);
        let nextIndex = reverse ? n.children.length - 1 : 0;

        if (TreePaths.isAncestor(p, from)) {
          nextIndex = from[p.length];
        }

        p = p.concat(nextIndex);
        const node = TreeNodes.get(root, p);

        if (!node) continue;

        n = node;

        continue;
      }
      // If we're at the root and we can't go down, we're done.
      if (p.length === 0) {
        break;
      }
      // If we're going forward...
      if (!reverse) {
        const newPath = TreePaths.next(p);

        if (newPath && TreeNodes.has(root, newPath)) {
          p = newPath;
          const node = TreeNodes.get(root, p);

          if (!node) continue;

          n = node;

          continue;
        }
      }
      // If we're going backward...
      if (reverse && p.at(-1) !== 0) {
        const newPath = TreePaths.previous(p);

        if (!newPath) continue;

        p = newPath;

        const node = TreeNodes.get(root, p);

        if (!node) continue;

        n = node;

        continue;
      }

      // Otherwise we're going upward...
      const parent = TreePaths.parent(p);

      if (!parent) break;

      p = parent;

      const node = TreeNodes.get(root, p);

      if (!node) break;

      n = node;
      visited.add(n);
    }
  },

  parent(root: TreeNode, path: TreePath): TreeAncestor | undefined {
    const parentPath = TreePaths.parent(path);

    if (!parentPath) return;

    return TreeNodes.get(root, parentPath);
  },
};

/**
 * The `Descendant` union type represents nodes that are descendants in the
 * tree. It is returned as a convenience in certain cases to narrow a value
 * further than the more generic `TreeNode` union.
 */

export type TreeAncestor<T extends TreeNodeData = TreeNodeData> =
  | TreeEditor<TreeValue<T>>
  | TreeElement<T>;

/**
 * The `Ancestor` union type represents nodes that are ancestors in the tree. It
 * is returned as a convenience in certain cases to narrow a value further than
 * the more generic `TreeNode` union.
 */

export type TreeDescendant<T extends TreeNodeData = TreeNodeData> =
  TreeElement<T>;

/**
 * `TreeNodeEntry` objects are returned when iterating over the nodes in a Slate
 * document tree. They consist of the node and its `TreePath` relative to the
 * root node in the document.
 */

export type TreeNodeEntry<T extends TreeNode = TreeNode> = [T, TreePath];

/** Convenience type for returning the props of a node. */
export type TreeNodeProps =
  | Omit<TreeEditor, 'children'>
  | Omit<TreeElement, 'children'>;
