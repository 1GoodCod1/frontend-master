import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { CalendarDays } from 'lucide-react';
import { useAppSelector } from '@/app/hooks';
import { useLeadsByIdQuery } from '@/features/leads/leadsApi';
import { useBookingsCreateMutation, useBookingsAvailableSlotsQuery } from '@/features/bookings/bookingsApi';
import { PageHeader } from '@/components/ui/PageHeader';
import { ErrorState } from '@/components/common/States';
import { CardsSkeleton } from '@/components/common/Skeletons';
import { ClientFilterPill } from '@/components/client/ClientFilterPill';
import toast from 'react-hot-toast';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { CardContent } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import {
  clientCardStaticCls,
  clientFormLabelCls,
  clientInputCls,
  clientLinkCls,
  clientOutlineBtnCls,
  clientPageNarrowClassName,
  clientPrimaryBtnCls,
  clientTextareaCls,
  clientTextMuted,
} from '@/lib/clientCabinetStyles';
import { cabinetFilterPillCls } from '@/lib/cabinetStyles';

interface SlotData {
  start?: string;
  end?: string;
  available?: boolean;
}

function formatSlotTime(slot: SlotData): string {
  if (!slot.start) return '--:--';
  const d = new Date(slot.start);
  const h = d.getHours().toString().padStart(2, '0');
  const m = d.getMinutes().toString().padStart(2, '0');
  return `${h}:${m}`;
}

