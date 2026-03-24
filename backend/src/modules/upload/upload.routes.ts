import { Router } from 'express';
import * as uploadController from './upload.controller';
import { authenticateRequest } from '../../middleware/auth.middleware';
import { uploadMiddleware } from '../../middleware/upload.middleware';
import { uploadRateLimiter } from '../../middleware/rateLimit.middleware';

const router = Router();

router.post(
  '/',
  authenticateRequest,
  uploadRateLimiter,
  uploadMiddleware.single('file'),
  uploadController.uploadCSV
);

router.get('/', authenticateRequest, uploadController.getUploads);

export default router;
