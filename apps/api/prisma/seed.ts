/**
 * Prisma seed — creates the first ADMIN user.
 * Run with: npx ts-node prisma/seed.ts
 */
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import * as bcrypt from 'bcrypt';
import * as dotenv from 'dotenv';

dotenv.config();

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
    const email = 'admin@patanyumba.co.ke';
    const password = 'Admin@123';

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
        console.log(`Admin user already exists: ${email}`);
        return;
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const admin = await prisma.user.create({
        data: {
            email,
            passwordHash,
            phoneNumber: '+254700000000',
            role: 'ADMIN',
            isVerified: true,
        },
    });

    console.log(`✅ Admin user created:`);
    console.log(`   Email:    ${admin.email}`);
    console.log(`   Password: ${password}`);
    console.log(`   Role:     ${admin.role}`);
    console.log(`\n⚠️  Change the password immediately after first login!`);
}

main()
    .catch((e) => { console.error(e); process.exit(1); })
    .finally(() => prisma.$disconnect());
