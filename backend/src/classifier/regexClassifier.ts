import { CATEGORY_KEYWORDS, ClassifierResult } from './keywordClassifier';
import { fuzzyClassify } from './fuzzyClassifier';

// Indian banks format UPI/NEFT/POS descriptions in specific patterns
const BANK_PATTERNS: RegExp[] = [
  // UPI patterns
  /UPI[/-]([A-Z][A-Z0-9]+)/i,
  /UPI[/-]\w+[/-]([A-Z][A-Z0-9\s]+)[/-]/i,
  /([A-Z]{3,})\*\w+/i,
  /TO\s+([A-Z][A-Z\s]+)\s+UPI/i,
  /BY\s+([A-Z][A-Z\s]+)/i,

  // NEFT/IMPS patterns
  /NEFT[/-]([A-Z][A-Z0-9]+)/i,
  /IMPS[/-]\d+[/-]([A-Z][A-Z\s]+)[/-]/i,

  // POS/Card patterns
  /POS\s+([A-Z][A-Z\s]{2,})/i,
  /([A-Z]{4,})\s+\d{6}/i,

  // Bill payment patterns
  /BBPS[/-]([A-Z][A-Z\s]+)/i,
  /BILLDESK[/-]([A-Z][A-Z\s]+)/i,
];

export function regexClassify(description: string): ClassifierResult | null {
  for (const pattern of BANK_PATTERNS) {
    const match = description.match(pattern);
    if (match && match[1]) {
      const extracted = match[1].trim().toLowerCase();

      // Try keyword match on extracted merchant name
      for (const [category, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
        for (const keyword of keywords) {
          if (extracted.includes(keyword.toLowerCase())) {
            return { category, confidence: 0.85, level: 3 };
          }
        }
      }

      // Try fuzzy on extracted merchant
      const fuzzyResult = fuzzyClassify(extracted);
      if (fuzzyResult) {
        return {
          ...fuzzyResult,
          confidence: fuzzyResult.confidence * 0.9,
          level: 3,
        };
      }
    }
  }

  return null;
}
