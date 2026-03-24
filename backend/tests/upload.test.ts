import { parseCSV } from '../src/utils/csvParser';

describe('CSV Parser', () => {
  const userId = 'test-user-id';

  it('successfully processes a valid HDFC bank CSV', () => {
    const csv = `Date,Narration,Debit,Credit,Balance
01/01/2024,SWIGGY ORDER 12345,250.00,,5000.00
02/01/2024,SALARY JAN 2024,,50000.00,55000.00
03/01/2024,NETFLIX SUBSCRIPTION,499.00,,54501.00`;

    const result = parseCSV(csv, userId);
    expect(result.transactions).toHaveLength(3);
    expect(result.skipped).toBe(0);
  });

  it('handles SBI format with different column names', () => {
    const csv = `Txn Date,Description,Withdrawal,Deposit
15/03/2024,UPI/UBER/RIDE,350.00,
16/03/2024,NEFT SALARY,,75000.00`;

    const result = parseCSV(csv, userId);
    expect(result.transactions).toHaveLength(2);
  });

  it('handles ICICI format with amount column', () => {
    const csv = `Date,Transaction Details,Amount
2024-01-15,AMAZON PURCHASE,-1500.00
2024-01-16,REFUND,500.00`;

    const result = parseCSV(csv, userId);
    expect(result.transactions).toHaveLength(2);
    expect(result.transactions[0].type).toBe('DEBIT');
    expect(result.transactions[1].type).toBe('CREDIT');
  });

  it('skips rows with missing date', () => {
    const csv = `Date,Description,Debit,Credit
01/01/2024,SWIGGY,250.00,
,MISSING DATE,100.00,`;

    const result = parseCSV(csv, userId);
    expect(result.transactions).toHaveLength(1);
    expect(result.skipped).toBe(1);
  });

  it('skips rows with suspiciously large amounts', () => {
    const csv = `Date,Description,Debit,Credit
01/01/2024,NORMAL,500.00,
02/01/2024,HUGE AMOUNT,99999999.00,`;

    const result = parseCSV(csv, userId);
    expect(result.transactions).toHaveLength(1);
    expect(result.errors.length).toBeGreaterThan(0);
  });

  it('handles currency symbols and commas in amounts', () => {
    const csv = `Date,Description,Debit,Credit
01/01/2024,PURCHASE,"₹1,500.00",`;

    const result = parseCSV(csv, userId);
    expect(result.transactions).toHaveLength(1);
    expect(result.transactions[0].amount).toBe(1500);
  });

  it('throws error on empty CSV', () => {
    expect(() => parseCSV('', userId)).toThrow();
  });

  it('throws error on CSV with no recognizable columns', () => {
    const csv = `Col1,Col2,Col3
a,b,c`;
    expect(() => parseCSV(csv, userId)).toThrow('Could not find date column');
  });

  it('handles DD-MM-YYYY date format', () => {
    const csv = `Date,Description,Debit,Credit
15-03-2024,TEST TRANSACTION,100.00,`;

    const result = parseCSV(csv, userId);
    expect(result.transactions).toHaveLength(1);
    expect(result.transactions[0].date.getMonth()).toBe(2); // March = 2 (0-indexed)
  });

  it('generates unique hashes for different transactions', () => {
    const csv = `Date,Description,Debit,Credit
01/01/2024,SWIGGY,250.00,
02/01/2024,ZOMATO,300.00,`;

    const result = parseCSV(csv, userId);
    expect(result.transactions[0].hash).not.toBe(result.transactions[1].hash);
  });

  it('generates same hash for duplicate transactions', () => {
    const csv = `Date,Description,Debit,Credit
01/01/2024,SWIGGY,250.00,
01/01/2024,SWIGGY,250.00,`;

    const result = parseCSV(csv, userId);
    expect(result.transactions[0].hash).toBe(result.transactions[1].hash);
  });
});
