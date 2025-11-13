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
      schema: {
        params: subscriptionIdJsonSchema,
      },
    },
    subscriptionsController.delete.bind(subscriptionsController)
  );
}
