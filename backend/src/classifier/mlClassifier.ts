import axios from 'axios';
import { ClassifierResult } from './keywordClassifier';

const ML_SERVICE_URL = process.env.ML_SERVICE_URL || 'http://localhost:8000';
const HF_ZERO_SHOT_URL =
  process.env.HF_ZERO_SHOT_URL ||
  'https://api-inference.huggingface.co/models/facebook/bart-large-mnli';
const HF_API_TOKEN = process.env.HF_API_TOKEN;

const CATEGORY_LABELS = [
  'Food',
  'Transport',
  'Entertainment',
  'Utilities',
  'Shopping',
  'Health',
  'Finance',
  'Education',
  'Transfers',
];

interface HfZeroShotResponse {
  labels?: string[];
  scores?: number[];
}

async function classifyWithHuggingFace(description: string): Promise<ClassifierResult | null> {
  try {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (HF_API_TOKEN) {
      headers.Authorization = `Bearer ${HF_API_TOKEN}`;
    }

    const response = await axios.post<HfZeroShotResponse>(
      HF_ZERO_SHOT_URL,
      {
        inputs: description,
        parameters: {
          candidate_labels: CATEGORY_LABELS,
          multi_label: false,
        },
        options: {
          wait_for_model: true,
        },
      },
      {
        headers,
        timeout: 12000,
      }
    );

    const labels = response.data?.labels;
    const scores = response.data?.scores;

    if (!labels?.length || !scores?.length) return null;

    const category = labels[0];
    const confidence = Number(scores[0] ?? 0);

    if (!category || confidence < 0.30) return null;

    return { category, confidence, level: 4 };
  } catch {
    return null;
  }
}

export async function mlClassify(description: string): Promise<ClassifierResult | null> {
  const hfResult = await classifyWithHuggingFace(description);
  if (hfResult) return hfResult;

  try {
    const response = await axios.post(
      `${ML_SERVICE_URL}/classify`,
      { description },
      { timeout: 3000 } // 3 second timeout
    );

    const { category, confidence } = response.data;

    if (confidence < 0.30) return null; // Too uncertain

    return { category, confidence, level: 4 };
  } catch (error) {
    // Both remote API and local ML service are optional — gracefully degrade.
    console.warn('ML classification unavailable, skipping level 4 classification');
    return null;
  }
}
