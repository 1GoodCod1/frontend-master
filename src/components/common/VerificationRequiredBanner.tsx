import { useTranslation } from 'react-i18next';
import { Link as RouterLink } from 'react-router-dom';
import { ShieldCheck, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { surfaceCardCls } from '@/lib/surfaceCard';
import { USER_ROLE } from '@/constants/roles';

type BannerRole = typeof USER_ROLE.MASTER | typeof USER_ROLE.CLIENT;

interface VerificationRequiredBannerProps {
  role: BannerRole;
  isVerified: boolean;
  className?: string;
}

export function VerificationRequiredBanner({
  role,
  isVerified,
  className,
}: VerificationRequiredBannerProps) {
  const { t } = useTranslation();

  if (isVerified) return null;
  if (role !== USER_ROLE.MASTER && role !== USER_ROLE.CLIENT) return null;

  const verificationPath =
    role === USER_ROLE.MASTER
      ? '/dashboard/verification'
      : '/client-dashboard/profile';
  const messageKey =
    role === USER_ROLE.MASTER
      ? 'verificationBanner.messageMaster'
      : 'verificationBanner.messageClient';

  const message = t(messageKey);
  const isMaster = role === USER_ROLE.MASTER;

  return (
    <div
      role="alert"
      className={cn(
        'mb-3 flex flex-col gap-2.5 rounded-[14px] border px-3 py-2.5 sm:flex-row sm:items-center sm:gap-3 sm:px-3.5 sm:py-2.5',
        surfaceCardCls,
        'border-[#E97525]/25 dark:border-[#E97525]/20',
        className,
      )}
    >
      <div className="flex min-w-0 flex-1 items-start gap-2.5 sm:items-center">
        <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-[10px] bg-[#FFF8EB] text-[#E97525] dark:bg-[#E97525]/12 sm:mt-0">
          <ShieldCheck className="h-4 w-4" strokeWidth={2} />
        </span>
        <p className="min-w-0 text-[13px] leading-snug text-[#495057] dark:text-white/70">
          <span className="font-semibold text-[#212529] dark:text-white">
            {t('verificationBanner.title')}
          </span>
          <span className="mx-1.5 hidden text-[#CED4DA] dark:text-white/20 sm:inline" aria-hidden>
            ·
          </span>
          <span
            className={cn('block sm:inline', isMaster && 'line-clamp-2 sm:line-clamp-1')}
            title={isMaster ? message : undefined}
          >
            {message}
          </span>
        </p>
      </div>

      <RouterLink
        to={verificationPath}
        className={cn(
          'inline-flex h-8 shrink-0 items-center justify-center gap-1 self-start rounded-[10px] px-3',
          'text-[12px] font-semibold whitespace-nowrap',
          'bg-[#E97525] text-white hover:bg-[#d86920]',
          'transition-colors duration-200',
          'sm:self-center',
        )}
      >
        {t('verificationBanner.verifyNow')}
        <ArrowRight className="h-3.5 w-3.5" strokeWidth={2.5} />
      </RouterLink>
    </div>
  );
}
