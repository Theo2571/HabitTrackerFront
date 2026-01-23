import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  closestCorners,
} from '@dnd-kit/core';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useDeleteTaskMutation, useToggleTaskMutation } from '../../../entities/task/model/useTaskQueries';
import { useMoveTaskMutation } from '../../../entities/task/model/useTaskMutations';
import { taskApi } from '../../../entities/task/api/taskApi';
import { KanbanColumn } from '../../../entities/task/ui/KanbanColumn';
import { TaskCard } from '../../../entities/task/ui/TaskCard';
import type { Task } from '../../../shared/types';
import styles from './KanbanBoard.module.css';

interface KanbanBoardProps {
  selectedDate?: string | null;
}

export const KanbanBoard = ({ selectedDate }: KanbanBoardProps) => {
  // Всегда загружаем задачи по дате (selectedDate всегда есть, так как есть редирект на сегодня)
  const { data: tasks = [], isLoading, error } = useQuery({
    queryKey: ['tasks', 'by-date', selectedDate],
    queryFn: async () => {
      if (!selectedDate) return [];
      return taskApi.getByDate(selectedDate);
    },
    enabled: !!selectedDate,
    staleTime: 0, // Всегда загружать свежие данные
  });
  
  const moveTaskMutation = useMoveTaskMutation(selectedDate);
  const toggleMutation = useToggleTaskMutation(selectedDate);
  const deleteMutation = useDeleteTaskMutation(selectedDate);
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [movingTaskId, setMovingTaskId] = useState<number | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 200,
        tolerance: 5,
      },
    })
  );


  const pendingTasks = tasks.filter((task) => !task.completed);
  const completedTasks = tasks.filter((task) => task.completed);

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const task = tasks.find((t) => t.id === Number(active.id));
    setActiveTask(task || null);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveTask(null);

    if (!over) return;

    const taskId = Number(active.id);
    let targetColumn: string | null = null;

    // Проверяем, перетащили ли на колонку или на другую задачу
    if (over.id === 'pending' || over.id === 'completed') {
      targetColumn = over.id as string;
    } else {
      // Если перетащили на задачу, находим её колонку
      const targetTask = tasks.find((t) => t.id === Number(over.id));
      if (targetTask) {
        targetColumn = targetTask.completed ? 'completed' : 'pending';
      } else {
        return; // Не удалось определить колонку
      }
    }

    // Определяем новый статус на основе колонки
    const newCompleted = targetColumn === 'completed';

    // Проверяем, изменился ли статус
    const currentTask = tasks.find((t) => t.id === taskId);
    if (currentTask && currentTask.completed !== newCompleted) {
      // Запускаем запрос - карточка останется в старой колонке с loading
      // и переместится только после успешного ответа сервера
      setMovingTaskId(taskId);
      moveTaskMutation.mutate(
        { taskId, completed: newCompleted },
        {
          onSuccess: () => {
            // После успешного перемещения убираем индикатор загрузки
            setMovingTaskId(null);
          },
          onError: () => {
            // При ошибке тоже убираем индикатор (карточка остается на месте)
            setMovingTaskId(null);
          },
        }
      );
    }
  };

  if (isLoading) {
    return <div className={styles.loading}>Loading tasks{selectedDate ? ` for ${selectedDate}` : ''}...</div>;
  }

  if (error) {
    return <div className={styles.error}>Failed to load tasks for {selectedDate}</div>;
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className={styles.board}>
        <KanbanColumn
          id="pending"
          title="📋 To Do"
          tasks={pendingTasks}
          onDelete={deleteMutation.mutate}
          onToggle={toggleMutation.mutate}
          color="pending"
          movingTaskId={movingTaskId}
        />
        <KanbanColumn
          id="completed"
          title="✅ Completed"
          tasks={completedTasks}
          onDelete={deleteMutation.mutate}
          onToggle={toggleMutation.mutate}
          color="completed"
          movingTaskId={movingTaskId}
        />
      </div>

      <DragOverlay>
        {activeTask ? (
          <div className={styles.cardOverlay}>
            <TaskCard 
              task={activeTask} 
              onDelete={() => {}} 
              isMoving={movingTaskId === activeTask.id} 
            />
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
};


