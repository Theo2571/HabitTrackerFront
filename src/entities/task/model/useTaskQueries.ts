import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { taskApi } from '../api/taskApi';
import type { Task } from '../../../shared/types';

const TASKS_QUERY_KEY = ['tasks'] as const;

export const useTasksQuery = () => {
  return useQuery({
    queryKey: TASKS_QUERY_KEY,
    queryFn: taskApi.getAll,
    // Увеличиваем staleTime, чтобы данные считались свежими дольше
    // Это предотвращает ненужные автоматические refetch
    // но не блокирует обновления через setQueryData
    staleTime: 30 * 1000, // 30 секунд
  });
};

export const useCreateTaskMutation = (selectedDate?: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (title: string) => taskApi.create(title, selectedDate),
    onSuccess: (newTask) => {
      // Обновляем общий список задач
      queryClient.setQueryData<Task[]>(TASKS_QUERY_KEY, (oldTasks = []) => [
        ...oldTasks,
        newTask,
      ]);
      
      // Если есть selectedDate, обновляем запрос by-date
      if (selectedDate) {
        queryClient.setQueryData<Task[]>(['tasks', 'by-date', selectedDate], (oldTasks = []) => [
          ...oldTasks,
          newTask,
        ]);
      }
      
      // Обновляем календарь
      if (selectedDate) {
        queryClient.setQueryData<Record<string, Task[]>>(['tasks', 'calendar'], (oldData = {}) => {
          return {
            ...oldData,
            [selectedDate]: [...(oldData[selectedDate] || []), newTask],
          };
        });
      } else {
        // Инвалидируем календарь чтобы он перезагрузился
        queryClient.invalidateQueries({ queryKey: ['tasks', 'calendar'] });
      }
    },
  });
};

export const useToggleTaskMutation = (selectedDate?: string | null) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: taskApi.toggle,
    onMutate: async (taskId) => {
      await queryClient.cancelQueries({ queryKey: TASKS_QUERY_KEY });
      if (selectedDate) {
        await queryClient.cancelQueries({ queryKey: ['tasks', 'by-date', selectedDate] });
      }

      const previousTasks = queryClient.getQueryData<Task[]>(TASKS_QUERY_KEY);
      const previousTasksByDate = selectedDate 
        ? queryClient.getQueryData<Task[]>(['tasks', 'by-date', selectedDate])
        : null;

      queryClient.setQueryData<Task[]>(TASKS_QUERY_KEY, (oldTasks = []) =>
        oldTasks.map((task) =>
          task.id === taskId
            ? { ...task, completed: !task.completed }
            : task
        )
      );

      if (selectedDate) {
        queryClient.setQueryData<Task[]>(['tasks', 'by-date', selectedDate], (oldTasks = []) =>
          oldTasks.map((task) =>
            task.id === taskId
              ? { ...task, completed: !task.completed }
              : task
          )
        );
      }

      return { previousTasks, previousTasksByDate };
    },
    onError: (_err, _taskId, context) => {
      if (context?.previousTasks) {
        queryClient.setQueryData(TASKS_QUERY_KEY, context.previousTasks);
      }
      if (context?.previousTasksByDate && selectedDate) {
        queryClient.setQueryData(['tasks', 'by-date', selectedDate], context.previousTasksByDate);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: TASKS_QUERY_KEY });
      if (selectedDate) {
        queryClient.invalidateQueries({ queryKey: ['tasks', 'by-date', selectedDate] });
        queryClient.invalidateQueries({ queryKey: ['tasks', 'calendar'] });
      }
    },
  });
};

export const useDeleteTaskMutation = (selectedDate?: string | null) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: taskApi.delete,
    onMutate: async (taskId) => {
      await queryClient.cancelQueries({ queryKey: TASKS_QUERY_KEY });
      if (selectedDate) {
        await queryClient.cancelQueries({ queryKey: ['tasks', 'by-date', selectedDate] });
      }

      const previousTasks = queryClient.getQueryData<Task[]>(TASKS_QUERY_KEY);
      const previousTasksByDate = selectedDate 
        ? queryClient.getQueryData<Task[]>(['tasks', 'by-date', selectedDate])
        : null;

      queryClient.setQueryData<Task[]>(TASKS_QUERY_KEY, (oldTasks = []) =>
        oldTasks.filter((task) => task.id !== taskId)
      );

      if (selectedDate) {
        queryClient.setQueryData<Task[]>(['tasks', 'by-date', selectedDate], (oldTasks = []) =>
          oldTasks.filter((task) => task.id !== taskId)
        );
      }

      return { previousTasks, previousTasksByDate };
    },
    onError: (_err, _taskId, context) => {
      if (context?.previousTasks) {
        queryClient.setQueryData(TASKS_QUERY_KEY, context.previousTasks);
      }
      if (context?.previousTasksByDate && selectedDate) {
        queryClient.setQueryData(['tasks', 'by-date', selectedDate], context.previousTasksByDate);
      }
    },
    onSettled: () => {
      if (selectedDate) {
        queryClient.invalidateQueries({ queryKey: ['tasks', 'by-date', selectedDate] });
        queryClient.invalidateQueries({ queryKey: ['tasks', 'calendar'] });
      }
    },
  });
};

