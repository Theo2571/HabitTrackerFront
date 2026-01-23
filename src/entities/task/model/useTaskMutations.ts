import { useMutation, useQueryClient } from '@tanstack/react-query';
import { taskApi } from '../api/taskApi';
import type { Task } from '../../../shared/types';

const TASKS_QUERY_KEY = ['tasks'] as const;

export const useMoveTaskMutation = (selectedDate?: string | null) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ taskId}: { taskId: number; completed: boolean }) => {
      const result = await taskApi.toggle(taskId);
      return result;
    },
    onMutate: async ({ taskId, completed }) => {
      await queryClient.cancelQueries({ queryKey: TASKS_QUERY_KEY });
      if (selectedDate) {
        await queryClient.cancelQueries({ queryKey: ['tasks', 'by-date', selectedDate] });
      }
      
      const previousTasks = queryClient.getQueryData<Task[]>(TASKS_QUERY_KEY);
      const previousTasksByDate = selectedDate 
        ? queryClient.getQueryData<Task[]>(['tasks', 'by-date', selectedDate])
        : null;

      queryClient.setQueryData<Task[]>(TASKS_QUERY_KEY, (oldTasks = []) => {
        const task = oldTasks.find((t) => t.id === taskId);
        if (!task || task.completed === completed) {
          return oldTasks; 
        }
        
        return oldTasks.map((task) =>
          task.id === taskId ? { ...task, completed } : task
        );
      });

      if (selectedDate) {
        queryClient.setQueryData<Task[]>(['tasks', 'by-date', selectedDate], (oldTasks = []) => {
          const task = oldTasks.find((t) => t.id === taskId);
          if (!task || task.completed === completed) {
            return oldTasks; 
          }
          
          return oldTasks.map((task) =>
            task.id === taskId ? { ...task, completed } : task
          );
        });
      }

      return { previousTasks, previousTasksByDate };
    },
    onError: (_err, _variables, context) => {
      if (context?.previousTasks) {
        queryClient.setQueryData(TASKS_QUERY_KEY, context.previousTasks);
      }
      if (context?.previousTasksByDate && selectedDate) {
        queryClient.setQueryData(['tasks', 'by-date', selectedDate], context.previousTasksByDate);
      }
    },
    onSuccess: (data) => {
      queryClient.setQueryData<Task[]>(TASKS_QUERY_KEY, (oldTasks = []) =>
        oldTasks.map((task) =>
          task.id === data.id ? data : task
        )
      );
      if (selectedDate) {
        queryClient.setQueryData<Task[]>(['tasks', 'by-date', selectedDate], (oldTasks = []) =>
          oldTasks.map((task) =>
            task.id === data.id ? data : task
          )
        );
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

