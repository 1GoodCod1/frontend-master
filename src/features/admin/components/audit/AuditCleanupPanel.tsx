import { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Trash2, Eye } from 'lucide-react';
import toast from 'react-hot-toast';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuditCleanupMutation, type AuditCleanupRequest } from '@/features/audit/auditApi';
import { cn } from '@/lib/utils';

const CLEANUP_GROUPS = [
  'auth',
  'security',
  'consent',
  'gdpr',
  'verification',
  'admin',
  'payments',
] as const;

type CleanupMode = 'non_consent' | 'groups' | 'actions';

function parseActionsText(raw: string): string[] {
  return raw
    .split(/[\s,]+/)
    .map((s) => s.trim())
    .filter(Boolean);
}

export default function AuditCleanupPanel() {
  const { t } = useTranslation();
  const [cleanup, { isLoading }] = useAuditCleanupMutation();

  const [mode, setMode] = useState<CleanupMode>('non_consent');
  const [groups, setGroups] = useState<string[]>(['auth', 'security']);
  const [actionsText, setActionsText] = useState('');
  const [olderThanLocal, setOlderThanLocal] = useState('');
  const [confirmNoDate, setConfirmNoDate] = useState(false);

  const olderThanIso = useMemo(() => {
    if (!olderThanLocal.trim()) return undefined;
    const d = new Date(olderThanLocal);
    return Number.isNaN(d.getTime()) ? undefined : d.toISOString();
  }, [olderThanLocal]);

  const buildPayload = (dryRun: boolean): AuditCleanupRequest | null => {
    const base: AuditCleanupRequest = {
      dryRun,
      mode,
      ...(olderThanIso ? { olderThan: olderThanIso } : {}),
      ...(!olderThanIso && !dryRun ? { confirmDeleteWithoutDate: confirmNoDate } : {}),
    };

    if (mode === 'non_consent') return base;

    if (mode === 'groups') {
      if (groups.length === 0) {
        toast.error(t('admin.audit.cleanupGroupsRequired'));
        return null;
      }
      return { ...base, groups: [...groups] };
    }

    const actions = parseActionsText(actionsText);
    if (actions.length === 0) {
      toast.error(t('admin.audit.cleanupActionsRequired'));
      return null;
    }
    return { ...base, actions };
  };

  const run = async (dryRun: boolean) => {
    const payload = buildPayload(dryRun);
    if (!payload) return;
    if (!dryRun && !olderThanIso && !confirmNoDate) {
      toast.error(t('admin.audit.cleanupNeedDateOrConfirm'));
      return;
    }
    try {
      const res = await cleanup(payload).unwrap();
      if (res.dryRun) {
        toast.success(t('admin.audit.cleanupPreviewResult', { count: res.wouldDelete }));
      } else {
        toast.success(t('admin.audit.cleanupDeletedResult', { count: res.deleted }));
      }
    } catch (e: unknown) {
      const msg =
        e && typeof e === 'object' && 'data' in e
          ? String((e as { data?: { message?: string } }).data?.message ?? e)
          : String(e);
      toast.error(msg || t('admin.audit.cleanupFailed'));
    }
  };

  const toggleGroup = (g: string) => {
    setGroups((prev) => (prev.includes(g) ? prev.filter((x) => x !== g) : [...prev, g]));
  };

  return (
    <Card className="border-destructive/25 bg-destructive/[0.03]">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-semibold text-destructive">
          {t('admin.audit.cleanupTitle')}
        </CardTitle>
        <p className="text-sm text-muted-foreground">{t('admin.audit.cleanupIntro')}</p>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="space-y-2">
          <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            {t('admin.audit.cleanupCutoff')}
          </Label>
          <Input
            type="datetime-local"
            value={olderThanLocal}
            onChange={(e) => setOlderThanLocal(e.target.value)}
            className="max-w-md"
          />
          <p className="text-xs text-muted-foreground">{t('admin.audit.cleanupCutoffHint')}</p>
        </div>

        {!olderThanLocal.trim() ? (
          <label className="flex items-start gap-2 text-sm">
            <Checkbox
              checked={confirmNoDate}
              onCheckedChange={(v) => setConfirmNoDate(v === true)}
            />
            <span>{t('admin.audit.cleanupConfirmNoDate')}</span>
          </label>
        ) : null}

        <div className="space-y-3">
          <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            {t('admin.audit.cleanupScope')}
          </Label>
          <Select value={mode} onValueChange={(v) => setMode(v as CleanupMode)}>
            <SelectTrigger className="max-w-lg">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="non_consent">{t('admin.audit.cleanupModeNonConsent')}</SelectItem>
              <SelectItem value="groups">{t('admin.audit.cleanupModeGroups')}</SelectItem>
              <SelectItem value="actions">{t('admin.audit.cleanupModeActions')}</SelectItem>
            </SelectContent>
          </Select>
          {mode === 'non_consent' ? (
            <p className="text-xs text-muted-foreground">{t('admin.audit.cleanupModeNonConsentHint')}</p>
          ) : null}
          {mode === 'groups' ? (
            <>
              <p className="text-xs text-muted-foreground">{t('admin.audit.cleanupModeGroupsHint')}</p>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                {CLEANUP_GROUPS.map((g) => (
                  <label
                    key={g}
                    className={cn(
                      'flex items-center gap-2 rounded-md border border-transparent px-2 py-1.5 text-sm',
                      groups.includes(g) && 'border-primary/40 bg-primary/5',
                    )}
                  >
                    <Checkbox
                      checked={groups.includes(g)}
                      onCheckedChange={() => toggleGroup(g)}
                    />
                    {t(`admin.audit.cleanupGroup_${g}`)}
                  </label>
                ))}
              </div>
            </>
          ) : null}
          {mode === 'actions' ? (
            <>
              <p className="text-xs text-muted-foreground">{t('admin.audit.cleanupModeActionsHint')}</p>
              <Textarea
                value={actionsText}
                onChange={(e) => setActionsText(e.target.value)}
                placeholder="LOGIN_SUCCESS, CONSENT_GRANTED"
                className="min-h-[88px] font-mono text-xs"
              />
            </>
          ) : null}
        </div>

        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            variant="outline"
            className="gap-2"
            disabled={isLoading}
            onClick={() => void run(true)}
          >
            <Eye className="size-4" />
            {t('admin.audit.cleanupPreview')}
          </Button>
          <Button
            type="button"
            variant="destructive"
            className="gap-2"
            disabled={isLoading}
            onClick={() => void run(false)}
          >
            <Trash2 className="size-4" />
            {t('admin.audit.cleanupExecute')}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
