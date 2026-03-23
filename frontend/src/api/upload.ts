import client from './client';
import { UploadResult, UploadRecord } from '../types';

export async function uploadCSV(file: File, onProgress?: (progress: number) => void): Promise<UploadResult> {
  const formData = new FormData();
  formData.append('file', file);

  const { data } = await client.post('/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    onUploadProgress: (progressEvent) => {
      if (progressEvent.total && onProgress) {
        const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
        onProgress(progress);
      }
    },
  });

  return data.data;
}

export async function getUploads(): Promise<UploadRecord[]> {
  const { data } = await client.get('/upload');
  return data.data;
}

export async function exportCSV(startDate?: string, endDate?: string, category?: string): Promise<Blob> {
  const params = new URLSearchParams();
  if (startDate) params.append('startDate', startDate);
  if (endDate) params.append('endDate', endDate);
  if (category) params.append('category', category);

  const { data } = await client.get(`/export/csv?${params.toString()}`, {
    responseType: 'blob',
  });
  return data;
}

export async function exportPDF(startDate?: string, endDate?: string, category?: string): Promise<Blob> {
  const params = new URLSearchParams();
  if (startDate) params.append('startDate', startDate);
  if (endDate) params.append('endDate', endDate);
  if (category) params.append('category', category);

  const { data } = await client.get(`/export/pdf?${params.toString()}`, {
    responseType: 'blob',
  });
  return data;
}
