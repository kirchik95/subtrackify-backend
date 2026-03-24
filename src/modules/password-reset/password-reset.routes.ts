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

  // Forgot password
  fastify.withTypeProvider<ZodTypeProvider>().post(
    '/forgot-password',
    {
      schema: {
        body: forgotPasswordSchema,
        response: {
          200: messageResponseSchema,
        },
      },
    },
    passwordResetController.forgotPassword.bind(passwordResetController)
  );

  // Reset password
  fastify.withTypeProvider<ZodTypeProvider>().post(
    '/reset-password',
    {
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
