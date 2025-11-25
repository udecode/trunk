import type { TreeEditor } from '../core/interfaces';
import type { TreeHistory } from './tree-history';

/** Weakmaps for attaching state to the editor. */

export const HISTORY = new WeakMap<TreeEditor, TreeHistory>();

export const SAVING = new WeakMap<TreeEditor, boolean | undefined>();

export const MERGING = new WeakMap<TreeEditor, boolean | undefined>();

/** `HistoryEditor` contains helpers for history-enabled editors. */
export type TreeHistoryEditorProps = {
  history: TreeHistory;
  redo: () => void;
  undo: () => void;
  writeHistory: (stack: 'redos' | 'undos', batch: any) => void;
};

export const HistoryEditors = {
  /** Get the merge flag's current value. */
  isMerging(editor: TreeEditor): boolean | undefined {
    return MERGING.get(editor);
  },

  /** Get the saving flag's current value. */

  isSaving(editor: TreeEditor): boolean | undefined {
    return SAVING.get(editor);
  },

  /** Redo to the previous saved state. */

  redo(editor: TreeEditor & TreeHistoryEditorProps): void {
    editor.redo();
  },

  /** Undo to the previous saved state. */

  undo(editor: TreeEditor & TreeHistoryEditorProps): void {
    editor.undo();
  },

  /**
   * Apply a series of changes inside a synchronous `fn`, without merging any of
   * the new operations into previous save point in the history.
   */
  withoutMerging(editor: TreeEditor, fn: () => void): void {
    const prev = HistoryEditors.isMerging(editor);
    MERGING.set(editor, false);
    fn();
    MERGING.set(editor, prev);
  },

  /**
   * Apply a series of changes inside a synchronous `fn`, without saving any of
   * their operations into the history.
   */
  withoutSaving(editor: TreeEditor, fn: () => void): void {
    const prev = HistoryEditors.isSaving(editor);
    SAVING.set(editor, false);
    fn();
    SAVING.set(editor, prev);
  },
};
