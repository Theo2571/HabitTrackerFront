import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { TaskCard } from './TaskCard';
import type { Task } from '../../../shared/types';
import styles from './KanbanColumn.module.css';

interface KanbanColumnProps {
  id: string;
  title: string;
  tasks: Task[];
  onDelete: (id: number) => void;
  onToggle?: (id: number) => void;
  color: 'pending' | 'completed';
  movingTaskId?: number | null;
}

export const KanbanColumn = ({ id, title, tasks, onDelete, onToggle, color, movingTaskId }: KanbanColumnProps) => {
  const { setNodeRef, isOver } = useDroppable({
    id,
  });

  const taskIds = tasks.map((task) => task.id.toString());

  return (
    <div
      ref={setNodeRef}
      className={`${styles.column} ${styles[color]} ${isOver ? styles.over : ''}`}
    >
      <div className={styles.header}>
        <h2 className={styles.title}>{title}</h2>
        <span className={styles.count}>{tasks.length}</span>
      </div>
      <SortableContext items={taskIds} strategy={verticalListSortingStrategy}>
        <div className={styles.content}>
          {tasks.length === 0 ? (
            <div className={styles.empty}>
              {color === 'pending' ? '✨ Drop tasks here' : '🎉 All done!'}
            </div>
          ) : (
            tasks.map((task) => (
              <TaskCard 
                key={task.id} 
                task={task} 
                onDelete={onDelete} 
                onToggle={onToggle}
                isMoving={movingTaskId === task.id}
              />
            ))
          )}
        </div>
      </SortableContext>
    </div>
  );
};

