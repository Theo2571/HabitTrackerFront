import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { Task } from '../../../shared/types';
import './TaskCard.css';

interface TaskCardProps {
  task: Task;
  onDelete: (id: number) => void;
  onToggle?: (id: number) => void;
}

export const TaskCard = ({ task, onDelete, onToggle }: TaskCardProps) => {
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
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`task-card ${task.completed ? 'task-card-completed' : ''} ${isDragging ? 'task-card-dragging' : ''}`}
      {...attributes}
      {...listeners}
    >
      <div className="task-card-content">
        <div className="task-card-title">{task.title}</div>
        {task.completed && (
          <div className="task-card-badge">✓ Done</div>
        )}
      </div>
      <div className="task-card-actions">
        {onToggle && (
          <button
            className="task-card-toggle"
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
          className="task-card-delete"
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


