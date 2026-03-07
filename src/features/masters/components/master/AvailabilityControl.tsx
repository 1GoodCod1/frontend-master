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

type AvailabilityStatus = 'AVAILABLE' | 'BUSY';

interface AvailabilityControlProps {
  currentStatus: 'AVAILABLE' | 'BUSY' | 'OFFLINE';
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
  const displayStatus = currentStatus === 'OFFLINE' ? 'BUSY' : currentStatus;
  const [status, setStatus] = useState<AvailabilityStatus>(displayStatus);

  useEffect(() => {
    setStatus(displayStatus);
  }, [displayStatus]);
  const [maxLeads, setMaxLeads] = useState(maxActiveLeads);
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleStatusChange = async (newStatus: AvailabilityStatus) => {
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

  const isAvailable = status === 'AVAILABLE';
  const leadsProgress = maxLeads > 0 ? (currentActiveLeads / maxLeads) * 100 : 0;
  const isAtLimit = currentActiveLeads >= maxLeads && isAvailable;

  return (
    <Card className={cn(
      "relative overflow-hidden transition-all duration-500",
      isAvailable
        ? "border-emerald-500/30 dark:border-emerald-500/20"
        : "border-amber-500/30 dark:border-amber-500/20"
    )}>
      {/* Decorative background glow */}
      <div className={cn(
        "absolute -top-20 -right-20 w-40 h-40 rounded-full blur-3xl opacity-20 pointer-events-none transition-colors duration-500",
        isAvailable ? "bg-emerald-500" : "bg-amber-500"
      )} />

      <CardHeader className="pb-4 relative z-10">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2.5">
            <div className={cn(
              "flex items-center justify-center size-8 rounded-lg transition-colors duration-300",
              isAvailable
                ? "bg-emerald-500/10 dark:bg-emerald-500/15"
                : "bg-amber-500/10 dark:bg-amber-500/15"
            )}>
              <Signal className={cn(
                "size-4 transition-colors duration-300",
                isAvailable ? "text-emerald-600 dark:text-emerald-400" : "text-amber-600 dark:text-amber-400"
              )} />
            </div>
            {t('dashboard.availabilityControl.title', 'Статус доступности')}
          </CardTitle>
          <Badge
            variant="outline"
            className={cn(
              "px-3 py-1 text-xs font-semibold rounded-full transition-all duration-300 border",
              isAvailable
                ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 dark:border-emerald-500/20"
                : "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30 dark:border-amber-500/20"
            )}
          >
            {isAvailable ? (
              <CheckCircle className="mr-1.5 size-3" />
            ) : (
              <Ban className="mr-1.5 size-3" />
            )}
            {status}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-5 relative z-10">
        {/* Alerts */}
        {error && (
          <Alert variant="destructive" className="py-2.5 animate-in fade-in slide-in-from-top-1">
            <AlertDescription className="flex items-center justify-between gap-2">
              <span className="text-sm">{error}</span>
              <Button variant="ghost" size="sm" onClick={() => setError(null)} className="h-6 w-6 p-0 shrink-0 hover:bg-destructive/20 rounded-full">
                ×
              </Button>
            </AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert className="border-emerald-500/30 bg-emerald-500/10 py-2.5 animate-in fade-in slide-in-from-top-1">
            <CheckCircle className="size-4 text-emerald-600 dark:text-emerald-400" />
            <AlertDescription className="ml-2 text-sm text-emerald-700 dark:text-emerald-300">
              {t('dashboard.availabilityControl.success', 'Статус успешно обновлён')}
            </AlertDescription>
          </Alert>
        )}

        {/* Status Toggle Buttons */}
        <div className="grid grid-cols-2 gap-2 p-1 rounded-xl bg-muted/50 dark:bg-muted/30 border border-border/50">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            disabled={isUpdating}
            onClick={() => handleStatusChange('AVAILABLE')}
            className={cn(
              "relative h-10 rounded-lg font-medium transition-all duration-300",
              isAvailable
                ? "bg-emerald-500 hover:bg-emerald-600 text-white shadow-md shadow-emerald-500/20 dark:shadow-emerald-500/10"
                : "hover:bg-muted text-muted-foreground"
            )}
          >
            <CheckCircle className="mr-1.5 size-4" />
            {t('dashboard.availabilityControl.available', 'Доступен')}
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            disabled={isUpdating}
            onClick={() => handleStatusChange('BUSY')}
            className={cn(
              "relative h-10 rounded-lg font-medium transition-all duration-300",
              !isAvailable
                ? "bg-amber-500 hover:bg-amber-600 text-white shadow-md shadow-amber-500/20 dark:shadow-amber-500/10"
                : "hover:bg-muted text-muted-foreground"
            )}
          >
            <Ban className="mr-1.5 size-4" />
            {t('dashboard.availabilityControl.busy', 'Занят')}
          </Button>
        </div>

        {/* Active Leads Progress */}
        <div className="space-y-3 p-4 rounded-xl bg-muted/30 dark:bg-muted/20 border border-border/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users className="size-4 text-muted-foreground" />
              <span className="text-sm font-medium text-foreground">
                {t('dashboard.availabilityControl.activeLeads', 'Активные заявки')}
              </span>
            </div>
            <span className={cn(
              "text-sm font-bold tabular-nums",
              isAtLimit ? "text-destructive" : "text-foreground"
            )}>
              {currentActiveLeads} / {maxLeads}
            </span>
          </div>

          <Progress
            value={leadsProgress}
            className={cn(
              "h-2",
              isAtLimit
                ? "[&>div]:bg-destructive"
                : isAvailable
                  ? "[&>div]:bg-emerald-500"
                  : "[&>div]:bg-amber-500"
            )}
          />

          <div className="flex items-center gap-3 pt-1">
            <div className="flex items-center gap-2 flex-1">
              <span className="text-xs text-muted-foreground whitespace-nowrap">
                {t('dashboard.availabilityControl.maxLeads', 'Лимит')}:
              </span>
              <Input
                type="number"
                min={1}
                max={50}
                value={maxLeads}
                onChange={handleMaxLeadsChange}
                disabled={isUpdating}
                className="h-8 w-16 text-center text-sm rounded-lg bg-background border-border/60 focus-visible:ring-1 focus-visible:ring-primary/30"
              />
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleUpdate(status, maxLeads)}
              disabled={isUpdating || maxLeads === maxActiveLeads}
              className={cn(
                "h-8 shrink-0 rounded-lg text-sm font-medium transition-all duration-200",
                maxLeads !== maxActiveLeads && !isUpdating
                  ? "border-primary/30 text-primary hover:bg-primary/5 dark:hover:bg-primary/10"
                  : ""
              )}
            >
              {isUpdating ? (
                <RefreshCw className="mr-1.5 size-3.5 animate-spin" />
              ) : null}
              {t('dashboard.availabilityControl.updateLimit', 'Обновить')}
            </Button>
          </div>
        </div>

        {/* Warning Alerts */}
        {(status === 'BUSY' || isAtLimit) && (
          <Alert
            variant="default"
            className={cn(
              "py-3 rounded-xl animate-in fade-in slide-in-from-top-1",
              status === 'BUSY'
                ? "border-amber-500/30 bg-amber-500/5 dark:bg-amber-500/10"
                : "border-destructive/30 bg-destructive/5 dark:bg-destructive/10"
            )}
          >
            <AlertTriangle className={cn(
              "size-4",
              status === 'BUSY' ? "text-amber-600 dark:text-amber-400" : "text-destructive"
            )} />
            <AlertTitle className="sr-only">Info</AlertTitle>
            <AlertDescription className={cn(
              "ml-2 text-sm",
              status === 'BUSY' ? "text-amber-700 dark:text-amber-300" : "text-destructive dark:text-red-400"
            )}>
              {status === 'BUSY'
                ? t('dashboard.availabilityControl.busyInfo', 'Вы отмечены как занят. Клиенты не могут отправить вам новые заявки.')
                : t('dashboard.availabilityControl.limitReached', 'Лимит активных заявок достигнут. Статус автоматически сменится на «Занят».')}
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
}
