import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';
import { authApi } from '../../../features/auth/api/authApi';
import { useProfile } from '../../../entities/user/model/useProfile';
import { ProfileAvatar } from '../../../entities/user/ui/ProfileAvatar';
import { TaskCreate } from '../../../features/task-create';
import { KanbanBoard } from '../../../widgets/kanban-board';
import styles from './TasksPage.module.css';

export const TasksPage = () => {
  const navigate = useNavigate();
  const { profile } = useProfile();

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
        <TaskCreate />
      </div>

      <KanbanBoard />
    </div>
  );
};

