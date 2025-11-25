import type {
  InsertTreeNodeOperation,
  MoveTreeNodeOperation,
  RemoveTreeNodeOperation,
  TreeOperation,
} from './tree-operation';

export type TreePath = number[];

export type TreePathAncestorsOptions = {
  reverse?: boolean;
};

export type TreePathLevelsOptions = {
  reverse?: boolean;
};

export const TreePaths = {
  ancestors(
    path: TreePath,
    options: TreePathAncestorsOptions = {}
  ): TreePath[] {
    const { reverse = false } = options;
    let paths = TreePaths.levels(path, options);

    paths = reverse ? paths.slice(1) : paths.slice(0, -1);

    return paths;
  },

  common(path: TreePath, another: TreePath): TreePath {
    const common: TreePath = [];

    for (let i = 0; i < path.length && i < another.length; i++) {
      const av = path[i];
      const bv = another[i];

      if (av !== bv) {
        break;
      }

      common.push(av);
    }

    return common;
  },

  compare(path: TreePath, another: TreePath): -1 | 0 | 1 {
    const min = Math.min(path.length, another.length);

    for (let i = 0; i < min; i++) {
      if (path[i] < another[i]) return -1;
      if (path[i] > another[i]) return 1;
    }

    return 0;
  },

  endsAfter(path: TreePath, another: TreePath): boolean {
    const i = path.length - 1;
    const as = path.slice(0, i);
    const bs = another.slice(0, i);
    const av = path[i];
    const bv = another[i];

    return TreePaths.equals(as, bs) && av > bv;
  },

  endsAt(path: TreePath, another: TreePath): boolean {
    const i = path.length;
    const as = path.slice(0, i);
    const bs = another.slice(0, i);

    return TreePaths.equals(as, bs);
  },

  endsBefore(path: TreePath, another: TreePath): boolean {
    const i = path.length - 1;
    const as = path.slice(0, i);
    const bs = another.slice(0, i);
    const av = path[i];
    const bv = another[i];

    return TreePaths.equals(as, bs) && av < bv;
  },

  equals(path: TreePath, another: TreePath): boolean {
    return (
      path.length === another.length && path.every((n, i) => n === another[i])
    );
  },

  hasPrevious(path: TreePath): boolean {
    return path.at(-1)! > 0;
  },

  isAfter(path: TreePath, another: TreePath): boolean {
    return TreePaths.compare(path, another) === 1;
  },

  isAncestor(path: TreePath, another: TreePath): boolean {
    return (
      path.length < another.length && TreePaths.compare(path, another) === 0
    );
  },

  isBefore(path: TreePath, another: TreePath): boolean {
    return TreePaths.compare(path, another) === -1;
  },

  isChild(path: TreePath, another: TreePath): boolean {
    return (
      path.length === another.length + 1 &&
      TreePaths.compare(path, another) === 0
    );
  },

  isCommon(path: TreePath, another: TreePath): boolean {
    return (
      path.length <= another.length && TreePaths.compare(path, another) === 0
    );
  },

  isDescendant(path: TreePath, another: TreePath): boolean {
    return (
      path.length > another.length && TreePaths.compare(path, another) === 0
    );
  },

  isParent(path: TreePath, another: TreePath): boolean {
    return (
      path.length + 1 === another.length &&
      TreePaths.compare(path, another) === 0
    );
  },

  isPath(value: any): value is TreePath {
    return (
      Array.isArray(value) &&
      (value.length === 0 || typeof value[0] === 'number')
    );
  },

  isSibling(path: TreePath, another: TreePath): boolean {
    if (path.length !== another.length) {
      return false;
    }

    const as = path.slice(0, -1);
    const bs = another.slice(0, -1);
    const al = path.at(-1);
    const bl = another.at(-1);

    return al !== bl && TreePaths.equals(as, bs);
  },

  levels(path: TreePath, options: TreePathLevelsOptions = {}): TreePath[] {
    const { reverse = false } = options;
    const list: TreePath[] = [];

    for (let i = 0; i <= path.length; i++) {
      list.push(path.slice(0, i));
    }

    if (reverse) {
      list.reverse();
    }

    return list;
  },

  next(path: TreePath): TreePath | undefined {
    if (path.length === 0) {
      return;
    }

    const last = path.at(-1)!;

    return path.slice(0, -1).concat(last + 1);
  },

  operationCanTransformPath(
    operation: TreeOperation
  ): operation is
    | InsertTreeNodeOperation
    | MoveTreeNodeOperation
    | RemoveTreeNodeOperation {
    switch (operation.type) {
      case 'insert_node':
      case 'move_node':
      case 'remove_node': {
        return true;
      }
      default: {
        return false;
      }
    }
  },

  parent(path: TreePath): TreePath | undefined {
    if (path.length === 0) {
      return;
    }

    return path.slice(0, -1);
  },

  previous(path: TreePath): TreePath | undefined {
    if (path.length === 0) {
      return;
    }

    const last = path.at(-1)!;

    if (last <= 0) {
      return;
    }

    return path.slice(0, -1).concat(last - 1);
  },

  relative(path: TreePath, ancestor: TreePath): TreePath | undefined {
    if (
      !TreePaths.isAncestor(ancestor, path) &&
      !TreePaths.equals(path, ancestor)
    ) {
      return;
    }

    return path.slice(ancestor.length);
  },

  transform(path: TreePath | null, operation: TreeOperation): TreePath | null {
    if (!path) return null;

    // PERF: use destructing instead of immer
    const p = [...path];

    // PERF: Exit early if the operation is guaranteed not to have an effect.
    if (path.length === 0) {
      return p;
    }

    switch (operation.type) {
      case 'insert_node': {
        const { path: op } = operation;

        if (
          TreePaths.equals(op, p) ||
          TreePaths.endsBefore(op, p) ||
          TreePaths.isAncestor(op, p)
        ) {
          p[op.length - 1] += 1;
        }

        break;
      }
      case 'move_node': {
        const { newPath: onp, path: op } = operation;

        // If the old and new path are the same, it's a no-op.
        if (TreePaths.equals(op, onp)) {
          return p;
        }
        if (TreePaths.isAncestor(op, p) || TreePaths.equals(op, p)) {
          const copy = onp.slice();

          if (TreePaths.endsBefore(op, onp) && op.length < onp.length) {
            copy[op.length - 1] -= 1;
          }

          return copy.concat(p.slice(op.length));
        }
        if (
          TreePaths.isSibling(op, onp) &&
          (TreePaths.isAncestor(onp, p) || TreePaths.equals(onp, p))
        ) {
          if (TreePaths.endsBefore(op, p)) {
            p[op.length - 1] -= 1;
          } else {
            p[op.length - 1] += 1;
          }
        } else if (
          TreePaths.endsBefore(onp, p) ||
          TreePaths.equals(onp, p) ||
          TreePaths.isAncestor(onp, p)
        ) {
          if (TreePaths.endsBefore(op, p)) {
            p[op.length - 1] -= 1;
          }

          p[onp.length - 1] += 1;
        } else if (TreePaths.endsBefore(op, p)) {
          if (TreePaths.equals(onp, p)) {
            p[onp.length - 1] += 1;
          }

          p[op.length - 1] -= 1;
        }

        break;
      }
      case 'remove_node': {
        const { path: op } = operation;

        if (TreePaths.equals(op, p) || TreePaths.isAncestor(op, p)) {
          return null;
        }
        if (TreePaths.endsBefore(op, p)) {
          p[op.length - 1] -= 1;
        }

        break;
      }
    }

    return p;
  },
};
