import React from 'react';
import type { JSX } from 'react';
import {
  type TreeAncestor,
  type TreeDescendant,
  TreeElements,
} from '../../core/interfaces';
import { Element } from '../components/element';
import type { RenderTrunkElementProps } from '../components/trunk';
import { useTreeEditorRef } from './use-tree-editor-ref';
import { TreeReactEditors } from '../tree-react-editor';
import { NODE_TO_INDEX, NODE_TO_PARENT } from '../utils/weak-maps';

/** Children. */

const useTreeChildren = (props: {
  node: TreeAncestor;
  renderElement?: ((props: RenderTrunkElementProps) => JSX.Element) | undefined;
}) => {
  const { node, renderElement } = props;
  const editor = useTreeEditorRef();
  const children: JSX.Element[] = [];

  const path = TreeReactEditors.findPath(editor, node);

  if (!path) return children;

  for (let i = 0; i < node.children.length; i++) {
    const n = node.children[i] as TreeDescendant;
    const key = TreeReactEditors.findKey(editor, n);

    if (TreeElements.isElement(n)) {
      children.push(
        <Element
          element={n}
          key={key.id}
          path={path.concat([i])}
          renderElement={renderElement}
        />
      );
    }

    NODE_TO_INDEX.set(n, i);
    NODE_TO_PARENT.set(n, node);
  }

  return children;
};

export default useTreeChildren;
