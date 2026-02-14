-- CreateTable
CREATE TABLE "core_user" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "username" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "first_name" TEXT,
    "last_name" TEXT,
    "is_staff" BOOLEAN NOT NULL DEFAULT false,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "is_superuser" BOOLEAN NOT NULL DEFAULT false,
    "date_joined" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "last_login" DATETIME NOT NULL,
    "profile_image" TEXT,
    "email_verified" BOOLEAN NOT NULL DEFAULT false
);

-- CreateTable
CREATE TABLE "core_marketdata" (
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
    "last_update" DATETIME NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "core_marketdataarchive" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "original_id" INTEGER NOT NULL,
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
    "archived_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "last_update" DATETIME NOT NULL,
    "created_at" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "core_emailotp" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "user_id" INTEGER,
    "email" TEXT NOT NULL,
    "otp" TEXT NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expires_at" DATETIME NOT NULL,
    "is_used" BOOLEAN NOT NULL DEFAULT false,
    "verification_attempts" INTEGER NOT NULL DEFAULT 0,
    "ip_address" TEXT,
    "user_agent" TEXT,
    "purpose" TEXT NOT NULL DEFAULT 'login',
    CONSTRAINT "core_emailotp_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "core_user" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "core_currency" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL DEFAULT 'Currency',
    "rate" REAL NOT NULL DEFAULT 1.0,
    "last_update" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "core_currencyarchive" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "original_id" INTEGER NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "rate" REAL NOT NULL,
    "archived_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "last_update" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "core_announcement" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "priority" TEXT NOT NULL DEFAULT 'medium',
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "core_announcementarchive" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "original_id" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "priority" TEXT NOT NULL DEFAULT 'medium',
    "archived_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" DATETIME NOT NULL,
    "updated_at" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "core_usersettings" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "user_id" INTEGER NOT NULL,
    "email_notifications" BOOLEAN NOT NULL DEFAULT true,
    "dark_mode" BOOLEAN NOT NULL DEFAULT false,
    "language" TEXT NOT NULL DEFAULT 'en',
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "core_usersettings_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "core_user" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "core_user_username_key" ON "core_user"("username");

-- CreateIndex
CREATE UNIQUE INDEX "core_user_email_key" ON "core_user"("email");

-- CreateIndex
CREATE INDEX "core_emailotp_email_purpose_idx" ON "core_emailotp"("email", "purpose");

-- CreateIndex
CREATE INDEX "core_emailotp_expires_at_idx" ON "core_emailotp"("expires_at");

-- CreateIndex
CREATE UNIQUE INDEX "core_currency_code_key" ON "core_currency"("code");

-- CreateIndex
CREATE UNIQUE INDEX "core_usersettings_user_id_key" ON "core_usersettings"("user_id");
