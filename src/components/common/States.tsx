import { useTranslation } from 'react-i18next';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { cn } from '@/lib/utils';
import { toErrorMessage } from '@/utils/errors';

export function LoadingState({
  label,
  fullScreen,
}: {
  label?: string;
  fullScreen?: boolean;
}) {
  const { t } = useTranslation();

  if (fullScreen) {
    return (
      <div
        className={cn(
          'flex min-h-screen items-center justify-center gap-4 bg-background'
        )}
      >
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        {label && <span className="text-foreground">{label}</span>}
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center gap-4 py-8">
      <Loader2 className="h-6 w-6 animate-spin text-primary" />
      <span className="text-muted-foreground">
        {label ?? t('common.loading')}
      </span>
    </div>
  );
}

export function ErrorState({
  error,
  onRetry,
}: {
  error?: unknown;
  onRetry?: () => void;
}) {
  const { t } = useTranslation();
  const message =
    typeof error === 'string'
      ? error
      : error
        ? toErrorMessage(error) ??
          (error instanceof Error ? error.message : JSON.stringify(error))
        : '';

  return (
    <div className="py-8 text-center">
      <Alert variant="destructive" className="mx-auto max-w-md text-left">
        <AlertTitle>{t('common.error')}</AlertTitle>
        <AlertDescription className="mb-2 opacity-90">
          {message}
        </AlertDescription>
      </Alert>
      {onRetry && (
        <Button variant="default" className="mt-4" onClick={onRetry}>
          {t('common.retry')}
        </Button>
      )}
    </div>
  );
}
