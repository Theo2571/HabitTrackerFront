import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { Task } from '../../../shared/types';
import styles from './TaskCard.module.css';

interface TaskCardProps {
  task: Task;
  onDelete: (id: number) => void;
  onToggle?: (id: number) => void;
  isMoving?: boolean;
}

export const TaskCard = ({ task, onDelete, onToggle, isMoving = false }: TaskCardProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: task.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition: isDragging ? 'none' : transition,
    opacity: isDragging ? 0.4 : 1,
    scale: isDragging ? 1.05 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`${styles.taskCard} ${task.completed ? styles.completed : ''} ${isDragging ? styles.dragging : ''} ${isMoving ? styles.moving : ''}`}
      {...attributes}
      {...listeners}
    >
      {isMoving && (
        <div className={styles.loadingOverlay}>
          <div className={styles.spinner}></div>
        </div>
      )}
      <div className={styles.content}>
        <div className={styles.title}>{task.title}</div>
        {task.completed && (
          <div className={styles.badge}>✓ Done</div>
        )}
      </div>
      <div className={styles.actions}>
        {onToggle && (
          <button
            className={styles.toggle}
            onClick={(e) => {
              e.stopPropagation();
              onToggle(task.id);
            }}
            aria-label={task.completed ? 'Mark as pending' : 'Mark as completed'}
            title={task.completed ? 'Mark as pending' : 'Mark as completed'}
          >
            {task.completed ? '↩️' : '✓'}
          </button>
        )}
        <button
          className={styles.delete}
          onClick={(e) => {
            e.stopPropagation();
            onDelete(task.id);
          }}
          aria-label="Delete task"
          title="Delete task"
        >
          🗑️
        </button>
      </div>
    </div>
  );
};


