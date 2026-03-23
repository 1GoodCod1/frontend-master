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
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { AvatarPlaceholder } from '@/components/ui/AvatarPlaceholder';
import { formatDateTimeString, getLocaleFromLanguage } from '@/utils/date';
import { getStatusColor, getStatusBgColor } from '@/utils/reports';
import { useIsDark } from '@/hooks/useIsDark';
import { mediaUrl } from '@/utils/media';

export type ReportLike = {
  id: string;
  status?: string | null;
  createdAt?: string | null;
  reason?: string | null;
  description?: string | null;
  evidence?: string | null;
  notes?: string | null;
  client?: {
    email?: string | null;
    phone?: string | null;
    firstName?: string | null;
    lastName?: string | null;
    avatarFile?: { path?: string | null } | null;
    clientPhotos?: Array<{ file?: { path?: string | null } | null }> | null;
  } | null;
  master?: {
    avatarUrl?: string | null;
    avatarFile?: { path?: string | null } | null;
    user?: {
      firstName?: string | null;
      lastName?: string | null;
      email?: string | null;
      phone?: string | null;
      avatarFile?: { path?: string | null } | null;
    } | null;
  } | null;
} & Record<string, unknown>;

function clientAvatarSrc(c: ReportLike['client']): string | undefined {
  const raw =
    c?.avatarFile?.path ?? c?.clientPhotos?.[0]?.file?.path ?? null;
  return raw ? mediaUrl(raw) : undefined;
}

function masterAvatarSrc(m: ReportLike['master']): string | undefined {
  if (!m) return undefined;
  const raw = m.avatarUrl || m.avatarFile?.path || m.user?.avatarFile?.path || null;
  return raw ? mediaUrl(raw) : undefined;
}

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

  const clientSrc = clientAvatarSrc(report.client);
  const masterSrc = masterAvatarSrc(report.master);
  const clientDisplayName =
    [report.client?.firstName, report.client?.lastName].filter(Boolean).join(' ').trim() ||
    report.client?.email ||
    report.client?.phone ||
    '—';

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
            <div className="flex items-start gap-3">
              <Avatar className="size-11 rounded-lg shrink-0 overflow-hidden border border-border">
                {clientSrc ? (
                  <AvatarImage src={clientSrc} className="object-cover" alt="" />
                ) : null}
                <AvatarFallback className="rounded-lg p-0 bg-transparent">
                  <AvatarPlaceholder role="client" height={44} fillParent />
                </AvatarFallback>
              </Avatar>
              <div className="space-y-1 min-w-0 flex-1">
                <p className="text-sm font-semibold text-foreground truncate">{clientDisplayName}</p>
                {report.client?.email && (
                  <div className="flex items-center gap-2">
                    <Mail className="size-3.5 text-muted-foreground shrink-0" />
                    <span className="text-sm text-muted-foreground truncate">{report.client.email}</span>
                  </div>
                )}
                {report.client?.phone && (
                  <div className="flex items-center gap-2">
                    <Phone className="size-3.5 text-muted-foreground shrink-0" />
                    <span className="text-sm text-muted-foreground truncate">{report.client.phone}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="p-4 rounded-lg bg-purple-500/10 border border-purple-500/20">
            <div className="flex items-center gap-2 mb-3">
              <Briefcase className="size-5 text-purple-500" />
              <span className="text-sm font-bold text-foreground">
                {t('admin.reports.master')}
              </span>
            </div>
            <div className="flex items-start gap-3">
              <Avatar className="size-10 rounded-md shrink-0 overflow-hidden border border-border">
                {masterSrc ? (
                  <AvatarImage src={masterSrc} className="object-cover" alt="" />
                ) : null}
                <AvatarFallback className="rounded-md p-0 bg-transparent">
                  <AvatarPlaceholder role="master" height={40} fillParent />
                </AvatarFallback>
              </Avatar>
              <div className="space-y-1 min-w-0 flex-1">
                <span className="text-sm font-semibold block truncate">
                  {report.master?.user?.firstName} {report.master?.user?.lastName}
                </span>
                {report.master?.user?.email && (
                  <div className="flex items-center gap-2">
                    <Mail className="size-3.5 text-muted-foreground shrink-0" />
                    <span className="text-sm text-muted-foreground truncate">
                      {report.master.user.email}
                    </span>
                  </div>
                )}
              </div>
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
