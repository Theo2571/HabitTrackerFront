import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { taskApi } from '../api/taskApi';
import type { Task } from '../../../shared/types';

const TASKS_QUERY_KEY = ['tasks'] as const;

export const useTasksQuery = () => {
  return useQuery({
    queryKey: TASKS_QUERY_KEY,
    queryFn: taskApi.getAll,
  });
};

export const useCreateTaskMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: taskApi.create,
    onSuccess: (newTask) => {
      queryClient.setQueryData<Task[]>(TASKS_QUERY_KEY, (oldTasks = []) => [
        ...oldTasks,
        newTask,
      ]);
    },
  });
};

export const useToggleTaskMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: taskApi.toggle,
    onMutate: async (taskId) => {
      // Отменяем исходящие запросы
      await queryClient.cancelQueries({ queryKey: TASKS_QUERY_KEY });

      // Сохраняем предыдущее значение
      const previousTasks = queryClient.getQueryData<Task[]>(TASKS_QUERY_KEY);

      // Оптимистично обновляем UI
      queryClient.setQueryData<Task[]>(TASKS_QUERY_KEY, (oldTasks = []) =>
        oldTasks.map((task) =>
          task.id === taskId
            ? { ...task, completed: !task.completed }
            : task
        )
      );

      return { previousTasks };
    },
    onError: (err, taskId, context) => {
      // Откатываем изменения при ошибке
      if (context?.previousTasks) {
        queryClient.setQueryData(TASKS_QUERY_KEY, context.previousTasks);
      }
    },
    onSettled: () => {
      // Обновляем данные после завершения
      queryClient.invalidateQueries({ queryKey: TASKS_QUERY_KEY });
    },
  });
};

export const useDeleteTaskMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: taskApi.delete,
    onMutate: async (taskId) => {
      // Отменяем исходящие запросы
      await queryClient.cancelQueries({ queryKey: TASKS_QUERY_KEY });

      // Сохраняем предыдущее значение
      const previousTasks = queryClient.getQueryData<Task[]>(TASKS_QUERY_KEY);

      // Оптимистично удаляем из UI
      queryClient.setQueryData<Task[]>(TASKS_QUERY_KEY, (oldTasks = []) =>
        oldTasks.filter((task) => task.id !== taskId)
      );

      return { previousTasks };
    },
    onError: (err, taskId, context) => {
      // Откатываем изменения при ошибке
      if (context?.previousTasks) {
        queryClient.setQueryData(TASKS_QUERY_KEY, context.previousTasks);
      }
    },
    onSettled: () => {
      // Обновляем данные после завершения
      queryClient.invalidateQueries({ queryKey: TASKS_QUERY_KEY });
    },
  });
};

