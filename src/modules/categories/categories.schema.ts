import { z } from 'zod';

// Get categories doesn't need schema, but we can add filters later
export const categoriesQuerySchema = z.object({
  includeCount: z
    .string()
    .transform((val) => val === 'true')
    .optional(),
});

// JSON Schema for Fastify validation
export const categoriesQueryJsonSchema = {
  type: 'object',
  properties: {
    includeCount: {
      type: 'string',
    },
  },
};

export type CategoriesQuery = z.infer<typeof categoriesQuerySchema>;
