import { useTranslation } from 'react-i18next';
import { Link as RouterLink } from 'react-router-dom';
import { Heart } from 'lucide-react';
import { ClientEmptyState } from '@/components/client/ClientEmptyState';
import { clientPrimaryBtnCls } from '@/lib/clientCabinetStyles';

export default function FavoritesEmptyState() {
  const { t } = useTranslation();

  return (
    <ClientEmptyState
      icon={Heart}
      title={t('favorites.noFavorites')}
      description={t('favorites.noFavoritesDescription')}
      action={
        <RouterLink to="/masters" className={clientPrimaryBtnCls}>
          {t('clientDashboard.browseMasters')}
        </RouterLink>
      }
    />
  );
}
