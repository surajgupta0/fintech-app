import Papa from 'papaparse';
import crypto from 'crypto';

// Indian banks use different column names — support all common ones
const DATE_COLUMNS = ['date', 'txn date', 'transaction date', 'value date', 'posting date'];
const DESC_COLUMNS = ['description', 'narration', 'particulars', 'remarks', 'transaction details', 'details'];
const DEBIT_COLUMNS = ['debit', 'withdrawal', 'dr', 'dr amount', 'debit amount'];
const CREDIT_COLUMNS = ['credit', 'deposit', 'cr', 'cr amount', 'credit amount'];

export interface ParsedTransaction {
  date: Date;
  description: string;
  amount: number;
  type: 'DEBIT' | 'CREDIT';
  hash: string;
}

export interface ParseResult {
  transactions: ParsedTransaction[];
  errors: string[];
  generateTransactionHashskipped: number;
}

export function parseCSV(fileContent: string, userId: string): ParseResult {
  const errors: string[] = [];
  let skipped = 0;
  const transactions: ParsedTransaction[] = [];

  const parsed = Papa.parse(fileContent, {
    header: true,
    skipEmptyLines: 'greedy',
    transformHeader: (header: string) => header.toLowerCase().trim(),
    dynamicTyping: false,
  });

  if (parsed.errors.length > 0) {
    parsed.errors.forEach((e) => errors.push(`Row ${e.row}: ${e.message}`));
  }

  if (!parsed.data || parsed.data.length === 0) {
    throw new Error('CSV file is empty or has no valid data rows');
  }

  const headers = Object.keys(parsed.data[0] as object);

  // Detect column mappings
  const dateCol = headers.find((h) => DATE_COLUMNS.includes(h));
  const descCol = headers.find((h) => DESC_COLUMNS.includes(h));

  if (!dateCol) throw new Error(`Could not find date column. Found columns: ${headers.join(', ')}`);
  if (!descCol) throw new Error(`Could not find description column. Found columns: ${headers.join(', ')}`);

  // Detect if bank uses separate debit/credit columns or single amount column
  const debitCol = headers.find((h) => DEBIT_COLUMNS.includes(h));
  const creditCol = headers.find((h) => CREDIT_COLUMNS.includes(h));
  const amountCol = headers.find((h) => h === 'amount');

  for (let i = 0; i < parsed.data.length; i++) {
    const row = parsed.data[i] as Record<string, string>;

    try {
      // Parse date
      const rawDate = row[dateCol]?.trim();
      if (!rawDate) {
        skipped++;
        continue;
      }

      const date = parseIndianDate(rawDate);
      if (!date) {
        errors.push(`Row ${i + 2}: Invalid date "${rawDate}"`);
        skipped++;
        continue;
      }

      const description = row[descCol]?.trim();
      if (!description || description.length < 2) {
        skipped++;
        continue;
      }

      // Parse amount
      let amount = 0;
      let type: 'DEBIT' | 'CREDIT' = 'DEBIT';

      if (debitCol && creditCol) {
        const debitVal = parseAmount(row[debitCol]);
        const creditVal = parseAmount(row[creditCol]);

        if (debitVal > 0) {
          amount = debitVal;
          type = 'DEBIT';
        } else if (creditVal > 0) {
          amount = creditVal;
          type = 'CREDIT';
        } else {
          skipped++;
          continue;
        }
      } else if (amountCol) {
        const rawAmount = row[amountCol];
        amount = Math.abs(parseAmount(rawAmount));
        type = parseAmount(rawAmount) < 0 ? 'DEBIT' : 'CREDIT';
      } else {
        // No amount columns found - try debit only or credit only
        if (debitCol) {
          amount = parseAmount(row[debitCol]);
          type = 'DEBIT';
        } else if (creditCol) {
          amount = parseAmount(row[creditCol]);
          type = 'CREDIT';
        } else {
          skipped++;
          continue;
        }
      }

      if (amount <= 0) {
        skipped++;
        continue;
      }
      if (amount > 10000000) {
        errors.push(`Row ${i + 2}: Suspiciously large amount ${amount}, skipping`);
        skipped++;
        continue;
      }

      // Create dedup hash
      const hash = crypto
        .createHash('sha256')
        .update(`${userId}|${date.toISOString()}|${amount}|${description}`)
        .digest('hex');

      transactions.push({ date, description, amount, type, hash });
    } catch (err) {
      errors.push(`Row ${i + 2}: ${(err as Error).message}`);
      skipped++;
    }
  }

  if (transactions.length === 0) {
    throw new Error('No valid transactions could be parsed from this file');
  }

  return { transactions, errors, skipped };
}

function parseIndianDate(dateStr: string): Date | null {
  const formats = [
    { regex: /^(\d{2})\/(\d{2})\/(\d{4})$/, order: 'dmy' },
    { regex: /^(\d{2})-(\d{2})-(\d{4})$/, order: 'dmy' },
    { regex: /^(\d{4})-(\d{2})-(\d{2})$/, order: 'ymd' },
    { regex: /^(\d{2})\/(\d{2})\/(\d{2})$/, order: 'dmy2' },
    { regex: /^(\d{2})-(\d{2})-(\d{2})$/, order: 'dmy2' },
  ];

  for (const fmt of formats) {
    const match = dateStr.match(fmt.regex);
    if (match) {
      let day: number, month: number, year: number;
      if (fmt.order === 'ymd') {
        year = parseInt(match[1], 10);
        month = parseInt(match[2], 10);
        day = parseInt(match[3], 10);
      } else if (fmt.order === 'dmy2') {
        day = parseInt(match[1], 10);
        month = parseInt(match[2], 10);
        year = parseInt(match[3], 10) + 2000;
      } else {
        day = parseInt(match[1], 10);
        month = parseInt(match[2], 10);
        year = parseInt(match[3], 10);
      }
      const d = new Date(year, month - 1, day);
      if (!isNaN(d.getTime()) && d.getFullYear() === year && d.getMonth() === month - 1 && d.getDate() === day) {
        return d;
      }
    }
  }

  // Last resort — native Date parsing
  const d = new Date(dateStr);
  return isNaN(d.getTime()) ? null : d;
}

function parseAmount(val: string | undefined): number {
  if (!val) return 0;
  const cleaned = val.replace(/[₹$,\s]/g, '').trim();
  if (!cleaned || cleaned === '-') return 0;
  return parseFloat(cleaned) || 0;
}
