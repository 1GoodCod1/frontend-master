import { useState, useEffect } from 'react';
import { CheckCircle, Ban, Users } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
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

  return (
    <Card className="border-border">
      <CardContent className="space-y-4 pt-6">
        <div className="flex flex-wrap items-center gap-2">
          <h3 className="font-semibold">
            {t('dashboard.availabilityControl.title', 'Availability Status')}
          </h3>
          <Badge
            variant={status === 'AVAILABLE' ? 'default' : 'secondary'}
            className={cn(
              status === 'AVAILABLE' && 'bg-green-600 hover:bg-green-700',
              status === 'BUSY' && 'bg-amber-600 hover:bg-amber-700',
            )}
          >
            {status === 'AVAILABLE' ? (
              <CheckCircle className="mr-1 size-3.5" />
            ) : (
              <Ban className="mr-1 size-3.5" />
            )}
            {status}
          </Badge>
        </div>

        {error && (
          <Alert variant="destructive" className="py-2">
            <AlertDescription className="flex items-center justify-between gap-2">
              <span>{error}</span>
              <Button variant="ghost" size="sm" onClick={() => setError(null)}>
                ×
              </Button>
            </AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert className="border-green-500/50 bg-green-500/10 py-2">
            <AlertDescription>
              {t('dashboard.availabilityControl.success', 'Status updated successfully')}
            </AlertDescription>
          </Alert>
        )}

        <div className="flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-center">
          <div className="flex gap-1 rounded-lg border border-border p-1">
            <Button
              type="button"
              variant={status === 'AVAILABLE' ? 'default' : 'ghost'}
              size="sm"
              disabled={isUpdating}
              onClick={() => handleStatusChange('AVAILABLE')}
              className={cn(
                status === 'AVAILABLE' && 'bg-green-600 hover:bg-green-700',
              )}
            >
              <CheckCircle className="mr-1.5 size-4" />
              {t('dashboard.availabilityControl.available', 'Available')}
            </Button>
            <Button
              type="button"
              variant={status === 'BUSY' ? 'default' : 'ghost'}
              size="sm"
              disabled={isUpdating}
              onClick={() => handleStatusChange('BUSY')}
              className={cn(
                status === 'BUSY' && 'bg-amber-600 hover:bg-amber-700',
              )}
            >
              <Ban className="mr-1.5 size-4" />
              {t('dashboard.availabilityControl.busy', 'Busy')}
            </Button>
          </div>

          <div className="flex flex-1 flex-wrap items-center gap-2 sm:min-w-0">
            <Users className="size-4 shrink-0 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">
              {currentActiveLeads} / {maxLeads}
            </span>
            <Input
              type="number"
              min={1}
              max={50}
              value={maxLeads}
              onChange={handleMaxLeadsChange}
              disabled={isUpdating}
              className="h-8 w-16"
            />
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleUpdate(status, maxLeads)}
              disabled={isUpdating || maxLeads === maxActiveLeads}
            >
              {t('dashboard.availabilityControl.updateLimit', 'Update')}
            </Button>
          </div>
        </div>

        {(status === 'BUSY' || (currentActiveLeads >= maxLeads && status === 'AVAILABLE')) && (
          <Alert
            variant={status === 'BUSY' ? 'default' : 'destructive'}
            className="py-2"
          >
            <AlertTitle className="sr-only">Info</AlertTitle>
            <AlertDescription>
              {status === 'BUSY'
                ? t('dashboard.availabilityControl.busyInfo', 'You are marked as BUSY. Clients cannot send you new leads.')
                : t('dashboard.availabilityControl.limitReached', 'You have reached your active leads limit. Status will automatically change to BUSY.')}
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
}
