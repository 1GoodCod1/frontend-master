import { useTranslation } from 'react-i18next';
import { Link as RouterLink } from 'react-router-dom';
import { Heart } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function FavoritesEmptyState() {
  const { t } = useTranslation();

  return (
    <Card className="border-border bg-card text-center">
      <CardContent className="p-10">
        <div className="mx-auto mb-6 flex size-24 items-center justify-center rounded-full bg-red-500/10 shadow-sm">
          <Heart className="size-12 text-red-600 dark:text-red-400 opacity-60" />
        </div>
        <h3 className="mb-2 text-xl font-bold text-foreground">
          {t('favorites.noFavorites')}
        </h3>
        <p className="mx-auto max-w-md text-muted-foreground">
          {t('favorites.noFavoritesDescription')}
        </p>
        <Button asChild size="lg" className="mt-6 font-semibold">
          <RouterLink to="/masters">{t('clientDashboard.browseMasters')}</RouterLink>
        </Button>
      </CardContent>
    </Card>
  );
}
