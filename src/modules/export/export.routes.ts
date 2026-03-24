import type { FastifyInstance } from 'fastify';

import {
  serializerCompiler,
  validatorCompiler,
  type ZodTypeProvider,
} from 'fastify-type-provider-zod';

import { exportController } from './export.controller.js';
import { errorResponseSchema, importResponseSchema } from './export.schema.js';

export async function exportRoutes(fastify: FastifyInstance) {
  fastify.setValidatorCompiler(validatorCompiler);
  fastify.setSerializerCompiler(serializerCompiler);

  // GET /export/csv — export subscriptions as CSV file
  fastify.get(
    '/export/csv',
    {
      onRequest: [fastify.authenticate],
    },
    exportController.exportCsv.bind(exportController)
  );

  // POST /import — import subscriptions from CSV file
  fastify.withTypeProvider<ZodTypeProvider>().post(
    '/import',
    {
      onRequest: [fastify.authenticate],
      schema: {
        response: {
          200: importResponseSchema,
          400: errorResponseSchema,
          500: errorResponseSchema,
        },
      },
    },
    exportController.importCsv.bind(exportController)
  );
}
