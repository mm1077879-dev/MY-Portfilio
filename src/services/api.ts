import axios from 'axios';

export const apiClient = axios.create({
  baseURL: '/api/v1',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

export function extractApiErrorMessage(err: unknown, fallback = 'Operation failed.'): string {
  if (axios.isAxiosError(err)) {
    const serverMsg = err.response?.data?.error?.message;
    if (typeof serverMsg === 'string' && serverMsg.trim()) {
      return serverMsg;
    }
    if (err.message) return err.message;
  }
  if (err instanceof Error) return err.message;
  return fallback;
}

export async function uploadMediaAsset(file: File): Promise<{
  _id: string;
  url: string;
  originalName: string;
  mimeType: string;
  size: number;
}> {
  const formData = new FormData();
  formData.append('file', file);
  const res = await apiClient.post('/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return res.data.data;
}
