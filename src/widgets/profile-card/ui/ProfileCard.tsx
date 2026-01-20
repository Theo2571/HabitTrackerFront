import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useProfileQuery, useUpdateProfileMutation } from '../../../entities/user/model/useProfileQueries';
import { useProfile } from '../../../entities/user/model/useProfile';
import { ProfileAvatar } from '../../../entities/user/ui/ProfileAvatar';
import { useTasksQuery } from '../../../entities/task/model/useTaskQueries';
import { authApi } from '../../../features/auth/api/authApi';
import './ProfileCard.css';

export const ProfileCard = () => {
  // Используем React Query только на странице профиля (enabled: true)
  const { data: profile, isLoading: isLoadingProfile } = useProfileQuery(true);
  const updateMutation = useUpdateProfileMutation();
  
  // Fallback на локальный профиль если запрос ещё не завершился
  const { profile: localProfile } = useProfile();
  const displayProfile = profile ?? localProfile;

  const { data: tasks = [] } = useTasksQuery();
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    email: displayProfile?.email || '',
    bio: displayProfile?.bio || '',
  });

  // Обновляем форму при изменении профиля
  useEffect(() => {
    if (displayProfile) {
      setEditForm({
        email: displayProfile.email || '',
        bio: displayProfile.bio || '',
      });
    }
  }, [displayProfile]);


  if (!displayProfile) {
    if (isLoadingProfile) {
      return (
        <div className="profile-card profile-card-loading">
          <div className="profile-skeleton">Loading profile...</div>
        </div>
      );
    }
    return null;
  }

  const stats = {
    totalTasks: tasks.length,
    completedTasks: tasks.filter((t) => t.completed).length,
    pendingTasks: tasks.filter((t) => !t.completed).length,
  };

  const handleSave = () => {
    // Оптимистичное обновление - UI обновится сразу, запрос на сервер пойдёт в фоне
    updateMutation.mutate(
      {
        email: editForm.email,
        bio: editForm.bio,
      },
      {
        onSuccess: () => {
          setIsEditing(false);
        },
        onError: () => {
          // При ошибке форма остаётся открытой, можно показать ошибку
          // Но оптимистичное обновление уже откатится автоматически
        },
      }
    );
  };

  const handleCancel = () => {
    setEditForm({
      email: displayProfile.email || '',
      bio: displayProfile.bio || '',
    });
    setIsEditing(false);
  };

  const handleLogout = () => {
    authApi.logout();
    navigate('/login');
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const isSaving = updateMutation.isPending;

  return (
    <div className="profile-card">
      <div className="profile-card-header">
        <div className="profile-card-avatar-wrapper">
          <ProfileAvatar username={displayProfile.username} size="large" />
          <div className="profile-card-status"></div>
        </div>
        <div className="profile-card-info">
          <h1 className="profile-card-username">{displayProfile.username}</h1>
          <p className="profile-card-joined">
            Member since {formatDate(displayProfile.createdAt)}
          </p>
        </div>
        {!isEditing && (
          <button
            className="profile-card-edit-btn"
            onClick={() => setIsEditing(true)}
            aria-label="Edit profile"
            disabled={isLoadingProfile}
          >
            ✏️ Edit
          </button>
        )}
      </div>

      <div className="profile-card-content">
        {isEditing ? (
          <div className="profile-card-edit-form">
            <div className="profile-form-group">
              <label htmlFor="email">Email</label>
              <input
                id="email"
                type="email"
                value={editForm.email}
                onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                placeholder="your.email@example.com"
                disabled={isSaving}
              />
            </div>
            <div className="profile-form-group">
              <label htmlFor="bio">Bio</label>
              <textarea
                id="bio"
                value={editForm.bio}
                onChange={(e) => setEditForm({ ...editForm, bio: e.target.value })}
                placeholder="Tell us about yourself..."
                rows={4}
                disabled={isSaving}
              />
            </div>
            {updateMutation.isError && (
              <div className="profile-form-error">
                ❌ Failed to save. Please try again.
              </div>
            )}
            <div className="profile-form-actions">
              <button 
                className="profile-save-btn" 
                onClick={handleSave}
                disabled={isSaving}
              >
                {isSaving ? '⏳ Saving...' : '💾 Save'}
              </button>
              <button 
                className="profile-cancel-btn" 
                onClick={handleCancel}
                disabled={isSaving}
              >
                ✖️ Cancel
              </button>
            </div>
          </div>
        ) : (
          <>
            {displayProfile.email && (
              <div className="profile-card-field">
                <span className="profile-field-icon">📧</span>
                <span className="profile-field-value">{displayProfile.email}</span>
              </div>
            )}
            {displayProfile.bio && (
              <div className="profile-card-bio">
                <span className="profile-field-icon">📝</span>
                <p>{displayProfile.bio}</p>
              </div>
            )}
            {!displayProfile.email && !displayProfile.bio && (
              <p className="profile-card-empty">Click Edit to add your information</p>
            )}
          </>
        )}
      </div>

      <div className="profile-card-stats">
        <div className="profile-stat-item">
          <div className="profile-stat-value">{stats.totalTasks}</div>
          <div className="profile-stat-label">Total Tasks</div>
        </div>
        <div className="profile-stat-item">
          <div className="profile-stat-value profile-stat-pending">{stats.pendingTasks}</div>
          <div className="profile-stat-label">Pending</div>
        </div>
        <div className="profile-stat-item">
          <div className="profile-stat-value profile-stat-completed">{stats.completedTasks}</div>
          <div className="profile-stat-label">Completed</div>
        </div>
      </div>

      <div className="profile-card-footer">
        <Link to="/tasks" className="profile-back-link">
          ← Back to Tasks
        </Link>
        <button onClick={handleLogout} className="profile-logout-btn">
          Logout
        </button>
      </div>
    </div>
  );
};

