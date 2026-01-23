import axios, { AxiosError, AxiosInstance, InternalAxiosRequestConfig } from 'axios';
import { API_BASE_URL } from '../config/env';

const getAuthToken = (): string | null => {
  return localStorage.getItem('token');
};

export const removeAuthToken = (): void => {
  localStorage.removeItem('token');
};

// Создаем axios instance с базовой конфигурацией
const axiosInstance: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 секунд таймаут
});

// Request interceptor - добавляет токен к каждому запросу
axiosInstance.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = getAuthToken();
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - обрабатывает ошибки и редирект при 401
axiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  (error: AxiosError) => {
    // Обработка ошибки 401 (Unauthorized) - токен истек или невалиден
    if (error.response?.status === 401 || error.response?.status === 403) {
      removeAuthToken();
      // Редирект на страницу логина только если мы не на странице логина/регистрации
      const currentPath = window.location.pathname;
      if (currentPath !== '/login' && currentPath !== '/register') {
        window.location.href = '/login';
      }
    }

    // Пробрасываем ошибку дальше для обработки в компонентах
    return Promise.reject(error);
  }
);

// Кастомный класс ошибки для лучшей обработки
export class ApiError extends Error {
  constructor(
    message: string,
    public status?: number,
    public statusText?: string,
    public data?: unknown
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

// Обертка для совместимости с существующим кодом
export const apiRequest = async <T>(
  endpoint: string,
  options: {
    method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
    body?: string | object;
    headers?: Record<string, string>;
  } = {}
): Promise<T> => {
  try {
    const response = await axiosInstance.request<T>({
      url: endpoint,
      method: options.method || 'GET',
      data: options.body,
      headers: options.headers,
    });

    return response.data;
  } catch (error) {
    // Преобразуем AxiosError в более удобный формат
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError;
      throw new ApiError(
        axiosError.message || 'API request failed',
        axiosError.response?.status,
        axiosError.response?.statusText,
        axiosError.response?.data
      );
    }
    // Если это не AxiosError, пробрасываем как есть
    throw error;
  }
};

// Экспортируем axios instance для прямого использования, если нужно
export { axiosInstance };

