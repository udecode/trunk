/** Types. */

// COMPAT: This is required to prevent TypeScript aliases from doing some very
// weird things for Tree's types with the same name as globals. (2019/11/27)
import DOMComment = globalThis.Comment;
import DOMElement = globalThis.Element;
// https://github.com/microsoft/TypeScript/issues/35002
import DOMNode = globalThis.Node;
import DOMRange = globalThis.Range;
import DOMSelection = globalThis.Selection;
import DOMStaticRange = globalThis.StaticRange;
import DOMText = globalThis.Text;

export {
  DOMComment,
  DOMElement,
  DOMNode,
  DOMRange,
  DOMSelection,
  DOMStaticRange,
  DOMText,
};

declare global {
  // biome-ignore lint/style/useConsistentTypeDefinitions: declare
  interface Window {
    DataTransfer: (typeof DataTransfer)['constructor'];
    Node: (typeof Node)['constructor'];
    Selection: (typeof Selection)['constructor'];
  }
}

/** Returns the host window of a DOM node */

export const getDefaultView = (value: any): Window | null =>
  value?.ownerDocument?.defaultView || null;

/** Check if a DOM node is an element node. */

export const isDOMElement = (value: any): value is DOMElement =>
  isDOMNode(value) && value.nodeType === 1;

/** Check if a value is a DOM node. */

export const isDOMNode = (value: any): value is DOMNode => {
  const window = getDefaultView(value);

  return !!window && value instanceof window.Node;
};

/** Check if a DOM node is an element node. */

export const isDOMText = (value: any): value is DOMText =>
  isDOMNode(value) && value.nodeType === 3;

/** Checks whether a paste event is a plaintext-only event. */

export const isPlainTextOnlyPaste = (event: ClipboardEvent) =>
  event.clipboardData &&
  event.clipboardData.getData('text/plain') !== '' &&
  event.clipboardData.types.length === 1;

/**
 * Get a plaintext representation of the content of a node, accounting for block
 * elements which get a newline appended.
 *
 * The domNode must be attached to the DOM.
 */

export const getPlainText = (domNode: DOMNode) => {
  let text = '';

  if (isDOMText(domNode) && domNode.nodeValue) {
    return domNode.nodeValue;
  }
  if (isDOMElement(domNode)) {
    for (const childNode of Array.from(domNode.childNodes)) {
      text += getPlainText(childNode);
    }

    const display = getComputedStyle(domNode).getPropertyValue('display');

    if (display === 'block' || display === 'list' || domNode.tagName === 'BR') {
      text += '\n';
    }
  }

  return text;
};

/** Get x-tree-fragment attribute from data-tree-fragment */
const catchTreeFragment = /data-tree-fragment="(.+?)"/;

export const getTreeFragmentAttribute = (
  dataTransfer: DataTransfer
): string | undefined => {
  const htmlData = dataTransfer.getData('text/html');
  const [, fragment] = catchTreeFragment.exec(htmlData) ?? [];

  return fragment;
};

/**
 * Get the x-tree-fragment attribute that exist in text/html data and append it
 * to the DataTransfer object
 */
export const getClipboardData = (
  dataTransfer: DataTransfer,
  clipboardFormatKey = 'x-tree-fragment'
): DataTransfer => {
  if (!dataTransfer.getData(`application/${clipboardFormatKey}`)) {
    const fragment = getTreeFragmentAttribute(dataTransfer);

    if (fragment) {
      const clipboardData = new DataTransfer();
      dataTransfer.types.forEach((type) => {
        clipboardData.setData(type, dataTransfer.getData(type));
      });
      clipboardData.setData(`application/${clipboardFormatKey}`, fragment);

      return clipboardData;
    }
  }

  return dataTransfer;
};
