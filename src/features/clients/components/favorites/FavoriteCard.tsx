import { useTranslation } from 'react-i18next';
import { Link as RouterLink } from 'react-router-dom';
import { Trash2, Heart, MapPin, FolderOpen, Star } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { mediaUrl } from '@/utils/media';
import { getTranslatedCityName, getTranslatedCategoryName } from '@/utils/translateCityCategory';
import type { FavoriteDto } from '@/types';

interface FavoriteCardProps {
  favorite: FavoriteDto;
  onRemove: (masterId: string) => void;
}

export default function FavoriteCard({ favorite, onRemove }: FavoriteCardProps) {
  const { t } = useTranslation();
  const master = favorite.master;
  const avatarUrl = master?.avatarFile ? mediaUrl(master.avatarFile.path) : null;
  const fullName = [master?.user?.firstName, master?.user?.lastName].filter(Boolean).join(' ').trim() || master?.displayName || 'Master';

  return (
    <Card className="flex h-full flex-col overflow-hidden border-border dark:border-white/[0.08] bg-card transition-all duration-200 hover:-translate-y-1 hover:shadow-lg hover:border-amber-500/50">
      {avatarUrl ? (
        <div className="relative h-48 w-full overflow-hidden bg-muted">
          <img
            src={avatarUrl}
            alt={fullName}
            className="h-full w-full object-cover"
          />
        </div>
      ) : (
        <div className="flex h-48 items-center justify-center bg-primary/10">
          <Heart className="size-16 text-red-500/30" />
        </div>
      )}
      <CardContent className="flex flex-1 flex-col p-6">
        <div className="flex flex-1 flex-col gap-4">
          <h3 className="text-lg font-bold text-foreground">{fullName}</h3>
          <div className="flex flex-wrap gap-2">
            {master?.category && (
              <Badge variant="secondary" className="gap-1 font-semibold">
                <FolderOpen className="size-4" />
                {getTranslatedCategoryName(t, master.category)}
              </Badge>
            )}
            {master?.city && (
              <Badge variant="outline" className="gap-1 font-semibold">
                <MapPin className="size-4" />
                {getTranslatedCityName(t, master.city)}
              </Badge>
            )}
            {typeof master?.rating === 'number' && (
              <Badge className="gap-1 bg-amber-500/15 font-semibold text-amber-600 dark:text-amber-400 border-amber-500/30">
                <Star className="size-4" />
                {master.rating.toFixed(1)}
              </Badge>
            )}
          </div>
        </div>
        <div className="mt-4 flex gap-2">
          <Button asChild className="flex-1 border-0 font-semibold bg-amber-600 text-white shadow-lg transition-all hover:-translate-y-0.5 hover:bg-amber-700 hover:shadow-xl dark:bg-amber-700 dark:hover:bg-amber-600" size="default">
            <RouterLink to={`/masters/${master?.slug ?? master?.id}`}>
              {t('common.view')}
            </RouterLink>
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="shrink-0 border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground"
            onClick={() => master?.id && onRemove(master.id)}
            aria-label={t('common.delete')}
          >
            <Trash2 className="size-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
