import type { FastifyReply, FastifyRequest } from 'fastify';

import type { CategoriesQuery } from './categories.schema.js';
import { categoriesService } from './categories.service.js';

export class CategoriesController {
  /**
   * Get all categories
   */
  async getAll(request: FastifyRequest<{ Querystring: CategoriesQuery }>, reply: FastifyReply) {
    try {
      const userId = request.user!.userId;
      const includeCount = request.query.includeCount || false;
      const categories = await categoriesService.getAll(userId, includeCount);

      return reply.status(200).send({
        success: true,
        data: categories,
      });
    } catch (error) {
      request.log.error(error);
      return reply.status(500).send({
        success: false,
        error: 'Failed to fetch categories',
      });
    }
  }
}

export const categoriesController = new CategoriesController();
