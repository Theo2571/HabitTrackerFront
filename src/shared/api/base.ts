import { API_BASE_URL } from '../config/env';

const getAuthToken = (): string | null => {
  return localStorage.getItem('token');
};

export const removeAuthToken = (): void => {
  localStorage.removeItem('token');
};

export const apiRequest = async <T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> => {
  const token = getAuthToken();
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    // @ts-ignore
      headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    if (response.status === 401) {
      removeAuthToken();
      window.location.href = '/login';
    }
    throw new Error(`API error: ${response.statusText}`);
  }

  return response.json();
};

