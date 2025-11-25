import type { TreeEditor, TreeEditors } from '../interfaces/tree-editor';

const IS_EDITOR_CACHE = new WeakMap<object, boolean>();

export const isEditor: (typeof TreeEditors)['isEditor'] = (
  value: any
): value is TreeEditor => {
  if (!value) return false;

  const cachedIsEditor = IS_EDITOR_CACHE.get(value);

  if (cachedIsEditor !== undefined) {
    return cachedIsEditor;
  }

  const isEditor = typeof value.apply === 'function';

  IS_EDITOR_CACHE.set(value, isEditor);

  return isEditor;
};
