import fuzzysort from 'fuzzysort';
import { CATEGORY_KEYWORDS, ClassifierResult } from './keywordClassifier';

interface FuzzyTarget {
  keyword: string;
  category: string;
  prepared: ReturnType<typeof fuzzysort.prepare>;
}

// Pre-compute fuzzy targets at module load for performance
const allTargets: FuzzyTarget[] = Object.entries(CATEGORY_KEYWORDS).flatMap(
  ([category, keywords]) =>
    keywords.map((keyword) => ({
      keyword,
      category,
      prepared: fuzzysort.prepare(keyword),
    }))
);

export function fuzzyClassify(description: string): ClassifierResult | null {
  const words = description.toLowerCase().split(/[\s/*_\-|]+/);

  let bestScore = -Infinity;
  let bestCategory = '';

  for (const word of words) {
    if (word.length < 3) continue; // Skip very short tokens

    for (const target of allTargets) {
      const result = fuzzysort.single(word, target.prepared);
      if (result && result.score > bestScore && result.score > -200) {
        bestScore = result.score;
        bestCategory = target.category;
      }
    }
  }

  if (bestCategory) {
    // Normalize score to 0-1 range (fuzzysort scores are negative, closer to 0 = better)
    const confidence = Math.max(0, Math.min(1, (bestScore + 1000) / 1000));
    if (confidence > 0.3) {
      return { category: bestCategory, confidence, level: 2 };
    }
  }

  return null;
}
