import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting to seed existing data as current...');

  // Update MarketData
  await prisma.marketData.updateMany({
    where: {
      isCurrent: { not: true }, // Find records where isCurrent is not true (or is null/false)
    },
    data: {
      isCurrent: true,
      previousVersionId: null,
    },
  });
  console.log('Updated existing MarketData records to isCurrent: true.');

  // Update Currency
  await prisma.currency.updateMany({
    where: {
      isCurrent: { not: true },
    },
    data: {
      isCurrent: true,
      previousVersionId: null,
    },
  });
  console.log('Updated existing Currency records to isCurrent: true.');

  // Update GalleryImage
  await prisma.galleryImage.updateMany({
    where: {
      isCurrent: { not: true },
    },
    data: {
      isCurrent: true,
      previousVersionId: null,
    },
  });
  console.log('Updated existing GalleryImage records to isCurrent: true.');

  console.log('Seeding complete.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });