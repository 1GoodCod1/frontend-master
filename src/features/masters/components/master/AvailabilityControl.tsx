import { useState, useEffect } from 'react';
import { CheckCircle, Ban, Users, RefreshCw, Signal, AlertTriangle } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { AVAILABILITY_STATUS } from '@/constants/availabilityStatus';
import type { AvailabilityStatus } from '@/constants/availabilityStatus';

type AvailabilityToggle =
  | typeof AVAILABILITY_STATUS.AVAILABLE
  | typeof AVAILABILITY_STATUS.BUSY;

interface AvailabilityControlProps {
  currentStatus: AvailabilityStatus;
  maxActiveLeads: number;
  currentActiveLeads: number;
  onUpdate: (status: string, maxLeads?: number) => Promise<void>;
}

export function AvailabilityControl({
  currentStatus,
  maxActiveLeads,
  currentActiveLeads,
  onUpdate,
}: AvailabilityControlProps) {
  const { t } = useTranslation();
  const displayStatus =
    currentStatus === AVAILABILITY_STATUS.OFFLINE ? AVAILABILITY_STATUS.BUSY : currentStatus;
  const [status, setStatus] = useState<AvailabilityToggle>(displayStatus);

  useEffect(() => {
    setStatus(displayStatus);
  }, [displayStatus]);
  const [maxLeads, setMaxLeads] = useState(maxActiveLeads);
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleStatusChange = async (newStatus: AvailabilityToggle) => {
    if (!newStatus) return;
    setStatus(newStatus);
    await handleUpdate(newStatus, maxLeads);
  };

  const handleMaxLeadsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value, 10);
    if (!Number.isNaN(value) && value >= 1 && value <= 50) {
      setMaxLeads(value);
    }
  };

  const handleUpdate = async (newStatus?: string, newMaxLeads?: number) => {
    setIsUpdating(true);
    setError(null);
    setSuccess(false);

    try {
      await onUpdate(newStatus || status, newMaxLeads || maxLeads);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: unknown) {
      const msg =
        err && typeof err === 'object' && 'data' in err && err.data && typeof (err.data as { message?: string }).message === 'string'
          ? (err.data as { message: string }).message
          : 'Failed to update availability status';
      setError(msg);
    } finally {
      setIsUpdating(false);
    }
  };

  const isAvailable = status === AVAILABILITY_STATUS.AVAILABLE;
  const leadsProgress = maxLeads > 0 ? (currentActiveLeads / maxLeads) * 100 : 0;
  const isAtLimit = currentActiveLeads >= maxLeads && isAvailable;

  return (
    <Card className={cn(
      "relative overflow-hidden transition duration-500 shadow-sm border",
      isAvailable
        ? "border-teal-500/20 dark:border-teal-500/10 bg-card"
        : "border-rose-500/20 dark:border-rose-500/10 bg-card"
    )}>
      {/* Subtle Glow */}
      <div className={cn(
        "absolute -top-32 -right-32 w-64 h-64 rounded-full blur-[4rem] opacity-30 pointer-events-none transition-colors duration-700",
        isAvailable ? "bg-teal-400/20 dark:bg-teal-500/10" : "bg-rose-400/20 dark:bg-rose-500/10"
      )} />

      <CardHeader className="p-5 sm:p-6 pb-2 relative z-10">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className={cn(
              "flex items-center justify-center size-10 rounded-xl shadow-sm transition duration-500 text-white shrink-0",
              isAvailable ? "bg-teal-500 dark:bg-teal-600" : "bg-muted-foreground"
            )}>
              <Signal className="size-5" />
            </div>
            <CardTitle className="text-lg font-bold tracking-tight">
              {t('dashboard.availabilityControl.title', 'Статус доступности')}
            </CardTitle>
          </div>
          <Badge
            variant="outline"
            className={cn(
              "px-3 py-1 text-xs font-bold tracking-wide uppercase rounded-full border-2 w-fit",
              isAvailable
                ? "bg-teal-50 text-teal-700 border-teal-200 dark:bg-teal-500/10 dark:text-teal-400 dark:border-teal-500/30"
                : "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-500/10 dark:text-rose-400 dark:border-rose-500/30"
            )}
          >
            {isAvailable ? (
              <span className="flex items-center gap-1.5"><CheckCircle className="size-3.5" /> {status}</span>
            ) : (
              <span className="flex items-center gap-1.5"><Ban className="size-3.5" /> {status}</span>
            )}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="p-5 sm:p-6 pt-4 relative z-10 space-y-6">
        {/* Alerts */}
        {error && (
          <Alert variant="destructive" className="py-2.5 px-4 rounded-xl border-destructive/20 bg-destructive/5 animate-in fade-in slide-in-from-top-1">
            <AlertDescription className="flex items-center justify-between gap-3">
              <span className="text-sm font-medium">{error}</span>
              <Button variant="ghost" size="sm" onClick={() => setError(null)} className="h-6 w-6 p-0 shrink-0 hover:bg-destructive/10 rounded-full">
                ×
              </Button>
            </AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert className="border-teal-500/20 bg-teal-500/5 py-2.5 px-4 rounded-xl animate-in fade-in slide-in-from-top-1">
            <CheckCircle className="size-4 text-teal-600 dark:text-teal-400" />
            <AlertDescription className="ml-2 text-sm font-medium text-teal-700 dark:text-teal-400">
              {t('dashboard.availabilityControl.success', 'Статус успешно обновлён')}
            </AlertDescription>
          </Alert>
        )}

        {/* Status Toggle Buttons */}
        <div className={cn(
          "flex p-1 rounded-xl bg-muted/40 dark:bg-muted/20 border transition-colors duration-500",
          isAvailable ? "border-teal-500/20 dark:border-teal-500/10" : "border-rose-500/20 dark:border-rose-500/10"
        )}>
          <Button
            type="button"
            variant="ghost"
            disabled={isUpdating}
            onClick={() => handleStatusChange(AVAILABILITY_STATUS.AVAILABLE)}
            className={cn(
              "flex-1 relative h-10 rounded-lg font-medium transition duration-300 text-sm",
              isAvailable
                ? "bg-teal-500 text-white shadow-sm hover:bg-teal-600 dark:bg-teal-600 dark:hover:bg-teal-700"
                : "text-muted-foreground hover:text-foreground hover:bg-muted"
            )}
          >
            <CheckCircle className="mr-2 size-4" />
            {t('dashboard.availabilityControl.available', 'Доступен')}
          </Button>
          <Button
            type="button"
            variant="ghost"
            disabled={isUpdating}
            onClick={() => handleStatusChange(AVAILABILITY_STATUS.BUSY)}
            className={cn(
              "flex-1 relative h-10 rounded-lg font-medium transition duration-300 text-sm",
              !isAvailable
                ? "bg-rose-500 text-white shadow-sm hover:bg-rose-600 dark:bg-rose-600 dark:hover:bg-rose-700"
                : "text-muted-foreground hover:text-foreground hover:bg-muted"
            )}
          >
            <Ban className="mr-2 size-4" />
            {t('dashboard.availabilityControl.busy', 'Занят')}
          </Button>
        </div>

        {/* Active Leads Progress */}
        <div className={cn(
          "flex flex-col gap-4 p-5 rounded-2xl bg-muted/30 dark:bg-muted/10 border shadow-sm transition-colors duration-500",
          isAvailable ? "border-teal-500/20 dark:border-teal-500/10" : "border-rose-500/20 dark:border-rose-500/10"
        )}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <Users className="size-4.5 text-muted-foreground" />
              <span className="text-sm font-semibold text-foreground">
                {t('dashboard.availabilityControl.activeLeads', 'Активные заявки')}
              </span>
            </div>
            <div className="flex items-baseline gap-1">
              <span className={cn(
                "text-2xl font-bold tracking-tight",
                isAtLimit ? "text-destructive" : "text-foreground"
              )}>
                {currentActiveLeads}
              </span>
              <span className="text-sm font-semibold text-muted-foreground">/ {maxLeads}</span>
            </div>
          </div>

          <Progress
            value={leadsProgress}
            className={cn(
              "h-2.5 rounded-full overflow-hidden bg-muted/50 dark:bg-muted/30",
              isAtLimit
                ? "[&>div]:bg-destructive"
                : isAvailable
                  ? "[&>div]:bg-teal-500 dark:[&>div]:bg-teal-400"
                  : "[&>div]:bg-rose-500 dark:[&>div]:bg-rose-400"
            )}
          />

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2">
            <div className={cn(
              "flex flex-1 items-center justify-between bg-background border rounded-xl px-4 h-11 sm:h-10 shadow-sm transition duration-300",
              isAvailable 
                ? "border-teal-500/30 focus-within:border-teal-500/60 focus-within:ring-1 focus-within:ring-teal-500/20 shadow-teal-500/5" 
                : "border-rose-500/30 focus-within:border-rose-500/60 focus-within:ring-1 focus-within:ring-rose-500/20 shadow-rose-500/5"
            )}>
              <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider shrink-0">
                {t('dashboard.availabilityControl.maxLeads', 'Лимит')}:
              </span>
              <Input
                type="number"
                min={1}
                max={50}
                value={maxLeads}
                onChange={handleMaxLeadsChange}
                disabled={isUpdating}
                className="h-full border-none bg-transparent text-right font-black text-lg focus-visible:ring-0 px-0 w-16"
              />
            </div>
            <Button
              variant={maxLeads !== maxActiveLeads ? "default" : "outline"}
              onClick={() => handleUpdate(status, maxLeads)}
              disabled={isUpdating || maxLeads === maxActiveLeads}
              className={cn(
                "h-11 sm:h-10 px-6 rounded-xl text-sm font-bold transition duration-300 shadow-sm shrink-0 w-full sm:w-[130px]",
                maxLeads !== maxActiveLeads && !isUpdating
                  ? "bg-primary text-primary-foreground hover:animate-pulse shadow-primary/20"
                  : "bg-muted/50 text-muted-foreground border-transparent"
              )}
            >
              {isUpdating ? (
                <RefreshCw className="mr-2 size-4 animate-spin" />
              ) : null}
              {t('dashboard.availabilityControl.updateLimit', 'Обновить')}
            </Button>
          </div>
        </div>

        {/* Warning Alerts */}
        {(status === AVAILABILITY_STATUS.BUSY || isAtLimit) && (
          <Alert
            variant="default"
            className={cn(
              "py-3.5 px-4 rounded-xl animate-in fade-in slide-in-from-bottom-2 border-0",
              status === AVAILABILITY_STATUS.BUSY
                ? "bg-amber-500/10 text-amber-800 dark:bg-amber-500/10 dark:text-amber-300"
                : "bg-destructive/10 text-destructive dark:bg-destructive/10 dark:text-red-400"
            )}
          >
            <AlertTriangle className={cn(
              "size-4.5 mt-0.5",
              status === AVAILABILITY_STATUS.BUSY ? "text-amber-600 dark:text-amber-400" : "text-destructive"
            )} />
            <AlertTitle className="sr-only">Info</AlertTitle>
            <AlertDescription className="ml-2.5 text-[13px] font-medium leading-relaxed">
              {status === AVAILABILITY_STATUS.BUSY
                ? t('dashboard.availabilityControl.busyInfo', 'Вы отмечены как занят. Клиенты не могут отправить вам новые заявки.')
                : t('dashboard.availabilityControl.limitReached', 'Лимит активных заявок достигнут. Статус автоматически сменится на «Занят».')}
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
}
