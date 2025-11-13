import type { FastifyInstance } from 'fastify';

import { categoriesController } from './categories.controller.js';
import { categoriesQuerySchema } from './categories.schema.js';

export async function categoriesRoutes(fastify: FastifyInstance) {
  // Get all categories
  fastify.get(
    '/',
    {
      schema: {
        querystring: categoriesQuerySchema,
      },
    },
    categoriesController.getAll.bind(categoriesController)
  );
}
