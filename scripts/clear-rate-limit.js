// Quick script to clear rate limit and test password
// Run this with: node scripts/clear-rate-limit.js

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
    const email = 'sudastock249@gmail.com';
    const testPassword = '#SUDApassword.STOCK3';

    console.log('🔍 Checking user in database...\n');

    // Find the user
    const user = await prisma.user.findUnique({
        where: { email }
    });

    if (!user) {
        console.log('❌ User not found! Please run the seed script first.');
        return;
    }

    console.log('✅ User found:');
    console.log('   Email:', user.email);
    console.log('   Username:', user.username);
    console.log('   Plan:', user.plan);
    console.log('   Is Active:', user.isActive);
    console.log('   Is Superuser:', user.isSuperuser);
    console.log('   Email Verified:', user.emailVerified);
    console.log('\n🔐 Testing password...\n');

    // Test the password
    const isValid = await bcrypt.compare(testPassword, user.password);

    if (isValid) {
        console.log('✅ Password is CORRECT!');
        console.log('   Password: ' + testPassword);
        console.log('\n📋 Login Details:');
        console.log('   Email:', user.email);
        console.log('   Password:', testPassword);
        console.log('\n💡 The rate limit will clear automatically in 15 minutes.');
        console.log('   Or restart your dev server to clear it immediately.');
    } else {
        console.log('❌ Password is INCORRECT!');
        console.log('   Stored hash:', user.password);
        console.log('\n🔧 Generating new hash for password:', testPassword);

        const newHash = await bcrypt.hash(testPassword, 10);
        console.log('   New hash:', newHash);

        // Update the user
        await prisma.user.update({
            where: { email },
            data: { password: newHash }
        });

        console.log('\n✅ Password updated! You can now log in with:');
        console.log('   Email:', user.email);
        console.log('   Password:', testPassword);
        console.log('\n⚠️  Restart your dev server to clear the rate limit!');
    }
}

main()
    .catch((e) => {
        console.error('❌ Error:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
