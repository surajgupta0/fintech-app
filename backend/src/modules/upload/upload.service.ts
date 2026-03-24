import fs from 'fs';
import prisma from '../../config/database';
import { parseCSV } from '../../utils/csvParser';
import { classifyTransaction } from '../../classifier';
import { AppError } from '../../middleware/error.middleware';
import { logger } from '../../config/logger';
import { UploadResult } from '../../types';
import { Prisma } from '@prisma/client';

const BATCH_SIZE = 100;

export async function processUpload(
  file: Express.Multer.File,
  userId: string
): Promise<UploadResult> {
  // Validate file type
  const allowedExtensions = ['.csv'];
  const ext = file.originalname.toLowerCase().slice(file.originalname.lastIndexOf('.'));
  if (!allowedExtensions.includes(ext)) {
    throw new AppError('Only CSV files are allowed', 400, 'INVALID_FILE_TYPE');
  }

  // Create upload record
  const upload = await prisma.upload.create({
    data: {
      userId,
      filename: file.filename,
      originalName: file.originalname,
      rowCount: 0,
      status: 'PROCESSING',
    },
  });

  try {
    // Read file content
    const fileContent = fs.readFileSync(file.path, 'utf-8');

    // Parse CSV
    const parseResult = parseCSV(fileContent, userId);

    const { transactions: parsedTransactions, errors, skipped } = parseResult;

    let totalInserted = 0;
    let totalDuplicates = 0;

    // Process in batches
    for (let i = 0; i < parsedTransactions.length; i += BATCH_SIZE) {
      const batch = parsedTransactions.slice(i, i + BATCH_SIZE);

      // Classify each transaction in the batch
      const classified = await Promise.all(
        batch.map(async (txn) => {
          const classification = await classifyTransaction(txn.description);
          return {
            userId,
            uploadId: upload.id,
            date: txn.date,
            description: txn.description,
            amount: new Prisma.Decimal(txn.amount.toFixed(2)),
            type: txn.type,
            category: classification.category,
            classifierLevel: classification.level,
            confidence: classification.confidence,
            hash: txn.hash,
          };
        })
      );

      // Batch insert with skipDuplicates (handles dedup via unique hash constraint)
      try {
        const result = await prisma.transaction.createMany({
          data: classified,
          skipDuplicates: true,
        });
        totalInserted += result.count;
        totalDuplicates += classified.length - result.count;
      } catch (error) {
        logger.error(`Batch insert error at index ${i}:`, error);
        // Continue with next batch
        totalDuplicates += classified.length;
      }
    }

    // Update upload record
    await prisma.upload.update({
      where: { id: upload.id },
      data: {
        status: 'COMPLETED',
        rowCount: totalInserted,
      },
    });

    // Clean up temp file
    cleanupFile(file.path);

    return {
      uploadId: upload.id,
      totalRows: parsedTransactions.length,
      inserted: totalInserted,
      duplicates: totalDuplicates,
      errors,
      skipped,
    };
  } catch (error) {
    // Update upload to FAILED
    await prisma.upload.update({
      where: { id: upload.id },
      data: {
        status: 'FAILED',
        errorMessage: (error as Error).message,
      },
    });

    // Clean up temp file
    cleanupFile(file.path);

    throw error;
  }
}

function cleanupFile(filePath: string): void {
  try {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  } catch (err) {
    logger.warn(`Failed to cleanup file: ${filePath}`, err);
  }
}

export async function getUserUploads(userId: string) {
  return prisma.upload.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      originalName: true,
      rowCount: true,
      status: true,
      errorMessage: true,
      createdAt: true,
    },
  });
}
