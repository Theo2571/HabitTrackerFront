import type { Task } from '../../../shared/types';
import './TaskItem.css';

interface TaskItemProps {
  task: Task;
  onToggle: () => void;
  onDelete: () => void;
}

export const TaskItem = ({ task, onToggle, onDelete }: TaskItemProps) => {
  return (
    <div className={`task-item ${task.completed ? 'completed' : ''}`}>
      <label className="task-checkbox">
        <input
          type="checkbox"
          checked={task.completed}
          onChange={onToggle}
        />
        <span className="task-title">{task.title}</span>
      </label>
      <button
        onClick={onDelete}
        className="delete-button"
        aria-label="Delete task"
      >
        ×
      </button>
    </div>
  );
};

