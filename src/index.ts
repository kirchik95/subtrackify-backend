import Fastify from 'fastify';

import prisma, { disconnectPrisma, testPrismaConnection } from './prisma.js';

const fastify = Fastify({
  logger: true,
});

// Health check endpoint with database status
fastify.get('/health', async (request, reply) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      database: 'connected',
      orm: 'prisma',
    };
  } catch {
    return reply.status(503).send({
      status: 'error',
      timestamp: new Date().toISOString(),
      database: 'disconnected',
    });
  }
});

// Root endpoint
fastify.get('/', async () => {
  return {
    message: 'Welcome to Subtrackify API',
    version: '1.0.0',
    orm: 'Prisma',
  };
});

// Get all subscriptions
fastify.get('/api/subscriptions', async (request, reply) => {
  try {
    const subscriptions = await prisma.subscription.findMany({
      orderBy: { createdAt: 'desc' },
      include: { user: true },
    });
    return subscriptions;
  } catch (error) {
    fastify.log.error(error);
    return reply.status(500).send({ error: 'Failed to fetch subscriptions' });
  }
});

// Get subscription by ID
fastify.get<{ Params: { id: string } }>('/api/subscriptions/:id', async (request, reply) => {
  try {
    const { id } = request.params;
    const subscription = await prisma.subscription.findUnique({
      where: { id: parseInt(id) },
      include: { user: true },
    });

    if (!subscription) {
      return reply.status(404).send({ error: 'Subscription not found' });
    }

    return subscription;
  } catch (error) {
    fastify.log.error(error);
    return reply.status(500).send({ error: 'Failed to fetch subscription' });
  }
});

// Create subscription
fastify.post<{
  Body: {
    name: string;
    description?: string;
    price: number;
    currency?: string;
    billingCycle: string;
    nextBillingDate: string;
    category?: string;
    userId?: number;
  };
}>('/api/subscriptions', async (request, reply) => {
  try {
    const {
      name,
      description,
      price,
      currency = 'USD',
      billingCycle,
      nextBillingDate,
      category,
      userId,
    } = request.body;

    const subscription = await prisma.subscription.create({
      data: {
        name,
        description,
        price,
        currency,
        billingCycle,
        nextBillingDate: new Date(nextBillingDate),
        category,
        userId,
      },
      include: { user: true },
    });

    return reply.status(201).send(subscription);
  } catch (error) {
    fastify.log.error(error);
    return reply.status(500).send({ error: 'Failed to create subscription' });
  }
});

// Update subscription
fastify.put<{
  Params: { id: string };
  Body: {
    name?: string;
    description?: string;
    price?: number;
    currency?: string;
    billingCycle?: string;
    nextBillingDate?: string;
    status?: string;
    category?: string;
  };
}>('/api/subscriptions/:id', async (request, reply) => {
  try {
    const { id } = request.params;
    const { nextBillingDate, ...updates } = request.body;

    if (Object.keys(updates).length === 0 && !nextBillingDate) {
      return reply.status(400).send({ error: 'No fields to update' });
    }

    const data: Record<string, unknown> = { ...updates };
    if (nextBillingDate) {
      data.nextBillingDate = new Date(nextBillingDate);
    }

    const subscription = await prisma.subscription.update({
      where: { id: parseInt(id) },
      data,
      include: { user: true },
    });

    return subscription;
  } catch (error: unknown) {
    fastify.log.error(error);
    if (typeof error === 'object' && error !== null && 'code' in error && error.code === 'P2025') {
      return reply.status(404).send({ error: 'Subscription not found' });
    }
    return reply.status(500).send({ error: 'Failed to update subscription' });
  }
});

// Delete subscription
fastify.delete<{ Params: { id: string } }>('/api/subscriptions/:id', async (request, reply) => {
  try {
    const { id } = request.params;
    await prisma.subscription.delete({
      where: { id: parseInt(id) },
    });

    return { message: 'Subscription deleted successfully' };
  } catch (error: unknown) {
    fastify.log.error(error);
    if (typeof error === 'object' && error !== null && 'code' in error && error.code === 'P2025') {
      return reply.status(404).send({ error: 'Subscription not found' });
    }
    return reply.status(500).send({ error: 'Failed to delete subscription' });
  }
});

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n👋 Shutting down gracefully...');
  await disconnectPrisma();
  await fastify.close();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('\n👋 Shutting down gracefully...');
  await disconnectPrisma();
  await fastify.close();
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

    const port = process.env.PORT ? parseInt(process.env.PORT) : 3000;
    const host = process.env.HOST || '0.0.0.0';

    await fastify.listen({ port, host });
    console.log(`🚀 Server is running on http://${host}:${port}`);
    console.log(`📊 Using Prisma ORM for database operations`);
  } catch (err) {
    fastify.log.error(err);
    await disconnectPrisma();
    process.exit(1);
  }
};

start();
