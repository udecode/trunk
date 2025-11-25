'use client';

import React, { type JSX, useCallback } from 'react';

import type { TreeElement, TreePath } from '../../core/interfaces';

import { TreeElementProvider } from './skill-node-provider';
import useTreeChildren from '../hooks/use-tree-children';
import { useTreeEditorRef } from '../hooks/use-tree-editor-ref';
import { TreeReactEditors } from '../tree-react-editor';
import {
  EDITOR_TO_KEY_TO_ELEMENT,
  ELEMENT_TO_NODE,
  NODE_TO_ELEMENT,
} from '../utils/weak-maps';
import type { RenderTrunkElementProps } from './trunk';

/** Element. */
const ElementPrimitive = (props: {
  element: TreeElement;
  path: TreePath;
  renderElement?: (props: RenderTrunkElementProps) => JSX.Element;
}) => {
  const {
    element,
    path,
    renderElement = (p: RenderTrunkElementProps) => (
      <DefaultTreeElement {...p} />
    ),
  } = props;
  const editor = useTreeEditorRef();
  const key = TreeReactEditors.findKey(editor, element);
  const ref = useCallback(
    (ref: HTMLElement | null) => {
      // Update element-related weak maps with the DOM element ref.
      const KEY_TO_ELEMENT = EDITOR_TO_KEY_TO_ELEMENT.get(editor);

      if (ref) {
        KEY_TO_ELEMENT?.set(key, ref);
        NODE_TO_ELEMENT.set(element, ref);
        ELEMENT_TO_NODE.set(ref, element);
      } else {
        KEY_TO_ELEMENT?.delete(key);
        NODE_TO_ELEMENT.delete(element);
      }
    },
    [editor, key, element]
  );

  // const children: React.ReactNode =
  useTreeChildren({
    node: element,
    renderElement,
  });

  // Attributes that the developer must mix into the element in their
  // custom node renderer component.
  const attributes: {
    'data-trunk-node': 'element';
    ref: any;
  } = {
    'data-trunk-node': 'element',
    ref,
  };

  return (
    <TreeElementProvider element={element} path={path}>
      {renderElement({ attributes, children: null, editor, element, path })}
    </TreeElementProvider>
  );
};

const Element = React.memo(
  (props: any) => (
    <TreeElementProvider element={props.element} path={props.path}>
      <ElementPrimitive {...props} />
    </TreeElementProvider>
  ),
  (prev, next) =>
    prev.element === next.element && prev.renderElement === next.renderElement
);
Element.displayName = 'Element';

export { Element };

/** The default element renderer. */
export const DefaultTreeElement = (props: RenderTrunkElementProps) => {
  const { attributes, children } = props;

  return (
    <div {...attributes} style={{ position: 'relative' }}>
      {children}
    </div>
  );
};
