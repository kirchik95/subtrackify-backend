import path from 'node:path';
import { fileURLToPath } from 'node:url';
import Fastify from 'fastify';
import multipart from '@fastify/multipart';
import fastifyStatic from '@fastify/static';

import prisma from '@db/prisma.js';
import { analyticsRoutes } from '@modules/analytics/analytics.routes.js';
import { authRoutes } from '@modules/auth/auth.routes.js';
import { avatarRoutes } from '@modules/avatar/avatar.routes.js';
import { categoriesRoutes } from '@modules/categories/categories.routes.js';
import { exportRoutes } from '@modules/export/export.routes.js';
import { passwordResetRoutes } from '@modules/password-reset/password-reset.routes.js';
import { preferencesRoutes } from '@modules/preferences/preferences.routes.js';
import { profileRoutes } from '@modules/profile/profile.routes.js';
import { subscriptionsRoutes } from '@modules/subscriptions/subscriptions.routes.js';
import authPlugin from '@plugins/auth.plugin.js';

export async function buildApp() {
  const fastify = Fastify({
    logger: true,
  });

  // Register plugins
  await fastify.register(authPlugin);

  await fastify.register(multipart, {
    limits: { fileSize: 5 * 1024 * 1024 },
  });

  const __dirname = path.dirname(fileURLToPath(import.meta.url));
  await fastify.register(fastifyStatic, {
    root: path.join(__dirname, '..', 'uploads'),
    prefix: '/uploads/',
    decorateReply: false,
  });

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
  await fastify.register(passwordResetRoutes, { prefix: '/api/auth' });

  // Register protected routes (auth required)
  await fastify.register(async (protectedInstance) => {
    // Add authentication hook for all routes in this scope
    protectedInstance.addHook('onRequest', fastify.authenticate);

    // Register protected routes
    await protectedInstance.register(subscriptionsRoutes, { prefix: '/api/subscriptions' });
    await protectedInstance.register(categoriesRoutes, { prefix: '/api/categories' });
    await protectedInstance.register(profileRoutes, { prefix: '/api/auth' });
    await protectedInstance.register(avatarRoutes, { prefix: '/api/auth' });
    await protectedInstance.register(preferencesRoutes, { prefix: '/api/user/preferences' });
    await protectedInstance.register(analyticsRoutes, { prefix: '/api/analytics' });
    await protectedInstance.register(exportRoutes, { prefix: '/api' });
  });

  return fastify;
}
