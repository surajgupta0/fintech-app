import { keywordClassify, ClassifierResult } from './keywordClassifier';
import { fuzzyClassify } from './fuzzyClassifier';
import { regexClassify } from './regexClassifier';
import { mlClassify } from './mlClassifier';

const LEVEL_WEIGHTS: Record<number, number> = {
  1: 1.0,
  2: 0.85,
  3: 0.80,
  4: 0.75,
};

export async function classifyTransaction(description: string): Promise<ClassifierResult> {
  const results: ClassifierResult[] = [];

  // Level 1 — Keyword (instant)
  const kwResult = keywordClassify(description);
  if (kwResult) results.push(kwResult);

  // Level 2 — Fuzzy (fast)
  const fuzzyResult = fuzzyClassify(description);
  if (fuzzyResult) results.push(fuzzyResult);

  // Level 3 — Regex (fast)
  const regexResult = regexClassify(description);
  if (regexResult) results.push(regexResult);

  // Find best result so far
  const bestSoFar = results.reduce(
    (best, r) => (r.confidence > best.confidence ? r : best),
    { category: '', confidence: 0, level: 0 }
  );

  // Level 4 — ML (only if levels 1-3 gave no result or low confidence)
  if (bestSoFar.confidence < 0.7) {
    const mlResult = await mlClassify(description);
    if (mlResult) results.push(mlResult);
  }

  if (results.length === 0) {
    return { category: 'Uncategorized', confidence: 0, level: 0 };
  }

  // ENSEMBLE VOTING: Weight votes by confidence × level_weight
  const categoryScores: Record<string, number> = {};
  for (const result of results) {
    const weight = LEVEL_WEIGHTS[result.level] ?? 0.5;
    const score = result.confidence * weight;
    categoryScores[result.category] = (categoryScores[result.category] ?? 0) + score;
  }

  // Pick category with highest weighted score
  const winner = Object.entries(categoryScores).reduce(
    (best, [cat, score]) => (score > best.score ? { cat, score } : best),
    { cat: 'Uncategorized', score: 0 }
  );

  // Find the result that matched the winning category (for level tracking)
  const winnerResult = results.find((r) => r.category === winner.cat) ?? {
    category: 'Uncategorized',
    confidence: 0,
    level: 0,
  };

  return {
    category: winner.cat,
    confidence: Math.min(winner.score, 1.0),
    level: winnerResult.level,
  };
}

export { keywordClassify } from './keywordClassifier';
export { fuzzyClassify } from './fuzzyClassifier';
export { regexClassify } from './regexClassifier';
export { mlClassify } from './mlClassifier';
export type { ClassifierResult } from './keywordClassifier';
