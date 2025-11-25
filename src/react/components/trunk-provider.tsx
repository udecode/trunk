'use client';

import React, { useCallback, useEffect } from 'react';
import { TreeEditors, TreeNodes, type TreeValue } from '../../core/interfaces';
import { TreeEditorContext } from '../hooks/use-tree-editor-ref';
import {
  type TreeEditorContextValue,
  TrunkContext,
} from '../hooks/use-tree-editor-state';
import type { TreeReactEditor } from '../tree-react-editor';
import { EDITOR_TO_ON_CHANGE } from '../utils/weak-maps';

export function TrunkProvider(props: {
  children: React.ReactNode;
  editor: TreeReactEditor;
  initialValue?: TreeValue;
  onChange?: (value: TreeValue) => void;
}) {
  const {
    children,
    editor,
    initialValue = editor.children,
    onChange,
    ...rest
  } = props;

  const [context, setContext] = React.useState<TreeEditorContextValue>(() => {
    if (!TreeNodes.isNodeList(initialValue)) {
      throw new Error(
        `[Trunk] initialValue is invalid! Expected a list of elements but got: ${JSON.stringify(
          initialValue
        )}`
      );
    }
    if (!TreeEditors.isEditor(editor)) {
      throw new Error(
        `[Trunk] editor is invalid! You passed: ${JSON.stringify(editor)}`
      );
    }

    editor.children = initialValue;
    Object.assign(editor, rest);

    return { editor, v: 0 };
  });

  const onContextChange = useCallback(() => {
    if (onChange) {
      onChange(editor.children);
    }

    setContext((prevContext) => ({
      editor,
      v: prevContext.v + 1,
    }));
  }, [editor, onChange]);

  useEffect(() => {
    EDITOR_TO_ON_CHANGE.set(editor, onContextChange);

    return () => {
      EDITOR_TO_ON_CHANGE.set(editor, () => {});
    };
  }, [editor, onContextChange]);

  return (
    <TrunkContext.Provider value={context}>
      <TreeEditorContext.Provider value={context.editor}>
        {children}
      </TreeEditorContext.Provider>
    </TrunkContext.Provider>
  );
}
