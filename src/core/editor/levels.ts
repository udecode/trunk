import {
  type EditorLevelsOptions,
  type TreeEditor,
  TreeEditors,
} from '../interfaces/tree-editor';
import {
  type TreeNode,
  type TreeNodeEntry,
  TreeNodes,
} from '../interfaces/tree-node';

export function* levels<T extends TreeNode>(
  editor: TreeEditor,
  options: EditorLevelsOptions<T> = {}
): Generator<TreeNodeEntry<T>, void, undefined> {
  const { at, reverse = false } = options;
  let { match } = options;

  if (match == null) {
    match = () => true;
  }
  if (!at) {
    return;
  }

  const levels: TreeNodeEntry<T>[] = [];
  const path = TreeEditors.path(editor, at);

  if (!path) {
    return editor.onError({
      key: 'levels',
      data: { at },
      message: 'Cannot find the path',
    });
  }

  for (const [n, p] of TreeNodes.levels(editor, path)) {
    if (!match(n, p)) {
      continue;
    }

    levels.push([n as T, p]);
  }

  if (reverse) {
    levels.reverse();
  }

  yield* levels;
}
