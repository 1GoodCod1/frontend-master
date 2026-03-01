import { useTranslation } from 'react-i18next';
import {
  AlertTriangle,
  User,
  Briefcase,
  FileText,
  Mail,
  Phone,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { formatDateTimeString, getLocaleFromLanguage } from '@/utils/date';
import { getStatusColor, getStatusBgColor } from '@/utils/reports';
import { useIsDark } from '@/hooks/useIsDark';

export type ReportLike = {
  id: string;
  status?: string | null;
  createdAt?: string | null;
  reason?: string | null;
  description?: string | null;
  evidence?: string | null;
  notes?: string | null;
  client?: { email?: string | null; phone?: string | null } | null;
  master?: { user?: { firstName?: string | null; lastName?: string | null; email?: string | null } | null } | null;
} & Record<string, unknown>;

interface ReportCardProps {
  report: ReportLike;
  onOpenDialog: (report: ReportLike) => void;
}

export default function ReportCard({ report, onOpenDialog }: ReportCardProps) {
  const { t, i18n } = useTranslation();
  const locale = getLocaleFromLanguage(i18n.language);
  const isDark = useIsDark();
  const statusKey = report.status ?? 'PENDING';
  const statusColor = getStatusColor(statusKey);
  const statusBg = getStatusBgColor(statusKey, isDark);

  return (
    <Card
      className={`
        p-6 rounded-lg border-2 cursor-pointer transition-all duration-300
        hover:-translate-y-0.5 hover:shadow-lg
        ${report.status === 'PENDING' ? 'border-amber-500/50' : 'border-border'}
      `}
      style={{ backgroundColor: statusBg }}
      onClick={() => onOpenDialog(report)}
    >
      <CardContent className="p-0 space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div
              className="size-11 rounded-lg flex items-center justify-center shrink-0"
              style={{
                backgroundColor: statusColor,
                boxShadow: `0 3px 10px ${statusColor}60`,
              }}
            >
              <AlertTriangle className="size-6 text-white" />
            </div>
            <div>
              <p className="font-bold text-foreground leading-tight">
                {t('admin.reports.report')} #{report.id.slice(0, 8)}
              </p>
              <p className="text-xs text-muted-foreground">
                {formatDateTimeString(report.createdAt, locale)}
              </p>
            </div>
            <Badge
              className="font-semibold text-sm h-8 shrink-0"
              style={{
                backgroundColor: statusColor,
                color: '#fff',
                boxShadow: `0 2px 8px ${statusColor}40`,
              }}
            >
              {t(`admin.reports.status.${report.status}`)}
            </Badge>
          </div>
          {report.status === 'PENDING' && (
            <Button
              variant="default"
              className="bg-primary hover:bg-primary/90 font-semibold shadow-md"
              onClick={(e) => {
                e.stopPropagation();
                onOpenDialog(report);
              }}
            >
              {t('admin.reports.review')}
            </Button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 rounded-lg bg-primary/10 border border-primary/20">
            <div className="flex items-center gap-2 mb-3">
              <User className="size-5 text-primary" />
              <span className="text-sm font-bold text-foreground">
                {t('admin.reports.client')}
              </span>
            </div>
            <div className="space-y-1 ml-7">
              {report.client?.email && (
                <div className="flex items-center gap-2">
                  <Mail className="size-3.5 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">{report.client.email}</span>
                </div>
              )}
              {report.client?.phone && (
                <div className="flex items-center gap-2">
                  <Phone className="size-3.5 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">{report.client.phone}</span>
                </div>
              )}
            </div>
          </div>

          <div className="p-4 rounded-lg bg-purple-500/10 border border-purple-500/20">
            <div className="flex items-center gap-2 mb-3">
              <Briefcase className="size-5 text-purple-500" />
              <span className="text-sm font-bold text-foreground">
                {t('admin.reports.master')}
              </span>
            </div>
            <div className="space-y-1 ml-7">
              <span className="text-sm font-semibold">
                {report.master?.user?.firstName} {report.master?.user?.lastName}
              </span>
              {report.master?.user?.email && (
                <div className="flex items-center gap-2">
                  <Mail className="size-3.5 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">
                    {report.master.user.email}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/20">
          <p className="text-sm font-bold text-foreground mb-3">
            {t('admin.reports.reason')}
          </p>
          <Badge
            variant="secondary"
            className="bg-destructive text-destructive-foreground font-semibold h-8"
          >
            {report.reason}
          </Badge>
        </div>

        <div className="p-4 rounded-lg bg-muted/50 border border-border">
          <div className="flex items-center gap-2 mb-3">
            <FileText className="size-5 text-primary" />
            <span className="text-sm font-bold text-foreground">
              {t('admin.reports.description')}
            </span>
          </div>
          <p className="text-sm text-muted-foreground whitespace-pre-wrap leading-relaxed">
            {report.description}
          </p>
        </div>

        {report.evidence && (
          <div className="p-4 rounded-lg bg-primary/10 border border-primary/20">
            <p className="text-sm font-bold text-foreground mb-2">
              {t('admin.reports.evidence')}
            </p>
            <p className="text-sm text-muted-foreground">
              {JSON.parse(report.evidence).join(', ')}
            </p>
          </div>
        )}

        {report.notes && (
          <div className="p-4 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
            <p className="text-sm font-bold text-foreground mb-2">
              {t('admin.reports.adminNotes')}
            </p>
            <p className="text-sm text-muted-foreground">{report.notes}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
