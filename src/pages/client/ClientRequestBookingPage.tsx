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
import toast from 'react-hot-toast';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { cn } from '@/lib/utils';

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
        toast.error(t('bookings.phoneVerificationRequired', 'Verify your phone number in profile settings to reserve time.'));
      } else {
        toast.error(msg);
      }
    }
  };

  if (!leadId) {
    return <ErrorState error={{ message: t('leads.invalidLeadId') } as Error} onRetry={() => { }} />;
  }
  if (leadQuery.isLoading) return <CardsSkeleton count={3} />;
  if (leadQuery.isError) return <ErrorState error={leadQuery.error as Error} onRetry={leadQuery.refetch} />;
  if (!lead || !masterId) {
    return <ErrorState error={{ message: t('leads.leadNotFound') } as Error} onRetry={() => navigate('/client-dashboard/leads')} />;
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-6 md:py-8">
      <PageHeader
        title={t('bookings.chooseTime', 'Choose time')}
        subtitle={t('bookings.chooseTimeSubtitle', { name: masterName || t('masterDetails.masterLabel') })}
        crumbs={[
          { label: t('clientDashboard.title'), to: '/client-dashboard' },
          { label: t('clientDashboard.myLeads'), to: '/client-dashboard/leads' },
          { label: t('bookings.chooseTime', 'Choose time') },
        ]}
      />

      <Card className="border-border dark:border-white/[0.08]">
        <CardContent className="p-6 space-y-6">
          {phoneVerified === false && (
            <Alert className="border-amber-500/50 bg-amber-500/10">
              <AlertDescription>
                {t('bookings.phoneVerificationRequired')}
                <Button
                  variant="link"
                  className="mt-2 h-auto p-0 text-primary"
                  onClick={() => navigate('/client-dashboard/security')}
                >
                  {t('common.settings', 'Settings')} →
                </Button>
              </AlertDescription>
            </Alert>
          )}
          <div className="space-y-2">
            <Label htmlFor="booking-date">{t('bookings.selectDate')}</Label>
            <input
              id="booking-date"
              type="date"
              value={selectedDate}
              onChange={(e) => {
                setSelectedDate(e.target.value);
                setSelectedSlotIndex(null);
              }}
              min={new Date().toISOString().split('T')[0]}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            />
          </div>

          {selectedDate && (
            <div>
              <Label className="mb-2 block font-semibold">{t('bookings.availableSlots')}</Label>
              <div className="flex flex-wrap gap-2">
                {Array.isArray(slots) &&
                  slots.map((slot: SlotData, index: number) => {
                    const isSelected = selectedSlotIndex === index;
                    const available = slot.available !== false;

                    return (
                      <Badge
                        key={index}
                        variant={isSelected ? 'default' : 'outline'}
                        className={cn(
                          'cursor-pointer transition-all',
                          !available && 'opacity-50 cursor-not-allowed',
                        )}
                        onClick={() => available && setSelectedSlotIndex(index)}
                      >
                        {formatSlotTime(slot)}
                      </Badge>
                    );
                  })}
              </div>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="booking-notes">{t('bookings.notes')}</Label>
            <Textarea
              id="booking-notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder={t('bookings.notesPlaceholder')}
              rows={3}
              className="resize-none"
            />
          </div>

          <Button
            size="lg"
            className="w-full gap-2"
            onClick={handleBooking}
            disabled={createState.isLoading || !selectedDate || selectedSlotIndex === null || phoneVerified === false}
          >
            <CalendarDays className="h-4 w-4" />
            {createState.isLoading ? t('common.loading') : t('bookings.createBooking')}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
