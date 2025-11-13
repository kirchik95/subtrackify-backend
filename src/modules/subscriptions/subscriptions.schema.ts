import { z } from 'zod';

// Create subscription schema
export const createSubscriptionSchema = z.object({
  name: z.string().min(1, 'Name is required').max(255),
  description: z.string().max(1000).optional(),
  price: z.number().positive('Price must be positive'),
  currency: z.string().length(3, 'Currency must be 3 characters').default('USD'),
  billingCycle: z.enum(['daily', 'weekly', 'monthly', 'yearly'], {
    message: 'Invalid billing cycle',
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

// JSON Schema for Fastify validation
export const createSubscriptionJsonSchema = {
  type: 'object',
  required: ['name', 'price', 'currency', 'billingCycle', 'nextBillingDate'],
  properties: {
    name: {
      type: 'string',
      minLength: 1,
      maxLength: 255,
    },
    description: {
      type: 'string',
      maxLength: 1000,
    },
    price: {
      type: 'number',
      exclusiveMinimum: 0,
    },
    currency: {
      type: 'string',
      minLength: 3,
      maxLength: 3,
      default: 'USD',
    },
    billingCycle: {
      type: 'string',
      enum: ['daily', 'weekly', 'monthly', 'yearly'],
    },
    nextBillingDate: {
      type: 'string',
      format: 'date-time',
    },
    category: {
      type: 'string',
      maxLength: 100,
    },
  },
};

export const updateSubscriptionJsonSchema = {
  type: 'object',
  properties: {
    name: {
      type: 'string',
      minLength: 1,
      maxLength: 255,
    },
    description: {
      type: 'string',
      maxLength: 1000,
    },
    price: {
      type: 'number',
      exclusiveMinimum: 0,
    },
    currency: {
      type: 'string',
      minLength: 3,
      maxLength: 3,
    },
    billingCycle: {
      type: 'string',
      enum: ['daily', 'weekly', 'monthly', 'yearly'],
    },
    nextBillingDate: {
      type: 'string',
      format: 'date-time',
    },
    category: {
      type: 'string',
      maxLength: 100,
    },
  },
};

export const subscriptionIdJsonSchema = {
  type: 'object',
  required: ['id'],
  properties: {
    id: {
      type: 'string',
      pattern: '^\\d+$',
    },
  },
};

export const filterSubscriptionsJsonSchema = {
  type: 'object',
  properties: {
    category: {
      type: 'string',
    },
    status: {
      type: 'string',
      enum: ['active', 'cancelled', 'paused'],
    },
    minPrice: {
      type: 'string',
      pattern: '^\\d+(\\.\\d+)?$',
    },
    maxPrice: {
      type: 'string',
      pattern: '^\\d+(\\.\\d+)?$',
    },
  },
};

// Subscription response schema
export const subscriptionSchema = z.object({
  id: z.number(),
  name: z.string(),
  description: z.string().nullable(),
  price: z.coerce.number(),
  currency: z.string(),
  billingCycle: z.string(),
  nextBillingDate: z.coerce.date(),
  status: z.string(),
  category: z.string().nullable(),
  userId: z.number().nullable(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});

// Response schemas
export const subscriptionResponseSchema = z.object({
  success: z.boolean(),
  data: subscriptionSchema,
  message: z.string().optional(),
});

export const subscriptionsListResponseSchema = z.object({
  success: z.boolean(),
  data: z.array(subscriptionSchema),
});

export const deleteSubscriptionResponseSchema = z.object({
  success: z.boolean(),
  message: z.string(),
});

export const errorResponseSchema = z.object({
  success: z.boolean(),
  error: z.string(),
});

// Type inference
export type CreateSubscriptionInput = z.infer<typeof createSubscriptionSchema>;
export type UpdateSubscriptionInput = z.infer<typeof updateSubscriptionSchema>;
export type SubscriptionIdParams = z.infer<typeof subscriptionIdSchema>;
export type FilterSubscriptionsQuery = z.infer<typeof filterSubscriptionsSchema>;
export type Subscription = z.infer<typeof subscriptionSchema>;
export type SubscriptionResponse = z.infer<typeof subscriptionResponseSchema>;
export type SubscriptionsListResponse = z.infer<typeof subscriptionsListResponseSchema>;
export type DeleteSubscriptionResponse = z.infer<typeof deleteSubscriptionResponseSchema>;
export type ErrorResponse = z.infer<typeof errorResponseSchema>;
