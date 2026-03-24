import { z } from 'zod';

export const importResultSchema = z.object({
  imported: z.number(),
  errors: z.array(
    z.object({
      row: z.number(),
      message: z.string(),
    })
  ),
});

export const importResponseSchema = z.object({
  success: z.boolean(),
  data: importResultSchema,
});

export const errorResponseSchema = z.object({
  success: z.boolean(),
  error: z.string(),
});

export type ImportResult = z.infer<typeof importResultSchema>;
