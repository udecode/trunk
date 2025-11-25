import {
  type TreeEditor,
  TreeEditors,
  type TreePath,
  TreePaths,
} from '../core/interfaces';
import { type TreeReactEditor, TreeReactEditors } from './tree-react-editor';
import type { TreeNodeKey } from './utils/treeNodeKey';
import {
  EDITOR_TO_KEY_TO_ELEMENT,
  EDITOR_TO_ON_CHANGE,
  NODE_TO_KEY,
} from './utils/weak-maps';

/** `withReact` adds React and DOM specific behaviors to the editor. */
export const withTreeReact = <T extends TreeEditor>(
  editor: T
  // clipboardFormatKey = 'x-tree-fragment'
): T & TreeReactEditor => {
  const e = editor as T & TreeReactEditor;
  const { apply, onChange } = e;

  // The WeakMap which maps a key to a specific HTMLElement must be scoped to the editor instance to
  // avoid collisions between editors in the DOM that share the same value.
  EDITOR_TO_KEY_TO_ELEMENT.set(e, new WeakMap());

  e.scrollIntoView = () => {};

  e.setScrollIntoView = (fn) => {
    const previous = e.scrollIntoView;
    e.scrollIntoView = fn;

    return () => {
      e.scrollIntoView = previous;
    };
  };

  // This attempts to reset the NODE_TO_KEY entry to the correct value
  // as apply() changes the object reference and hence invalidates the NODE_TO_KEY entry
  e.apply = (op) => {
    const matches: [TreePath, TreeNodeKey][] = [];

    switch (op.type) {
      case 'insert_node':
      case 'remove_node': {
        const parentPath = TreePaths.parent(op.path);

        if (!parentPath) {
          editor.onError({
            key: 'withReact.apply.insert_node',
            data: { op },
            message: 'Failed to get parent path for operation.',
          });

          break;
        }

        matches.push(...getMatches(e, parentPath));

        break;
      }
      case 'move_node': {
        const parentPath = TreePaths.parent(op.path);
        const parentNewPath = TreePaths.parent(op.newPath);

        if (!parentPath || !parentNewPath) {
          editor.onError({
            key: 'withReact.apply.move_node',
            data: { op },
            message: 'Failed to get parent path for operation.',
          });

          break;
        }

        const commonPath = TreePaths.common(parentPath, parentNewPath);
        matches.push(...getMatches(e, commonPath));

        break;
      }
      case 'set_node': {
        matches.push(...getMatches(e, op.path));

        break;
      }
    }

    apply(op);

    for (const [path, key] of matches) {
      const entry = TreeEditors.node(e, path);

      if (!entry) {
        editor.onError({
          key: 'withReact.apply.node',
          data: { op },
          message: 'Failed to get node entry for operation.',
        });

        continue;
      }

      const [node] = entry;

      NODE_TO_KEY.set(node, key);
    }
  };

  e.onChange = (options) => {
    const onContextChange = EDITOR_TO_ON_CHANGE.get(e);

    if (onContextChange) {
      onContextChange();
    }

    onChange(options);
  };

  // e.setFragmentData = (data: Pick<DataTransfer, 'getData' | 'setData'>) => {
  //   const { selection } = e;
  //
  //   if (!selection) {
  //     return;
  //   }
  //
  //   const [start, end] = Range.edges(selection);
  //   const startVoid = TreeEditors.void(e, { at: start.path });
  //   const endVoid = TreeEditors.void(e, { at: end.path });
  //
  //   if (Range.isCollapsed(selection) && !startVoid) {
  //     return;
  //   }
  //
  //   // Create a fake selection so that we can add a Base64-encoded copy of the
  //   // fragment to the HTML, to decode on future pastes.
  //   const domRange = TreeReactEditors.toDOMRange(e, selection);
  //   if (!domRange) {
  //     editor.onError({
  //       key: 'withReact.setFragmentData.toDOMRange',
  //       message: 'Failed to create DOM range for current selection',
  //     });
  //     return;
  //   }
  //
  //   let contents = domRange.cloneContents();
  //   let attach = contents.childNodes[0] as HTMLElement;
  //
  //   // Make sure attach is non-empty, since empty nodes will not get copied.
  //   contents.childNodes.forEach((node) => {
  //     if (node.textContent && node.textContent.trim() !== '') {
  //       attach = node as HTMLElement;
  //     }
  //   });
  //
  //   // COMPAT: If the end node is a void node, we need to move the end of the
  //   // range from the void node's spacer span, to the end of the void node's
  //   // content, since the spacer is before void's content in the DOM.
  //   if (endVoid) {
  //     const [voidNode] = endVoid;
  //     const r = domRange.cloneRange();
  //     const domNode = TreeReactEditors.toDOMNode(e, voidNode);
  //     if (!domNode) {
  //       editor.onError({
  //         key: 'withReact.setFragmentData.toDOMNode',
  //         message: 'Failed to create DOM node for current selection',
  //         data: { voidNode },
  //       });
  //       return;
  //     }
  //
  //     r.setEndAfter(domNode);
  //     contents = r.cloneContents();
  //   }
  //
  //   // COMPAT: If the start node is a void node, we need to attach the encoded
  //   // fragment to the void node's content node instead of the spacer, because
  //   // attaching it to empty `<div>/<span>` nodes will end up having it erased by
  //   // most browsers. (2018/04/27)
  //   if (startVoid) {
  //     attach = contents.querySelector('[data-tree-spacer]')! as HTMLElement;
  //   }
  //
  //   // Remove any zero-width space spans from the cloned DOM so that they don't
  //   // show up elsewhere when pasted.
  //   Array.from(contents.querySelectorAll('[data-tree-zero-width]')).forEach(
  //     (zw) => {
  //       const isNewline = zw.dataset.treeZeroWidth === 'n';
  //       zw.textContent = isNewline ? '\n' : '';
  //     }
  //   );
  //
  //   // Set a `data-tree-fragment` attribute on a non-empty node, so it shows up
  //   // in the HTML, and can be used for intra-Tree pasting. If it's a text
  //   // node, wrap it in a `<span>` so we have something to set an attribute on.
  //   if (isDOMText(attach)) {
  //     const span = attach.ownerDocument.createElement('span');
  //     // COMPAT: In Chrome and Safari, if we don't add the `white-space` style
  //     // then leading and trailing spaces will be ignored. (2017/09/21)
  //     span.style.whiteSpace = 'pre';
  //     span.append(attach);
  //     contents.append(span);
  //     attach = span;
  //   }
  //
  //   const fragment = e.getFragment();
  //   const string = JSON.stringify(fragment);
  //   const encoded = window.btoa(encodeURIComponent(string));
  //   attach.dataset.treeFragment = encoded;
  //   data.setData(`application/${clipboardFormatKey}`, encoded);
  //
  //   // Add the content to a <div> so that we can get its inner HTML.
  //   const div = contents.ownerDocument.createElement('div');
  //   div.append(contents);
  //   div.setAttribute('hidden', 'true');
  //   contents.ownerDocument.body.append(div);
  //   data.setData('text/html', div.innerHTML);
  //   data.setData('text/plain', getPlainText(div));
  //   div.remove();
  //   return data;
  // };

  // e.insertData = (data: DataTransfer) => {
  //   if (!e.insertFragmentData(data)) {
  //     e.insertTextData(data);
  //   }
  // };
  //
  // e.insertFragmentData = (data: DataTransfer): boolean => {
  //   /**
  //    * Checking copied fragment from application/x-tree-fragment or data-tree-fragment
  //    */
  //   const fragment =
  //     data.getData(`application/${clipboardFormatKey}`) ||
  //     getTreeFragmentAttribute(data);
  //
  //   if (fragment) {
  //     const decoded = decodeURIComponent(window.atob(fragment));
  //     const parsed = JSON.parse(decoded) as Node[];
  //     e.insertFragment(parsed);
  //     return true;
  //   }
  //   return false;
  // };
  //
  // e.insertTextData = (data: DataTransfer): boolean => {
  //   const text = data.getData('text/plain');
  //
  //   if (text) {
  //     const lines = text.split(/\r\n|\r|\n/);
  //     let split = false;
  //
  //     for (const line of lines) {
  //       if (split) {
  //         Transforms.splitNodes(e, { always: true });
  //       }
  //
  //       e.insertText(line);
  //       split = true;
  //     }
  //     return true;
  //   }
  //   return false;
  // };

  return e;
};

const getMatches = (e: TreeReactEditor, path: TreePath) => {
  const matches: [TreePath, TreeNodeKey][] = [];

  for (const [n, p] of TreeEditors.levels(e, { at: path })) {
    const key = TreeReactEditors.findKey(e, n);
    matches.push([p, key]);
  }

  return matches;
};
