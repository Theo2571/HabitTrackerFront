import { apiRequest } from '../../../shared/api/base';
import { storage } from '../../../shared/lib/storage';
import type { AuthResponse, LoginCredentials, RegisterCredentials, UserProfile } from '../../../shared/types';

export const authApi = {
  register: async (credentials: RegisterCredentials): Promise<AuthResponse> => {
    const response = await apiRequest<AuthResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
    storage.setToken(response.token);
    
    // Создаем профиль при регистрации
    const profile: UserProfile = {
      username: credentials.username,
      createdAt: new Date().toISOString(),
      stats: {
        totalTasks: 0,
        completedTasks: 0,
        pendingTasks: 0,
      },
    };
    storage.setProfile(profile);
    
    return response;
  },

  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    const response = await apiRequest<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
    storage.setToken(response.token);
    
    // Восстанавливаем или создаем профиль при входе
    let profile = storage.getProfile();
    if (!profile) {
      profile = {
        username: credentials.username,
        createdAt: new Date().toISOString(),
        stats: {
          totalTasks: 0,
          completedTasks: 0,
          pendingTasks: 0,
        },
      };
      storage.setProfile(profile);
    } else if (profile.username !== credentials.username) {
      // Обновляем username если изменился
      profile.username = credentials.username;
      storage.setProfile(profile);
    }
    
    return response;
  },

  logout: (): void => {
    storage.removeToken();
    storage.removeProfile();
  },
};

