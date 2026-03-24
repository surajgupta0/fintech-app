import { Request, Response, NextFunction } from 'express';
import * as uploadService from './upload.service';
import { AppError } from '../../middleware/error.middleware';

export async function uploadCSV(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.file) {
      throw new AppError('No file uploaded', 400, 'NO_FILE');
    }

    const userId = req.user!.userId;
    const result = await uploadService.processUpload(req.file, userId);

    res.status(200).json({ data: result });
  } catch (error) {
    next(error);
  }
}

export async function getUploads(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.user!.userId;
    const uploads = await uploadService.getUserUploads(userId);
    res.status(200).json({ data: uploads });
  } catch (error) {
    next(error);
  }
}
