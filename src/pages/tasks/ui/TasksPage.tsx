import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Link } from 'react-router-dom';
import { authApi } from '../../../features/auth/api/authApi';
import { useProfile } from '../../../entities/user/model/useProfile';
import { ProfileAvatar } from '../../../entities/user/ui/ProfileAvatar';
import { TaskCreate } from '../../../features/task-create';
import { KanbanBoard } from '../../../widgets/kanban-board';
import { CalendarIcon } from '../../../widgets/calendar';
import styles from './TasksPage.module.css';

export const TasksPage = () => {
  const navigate = useNavigate();
  const { profile } = useProfile();
  const [searchParams] = useSearchParams();
  let selectedDate = searchParams.get('date');

  // Если нет даты в URL, редиректим на сегодняшнюю дату
  useEffect(() => {
    if (!selectedDate) {
      const today = new Date();
      const year = today.getFullYear();
      const month = String(today.getMonth() + 1).padStart(2, '0');
      const day = String(today.getDate()).padStart(2, '0');
      const todayStr = `${year}-${month}-${day}`;
      navigate(`/tasks?date=${todayStr}`, { replace: true });
    }
  }, [selectedDate, navigate]);

  const handleLogout = () => {
    authApi.logout();
    navigate('/login');
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.headerContent}>
          <h1 className={styles.title}>🚀 My Kanban Board</h1>
          <p className={styles.subtitle}>Drag & drop to organize your tasks</p>
        </div>
        <div className={styles.actions}>
          <CalendarIcon />
          <Link to="/profile" className={styles.profileLink}>
            {profile && (
              <>
                <ProfileAvatar username={profile.username} size="small" />
                <span className={styles.profileLinkText}>{profile.username}</span>
              </>
            )}
          </Link>
          <button onClick={handleLogout} className={styles.logoutButton}>
            Logout
          </button>
        </div>
      </div>

      <div className={styles.createWrapper}>
        <TaskCreate selectedDate={selectedDate || undefined} />
      </div>

      {selectedDate && (
        <div className={styles.dateFilter}>
          <span className={styles.dateFilterText}>
            📅 Showing tasks for {new Date(selectedDate).toLocaleDateString('en-US', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </span>
        </div>
      )}

      <KanbanBoard selectedDate={selectedDate || undefined} />
    </div>
  );
};

