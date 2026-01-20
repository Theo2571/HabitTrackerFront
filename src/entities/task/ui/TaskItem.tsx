import type { Task } from '../../../shared/types';
import styles from './TaskItem.module.css';

interface TaskItemProps {
  task: Task;
  onToggle: () => void;
  onDelete: () => void;
}

export const TaskItem = ({ task, onToggle, onDelete }: TaskItemProps) => {
  return (
    <div className={`${styles.item} ${task.completed ? styles.completed : ''}`}>
      <label className={styles.checkbox}>
        <input
          type="checkbox"
          checked={task.completed}
          onChange={onToggle}
        />
        <span className={styles.title}>{task.title}</span>
      </label>
      <button
        onClick={onDelete}
        className={styles.deleteButton}
        aria-label="Delete task"
      >
        ×
      </button>
    </div>
  );
};

