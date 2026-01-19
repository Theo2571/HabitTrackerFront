import { apiRequest } from '../../../shared/api/base';
import type { Task } from '../../../shared/types';

export const taskApi = {
  getAll: async (): Promise<Task[]> => {
    return apiRequest<Task[]>('/tasks');
  },

  create: async (title: string): Promise<Task> => {
    return apiRequest<Task>('/tasks', {
      method: 'POST',
      body: JSON.stringify({ title }),
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
};

