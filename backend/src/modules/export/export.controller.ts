import { Request, Response, NextFunction } from 'express';
import * as exportService from './export.service';

export async function exportCSV(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.user!.userId;
    const { startDate, endDate, category } = req.query as Record<string, string>;

    const csvContent = await exportService.exportToCSV({
      userId,
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
      category: category || undefined,
    });

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=transactions_${Date.now()}.csv`);
    res.status(200).send(csvContent);
  } catch (error) {
    next(error);
  }
}

export async function exportPDF(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.user!.userId;
    const { startDate, endDate, category } = req.query as Record<string, string>;

    const pdfBuffer = await exportService.exportToPDF({
      userId,
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
      category: category || undefined,
    });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=report_${Date.now()}.pdf`);
    res.status(200).send(pdfBuffer);
  } catch (error) {
    next(error);
  }
}
