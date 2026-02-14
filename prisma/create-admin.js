const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function main() {
    // Create an admin user
    const hashedPassword = await bcrypt.hash('admin123', 10)

    const adminUser = await prisma.user.upsert({
        where: { email: 'admin@sudastock.com' },
        update: {},
        create: {
            username: 'admin',
            email: 'admin@sudastock.com',
            password: hashedPassword,
            firstName: 'Admin',
            lastName: 'User',
            isStaff: true,
            isSuperuser: true,
            isActive: true
        }
    })

    console.log('Admin user created/updated:', adminUser.email)
    console.log('Username: admin@sudastock.com')
    console.log('Password: admin123')
}

main()
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
