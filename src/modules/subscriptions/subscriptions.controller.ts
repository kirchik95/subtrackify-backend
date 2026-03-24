import type { FastifyReply, FastifyRequest } from 'fastify';

import type {
  CreateSubscriptionInput,
  FilterSubscriptionsQuery,
  SubscriptionIdParams,
  UpdateSubscriptionInput,
} from './subscriptions.schema.js';
import { subscriptionsService } from './subscriptions.service.js';

export class SubscriptionsController {
  /**
   * Get all subscriptions
   */
  async getAll(request: FastifyRequest, reply: FastifyReply) {
    try {
      const userId = request.user!.userId;
      const result = await subscriptionsService.getAll(
        userId,
        request.query as FilterSubscriptionsQuery
      );

      return reply.status(200).send({
        success: true,
        data: result.subscriptions,
        total: result.total,
        page: result.page,
        limit: result.limit,
      });
    } catch (error) {
      request.log.error(error);
      return reply.status(500).send({
        success: false,
        error: 'Failed to fetch subscriptions',
      });
    }
  }

  /**
   * Get subscription by ID
   */
  async getById(request: FastifyRequest, reply: FastifyReply) {
    try {
      const userId = request.user!.userId;
      const { id } = request.params as SubscriptionIdParams;
      const subscription = await subscriptionsService.getById(parseInt(id), userId);

      return reply.status(200).send({
        success: true,
        data: subscription,
      });
    } catch (error) {
      request.log.error(error);
      const message = error instanceof Error ? error.message : 'Failed to fetch subscription';
      const status = message === 'Subscription not found' ? 404 : 500;

      return reply.status(status).send({
        success: false,
        error: message,
      });
    }
  }

  /**
   * Create subscription
   */
  async create(request: FastifyRequest, reply: FastifyReply) {
    try {
      const userId = request.user!.userId;
      const subscription = await subscriptionsService.create(
        userId,
        request.body as CreateSubscriptionInput
      );

      return reply.status(201).send({
        success: true,
        data: subscription,
        message: 'Subscription created successfully',
      });
    } catch (error) {
      request.log.error(error);
      return reply.status(500).send({
        success: false,
        error: 'Failed to create subscription',
      });
    }
  }

  /**
   * Update subscription
   */
  async update(request: FastifyRequest, reply: FastifyReply) {
    try {
      const userId = request.user!.userId;
      const { id } = request.params as SubscriptionIdParams;
      const subscription = await subscriptionsService.update(
        parseInt(id),
        userId,
        request.body as UpdateSubscriptionInput
      );

      return reply.status(200).send({
        success: true,
        data: subscription,
        message: 'Subscription updated successfully',
      });
    } catch (error) {
      request.log.error(error);
      const message = error instanceof Error ? error.message : 'Failed to update subscription';
      const status = message === 'Subscription not found' ? 404 : 500;

      return reply.status(status).send({
        success: false,
        error: message,
      });
    }
  }

  /**
   * Delete subscription
   */
  async delete(request: FastifyRequest, reply: FastifyReply) {
    try {
      const userId = request.user!.userId;
      const { id } = request.params as SubscriptionIdParams;
      const result = await subscriptionsService.delete(parseInt(id), userId);

      return reply.status(200).send({
        success: true,
        message: result.message,
      });
    } catch (error) {
      request.log.error(error);
      const message = error instanceof Error ? error.message : 'Failed to delete subscription';
      const status = message === 'Subscription not found' ? 404 : 500;

      return reply.status(status).send({
        success: false,
        error: message,
      });
    }
  }
}

export const subscriptionsController = new SubscriptionsController();
