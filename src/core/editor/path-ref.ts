import { TreeEditors } from '../interfaces/tree-editor';
import type { TreePathRef } from '../interfaces/tree-path-ref';

export const pathRef: (typeof TreeEditors)['pathRef'] = (editor, path) => {
  const ref: TreePathRef = {
    current: path,
    unref() {
      const { current } = ref;
      const pathRefs = TreeEditors.pathRefs(editor);
      pathRefs.delete(ref);
      ref.current = null;

      return current;
    },
  };

  const refs = TreeEditors.pathRefs(editor);
  refs.add(ref);

  return ref;
};
