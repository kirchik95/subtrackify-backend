import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';

dotenv.config();

// Prisma Client instance
const prisma = new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
});

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
