import type { TreeEditor } from '../interfaces/tree-editor';

export type AnyObject = Record<string, any>;

/** Modify type properties. https://stackoverflow.com/a/55032655/6689201 */
export type Modify<T, R> = Omit<T, keyof R> & R;

export type OmitFirstArg<F> = F extends (x: any, ...args: infer P) => infer R
  ? (...args: P) => R
  : never;

export type UnknownObject = Record<string, unknown>;

export type WithEditorFirstArg<T extends (...args: any) => any> = (
  editor: TreeEditor,
  ...args: Parameters<T>
) => ReturnType<T>;

/** Make all properties in T nullable */
export type Nullable<T> = { [K in keyof T]: T[K] | null };

/** Type for scroll into view function */
export type ScrollIntoArea = (
  element: HTMLElement,
  options?: ScrollIntoViewOptions
) => void;
