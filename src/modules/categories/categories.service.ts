import prisma from '@db/prisma.js';

import type { CreateCategoryInput, UpdateCategoryInput } from './categories.schema.js';

export class CategoriesService {
  /**
   * Get all categories for a user with subscription count
   */
  async getAll(userId: number) {
    return prisma.category.findMany({
      where: { userId },
      include: { _count: { select: { subscriptions: true } } },
      orderBy: { name: 'asc' },
    });
  }

  /**
   * Create a new category
   */
  async create(userId: number, data: CreateCategoryInput) {
    return prisma.category.create({
      data: { ...data, userId },
    });
  }

  /**
   * Update a category
   */
  async update(id: number, userId: number, data: UpdateCategoryInput) {
    const category = await prisma.category.findFirst({
      where: { id, userId },
    });

    if (!category) {
      throw new Error('Category not found');
    }

    return prisma.category.update({
      where: { id },
      data,
    });
  }

  /**
   * Delete a category (sets categoryId to null on subscriptions)
   */
  async delete(id: number, userId: number) {
    const category = await prisma.category.findFirst({
      where: { id, userId },
    });

    if (!category) {
      throw new Error('Category not found');
    }

    await prisma.category.delete({ where: { id } });
    return { message: 'Category deleted successfully' };
  }
}

export const categoriesService = new CategoriesService();
