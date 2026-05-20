import { useTranslation } from 'react-i18next';
import { Link as RouterLink } from 'react-router-dom';
import { Heart, MapPin, FolderOpen, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AvatarPlaceholder } from '@/components/ui/AvatarPlaceholder';
import { mediaUrl } from '@/utils/media';
import { getTranslatedCityName, getTranslatedCategoryName } from '@/utils/translateCityCategory';
import { cn } from '@/lib/utils';
import {
  clientCardCls,
  clientTextBody,
  clientTextMuted,
  clientTextTitle,
} from '@/lib/clientCabinetStyles';
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
    <div className={cn(clientCardCls, 'flex flex-col overflow-hidden')}>
      <div className="relative flex items-center gap-4 p-5">
        <div className="relative size-16 shrink-0 overflow-hidden rounded-full border border-[#e8e8e8] bg-muted shadow-sm dark:border-[#2d2d2d]">
          {avatarUrl ? (
            <img src={avatarUrl} alt={fullName} className="h-full w-full object-cover" />
          ) : (
            <AvatarPlaceholder id={master?.id} name={fullName} role="master" fillParent height={64} />
          )}
        </div>

        <div className="flex flex-1 flex-col justify-center overflow-hidden pr-6">
          <h3 className={cn('truncate text-base font-semibold', clientTextTitle)}>{fullName}</h3>
          {master?.category && (
            <div className={cn('mt-0.5 flex items-center gap-1 truncate', clientTextMuted)}>
              <FolderOpen className="size-3 shrink-0" />
              <span className="truncate">{getTranslatedCategoryName(t, master.category)}</span>
            </div>
          )}
          <div className={cn('mt-1 flex items-center gap-3', clientTextMuted)}>
            {master?.city && (
              <div className="flex items-center gap-1">
                <MapPin className="size-3 shrink-0" />
                <span className="truncate">{getTranslatedCityName(t, master.city)}</span>
              </div>
            )}
            {typeof master?.rating === 'number' && (
              <div className="flex items-center gap-1 font-medium text-[#E97525]">
                <Star className="size-3 shrink-0 fill-[#E97525] text-[#E97525]" />
                <span>{master.rating.toFixed(1)}</span>
              </div>
            )}
          </div>
        </div>

        <Button
          variant="ghost"
          size="icon"
          className="absolute right-3 top-3 size-8 shrink-0 rounded-full text-red-500 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-500/20"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            if (master?.id) onRemove(master.id);
          }}
          aria-label={t('common.delete')}
        >
          <Heart className="size-4 fill-red-500" />
        </Button>
      </div>

      <div className="border-t border-[#e8e8e8] bg-[hsl(var(--secondary)/0.35)] p-2 dark:border-[#2d2d2d] dark:bg-white/[0.03]">
        <Button
          asChild
          variant="ghost"
          className={cn('w-full justify-center rounded-[12px] text-[13px] font-semibold', clientTextBody, 'hover:bg-[#E97525]/10 hover:text-[#c45f1a]')}
        >
          <RouterLink to={`/masters/${master?.slug ?? master?.id}`}>{t('common.view')}</RouterLink>
        </Button>
      </div>
    </div>
  );
}
