import type { FastifyInstance } from 'fastify';

import {
  serializerCompiler,
  validatorCompiler,
  type ZodTypeProvider,
} from 'fastify-type-provider-zod';

import { avatarController } from './avatar.controller.js';
import {
  avatarDeleteResponseSchema,
  avatarErrorResponseSchema,
  avatarUploadResponseSchema,
} from './avatar.schema.js';

export async function avatarRoutes(fastify: FastifyInstance) {
  // Set up Zod validation and serialization
  fastify.setValidatorCompiler(validatorCompiler);
  fastify.setSerializerCompiler(serializerCompiler);

  // Upload avatar (multipart — no body schema)
  fastify.withTypeProvider<ZodTypeProvider>().post(
    '/avatar',
    {
      onRequest: [fastify.authenticate],
      schema: {
        response: {
          200: avatarUploadResponseSchema,
          400: avatarErrorResponseSchema,
          500: avatarErrorResponseSchema,
        },
      },
    },
    avatarController.uploadAvatar.bind(avatarController)
  );

  // Delete avatar
  fastify.withTypeProvider<ZodTypeProvider>().delete(
    '/avatar',
    {
      onRequest: [fastify.authenticate],
      schema: {
        response: {
          200: avatarDeleteResponseSchema,
          500: avatarErrorResponseSchema,
        },
      },
    },
    avatarController.deleteAvatar.bind(avatarController)
  );
}
