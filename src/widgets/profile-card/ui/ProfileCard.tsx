import { useState, useEffect } from 'react';
import { useProfileQuery, useUpdateProfileMutation } from '../../../entities/user/model/useProfileQueries';
import { useProfile } from '../../../entities/user/model/useProfile';
import { ProfileAvatar } from '../../../entities/user/ui/ProfileAvatar';
import { useTasksQuery } from '../../../entities/task/model/useTaskQueries';
import styles from './ProfileCard.module.css';

export const ProfileCard = () => {
  // Используем React Query только на странице профиля (enabled: true)
  const { data: profile, isLoading: isLoadingProfile } = useProfileQuery(true);
  const updateMutation = useUpdateProfileMutation();
  
  // Fallback на локальный профиль если запрос ещё не завершился
  const { profile: localProfile } = useProfile();
  const displayProfile = profile ?? localProfile;

  const { data: tasks = [] } = useTasksQuery();
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
        <div className={`${styles.card} ${styles.loading}`}>
          <div className={styles.skeleton}>Loading profile...</div>
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
    <div className={styles.card}>
      <div className={styles.header}>
        <div className={styles.avatarWrapper}>
          <ProfileAvatar username={displayProfile.username} size="large" />
          <div className={styles.status}></div>
        </div>
        <div className={styles.info}>
          <h1 className={styles.username}>{displayProfile.username}</h1>
          <p className={styles.joined}>
            Registered: {formatDate(displayProfile.createdAt)}
          </p>
        </div>
        {!isEditing && (
          <button
            className={styles.editBtn}
            onClick={() => setIsEditing(true)}
            aria-label="Edit profile"
            disabled={isLoadingProfile}
          >
            ✏️ Edit
          </button>
        )}
      </div>

      <div className={styles.content}>
        {isEditing ? (
          <div className={styles.editForm}>
            <div className={styles.formGroup}>
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
            <div className={styles.formGroup}>
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
              <div className={styles.formError}>
                ❌ Failed to save. Please try again.
              </div>
            )}
            <div className={styles.formActions}>
              <button 
                className={styles.saveBtn} 
                onClick={handleSave}
                disabled={isSaving}
              >
                {isSaving ? '⏳ Saving...' : '💾 Save'}
              </button>
              <button 
                className={styles.cancelBtn} 
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
              <div className={styles.field}>
                <span className={styles.fieldIcon}>📧</span>
                <span className={styles.fieldValue}>{displayProfile.email}</span>
              </div>
            )}
            {displayProfile.bio && (
              <div className={styles.bio}>
                <span className={styles.fieldIcon}>📝</span>
                <p>{displayProfile.bio}</p>
              </div>
            )}
            {!displayProfile.email && !displayProfile.bio && (
              <p className={styles.empty}>Click Edit to add your information</p>
            )}
          </>
        )}
      </div>

      <div className={styles.stats}>
        <div className={styles.statItem}>
          <div className={styles.statValue}>{stats.totalTasks}</div>
          <div className={styles.statLabel}>Total Tasks</div>
        </div>
        <div className={styles.statItem}>
          <div className={`${styles.statValue} ${styles.statPending}`}>{stats.pendingTasks}</div>
          <div className={styles.statLabel}>Pending</div>
        </div>
        <div className={styles.statItem}>
          <div className={`${styles.statValue} ${styles.statCompleted}`}>{stats.completedTasks}</div>
          <div className={styles.statLabel}>Completed</div>
        </div>
      </div>

    </div>
  );
};

