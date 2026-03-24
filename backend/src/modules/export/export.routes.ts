import { Router } from 'express';
import * as exportController from './export.controller';
import { authenticateRequest } from '../../middleware/auth.middleware';

const router = Router();

router.use(authenticateRequest);

router.get('/csv', exportController.exportCSV);
router.get('/pdf', exportController.exportPDF);

export default router;
