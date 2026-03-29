import { z } from 'zod';

export const createCategorySchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  icon: z.string().max(50).optional(),
  color: z.string().max(7).optional(),
});

export const updateCategorySchema = createCategorySchema.partial();

export const categoryIdSchema = z.object({
  id: z.string().regex(/^\d+$/, 'ID must be a number'),
});

export const categorySchema = z.object({
  id: z.number(),
  name: z.string(),
  icon: z.string().nullable(),
  color: z.string().nullable(),
  userId: z.number(),
  createdAt: z.coerce.date(),
});

export const categoryWithCountSchema = categorySchema.extend({
  _count: z.object({
    subscriptions: z.number(),
  }),
});

export const categoriesListResponseSchema = z.object({
  success: z.boolean(),
  data: z.array(categoryWithCountSchema),
});

export const categoryResponseSchema = z.object({
  success: z.boolean(),
  data: categorySchema,
});

export const messageResponseSchema = z.object({
  success: z.boolean(),
  message: z.string(),
});

export const errorResponseSchema = z.object({
  success: z.boolean(),
  error: z.string(),
});

export type CreateCategoryInput = z.infer<typeof createCategorySchema>;
export type UpdateCategoryInput = z.infer<typeof updateCategorySchema>;
export type CategoryIdParams = z.infer<typeof categoryIdSchema>;
