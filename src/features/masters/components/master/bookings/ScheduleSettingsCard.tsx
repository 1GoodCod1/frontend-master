import { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Clock, Save } from 'lucide-react';
import toast from 'react-hot-toast';
import { CardContent } from '@/components/ui/card';
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
import { cn } from '@/lib/utils';
import {
    masterCardStaticCls,
    masterIconWrapCls,
    masterPrimaryBtnCls,
    masterSectionTitleCls,
    masterSelectTriggerCls,
    masterTextMuted,
} from '@/lib/masterCabinetStyles';

const SLOT_DURATIONS = [15, 30, 45, 60, 90, 120];

function formatHour(hour: number): string {
    return `${hour.toString().padStart(2, '0')}:00`;
}

export function ScheduleSettingsCard() {
    const { t } = useTranslation();
    const { data, isLoading, refetch } = useMastersGetScheduleSettingsQuery();
    const [updateSettings, { isLoading: isSaving }] = useMastersUpdateScheduleSettingsMutation();

    const [localStart, setLocalStart] = useState<number | null>(null);
    const [localEnd, setLocalEnd] = useState<number | null>(null);
    const [localSlot, setLocalSlot] = useState<number | null>(null);

    const workStart = localStart ?? data?.workStartHour ?? 9;
    const workEnd = localEnd ?? data?.workEndHour ?? 18;
    const slotDuration = localSlot ?? data?.slotDurationMinutes ?? 60;
    const hasChanges = localStart !== null || localEnd !== null || localSlot !== null;

    const handleSave = useCallback(async () => {
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
            const { error } = await refetch();
            if (error) {
                toast.error(t('bookings.schedule.saveFailed'));
                return;
            }
            toast.success(t('bookings.schedule.saved'));
            setLocalStart(null);
            setLocalEnd(null);
            setLocalSlot(null);
        } catch {
            toast.error(t('bookings.schedule.saveFailed'));
        }
    }, [workStart, workEnd, slotDuration, updateSettings, refetch, t]);

    if (isLoading) {
        return (
            <div className={cn(masterCardStaticCls, 'animate-pulse')}>
                <CardContent className="p-4">
                    <div className="mb-4 h-6 w-40 rounded bg-muted" />
                    <div className="h-10 w-full rounded bg-muted" />
                </CardContent>
            </div>
        );
    }

    const startHours = Array.from({ length: 24 }, (_, i) => i);
    const endHours = Array.from({ length: 24 }, (_, i) => i + 1).filter(h => h <= 24);

    return (
        <div className={masterCardStaticCls}>
            <CardContent className="p-4 sm:p-5">
                <div className="mb-1 flex items-center gap-2">
                    <span className={masterIconWrapCls}>
                        <Clock className="h-4 w-4" />
                    </span>
                    <h3 className={masterSectionTitleCls}>{t('bookings.schedule.title')}</h3>
                </div>
                <p className={cn('mb-4', masterTextMuted)}>{t('bookings.schedule.subtitle')}</p>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                    <div className="space-y-1.5">
                        <Label htmlFor="work-start" className="text-xs font-semibold">{t('bookings.schedule.workStartHour')}</Label>
                        <Select value={String(workStart)} onValueChange={(v) => setLocalStart(Number(v))}>
                            <SelectTrigger id="work-start" className={masterSelectTriggerCls}>
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
                        <Label htmlFor="work-end" className="text-xs font-semibold">{t('bookings.schedule.workEndHour')}</Label>
                        <Select value={String(workEnd)} onValueChange={(v) => setLocalEnd(Number(v))}>
                            <SelectTrigger id="work-end" className={masterSelectTriggerCls}>
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
                        <Label htmlFor="slot-duration" className="text-xs font-semibold">{t('bookings.schedule.slotDuration')}</Label>
                        <Select value={String(slotDuration)} onValueChange={(v) => setLocalSlot(Number(v))}>
                            <SelectTrigger id="slot-duration" className={masterSelectTriggerCls}>
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
                        className={cn(masterPrimaryBtnCls, 'mt-4 gap-2')}
                        onClick={handleSave}
                        disabled={isSaving || workStart >= workEnd}
                    >
                        <Save className="h-3.5 w-3.5" />
                        {isSaving ? t('common.loading') : t('bookings.schedule.save')}
                    </Button>
                )}
            </CardContent>
        </div>
    );
}
