import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { logger } from '../config/logger';

export class AppError extends Error {
  public statusCode: number;
  public code?: string;

  constructor(message: string, statusCode: number = 500, code?: string) {
    super(message);
    this.name = 'AppError';
    this.statusCode = statusCode;
    this.code = code;
  }
}

export function errorMiddleware(
  err: Error,
  req: Request,
  res: Response,
  _next: NextFunction
): void {
  logger.error({
    message: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method,
  });

  // Zod validation error
  if (err instanceof ZodError) {
    res.status(400).json({
      error: 'Validation failed',
      details: err.errors.map((e) => ({
        field: e.path.join('.'),
        message: e.message,
      })),
    });
    return;
  }

  // Prisma unique constraint violation
  if (err.constructor.name === 'PrismaClientKnownRequestError' && (err as any).code === 'P2002') {
    res.status(409).json({ error: 'Resource already exists' });
    return;
  }

  // Prisma record not found
  if (err.constructor.name === 'PrismaClientKnownRequestError' && (err as any).code === 'P2025') {
    res.status(404).json({ error: 'Resource not found' });
    return;
  }

  // Custom AppError
  if (err instanceof AppError) {
    res.status(err.statusCode).json({ error: err.message, code: err.code });
    return;
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    res.status(401).json({ error: 'Invalid token' });
    return;
  }
  if (err.name === 'TokenExpiredError') {
    res.status(401).json({ error: 'Token expired', code: 'TOKEN_EXPIRED' });
    return;
  }

  // Multer file size error
  if (err.name === 'MulterError' && (err as any).code === 'LIMIT_FILE_SIZE') {
    const maxSize = process.env.MAX_FILE_SIZE_MB || '10';
    res.status(413).json({ error: `File too large. Maximum size is ${maxSize}MB` });
    return;
  }

  // Unknown error
  const isProduction = process.env.NODE_ENV === 'production';
  res.status(500).json({
    error: isProduction ? 'Internal server error' : err.message,
  });
}
