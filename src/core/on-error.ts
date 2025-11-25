import type { TreeEditor } from './interfaces/tree-editor';
import type { TreeEditorError } from './interfaces/tree-errors';

export const onError = (_editor: TreeEditor, context: TreeEditorError): any => {
  const { key, message } = context;

  if (['node'].includes(key)) {
    return;
  }

  throw new Error(message);
  // if (editor.strict) throw new Error(message);
  //
  // editor.errors.push(context);
  //
  // return recovery;
};