export default function ClientRequestBookingPage() {
  const { t } = useTranslation();
  const { leadId } = useParams<{ leadId: string }>();
  const navigate = useNavigate();
  const phoneVerified = useAppSelector((s) => s.auth.me?.phoneVerified);
  const [selectedDate, setSelectedDate] = useState<string>(() => new Date().toISOString().split('T')[0]);
  const [selectedSlotIndex, setSelectedSlotIndex] = useState<number | null>(null);
  const [notes, setNotes] = useState('');

  const leadQuery = useLeadsByIdQuery({ id: leadId ?? '' }, { skip: !leadId });
  const lead = leadQuery.data;
  const masterId = (lead as { masterId?: string })?.masterId ?? '';
  const master = (lead as { master?: { user?: { firstName?: string; lastName?: string } } })?.master;

  const availableSlots = useBookingsAvailableSlotsQuery(
    { masterId, date: selectedDate },
    { skip: !masterId || !selectedDate },
  );
  const [createBooking, createState] = useBookingsCreateMutation();

  const slots: SlotData[] = availableSlots.data?.slots ?? [];
  const masterName = master?.user
    ? [master.user.firstName, master.user.lastName].filter(Boolean).join(' ').trim()
    : '';

  const handleBooking = async () => {
    if (!leadId || !masterId) return;
    if (!selectedDate || selectedSlotIndex === null) {
      toast.error(t('bookings.selectDateTime'));
      return;
    }

    const slot = slots[selectedSlotIndex];
    if (!slot?.start || !slot?.end) {
      toast.error(t('bookings.selectDateTime'));
      return;
    }

    try {
      await createBooking({
        masterId,
        leadId,
        startTime: new Date(slot.start).toISOString(),
        endTime: new Date(slot.end).toISOString(),
        notes: notes || undefined,
      }).unwrap();

      const bookedTime = formatSlotTime(slot);
      navigate(`/client-dashboard/booking-success/${leadId}?date=${selectedDate}&time=${bookedTime}`);
    } catch (error: unknown) {
      const err = error as { data?: { message?: string }; message?: string };
      const msg = err?.data?.message || err?.message || t('bookings.createFailed');
      const isPhoneVerification = /phone|verification|verify/i.test(msg);
      if (isPhoneVerification) {
        toast.error(
          t('bookings.phoneVerificationRequired', 'Verify your phone number in profile settings to reserve time.'),
        );
      } else {
        toast.error(msg);
      }
    }
  };

  if (!leadId) {
    return <ErrorState error={{ message: t('leads.invalidLeadId') } as Error} onRetry={() => {}} />;
  }
  if (leadQuery.isLoading) return <CardsSkeleton count={3} />;
  if (leadQuery.isError) return <ErrorState error={leadQuery.error as Error} onRetry={leadQuery.refetch} />;
  if (!lead || !masterId) {
    return (
      <ErrorState error={{ message: t('leads.leadNotFound') } as Error} onRetry={() => navigate('/client-dashboard/leads')} />
    );
  }

  const canSubmit =
    !createState.isLoading && selectedDate && selectedSlotIndex !== null && phoneVerified !== false;

  return (
    <div className={cn(clientPageNarrowClassName, 'faber-page-enter py-4 md:py-6')}>
      <PageHeader
        title={t('bookings.chooseTime', 'Choose time')}
        subtitle={t('bookings.chooseTimeSubtitle', { name: masterName || t('masterDetails.masterLabel') })}
        crumbs={[
          { label: t('clientDashboard.title'), to: '/client-dashboard' },
          { label: t('clientDashboard.myLeads'), to: '/client-dashboard/leads' },
          { label: t('bookings.chooseTime', 'Choose time') },
        ]}
      />

      <div className={clientCardStaticCls}>
        <CardContent className="space-y-5 p-5 sm:p-6">
          {phoneVerified === false ? (
            <div
              className={cn(
                'rounded-[12px] border border-[#E97525]/35 bg-[#FFF8EB]/90 px-4 py-3 text-[13px] dark:bg-[#E97525]/10',
              )}
            >
              <p className="text-[#212529] dark:text-white/90">{t('bookings.phoneVerificationRequired')}</p>
              <Button
                type="button"
                variant="link"
                className={cn(clientLinkCls, 'mt-1 h-auto p-0 text-sm')}
                onClick={() => navigate('/client-dashboard/security')}
              >
                {t('common.settings', 'Settings')} →
              </Button>
            </div>
          ) : null}

          <div className="space-y-2">
            <Label htmlFor="booking-date" className={clientFormLabelCls}>
              {t('bookings.selectDate')}
            </Label>
            <input
              id="booking-date"
              type="date"
              value={selectedDate}
              onChange={(e) => {
                setSelectedDate(e.target.value);
                setSelectedSlotIndex(null);
              }}
              min={new Date().toISOString().split('T')[0]}
              className={clientInputCls}
            />
          </div>

          {selectedDate ? (
            <div className="space-y-2">
              <Label className={clientFormLabelCls}>{t('bookings.availableSlots')}</Label>
              {availableSlots.isLoading ? (
                <div className="flex flex-wrap gap-2">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className="h-8 w-16 animate-pulse rounded-[10px] bg-[#E9ECEF] dark:bg-white/10" />
                  ))}
                </div>
              ) : slots.length === 0 ? (
                <p className={clientTextMuted}>{t('bookings.noSlotsAvailable')}</p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {slots.map((slot: SlotData, index: number) => {
                    const isSelected = selectedSlotIndex === index;
                    const available = slot.available !== false;

                    if (!available) {
                      return (
                        <span
                          key={index}
                          className={cn(
                            cabinetFilterPillCls(false),
                            'cursor-not-allowed opacity-40',
                          )}
                        >
                          {formatSlotTime(slot)}
                        </span>
                      );
                    }

                    return (
                      <ClientFilterPill
                        key={index}
                        active={isSelected}
                        onClick={() => setSelectedSlotIndex(index)}
                        className="min-w-[4.5rem]"
                      >
                        {formatSlotTime(slot)}
                      </ClientFilterPill>
                    );
                  })}
                </div>
              )}
            </div>
          ) : null}

          <div className="space-y-2">
            <Label htmlFor="booking-notes" className={clientFormLabelCls}>
              {t('bookings.notes')}
            </Label>
            <Textarea
              id="booking-notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder={t('bookings.notesPlaceholder')}
              rows={3}
              className={cn(clientTextareaCls, 'min-h-[88px]')}
            />
          </div>

          <div className="flex flex-col gap-3 pt-1 sm:flex-row">
            <Button
              type="button"
              variant="outline"
              className={cn(clientOutlineBtnCls, 'sm:flex-1')}
              onClick={() => navigate(`/client-dashboard/lead-success/${leadId}`)}
            >
              {t('common.back')}
            </Button>
            <Button
              type="button"
              className={cn(clientPrimaryBtnCls, 'h-11 sm:flex-[2]')}
              onClick={handleBooking}
              disabled={!canSubmit}
            >
              <CalendarDays className="size-4" />
              {createState.isLoading ? t('common.loading') : t('bookings.createBooking')}
            </Button>
          </div>
        </CardContent>
      </div>
    </div>
  );
}
