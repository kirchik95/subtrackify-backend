import { PrismaPg } from '@prisma/adapter-pg';
import dotenv from 'dotenv';

import { PrismaClient } from '@/generated/prisma/client.js';

dotenv.config();

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
});

// Prisma Client instance
const prisma = new PrismaClient({ adapter });

// Test database connection
export async function testPrismaConnection(): Promise<boolean> {
  try {
    await prisma.$connect();
    console.log('✅ Prisma connected to database successfully');
    return true;
  } catch (error) {
    console.error('❌ Prisma connection failed:', error);
    return false;
  }
}

// Graceful shutdown
export async function disconnectPrisma(): Promise<void> {
  await prisma.$disconnect();
  console.log('👋 Prisma disconnected');
}

export default prisma;
