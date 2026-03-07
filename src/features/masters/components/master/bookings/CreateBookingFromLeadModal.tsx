import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { CalendarDays, Clock, User } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogBody,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useBookingsCreateMutation, useBookingsAvailableSlotsQuery } from '@/features/bookings/bookingsApi';
import toast from 'react-hot-toast';
import { cn } from '@/lib/utils';

interface CreateBookingFromLeadModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  masterId: string;
  leadId: string;
  leadClientName?: string | null;
  leadClientPhone?: string;
  onSuccess?: () => void;
}

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

export function CreateBookingFromLeadModal({
  open,
  onOpenChange,
  masterId,
  leadId,
  leadClientName,
  leadClientPhone,
  onSuccess,
}: CreateBookingFromLeadModalProps) {
  const { t } = useTranslation();
  const [selectedDate, setSelectedDate] = useState<string>(() =>
    new Date().toISOString().split('T')[0],
  );
  const [selectedSlotIndex, setSelectedSlotIndex] = useState<number | null>(null);
  const [notes, setNotes] = useState('');

  const availableSlots = useBookingsAvailableSlotsQuery(
    { masterId, date: selectedDate },
    { skip: !open || !masterId || !selectedDate },
  );
  const [createBooking, createState] = useBookingsCreateMutation();

  const slots: SlotData[] = availableSlots.data?.slots ?? [];

  const handleSubmit = async () => {
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
      toast.success(t('bookings.created'));
      onOpenChange(false);
      onSuccess?.();
      setSelectedSlotIndex(null);
      setNotes('');
    } catch (error: unknown) {
      const err = error as { data?: { message?: string }; message?: string };
      toast.error(err?.data?.message || err?.message || t('bookings.createFailed'));
    }
  };

  const handleOpenChange = (next: boolean) => {
    if (!next) {
      setSelectedSlotIndex(null);
      setNotes('');
    }
    onOpenChange(next);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-amber-500/15 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400">
              <CalendarDays className="size-4" />
            </div>
            {t('bookings.assignTime', 'Assign time')}
          </DialogTitle>
        </DialogHeader>

        <DialogBody>
          <div className="space-y-5">
            {/* Client info */}
            {(leadClientName || leadClientPhone) && (
              <div className="flex items-center gap-3 rounded-xl border border-border/60 bg-muted/30 px-4 py-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground">
                  <User className="size-4" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs text-muted-foreground">{t('bookings.client')}</p>
                  <p className="text-sm font-medium text-foreground truncate">
                    {leadClientName || leadClientPhone}
                  </p>
                </div>
              </div>
            )}

            {/* Date picker */}
            <div className="space-y-2">
              <Label htmlFor="modal-booking-date" className="text-sm font-semibold">
                {t('bookings.selectDate')}
              </Label>
              <input
                id="modal-booking-date"
                type="date"
                value={selectedDate}
                onChange={(e) => {
                  setSelectedDate(e.target.value);
                  setSelectedSlotIndex(null);
                }}
                min={new Date().toISOString().split('T')[0]}
                className="flex h-10 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              />
            </div>

            {/* Available slots */}
            {selectedDate && (
              <div>
                <Label className="mb-3 block text-sm font-semibold">
                  <Clock className="inline size-3.5 mr-1.5 -mt-0.5" />
                  {t('bookings.availableSlots')}
                </Label>
                {availableSlots.isLoading ? (
                  <div className="flex items-center justify-center h-16 rounded-xl border border-border bg-muted/20">
                    <div className="size-5 rounded-full border-2 border-amber-500 border-t-transparent animate-spin" />
                  </div>
                ) : slots.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4 rounded-xl border border-dashed border-border bg-muted/20">
                    {t('bookings.noSlots', 'No available slots')}
                  </p>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {slots.map((slot: SlotData, index: number) => {
                      const isSelected = selectedSlotIndex === index;
                      const available = slot.available !== false;
                      return (
                        <button
                          key={index}
                          onClick={() => available && setSelectedSlotIndex(index)}
                          disabled={!available}
                          className={cn(
                            'h-9 px-3.5 rounded-xl text-sm font-medium border transition-all duration-150',
                            isSelected
                              ? 'bg-amber-500 text-white border-amber-500 shadow-md shadow-amber-500/25'
                              : available
                                ? 'border-border bg-background text-foreground hover:border-amber-400 hover:bg-amber-50/60 dark:hover:border-amber-500/50 dark:hover:bg-amber-500/10'
                                : 'border-border bg-muted/30 text-muted-foreground/50 cursor-not-allowed line-through',
                          )}
                        >
                          {formatSlotTime(slot)}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* Notes */}
            <div className="space-y-2">
              <Label htmlFor="modal-booking-notes" className="text-sm font-semibold">
                {t('bookings.notes')}
              </Label>
              <Textarea
                id="modal-booking-notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder={t('bookings.notesPlaceholder')}
                rows={2}
                className="resize-none"
              />
            </div>

            {/* Submit */}
            <Button
              size="lg"
              className="w-full gap-2"
              onClick={handleSubmit}
              disabled={createState.isLoading || !selectedDate || selectedSlotIndex === null}
            >
              {createState.isLoading ? (
                <>
                  <span className="size-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                  {t('common.loading')}
                </>
              ) : (
                <>
                  <CalendarDays className="h-4 w-4" />
                  {t('bookings.createBooking')}
                </>
              )}
            </Button>
          </div>
        </DialogBody>
      </DialogContent>
    </Dialog>
  );
}
