import { createContext, useContext } from 'react';

import type { TreeNodeData, TreeValue } from '../../core/interfaces';
import type { TreeReactEditor } from '../tree-react-editor';

/**
 * A React context for sharing the editor object, in a way that re-renders the
 * context whenever changes occur.
 */
export type TreeEditorContextValue = {
  editor: TreeReactEditor;
  v: number;
};

export const TrunkContext = createContext<{
  editor: TreeReactEditor;
  v: number;
} | null>(null);

/** Get the current editor object from the React context. */
export const useTreeEditorState = <T extends TreeNodeData = TreeNodeData>() => {
  const context = useContext(TrunkContext);

  if (!context) {
    throw new Error(
      `The \`useTree\` hook must be used inside the <Tree> component's context.`
    );
  }

  const { editor } = context;

  return editor as TreeReactEditor<TreeValue<T>>;
};

export const useTrunkValue = () => {
  const context = useContext(TrunkContext);

  if (!context) {
    throw new Error(
      `The \`useTree\` hook must be used inside the <Tree> component's context.`
    );
  }

  return context;
};
