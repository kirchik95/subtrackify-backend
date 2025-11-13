import prisma from '@db/prisma.js';
import { uniq } from 'lodash-es';

export class CategoriesService {
  /**
   * Get all unique categories for a user
   */
  async getAll(userId: number, includeCount = false) {
    const subscriptions = await prisma.subscription.findMany({
      where: { userId },
      select: { category: true },
    });

    const categories = uniq(
      subscriptions
        .map((s) => s.category)
        .filter((cat): cat is string => cat !== null && cat !== undefined)
    );

    if (!includeCount) {
      return categories.map((name) => ({ name }));
    }

    // Get count for each category
    const categoriesWithCount = await Promise.all(
      categories.map(async (name) => {
        const count = await prisma.subscription.count({
          where: { userId, category: name },
        });
        return { name, count };
      })
    );

    return categoriesWithCount;
  }
}

export const categoriesService = new CategoriesService();
