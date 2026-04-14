-- CreateTable
CREATE TABLE "items" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "defaultRate" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "unitType" TEXT NOT NULL DEFAULT 'each',
    "defaultTaxRate" DECIMAL(5,2) NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "items_pkey" PRIMARY KEY ("id")
);

-- AlterTable
ALTER TABLE "estimate_line_items"
ADD COLUMN "savedItemId" TEXT,
ADD COLUMN "unitType" TEXT NOT NULL DEFAULT 'each';

-- AlterTable
ALTER TABLE "invoice_line_items"
ADD COLUMN "savedItemId" TEXT,
ADD COLUMN "unitType" TEXT NOT NULL DEFAULT 'each';

-- CreateIndex
CREATE INDEX "items_companyId_idx" ON "items"("companyId");

-- CreateIndex
CREATE INDEX "items_companyId_updatedAt_idx" ON "items"("companyId", "updatedAt");

-- CreateIndex
CREATE INDEX "estimate_line_items_savedItemId_idx" ON "estimate_line_items"("savedItemId");

-- CreateIndex
CREATE INDEX "invoice_line_items_savedItemId_idx" ON "invoice_line_items"("savedItemId");

-- AddForeignKey
ALTER TABLE "items" ADD CONSTRAINT "items_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "estimate_line_items" ADD CONSTRAINT "estimate_line_items_savedItemId_fkey" FOREIGN KEY ("savedItemId") REFERENCES "items"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invoice_line_items" ADD CONSTRAINT "invoice_line_items_savedItemId_fkey" FOREIGN KEY ("savedItemId") REFERENCES "items"("id") ON DELETE SET NULL ON UPDATE CASCADE;
