export const findDOMAncestor = (
  target: HTMLElement,
  selector: string
): HTMLElement | null => {
  for (let node = target.parentElement; node; node = node.parentElement) {
    if (node.matches(selector)) {
      return node;
    }
  }

  return null;
};
