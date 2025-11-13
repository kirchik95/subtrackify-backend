import type { FastifyInstance } from 'fastify';

import { authController } from './auth.controller.js';
import { loginSchema, registerSchema } from './auth.schema.js';

export async function authRoutes(fastify: FastifyInstance) {
  // Register
  fastify.post(
    '/register',
    {
      schema: {
        body: registerSchema,
        response: {
          201: {
            type: 'object',
            properties: {
              success: { type: 'boolean' },
              data: { type: 'object' },
              message: { type: 'string' },
            },
          },
        },
      },
    },
    authController.register.bind(authController)
  );

  // Login
  fastify.post(
    '/login',
    {
      schema: {
        body: loginSchema,
        response: {
          200: {
            type: 'object',
            properties: {
              success: { type: 'boolean' },
              data: { type: 'object' },
              message: { type: 'string' },
            },
          },
        },
      },
    },
    authController.login.bind(authController)
  );

  // Get current user (protected)
  fastify.get('/me', authController.me.bind(authController));
}
