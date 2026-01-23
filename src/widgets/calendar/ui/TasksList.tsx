import type { Task } from '../../../shared/types';
import styles from './TasksList.module.css';

interface TasksListProps {
  tasks: Task[];
}

export const TasksList = ({ tasks }: TasksListProps) => {
  if (tasks.length === 0) {
    return (
      <div className={styles.empty}>
        <p className={styles.emptyText}>No tasks for this date</p>
      </div>
    );
  }

  return (
    <div className={styles.list}>
      {tasks.map((task) => (
        <div key={task.id} className={`${styles.task} ${task.completed ? styles.completed : ''}`}>
          {task.completed ? (
            <div className={styles.checkIcon}>✓</div>
          ) : (
            <div className={styles.taskBullet}></div>
          )}
          <span className={styles.taskTitle}>{task.title}</span>
        </div>
      ))}
    </div>
  );
};
