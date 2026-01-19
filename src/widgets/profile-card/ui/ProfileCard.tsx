import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useProfile } from '../../../entities/user/model/useProfile';
import { ProfileAvatar } from '../../../entities/user/ui/ProfileAvatar';
import { useTasksQuery } from '../../../entities/task/model/useTaskQueries';
import { authApi } from '../../../features/auth/api/authApi';
import './ProfileCard.css';

export const ProfileCard = () => {
  const { profile, updateProfile, fetchRemoteProfile } = useProfile();
  const { data: tasks = [] } = useTasksQuery();
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    email: profile?.email || '',
    bio: profile?.bio || '',
  });

  // грузим актуальный профиль только при открытии карточки (страница профиля)
    useEffect(() => {
        fetchRemoteProfile();
    }, []);

    // Обновляем форму при изменении профиля
  useEffect(() => {
    if (profile) {
      setEditForm({
        email: profile.email || '',
        bio: profile.bio || '',
      });
    }
  }, [profile]);



    if (!profile) {
    return null;
  }

  const stats = {
    totalTasks: tasks.length,
    completedTasks: tasks.filter((t) => t.completed).length,
    pendingTasks: tasks.filter((t) => !t.completed).length,
  };

    const handleSave = () => {
        updateProfile({
            email: editForm.email,
            bio: editForm.bio,
        });
        setIsEditing(false);
    };

  const handleCancel = () => {
    setEditForm({
      email: profile.email || '',
      bio: profile.bio || '',
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

  return (
    <div className="profile-card">
      <div className="profile-card-header">
        <div className="profile-card-avatar-wrapper">
          <ProfileAvatar username={profile.username} size="large" />
          <div className="profile-card-status"></div>
        </div>
        <div className="profile-card-info">
          <h1 className="profile-card-username">{profile.username}</h1>
          <p className="profile-card-joined">
            Member since {formatDate(profile.createdAt)}
          </p>
        </div>
        {!isEditing && (
          <button
            className="profile-card-edit-btn"
            onClick={() => setIsEditing(true)}
            aria-label="Edit profile"
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
              />
            </div>
            <div className="profile-form-actions">
              <button className="profile-save-btn" onClick={handleSave}>
                💾 Save
              </button>
              <button className="profile-cancel-btn" onClick={handleCancel}>
                ✖️ Cancel
              </button>
            </div>
          </div>
        ) : (
          <>
            {profile.email && (
              <div className="profile-card-field">
                <span className="profile-field-icon">📧</span>
                <span className="profile-field-value">{profile.email}</span>
              </div>
            )}
            {profile.bio && (
              <div className="profile-card-bio">
                <span className="profile-field-icon">📝</span>
                <p>{profile.bio}</p>
              </div>
            )}
            {!profile.email && !profile.bio && (
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

