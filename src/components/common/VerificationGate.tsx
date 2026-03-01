import { useTranslation } from 'react-i18next';
import { Link as RouterLink } from 'react-router-dom';
import { ShieldCheck, Lock } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

interface VerificationGateProps {
  isVerified: boolean;
  children: React.ReactNode;
  /** Translation key for the blocked message (e.g. verificationBanner.servicesPromotionsBlocked) */
  messageKey?: string;
}

/**
 * Blocks content (services, promotions) until the master is verified.
 * Shows a banner and placeholder when not verified.
 */
export function VerificationGate({
  isVerified,
  children,
  messageKey = 'verificationBanner.servicesPromotionsBlocked',
}: VerificationGateProps) {
  const { t } = useTranslation();

  if (isVerified) return <>{children}</>;

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 md:py-8 lg:px-8 space-y-6">
      <Alert className="rounded-xl border-amber-500/30 bg-amber-500/5 dark:bg-amber-500/10">
        <ShieldCheck className="size-5 text-amber-600 dark:text-amber-500" />
        <AlertTitle className="font-bold text-foreground">
          {t('verificationBanner.title')}
        </AlertTitle>
        <AlertDescription className="mt-1 flex flex-wrap items-center gap-3">
          <span className="flex-1">{t(messageKey)}</span>
          <Button asChild size="sm" className="shrink-0 bg-amber-600 font-semibold hover:bg-amber-700">
            <RouterLink to="/dashboard/verification">
              {t('verificationBanner.verifyNow')}
            </RouterLink>
          </Button>
        </AlertDescription>
      </Alert>

      <Card className="border-dashed border-2 border-muted">
        <CardContent className="flex flex-col items-center justify-center py-16 text-center">
          <Lock className="size-12 text-muted-foreground/50 mb-4" />
          <p className="text-muted-foreground font-medium max-w-md">
            {t(messageKey)}
          </p>
          <Button asChild className="mt-4 bg-amber-600 hover:bg-amber-700">
            <RouterLink to="/dashboard/verification">
              {t('verificationBanner.verifyNow')}
            </RouterLink>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
