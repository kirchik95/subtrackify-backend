import type { FastifyInstance } from 'fastify';

import {
  serializerCompiler,
  validatorCompiler,
  type ZodTypeProvider,
} from 'fastify-type-provider-zod';

import { categoriesController } from './categories.controller.js';
import {
  categoriesListResponseSchema,
  categoryIdSchema,
  categoryResponseSchema,
  createCategorySchema,
  errorResponseSchema,
  messageResponseSchema,
  updateCategorySchema,
} from './categories.schema.js';

export async function categoriesRoutes(fastify: FastifyInstance) {
  fastify.setValidatorCompiler(validatorCompiler);
  fastify.setSerializerCompiler(serializerCompiler);

  // Get all categories
  fastify.withTypeProvider<ZodTypeProvider>().get(
    '/',
    {
      schema: {
        response: { 200: categoriesListResponseSchema },
      },
    },
    categoriesController.getAll.bind(categoriesController)
  );

  // Create category
  fastify.withTypeProvider<ZodTypeProvider>().post(
    '/',
    {
      schema: {
        body: createCategorySchema,
        response: {
          201: categoryResponseSchema,
          409: errorResponseSchema,
        },
      },
    },
    categoriesController.create.bind(categoriesController)
  );

  // Update category
  fastify.withTypeProvider<ZodTypeProvider>().put(
    '/:id',
    {
      schema: {
        params: categoryIdSchema,
        body: updateCategorySchema,
        response: {
          200: categoryResponseSchema,
          404: errorResponseSchema,
        },
      },
    },
    categoriesController.update.bind(categoriesController)
  );

  // Delete category
  fastify.withTypeProvider<ZodTypeProvider>().delete(
    '/:id',
    {
      schema: {
        params: categoryIdSchema,
        response: {
          200: messageResponseSchema,
          404: errorResponseSchema,
        },
      },
    },
    categoriesController.delete.bind(categoriesController)
  );
}
