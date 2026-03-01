import { useAuthEarlyBirdStatusQuery } from '@/features/auth/authApi';

export function useEarlyBirdStatus() {
  const { data, isLoading, error } = useAuthEarlyBirdStatusQuery();

  // Если ошибка, возвращаем fallback значения
  const status = error 
    ? { isActive: false, remainingSlots: 0, totalSlots: 50 }
    : data ?? null;

  return { status, loading: isLoading };
}
