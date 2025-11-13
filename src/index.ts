import { disconnectPrisma, testPrismaConnection } from '@db/prisma.js';

import { buildApp } from '@/app.js';

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n👋 Shutting down gracefully...');
  await disconnectPrisma();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('\n👋 Shutting down gracefully...');
  await disconnectPrisma();
  process.exit(0);
});

// Start server
const start = async () => {
  try {
    // Test Prisma connection
    const dbConnected = await testPrismaConnection();
    if (!dbConnected) {
      throw new Error('Failed to connect to database with Prisma');
    }

    // Build and start Fastify app
    const app = await buildApp();

    const port = process.env.PORT ? parseInt(process.env.PORT) : 3000;
    const host = process.env.HOST || '0.0.0.0';

    await app.listen({ port, host });

    console.log(`🚀 Server is running on http://${host}:${port}`);
    console.log(`📊 Using Prisma ORM for database operations`);
    console.log(`📁 Modular architecture enabled`);
  } catch (err) {
    console.error(err);
    await disconnectPrisma();
    process.exit(1);
  }
};

start();
