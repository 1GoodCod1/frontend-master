import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { CalendarDays } from 'lucide-react';
import { useMastersByIdQuery } from '@/features/masters/mastersApi';
import { useBookingsCreateMutation, useBookingsAvailableSlotsQuery } from '@/features/bookings/bookingsApi';
import { useAppSelector } from '@/app/hooks';
import { selectIsAuthed } from '@/features/auth/selectors';
import { ErrorState } from '@/components/common/States';
import { DetailSkeleton } from '@/components/common/Skeletons';
import toast from 'react-hot-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { toErrorMessage } from '@/utils/errors';
import { formatSlotTime } from '@/utils/date';

interface SlotData {
  start?: string;
  end?: string;
  available?: boolean;
}

/** Direct booking by master slug — requires ClientRoute. */
export default function DirectBookingPage() {
  const { t } = useTranslation();
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const isAuthed = useAppSelector(selectIsAuthed);
  const phoneVerified = useAppSelector((s) => s.auth.me?.phoneVerified);
  const slugOrId = slug ?? '';

  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [selectedSlotIndex, setSelectedSlotIndex] = useState<number | null>(null);
  const [clientPhone, setClientPhone] = useState('');
  const [clientName, setClientName] = useState('');
  const [notes, setNotes] = useState('');

  const master = useMastersByIdQuery({ id: slugOrId }, { skip: !slugOrId });
  const [createBooking, createState] = useBookingsCreateMutation();

  type MasterDataShape = { id?: string; data?: { id?: string; user?: { firstName?: string; lastName?: string } }; user?: { firstName?: string; lastName?: string } };
  const masterData = master.data as MasterDataShape | null | undefined;
  const masterId = masterData?.data?.id ?? masterData?.id ?? '';

  const availableSlots = useBookingsAvailableSlotsQuery(
    { masterId, date: selectedDate },
    { skip: !master.data || !selectedDate }
  );

  if (!slugOrId) return <ErrorState error={{ message: 'Invalid master identifier' }} onRetry={() => { }} />;
  if (master.isLoading) return <DetailSkeleton />;
  if (master.isError) return <ErrorState error={master.error} onRetry={master.refetch} />;

  const m = masterData?.data ?? masterData ?? null;

  const slots: SlotData[] = availableSlots.data?.slots ?? [];

  const handleBooking = async () => {
    if (!selectedDate || selectedSlotIndex === null) {
      toast.error(t('bookings.selectDateTime'));
      return;
    }
    if (!clientPhone) {
      toast.error(t('bookings.phoneRequired'));
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
        startTime: new Date(slot.start).toISOString(),
        endTime: new Date(slot.end).toISOString(),
        notes: notes || undefined,
        clientPhone,
        clientName: clientName || undefined,
      }).unwrap();

      toast.success(t('bookings.created'));
      navigate(`/masters/${slug}`);
    } catch (error: unknown) {
      toast.error(toErrorMessage(error) ?? t('bookings.createFailed'));
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="container max-w-3xl mx-auto py-6 md:py-8 px-4"
    >
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-foreground">
          {t('bookings.title')}
        </h1>
        <p className="text-muted-foreground mt-1">
          {t('bookings.subtitle', { name: `${m?.user?.firstName || ''} ${m?.user?.lastName || ''}`.trim() })}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="border-border">
          <CardContent className="p-6">
            <h2 className="text-lg font-bold mb-4 text-foreground">
              {t('bookings.selectDateTime')}
            </h2>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="booking-date">{t('bookings.selectDate')}</Label>
                <Input
                  id="booking-date"
                  type="date"
                  value={selectedDate}
                  onChange={(e) => {
                    setSelectedDate(e.target.value);
                    setSelectedSlotIndex(null);
                  }}
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full"
                />
              </div>

              {selectedDate && (
                <div>
                  <Label className="mb-2 block font-semibold">{t('bookings.availableSlots')}</Label>
                  <div className="flex flex-wrap gap-2">
                    {slots.map((slot: SlotData, index: number) => {
                      const isSelected = selectedSlotIndex === index;

                      return (
                        <Badge
                          key={index}
                          variant={isSelected ? 'default' : 'outline'}
                          className={cn(
                            'cursor-pointer transition-all',
                            !slot.available && 'opacity-50 cursor-not-allowed'
                          )}
                          onClick={() => slot.available && setSelectedSlotIndex(index)}
                        >
                          {formatSlotTime(slot)}
                        </Badge>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="border-border">
          <CardContent className="p-6">
            <h2 className="text-lg font-bold mb-4 text-foreground">
              {t('bookings.contactInfo')}
            </h2>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="booking-phone">{t('bookings.phone')} *</Label>
                <Input
                  id="booking-phone"
                  value={clientPhone}
                  onChange={(e) => setClientPhone(e.target.value)}
                  placeholder="+37360000000"
                  className="w-full"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="booking-name">{t('bookings.name')}</Label>
                <Input
                  id="booking-name"
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  placeholder={t('bookings.namePlaceholder')}
                  className="w-full"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="booking-notes">{t('bookings.notes')}</Label>
                <Textarea
                  id="booking-notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder={t('bookings.notesPlaceholder')}
                  rows={3}
                  className="w-full resize-none"
                />
              </div>

              {!isAuthed && (
                <Alert className="border-primary/30 bg-primary/5">
                  <AlertDescription>{t('bookings.loginHint')}</AlertDescription>
                </Alert>
              )}

              {isAuthed && phoneVerified === false && (
                <Alert className="border-amber-500/50 bg-amber-500/10">
                  <AlertDescription>
                    {t('bookings.phoneVerificationRequired', 'Verify your phone number in profile settings to reserve time.')}
                    <Button
                      variant="link"
                      className="mt-2 h-auto p-0 text-primary"
                      onClick={() => navigate('/client-dashboard/profile')}
                    >
                      {t('common.settings', 'Settings')} →
                    </Button>
                  </AlertDescription>
                </Alert>
              )}

              <Button
                size="lg"
                className="w-full gap-2"
                onClick={handleBooking}
                disabled={createState.isLoading || !selectedDate || selectedSlotIndex === null || !clientPhone || (isAuthed && phoneVerified === false)}
              >
                <CalendarDays className="h-4 w-4" />
                {createState.isLoading ? t('common.loading') : t('bookings.createBooking')}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </motion.div>
  );
}
