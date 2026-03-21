import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { CalendarPlus, User, Phone, MessageSquare } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CreateBookingFromRequestModal } from './CreateBookingFromRequestModal';
import { formatDateShort, getLocaleFromLanguage } from '@/utils/date';
import { cn } from '@/lib/utils';

export interface RequestWithoutBooking {
  id: string;
  clientName?: string | null;
  clientPhone: string;
  message?: string;
  createdAt: string;
  master?: {
    id: string;
    user?: { firstName?: string; lastName?: string };
  };
}

interface MasterRequestsWithoutBookingColumnProps {
  leads: RequestWithoutBooking[];
  masterId: string;
  onBookingCreated?: () => void;
}

export function MasterRequestsWithoutBookingColumn({
  leads,
  masterId,
  onBookingCreated,
}: MasterRequestsWithoutBookingColumnProps) {
  const { t, i18n } = useTranslation();
  const locale = getLocaleFromLanguage(i18n.language);
  const [modalLead, setModalLead] = useState<RequestWithoutBooking | null>(null);

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
        {t('bookings.leadsWithoutBooking', 'Requests without booking')}
      </h3>
      {leads.length === 0 ? (
        <p className="text-sm text-muted-foreground">{t('bookings.noLeadsWithoutBooking', 'No requests waiting for a time slot.')}</p>
      ) : (
        <div className="flex flex-col gap-3">
          {leads.map((lead) => (
            <Card
              key={lead.id}
              className={cn(
                'border-border dark:border-white/[0.08] transition-colors rounded-xl overflow-hidden',
                modalLead?.id === lead.id && 'ring-2 ring-amber-500/50',
              )}
            >
              <CardContent className="p-4 space-y-3">
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <span className="text-xs font-mono font-medium text-amber-600 dark:text-amber-500">
                    {t('bookings.fromLead')} #{String(lead.id).slice(0, 8)}
                  </span>
                  <span className="text-xs text-muted-foreground">{formatDateShort(lead.createdAt, locale)}</span>
                </div>
                <div className="flex items-center gap-2 font-medium">
                  <User className="size-4 shrink-0 text-amber-600 dark:text-amber-500" />
                  <span>{lead.clientName || lead.clientPhone}</span>
                </div>
                {lead.clientPhone && lead.clientName !== lead.clientPhone && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Phone className="size-4 shrink-0" />
                    <span>{lead.clientPhone}</span>
                  </div>
                )}
                {lead.message && (
                  <div className="flex gap-2 text-sm">
                    <MessageSquare className="size-4 shrink-0 mt-0.5 text-muted-foreground" />
                    <p className="line-clamp-2 text-muted-foreground">{lead.message}</p>
                  </div>
                )}
                <Button
                  size="sm"
                  className="w-full gap-2 bg-amber-600 hover:bg-amber-700"
                  onClick={() => setModalLead(lead)}
                >
                  <CalendarPlus className="size-4" />
                  {t('bookings.assignTime', 'Assign time')}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {modalLead && (
        <CreateBookingFromRequestModal
          open={!!modalLead}
          onOpenChange={(open) => !open && setModalLead(null)}
          masterId={masterId}
          leadId={modalLead.id}
          leadClientName={modalLead.clientName}
          leadClientPhone={modalLead.clientPhone}
          onSuccess={() => {
            onBookingCreated?.();
          }}
        />
      )}
    </div>
  );
}
