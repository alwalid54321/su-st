import { PrismaClient } from '@prisma/client';
import { hash } from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Start seeding...');

  // Clear existing data (optional, for clean runs)
  await prisma.emailOTP.deleteMany();
  await prisma.userSettings.deleteMany();
  await prisma.announcementArchive.deleteMany();
  await prisma.announcement.deleteMany();
  await prisma.currencyArchive.deleteMany();
  await prisma.currency.deleteMany();
  await prisma.marketDataArchive.deleteMany();
  await prisma.marketData.deleteMany();
  await prisma.galleryImage.deleteMany();
  await prisma.user.deleteMany();

  // Create Users
  const hashedPassword = await hash('password123', 10);
  const users = [];
  for (let i = 0; i < 5; i++) {
    const user = await prisma.user.create({
      data: {
        username: `testuser${i}`,
        email: `test${i}@example.com`,
        password: hashedPassword,
        firstName: `Test`,
        lastName: `User${i}`,
        emailVerified: true,
        isStaff: i === 0 ? true : false, // Make first user staff
        isSuperuser: i === 0 ? true : false, // Make first user superuser
      },
    });
    users.push(user);
    console.log(`Created user: ${user.username}`);

    // Create UserSettings for each user
    await prisma.userSettings.create({
      data: {
        userId: user.id,
        emailNotifications: Math.random() > 0.5,
        darkMode: Math.random() > 0.5,
        language: Math.random() > 0.5 ? 'en' : 'ar',
      },
    });
    console.log(`Created settings for user: ${user.username}`);
  }

  // Create MarketData
  const marketDataItems = [];
  for (let i = 0; i < 10; i++) {
    const value = parseFloat((Math.random() * (1000 - 100) + 100).toFixed(2));
    const portSudan = parseFloat((Math.random() * (500 - 50) + 50).toFixed(2));
    const dmtChina = parseFloat((Math.random() * (100 - 10) + 10).toFixed(2));
    const dmtUae = parseFloat((Math.random() * (150 - 15) + 15).toFixed(2));
    const dmtMersing = parseFloat((Math.random() * (200 - 20) + 20).toFixed(2));
    const dmtIndia = parseFloat((Math.random() * (250 - 25) + 25).toFixed(2));
    const statusChoices = ['Active', 'Limited', 'Inactive'];
    const forecastChoices = ['Rising', 'Stable', 'Falling'];

    const marketData = await prisma.marketData.create({
      data: {
        name: `Commodity ${i + 1}`,
        value: value,
        portSudan: portSudan,
        dmtChina: dmtChina,
        dmtUae: dmtUae,
        dmtMersing: dmtMersing,
        dmtIndia: dmtIndia,
        status: statusChoices[Math.floor(Math.random() * statusChoices.length)],
        forecast: forecastChoices[Math.floor(Math.random() * forecastChoices.length)],
        imageUrl: i % 2 === 0 ? `/images/commodity_${i + 1}.png` : null,
      },
    });
    marketDataItems.push(marketData);
    console.log(`Created MarketData: ${marketData.name}`);

    // Simulate updates to generate archive data
    if (i % 3 === 0 && marketData.id) { // Only update if an ID exists
      const oldValue = marketData.value;
      const newValue = parseFloat((oldValue * (Math.random() * (1.1 - 0.9) + 0.9)).toFixed(2));
      const percentChange = ((newValue - oldValue) / oldValue) * 100;

      await prisma.marketData.update({
        where: { id: marketData.id },
        data: {
          value: newValue,
          trend: Math.round(percentChange),
          forecast: percentChange > 0 ? 'Rising' : (percentChange < 0 ? 'Falling' : 'Stable'),
        },
      });
      // Create an archive entry manually as Prisma doesn't do this automatically for updates
      await prisma.marketDataArchive.create({
        data: {
          originalId: marketData.id,
          name: marketData.name,
          value: oldValue,
          portSudan: marketData.portSudan,
          dmtChina: marketData.dmtChina,
          dmtUae: marketData.dmtUae,
          dmtMersing: marketData.dmtMersing,
          dmtIndia: marketData.dmtIndia,
          status: marketData.status,
          forecast: marketData.forecast,
          trend: marketData.trend,
          imageUrl: marketData.imageUrl,
          archivedAt: new Date(),
          lastUpdate: marketData.updatedAt,
          createdAt: marketData.createdAt,
        },
      });
      console.log(`Updated MarketData (and archived old version): ${marketData.name}`);
    }
  }

  // Create Currencies
  const currencyCodes = ['USD', 'EUR', 'GBP', 'JPY', 'AUD', 'CAD', 'CHF', 'CNY'];
  const currencies = [];
  for (const code of currencyCodes) {
    const rate = parseFloat((Math.random() * (10 - 0.5) + 0.5).toFixed(4));
    const currency = await prisma.currency.create({
      data: {
        code: code,
        name: `${code} Currency`,
        rate: rate,
      },
    });
    currencies.push(currency);
    console.log(`Created Currency: ${currency.code}`);

    // Simulate updates to generate archive data
    if (currency.id) {
      const oldRate = currency.rate;
      const newRate = parseFloat((oldRate * (Math.random() * (1.05 - 0.95) + 0.95)).toFixed(4));
      await prisma.currency.update({
        where: { id: currency.id },
        data: { rate: newRate },
      });
      // Create an archive entry manually
      await prisma.currencyArchive.create({
        data: {
          originalId: currency.id,
          code: currency.code,
          name: currency.name,
          rate: oldRate,
          archivedAt: new Date(),
          lastUpdate: currency.lastUpdate,
        },
      });
      console.log(`Updated Currency (and archived old version): ${currency.code}`);
    }
  }

  // Create Announcements
  const priorityChoices = ['low', 'medium', 'high'];
  for (let i = 0; i < 7; i++) {
    const announcement = await prisma.announcement.create({
      data: {
        title: `Announcement Title ${i + 1}`,
        content: `This is the content for announcement number ${i + 1}. It provides important information to users.`,
        priority: priorityChoices[Math.floor(Math.random() * priorityChoices.length)],
      },
    });
    console.log(`Created Announcement: ${announcement.title}`);

    // Simulate updates to generate archive data
    if (announcement.id && i % 2 === 0) {
      await prisma.announcement.update({
        where: { id: announcement.id },
        data: { content: `Updated content for announcement: ${announcement.title}. More details here.` },
      });
      // Create an archive entry manually
      await prisma.announcementArchive.create({
        data: {
          originalId: announcement.id,
          title: announcement.title,
          content: announcement.content,
          priority: announcement.priority,
          archivedAt: new Date(),
          createdAt: announcement.createdAt,
          updatedAt: announcement.updatedAt,
        },
      });
      console.log(`Updated Announcement (and archived old version): ${announcement.title}`);
    }
  }

  // Create EmailOTPs
  for (const user of users) {
    for (let i = 0; i < Math.floor(Math.random() * 3) + 1; i++) {
      const purposeChoices = ['login', 'registration', 'password_reset', 'email_change', 'security_action'];
      const expiresAt = new Date();
      expiresAt.setMinutes(expiresAt.getMinutes() + Math.floor(Math.random() * 15) + 1);

      await prisma.emailOTP.create({
        data: {
          userId: user.id,
          email: user.email,
          otp: Math.floor(100000 + Math.random() * 900000).toString(), // 6-digit OTP
          expiresAt: expiresAt,
          isUsed: Math.random() > 0.5,
          verificationAttempts: Math.floor(Math.random() * 6),
          ipAddress: `192.168.1.${Math.floor(Math.random() * 254) + 1}`,
          userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
          purpose: purposeChoices[Math.floor(Math.random() * purposeChoices.length)],
        },
      });
      console.log(`Created EmailOTP for ${user.username}`);
    }
  }

  // Create Ports
  const portNames = ['Port Sudan', 'Jebel Ali', 'Shanghai', 'Rotterdam', 'Istanbul', 'Cairo'];
  for (const name of portNames) {
    await prisma.port.create({
      data: { name, location: `Location for ${name}`, isActive: true }
    });
    console.log(`Created Port: ${name}`);
  }

  // Create ProductVariations
  const variations = [
    { name: 'Grade 1', description: 'Premium quality' },
    { name: 'Grade 2', description: 'Standard quality' },
    { name: 'Organic', description: 'Certified organic' },
    { name: 'Raw', description: 'Raw / Unprocessed' }
  ];
  for (const v of variations) {
    await prisma.productVariation.create({
      data: { name: v.name, description: v.description, isActive: true }
    });
    console.log(`Created Variation: ${v.name}`);
  }

  console.log('Seeding finished.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
