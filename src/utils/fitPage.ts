/**
 * Makes sure every question on an A4 sheet is fully visible (nothing clipped).
 * Starts at the sheet's data-base-font size and shrinks the font in small steps
 * until both question columns fit inside the page body.
 */
export function fitQuestionColumns(sheet: HTMLElement): number {
  const cols = Array.from(sheet.querySelectorAll<HTMLElement>('[data-fit-col]'));
  if (cols.length === 0) return 0;

  const base = Number(sheet.getAttribute('data-base-font')) || 10;
  const min = 3.5;
  const apply = (size: number) => cols.forEach((c) => (c.style.fontSize = `${size}px`));
  const overflowing = () => cols.some((c) => c.scrollHeight - c.clientHeight > 1);

  let size = base;
  apply(size);
  while (overflowing() && size > min) {
    size = Math.round((size - 0.1) * 10) / 10;
    apply(size);
  }
  return size;
}

export function fitAllPages(root: HTMLElement | null) {
  if (!root) return;
  root.querySelectorAll<HTMLElement>('.a4-sheet').forEach((sheet) => fitQuestionColumns(sheet));
}
