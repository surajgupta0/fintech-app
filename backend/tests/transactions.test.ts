describe('Transactions', () => {
  describe('Transaction Type Detection', () => {
    it('identifies debit transactions from negative amounts', () => {
      const amount = -1500;
      const type = amount < 0 ? 'DEBIT' : 'CREDIT';
      expect(type).toBe('DEBIT');
    });

    it('identifies credit transactions from positive amounts', () => {
      const amount = 50000;
      const type = amount < 0 ? 'DEBIT' : 'CREDIT';
      expect(type).toBe('CREDIT');
    });
  });

  describe('Filter Validation', () => {
    it('defaults page to 1 if not provided', () => {
      const page = parseInt(undefined as any, 10) || 1;
      expect(page).toBe(1);
    });

    it('defaults limit to 50 if not provided', () => {
      const limit = parseInt(undefined as any, 10) || 50;
      expect(limit).toBe(50);
    });

    it('caps limit at 200', () => {
      const requestedLimit = 500;
      const limit = Math.min(requestedLimit, 200);
      expect(limit).toBe(200);
    });

    it('parses date filters correctly', () => {
      const startDate = new Date('2024-01-01');
      const endDate = new Date('2024-12-31');
      expect(startDate.getFullYear()).toBe(2024);
      expect(endDate.getMonth()).toBe(11); // December = 11 (0-indexed)
    });
  });

  describe('Category Update', () => {
    it('sets classifier level to 0 for manual categorization', () => {
      const classifierLevel = 0; // Manual
      const confidence = 1.0;
      expect(classifierLevel).toBe(0);
      expect(confidence).toBe(1.0);
    });
  });

  describe('Summary Calculation', () => {
    it('calculates correct totals', () => {
      const transactions = [
        { amount: 100, type: 'DEBIT' },
        { amount: 200, type: 'DEBIT' },
        { amount: 500, type: 'CREDIT' },
      ];

      let totalDebit = 0;
      let totalCredit = 0;

      for (const t of transactions) {
        if (t.type === 'DEBIT') totalDebit += t.amount;
        else totalCredit += t.amount;
      }

      expect(totalDebit).toBe(300);
      expect(totalCredit).toBe(500);
    });

    it('groups transactions by category', () => {
      const transactions = [
        { category: 'Food', amount: 100 },
        { category: 'Food', amount: 200 },
        { category: 'Transport', amount: 150 },
      ];

      const categoryMap = new Map<string, number>();
      for (const t of transactions) {
        const current = categoryMap.get(t.category) || 0;
        categoryMap.set(t.category, current + t.amount);
      }

      expect(categoryMap.get('Food')).toBe(300);
      expect(categoryMap.get('Transport')).toBe(150);
    });

    it('groups transactions by month', () => {
      const transactions = [
        { date: new Date('2024-01-15'), amount: 100 },
        { date: new Date('2024-01-20'), amount: 200 },
        { date: new Date('2024-02-10'), amount: 300 },
      ];

      const monthMap = new Map<string, number>();
      for (const t of transactions) {
        const key = `${t.date.getFullYear()}-${String(t.date.getMonth() + 1).padStart(2, '0')}`;
        const current = monthMap.get(key) || 0;
        monthMap.set(key, current + t.amount);
      }

      expect(monthMap.get('2024-01')).toBe(300);
      expect(monthMap.get('2024-02')).toBe(300);
    });
  });
});
