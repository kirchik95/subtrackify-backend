import { z } from 'zod';

// Create subscription schema
export const createSubscriptionSchema = z.object({
  name: z.string().min(1, 'Name is required').max(255),
  description: z.string().max(1000).optional(),
  price: z.number().positive('Price must be positive'),
  currency: z.string().length(3, 'Currency must be 3 characters').default('USD'),
  billingCycle: z.enum(['daily', 'weekly', 'monthly', 'yearly'], {
    errorMap: () => ({ message: 'Invalid billing cycle' }),
  }),
  nextBillingDate: z.string().datetime('Invalid date format'),
  category: z.string().max(100).optional(),
});

// Update subscription schema
export const updateSubscriptionSchema = createSubscriptionSchema.partial();

// Subscription ID param
export const subscriptionIdSchema = z.object({
  id: z.string().regex(/^\d+$/, 'ID must be a number'),
});

// Query filters
export const filterSubscriptionsSchema = z.object({
  category: z.string().optional(),
  status: z.enum(['active', 'cancelled', 'paused']).optional(),
  minPrice: z
    .string()
    .regex(/^\d+(\.\d+)?$/)
    .transform(Number)
    .optional(),
  maxPrice: z
    .string()
    .regex(/^\d+(\.\d+)?$/)
    .transform(Number)
    .optional(),
});

// Type inference
export type CreateSubscriptionInput = z.infer<typeof createSubscriptionSchema>;
export type UpdateSubscriptionInput = z.infer<typeof updateSubscriptionSchema>;
export type SubscriptionIdParams = z.infer<typeof subscriptionIdSchema>;
export type FilterSubscriptionsQuery = z.infer<typeof filterSubscriptionsSchema>;
