import prisma from '@db/prisma.js';

import type {
  CreateSubscriptionInput,
  FilterSubscriptionsQuery,
  UpdateSubscriptionInput,
} from './subscriptions.schema.js';

export class SubscriptionsService {
  /**
   * Get all subscriptions for a user
   */
  async getAll(userId: number, filters?: FilterSubscriptionsQuery) {
    const where: {
      userId: number;
      category?: string;
      status?: string;
      price?: {
        gte?: number;
        lte?: number;
      };
    } = { userId };

    if (filters?.category) {
      where.category = filters.category;
    }

    if (filters?.status) {
      where.status = filters.status;
    }

    if (filters?.minPrice !== undefined || filters?.maxPrice !== undefined) {
      where.price = {};
      if (filters.minPrice !== undefined) {
        where.price.gte = filters.minPrice;
      }
      if (filters.maxPrice !== undefined) {
        where.price.lte = filters.maxPrice;
      }
    }

    return prisma.subscription.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Get subscription by ID
   */
  async getById(id: number, userId: number) {
    const subscription = await prisma.subscription.findFirst({
      where: { id, userId },
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
    });
  }

  /**
   * Update subscription
   */
  async update(id: number, userId: number, data: UpdateSubscriptionInput) {
    // Check if subscription exists and belongs to user
    await this.getById(id, userId);

    const updateData: Record<string, unknown> = { ...data };
    if (data.nextBillingDate) {
      updateData.nextBillingDate = new Date(data.nextBillingDate);
    }

    return prisma.subscription.update({
      where: { id },
      data: updateData,
    });
  }

  /**
   * Delete subscription
   */
  async delete(id: number, userId: number) {
    // Check if subscription exists and belongs to user
    await this.getById(id, userId);

    await prisma.subscription.delete({
      where: { id },
    });

    return { message: 'Subscription deleted successfully' };
  }
}

export const subscriptionsService = new SubscriptionsService();
