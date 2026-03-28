import { useMemo, useState } from 'react';
import { CreditCard, DollarSign, Clock, Calendar } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { usePaymentsMyQuery } from '@/features/payments/paymentsApi';
import { LoadingState, ErrorState } from '@/components/common/States';
import { PageHeader } from '@/components/ui/PageHeader';
import { EmptyState } from '@/components/ui/EmptyState';
import { StatusChip } from '@/components/ui/StatusChip';
import { unwrapList } from '@/utils/data';
import { formatDateTimeString, getLocaleFromLanguage } from '@/utils/date';
import {
  PAYMENT_STATUS_OPTIONS,
  type PaymentFilterStatus,
} from '@/types/payments';
import type { SortOrderNewestOldest } from '@/types/ui';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

type PaymentListItem = {
  id: string;
  tariffType?: string;
  amount?: string | number;
  currency?: string;
  status?: string;
  paidAt?: string;
  expiresAt?: string;
  createdAt?: string;
};

export default function PaymentsPage() {
  const { t, i18n } = useTranslation();
  const locale = getLocaleFromLanguage(i18n.language);
  const [statusFilter, setStatusFilter] = useState<PaymentFilterStatus>('ALL');
  const [sortOrder, setSortOrder] = useState<SortOrderNewestOldest>('newest');
  
  const q = usePaymentsMyQuery();

  const allItems = unwrapList<PaymentListItem>(q.data);
  
  const filteredAndSortedItems = useMemo(() => {
    let filtered = allItems;
    if (statusFilter !== 'ALL') {
      filtered = allItems.filter((p) => p.status === statusFilter);
    }
    const sorted = [...filtered].sort((a, b) => {
      const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      
      if (sortOrder === 'newest') {
        return dateB - dateA; 
      } else {
        return dateA - dateB; 
      }
    });
    
    return sorted;
  }, [allItems, statusFilter, sortOrder]);

  if (q.isLoading) return <LoadingState label={t('payments.loading')} />;
  if (q.isError) return <ErrorState error={q.error} onRetry={q.refetch} />;

  const formatAmount = (amount: string | number, currency = 'MDL') => {
    const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
    return `${Number.isNaN(numAmount) ? 0 : numAmount.toFixed(2)} ${currency}`;
  };

  const getTariffTypeLabel = (type: string) => t(`payments.tariff.${type.toLowerCase()}`);

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 md:py-8 lg:px-8">
      <div className="mb-8">
        <PageHeader title={t('payments.title')} subtitle={t('payments.subtitle')} />
      </div>

      <Card className="overflow-hidden border-transparent dark:border-white/[0.08] bg-white dark:bg-black/40 dark:backdrop-blur-xl shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.06)] dark:shadow-none transition duration-300">
        <div className="border-b border-slate-100 dark:border-white/[0.08] bg-slate-50/80 dark:bg-white/[0.04] px-6 py-5 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-emerald-500/10 p-2 text-emerald-600 dark:text-emerald-500">
              <CreditCard className="size-5" />
            </div>
            <h2 className="text-lg font-semibold text-foreground tracking-tight">{t('payments.myPayments')}</h2>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2">
              <Label className="sr-only">{t('payments.status')}</Label>
              <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as PaymentFilterStatus)}>
                <SelectTrigger className="min-w-[180px] rounded-lg border-slate-200 dark:border-white/[0.08] bg-white dark:bg-white/[0.06]">
                  <SelectValue placeholder={t('payments.status')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">{t('common.all')}</SelectItem>
                  {PAYMENT_STATUS_OPTIONS.map((s) => (
                    <SelectItem key={s} value={s}>
                      {t(`payments.${s.toLowerCase()}`)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-2">
              <Label className="sr-only">{t('payments.sortBy')}</Label>
              <Select value={sortOrder} onValueChange={(v) => setSortOrder(v as SortOrderNewestOldest)}>
                <SelectTrigger className="min-w-[180px] rounded-lg border-slate-200 dark:border-white/[0.08] bg-white dark:bg-white/[0.06]">
                  <SelectValue placeholder={t('payments.sortBy')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">{t('payments.newest')}</SelectItem>
                  <SelectItem value="oldest">{t('payments.oldest')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <CardContent className="p-6">
          {filteredAndSortedItems.length === 0 ? (
            <EmptyState title={t('payments.noPaymentsYet')} description={t('payments.noPaymentsDescription')} />
          ) : (
            <div className="space-y-4">
              {filteredAndSortedItems.map((payment) => (
                <Card
                  key={payment.id}
                  className="overflow-hidden border-transparent dark:border-white/[0.08] bg-white dark:bg-black/30 dark:backdrop-blur-sm shadow-[0_2px_10px_-3px_rgba(6,81,237,0.06)] hover:shadow-[0_6px_24px_rgb(0,0,0,0.06)] dark:shadow-none dark:hover:bg-white/[0.03] transition duration-300"
                >
                  <CardContent className="space-y-4 p-4 sm:p-6">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                      <div className="space-y-2">
                        <div className="flex flex-wrap items-center gap-2">
                          <CreditCard className="size-5 text-amber-600 dark:text-amber-500 opacity-70" />
                          <span className="text-lg font-bold">
                            {getTariffTypeLabel(payment?.tariffType ?? 'BASIC')}
                          </span>
                          <Badge variant="secondary" className="font-semibold">
                            {getTariffTypeLabel(payment?.tariffType ?? 'BASIC')}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-2">
                          <DollarSign className="size-5 text-green-600 dark:text-green-500 opacity-70" />
                          <span className="text-lg font-bold text-green-600 dark:text-green-500">
                            {formatAmount(payment?.amount ?? 0, payment?.currency ?? 'MDL')}
                          </span>
                        </div>
                      </div>
                      <StatusChip kind="payment" value={payment?.status} />
                    </div>

                    <Separator className="bg-slate-100 dark:bg-white/[0.08]" />

                    <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                      {payment?.paidAt && (
                        <span className="flex items-center gap-1.5">
                          <Calendar className="size-4 opacity-70" />
                          <strong className="text-foreground">{t('payments.paidAt')}:</strong>{' '}
                          {formatDateTimeString(payment.paidAt, locale)}
                        </span>
                      )}
                      {payment?.expiresAt && (
                        <span className="flex items-center gap-1.5">
                          <Calendar className="size-4 opacity-70" />
                          <strong className="text-foreground">{t('payments.expiresAt')}:</strong>{' '}
                          {formatDateTimeString(payment.expiresAt, locale)}
                        </span>
                      )}
                      {payment?.createdAt && (
                        <span className="flex items-center gap-1.5">
                          <Clock className="size-4 opacity-70" />
                          <strong className="text-foreground">{t('payments.createdAt')}:</strong>{' '}
                          {formatDateTimeString(payment.createdAt, locale)}
                        </span>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
