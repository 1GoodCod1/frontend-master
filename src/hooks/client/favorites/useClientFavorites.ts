import { useFavoritesQuery, useFavoritesRemoveMutation } from '@/features/favorites/favoritesApi';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import type { FavoriteDto } from '@/types';
import { toErrorMessage } from '@/utils/errors';

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
