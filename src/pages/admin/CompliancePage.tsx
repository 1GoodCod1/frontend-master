import { useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import {
  FileText,
  Download,
  ShieldCheck,
  Users,
  Wrench,
  ScrollText,
  ClipboardList,
  CheckCircle2,
  Loader2,
  Globe,
} from 'lucide-react';
import { useAppSelector } from '@/app/hooks';
import { env } from '@/services/env';
import { PageHeader } from '@/components/ui/PageHeader';
import { SectionCard } from '@/components/ui/SectionCard';
import { StatCard } from '@/components/ui/StatCard';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useAdminComplianceOverviewQuery } from '@/features/admin/adminApi';
import toast from 'react-hot-toast';
import { LoadingState, ErrorState } from '@/components/common/States';
import { toErrorMessage } from '@/utils/errors';

type ReportLocale = 'en' | 'ru' | 'ro';

export default function CompliancePage() {
  const { t, i18n } = useTranslation();
  const accessToken = useAppSelector((state) => state.auth.tokens?.accessToken);
  const [reportLocale, setReportLocale] = useState<ReportLocale>(
    (i18n.language?.slice(0, 2) as ReportLocale) || 'en',
  );
  const [downloadingDpia, setDownloadingDpia] = useState(false);
  const [downloadingRopa, setDownloadingRopa] = useState(false);

  const overview = useAdminComplianceOverviewQuery(undefined, {
    pollingInterval: 30000,
  });

  const isRecord = (v: unknown): v is Record<string, unknown> =>
    typeof v === 'object' && v !== null;

  const data = (() => {
    const raw = overview.data as unknown;
    if (isRecord(raw) && 'data' in raw && isRecord(raw.data)) return raw.data;
    if (isRecord(raw)) return raw;
    return undefined;
  })();

  const downloadPdf = useCallback(
    async (type: 'dpia' | 'ropa') => {
      const setLoading = type === 'dpia' ? setDownloadingDpia : setDownloadingRopa;
      setLoading(true);
      try {
        const response = await fetch(
          `${env.apiUrl}/admin/compliance/${type}?locale=${reportLocale}`,
          {
            headers: { Authorization: `Bearer ${accessToken}` },
          },
        );
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${type.toUpperCase()}_${new Date().toISOString().slice(0, 10)}.pdf`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        URL.revokeObjectURL(url);
        toast.success(`${type.toUpperCase()} PDF downloaded`);
      } catch (e) {
        toast.error(toErrorMessage(e) ?? `Failed to download ${type.toUpperCase()}`);
      } finally {
        setLoading(false);
      }
    },
    [accessToken, reportLocale],
  );

  if (overview.isLoading) return <LoadingState />;
  if (overview.isError) return <ErrorState error={overview.error} onRetry={overview.refetch} />;

  const totalUsers = Number(data?.totalUsers ?? 0);
  const totalMasters = Number(data?.totalMasters ?? 0);
  const totalConsents = Number(data?.totalConsents ?? 0);
  const totalAuditLogs = Number(data?.totalAuditLogs ?? 0);
  const pendingVerifications = Number(data?.pendingVerifications ?? 0);

  const c = (key: string) => t(`admin.compliance.${key}`);

  return (
    <div className="space-y-6">
      <PageHeader
        title={c('title')}
        subtitle={c('subtitle')}
        actions={
          <div className="flex items-center gap-2">
            <Globe className="size-4 text-muted-foreground" />
            <Select value={reportLocale} onValueChange={(v) => setReportLocale(v as ReportLocale)}>
              <SelectTrigger className="w-[130px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="en">English</SelectItem>
                <SelectItem value="ru">Русский</SelectItem>
                <SelectItem value="ro">Română</SelectItem>
              </SelectContent>
            </Select>
          </div>
        }
      />

      {/* Stats overview */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-5">
        <StatCard
          title={c('totalUsers')}
          value={totalUsers.toLocaleString()}
          icon={<Users className="size-5 text-blue-500" />}
          hover
        />
        <StatCard
          title={c('totalMasters')}
          value={totalMasters.toLocaleString()}
          icon={<Wrench className="size-5 text-teal-500" />}
          hover
        />
        <StatCard
          title={c('totalConsents')}
          value={totalConsents.toLocaleString()}
          icon={<ScrollText className="size-5 text-green-500" />}
          hover
        />
        <StatCard
          title={c('totalAuditLogs')}
          value={totalAuditLogs.toLocaleString()}
          icon={<ClipboardList className="size-5 text-amber-500" />}
          hover
        />
        <StatCard
          title={c('pendingVerifications')}
          value={pendingVerifications.toLocaleString()}
          icon={<ShieldCheck className="size-5 text-violet-500" />}
          hover
        />
      </div>

      {/* Document downloads */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* DPIA Card */}
        <SectionCard
          title={c('dpiaTitle')}
          icon={<FileText className="size-5" />}
        >
          <p className="text-sm text-muted-foreground mb-4">
            {c('dpiaDescription')}
          </p>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="border-green-500 text-green-600 dark:text-green-400">
                <CheckCircle2 className="size-3 mr-1" />
                {c('available')}
              </Badge>
            </div>
            <Button
              onClick={() => downloadPdf('dpia')}
              disabled={downloadingDpia}
              className="gap-2"
            >
              {downloadingDpia ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Download className="size-4" />
              )}
              {downloadingDpia ? c('generating') : c('downloadDpia')}
            </Button>
          </div>
        </SectionCard>

        {/* ROPA Card */}
        <SectionCard
          title={c('ropaTitle')}
          icon={<ScrollText className="size-5" />}
        >
          <p className="text-sm text-muted-foreground mb-4">
            {c('ropaDescription')}
          </p>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="border-green-500 text-green-600 dark:text-green-400">
                <CheckCircle2 className="size-3 mr-1" />
                {c('available')}
              </Badge>
            </div>
            <Button
              onClick={() => downloadPdf('ropa')}
              disabled={downloadingRopa}
              className="gap-2"
            >
              {downloadingRopa ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Download className="size-4" />
              )}
              {downloadingRopa ? c('generating') : c('downloadRopa')}
            </Button>
          </div>
        </SectionCard>
      </div>

      {/* Other compliance docs checklist */}
      <SectionCard
        title={c('documents')}
        icon={<ShieldCheck className="size-5" />}
      >
        <div className="divide-y divide-border">
          {/* Privacy Policy */}
          <div className="flex items-center justify-between py-3">
            <div>
              <p className="text-sm font-medium">{c('privacyPolicy')}</p>
              <p className="text-xs text-muted-foreground">{c('privacyPolicyDesc')}</p>
            </div>
            <Badge className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
              {c('privacyPolicyStatus')}
            </Badge>
          </div>

          {/* Consent proof */}
          <div className="flex items-center justify-between py-3">
            <div>
              <p className="text-sm font-medium">{c('consentProof')}</p>
              <p className="text-xs text-muted-foreground">{c('consentProofDesc')}</p>
            </div>
            <Badge className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
              {c('consentProofStatus')}
            </Badge>
          </div>

          {/* Technical measures */}
          <div className="flex items-center justify-between py-3">
            <div>
              <p className="text-sm font-medium">{c('technicalMeasures')}</p>
              <p className="text-xs text-muted-foreground">{c('technicalMeasuresDesc')}</p>
            </div>
            <Badge className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
              {c('technicalMeasuresStatus')}
            </Badge>
          </div>

          {/* DPIA status */}
          <div className="flex items-center justify-between py-3">
            <div>
              <p className="text-sm font-medium">{c('dpiaStatus')}</p>
              <p className="text-xs text-muted-foreground">Art. 35 GDPR</p>
            </div>
            <Badge className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
              {c('available')}
            </Badge>
          </div>

          {/* ROPA status */}
          <div className="flex items-center justify-between py-3">
            <div>
              <p className="text-sm font-medium">{c('ropaStatus')}</p>
              <p className="text-xs text-muted-foreground">Art. 30 GDPR</p>
            </div>
            <Badge className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
              {c('available')}
            </Badge>
          </div>
        </div>

        <p className="mt-4 text-xs text-muted-foreground italic">
          {c('lastGenerated')}
        </p>
      </SectionCard>
    </div>
  );
}
