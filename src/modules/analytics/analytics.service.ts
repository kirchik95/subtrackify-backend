import prisma from '@db/prisma.js';
import { endOfMonth, format, startOfMonth, subMonths } from 'date-fns';

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
  async getSummary(userId: number) {
    const subscriptions = await prisma.subscription.findMany({
      where: { userId },
    });

    const activeCount = subscriptions.filter((s) => s.status === 'active').length;
    const pausedCount = subscriptions.filter((s) => s.status === 'paused').length;
    const cancelledCount = subscriptions.filter((s) => s.status === 'cancelled').length;
    const totalCount = subscriptions.length;

    // Current monthly total from active subscriptions
    const monthlyTotal = subscriptions
      .filter((s) => s.status === 'active')
      .reduce((sum, s) => sum + normalizeToMonthly(s.price.toNumber(), s.billingCycle), 0);

    // Previous month estimate: subs created before start of this month
    // that are active or were active (cancelled but created before this month)
    const thisMonthStart = startOfMonth(new Date());
    const previousMonthTotal = subscriptions
      .filter(
        (s) =>
          s.createdAt < thisMonthStart &&
          (s.status === 'active' || s.status === 'paused' || s.status === 'cancelled')
      )
      .reduce((sum, s) => sum + normalizeToMonthly(s.price.toNumber(), s.billingCycle), 0);

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
    };
  }

  /**
   * Get monthly spending history for the last N months
   */
  async getSpendingHistory(userId: number, months: number = 12) {
    const subscriptions = await prisma.subscription.findMany({
      where: { userId },
    });

    const now = new Date();
    const history: { month: string; total: number }[] = [];

    for (let i = months - 1; i >= 0; i--) {
      const targetDate = subMonths(now, i);
      const monthEnd = endOfMonth(targetDate);
      const monthLabel = format(targetDate, 'yyyy-MM');

      // Include subscriptions that existed during this month and were active or paused
      const monthTotal = subscriptions
        .filter((s) => s.createdAt <= monthEnd && (s.status === 'active' || s.status === 'paused'))
        .reduce((sum, s) => sum + normalizeToMonthly(s.price.toNumber(), s.billingCycle), 0);

      history.push({
        month: monthLabel,
        total: round2(monthTotal),
      });
    }

    return history;
  }

  /**
   * Get spending breakdown by category for active subscriptions
   */
  async getByCategory(userId: number) {
    const subscriptions = await prisma.subscription.findMany({
      where: { userId, status: 'active' },
      include: { category: { select: { name: true } } },
    });

    // Group by category name
    const categoryMap = new Map<string, { total: number; count: number }>();

    for (const sub of subscriptions) {
      const category = sub.category?.name || 'Uncategorized';
      const monthlyPrice = normalizeToMonthly(sub.price.toNumber(), sub.billingCycle);
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
    const result = Array.from(categoryMap.entries())
      .map(([category, { total, count }]) => ({
        category,
        total: round2(total),
        count,
        percentage: grandTotal > 0 ? round2((total / grandTotal) * 100) : 0,
      }))
      .sort((a, b) => b.total - a.total);

    return result;
  }
}

export const analyticsService = new AnalyticsService();
