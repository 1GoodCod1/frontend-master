import { useTranslation } from 'react-i18next';
import { AlertTriangle } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { getStatusColor, getStatusBgColor } from '@/utils/reports';
import { useIsDark } from '@/hooks/useIsDark';

type ReportLike = {
  id: string;
  status?: string | null;
  reason?: string | null;
  description?: string | null;
  notes?: string | null;
} & Record<string, unknown>;

interface ReportReviewDialogProps {
  open: boolean;
  selectedReport: ReportLike | null;
  action: string;
  notes: string;
  isLoading: boolean;
  onClose: () => void;
  onActionChange: (value: string) => void;
  onNotesChange: (value: string) => void;
  onUpdateStatus: () => void;
}

export default function ReportReviewDialog({
  open,
  selectedReport,
  action,
  notes,
  isLoading,
  onClose,
  onActionChange,
  onNotesChange,
  onUpdateStatus,
}: ReportReviewDialogProps) {
  const { t } = useTranslation();
  const isDark = useIsDark();
  const statusKey = selectedReport?.status ?? 'PENDING';

  return (
    <Dialog open={open} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md sm:max-w-lg">
        <DialogHeader className="flex flex-row items-center gap-3 space-y-0 pb-2">
          <div
            className="size-11 rounded-lg flex items-center justify-center shrink-0"
            style={{
              backgroundColor: selectedReport
                ? getStatusColor(statusKey)
                : '#DC143C',
              boxShadow: selectedReport
                ? `0 3px 10px ${getStatusColor(statusKey)}60`
                : '0 3px 10px #DC143C60',
            }}
          >
            <AlertTriangle className="size-6 text-white" />
          </div>
          <DialogTitle className="text-lg font-semibold">
            {t('admin.reports.reviewReport')}
          </DialogTitle>
        </DialogHeader>

        {selectedReport && (
          <>
            <div
              className="p-4 rounded-lg border"
              style={{
                backgroundColor: getStatusBgColor(statusKey, isDark),
                borderColor: `${getStatusColor(statusKey)}40`,
              }}
            >
              <p className="text-sm font-bold text-foreground mb-2">
                Report #{selectedReport.id.slice(0, 8)}
              </p>
              <div className="flex flex-wrap gap-2">
                <Badge className="bg-destructive text-destructive-foreground font-semibold">
                  {selectedReport.reason}
                </Badge>
                <Badge
                  className="font-semibold"
                  style={{
                    backgroundColor: getStatusColor(statusKey),
                    color: '#fff',
                  }}
                >
                  {t(`admin.reports.status.${selectedReport.status}`)}
                </Badge>
              </div>
            </div>

            <Separator />

            <div className="space-y-2">
              <Label>{t('admin.reports.action')}</Label>
              <Select value={action || undefined} onValueChange={onActionChange}>
                <SelectTrigger>
                  <SelectValue placeholder={t('admin.reports.action')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="NO_ACTION">{t('admin.reports.actions.NO_ACTION')}</SelectItem>
                  <SelectItem value="BAN_CLIENT">{t('admin.reports.actions.BAN_CLIENT')}</SelectItem>
                  <SelectItem value="BAN_MASTER">{t('admin.reports.actions.BAN_MASTER')}</SelectItem>
                  <SelectItem value="BAN_IP">{t('admin.reports.actions.BAN_IP')}</SelectItem>
                  <SelectItem value="WARNING_CLIENT">{t('admin.reports.actions.WARNING_CLIENT')}</SelectItem>
                  <SelectItem value="WARNING_MASTER">{t('admin.reports.actions.WARNING_MASTER')}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>{t('admin.reports.notes')}</Label>
              <Textarea
                rows={3}
                placeholder={t('admin.reports.notes')}
                value={notes}
                onChange={(e) => onNotesChange(e.target.value)}
                className="resize-none"
              />
            </div>
          </>
        )}

        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={onClose}>
            {t('common.cancel')}
          </Button>
          <Button
            onClick={onUpdateStatus}
            disabled={isLoading || !action}
            variant={action === 'REJECTED' ? 'destructive' : 'default'}
          >
            {isLoading
              ? t('common.loading')
              : action === 'REJECTED'
                ? t('admin.reports.reject')
                : t('admin.reports.resolve')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
