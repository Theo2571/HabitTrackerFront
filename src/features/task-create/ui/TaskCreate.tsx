import { useState, FormEvent } from 'react';
import { useCreateTaskMutation } from '../../../entities/task/model/useTaskQueries';
import './TaskCreate.css';

export const TaskCreate = () => {
  const [title, setTitle] = useState('');
  const createMutation = useCreateTaskMutation();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    try {
      await createMutation.mutateAsync(title.trim());
      setTitle('');
    } catch (error) {
      // Ошибка обрабатывается React Query
    }
  };

  return (
    <form onSubmit={handleSubmit} className="task-form">
      <input
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Add a new task..."
        className="task-input"
        disabled={createMutation.isPending}
      />
      <button
        type="submit"
        className="add-button"
        disabled={createMutation.isPending || !title.trim()}
      >
        {createMutation.isPending ? 'Adding...' : 'Add Task'}
      </button>
    </form>
  );
};

