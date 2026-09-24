-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Order" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "menuId" TEXT NOT NULL,
    "customerName" TEXT NOT NULL,
    "customerPhone" TEXT,
    "customerAddress" TEXT,
    "notes" TEXT,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "deliveryType" TEXT NOT NULL DEFAULT 'delivery',
    "total" REAL NOT NULL,
    "trackingToken" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Order_menuId_fkey" FOREIGN KEY ("menuId") REFERENCES "Menu" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Order" ("createdAt", "customerAddress", "customerName", "customerPhone", "id", "menuId", "notes", "status", "total", "trackingToken") SELECT "createdAt", "customerAddress", "customerName", "customerPhone", "id", "menuId", "notes", "status", "total", "trackingToken" FROM "Order";
DROP TABLE "Order";
ALTER TABLE "new_Order" RENAME TO "Order";
CREATE UNIQUE INDEX "Order_trackingToken_key" ON "Order"("trackingToken");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

