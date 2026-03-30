import { randomUUID } from "node:crypto";

export function createPublicId() {
  return randomUUID().replace(/-/g, "").slice(0, 16);
}

export function formatDocumentNumber(prefix: string, nextNumber: number) {
  return `${prefix}-${nextNumber}`;
}
