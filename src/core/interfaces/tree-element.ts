import { isPlainObject } from 'is-plain-object';

import type { TreeAncestor, TreeDescendant } from './tree-node';
import { TreeNodes } from './tree-node';
import type { TreePath } from './tree-path';
import { TreeEditors } from './tree-editor';

export type ElementInterface = {
  /** Check if a value implements the 'TreeAncestor' interface. */
  isAncestor: (value: any) => value is TreeAncestor;

  /** Check if a value implements the `TreeElement` interface. */
  isElement: (value: any) => value is TreeElement;

  /** Check if a value is an array of `TreeElement` objects. */
  isElementList: (value: any) => value is TreeElement[];

  /** Check if a set of props is a partial of TreeElement. */
  isElementProps: (props: any) => props is Partial<TreeElement>;

  /**
   * Check if a value implements the `TreeElement` interface and has elementKey
   * with selected value. Default it check to `type` key value
   */
  isElementType: <T extends TreeElement>(
    value: any,
    elementVal: string,
    elementKey?: string
  ) => value is T;

  /**
   * Check if an element matches set of properties.
   *
   * Note: this checks custom properties, and it does not ensure that any
   * children are equivalent.
   */
  matches: (element: TreeElement, props: Partial<TreeElement>) => boolean;
};

/**
 * `TreeElement` objects are a type of node in a Slate document that contain
 * other element nodes or text nodes. They can be either "blocks" or "inlines"
 * depending on the Slate editor's configuration.
 */
export type TreeElement<T extends TreeNodeData = TreeNodeData> = {
  id: string;
  children: TreeDescendant<T>[];
  data: T;
  type: string;
};

export type TreeNodeData = object;

/** Shared the function with isElementType utility */
const isElement = (value: any): value is TreeElement =>
  isPlainObject(value) &&
  TreeNodes.isNodeList(value.children) &&
  !TreeEditors.isEditor(value);

export const TreeElements: ElementInterface = {
  isElement,

  isAncestor(value: any): value is TreeAncestor {
    return isPlainObject(value) && TreeNodes.isNodeList(value.children);
  },

  isElementList(value: any): value is TreeElement[] {
    return (
      Array.isArray(value) && value.every((val) => TreeElements.isElement(val))
    );
  },

  isElementProps(props: any): props is Partial<TreeElement> {
    return (props as Partial<TreeElement>).children !== undefined;
  },

  isElementType: <T extends TreeElement>(
    value: any,
    elementVal: string,
    elementKey = 'type'
  ): value is T => isElement(value) && value[elementKey] === elementVal,

  matches(element: TreeElement, props: Partial<TreeElement>): boolean {
    for (const key in props) {
      if (key === 'children') {
        continue;
      }
      if (element[key] !== props[key]) {
        return false;
      }
    }

    return true;
  },
};

/**
 * `ElementEntry` objects refer to an `TreeElement` and the `Path` where it can
 * be found inside a root node.
 */
export type TreeElementEntry = [TreeElement, TreePath];
