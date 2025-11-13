import type { FastifyInstance } from 'fastify';

import {
  serializerCompiler,
  validatorCompiler,
  type ZodTypeProvider,
} from 'fastify-type-provider-zod';

import { subscriptionsController } from './subscriptions.controller.js';
import {
  createSubscriptionSchema,
  deleteSubscriptionResponseSchema,
  errorResponseSchema,
  filterSubscriptionsSchema,
  subscriptionIdSchema,
  subscriptionResponseSchema,
  subscriptionsListResponseSchema,
  updateSubscriptionSchema,
} from './subscriptions.schema.js';

export async function subscriptionsRoutes(fastify: FastifyInstance) {
  // Set up Zod validation and serialization
  fastify.setValidatorCompiler(validatorCompiler);
  fastify.setSerializerCompiler(serializerCompiler);

  // Get all subscriptions (with optional filters)
  fastify.withTypeProvider<ZodTypeProvider>().get(
    '/',
    {
      onRequest: [fastify.authenticate],
      schema: {
        querystring: filterSubscriptionsSchema,
        response: {
          200: subscriptionsListResponseSchema,
          500: errorResponseSchema,
        },
      },
    },
    subscriptionsController.getAll.bind(subscriptionsController)
  );

  // Get subscription by ID
  fastify.withTypeProvider<ZodTypeProvider>().get(
    '/:id',
    {
      onRequest: [fastify.authenticate],
      schema: {
        params: subscriptionIdSchema,
        response: {
          200: subscriptionResponseSchema,
          404: errorResponseSchema,
          500: errorResponseSchema,
        },
      },
    },
    subscriptionsController.getById.bind(subscriptionsController)
  );

  // Create subscription
  fastify.withTypeProvider<ZodTypeProvider>().post(
    '/',
    {
      onRequest: [fastify.authenticate],
      schema: {
        body: createSubscriptionSchema,
        response: {
          201: subscriptionResponseSchema,
          500: errorResponseSchema,
        },
      },
    },
    subscriptionsController.create.bind(subscriptionsController)
  );

  // Update subscription
  fastify.withTypeProvider<ZodTypeProvider>().put(
    '/:id',
    {
      onRequest: [fastify.authenticate],
      schema: {
        params: subscriptionIdSchema,
        body: updateSubscriptionSchema,
        response: {
          200: subscriptionResponseSchema,
          404: errorResponseSchema,
          500: errorResponseSchema,
        },
      },
    },
    subscriptionsController.update.bind(subscriptionsController)
  );

  // Delete subscription
  fastify.withTypeProvider<ZodTypeProvider>().delete(
    '/:id',
    {
      onRequest: [fastify.authenticate],
      schema: {
        params: subscriptionIdSchema,
        response: {
          200: deleteSubscriptionResponseSchema,
          404: errorResponseSchema,
          500: errorResponseSchema,
        },
      },
    },
    subscriptionsController.delete.bind(subscriptionsController)
  );
}
