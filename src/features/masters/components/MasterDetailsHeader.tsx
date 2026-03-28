import { Link as RouterLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { CalendarDays, Heart } from 'lucide-react';
import { PageHeader } from '@/components/ui/PageHeader';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface MasterDetailsHeaderProps {
  title: string;
  subtitle: string;
  slug: string;
  isFavorite: boolean;
  onToggleFavorite: () => void;
  favoriteLoading: boolean;
  favoriteAnimation: boolean;
  isClient: boolean;
  isOwnProfile?: boolean;
}

export const MasterDetailsHeader = ({
  title,
  subtitle,
  slug,
  isFavorite,
  onToggleFavorite,
  favoriteLoading,
  favoriteAnimation,
  isClient,
  isOwnProfile = false,
}: MasterDetailsHeaderProps) => {
  const { t } = useTranslation();

  return (
    <PageHeader
      title={title}
      subtitle={subtitle}
      crumbs={[
        { label: t('nav.home'), to: '/' },
        { label: t('nav.masters'), to: '/masters' },
        { label: title },
      ]}
      actions={
        <div className="flex flex-wrap items-center gap-2">
          {isClient && (
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={onToggleFavorite}
              disabled={favoriteLoading}
              className={cn(
                'transition duration-300 ease-out',
                isFavorite
                  ? 'border-[#DC143C] bg-[#DC143C]/10 text-[#DC143C] hover:bg-[#DC143C]/20 hover:border-[#B22222]'
                  : 'border-border hover:border-primary hover:bg-accent',
                favoriteAnimation && 'animate-[favoritePulse_0.6s_ease-in-out]'
              )}
              style={
                favoriteAnimation
                  ? undefined
                  : { transform: isFavorite ? 'scale(1.1)' : undefined }
              }
            >
              <Heart
                className={cn(
                  'h-6 w-6 transition',
                  isFavorite &&
                    'fill-[#DC143C] text-[#DC143C] drop-shadow-[0_0_6px_rgba(220,20,60,0.6)]'
                )}
              />
            </Button>
          )}
          {isClient && !isOwnProfile && (
            <Button asChild className="font-semibold transition hover:-translate-y-0.5">
              <a href="#lead-form" data-master-slug={slug}>
                <CalendarDays className="h-4 w-4" />
                {t('masterDetails.leaveRequest', 'Leave request')}
              </a>
            </Button>
          )}
          <Button asChild variant="outline" className="border-border hover:border-primary hover:bg-primary/5">
            <RouterLink to="/masters">{t('common.back')}</RouterLink>
          </Button>
        </div>
      }
    />
  );
};
