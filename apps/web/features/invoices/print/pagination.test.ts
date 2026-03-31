/** @jest-environment node */

import { paginateInvoiceItems } from "@/features/invoices/print/pagination";

describe("paginateInvoiceItems", () => {
  it("keeps invoices with 8 items on one page", () => {
    expect(paginateInvoiceItems([1, 2, 3, 4, 5, 6, 7, 8])).toEqual([
      [1, 2, 3, 4, 5, 6, 7, 8],
    ]);
  });

  it("keeps invoices with 10 items on one page", () => {
    expect(paginateInvoiceItems(Array.from({ length: 10 }, (_, index) => index + 1))).toEqual([
      [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
    ]);
  });

  it("splits 11 items into 10 and 1", () => {
    expect(paginateInvoiceItems(Array.from({ length: 11 }, (_, index) => index + 1))).toEqual([
      [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
      [11],
    ]);
  });

  it("splits 60 items into 10 and 50", () => {
    expect(paginateInvoiceItems(Array.from({ length: 60 }, (_, index) => index + 1))).toEqual([
      [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
      Array.from({ length: 50 }, (_, index) => index + 11),
    ]);
  });

  it("splits 61 items into 10, 50, and 1", () => {
    expect(paginateInvoiceItems(Array.from({ length: 61 }, (_, index) => index + 1))).toEqual([
      [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
      Array.from({ length: 50 }, (_, index) => index + 11),
      [61],
    ]);
  });
});
