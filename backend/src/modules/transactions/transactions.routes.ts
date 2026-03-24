import { Router } from 'express';
import * as transactionsController from './transactions.controller';
import { authenticateRequest } from '../../middleware/auth.middleware';

const router = Router();

// All routes require authentication
router.use(authenticateRequest);

router.get('/', transactionsController.getTransactions);
router.get('/summary', transactionsController.getSummary);
router.get('/categories', transactionsController.getCategories);
router.patch('/:id/category', transactionsController.updateCategory);
router.delete('/:id', transactionsController.deleteTransaction);

export default router;
