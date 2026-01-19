import { useMutation, useQueryClient } from '@tanstack/react-query';
import { taskApi } from '../api/taskApi';
import type { Task } from '../../../shared/types';

const TASKS_QUERY_KEY = ['tasks'] as const;

export const useMoveTaskMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ taskId, completed }: { taskId: number; completed: boolean }) => {
      // Всегда вызываем toggle API, так как мы уже проверили изменение статуса в компоненте
      const result = await taskApi.toggle(taskId);
      return result;
    },
    onMutate: async ({ taskId, completed }) => {
      await queryClient.cancelQueries({ queryKey: TASKS_QUERY_KEY });
      const previousTasks = queryClient.getQueryData<Task[]>(TASKS_QUERY_KEY);

      // Оптимистично обновляем UI
      queryClient.setQueryData<Task[]>(TASKS_QUERY_KEY, (oldTasks = []) =>
        oldTasks.map((task) =>
          task.id === taskId ? { ...task, completed } : task
        )
      );

      return { previousTasks };
    },
    onError: (err, variables, context) => {
      // Откатываем изменения при ошибке
      if (context?.previousTasks) {
        queryClient.setQueryData(TASKS_QUERY_KEY, context.previousTasks);
      }
    },
    onSuccess: (data) => {
      // Обновляем данные после успешного запроса
      queryClient.setQueryData<Task[]>(TASKS_QUERY_KEY, (oldTasks = []) =>
        oldTasks.map((task) =>
          task.id === data.id ? data : task
        )
      );
    },
    onSettled: () => {
      // Обновляем данные после завершения
      queryClient.invalidateQueries({ queryKey: TASKS_QUERY_KEY });
    },
  });
};

