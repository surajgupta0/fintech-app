import { Request, Response, NextFunction } from 'express';
import * as transactionsService from './transactions.service';
import { TransactionType } from '@prisma/client';

export async function getTransactions(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.user!.userId;
    const {
      startDate,
      endDate,
      category,
      type,
      page = '1',
      limit = '50',
    } = req.query as Record<string, string>;

    const parsedLimit = Math.min(parseInt(limit, 10) || 50, 200);
    const parsedPage = parseInt(page, 10) || 1;

    const result = await transactionsService.getTransactions(userId, {
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
      category: category || undefined,
      type: type as TransactionType | undefined,
      page: parsedPage,
      limit: parsedLimit,
    });

    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
}

export async function getSummary(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.user!.userId;
    const { startDate, endDate } = req.query as Record<string, string>;

    const result = await transactionsService.getTransactionSummary(
      userId,
      startDate ? new Date(startDate) : undefined,
      endDate ? new Date(endDate) : undefined
    );

    res.status(200).json({ data: result });
  } catch (error) {
    next(error);
  }
}

export async function getCategories(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.user!.userId;
    const categories = await transactionsService.getCategories(userId);
    res.status(200).json({ data: categories });
  } catch (error) {
    next(error);
  }
}

export async function updateCategory(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.user!.userId;
    const { id } = req.params;
    const { category } = req.body;

    if (!category) {
      res.status(400).json({ error: 'Category is required' });
      return;
    }

    await transactionsService.updateCategory(id, userId, category);
    res.status(200).json({ data: { message: 'Category updated' } });
  } catch (error) {
    next(error);
  }
}

export async function deleteTransaction(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.user!.userId;
    const { id } = req.params;

    await transactionsService.deleteTransaction(id, userId);
    res.status(200).json({ data: { message: 'Transaction deleted' } });
  } catch (error) {
    next(error);
  }
}
