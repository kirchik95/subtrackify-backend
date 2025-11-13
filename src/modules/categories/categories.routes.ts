import type { FastifyInstance } from 'fastify';

import { categoriesController } from './categories.controller.js';
import { categoriesQueryJsonSchema } from './categories.schema.js';

export async function categoriesRoutes(fastify: FastifyInstance) {
  // Get all categories
  fastify.get(
    '/',
    {
      schema: {
        querystring: categoriesQueryJsonSchema,
      },
    },
    categoriesController.getAll.bind(categoriesController)
  );
}
