import { apiRequest } from '../../../shared/api/base';
import type {
  WeeklyStatsPoint,
  WeeklyStatsResponse,
  MonthlyStatsPoint,
  MonthlyStatsResponse,
} from '../../../shared/types';

function isWeeklyPoint(x: unknown): x is WeeklyStatsPoint {
  return (
    typeof x === 'object' &&
    x !== null &&
    'day' in x &&
    typeof (x as { day: unknown }).day === 'string' &&
    'completion' in x &&
    typeof (x as { completion: unknown }).completion === 'number'
  );
}

/**
 * Нормализует ответ GET /stats/weekly: бэкенд может вернуть { data: [] } или массив напрямую.
 */
function normalizeWeeklyResponse(raw: unknown): WeeklyStatsResponse {
  if (raw && typeof raw === 'object' && 'data' in raw && Array.isArray((raw as { data: unknown }).data)) {
    const arr = (raw as { data: unknown[] }).data.filter(isWeeklyPoint);
    return { data: arr };
  }
  if (Array.isArray(raw)) {
    const arr = raw.filter(isWeeklyPoint);
    return { data: arr };
  }
  return { data: [] };
}

const DATE_YYYY_MM_DD = /^\d{4}-\d{2}-\d{2}$/;

/**
 * Статистика для дашборда. Контракт бэкенда: HabitTracker/docs/BACKEND_CONTRACT.md (и ReactHabit/docs/BACKEND_JAVA.md).
 */
export const statsApi = {
  /**
   * Контракт: GET /stats/weekly?from=YYYY-MM-DD&to=YYYY-MM-DD. По каждому дню в [from, to] одна точка в data, completion 0–100.
   */
  getWeekly: async (from: string, to: string): Promise<WeeklyStatsResponse> => {
    if (!DATE_YYYY_MM_DD.test(from) || !DATE_YYYY_MM_DD.test(to)) return { data: [] };
    try {
      const raw = await apiRequest<unknown>(
        `/stats/weekly?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`,
        { method: 'GET' }
      );
      return normalizeWeeklyResponse(raw);
    } catch {
      return { data: [] };
    }
  },

  /**
   * Контракт: GET /stats/monthly?year=YYYY&month=M (1–12). Недели W1–W4, count — выполненные за неделю.
   */
  getMonthly: async (year: number, month: number): Promise<MonthlyStatsResponse> => {
    if (month < 1 || month > 12) return { data: [] };
    try {
      const raw = await apiRequest<unknown>(
        `/stats/monthly?year=${year}&month=${month}`,
        { method: 'GET' }
      );
      return normalizeMonthlyResponse(raw);
    } catch {
      return { data: [] };
    }
  },
};

function isMonthlyPoint(x: unknown): x is MonthlyStatsPoint {
  return (
    typeof x === 'object' &&
    x !== null &&
    'week' in x &&
    typeof (x as { week: unknown }).week === 'string' &&
    'count' in x &&
    typeof (x as { count: unknown }).count === 'number'
  );
}

function normalizeMonthlyResponse(raw: unknown): MonthlyStatsResponse {
  if (raw && typeof raw === 'object' && 'data' in raw && Array.isArray((raw as { data: unknown }).data)) {
    const arr = (raw as { data: unknown[] }).data.filter(isMonthlyPoint);
    return { data: arr };
  }
  if (Array.isArray(raw)) {
    const arr = raw.filter(isMonthlyPoint);
    return { data: arr };
  }
  return { data: [] };
}
