import type { FastifyReply, FastifyRequest } from 'fastify';

import type {
  CategoryIdParams,
  CreateCategoryInput,
  UpdateCategoryInput,
} from './categories.schema.js';
import { categoriesService } from './categories.service.js';

export class CategoriesController {
  async getAll(request: FastifyRequest, reply: FastifyReply) {
    try {
      const userId = request.user!.userId;
      const categories = await categoriesService.getAll(userId);

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

  async create(request: FastifyRequest<{ Body: CreateCategoryInput }>, reply: FastifyReply) {
    try {
      const userId = request.user!.userId;
      const category = await categoriesService.create(userId, request.body);

      return reply.status(201).send({
        success: true,
        data: category,
      });
    } catch (error) {
      request.log.error(error);
      const message = error instanceof Error ? error.message : 'Failed to create category';
      const status = message.includes('Unique constraint') ? 409 : 400;
      return reply.status(status).send({
        success: false,
        error: message.includes('Unique constraint')
          ? 'Category with this name already exists'
          : message,
      });
    }
  }

  async update(
    request: FastifyRequest<{ Params: CategoryIdParams; Body: UpdateCategoryInput }>,
    reply: FastifyReply
  ) {
    try {
      const userId = request.user!.userId;
      const id = parseInt(request.params.id, 10);
      const category = await categoriesService.update(id, userId, request.body);

      return reply.status(200).send({
        success: true,
        data: category,
      });
    } catch (error) {
      request.log.error(error);
      const message = error instanceof Error ? error.message : 'Failed to update category';
      return reply.status(message === 'Category not found' ? 404 : 400).send({
        success: false,
        error: message,
      });
    }
  }

  async delete(request: FastifyRequest<{ Params: CategoryIdParams }>, reply: FastifyReply) {
    try {
      const userId = request.user!.userId;
      const id = parseInt(request.params.id, 10);
      const result = await categoriesService.delete(id, userId);

      return reply.status(200).send({
        success: true,
        message: result.message,
      });
    } catch (error) {
      request.log.error(error);
      const message = error instanceof Error ? error.message : 'Failed to delete category';
      return reply.status(message === 'Category not found' ? 404 : 500).send({
        success: false,
        error: message,
      });
    }
  }
}

export const categoriesController = new CategoriesController();
