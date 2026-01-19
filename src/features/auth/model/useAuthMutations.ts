import { useMutation } from '@tanstack/react-query';
import { authApi } from '../api/authApi';
import type { LoginCredentials, RegisterCredentials } from '../../../shared/types';

export const useLoginMutation = () => {
  return useMutation({
    mutationFn: authApi.login,
  });
};

export const useRegisterMutation = () => {
  return useMutation({
    mutationFn: authApi.register,
  });
};

