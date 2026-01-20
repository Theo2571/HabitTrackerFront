import { useMutation, useQueryClient } from '@tanstack/react-query';
import { taskApi } from '../api/taskApi';
import type { Task } from '../../../shared/types';

const TASKS_QUERY_KEY = ['tasks'] as const;

export const useMoveTaskMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ taskId}: { taskId: number; completed: boolean }) => {
      // Всегда вызываем toggle API, так как мы уже проверили изменение статуса в компоненте
      const result = await taskApi.toggle(taskId);
      return result;
    },
    onMutate: async ({ taskId, completed }) => {
      // Отменяем исходящие запросы
      await queryClient.cancelQueries({ queryKey: TASKS_QUERY_KEY });
      const previousTasks = queryClient.getQueryData<Task[]>(TASKS_QUERY_KEY);

      // Оптимистично перемещаем карточку - она сразу появится в новой колонке
      // и исчезнет из старой (благодаря фильтрации по completed)
      queryClient.setQueryData<Task[]>(TASKS_QUERY_KEY, (oldTasks = []) =>
        oldTasks.map((task) =>
          task.id === taskId ? { ...task, completed } : task
        )
      );

      return { previousTasks };
    },
    onError: (_err, _variables, context) => {
      // Откатываем оптимистичное обновление при ошибке
      if (context?.previousTasks) {
        queryClient.setQueryData(TASKS_QUERY_KEY, context.previousTasks);
      }
    },
    onSuccess: (data) => {
      // ТОЛЬКО после успешного ответа сервера обновляем данные
      // Это переместит карточку в новую колонку
      queryClient.setQueryData<Task[]>(TASKS_QUERY_KEY, (oldTasks = []) =>
        oldTasks.map((task) =>
          task.id === data.id ? data : task
        )
      );
    },
    onSettled: () => {
      // НЕ инвалидируем запросы - данные уже обновлены в onSuccess
      // Это предотвращает повторные запросы на медленном сервере
      // которые могут перезаписать правильное состояние
    },
  });
};

