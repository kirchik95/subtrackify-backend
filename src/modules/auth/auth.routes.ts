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

  // Register
  fastify.withTypeProvider<ZodTypeProvider>().post(
    '/register',
    {
      schema: {
        body: registerSchema,
        response: {
          201: authResponseSchema,
        },
      },
    },
    authController.register.bind(authController)
  );

  // Login
  fastify.withTypeProvider<ZodTypeProvider>().post(
    '/login',
    {
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
