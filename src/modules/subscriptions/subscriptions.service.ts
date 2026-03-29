import prisma from '@db/prisma.js';

import type {
  CreateSubscriptionInput,
  FilterSubscriptionsQuery,
  UpdateSubscriptionInput,
} from './subscriptions.schema.js';

const includeCategory = { category: { select: { id: true, name: true, icon: true, color: true } } };

export class SubscriptionsService {
  /**
   * Get all subscriptions for a user
   */
  async getAll(userId: number, filters?: FilterSubscriptionsQuery) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const where: Record<string, any> = { userId };

    if (filters?.categoryId) {
      where.categoryId = filters.categoryId;
    }

    if (filters?.status) {
      where.status = filters.status;
    }

    if (filters?.minPrice !== undefined || filters?.maxPrice !== undefined) {
      where.price = {};
      if (filters?.minPrice !== undefined) {
        where.price.gte = filters.minPrice;
      }
      if (filters?.maxPrice !== undefined) {
        where.price.lte = filters.maxPrice;
      }
    }

    if (filters?.search) {
      where.name = { contains: filters.search, mode: 'insensitive' };
    }

    const page = filters?.page ?? 1;
    const limit = filters?.limit ?? 20;
    const skip = (page - 1) * limit;

    const [subscriptions, total] = await Promise.all([
      prisma.subscription.findMany({
        where,
        include: includeCategory,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.subscription.count({ where }),
    ]);

    return { subscriptions, total, page, limit };
  }

  /**
   * Get subscription by ID
   */
  async getById(id: number, userId: number) {
    const subscription = await prisma.subscription.findFirst({
      where: { id, userId },
      include: includeCategory,
    });

    if (!subscription) {
      throw new Error('Subscription not found');
    }

    return subscription;
  }

  /**
   * Create new subscription
   */
  async create(userId: number, data: CreateSubscriptionInput) {
    return prisma.subscription.create({
      data: {
        ...data,
        nextBillingDate: new Date(data.nextBillingDate),
        userId,
      },
      include: includeCategory,
    });
  }

  /**
   * Update subscription
   */
  async update(id: number, userId: number, data: UpdateSubscriptionInput) {
    await this.getById(id, userId);

    const updateData: Record<string, unknown> = { ...data };
    if (data.nextBillingDate) {
      updateData.nextBillingDate = new Date(data.nextBillingDate);
    }

    return prisma.subscription.update({
      where: { id },
      data: updateData,
      include: includeCategory,
    });
  }

  /**
   * Delete subscription
   */
  async delete(id: number, userId: number) {
    await this.getById(id, userId);

    await prisma.subscription.delete({
      where: { id },
    });

    return { message: 'Subscription deleted successfully' };
  }
}

export const subscriptionsService = new SubscriptionsService();
