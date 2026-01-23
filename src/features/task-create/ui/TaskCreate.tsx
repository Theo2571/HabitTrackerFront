import { useState, FormEvent } from 'react';
import { useCreateTaskMutation } from '../../../entities/task/model/useTaskQueries';
import styles from './TaskCreate.module.css';

interface TaskCreateProps {
  selectedDate?: string;
}

export const TaskCreate = ({ selectedDate }: TaskCreateProps) => {
  const [title, setTitle] = useState('');
  const createMutation = useCreateTaskMutation(selectedDate);

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
    <form onSubmit={handleSubmit} className={styles.form}>
      <input
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Add a new task..."
        className={styles.input}
        disabled={createMutation.isPending}
      />
      <button
        type="submit"
        className={styles.addButton}
        disabled={createMutation.isPending || !title.trim()}
      >
        {createMutation.isPending ? 'Adding...' : 'Add Task'}
      </button>
    </form>
  );
};

