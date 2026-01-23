import { useQuery } from '@tanstack/react-query';
import { taskApi } from '../../../entities/task/api/taskApi';
import type { Task } from '../../../shared/types';

const CALENDAR_QUERY_KEY = ['tasks', 'calendar'] as const;

export const useCalendarData = () => {
  return useQuery<Record<string, Task[]>>({
    queryKey: CALENDAR_QUERY_KEY,
    queryFn: taskApi.getCalendarData,
    staleTime: 30 * 1000, // 30 секунд
  });
};
