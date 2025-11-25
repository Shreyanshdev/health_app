// API Health Check utility
import api from './api';

export async function checkApiHealth(): Promise<boolean> {
  try {
    const response = await api.get('/health');
    return response.data.status === 'OK';
  } catch {
    return false;
  }
}

export function getApiUrl(): string {
  return process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';
}

