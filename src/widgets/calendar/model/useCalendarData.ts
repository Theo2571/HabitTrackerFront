import { useQuery } from '@tanstack/react-query';
import { taskApi } from '../../../entities/task/api/taskApi';
import type { Task } from '../../../shared/types';

const CALENDAR_QUERY_KEY = ['tasks', 'calendar'] as const;

function getCurrentYearMonth(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

/** yearMonth в формате YYYY-MM; если не передан — текущий месяц */
export const useCalendarData = (yearMonth?: string) => {
  const month = yearMonth ?? getCurrentYearMonth();
  return useQuery<Record<string, Task[]>>({
    queryKey: [...CALENDAR_QUERY_KEY, month],
    queryFn: () => taskApi.getCalendarData(month),
    staleTime: 30 * 1000,
  });
};

export { getCurrentYearMonth };
