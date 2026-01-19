import type { UserProfile } from '../types';

export const storage = {
  getToken: (): string | null => {
    return localStorage.getItem('token');
  },

  setToken: (token: string): void => {
    localStorage.setItem('token', token);
  },

  removeToken: (): void => {
    localStorage.removeItem('token');
  },

  getProfile: (): UserProfile | null => {
    const profile = localStorage.getItem('userProfile');
    return profile ? JSON.parse(profile) : null;
  },

  setProfile: (profile: UserProfile): void => {
    localStorage.setItem('userProfile', JSON.stringify(profile));
  },

  updateProfile: (updates: Partial<UserProfile>): void => {
    const current = storage.getProfile();
    if (current) {
      storage.setProfile({ ...current, ...updates });
    }
  },

  removeProfile: (): void => {
    localStorage.removeItem('userProfile');
  },
};

