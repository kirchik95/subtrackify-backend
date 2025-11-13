import { z } from 'zod';

// Get categories doesn't need schema, but we can add filters later
export const categoriesQuerySchema = z.object({
  includeCount: z
    .string()
    .transform((val) => val === 'true')
    .optional(),
});

export type CategoriesQuery = z.infer<typeof categoriesQuerySchema>;
