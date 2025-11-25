import type { TreeEditors } from '../interfaces/tree-editor';

export const string: (typeof TreeEditors)['string'] = (
  _editor,
  _at,
  _options = {}
) => {
  return '';

  // const {} = options;
  //
  // const [start, end] = [TreeEditors.start(), ];
  // let text = '';
  //
  // for (const [node, path] of TreeEditors.nodes(editor, {
  //   at: range,
  //   match: Text.isText,
  //   voids,
  // })) {
  //   let t = node.text;
  //
  //   if (Path.equals(path, end.path)) {
  //     t = t.slice(0, end.offset);
  //   }
  //
  //   if (Path.equals(path, start.path)) {
  //     t = t.slice(start.offset);
  //   }
  //
  //   text += t;
  // }

  // return text;
};
