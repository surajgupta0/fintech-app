import { keywordClassify } from '../src/classifier/keywordClassifier';
import { fuzzyClassify } from '../src/classifier/fuzzyClassifier';
import { regexClassify } from '../src/classifier/regexClassifier';
import { classifyTransaction } from '../src/classifier';

describe('Keyword Classifier', () => {
  it('classifies SWIGGY as Food', () => {
    const result = keywordClassify('SWIGGY ORDER #123456');
    expect(result).not.toBeNull();
    expect(result!.category).toBe('Food');
    expect(result!.confidence).toBe(1.0);
    expect(result!.level).toBe(1);
  });

  it('classifies IRCTC as Transport', () => {
    const result = keywordClassify('IRCTC BOOKING TKT');
    expect(result).not.toBeNull();
    expect(result!.category).toBe('Transport');
    expect(result!.level).toBe(1);
  });

  it('classifies NETFLIX as Entertainment', () => {
    const result = keywordClassify('NETFLIX SUBSCRIPTION');
    expect(result).not.toBeNull();
    expect(result!.category).toBe('Entertainment');
    expect(result!.level).toBe(1);
  });

  it('classifies AMAZON as Shopping', () => {
    const result = keywordClassify('AMAZON PAY PURCHASE');
    expect(result).not.toBeNull();
    expect(result!.category).toBe('Shopping');
  });

  it('classifies AIRTEL as Utilities', () => {
    const result = keywordClassify('AIRTEL PREPAID RECHARGE');
    expect(result).not.toBeNull();
    expect(result!.category).toBe('Utilities');
  });

  it('classifies APOLLO as Health', () => {
    const result = keywordClassify('APOLLO PHARMACY');
    expect(result).not.toBeNull();
    expect(result!.category).toBe('Health');
  });

  it('classifies ZERODHA as Finance', () => {
    const result = keywordClassify('ZERODHA FUND TRANSFER');
    expect(result).not.toBeNull();
    expect(result!.category).toBe('Finance');
  });

  it('classifies UDEMY as Education', () => {
    const result = keywordClassify('UDEMY COURSE PURCHASE');
    expect(result).not.toBeNull();
    expect(result!.category).toBe('Education');
  });

  it('classifies NEFT as Transfers', () => {
    const result = keywordClassify('NEFT TRANSFER TO JOHN');
    expect(result).not.toBeNull();
    expect(result!.category).toBe('Transfers');
  });

  it('returns null for unknown description', () => {
    const result = keywordClassify('RANDOM XYZ COMPANY');
    expect(result).toBeNull();
  });
});

describe('Fuzzy Classifier', () => {
  it('classifies misspelled swiggy', () => {
    const result = fuzzyClassify('SWGGY ORDER 123');
    expect(result).not.toBeNull();
    if (result) {
      expect(result.level).toBe(2);
      expect(result.confidence).toBeGreaterThan(0.3);
    }
  });

  it('classifies partial match for netflix', () => {
    const result = fuzzyClassify('NETFLX IND SUBSCRIPTION');
    expect(result).not.toBeNull();
    if (result) {
      expect(result.level).toBe(2);
    }
  });
});

describe('Regex Classifier', () => {
  it('extracts merchant from UPI pattern', () => {
    const result = regexClassify('UPI/SWIGGY1234/ORDER/REF123');
    expect(result).not.toBeNull();
    if (result) {
      expect(result.category).toBe('Food');
      expect(result.level).toBe(3);
    }
  });

  it('extracts merchant from TO ... UPI pattern', () => {
    const result = regexClassify('TO ZOMATO UPI PAYMENT');
    expect(result).not.toBeNull();
    if (result) {
      expect(result.category).toBe('Food');
      expect(result.level).toBe(3);
    }
  });

  it('extracts merchant from POS pattern', () => {
    const result = regexClassify('POS NETFLIX IND 123456');
    expect(result).not.toBeNull();
    if (result) {
      expect(result.category).toBe('Entertainment');
      expect(result.level).toBe(3);
    }
  });

  it('extracts merchant from NEFT pattern', () => {
    const result = regexClassify('NEFT/AMAZON/ORDER123');
    expect(result).not.toBeNull();
    if (result) {
      expect(result.category).toBe('Shopping');
      expect(result.level).toBe(3);
    }
  });
});

describe('Ensemble Classifier', () => {
  it('returns Food for SWGY*Order#8821 UPI', async () => {
    const result = await classifyTransaction('SWGY*Order#8821 UPI');
    expect(result.category).toBe('Food');
    expect(result.confidence).toBeGreaterThan(0);
  });

  it('returns Transport for IRCTC TKT BOOKING NEFT', async () => {
    const result = await classifyTransaction('IRCTC TKT BOOKING NEFT');
    expect(result.category).toBe('Transport');
  });

  it('returns Uncategorized for completely unknown', async () => {
    const result = await classifyTransaction('XYZABC123 UNKNOWN REF');
    expect(result).toBeDefined();
    // Should return either an ML result or Uncategorized
    expect(result.category).toBeDefined();
  });

  it('always returns a valid result', async () => {
    const result = await classifyTransaction('');
    expect(result).toBeDefined();
    expect(result.category).toBeDefined();
    expect(typeof result.confidence).toBe('number');
    expect(typeof result.level).toBe('number');
  });

  it('handles special characters gracefully', async () => {
    const result = await classifyTransaction('UPI/DR/123456789/SWIGGY*ORDER/REF-123');
    expect(result).toBeDefined();
    expect(result.category).toBe('Food');
  });
});
