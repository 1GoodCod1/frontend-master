import { useMemo, useState } from 'react';
import { CreditCard, DollarSign, Clock, Calendar } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { usePaymentsMyQuery } from '@/features/payments/paymentsApi';
import { LoadingState, ErrorState } from '@/components/common/States';
import { PageHeader } from '@/components/ui/PageHeader';
import { CabinetEmptyState } from '@/components/cabinet/CabinetEmptyState';
import { StatusChip } from '@/components/ui/StatusChip';
import { unwrapList } from '@/utils/data';
import { formatDateTimeString, getLocaleFromLanguage } from '@/utils/date';
import {
  PAYMENT_STATUS_OPTIONS,
  type PaymentFilterStatus,
} from '@/types/payments';
import type { SortOrderNewestOldest } from '@/types/ui';
import { CardContent } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import {
  masterCardCls,
  masterCardStaticCls,
  masterIconWrapCls,
  masterPageClassName,
  masterSectionTitleCls,
  masterSelectTriggerCls,
  masterTextBody,
  masterTextMuted,
} from '@/lib/masterCabinetStyles';

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
      return sortOrder === 'newest' ? dateB - dateA : dateA - dateB;
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
    <div className={masterPageClassName}>
      <PageHeader title={t('payments.title')} subtitle={t('payments.subtitle')} />

      <div className={cn(masterCardStaticCls, 'overflow-hidden')}>
        <div className="flex flex-col gap-4 border-b border-[#e8e8e8] px-6 py-5 dark:border-[#2d2d2d] sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <span className={masterIconWrapCls}>
              <CreditCard className="size-5" />
            </span>
            <h2 className={masterSectionTitleCls}>{t('payments.myPayments')}</h2>
          </div>
          <div className="flex flex-row flex-wrap items-center gap-3">
            <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as PaymentFilterStatus)}>
              <SelectTrigger className={cn(masterSelectTriggerCls, 'min-w-[180px]')} aria-label={t('payments.status')}>
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
            <Select value={sortOrder} onValueChange={(v) => setSortOrder(v as SortOrderNewestOldest)}>
              <SelectTrigger className={cn(masterSelectTriggerCls, 'min-w-[180px]')} aria-label={t('payments.sortBy')}>
                <SelectValue placeholder={t('payments.sortBy')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">{t('payments.newest')}</SelectItem>
                <SelectItem value="oldest">{t('payments.oldest')}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <CardContent className="p-6">
          {filteredAndSortedItems.length === 0 ? (
            <CabinetEmptyState
              icon={CreditCard}
              title={t('payments.noPaymentsYet')}
              description={t('payments.noPaymentsDescription')}
            />
          ) : (
            <div className="flex flex-col gap-4">
              {filteredAndSortedItems.map((payment) => (
                <div key={payment.id} className={masterCardCls}>
                  <CardContent className="space-y-4 p-4 sm:p-6">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                      <div className="space-y-2">
                        <div className="flex flex-wrap items-center gap-2">
                          <CreditCard className="size-5 text-[#E97525] opacity-80" />
                          <span className={cn('text-lg font-bold', masterSectionTitleCls)}>
                            {getTariffTypeLabel(payment?.tariffType ?? 'BASIC')}
                          </span>
                          <Badge variant="secondary" className="font-semibold">
                            {getTariffTypeLabel(payment?.tariffType ?? 'BASIC')}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-2">
                          <DollarSign className="size-5 text-emerald-600 opacity-80 dark:text-emerald-400" />
                          <span className="text-lg font-bold text-emerald-600 dark:text-emerald-400">
                            {formatAmount(payment?.amount ?? 0, payment?.currency ?? 'MDL')}
                          </span>
                        </div>
                      </div>
                      <StatusChip kind="payment" value={payment?.status} />
                    </div>

                    <Separator className="bg-[#e8e8e8] dark:bg-[#2d2d2d]" />

                    <div className={cn('flex flex-wrap gap-4', masterTextMuted)}>
                      {payment?.paidAt && (
                        <span className="flex items-center gap-1.5">
                          <Calendar className="size-4 opacity-70" />
                          <strong className={masterTextBody}>{t('payments.paidAt')}:</strong>{' '}
                          {formatDateTimeString(payment.paidAt, locale)}
                        </span>
                      )}
                      {payment?.expiresAt && (
                        <span className="flex items-center gap-1.5">
                          <Calendar className="size-4 opacity-70" />
                          <strong className={masterTextBody}>{t('payments.expiresAt')}:</strong>{' '}
                          {formatDateTimeString(payment.expiresAt, locale)}
                        </span>
                      )}
                      {payment?.createdAt && (
                        <span className="flex items-center gap-1.5">
                          <Clock className="size-4 opacity-70" />
                          <strong className={masterTextBody}>{t('payments.createdAt')}:</strong>{' '}
                          {formatDateTimeString(payment.createdAt, locale)}
                        </span>
                      )}
                    </div>
                  </CardContent>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </div>
    </div>
  );
}
