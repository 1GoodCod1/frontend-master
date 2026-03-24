import { useTranslation } from 'react-i18next';
import { Link as RouterLink } from 'react-router-dom';
import { Heart } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function FavoritesEmptyState() {
  const { t } = useTranslation();

  return (
    <Card className="flex flex-col items-center justify-center border-dashed border-black/10 bg-black/[0.02] p-12 text-center dark:border-white/10 dark:bg-white/[0.02]">
      <div className="mb-4 flex size-14 items-center justify-center rounded-full bg-red-100/50 text-red-500 dark:bg-red-500/10">
        <Heart className="size-6 fill-red-500/20" />
      </div>
      <h3 className="mb-2 text-lg font-bold text-foreground">
        {t('favorites.noFavorites')}
      </h3>
      <p className="mx-auto max-w-sm text-sm text-muted-foreground">
        {t('favorites.noFavoritesDescription')}
      </p>
      <Button asChild size="default" className="mt-6 rounded-xl bg-amber-600 text-white shadow-lg shadow-amber-500/20 transition-all hover:scale-[1.02] hover:bg-amber-700 dark:bg-amber-600 dark:hover:bg-amber-700">
        <RouterLink to="/masters">{t('clientDashboard.browseMasters')}</RouterLink>
      </Button>
    </Card>
  );
}
