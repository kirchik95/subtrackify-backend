import type { FastifyInstance } from 'fastify';

import {
  serializerCompiler,
  validatorCompiler,
  type ZodTypeProvider,
} from 'fastify-type-provider-zod';

import { authController } from './auth.controller.js';
import {
  authResponseSchema,
  googleAuthSchema,
  loginSchema,
  meResponseSchema,
  messageResponseSchema,
  refreshTokenSchema,
  registerSchema,
  tokenResponseSchema,
  verifyEmailSchema,
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

  // Google OAuth (5 attempts/minute)
  fastify.withTypeProvider<ZodTypeProvider>().post(
    '/google',
    {
      config: {
        rateLimit: { max: 5, timeWindow: '1 minute' },
      },
      schema: {
        body: googleAuthSchema,
        response: {
          200: authResponseSchema,
        },
      },
    },
    authController.googleAuth.bind(authController)
  );

  // Verify email (public — token in body)
  fastify.withTypeProvider<ZodTypeProvider>().post(
    '/verify-email',
    {
      config: {
        rateLimit: { max: 5, timeWindow: '1 minute' },
      },
      schema: {
        body: verifyEmailSchema,
        response: {
          200: messageResponseSchema,
        },
      },
    },
    authController.verifyEmail.bind(authController)
  );

  // Refresh token (10 attempts/minute)
  fastify.withTypeProvider<ZodTypeProvider>().post(
    '/refresh',
    {
      config: {
        rateLimit: { max: 10, timeWindow: '1 minute' },
      },
      schema: {
        body: refreshTokenSchema,
        response: {
          200: tokenResponseSchema,
        },
      },
    },
    authController.refresh.bind(authController)
  );

  // Logout
  fastify.withTypeProvider<ZodTypeProvider>().post(
    '/logout',
    {
      schema: {
        body: refreshTokenSchema,
        response: {
          200: messageResponseSchema,
        },
      },
    },
    authController.logout.bind(authController)
  );

  // Send verification email (protected, 3/min)
  fastify.withTypeProvider<ZodTypeProvider>().post(
    '/send-verification',
    {
      onRequest: [fastify.authenticate],
      config: {
        rateLimit: { max: 3, timeWindow: '1 minute' },
      },
      schema: {
        response: {
          200: messageResponseSchema,
        },
      },
    },
    authController.sendVerification.bind(authController)
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
