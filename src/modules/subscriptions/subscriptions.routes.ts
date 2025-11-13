import type { FastifyInstance } from 'fastify';

import { subscriptionsController } from './subscriptions.controller.js';
import {
  createSubscriptionSchema,
  filterSubscriptionsSchema,
  subscriptionIdSchema,
  updateSubscriptionSchema,
} from './subscriptions.schema.js';

export async function subscriptionsRoutes(fastify: FastifyInstance) {
  // Get all subscriptions (with optional filters)
  fastify.get(
    '/',
    {
      schema: {
        querystring: filterSubscriptionsSchema,
      },
    },
    subscriptionsController.getAll.bind(subscriptionsController)
  );

  // Get subscription by ID
  fastify.get(
    '/:id',
    {
      schema: {
        params: subscriptionIdSchema,
      },
    },
    subscriptionsController.getById.bind(subscriptionsController)
  );

  // Create subscription
  fastify.post(
    '/',
    {
      schema: {
        body: createSubscriptionSchema,
      },
    },
    subscriptionsController.create.bind(subscriptionsController)
  );

  // Update subscription
  fastify.put(
    '/:id',
    {
      schema: {
        params: subscriptionIdSchema,
        body: updateSubscriptionSchema,
      },
    },
    subscriptionsController.update.bind(subscriptionsController)
  );

  // Delete subscription
  fastify.delete(
    '/:id',
    {
      schema: {
        params: subscriptionIdSchema,
      },
    },
    subscriptionsController.delete.bind(subscriptionsController)
  );
}
