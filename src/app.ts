import Fastify from 'fastify';

import prisma from '@db/prisma.js';
import { authRoutes } from '@modules/auth/auth.routes.js';
import { categoriesRoutes } from '@modules/categories/categories.routes.js';
import { profileRoutes } from '@modules/profile/profile.routes.js';
import { subscriptionsRoutes } from '@modules/subscriptions/subscriptions.routes.js';
import authPlugin from '@plugins/auth.plugin.js';

export async function buildApp() {
  const fastify = Fastify({
    logger: true,
  });

  // Register plugins
  await fastify.register(authPlugin);

  // Health check endpoint
  fastify.get('/health', async () => {
    try {
      await prisma.$queryRaw`SELECT 1`;
      return {
        status: 'ok',
        timestamp: new Date().toISOString(),
        database: 'connected',
        orm: 'prisma',
      };
    } catch {
      return {
        status: 'error',
        timestamp: new Date().toISOString(),
        database: 'disconnected',
      };
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

  // Register public routes (no auth required)
  await fastify.register(authRoutes, { prefix: '/api/auth' });

  // Register protected routes (auth required)
  await fastify.register(async (protectedInstance) => {
    // Add authentication hook for all routes in this scope
    protectedInstance.addHook('onRequest', fastify.authenticate);

    // Register protected routes
    await protectedInstance.register(subscriptionsRoutes, { prefix: '/api/subscriptions' });
    await protectedInstance.register(categoriesRoutes, { prefix: '/api/categories' });
    await protectedInstance.register(profileRoutes, { prefix: '/api/profile' });
  });

  return fastify;
}
