import type { FastifyReply, FastifyRequest } from 'fastify';

import prisma from '@db/prisma.js';

import { analyticsService } from './analytics.service.js';

async function getUserCurrency(userId: number): Promise<string> {
  const prefs = await prisma.userPreferences.findUnique({ where: { userId } });
  return prefs?.currency || 'USD';
}

export class AnalyticsController {
  /**
   * Get subscription spending summary
   */
  async getSummary(request: FastifyRequest, reply: FastifyReply) {
    try {
      const userId = request.user!.userId;
      const currency = await getUserCurrency(userId);
      const data = await analyticsService.getSummary(userId, currency);

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
      const currency = await getUserCurrency(userId);
      const data = await analyticsService.getSpendingHistory(userId, months, currency);

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
      const currency = await getUserCurrency(userId);
      const data = await analyticsService.getByCategory(userId, currency);

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
