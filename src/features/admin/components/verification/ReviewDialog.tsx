import { useTranslation } from 'react-i18next';
import { CheckCircle, XCircle, Award } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogBody,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { LoadingState, ErrorState } from '@/components/common/States';
import { Badge } from '@/components/ui/badge';
import { mediaUrl } from '@/utils/media';
import type { VerificationDetail } from '@/features/verification/verificationApi';

interface ReviewDialogProps {
  open: boolean;
  detail: VerificationDetail | null;
  isLoadingDetail: boolean;
  detailError: unknown;
  onRefetchDetail: () => void;
  decision: 'APPROVE' | 'REJECT';
  notes: string;
  isReviewing: boolean;
  onDecisionChange: (decision: 'APPROVE' | 'REJECT') => void;
  onNotesChange: (notes: string) => void;
  onClose: () => void;
  onReview: () => void;
}

function docImageSrc(path: string) {
  return path?.startsWith('http') ? path : mediaUrl(path);
}

export default function ReviewDialog({
  open,
  detail,
  isLoadingDetail,
  detailError,
  onRefetchDetail,
  decision,
  notes,
  isReviewing,
  onDecisionChange,
  onNotesChange,
  onClose,
  onReview,
}: ReviewDialogProps) {
  const { t } = useTranslation();

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-amber-500/15 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400">
              <Award className="size-4" />
            </div>
            {t('verification.reviewRequest')}
          </DialogTitle>
        </DialogHeader>

        <DialogBody>

          {isLoadingDetail ? (
            <div className="animate-in fade-in duration-200">
              <LoadingState />
            </div>
          ) : detailError ? (
            <div className="animate-in fade-in duration-200">
              <ErrorState error={detailError} onRetry={onRefetchDetail} />
            </div>
          ) : detail ? (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
              {/* Master Info */}
              <section className="animate-in fade-in slide-in-from-bottom-2 duration-300 delay-75 fill-mode-backwards">
                <h3 className="text-sm font-semibold text-foreground mb-3">{t('verification.masterInfo')}</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-muted-foreground">{t('verification.name')}</p>
                    {(() => {
                      const u = detail.master?.user;
                      if (!u) {
                        return <p className="text-sm font-medium">—</p>;
                      }
                      const full = [u.firstName, u.lastName].filter(Boolean).join(' ').trim();
                      if (full) {
                        return <p className="text-sm font-medium">{full}</p>;
                      }
                      if (u.email) {
                        return (
                          <p className="text-sm text-muted-foreground leading-snug">
                            {t('verification.nameNotInProfile')} {t('verification.nameSeeEmailBelow')}
                          </p>
                        );
                      }
                      return <p className="text-sm font-medium">—</p>;
                    })()}
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">{t('verification.email')}</p>
                    <p className="text-sm font-medium">{detail.master?.user?.email ?? '—'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">{t('verification.phone')}</p>
                    <p className="text-sm font-medium">{detail.phone ?? '—'}</p>
                    <Badge variant={detail.phoneVerified ? 'default' : 'secondary'} className="mt-1">
                      {detail.phoneVerified ? 'Verified' : 'Not Verified'}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">{t('verification.category')}</p>
                    <p className="text-sm font-medium">{detail.master?.category?.name || '—'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">{t('verification.city')}</p>
                    <p className="text-sm font-medium">{detail.master?.city?.name || '—'}</p>
                  </div>
                </div>
              </section>

              <Separator />

              <section className="animate-in fade-in slide-in-from-bottom-2 duration-300 delay-100 fill-mode-backwards">
                <h3 className="text-sm font-semibold text-foreground mb-3">{t('verification.documentInfo')}</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-muted-foreground">{t('verification.documentType')}</p>
                    <p className="text-sm font-medium">{detail.documentType ?? '—'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">{t('verification.documentNumber')}</p>
                    <p className="text-sm font-medium">{detail.documentNumber ?? '—'}</p>
                  </div>
                </div>
              </section>

              <Separator />

              <section className="animate-in fade-in slide-in-from-bottom-2 duration-300 delay-150 fill-mode-backwards">
                <h3 className="text-sm font-semibold text-foreground mb-3">{t('verification.documents')}</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {detail.documentFront && (
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">{t('verification.documentFront')}</p>
                      <img
                        src={docImageSrc(detail.documentFront.path)}
                        alt="Document front"
                        className="w-full max-h-[300px] object-contain rounded-md border border-border"
                      />
                    </div>
                  )}
                  {detail.documentBack && (
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">{t('verification.documentBack')}</p>
                      <img
                        src={docImageSrc(detail.documentBack.path)}
                        alt="Document back"
                        className="w-full max-h-[300px] object-contain rounded-md border border-border"
                      />
                    </div>
                  )}
                  {detail.selfie && (
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">{t('verification.selfie')}</p>
                      <img
                        src={docImageSrc(detail.selfie.path)}
                        alt="Selfie"
                        className="w-full max-h-[300px] object-contain rounded-md border border-border"
                      />
                    </div>
                  )}
                </div>
              </section>

              {detail && (
                <Alert
                  variant="default"
                  className="animate-in fade-in slide-in-from-bottom-2 duration-300 delay-200 fill-mode-backwards rounded-lg"
                >
                  <Award className="size-4" />
                  <AlertDescription>
                    {t('verification.ifApproveFreePlan')}
                  </AlertDescription>
                </Alert>
              )}

              <Separator />

              <section className="animate-in fade-in slide-in-from-bottom-2 duration-300 delay-300 fill-mode-backwards">
                <h3 className="text-sm font-semibold text-foreground mb-3">{t('verification.review')}</h3>
                <div className="flex flex-col sm:flex-row gap-3">
                  <Button
                    variant={decision === 'APPROVE' ? 'default' : 'outline'}
                    className="flex-1 gap-2 bg-emerald-600 hover:bg-emerald-700"
                    onClick={() => onDecisionChange('APPROVE')}
                  >
                    <CheckCircle className="size-4" />
                    {t('verification.approve')}
                  </Button>
                  <Button
                    variant={decision === 'REJECT' ? 'destructive' : 'outline'}
                    className="flex-1 gap-2"
                    onClick={() => onDecisionChange('REJECT')}
                  >
                    <XCircle className="size-4" />
                    {t('verification.reject')}
                  </Button>
                </div>
                {decision === 'REJECT' && (
                  <div className="mt-4 space-y-2 animate-in fade-in duration-200">
                    <Label>{t('verification.rejectionReason')}</Label>
                    <Textarea
                      value={notes}
                      onChange={(e) => onNotesChange(e.target.value)}
                      rows={3}
                      className="resize-none"
                      required
                    />
                  </div>
                )}
              </section>
            </div>
          ) : null}
        </DialogBody>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            {t('common.cancel')}
          </Button>
          <Button
            onClick={onReview}
            variant={decision === 'APPROVE' ? 'default' : 'destructive'}
            className={decision === 'APPROVE' ? 'bg-emerald-600 hover:bg-emerald-700' : ''}
            disabled={isReviewing || (decision === 'REJECT' && !notes.trim())}
          >
            {isReviewing ? t('verification.reviewing') : t('common.confirm')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
