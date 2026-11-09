/**
 * Fits MCQ columns into the printable A4 body without collapsing the text.
 * Format 25 is intended for 25 questions/page; Format 50 for 50/page.
 */
export function fitQuestionColumns(sheet: HTMLElement): number {
  const cols = Array.from(sheet.querySelectorAll<HTMLElement>('[data-fit-col]'));
  if (!cols.length) return 0;

  const base = Number(sheet.getAttribute('data-base-font')) || 10;
  const min = Number(sheet.getAttribute('data-min-font')) || Math.max(6.2, base * 0.72);
  const apply = (size: number) => {
    cols.forEach((col) => {
      col.style.fontSize = `${size}px`;
      col.querySelectorAll<HTMLElement>('[data-q]').forEach((question) => {
        question.style.fontSize = `${size}px`;
      });
    });
  };
  const overflowing = () => cols.some((col) => col.scrollHeight > col.clientHeight + 2);

  let size = base;
  apply(size);
  while (overflowing() && size > min) {
    size = Math.max(min, Math.round((size - 0.25) * 100) / 100);
    apply(size);
  }
  return size;
}

export function fitAllPages(root: HTMLElement | null) {
  if (!root) return;
  root.querySelectorAll<HTMLElement>('.a4-sheet').forEach((sheet) => fitQuestionColumns(sheet));
}
