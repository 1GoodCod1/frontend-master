import { useTranslation } from 'react-i18next';
import { Link as RouterLink } from 'react-router-dom';
import { Heart, MapPin, FolderOpen, Star } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AvatarPlaceholder } from '@/components/ui/AvatarPlaceholder';
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
  const fullName = [master?.user?.firstName, master?.user?.lastName].filter(Boolean).join(' ').trim() || master?.displayName || t('reports.unknownMaster', 'Unknown Master');

  return (
    <Card className="group relative flex flex-col overflow-hidden rounded-2xl border border-black/5 bg-card shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-amber-500/30 hover:shadow-md dark:border-white/5 dark:bg-card/40 dark:hover:border-amber-500/30">
      <div className="absolute inset-0 bg-gradient-to-br from-amber-500/0 via-transparent to-amber-500/0 opacity-0 transition-opacity duration-300 group-hover:from-amber-500/5 group-hover:to-transparent group-hover:opacity-100" />
      
      <div className="relative flex items-center gap-4 p-5">
        <div className="relative size-16 shrink-0 overflow-hidden rounded-full border border-black/10 bg-muted shadow-sm dark:border-white/10 dark:bg-white/5">
          {avatarUrl ? (
            <img src={avatarUrl} alt={fullName} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110" />
          ) : (
            <AvatarPlaceholder id={master?.id} name={fullName} role="master" fillParent height={64} />
          )}
        </div>
        
        <div className="flex flex-1 flex-col justify-center overflow-hidden pr-6">
          <div className="flex items-start justify-between gap-2">
            <h3 className="truncate text-base font-bold text-foreground transition-colors group-hover:text-amber-600 dark:group-hover:text-amber-500">
              {fullName}
            </h3>
          </div>
          <div className="mt-0.5 flex items-center gap-2 text-xs text-muted-foreground opacity-90">
             {master?.category && (
               <div className="flex items-center gap-1 truncate">
                 <FolderOpen className="size-3 shrink-0" />
                 <span className="truncate">{getTranslatedCategoryName(t, master.category)}</span>
               </div>
             )}
          </div>
          <div className="mt-1 flex items-center gap-3 text-xs text-muted-foreground opacity-90">
            {master?.city && (
              <div className="flex items-center gap-1">
                <MapPin className="size-3 shrink-0" />
                <span className="truncate">{getTranslatedCityName(t, master.city)}</span>
              </div>
            )}
            {typeof master?.rating === 'number' && (
              <div className="flex items-center gap-1 font-medium text-amber-600 dark:text-amber-400">
                <Star className="size-3 shrink-0 fill-amber-500 text-amber-500" />
                <span>{master.rating.toFixed(1)}</span>
              </div>
            )}
          </div>
        </div>

        <Button
          variant="ghost"
          size="icon"
          className="absolute right-3 top-3 size-8 shrink-0 rounded-full bg-transparent text-red-500 transition-colors hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-500/20"
          onClick={(e) => { e.preventDefault(); e.stopPropagation(); master?.id && onRemove(master.id); }}
          aria-label={t('common.delete')}
        >
          <Heart className="size-4 fill-red-500 drop-shadow-sm transition-transform group-hover:scale-110" />
        </Button>
      </div>

      <div className="relative border-t border-black/5 bg-black/[0.02] p-2 dark:border-white/5 dark:bg-white/[0.02]">
        <Button asChild variant="ghost" className="w-full justify-center rounded-xl text-sm font-semibold text-foreground transition-colors hover:bg-amber-100/50 hover:text-amber-700 dark:hover:bg-amber-500/10 dark:hover:text-amber-400">
          <RouterLink to={`/masters/${master?.slug ?? master?.id}`}>
            {t('common.view')}
          </RouterLink>
        </Button>
      </div>
    </Card>
  );
}
