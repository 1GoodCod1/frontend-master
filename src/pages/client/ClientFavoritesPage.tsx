import { useTranslation } from 'react-i18next';
import { PageHeader } from '@/components/ui/PageHeader';
import { ErrorState } from '@/components/common/States';
import { CardsSkeleton } from '@/components/common/Skeletons';
import { useClientFavorites } from '@/hooks/client/favorites/useClientFavorites';
import FavoriteCard from '@/components/client/favorites/FavoriteCard';
import FavoritesEmptyState from '@/components/client/favorites/FavoritesEmptyState';
import type { FavoriteDto } from '@/types';

export default function ClientFavoritesPage() {
  const { t } = useTranslation();
  const { favoritesList, isLoading, isError, error, refetch, handleRemove } = useClientFavorites();

  if (isLoading) return <CardsSkeleton count={5} />;
  if (isError) return <ErrorState error={error as Error} onRetry={refetch} />;

  return (
    <div className="mx-auto max-w-6xl py-6 md:py-8">
      <PageHeader
        title={t('clientDashboard.favorites')}
        subtitle={t('clientDashboard.favoritesSubtitle')}
      />

      {favoritesList.length === 0 ? (
        <FavoritesEmptyState />
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3">
          {favoritesList.map((fav: FavoriteDto) => (
            <FavoriteCard key={fav.id} favorite={fav} onRemove={handleRemove} />
          ))}
        </div>
      )}
    </div>
  );
}
