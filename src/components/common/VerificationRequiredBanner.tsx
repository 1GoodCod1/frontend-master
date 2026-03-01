import { useTranslation } from 'react-i18next';
import { Link as RouterLink } from 'react-router-dom';
import { ShieldCheck } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';

type Role = 'MASTER' | 'CLIENT';

interface VerificationRequiredBannerProps {
  role: Role;
  isVerified: boolean;
}

export function VerificationRequiredBanner({
  role,
  isVerified,
}: VerificationRequiredBannerProps) {
  const { t } = useTranslation();

  if (isVerified) return null;
  if (role !== 'MASTER' && role !== 'CLIENT') return null;

  const verificationPath =
    role === 'MASTER' ? '/dashboard/verification' : '/client-dashboard/profile';
  const messageKey =
    role === 'MASTER'
      ? 'verificationBanner.messageMaster'
      : 'verificationBanner.messageClient';

  return (
    <Alert className="mb-4 rounded-lg border-amber-500/50 bg-amber-500/10">
      <ShieldCheck className="h-4 w-4" />
      <AlertTitle className="font-bold">
        {t('verificationBanner.title')}
      </AlertTitle>
      <AlertDescription className="mt-1 flex flex-wrap items-center gap-3">
        <span className="flex-1">{t(messageKey)}</span>
        <Button asChild size="sm" className="shrink-0 bg-amber-600 font-semibold hover:bg-amber-700">
          <RouterLink to={verificationPath}>
            {t('verificationBanner.verifyNow')}
          </RouterLink>
        </Button>
      </AlertDescription>
    </Alert>
  );
}
