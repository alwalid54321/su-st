-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_core_currency" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL DEFAULT 'Currency',
    "rate" REAL NOT NULL DEFAULT 1.0,
    "is_current" BOOLEAN NOT NULL DEFAULT true,
    "previous_version_id" INTEGER,
    "last_update" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO "new_core_currency" ("code", "id", "last_update", "name", "rate") SELECT "code", "id", "last_update", "name", "rate" FROM "core_currency";
DROP TABLE "core_currency";
ALTER TABLE "new_core_currency" RENAME TO "core_currency";
CREATE UNIQUE INDEX "core_currency_code_key" ON "core_currency"("code");
CREATE TABLE "new_core_galleryimage" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "title" TEXT NOT NULL,
    "image_url" TEXT NOT NULL,
    "description" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "is_current" BOOLEAN NOT NULL DEFAULT true,
    "previous_version_id" INTEGER,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL
);
INSERT INTO "new_core_galleryimage" ("created_at", "description", "id", "image_url", "is_active", "order", "title", "updated_at") SELECT "created_at", "description", "id", "image_url", "is_active", "order", "title", "updated_at" FROM "core_galleryimage";
DROP TABLE "core_galleryimage";
ALTER TABLE "new_core_galleryimage" RENAME TO "core_galleryimage";
CREATE TABLE "new_core_marketdata" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "value" REAL NOT NULL DEFAULT 0.0,
    "port_sudan" REAL NOT NULL DEFAULT 0.0,
    "dmt_china" REAL NOT NULL DEFAULT 0.0,
    "dmt_uae" REAL NOT NULL DEFAULT 0.0,
    "dmt_mersing" REAL NOT NULL DEFAULT 0.0,
    "dmt_india" REAL NOT NULL DEFAULT 0.0,
    "status" TEXT NOT NULL DEFAULT 'Active',
    "forecast" TEXT NOT NULL DEFAULT 'Stable',
    "trend" INTEGER NOT NULL DEFAULT 0,
    "image_url" TEXT,
    "category" TEXT DEFAULT 'others',
    "description" TEXT,
    "specifications" TEXT,
    "details" TEXT,
    "availability" TEXT,
    "is_current" BOOLEAN NOT NULL DEFAULT true,
    "previous_version_id" INTEGER,
    "last_update" DATETIME NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO "new_core_marketdata" ("availability", "category", "created_at", "description", "details", "dmt_china", "dmt_india", "dmt_mersing", "dmt_uae", "forecast", "id", "image_url", "last_update", "name", "port_sudan", "specifications", "status", "trend", "value") SELECT "availability", "category", "created_at", "description", "details", "dmt_china", "dmt_india", "dmt_mersing", "dmt_uae", "forecast", "id", "image_url", "last_update", "name", "port_sudan", "specifications", "status", "trend", "value" FROM "core_marketdata";
DROP TABLE "core_marketdata";
ALTER TABLE "new_core_marketdata" RENAME TO "core_marketdata";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
