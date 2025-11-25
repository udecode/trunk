import { createContext, useContext } from 'react';

import type { TreeNodeData, TreeValue } from '../../core/interfaces';
import type { TreeReactEditor } from '../tree-react-editor';

export const TreeEditorContext = createContext<TreeReactEditor | null>(null);

/** Get the current editor object from the React context. */
export const useTreeEditorRef = <T extends TreeNodeData = TreeNodeData>() => {
  const editor = useContext(TreeEditorContext);

  if (!editor) {
    throw new Error(
      `The \`useEditor\` hook must be used inside the <Tree> component's context.`
    );
  }

  return editor as TreeReactEditor<TreeValue<T>>;
};
