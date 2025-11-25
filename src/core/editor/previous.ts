import { TreeEditors, type TreeSpan } from '../interfaces/tree-editor';
import { TreePaths } from '../interfaces/tree-path';

export const previous: (typeof TreeEditors)['previous'] = (
  editor,
  options = {}
) => {
  const { at } = options;
  let { match } = options;

  if (!at) {
    return;
  }

  const firstEntry = TreeEditors.first(editor, []);

  if (!firstEntry) {
    return editor.onError({
      key: 'previous.first',
      data: { at },
      message: 'Cannot get the first node',
    });
  }

  const [, to] = firstEntry;

  // The search location is from the start of the document to the path of
  // the point before the location passed in
  const span: TreeSpan = [at, to];

  if (TreePaths.isPath(at) && at.length === 0) {
    return editor.onError({
      key: 'previous.root',
      message: 'Cannot get the previous node from the root node!',
    });
  }
  if (match == null) {
    if (TreePaths.isPath(at)) {
      const parentEntry = TreeEditors.parent(editor, at);

      if (!parentEntry) {
        return editor.onError({
          key: 'previous.parent',
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

  const [previous] = TreeEditors.nodes(editor, {
    at: span,
    match,
    reverse: true,
  });

  return previous;
};
