import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { userApi } from '../api/userApi';
import { storage } from '../../../shared/lib/storage';
import type { UserProfile } from '../../../shared/types';

const PROFILE_QUERY_KEY = ['profile'] as const;

const getDefaultStats = () => ({
  totalTasks: 0,
  completedTasks: 0,
  pendingTasks: 0,
});

// Конвертируем ServerProfile в UserProfile с сохранением локальных stats
const mergeProfileWithStats = (serverProfile: Awaited<ReturnType<typeof userApi.getProfile>>): UserProfile => {
  const existing = storage.getProfile();
  return {
    username: serverProfile.username,
    email: serverProfile.email,
    bio: serverProfile.bio,
    createdAt: serverProfile.createdAt,
    stats: existing?.stats ?? getDefaultStats(),
  };
};

export const useProfileQuery = (enabled = false) => {
  return useQuery({
    queryKey: PROFILE_QUERY_KEY,
    queryFn: async () => {
      const serverProfile = await userApi.getProfile();
      const merged = mergeProfileWithStats(serverProfile);
      storage.setProfile(merged);
      return merged;
    },
    enabled, // Запрос выполняется только если enabled = true
    staleTime: 5 * 60 * 1000, // Кэш 5 минут
    retry: 1,
    // При ошибке берём данные из localStorage
    placeholderData: () => {
      const saved = storage.getProfile();
      return saved ?? undefined;
    },
  });
};

export const useUpdateProfileMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: { email?: string; bio?: string }) => {
      const serverProfile = await userApi.updateProfile(payload);
      const merged = mergeProfileWithStats(serverProfile);
      storage.setProfile(merged);
      return merged;
    },
    // Оптимистичное обновление - сразу обновляем UI, не ждём ответа сервера
    onMutate: async (payload) => {
      // Отменяем все исходящие запросы чтобы не перезаписать оптимистичное обновление
      await queryClient.cancelQueries({ queryKey: PROFILE_QUERY_KEY });

      // Сохраняем текущее состояние для отката
      const previousProfile = queryClient.getQueryData<UserProfile>(PROFILE_QUERY_KEY);

      // Оптимистично обновляем кэш
      queryClient.setQueryData<UserProfile>(PROFILE_QUERY_KEY, (old) => {
        if (!old) return old;
        return {
          ...old,
          ...payload,
        };
      });

      // Также обновляем localStorage сразу
      const current = storage.getProfile();
      if (current) {
        const updated = { ...current, ...payload };
        storage.setProfile(updated);
      }

      return { previousProfile };
    },
    // При ошибке откатываем изменения
    onError: (_err, _variables, context) => {
      if (context?.previousProfile) {
        queryClient.setQueryData(PROFILE_QUERY_KEY, context.previousProfile);
        storage.setProfile(context.previousProfile);
      }
    },
    // После успеха обновляем данными с сервера
    onSuccess: (data) => {
      queryClient.setQueryData(PROFILE_QUERY_KEY, data);
    },
    // После завершения (успех или ошибка) можем инвалидировать для перезапроса
    onSettled: () => {
      // Не инвалидируем, чтобы не делать лишний запрос на медленном сервере
    },
  });
};
