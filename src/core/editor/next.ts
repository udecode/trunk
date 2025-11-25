import { TreeEditors, type TreeSpan } from '../interfaces/tree-editor';
import { TreePaths } from '../interfaces/tree-path';

export const next: (typeof TreeEditors)['next'] = (editor, options = {}) => {
  const { at } = options;
  let { match } = options;

  if (!at) {
    return;
  }

  const toEntry = TreeEditors.last(editor, []);

  if (!toEntry) {
    return editor.onError({
      key: 'next.last',
      data: { at },
      message: 'Cannot get the last node',
    });
  }

  const [, to] = toEntry;

  const span: TreeSpan = [at, to];

  if (TreePaths.isPath(at) && at.length === 0) {
    return editor.onError({
      key: 'next.root',
      data: { at },
      message: 'Cannot get the next node',
    });
  }
  if (match == null) {
    if (TreePaths.isPath(at)) {
      const parentEntry = TreeEditors.parent(editor, at);

      if (!parentEntry) {
        return editor.onError({
          key: 'next.parent',
          data: { at },
          message: 'Cannot get the parent node',
        });
      }

      const [parent] = parentEntry;
      match = (n) => parent.children.includes(n);
    } else {
      match = () => true;
    }
  }

  const [next] = TreeEditors.nodes(editor, { at: span, match });

  return next;
};
