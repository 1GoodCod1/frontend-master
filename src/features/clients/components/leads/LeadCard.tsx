import React from 'react';
import { useTranslation } from 'react-i18next';
import { Link as RouterLink } from 'react-router-dom';
import { Mail, Clock, Phone, AtSign } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { formatDateShort, formatTimeOnly, getLocaleFromLanguage } from '@/utils/date';
import type { LeadCardProps } from '@/types/leads';
import { LeadStatusBadge } from '@/features/leads/components/LeadStatusBadge';
import LeaveReviewButton from './LeaveReviewButton';
import { LeadStatusProgress } from '@/features/leads/components/LeadStatusProgress';

const LeadCard = React.memo(function LeadCard({
  lead,
  onOpenReviewModal,
  reviewsSubmittedMasterIds,
}: LeadCardProps) {
  const { t, i18n } = useTranslation();
  const locale = getLocaleFromLanguage(i18n.language);

  const createdAt = lead.createdAt ? new Date(lead.createdAt) : null;
  const status = String((lead.status ?? 'NEW')).toUpperCase();
  const masterSlugOrId =
    lead.master?.slug ||
    (lead.master as { encodedId?: string })?.encodedId ||
    (lead.master?.id ? String(lead.master.id) : '') ||
    (lead.masterId ? String(lead.masterId) : '');

  return (
    <Card className="overflow-hidden border-border dark:border-white/[0.08] bg-card transition-all duration-200 hover:-translate-y-1 hover:shadow-lg hover:border-amber-500/50">
      <CardContent className="p-6">
        <div className="flex flex-col gap-4">
          <div className="flex flex-row flex-wrap items-start justify-between gap-2">
            <div className="flex-1">
              <div className="mb-2 flex flex-wrap items-center gap-2">
                <Mail className="size-5 shrink-0 text-primary" />
                <span className="text-lg font-semibold">
                  {lead.master?.user?.firstName} {lead.master?.user?.lastName}
                </span>
                <LeadStatusBadge status={status} />
              </div>
              <p className="mb-4 leading-relaxed text-foreground">{lead.message ?? '—'}</p>
            </div>
          </div>

          {/* Status Progress Tracker */}
          <LeadStatusProgress status={status} compact />

          <Separator className="bg-border" />

          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="size-4 shrink-0" />
              {createdAt ? (
                <>
                  {formatDateShort(createdAt, locale)} {formatTimeOnly(createdAt, locale)}
                </>
              ) : (
                '—'
              )}
            </div>
          </div>

          {(lead.master?.user?.phone || lead.master?.user?.email) && (
            <>
              <Separator className="bg-border" />
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                {t('clientDashboard.masterContact')}
              </p>
              <div className="flex flex-wrap gap-4">
                {lead.master?.user?.phone && (
                  <a
                    href={`tel:${lead.master.user.phone}`}
                    className="flex items-center gap-2 font-medium text-foreground no-underline hover:underline"
                  >
                    <Phone className="size-4 text-primary" />
                    {lead.master.user.phone}
                  </a>
                )}
                {lead.master?.user?.email && (
                  <a
                    href={`mailto:${lead.master.user.email}`}
                    className="flex items-center gap-2 font-medium text-foreground no-underline hover:underline"
                  >
                    <AtSign className="size-4 text-primary" />
                    {lead.master.user.email}
                  </a>
                )}
              </div>
            </>
          )}

          {lead.master && (
            <div className="flex flex-wrap gap-2">
              <LeaveReviewButton
                lead={lead}
                onOpenModal={onOpenReviewModal}
                reviewsSubmittedMasterIds={reviewsSubmittedMasterIds}
              />
              <Button size="sm" asChild className="border-0 bg-amber-600 text-white shadow-lg transition-all hover:-translate-y-0.5 hover:bg-amber-700 hover:shadow-xl dark:bg-amber-700 dark:hover:bg-amber-600">
                <RouterLink
                  to={`/masters/${masterSlugOrId}${status === 'CLOSED' ? '?review=1' : ''}`}
                >
                  {t('clientDashboard.viewMaster')}
                </RouterLink>
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
});
export default LeadCard;
