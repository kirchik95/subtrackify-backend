import type { FastifyReply, FastifyRequest } from 'fastify';

import { analyticsService } from './analytics.service.js';

export class AnalyticsController {
  /**
   * Get subscription spending summary
   */
  async getSummary(request: FastifyRequest, reply: FastifyReply) {
    try {
      const userId = request.user!.userId;
      const data = await analyticsService.getSummary(userId);

      return reply.status(200).send({
        success: true,
        data,
      });
    } catch (error) {
      request.log.error(error);
      return reply.status(500).send({
        success: false,
        error: 'Failed to fetch analytics summary',
      });
    }
  }

  /**
   * Get monthly spending history
   */
  async getSpendingHistory(request: FastifyRequest, reply: FastifyReply) {
    try {
      const userId = request.user!.userId;
      const query = request.query as { months?: number };
      const months = query.months ?? 12;
      const data = await analyticsService.getSpendingHistory(userId, months);

      return reply.status(200).send({
        success: true,
        data,
      });
    } catch (error) {
      request.log.error(error);
      return reply.status(500).send({
        success: false,
        error: 'Failed to fetch spending history',
      });
    }
  }

  /**
   * Get spending breakdown by category
   */
  async getByCategory(request: FastifyRequest, reply: FastifyReply) {
    try {
      const userId = request.user!.userId;
      const data = await analyticsService.getByCategory(userId);

      return reply.status(200).send({
        success: true,
        data,
      });
    } catch (error) {
      request.log.error(error);
      return reply.status(500).send({
        success: false,
        error: 'Failed to fetch category analytics',
      });
    }
  }
}

export const analyticsController = new AnalyticsController();
