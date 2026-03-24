import prisma from '@db/prisma.js';

import type { PreferencesData, UpdatePreferencesInput } from './preferences.schema.js';

export class PreferencesService {
  // Transform flat DB row to nested API structure
  private toNested(row: {
    emailNotifications: boolean;
    pushNotifications: boolean;
    paymentReminders: boolean;
    priceChangeAlerts: boolean;
    weeklyReport: boolean;
    marketingEmails: boolean;
    currency: string;
    language: string;
    timezone: string;
    theme: string;
    compactMode: boolean;
  }): PreferencesData {
    return {
      notifications: {
        emailNotifications: row.emailNotifications,
        pushNotifications: row.pushNotifications,
        paymentReminders: row.paymentReminders,
        priceChangeAlerts: row.priceChangeAlerts,
        weeklyReport: row.weeklyReport,
        marketingEmails: row.marketingEmails,
      },
      regional: {
        currency: row.currency,
        language: row.language,
        timezone: row.timezone,
      },
      appearance: {
        theme: row.theme,
        compactMode: row.compactMode,
      },
    };
  }

  // Flatten nested input to flat DB fields
  private toFlat(data: UpdatePreferencesInput): Record<string, unknown> {
    const flat: Record<string, unknown> = {};
    if (data.notifications) {
      Object.assign(flat, data.notifications);
    }
    if (data.regional) {
      Object.assign(flat, data.regional);
    }
    if (data.appearance) {
      Object.assign(flat, data.appearance);
    }
    return flat;
  }

  async getPreferences(userId: number): Promise<PreferencesData> {
    let prefs = await prisma.userPreferences.findUnique({
      where: { userId },
    });

    if (!prefs) {
      prefs = await prisma.userPreferences.create({
        data: { userId },
      });
    }

    return this.toNested(prefs);
  }

  async updatePreferences(userId: number, data: UpdatePreferencesInput): Promise<PreferencesData> {
    const flatData = this.toFlat(data);

    const prefs = await prisma.userPreferences.upsert({
      where: { userId },
      create: { userId, ...flatData },
      update: flatData,
    });

    return this.toNested(prefs);
  }
}

export const preferencesService = new PreferencesService();
