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
import { useTasksQuery, useDeleteTaskMutation, useToggleTaskMutation } from '../../../entities/task/model/useTaskQueries';
import { useMoveTaskMutation } from '../../../entities/task/model/useTaskMutations';
import { KanbanColumn } from '../../../entities/task/ui/KanbanColumn';
import { TaskCard } from '../../../entities/task/ui/TaskCard';
import type { Task } from '../../../shared/types';
import './KanbanBoard.css';

export const KanbanBoard = () => {
  const { data: tasks = [], isLoading, error } = useTasksQuery();
  const moveTaskMutation = useMoveTaskMutation();
  const toggleMutation = useToggleTaskMutation();
  const deleteMutation = useDeleteTaskMutation();
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
      setMovingTaskId(taskId); // Отмечаем что задача перемещается
      moveTaskMutation.mutate(
        { taskId, completed: newCompleted },
        {
          onSuccess: () => {
            // Сбрасываем индикатор загрузки только после успешного обновления данных
            // Небольшая задержка чтобы UI успел обновиться
            setTimeout(() => {
              setMovingTaskId(null);
            }, 100);
          },
          onError: () => {
            // При ошибке тоже сбрасываем индикатор (данные откатятся автоматически)
            setMovingTaskId(null);
          },
        }
      );
    }
  };

  if (isLoading) {
    return <div className="kanban-loading">Loading tasks...</div>;
  }

  if (error) {
    return <div className="kanban-error">Failed to load tasks</div>;
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="kanban-board">
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
          <div className="kanban-card-overlay">
            <TaskCard task={activeTask} onDelete={() => {}} isMoving={movingTaskId === activeTask.id} />
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
};


