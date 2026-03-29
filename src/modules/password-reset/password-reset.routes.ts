import type { FastifyInstance } from 'fastify';

import {
  serializerCompiler,
  validatorCompiler,
  type ZodTypeProvider,
} from 'fastify-type-provider-zod';

import { passwordResetController } from './password-reset.controller.js';
import {
  errorResponseSchema,
  forgotPasswordSchema,
  messageResponseSchema,
  resetPasswordSchema,
} from './password-reset.schema.js';

export async function passwordResetRoutes(fastify: FastifyInstance) {
  // Set up Zod validation and serialization
  fastify.setValidatorCompiler(validatorCompiler);
  fastify.setSerializerCompiler(serializerCompiler);

  // Forgot password (3 attempts/minute)
  fastify.withTypeProvider<ZodTypeProvider>().post(
    '/forgot-password',
    {
      config: {
        rateLimit: { max: 3, timeWindow: '1 minute' },
      },
      schema: {
        body: forgotPasswordSchema,
        response: {
          200: messageResponseSchema,
        },
      },
    },
    passwordResetController.forgotPassword.bind(passwordResetController)
  );

  // Reset password (5 attempts/minute)
  fastify.withTypeProvider<ZodTypeProvider>().post(
    '/reset-password',
    {
      config: {
        rateLimit: { max: 5, timeWindow: '1 minute' },
      },
      schema: {
        body: resetPasswordSchema,
        response: {
          200: messageResponseSchema,
          400: errorResponseSchema,
        },
      },
    },
    passwordResetController.resetPassword.bind(passwordResetController)
  );
}
