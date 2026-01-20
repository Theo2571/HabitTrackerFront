import { apiRequest } from '../../../shared/api/base';

export type ServerProfile = {
  username: string;
  email?: string;
  bio?: string;
  createdAt: string;
};

export type UpdateProfilePayload = {
  email?: string;
  bio?: string;
};

export const userApi = {
  getProfile: async (): Promise<ServerProfile> => {
    return apiRequest<ServerProfile>('/users/me', {
      method: 'GET',
    });
  },

  updateProfile: async (payload: UpdateProfilePayload): Promise<ServerProfile> => {
    return apiRequest<ServerProfile>('/users/me', {
      method: 'PUT',
      body: payload, // axios автоматически сериализует объект в JSON
    });
  },
};
