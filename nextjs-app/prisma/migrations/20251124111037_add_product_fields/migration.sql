-- AlterTable
ALTER TABLE "core_marketdata" ADD COLUMN "availability" TEXT;
ALTER TABLE "core_marketdata" ADD COLUMN "category" TEXT DEFAULT 'others';
ALTER TABLE "core_marketdata" ADD COLUMN "description" TEXT;
ALTER TABLE "core_marketdata" ADD COLUMN "details" TEXT;
ALTER TABLE "core_marketdata" ADD COLUMN "specifications" TEXT;
