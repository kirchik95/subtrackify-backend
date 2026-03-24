import { z } from 'zod';

export const notificationsSchema = z.object({
  emailNotifications: z.boolean().optional(),
  pushNotifications: z.boolean().optional(),
  paymentReminders: z.boolean().optional(),
  priceChangeAlerts: z.boolean().optional(),
  weeklyReport: z.boolean().optional(),
  marketingEmails: z.boolean().optional(),
});

export const regionalSchema = z.object({
  currency: z.string().length(3).optional(),
  language: z.string().max(10).optional(),
  timezone: z.string().max(50).optional(),
});

export const appearanceSchema = z.object({
  theme: z.enum(['light', 'dark', 'system']).optional(),
  compactMode: z.boolean().optional(),
});

export const updatePreferencesSchema = z.object({
  notifications: notificationsSchema.optional(),
  regional: regionalSchema.optional(),
  appearance: appearanceSchema.optional(),
});

// Full preferences shape for responses
const fullNotificationsSchema = z.object({
  emailNotifications: z.boolean(),
  pushNotifications: z.boolean(),
  paymentReminders: z.boolean(),
  priceChangeAlerts: z.boolean(),
  weeklyReport: z.boolean(),
  marketingEmails: z.boolean(),
});

const fullRegionalSchema = z.object({
  currency: z.string(),
  language: z.string(),
  timezone: z.string(),
});

const fullAppearanceSchema = z.object({
  theme: z.string(),
  compactMode: z.boolean(),
});

export const preferencesDataSchema = z.object({
  notifications: fullNotificationsSchema,
  regional: fullRegionalSchema,
  appearance: fullAppearanceSchema,
});

export const preferencesResponseSchema = z.object({
  success: z.boolean(),
  data: preferencesDataSchema,
});

export const errorResponseSchema = z.object({
  success: z.boolean(),
  error: z.string(),
});

export type UpdatePreferencesInput = z.infer<typeof updatePreferencesSchema>;
export type PreferencesData = z.infer<typeof preferencesDataSchema>;
