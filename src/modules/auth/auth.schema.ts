import { z } from 'zod';

// Registration schema (Zod)
export const registerSchema = z.object({
  email: z.string().email('Invalid email format').max(255),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .max(100)
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      'Password must contain at least one uppercase letter, one lowercase letter, and one number'
    ),
  name: z.string().min(2, 'Name must be at least 2 characters').max(255),
});

// Login schema (Zod)
export const loginSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(1, 'Password is required'),
});

// Response schemas (Zod)
export const userSchema = z.object({
  id: z.number(),
  email: z.string(),
  name: z.string(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});

export const authResponseSchema = z.object({
  success: z.boolean(),
  data: z.object({
    user: userSchema,
    token: z.string(),
  }),
  message: z.string(),
});

export const meResponseSchema = z.object({
  success: z.boolean(),
  data: userSchema,
});

// Type inference
export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type User = z.infer<typeof userSchema>;
export type AuthResponse = z.infer<typeof authResponseSchema>;
export type MeResponse = z.infer<typeof meResponseSchema>;
