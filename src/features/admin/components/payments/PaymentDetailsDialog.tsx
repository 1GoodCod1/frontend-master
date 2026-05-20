import { useTranslation } from 'react-i18next';
import { CreditCard, DollarSign, Award } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { StatusChip } from '@/components/ui/StatusChip';
import { mediaUrl } from '@/utils/media';
import { formatDateTimeLong, getLocaleFromLanguage } from '@/utils/date';

type PaymentDetailsPayment = {
  id?: string;
  status?: string | null;
  amount?: string | number | null;
  currency?: string | null;
  tariffType?: string | null;
  plan?: string | null;
  type?: string | null;
  sessionId?: string | null;
  /** @deprecated DB field name */
  stripeSessionId?: string | null;
  createdAt?: string | null;
  updatedAt?: string | null;
  paidAt?: string | null;
  expiresAt?: string | null;
  master?: {
    avatarUrl?: string | null;
    avatarFile?: { path?: string | null } | null;
    user?: { firstName?: string | null; lastName?: string | null; email?: string | null } | null;
  } | null;
} & Record<string, unknown>;

interface PaymentDetailsDialogProps {
  open: boolean;
  payment: PaymentDetailsPayment | null;
  onClose: () => void;
}

function TariffBadge({ tariff }: { tariff: string }) {
  const tariffUpper = String(tariff).toUpperCase();
  const variant =
    tariffUpper === 'PLUS'
      ? 'destructive'
      : tariffUpper === 'PRO'
        ? 'secondary'
        : 'outline';
  return (
    <Badge variant={variant} className="font-semibold gap-1">
      <Award className="size-4" />
      {tariffUpper}
    </Badge>
  );
}

export default function PaymentDetailsDialog({
  open,
  payment,
  onClose,
}: PaymentDetailsDialogProps) {
  const { i18n } = useTranslation();
  const locale = getLocaleFromLanguage(i18n.language);
  if (!payment) return null;

  const tariff = payment.tariffType || payment.plan || payment.type || 'BASIC';
  const avatarPath = payment.master?.avatarFile?.path;
  const avatarUrl =
    typeof avatarPath === 'string' && avatarPath
      ? mediaUrl(avatarPath)
      : payment.master?.avatarUrl ?? undefined;

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent
        className="max-w-md sm:max-w-lg md:max-w-2xl gap-0 p-0 overflow-hidden animate-in fade-in-0 zoom-in-95 duration-200"
        onPointerDownOutside={onClose}
        onEscapeKeyDown={onClose}
      >
        <DialogHeader className="flex flex-row items-center justify-between gap-4 px-6 pt-6 pb-2">
          <div className="flex items-center gap-3">
            <div className="flex size-11 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-600 to-emerald-700 text-white shadow-md">
              <CreditCard className="size-6" />
            </div>
            <DialogTitle className="text-xl font-semibold">Payment Details</DialogTitle>
          </div>
        </DialogHeader>
        <div className="px-6 pb-6 space-y-4">
          <div
            className="flex flex-wrap items-center justify-center gap-2 animate-in fade-in slide-in-from-bottom-2 duration-300 delay-75 fill-mode-backwards"
          >
            <StatusChip kind="payment" value={String(payment.status ?? '')} />
            <Badge className="bg-emerald-600 hover:bg-emerald-600 text-white font-bold gap-1 px-3 py-1.5">
              <DollarSign className="size-4" />
              {payment.amount || 0} {payment.currency || 'MDL'}
            </Badge>
            <TariffBadge tariff={tariff} />
          </div>

          {payment.master && (
            <div
              className="rounded-xl border border-primary/20 bg-primary/5 p-4 animate-in fade-in slide-in-from-bottom-2 duration-300 delay-100 fill-mode-backwards"
            >
              <p className="text-sm font-semibold text-foreground mb-3">Master Information</p>
              <div className="flex items-center gap-3">
                <Avatar className="size-14 rounded-lg border-2 border-border bg-gradient-to-br from-primary to-primary/80 text-lg font-semibold">
                  <AvatarImage src={avatarUrl ?? undefined} className="object-cover" />
                  <AvatarFallback>{payment.master.user?.firstName?.[0]?.toUpperCase() || 'M'}</AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-foreground truncate">
                    {`${payment.master.user?.firstName || ''} ${payment.master.user?.lastName || ''}`.trim() || '—'}
                  </p>
                  {payment.master.user?.email && (
                    <p className="text-sm text-muted-foreground truncate">{payment.master.user.email}</p>
                  )}
                </div>
              </div>
            </div>
          )}

          <div
            className="rounded-xl border bg-muted/30 p-4 animate-in fade-in slide-in-from-bottom-2 duration-300 delay-150 fill-mode-backwards"
          >
            <p className="text-sm font-semibold text-foreground mb-3">Payment Details</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
              <div>
                <p className="text-muted-foreground mb-0.5">Payment ID</p>
                <p className="font-medium font-mono text-xs">{payment.id?.slice(0, 20)}...</p>
              </div>
              {payment.stripeSessionId && (
                <div>
                  <p className="text-muted-foreground mb-0.5">Session ID</p>
                  <p className="font-medium font-mono text-xs">{payment.stripeSessionId.slice(0, 30)}...</p>
                </div>
              )}
              <div>
                <p className="text-muted-foreground mb-0.5">Amount</p>
                <p className="font-bold text-emerald-600 dark:text-emerald-400">
                  {payment.amount || 0} {payment.currency || 'MDL'}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground mb-0.5">Type</p>
                <p className="font-semibold">{payment.type || 'SUBSCRIPTION'}</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div
              className="rounded-lg border border-primary/20 bg-primary/5 p-3 animate-in fade-in slide-in-from-bottom-2 duration-300 delay-200 fill-mode-backwards"
            >
              <p className="text-muted-foreground text-xs mb-0.5">Created</p>
              <p className="text-sm font-semibold">
                {payment.createdAt ? formatDateTimeLong(payment.createdAt, locale) : '—'}
              </p>
            </div>
            {payment.updatedAt && (
              <div
                className="rounded-lg border border-primary/20 bg-primary/5 p-3 animate-in fade-in slide-in-from-bottom-2 duration-300 delay-200 fill-mode-backwards"
              >
                <p className="text-muted-foreground text-xs mb-0.5">Updated</p>
                <p className="text-sm font-semibold">{formatDateTimeLong(payment.updatedAt, locale)}</p>
              </div>
            )}
          </div>
        </div>
        <Separator />
        <DialogFooter className="px-6 py-4">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
