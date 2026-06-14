import { api } from './api';

export const getToken = async () => {
  const response = await api.get('/auth/token');
  if (response.data?.data?.token) {
    localStorage.setItem('token', response.data.data.token);
  }
  return response.data;
};

export const analyzeImage = async (file: File) => {
  const formData = new FormData();
  formData.append('image', file);
  const response = await api.post('/images/analyze', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
  return response.data.data;
};

export interface CompressionOptions {
  format: string;
  level: string;
  quality?: number;
  resizeEnabled?: boolean;
  width?: number;
  height?: number;
  maintainAspectRatio?: boolean;
  analysis?: {
    type: string;
    recommended_format: string;
    recommended_quality: number;
  } | null;
}

export const compressImage = async (file: File, options: CompressionOptions) => {
  const formData = new FormData();
  formData.append('image', file);
  formData.append('format', options.format);
  formData.append('level', options.level);
  if (options.quality !== undefined) {
    formData.append('quality', options.quality.toString());
  }
  if (options.resizeEnabled) {
    if (options.width) formData.append('width', options.width.toString());
    if (options.height) formData.append('height', options.height.toString());
    formData.append('maintainAspectRatio', String(options.maintainAspectRatio ?? true));
  }
  if (options.analysis) {
    formData.append('analysisType', options.analysis.type);
    formData.append('recommendedFormat', options.analysis.recommended_format);
    formData.append('recommendedQuality', options.analysis.recommended_quality.toString());
  }
  const response = await api.post('/images/compress', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
  return response.data.data;
};

export const getHistory = async () => {
  const response = await api.get('/images/history');
  return response.data.data;
};

export const getDownloadUrl = (filename: string) => {
  const token = localStorage.getItem('token');
  const base = `${api.defaults.baseURL}/images/download/${filename}`;
  return token ? `${base}?token=${token}` : base;
};
