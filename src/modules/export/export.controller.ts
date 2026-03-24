import type { FastifyReply, FastifyRequest } from 'fastify';

import { exportService } from './export.service.js';

export class ExportController {
  /**
   * Export subscriptions as CSV
   */
  async exportCsv(request: FastifyRequest, reply: FastifyReply) {
    try {
      const userId = request.user!.userId;
      const csvString = await exportService.exportCsv(userId);

      reply.header('Content-Type', 'text/csv');
      reply.header('Content-Disposition', 'attachment; filename="subscriptions.csv"');

      return reply.send(csvString);
    } catch (error) {
      request.log.error(error);
      return reply.status(500).send({
        success: false,
        error: 'Failed to export subscriptions',
      });
    }
  }

  /**
   * Import subscriptions from CSV file
   */
  async importCsv(request: FastifyRequest, reply: FastifyReply) {
    try {
      const userId = request.user!.userId;
      const file = await request.file();

      if (!file) {
        return reply.status(400).send({
          success: false,
          error: 'No file uploaded',
        });
      }

      const buffer = await file.toBuffer();
      const csvContent = buffer.toString('utf-8');

      const result = await exportService.importCsv(userId, csvContent);

      return reply.status(200).send({
        success: true,
        data: result,
      });
    } catch (error) {
      request.log.error(error);
      return reply.status(500).send({
        success: false,
        error: 'Failed to import subscriptions',
      });
    }
  }
}

export const exportController = new ExportController();
