import { useTasksQuery, useToggleTaskMutation, useDeleteTaskMutation } from '../../../entities/task/model/useTaskQueries';
import { TaskItem } from '../../../entities/task/ui/TaskItem';
import styles from './TaskList.module.css';

export const TaskList = () => {
  const { data: tasks = [], isLoading, error } = useTasksQuery();
  const toggleMutation = useToggleTaskMutation();
  const deleteMutation = useDeleteTaskMutation();

  if (isLoading) {
    return <div className={styles.loading}>Loading tasks...</div>;
  }

  if (error) {
    return <div className={styles.errorMessage}>Failed to load tasks</div>;
  }

  if (tasks.length === 0) {
    return <div className={styles.emptyState}>No tasks yet. Create your first task!</div>;
  }

  return (
    <div className={styles.list}>
      {tasks.map((task) => (
        <TaskItem
          key={task.id}
          task={task}
          onToggle={() => toggleMutation.mutate(task.id)}
          onDelete={() => deleteMutation.mutate(task.id)}
        />
      ))}
    </div>
  );
};

