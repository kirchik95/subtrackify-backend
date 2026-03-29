import prisma from '@db/prisma.js';
import { endOfMonth, format, startOfMonth, subMonths } from 'date-fns';

import { convert } from '../../utils/exchangeRates.js';

function normalizeToMonthly(price: number, billingCycle: string): number {
  switch (billingCycle) {
    case 'daily':
      return price * 30;
    case 'weekly':
      return price * (52 / 12);
    case 'monthly':
      return price;
    case 'yearly':
      return price / 12;
    default:
      return price;
  }
}

function round2(value: number): number {
  return Math.round(value * 100) / 100;
}

export class AnalyticsService {
  /**
   * Get subscription spending summary with month-over-month comparison
   */
  async getSummary(userId: number, targetCurrency: string) {
    const subscriptions = await prisma.subscription.findMany({
      where: { userId },
    });

    const activeCount = subscriptions.filter((s) => s.status === 'active').length;
    const pausedCount = subscriptions.filter((s) => s.status === 'paused').length;
    const cancelledCount = subscriptions.filter((s) => s.status === 'cancelled').length;
    const totalCount = subscriptions.length;

    // Current monthly total from active subscriptions
    let monthlyTotal = 0;
    for (const s of subscriptions.filter((s) => s.status === 'active')) {
      const converted = await convert(s.price.toNumber(), s.currency, targetCurrency);
      monthlyTotal += normalizeToMonthly(converted, s.billingCycle);
    }

    // Previous month estimate
    const thisMonthStart = startOfMonth(new Date());
    let previousMonthTotal = 0;
    for (const s of subscriptions.filter(
      (s) =>
        s.createdAt < thisMonthStart &&
        (s.status === 'active' || s.status === 'paused' || s.status === 'cancelled')
    )) {
      const converted = await convert(s.price.toNumber(), s.currency, targetCurrency);
      previousMonthTotal += normalizeToMonthly(converted, s.billingCycle);
    }

    const changePercent =
      previousMonthTotal > 0 ? ((monthlyTotal - previousMonthTotal) / previousMonthTotal) * 100 : 0;

    return {
      monthlyTotal: round2(monthlyTotal),
      previousMonthTotal: round2(previousMonthTotal),
      changePercent: round2(changePercent),
      activeCount,
      pausedCount,
      cancelledCount,
      totalCount,
      currency: targetCurrency,
    };
  }

  /**
   * Get monthly spending history for the last N months
   */
  async getSpendingHistory(userId: number, months: number = 12, targetCurrency: string = 'USD') {
    const subscriptions = await prisma.subscription.findMany({
      where: { userId },
    });

    const now = new Date();
    const history: { month: string; total: number }[] = [];

    for (let i = months - 1; i >= 0; i--) {
      const targetDate = subMonths(now, i);
      const monthEnd = endOfMonth(targetDate);
      const monthLabel = format(targetDate, 'yyyy-MM');

      let monthTotal = 0;
      for (const s of subscriptions.filter(
        (s) => s.createdAt <= monthEnd && (s.status === 'active' || s.status === 'paused')
      )) {
        const converted = await convert(s.price.toNumber(), s.currency, targetCurrency);
        monthTotal += normalizeToMonthly(converted, s.billingCycle);
      }

      history.push({
        month: monthLabel,
        total: round2(monthTotal),
      });
    }

    return { history, currency: targetCurrency };
  }

  /**
   * Get spending breakdown by category for active subscriptions
   */
  async getByCategory(userId: number, targetCurrency: string = 'USD') {
    const subscriptions = await prisma.subscription.findMany({
      where: { userId, status: 'active' },
      include: { category: { select: { name: true } } },
    });

    // Group by category name
    const categoryMap = new Map<string, { total: number; count: number }>();

    for (const sub of subscriptions) {
      const category = sub.category?.name || 'Uncategorized';
      const converted = await convert(sub.price.toNumber(), sub.currency, targetCurrency);
      const monthlyPrice = normalizeToMonthly(converted, sub.billingCycle);
      const existing = categoryMap.get(category);

      if (existing) {
        existing.total += monthlyPrice;
        existing.count += 1;
      } else {
        categoryMap.set(category, { total: monthlyPrice, count: 1 });
      }
    }

    // Calculate grand total
    const grandTotal = Array.from(categoryMap.values()).reduce((sum, cat) => sum + cat.total, 0);

    // Build result sorted by total descending
    const categories = Array.from(categoryMap.entries())
      .map(([category, { total, count }]) => ({
        category,
        total: round2(total),
        count,
        percentage: grandTotal > 0 ? round2((total / grandTotal) * 100) : 0,
      }))
      .sort((a, b) => b.total - a.total);

    return { categories, currency: targetCurrency };
  }
}

export const analyticsService = new AnalyticsService();
