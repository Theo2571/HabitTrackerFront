import { useTasksQuery, useToggleTaskMutation, useDeleteTaskMutation } from '../../../entities/task/model/useTaskQueries';
import { TaskItem } from '../../../entities/task/ui/TaskItem';
import './TaskList.css';

export const TaskList = () => {
  const { data: tasks = [], isLoading, error } = useTasksQuery();
  const toggleMutation = useToggleTaskMutation();
  const deleteMutation = useDeleteTaskMutation();

  if (isLoading) {
    return <div className="loading">Loading tasks...</div>;
  }

  if (error) {
    return <div className="error-message">Failed to load tasks</div>;
  }

  if (tasks.length === 0) {
    return <div className="empty-state">No tasks yet. Create your first task!</div>;
  }

  return (
    <div className="tasks-list">
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

