export const FIRST_INVOICE_PRINT_PAGE_SIZE = 10;
export const SUBSEQUENT_INVOICE_PRINT_PAGE_SIZE = 50;

export function paginateInvoiceItems<T>(items: T[]) {
  if (items.length === 0) {
    return [[]];
  }

  if (items.length <= FIRST_INVOICE_PRINT_PAGE_SIZE) {
    return [items];
  }

  const pages = [items.slice(0, FIRST_INVOICE_PRINT_PAGE_SIZE)];

  for (
    let index = FIRST_INVOICE_PRINT_PAGE_SIZE;
    index < items.length;
    index += SUBSEQUENT_INVOICE_PRINT_PAGE_SIZE
  ) {
    pages.push(items.slice(index, index + SUBSEQUENT_INVOICE_PRINT_PAGE_SIZE));
  }

  return pages;
}
