import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Clock, Save } from 'lucide-react';
import toast from 'react-hot-toast';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    useMastersGetScheduleSettingsQuery,
    useMastersUpdateScheduleSettingsMutation,
} from '@/features/masters/mastersApi';

const SLOT_DURATIONS = [15, 30, 45, 60, 90, 120];

function formatHour(hour: number): string {
    return `${hour.toString().padStart(2, '0')}:00`;
}

export function ScheduleSettingsCard() {
    const { t } = useTranslation();
    const { data, isLoading } = useMastersGetScheduleSettingsQuery();
    const [updateSettings, { isLoading: isSaving }] = useMastersUpdateScheduleSettingsMutation();

    const [workStart, setWorkStart] = useState(9);
    const [workEnd, setWorkEnd] = useState(18);
    const [slotDuration, setSlotDuration] = useState(60);
    const [hasChanges, setHasChanges] = useState(false);

    useEffect(() => {
        if (data) {
            setWorkStart(data.workStartHour ?? 9);
            setWorkEnd(data.workEndHour ?? 18);
            setSlotDuration(data.slotDurationMinutes ?? 60);
        }
    }, [data]);

    const handleSave = async () => {
        if (workStart >= workEnd) {
            toast.error(t('bookings.schedule.saveFailed'));
            return;
        }
        try {
            await updateSettings({
                workStartHour: workStart,
                workEndHour: workEnd,
                slotDurationMinutes: slotDuration,
            }).unwrap();
            toast.success(t('bookings.schedule.saved'));
            setHasChanges(false);
        } catch {
            toast.error(t('bookings.schedule.saveFailed'));
        }
    };

    const handleChange = (setter: (v: number) => void, value: string) => {
        setter(Number(value));
        setHasChanges(true);
    };

    if (isLoading) {
        return (
            <Card className="border-border dark:border-white/[0.08] animate-pulse">
                <CardContent className="p-4">
                    <div className="h-6 w-40 bg-muted rounded mb-4" />
                    <div className="h-10 w-full bg-muted rounded" />
                </CardContent>
            </Card>
        );
    }

    // Generate available hours for selectors
    const startHours = Array.from({ length: 24 }, (_, i) => i);
    const endHours = Array.from({ length: 24 }, (_, i) => i + 1).filter(h => h <= 24);

    return (
        <Card className="border-border dark:border-white/[0.08] relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-indigo-500 dark:from-blue-600 dark:to-indigo-400" />
            <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-1">
                    <Clock className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                    <h3 className="text-sm font-semibold">{t('bookings.schedule.title')}</h3>
                </div>
                <p className="text-xs text-muted-foreground mb-4">{t('bookings.schedule.subtitle')}</p>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="space-y-1.5">
                        <Label htmlFor="work-start" className="text-xs">{t('bookings.schedule.workStartHour')}</Label>
                        <Select value={String(workStart)} onValueChange={(v) => handleChange(setWorkStart, v)}>
                            <SelectTrigger id="work-start" className="h-9">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {startHours.filter(h => h < workEnd).map((h) => (
                                    <SelectItem key={h} value={String(h)}>{formatHour(h)}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-1.5">
                        <Label htmlFor="work-end" className="text-xs">{t('bookings.schedule.workEndHour')}</Label>
                        <Select value={String(workEnd)} onValueChange={(v) => handleChange(setWorkEnd, v)}>
                            <SelectTrigger id="work-end" className="h-9">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {endHours.filter(h => h > workStart).map((h) => (
                                    <SelectItem key={h} value={String(h)}>{formatHour(h === 24 ? 0 : h)}{h === 24 ? ' (00:00)' : ''}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-1.5">
                        <Label htmlFor="slot-duration" className="text-xs">{t('bookings.schedule.slotDuration')}</Label>
                        <Select value={String(slotDuration)} onValueChange={(v) => handleChange(setSlotDuration, v)}>
                            <SelectTrigger id="slot-duration" className="h-9">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {SLOT_DURATIONS.map((d) => (
                                    <SelectItem key={d} value={String(d)}>{d} {t('bookings.schedule.minutes')}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                {hasChanges && (
                    <Button
                        size="sm"
                        className="mt-4 gap-2 bg-blue-600 hover:bg-blue-700 text-white"
                        onClick={handleSave}
                        disabled={isSaving || workStart >= workEnd}
                    >
                        <Save className="h-3.5 w-3.5" />
                        {isSaving ? t('common.loading') : t('bookings.schedule.save')}
                    </Button>
                )}
            </CardContent>
        </Card>
    );
}
