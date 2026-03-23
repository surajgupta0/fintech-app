import { useState, useCallback } from 'react';
import * as uploadApi from '../api/upload';
import toast from 'react-hot-toast';
import { UploadResult } from '../types';

export function useUpload() {
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<UploadResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const uploadFile = useCallback(async (file: File) => {
    setIsUploading(true);
    setProgress(0);
    setResult(null);
    setError(null);

    // Validate file
    if (!file.name.toLowerCase().endsWith('.csv')) {
      setError('Only CSV files are allowed');
      setIsUploading(false);
      toast.error('Only CSV files are allowed');
      return;
    }

    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      setError('File too large. Maximum size is 10MB');
      setIsUploading(false);
      toast.error('File too large. Maximum size is 10MB');
      return;
    }

    try {
      const uploadResult = await uploadApi.uploadCSV(file, (p) => setProgress(p));
      setResult(uploadResult);
      toast.success(`Successfully imported ${uploadResult.inserted} transactions!`);
    } catch (err: any) {
      const message = err.response?.data?.error || 'Upload failed';
      setError(message);
      toast.error(message);
    } finally {
      setIsUploading(false);
      setProgress(100);
    }
  }, []);

  const reset = useCallback(() => {
    setIsUploading(false);
    setProgress(0);
    setResult(null);
    setError(null);
  }, []);

  return { uploadFile, isUploading, progress, result, error, reset };
}
