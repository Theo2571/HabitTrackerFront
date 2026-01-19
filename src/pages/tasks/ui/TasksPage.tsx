import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';
import { authApi } from '../../../features/auth/api/authApi';
import { useProfile } from '../../../entities/user/model/useProfile';
import { ProfileAvatar } from '../../../entities/user/ui/ProfileAvatar';
import { TaskCreate } from '../../../features/task-create';
import { KanbanBoard } from '../../../widgets/kanban-board';
import './TasksPage.css';

export const TasksPage = () => {
  const navigate = useNavigate();
  const { profile } = useProfile();

  const handleLogout = () => {
    authApi.logout();
    navigate('/login');
  };

  return (
    <div className="tasks-container">
      <div className="tasks-header">
        <div className="tasks-header-content">
          <h1 className="tasks-title">🚀 My Kanban Board</h1>
          <p className="tasks-subtitle">Drag & drop to organize your tasks</p>
        </div>
        <div className="tasks-header-actions">
          <Link to="/profile" className="profile-link">
            {profile && (
              <>
                <ProfileAvatar username={profile.username} size="small" />
                <span className="profile-link-text">{profile.username}</span>
              </>
            )}
          </Link>
          <button onClick={handleLogout} className="logout-button">
            Logout
          </button>
        </div>
      </div>

      <div className="tasks-create-wrapper">
        <TaskCreate />
      </div>

      <KanbanBoard />
    </div>
  );
};

