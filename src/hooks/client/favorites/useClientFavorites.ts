import { useFavoritesQuery, useFavoritesRemoveMutation } from '@/features/favorites/favoritesApi';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import type { FavoriteDto } from '@/types';

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null;
}

function toErrorMessage(error: unknown): string | undefined {
  if (!isRecord(error)) return undefined;
  const data = isRecord(error.data) ? error.data : undefined;
  return (
    (typeof data?.message === 'string' ? data.message : undefined) ??
    (typeof error.message === 'string' ? error.message : undefined)
  );
}

export function useClientFavorites() {
  const { t } = useTranslation();
  const favorites = useFavoritesQuery();
  const [removeFavorite] = useFavoritesRemoveMutation();

  const favoritesList = (favorites.data ?? []) as FavoriteDto[];

  const handleRemove = async (masterId: string) => {
    try {
      await removeFavorite({ masterId }).unwrap();
      toast.success(t('favorites.removed'));
    } catch (error: unknown) {
      toast.error(toErrorMessage(error) ?? t('favorites.removeFailed'));
    }
  };

  return {
    favoritesList,
    isLoading: favorites.isLoading,
    isError: favorites.isError,
    error: favorites.error,
    refetch: favorites.refetch,
    handleRemove,
  };
}
