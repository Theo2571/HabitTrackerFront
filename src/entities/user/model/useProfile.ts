import { useEffect, useState } from 'react';
import { storage } from '../../../shared/lib/storage';
import type { UserProfile } from '../../../shared/types';

// Простой хук для чтения профиля из localStorage без запросов к API
// Используется в компонентах, где не нужен серверный запрос
export const useProfile = () => {
  const [profile, setProfile] = useState<UserProfile | null>(null);

  useEffect(() => {
    const saved = storage.getProfile();
    setProfile(saved ?? null);
  }, []);

  const updateProfile = (updates: Partial<UserProfile>) => {
    setProfile((current) => {
      if (!current) return current;
      const updated: UserProfile = { ...current, ...updates };
      storage.setProfile(updated);
      return updated;
    });
  };

  const refreshProfile = () => {
    const savedProfile = storage.getProfile();
    setProfile(savedProfile);
  };

  return { profile, updateProfile, refreshProfile };
};

