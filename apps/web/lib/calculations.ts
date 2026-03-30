import { DiscountType } from "@prisma/client";

export type CalculationLineItemInput = {
  quantity: number;
  unitPrice: number;
  taxRate: number;
};

export type DocumentCalculationInput = {
  items: CalculationLineItemInput[];
  discountType?: DiscountType | null;
  discountValue?: number | null;
  amountPaid?: number;
};

function roundMoney(value: number) {
  return Number(value.toFixed(2));
}

export function calculateLineTotal(quantity: number, unitPrice: number) {
  return roundMoney(quantity * unitPrice);
}

export function calculateDocumentTotals(input: DocumentCalculationInput) {
  const subtotal = roundMoney(
    input.items.reduce((sum, item) => sum + calculateLineTotal(item.quantity, item.unitPrice), 0),
  );

  const discountValue = input.discountValue ?? 0;
  let discountTotal = 0;

  if (input.discountType === DiscountType.PERCENTAGE) {
    discountTotal = roundMoney(subtotal * (discountValue / 100));
  }

  if (input.discountType === DiscountType.FIXED) {
    discountTotal = roundMoney(Math.min(subtotal, discountValue));
  }

  const discountedSubtotal = roundMoney(subtotal - discountTotal);

  const taxTotal = roundMoney(
    input.items.reduce((sum, item) => {
      const lineTotal = calculateLineTotal(item.quantity, item.unitPrice);
      const discountedLineTotal = subtotal === 0 ? lineTotal : lineTotal * (discountedSubtotal / subtotal);

      return sum + discountedLineTotal * (item.taxRate / 100);
    }, 0),
  );

  const total = roundMoney(discountedSubtotal + taxTotal);
  const amountPaid = roundMoney(input.amountPaid ?? 0);
  const balanceDue = roundMoney(Math.max(total - amountPaid, 0));

  return {
    subtotal,
    discountTotal,
    taxTotal,
    total,
    amountPaid,
    balanceDue,
  };
}
