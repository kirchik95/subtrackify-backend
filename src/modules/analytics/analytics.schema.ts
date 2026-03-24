import { z } from 'zod';

export const summaryResponseSchema = z.object({
  success: z.boolean(),
  data: z.object({
    monthlyTotal: z.number(),
    previousMonthTotal: z.number(),
    changePercent: z.number(),
    activeCount: z.number(),
    pausedCount: z.number(),
    cancelledCount: z.number(),
    totalCount: z.number(),
  }),
});

export const spendingHistoryQuerySchema = z.object({
  months: z.string().regex(/^\d+$/).transform(Number).optional(),
});

export const spendingHistoryResponseSchema = z.object({
  success: z.boolean(),
  data: z.array(
    z.object({
      month: z.string(),
      total: z.number(),
    })
  ),
});

export const byCategoryResponseSchema = z.object({
  success: z.boolean(),
  data: z.array(
    z.object({
      category: z.string(),
      total: z.number(),
      count: z.number(),
      percentage: z.number(),
    })
  ),
});

export const errorResponseSchema = z.object({
  success: z.boolean(),
  error: z.string(),
});

export type SpendingHistoryQuery = z.infer<typeof spendingHistoryQuerySchema>;
