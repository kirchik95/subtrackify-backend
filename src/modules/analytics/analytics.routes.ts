import type { FastifyInstance } from 'fastify';

import {
  serializerCompiler,
  validatorCompiler,
  type ZodTypeProvider,
} from 'fastify-type-provider-zod';

import { analyticsController } from './analytics.controller.js';
import {
  byCategoryResponseSchema,
  errorResponseSchema,
  spendingHistoryQuerySchema,
  spendingHistoryResponseSchema,
  summaryResponseSchema,
} from './analytics.schema.js';

export async function analyticsRoutes(fastify: FastifyInstance) {
  // Set up Zod validation and serialization
  fastify.setValidatorCompiler(validatorCompiler);
  fastify.setSerializerCompiler(serializerCompiler);

  // GET /summary — spending summary with month-over-month comparison
  fastify.withTypeProvider<ZodTypeProvider>().get(
    '/summary',
    {
      onRequest: [fastify.authenticate],
      schema: {
        response: {
          200: summaryResponseSchema,
          500: errorResponseSchema,
        },
      },
    },
    analyticsController.getSummary.bind(analyticsController)
  );

  // GET /spending-history — monthly spending over time
  fastify.withTypeProvider<ZodTypeProvider>().get(
    '/spending-history',
    {
      onRequest: [fastify.authenticate],
      schema: {
        querystring: spendingHistoryQuerySchema,
        response: {
          200: spendingHistoryResponseSchema,
          500: errorResponseSchema,
        },
      },
    },
    analyticsController.getSpendingHistory.bind(analyticsController)
  );

  // GET /by-category — spending breakdown by category
  fastify.withTypeProvider<ZodTypeProvider>().get(
    '/by-category',
    {
      onRequest: [fastify.authenticate],
      schema: {
        response: {
          200: byCategoryResponseSchema,
          500: errorResponseSchema,
        },
      },
    },
    analyticsController.getByCategory.bind(analyticsController)
  );
}
