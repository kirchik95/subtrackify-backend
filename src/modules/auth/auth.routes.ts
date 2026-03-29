import type { FastifyInstance } from 'fastify';

import {
  serializerCompiler,
  validatorCompiler,
  type ZodTypeProvider,
} from 'fastify-type-provider-zod';

import { authController } from './auth.controller.js';
import {
  authResponseSchema,
  loginSchema,
  meResponseSchema,
  registerSchema,
} from './auth.schema.js';

export async function authRoutes(fastify: FastifyInstance) {
  // Set up Zod validation and serialization
  fastify.setValidatorCompiler(validatorCompiler);
  fastify.setSerializerCompiler(serializerCompiler);

  // Register (3 attempts/minute)
  fastify.withTypeProvider<ZodTypeProvider>().post(
    '/register',
    {
      config: {
        rateLimit: { max: 3, timeWindow: '1 minute' },
      },
      schema: {
        body: registerSchema,
        response: {
          201: authResponseSchema,
        },
      },
    },
    authController.register.bind(authController)
  );

  // Login (5 attempts/minute)
  fastify.withTypeProvider<ZodTypeProvider>().post(
    '/login',
    {
      config: {
        rateLimit: { max: 5, timeWindow: '1 minute' },
      },
      schema: {
        body: loginSchema,
        response: {
          200: authResponseSchema,
        },
      },
    },
    authController.login.bind(authController)
  );

  // Get current user (protected)
  fastify.withTypeProvider<ZodTypeProvider>().get(
    '/me',
    {
      onRequest: [fastify.authenticate],
      schema: {
        response: {
          200: meResponseSchema,
        },
      },
    },
    authController.me.bind(authController)
  );
}
