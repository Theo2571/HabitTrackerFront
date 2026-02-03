import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { TaskCreate } from '../../../features/task-create';
import { KanbanBoard } from '../../../widgets/kanban-board';
import { CalendarIcon } from '../../../widgets/calendar';
import styles from './TasksPage.module.css';

export const TasksPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const selectedDate = searchParams.get('date');

  useEffect(() => {
    if (!selectedDate) {
      const today = new Date();
      const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
      navigate(`/tasks?date=${todayStr}`, { replace: true });
    }
  }, [selectedDate, navigate]);

  return (
    <>
      <div className={styles.header}>
        <div className={styles.headerContent}>
          <h1 className={styles.title}>Tasks</h1>
          <p className={styles.subtitle}>Drag & drop to organize your day</p>
        </div>
        <div className={styles.actions}>
          <CalendarIcon />
        </div>
      </div>

      <div className={styles.createWrapper}>
        <TaskCreate selectedDate={selectedDate || undefined} />
      </div>

      {selectedDate && (
        <div className={styles.dateFilter}>
          <span className={styles.dateFilterText}>
            {new Date(selectedDate).toLocaleDateString('en-US', {
              weekday: 'long',
              month: 'long',
              day: 'numeric',
              year: 'numeric',
            })}
          </span>
        </div>
      )}

      <KanbanBoard selectedDate={selectedDate || undefined} />
    </>
  );
};
