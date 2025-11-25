'use client';

import React, { type JSX, type ReactNode, useCallback, useRef } from 'react';
import type {
  TreeElement,
  TreeNodeData,
  TreePath,
  TreeValue,
} from '../../core/interfaces';

import useTreeChildren from '../hooks/use-tree-children';
import { useTreeEditorState } from '../hooks/use-tree-editor-state';
import { TrunkReadOnlyContext } from '../hooks/use-trunk-read-only';
import { type TreeReactEditor, TreeReactEditors } from '../tree-react-editor';

import { useIsomorphicLayoutEffect } from '../hooks/use-isomorphic-layout-effect';
import { getDefaultView } from '../utils/dom';
import {
  EDITOR_TO_ELEMENT,
  EDITOR_TO_WINDOW,
  ELEMENT_TO_NODE,
  IS_READ_ONLY,
  NODE_TO_ELEMENT,
} from '../utils/weak-maps';
import { Hotkeys } from '../../core';
import { useComposedRef } from '../hooks';

const Children = (props: Parameters<typeof useTreeChildren>[0]) => (
  <>{useTreeChildren(props)}</>
);

export type RenderTrunkElementProps<T extends TreeNodeData = TreeNodeData> = {
  attributes: {
    'data-trunk-node': 'element';
    ref: any;
  };
  children: any;
  editor: TreeReactEditor<TreeValue<T>>;
  element: TreeElement<T>;
  path: TreePath;
};

export type TrunkProps = {
  as?: React.ElementType;
  readOnly?: boolean;
  renderChildren?: ReactNode;
  renderElement?: (props: RenderTrunkElementProps) => JSX.Element;
} & React.ComponentProps<'div'>;

export function Trunk({
  as: Component = 'div',
  autoFocus,
  readOnly = false,
  renderChildren,
  renderElement,
  ...attributes
}: TrunkProps) {
  const editor = useTreeEditorState();
  const refObject = useRef<HTMLDivElement | null>(null);

  const callbackRef = useCallback(
    (node: HTMLDivElement | null) => {
      if (!node) {
        EDITOR_TO_ELEMENT.delete(editor);
        NODE_TO_ELEMENT.delete(editor);
      }

      refObject.current = node;
    },
    [editor]
  );

  // Compose refs
  const ref = useComposedRef(attributes.ref, callbackRef);

  // Update internal state
  IS_READ_ONLY.set(editor, readOnly);

  useIsomorphicLayoutEffect(() => {
    const window = refObject.current && getDefaultView(refObject.current);

    if (refObject.current && window) {
      EDITOR_TO_WINDOW.set(editor, window);
      EDITOR_TO_ELEMENT.set(editor, refObject.current);
      NODE_TO_ELEMENT.set(editor, refObject.current);
      ELEMENT_TO_NODE.set(refObject.current, editor);
    } else {
      NODE_TO_ELEMENT.delete(editor);
    }
  }, [editor]);

  return (
    <TrunkReadOnlyContext.Provider value={readOnly}>
      <Component
        {...attributes}
        data-trunk-editor
        data-trunk-node="value"
        onKeyDown={useCallback(
          (event: React.KeyboardEvent<HTMLDivElement>) => {
            if (!readOnly && TreeReactEditors.hasTarget(editor, event.target)) {
              if (
                isEventHandled(
                  event,
                  attributes.onKeyDown as
                    | ((
                        event: React.KeyboardEvent<HTMLDivElement>
                      ) => boolean | undefined)
                    | undefined
                )
              ) {
                return;
              }
              if (Hotkeys.isRedo(event)) {
                event.preventDefault();
                const maybeHistoryEditor: any = editor;

                if (typeof maybeHistoryEditor.redo === 'function') {
                  maybeHistoryEditor.redo();
                }

                return;
              }
              if (Hotkeys.isUndo(event)) {
                event.preventDefault();
                const maybeHistoryEditor: any = editor;

                if (typeof maybeHistoryEditor.undo === 'function') {
                  maybeHistoryEditor.undo();
                }

                return;
              }
            }
          },
          [readOnly, editor, attributes.onKeyDown]
        )}
        ref={ref}
        role={readOnly ? undefined : 'tree'}
        tabIndex={0}
      >
        {renderChildren ? (
          renderChildren
        ) : (
          <Children node={editor} renderElement={renderElement} />
        )}
      </Component>
    </TrunkReadOnlyContext.Provider>
  );
}

/** Check if an event is overrided by a handler. */
export const isEventHandled = <
  EventType extends React.SyntheticEvent<unknown, unknown>,
>(
  event: EventType,
  handler?: (event: EventType) => boolean | undefined
) => {
  if (!handler) {
    return false;
  }

  // The custom event handler may return a boolean to specify whether the event
  // shall be treated as being handled or not.
  const shouldTreatEventAsHandled = handler(event);

  if (shouldTreatEventAsHandled != null) {
    return shouldTreatEventAsHandled;
  }

  return event.isDefaultPrevented() || event.isPropagationStopped();
};
