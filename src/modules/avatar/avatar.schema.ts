import { z } from 'zod';

// Upload response schema
export const avatarUploadResponseSchema = z.object({
  success: z.boolean(),
  data: z.object({
    avatarUrl: z.string(),
  }),
});

// Delete response schema
export const avatarDeleteResponseSchema = z.object({
  success: z.boolean(),
  message: z.string(),
});

// Error response schema
export const avatarErrorResponseSchema = z.object({
  success: z.boolean(),
  error: z.string(),
});

// Constants
export const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
export const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

// Type inference
export type AvatarUploadResponse = z.infer<typeof avatarUploadResponseSchema>;
export type AvatarDeleteResponse = z.infer<typeof avatarDeleteResponseSchema>;
export type AvatarErrorResponse = z.infer<typeof avatarErrorResponseSchema>;
