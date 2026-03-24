import prisma from '@db/prisma.js';

import type { ImportResult } from './export.schema.js';

function escapeCsvValue(value: string | null | undefined): string {
  if (value === null || value === undefined) return '';
  const str = String(value);
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return '"' + str.replace(/"/g, '""') + '"';
  }
  return str;
}

function parseCsvLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (inQuotes) {
      if (char === '"' && line[i + 1] === '"') {
        current += '"';
        i++;
      } else if (char === '"') {
        inQuotes = false;
      } else {
        current += char;
      }
    } else {
      if (char === '"') {
        inQuotes = true;
      } else if (char === ',') {
        result.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
  }

  result.push(current.trim());
  return result;
}

const VALID_BILLING_CYCLES = ['monthly', 'yearly', 'weekly', 'quarterly'];
const VALID_STATUSES = ['active', 'paused', 'cancelled'];

export class ExportService {
  /**
   * Export user subscriptions as CSV string
   */
  async exportCsv(userId: number): Promise<string> {
    const subscriptions = await prisma.subscription.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });

    const headers =
      'Name,Description,Price,Currency,BillingCycle,NextBillingDate,Status,Category,Color';

    const rows = subscriptions.map((sub) => {
      const values = [
        escapeCsvValue(sub.name),
        escapeCsvValue(sub.description),
        escapeCsvValue(sub.price.toNumber().toString()),
        escapeCsvValue(sub.currency),
        escapeCsvValue(sub.billingCycle),
        escapeCsvValue(sub.nextBillingDate.toISOString().split('T')[0]),
        escapeCsvValue(sub.status),
        escapeCsvValue(sub.category),
        escapeCsvValue(sub.color),
      ];
      return values.join(',');
    });

    return [headers, ...rows].join('\n');
  }

  /**
   * Import subscriptions from CSV content
   */
  async importCsv(userId: number, csvContent: string): Promise<ImportResult> {
    const lines = csvContent
      .split('\n')
      .map((line) => line.trim())
      .filter((line) => line.length > 0);

    if (lines.length < 2) {
      return {
        imported: 0,
        errors: [{ row: 0, message: 'CSV file is empty or has no data rows' }],
      };
    }

    // Parse header to identify column mapping
    const headerLine = parseCsvLine(lines[0]);
    const headerMap: Record<string, number> = {};
    headerLine.forEach((header, index) => {
      headerMap[header.toLowerCase().trim()] = index;
    });

    const validRecords: {
      name: string;
      description: string | null;
      price: number;
      currency: string;
      billingCycle: string;
      nextBillingDate: Date;
      status: string;
      category: string | null;
      color: string | null;
    }[] = [];
    const errors: { row: number; message: string }[] = [];

    for (let i = 1; i < lines.length; i++) {
      const rowNumber = i + 1;
      const values = parseCsvLine(lines[i]);

      const getValue = (key: string): string => {
        const index = headerMap[key];
        if (index === undefined) return '';
        return values[index] ?? '';
      };

      const name = getValue('name');
      if (!name) {
        errors.push({ row: rowNumber, message: 'Name is required' });
        continue;
      }

      const priceStr = getValue('price');
      const price = parseFloat(priceStr);
      if (isNaN(price) || price <= 0) {
        errors.push({ row: rowNumber, message: 'Price must be a positive number' });
        continue;
      }

      const billingCycle = getValue('billingcycle') || 'monthly';
      if (!VALID_BILLING_CYCLES.includes(billingCycle.toLowerCase())) {
        errors.push({
          row: rowNumber,
          message: `Invalid billing cycle: ${billingCycle}. Must be one of: ${VALID_BILLING_CYCLES.join(', ')}`,
        });
        continue;
      }

      const nextBillingDateStr = getValue('nextbillingdate');
      const nextBillingDate = nextBillingDateStr ? new Date(nextBillingDateStr) : new Date();
      if (isNaN(nextBillingDate.getTime())) {
        errors.push({ row: rowNumber, message: 'Invalid date format for NextBillingDate' });
        continue;
      }

      const status = getValue('status') || 'active';
      if (!VALID_STATUSES.includes(status.toLowerCase())) {
        errors.push({
          row: rowNumber,
          message: `Invalid status: ${status}. Must be one of: ${VALID_STATUSES.join(', ')}`,
        });
        continue;
      }

      const description = getValue('description') || null;
      const currency = getValue('currency') || 'USD';
      const category = getValue('category') || null;
      const color = getValue('color') || null;

      validRecords.push({
        name,
        description,
        price,
        currency,
        billingCycle: billingCycle.toLowerCase(),
        nextBillingDate,
        status: status.toLowerCase(),
        category,
        color,
      });
    }

    if (validRecords.length > 0) {
      await prisma.subscription.createMany({
        data: validRecords.map((r) => ({ ...r, userId })),
      });
    }

    return { imported: validRecords.length, errors };
  }
}

export const exportService = new ExportService();
