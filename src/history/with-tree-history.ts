import { type TreeEditor, TreeOperations } from '../core/interfaces';

import {
  HistoryEditors,
  type TreeHistoryEditorProps,
} from './tree-history-editor';

/**
 * The `withHistory` plugin keeps track of the operation history of a Slate
 * editor as operations are applied to it, using undo and redo stacks.
 *
 * If you are using TypeScript, you must extend Slate's CustomTypes to use this
 * plugin.
 *
 * See https://docs.slatejs.org/concepts/11-typescript to learn how.
 */
export const withTreeHistory = <T extends TreeEditor>(editor: T) => {
  const e = editor as T & TreeHistoryEditorProps;
  const { apply } = e;
  e.history = { redos: [], undos: [] };

  e.redo = () => {
    const { history } = e;
    const { redos } = history;

    if (redos.length > 0) {
      const batch = redos.at(-1)!;

      HistoryEditors.withoutSaving(e, () => {
        // Editor.withoutNormalizing(e, () => {
        for (const op of batch.operations) {
          e.apply(op);
        }
        // });
      });

      history.redos.pop();
      e.writeHistory('undos', batch);
    }
  };

  e.undo = () => {
    const { history } = e;
    const { undos } = history;

    if (undos.length > 0) {
      const batch = undos.at(-1)!;

      HistoryEditors.withoutSaving(e, () => {
        // Editor.withoutNormalizing(e, () => {
        const inverseOps = batch.operations
          .map((op) => TreeOperations.inverse(op))
          .toReversed();

        for (const op of inverseOps) {
          e.apply(op);
        }
        // });
      });

      e.writeHistory('redos', batch);
      history.undos.pop();
    }
  };

  e.apply = (op) => {
    const { history, operations } = e;
    const { undos } = history;
    const lastBatch = undos.at(-1);
    let save = HistoryEditors.isSaving(e);
    let merge = HistoryEditors.isMerging(e);

    if (save == null) {
      save = true;
    }
    if (save) {
      if (merge == null) {
        merge = lastBatch == null ? false : operations.length > 0;
      }
      if (lastBatch && merge) {
        lastBatch.operations.push(op);
      } else {
        const batch = {
          operations: [op],
        };
        e.writeHistory('undos', batch);
      }

      while (undos.length > 100) {
        undos.shift();
      }

      history.redos = [];
    }

    apply(op);
  };

  e.writeHistory = (stack: 'redos' | 'undos', batch: any) => {
    e.history[stack].push(batch);
  };

  return e;
};
