-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_core_announcement" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "priority" TEXT NOT NULL DEFAULT 'medium',
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "is_featured" BOOLEAN NOT NULL DEFAULT false,
    "image_url" TEXT,
    "external_link" TEXT,
    "category" TEXT NOT NULL DEFAULT 'news',
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL
);
INSERT INTO "new_core_announcement" ("content", "created_at", "id", "priority", "title", "updated_at") SELECT "content", "created_at", "id", "priority", "title", "updated_at" FROM "core_announcement";
DROP TABLE "core_announcement";
ALTER TABLE "new_core_announcement" RENAME TO "core_announcement";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
