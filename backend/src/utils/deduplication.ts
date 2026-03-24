import crypto from 'crypto';

export function generateTransactionHash(
  userId: string,
  date: Date,
  amount: number,
  description: string
): string {
  return crypto
    .createHash('sha256')
    .update(`${userId}|${date.toISOString()}|${amount}|${description}`)
    .digest('hex');
}

export function detectDuplicates(hashes: string[], existingHashes: Set<string>): {
  newHashes: string[];
  duplicateCount: number;
} {
  const newHashes: string[] = [];
  let duplicateCount = 0;

  for (const hash of hashes) {
    if (existingHashes.has(hash)) {
      duplicateCount++;
    } else {
      newHashes.push(hash);
      existingHashes.add(hash);
    }
  }

  return { newHashes, duplicateCount };
}
