import { useState, useMemo, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Calendar, Clock, ChevronLeft, ChevronRight } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useBookingsAvailableSlotsQuery } from '@/features/bookings/bookingsApi';
import '../portfolio/portfolio.css';

interface BookingCalendarWidgetProps {
    masterId: string;
    masterSlug: string;
    masterName?: string;
}

const DAY_NAMES = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];
const MONTH_NAMES = [
    'Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
    'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь',
];

function getMonthDays(year: number, month: number) {
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();

    // getDay() returns 0=Sun..6=Sat, we need 0=Mon..6=Sun
    let startDayOfWeek = firstDay.getDay() - 1;
    if (startDayOfWeek < 0) startDayOfWeek = 6;

    const days: (number | null)[] = [];
    for (let i = 0; i < startDayOfWeek; i++) days.push(null);
    for (let i = 1; i <= daysInMonth; i++) days.push(i);
    return days;
}

export const BookingCalendarWidget = ({
    masterId,
    masterSlug,
    masterName: _masterName,
}: BookingCalendarWidgetProps) => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const today = useMemo(() => new Date(), []);

    const [currentMonth, setCurrentMonth] = useState(today.getMonth());
    const [currentYear, setCurrentYear] = useState(today.getFullYear());
    const [selectedDate, setSelectedDate] = useState<string | null>(null);
    const [selectedSlotIndex, setSelectedSlotIndex] = useState<number | null>(null);

    const days = useMemo(
        () => getMonthDays(currentYear, currentMonth),
        [currentYear, currentMonth],
    );

    const slotsQuery = useBookingsAvailableSlotsQuery(
        { masterId, date: selectedDate ?? '' },
        { skip: !selectedDate || !masterId },
    );

    const slots = useMemo(() => {
        const data = (slotsQuery.data as any)?.data ?? slotsQuery.data;
        return data?.slots ?? [];
    }, [slotsQuery.data]);

    const availableSlots = useMemo(
        () => slots.filter((s: any) => s.available),
        [slots],
    );

    const handlePrevMonth = () => {
        if (currentMonth === 0) {
            setCurrentMonth(11);
            setCurrentYear((y) => y - 1);
        } else {
            setCurrentMonth((m) => m - 1);
        }
        setSelectedDate(null);
        setSelectedSlotIndex(null);
    };

    const handleNextMonth = () => {
        if (currentMonth === 11) {
            setCurrentMonth(0);
            setCurrentYear((y) => y + 1);
        } else {
            setCurrentMonth((m) => m + 1);
        }
        setSelectedDate(null);
        setSelectedSlotIndex(null);
    };

    const handleDayClick = useCallback((day: number) => {
        const date = new Date(currentYear, currentMonth, day);
        const isPast = date < new Date(today.getFullYear(), today.getMonth(), today.getDate());
        if (isPast) return;
        const dateStr = date.toISOString().split('T')[0];
        setSelectedDate(dateStr);
        setSelectedSlotIndex(null);
    }, [currentYear, currentMonth, today]);

    const handleBooking = () => {
        if (selectedDate && selectedSlotIndex !== null) {
            const slot = availableSlots[selectedSlotIndex];
            if (slot) {
                const params = new URLSearchParams({
                    date: selectedDate,
                    start: slot.start,
                    end: slot.end,
                });
                navigate(`/masters/${masterSlug}?tab=booking&${params.toString()}`);
            }
        } else {
            navigate(`/masters/${masterSlug}?tab=booking${selectedDate ? `&date=${selectedDate}` : ''}`);
        }
    };

    const isToday = (day: number) => {
        return (
            day === today.getDate() &&
            currentMonth === today.getMonth() &&
            currentYear === today.getFullYear()
        );
    };

    const isPast = (day: number) => {
        const date = new Date(currentYear, currentMonth, day);
        return date < new Date(today.getFullYear(), today.getMonth(), today.getDate());
    };

    const isSelected = (day: number) => {
        if (!selectedDate) return false;
        const date = new Date(currentYear, currentMonth, day);
        return date.toISOString().split('T')[0] === selectedDate;
    };

    return (
        <Card className="bg-card border-2 border-[#f5f4eb] dark:border-white/[0.08] shadow-xl shadow-amber-900/20 dark:shadow-none booking-widget">
            <CardHeader>
                <div className="flex items-center gap-2">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400">
                        <Calendar className="h-5 w-5" />
                    </div>
                    <div>
                        <CardTitle>{t('bookings.onlineBooking', 'Онлайн-запись')}</CardTitle>
                        <CardDescription>
                            {t('bookings.selectDateAndTime', 'Выберите дату и время')}
                        </CardDescription>
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                {/* Month navigation */}
                <div className="flex items-center justify-between mb-4">
                    <button
                        onClick={handlePrevMonth}
                        className="p-1.5 rounded-lg hover:bg-amber-100 dark:hover:bg-amber-900/30 transition-colors"
                    >
                        <ChevronLeft className="h-5 w-5 text-amber-700 dark:text-amber-400" />
                    </button>
                    <h3 className="text-sm font-semibold">
                        {MONTH_NAMES[currentMonth]} {currentYear}
                    </h3>
                    <button
                        onClick={handleNextMonth}
                        className="p-1.5 rounded-lg hover:bg-amber-100 dark:hover:bg-amber-900/30 transition-colors"
                    >
                        <ChevronRight className="h-5 w-5 text-amber-700 dark:text-amber-400" />
                    </button>
                </div>

                {/* Calendar grid */}
                <div className="booking-widget__calendar">
                    {DAY_NAMES.map((d) => (
                        <div key={d} className="booking-widget__day-header">{d}</div>
                    ))}
                    {days.map((day, i) => {
                        if (day === null) {
                            return <div key={`empty-${i}`} className="booking-widget__day booking-widget__day--empty" />;
                        }
                        const past = isPast(day);
                        const todayClass = isToday(day) ? 'booking-widget__day--today' : '';
                        const selectedClass = isSelected(day) ? 'booking-widget__day--selected' : '';
                        const pastClass = past ? 'booking-widget__day--past' : '';

                        return (
                            <button
                                key={`day-${day}`}
                                className={`booking-widget__day ${todayClass} ${selectedClass} ${pastClass}`}
                                onClick={() => !past && handleDayClick(day)}
                                disabled={past}
                            >
                                {day}
                            </button>
                        );
                    })}
                </div>

                {/* Time slots */}
                {selectedDate && (
                    <div className="mt-4">
                        <div className="flex items-center gap-2 mb-3">
                            <Clock className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                            <span className="text-sm font-medium">
                                {t('bookings.availableSlots', 'Доступные слоты')}
                            </span>
                            {slotsQuery.isLoading && (
                                <span className="text-xs text-muted-foreground animate-pulse">
                                    {t('common.loading', 'Загрузка...')}
                                </span>
                            )}
                        </div>
                        {!slotsQuery.isLoading && availableSlots.length === 0 ? (
                            <p className="text-sm text-muted-foreground text-center py-4">
                                {t('bookings.noSlotsAvailable', 'Нет доступных слотов на эту дату')}
                            </p>
                        ) : (
                            <div className="slots-grid">
                                {availableSlots.map((slot: any, idx: number) => {
                                    const time = new Date(slot.start).toLocaleTimeString('ru-RU', {
                                        hour: '2-digit',
                                        minute: '2-digit',
                                    });
                                    return (
                                        <button
                                            key={idx}
                                            className={`slot-btn ${selectedSlotIndex === idx ? 'slot-btn--selected' : ''}`}
                                            onClick={() => setSelectedSlotIndex(idx)}
                                        >
                                            {time}
                                        </button>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                )}

                {/* CTA button */}
                <div className="mt-4">
                    <Button
                        className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white shadow-lg shadow-amber-500/25"
                        onClick={handleBooking}
                    >
                        {selectedSlotIndex !== null
                            ? t('bookings.bookSelectedSlot', 'Записаться на выбранное время')
                            : t('bookings.goToBooking', 'Перейти к записи')
                        }
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
};
