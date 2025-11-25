import type { TreeEditors } from '../interfaces/tree-editor';
import { TreeNodes } from '../interfaces/tree-node';

export const hasPath: (typeof TreeEditors)['hasPath'] = (editor, path) =>
  TreeNodes.has(editor, path);
