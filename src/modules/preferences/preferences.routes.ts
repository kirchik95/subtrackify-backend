import type { FastifyInstance } from 'fastify';

import {
  serializerCompiler,
  validatorCompiler,
  type ZodTypeProvider,
} from 'fastify-type-provider-zod';

import { preferencesController } from './preferences.controller.js';
import {
  errorResponseSchema,
  preferencesResponseSchema,
  updatePreferencesSchema,
} from './preferences.schema.js';

export async function preferencesRoutes(fastify: FastifyInstance) {
  fastify.setValidatorCompiler(validatorCompiler);
  fastify.setSerializerCompiler(serializerCompiler);

  fastify.withTypeProvider<ZodTypeProvider>().get(
    '/',
    {
      onRequest: [fastify.authenticate],
      schema: {
        response: {
          200: preferencesResponseSchema,
          500: errorResponseSchema,
        },
      },
    },
    preferencesController.getPreferences.bind(preferencesController)
  );

  fastify.withTypeProvider<ZodTypeProvider>().put(
    '/',
    {
      onRequest: [fastify.authenticate],
      schema: {
        body: updatePreferencesSchema,
        response: {
          200: preferencesResponseSchema,
          500: errorResponseSchema,
        },
      },
    },
    preferencesController.updatePreferences.bind(preferencesController)
  );
}
