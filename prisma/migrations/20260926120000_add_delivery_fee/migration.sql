-- AlterTable
ALTER TABLE "Menu" ADD COLUMN "deliveryFee" REAL NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "Order" ADD COLUMN "deliveryFee" REAL NOT NULL DEFAULT 0;
