import { useEffect } from 'react';
import {
  useRouteError,
  isRouteErrorResponse,
  useNavigate,
} from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { RefreshCw, Home, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

const RELOAD_KEY = 'chunk-reload-ts';
const RELOAD_COOLDOWN_MS = 10_000;

function isChunkError(message: string): boolean {
  return (
    message.includes('Failed to fetch dynamically imported module') ||
    message.includes('Importing a module script failed') ||
    message.includes('error loading dynamically imported module') ||
    message.includes('ChunkLoadError')
  );
}

export function RouteErrorBoundary() {
  const error = useRouteError();
  const { t } = useTranslation();
  const navigate = useNavigate();

  let errorMessage = t('common.errors.unexpected');

  if (isRouteErrorResponse(error)) {
    errorMessage = error.statusText || error.data?.message || errorMessage;
  } else if (error instanceof Error) {
    errorMessage = error.message;
  }

  const chunkError = isChunkError(errorMessage) ||
    (error instanceof Error && error.name === 'ChunkLoadError');

  useEffect(() => {
    if (!chunkError) return;
    const lastReload = Number(sessionStorage.getItem(RELOAD_KEY) || 0);
    if (Date.now() - lastReload > RELOAD_COOLDOWN_MS) {
      sessionStorage.setItem(RELOAD_KEY, String(Date.now()));
      window.location.reload();
    }
  }, [chunkError]);

  const handleReload = () => {
    window.location.reload();
  };

  const handleGoHome = () => {
    navigate('/');
  };

  return (
    <div className="mx-auto max-w-md py-16">
      <div className="rounded-xl border border-border bg-card p-8 text-center shadow-lg dark:shadow-black/40">
        <div className="mb-8 inline-flex rounded-full bg-destructive/15 p-4 text-destructive">
          <AlertCircle className="h-16 w-16" />
        </div>

        <h1 className="mb-2 text-2xl font-extrabold">
          {chunkError
            ? t('common.errors.updateTitle')
            : t('common.errors.errorOccurred')}
        </h1>

        <p className="mb-6 text-muted-foreground">
          {chunkError ? t('common.errors.updateMessage') : errorMessage}
        </p>

        {chunkError && (
          <p className="mb-6 text-xs italic opacity-70">{errorMessage}</p>
        )}

        <div className="flex flex-col justify-center gap-3 sm:flex-row">
          <Button
            size="lg"
            className="font-semibold"
            onClick={handleReload}
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            {t('common.reload')}
          </Button>
          <Button
            variant="outline"
            size="lg"
            className="font-semibold"
            onClick={handleGoHome}
          >
            <Home className="mr-2 h-4 w-4" />
            {t('common.goHome')}
          </Button>
        </div>
      </div>
    </div>
  );
}
