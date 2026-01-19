import { useEffect, useState } from 'react';
import { apiRequest } from '../../../shared/api/base';
import { storage } from '../../../shared/lib/storage';
import type { UserProfile } from '../../../shared/types';

type ServerProfile = {
  username: string;
  email?: string;
  bio?: string;
  createdAt: string;
};

const getDefaultStats = () => ({
  totalTasks: 0,
  completedTasks: 0,
  pendingTasks: 0,
});

export const useProfile = () => {
  const [profile, setProfile] = useState<UserProfile | null>(null);

  // при инициализации читаем только из localStorage, без запроса
  useEffect(() => {
    const saved = storage.getProfile();
    setProfile(saved ?? null);
  }, []);

  // отдельная функция, чтобы дергать /users/me только там, где нужно (страница профиля)
  const fetchRemoteProfile = async () => {
    try {
      const serverProfile = await apiRequest<ServerProfile>('/users/me', {
        method: 'GET',
      });

      const existing = storage.getProfile();

      const merged: UserProfile = {
        username: serverProfile.username,
        email: serverProfile.email,
        bio: serverProfile.bio,
        createdAt: serverProfile.createdAt,
        stats: existing?.stats ?? getDefaultStats(),
      };

      storage.setProfile(merged);
      setProfile(merged);
    } catch {
      // если бэкенд недоступен — просто оставляем локальные данные
    }
  };

  const updateProfile = (updates: Partial<UserProfile>) => {
    setProfile((current) => {
      if (!current) return current;

      const updated: UserProfile = {
        ...current,
        ...updates,
      };

      storage.setProfile(updated);

      // Отправляем только поля, которые понимает /users/me (email, bio)
      const payload: { email?: string; bio?: string } = {};
      if (typeof updates.email !== 'undefined') {
        payload.email = updates.email;
      }
      if (typeof updates.bio !== 'undefined') {
        payload.bio = updates.bio;
      }

      if (Object.keys(payload).length > 0) {
        void apiRequest('/users/me', {
          method: 'PUT',
          body: JSON.stringify(payload),
        }).catch(() => {
          // на UI сейчас не показываем ошибку, просто оставляем локальные данные
        });
      }

      return updated;
    });
  };

  const refreshProfile = () => {
    const savedProfile = storage.getProfile();
    setProfile(savedProfile);
  };

  return { profile, updateProfile, refreshProfile, fetchRemoteProfile };
};

