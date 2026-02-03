import { apiRequest } from '../../../shared/api/base';
import type { Task } from '../../../shared/types';

const DATE_YYYY_MM_DD = /^\d{4}-\d{2}-\d{2}$/;

export const taskApi = {
  getAll: async (): Promise<Task[]> => {
    return apiRequest<Task[]>('/tasks');
  },

  /** Контракт: POST /tasks, тело { title, date?, frequency?, reminder? }. Даты в формате YYYY-MM-DD. */
  create: async (
    title: string,
    date?: string,
    options?: { frequency?: string; reminder?: string }
  ): Promise<Task> => {
    const body: Record<string, unknown> = { title };
    if (date && DATE_YYYY_MM_DD.test(date)) body.date = date;
    if (options?.frequency) body.frequency = options.frequency;
    if (options?.reminder) body.reminder = options.reminder;
    return apiRequest<Task>('/tasks', { method: 'POST', body });
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

  /** Задачи по дате. Контракт: GET /tasks/by-date?date=YYYY-MM-DD, ответ — массив с полями date, frequency, reminder, streak (опционально). */
  getByDate: async (date: string): Promise<Task[]> => {
    if (!DATE_YYYY_MM_DD.test(date)) return [];
    const response = await apiRequest<any>(`/tasks/by-date?date=${encodeURIComponent(date)}`, {
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

  /** yearMonth в формате YYYY-MM (опционально); без параметра — текущий месяц */
  getCalendarData: async (yearMonth?: string): Promise<Record<string, Task[]>> => {
    const url = yearMonth
      ? `/tasks/calendar?yearMonth=${encodeURIComponent(yearMonth)}`
      : '/tasks/calendar';
    const response = await apiRequest<any>(url, { method: 'GET' });
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

  /** Стрики по задачам на дату: taskId → количество подряд идущих дней выполнения. Контракт: GET /tasks/streaks?date=YYYY-MM-DD → { "streaks": { "id": number, ... } } (ключи в JSON — строки). */
  getStreaksForDate: async (date: string): Promise<Record<number, number>> => {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return {};
    }
    const response = await apiRequest<{ streaks?: Record<string, number> }>(
      `/tasks/streaks?date=${encodeURIComponent(date)}`,
      { method: 'GET' }
    );
    const raw = response?.streaks ?? {};
    const result: Record<number, number> = {};
    for (const [k, v] of Object.entries(raw)) {
      const id = Number(k);
      if (!Number.isNaN(id) && typeof v === 'number') result[id] = v;
    }
    return result;
  },
};

