import { useTranslation } from 'react-i18next';
import { Hourglass } from 'lucide-react';
import { PageHeader } from '@/components/ui/PageHeader';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { formatDateTimeLong, getLocaleFromLanguage } from '@/utils/date';
import { mediaUrl } from '@/utils/media';
import { documentTypeLabelKey } from '@/constants/verificationDocumentType';
import type { VerificationData } from '@/types/verificationPage';

function getImageUrl(file: { url?: string; path?: string } | undefined) {
  if (!file) return null;
  const url = file.url ?? file.path;
  return url?.startsWith('http') ? url : mediaUrl(url);
}

export function VerificationPendingView({ verification }: { verification: VerificationData['verification'] }) {
  const { t, i18n } = useTranslation();
  const docTypeKey = verification?.documentType ? documentTypeLabelKey(verification.documentType) : null;
  const docTypeLabel = docTypeKey
    ? t(docTypeKey)
    : verification?.documentType
      ? verification.documentType
      : '-';
  const submittedDate = verification?.submittedAt
    ? formatDateTimeLong(verification.submittedAt, getLocaleFromLanguage(i18n.language))
    : '';

  return (
    <div className="mx-auto max-w-2xl px-4 py-6 md:py-8 lg:px-8">
      <div className="mb-8">
        <PageHeader title={t('verification.title')} subtitle={t('verification.pendingSubtitle')} />
      </div>

      <Card className="overflow-hidden border-transparent dark:border-white/[0.08] bg-white dark:bg-black/40 dark:backdrop-blur-xl shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.06)] dark:shadow-none transition duration-300">
        <CardContent className="space-y-6 p-6">
          <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <Hourglass className="size-14 shrink-0 text-amber-500 dark:text-amber-400" />
            <div className="text-center sm:text-left">
              <h2 className="text-xl font-bold">{t('verification.pending')}</h2>
              <Badge className="mt-2" variant="secondary">
                {t('verification.status.pending')}
              </Badge>
            </div>
          </div>

          <Alert className="rounded-lg border-slate-100 dark:border-white/[0.06] bg-slate-50/50 dark:bg-white/[0.04]">
            <AlertDescription>{t('verification.pendingMessage')}</AlertDescription>
          </Alert>

          <Separator className="bg-slate-100 dark:bg-white/[0.08]" />

          <div className="space-y-4">
            <h3 className="text-base font-semibold">{t('verification.requestDetails')}</h3>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">{t('verification.documentType')}</p>
                <p className="font-medium">{docTypeLabel}</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">{t('verification.documentNumber')}</p>
                <p className="font-medium">{verification?.documentNumber ?? '-'}</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">{t('verification.phone')}</p>
                <div className="flex items-center gap-2">
                  <p className="font-medium">{verification?.phone ?? '-'}</p>
                  {verification?.phoneVerified && (
                    <Badge variant="default" className="bg-emerald-600">
                      {t('verification.verifiedBadge')}
                    </Badge>
                  )}
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">{t('verification.submittedAt')}</p>
                <p className="font-medium">{submittedDate}</p>
              </div>
            </div>

            <Separator className="bg-slate-100 dark:bg-white/[0.08]" />

            <h3 className="text-base font-semibold">{t('verification.uploadedDocuments')}</h3>
            <div className="grid gap-4 sm:grid-cols-2">
              {verification?.documentFront && (
                <Card className="overflow-hidden border-transparent dark:border-white/[0.08] bg-white dark:bg-black/30 shadow-[0_2px_10px_-3px_rgba(6,81,237,0.06)] dark:shadow-none">
                  <button
                    type="button"
                    className="block w-full cursor-pointer border-0 bg-transparent p-0"
                    onClick={() => window.open(getImageUrl(verification.documentFront) ?? '', '_blank')}
                  >
                    <img
                      src={getImageUrl(verification.documentFront) ?? ''}
                      alt={t('verification.documentFront')}
                      className="h-48 w-full object-cover"
                    />
                  </button>
                  <div className="p-3">
                    <p className="text-sm font-semibold">{t('verification.documentFront')}</p>
                  </div>
                </Card>
              )}
              {verification?.documentBack && (
                <Card className="overflow-hidden border-transparent dark:border-white/[0.08] bg-white dark:bg-black/30 shadow-[0_2px_10px_-3px_rgba(6,81,237,0.06)] dark:shadow-none">
                  <button
                    type="button"
                    className="block w-full cursor-pointer border-0 bg-transparent p-0"
                    onClick={() => window.open(getImageUrl(verification.documentBack) ?? '', '_blank')}
                  >
                    <img
                      src={getImageUrl(verification.documentBack) ?? ''}
                      alt={t('verification.documentBack')}
                      className="h-48 w-full object-cover"
                    />
                  </button>
                  <div className="p-3">
                    <p className="text-sm font-semibold">{t('verification.documentBack')}</p>
                  </div>
                </Card>
              )}
              {verification?.selfie && (
                <Card className="overflow-hidden border-transparent dark:border-white/[0.08] bg-white dark:bg-black/30 shadow-[0_2px_10px_-3px_rgba(6,81,237,0.06)] dark:shadow-none">
                  <button
                    type="button"
                    className="block w-full cursor-pointer border-0 bg-transparent p-0"
                    onClick={() => window.open(getImageUrl(verification.selfie) ?? '', '_blank')}
                  >
                    <img
                      src={getImageUrl(verification.selfie) ?? ''}
                      alt={t('verification.selfie')}
                      className="h-48 w-full object-cover"
                    />
                  </button>
                  <div className="p-3">
                    <p className="text-sm font-semibold">{t('verification.selfie')}</p>
                  </div>
                </Card>
              )}
            </div>

            <Alert variant="destructive" className="rounded-lg">
              <AlertDescription>{t('verification.restrictionsActive')}</AlertDescription>
            </Alert>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
