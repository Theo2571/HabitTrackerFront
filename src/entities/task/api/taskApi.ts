import { apiRequest } from '../../../shared/api/base';
import type { Task } from '../../../shared/types';

export const taskApi = {
  getAll: async (): Promise<Task[]> => {
    return apiRequest<Task[]>('/tasks');
  },

  create: async (title: string, date?: string): Promise<Task> => {
    return apiRequest<Task>('/tasks', {
      method: 'POST',
      body: date ? { title, date } : { title }, // axios автоматически сериализует объект в JSON
    });
  },

  toggle: async (id: number): Promise<Task> => {
    return apiRequest<Task>(`/tasks/${id}/toggle`, {
      method: 'PUT',
    });
  },

  delete: async (id: number): Promise<void> => {
    return apiRequest<void>(`/tasks/${id}`, {
      method: 'DELETE',
    });
  },

  getByDate: async (date: string): Promise<Task[]> => {
    const response = await apiRequest<any>(`/tasks/by-date?date=${date}`, {
      method: 'GET',
    });
    // Бэкенд может возвращать:
    // 1. Массив напрямую: [{id, title, completed, date}, ...]
    // 2. Объект {"tasksByDate": {date: Task[]}}
    // 3. Объект {date: Task[]}
    if (Array.isArray(response)) {
      return response;
    }
    if (response && typeof response === 'object') {
      if ('tasksByDate' in response && response.tasksByDate && typeof response.tasksByDate === 'object') {
        return response.tasksByDate[date] || [];
      }
      if (date in response && Array.isArray(response[date])) {
        return response[date];
      }
    }
    return [];
  },

  getCalendarData: async (): Promise<Record<string, Task[]>> => {
    const response = await apiRequest<any>('/tasks/calendar', {
      method: 'GET',
    });
    // Бэкенд возвращает объект {"tasksByDate": {...}} или прямой объект
    if (response && typeof response === 'object') {
      if ('tasksByDate' in response && response.tasksByDate && typeof response.tasksByDate === 'object') {
        return response.tasksByDate;
      }
      // Если структура прямая
      return response as Record<string, Task[]>;
    }
    return {};
  },
};

