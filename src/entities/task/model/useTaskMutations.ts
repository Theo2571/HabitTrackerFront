import { useMutation, useQueryClient } from '@tanstack/react-query';
import { taskApi } from '../api/taskApi';
import type { Task } from '../../../shared/types';

const TASKS_QUERY_KEY = ['tasks'] as const;

export const useMoveTaskMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ taskId}: { taskId: number; completed: boolean }) => {
      const result = await taskApi.toggle(taskId);
      return result;
    },
    onMutate: async ({ taskId, completed }) => {
      // Отменяем все активные и ожидающие запросы для этого ключа
      // Это предотвращает refetch во время pending
      await queryClient.cancelQueries({ queryKey: TASKS_QUERY_KEY });
      
      // Сохраняем предыдущее состояние для отката при ошибке
      const previousTasks = queryClient.getQueryData<Task[]>(TASKS_QUERY_KEY);

      // Оптимистично обновляем задачу - она сразу переместится в нужную колонку
      // благодаря фильтрации по completed в компоненте
      // Используем setQueryData с функцией обновления для атомарности
      queryClient.setQueryData<Task[]>(TASKS_QUERY_KEY, (oldTasks = []) => {
        // Проверяем, что задача существует и статус действительно изменился
        const task = oldTasks.find((t) => t.id === taskId);
        if (!task || task.completed === completed) {
          return oldTasks; // Не обновляем, если статус не изменился
        }
        
        // Обновляем задачу с новым статусом
        return oldTasks.map((task) =>
          task.id === taskId ? { ...task, completed } : task
        );
      });

      return { previousTasks };
    },
    onError: (_err, _variables, context) => {
      // При ошибке откатываем оптимистичное обновление
      if (context?.previousTasks) {
        queryClient.setQueryData(TASKS_QUERY_KEY, context.previousTasks);
      }
    },
    onSuccess: (data) => {
      // Обновляем данные из ответа сервера
      // Это подтверждает оптимистичное обновление из onMutate
      // Задача уже оптимистично перемещена в onMutate (изменили completed)
      // Здесь синхронизируем с данными сервера для полной консистентности
      queryClient.setQueryData<Task[]>(TASKS_QUERY_KEY, (oldTasks = []) =>
        oldTasks.map((task) =>
          task.id === data.id ? data : task
        )
      );
    },
    onSettled: () => {
      // НЕ вызываем invalidateQueries здесь!
      // 
      // Почему это важно:
        queryClient.invalidateQueries({ queryKey: TASKS_QUERY_KEY });

        // 1. invalidateQueries помечает данные как stale и запускает refetch
      // 2. Если сервер еще не обработал запрос, refetch вернет СТАРЫЕ данные
      // 3. Это перезапишет оптимистичное обновление и покажет задачу в старой колонке
      // 4. После ответа сервера (200 OK) данные снова обновятся, создавая "мерцание"
      //
      // Решение:
      // - onMutate: оптимистично обновляем данные (задача сразу перемещается)
      // - onSuccess: подтверждаем обновление данными с сервера
      // - onSettled: НЕ делаем refetch, так как данные уже синхронизированы
      //
      // Если нужна полная синхронизация с сервером, можно сделать refetch
      // в onSuccess с небольшой задержкой, но это не обязательно для оптимистичных обновлений
    },
  });
};

