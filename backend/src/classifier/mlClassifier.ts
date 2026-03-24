import axios from 'axios';
import { ClassifierResult } from './keywordClassifier';

const ML_SERVICE_URL = process.env.ML_SERVICE_URL || 'http://localhost:8000';

export async function mlClassify(description: string): Promise<ClassifierResult | null> {
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
    // ML service is optional — gracefully degrade
    console.warn('ML service unavailable, skipping level 4 classification');
    return null;
  }
}
