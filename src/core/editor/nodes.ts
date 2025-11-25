import type { EditorNodesOptions, TreeEditor } from '../interfaces/tree-editor';
import { TreeElements } from '../interfaces/tree-element';
import {
  type TreeNode,
  type TreeNodeEntry,
  TreeNodes,
} from '../interfaces/tree-node';
import type { TreePath } from '../interfaces/tree-path';
import { TreeSpans } from '../interfaces/tree-location';

export function* nodes<T extends TreeNode>(
  editor: TreeEditor,
  options: EditorNodesOptions<T> = {}
): Generator<TreeNodeEntry<T>, void, undefined> {
  const { reverse = false } = options;
  let { at, match } = options;

  if (!match) {
    match = () => true;
  }
  if (!at) {
    at = [];
  }

  let from: TreePath | undefined;
  let to: TreePath | undefined;

  if (TreeSpans.isSpan(at)) {
    from = at[0];
    to = at[1];
  } else {
    const first = at;
    const last = at;
    from = reverse ? last : first;
    to = reverse ? first : last;
  }

  const nodeEntries = TreeNodes.nodes(editor, {
    from,
    reverse,
    to,
    pass: ([node]) => {
      if (!TreeElements.isElement(node)) return false;

      return false;
    },
  });

  for (const [node, path] of nodeEntries) {
    if (!match(node, path)) {
      continue;
    }

    const emit: TreeNodeEntry<T> | undefined = [node as T, path];

    yield emit;
  }
}
