import type { FastifyInstance } from 'fastify';

import { subscriptionsController } from './subscriptions.controller.js';
import {
  createSubscriptionJsonSchema,
  filterSubscriptionsJsonSchema,
  subscriptionIdJsonSchema,
  updateSubscriptionJsonSchema,
} from './subscriptions.schema.js';

export async function subscriptionsRoutes(fastify: FastifyInstance) {
  // Get all subscriptions (with optional filters)
  fastify.get(
    '/',
    {
      onRequest: [fastify.authenticate],
      schema: {
        querystring: filterSubscriptionsJsonSchema,
      },
    },
    subscriptionsController.getAll.bind(subscriptionsController)
  );

  // Get subscription by ID
  fastify.get(
    '/:id',
    {
      onRequest: [fastify.authenticate],
      schema: {
        params: subscriptionIdJsonSchema,
      },
    },
    subscriptionsController.getById.bind(subscriptionsController)
  );

  // Create subscription
  fastify.post(
    '/',
    {
      onRequest: [fastify.authenticate],
      schema: {
        body: createSubscriptionJsonSchema,
      },
    },
    subscriptionsController.create.bind(subscriptionsController)
  );

  // Update subscription
  fastify.put(
    '/:id',
    {
      onRequest: [fastify.authenticate],
      schema: {
        params: subscriptionIdJsonSchema,
        body: updateSubscriptionJsonSchema,
      },
    },
    subscriptionsController.update.bind(subscriptionsController)
  );

  // Delete subscription
  fastify.delete(
    '/:id',
    {
      onRequest: [fastify.authenticate],
      schema: {
        params: subscriptionIdJsonSchema,
      },
    },
    subscriptionsController.delete.bind(subscriptionsController)
  );
}
