import { z } from 'zod';

// Forgot password schema
export const forgotPasswordSchema = z.object({
  email: z.string().email('Invalid email format'),
});

// Reset password schema
export const resetPasswordSchema = z.object({
  token: z.string().min(1, 'Token is required'),
  newPassword: z
    .string()
    .min(8)
    .max(100)
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      'Password must contain at least one uppercase letter, one lowercase letter, and one number'
    ),
});

// Response schemas
export const messageResponseSchema = z.object({
  success: z.boolean(),
  message: z.string(),
});

export const errorResponseSchema = z.object({
  success: z.boolean(),
  error: z.string(),
});

// Type inference
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
