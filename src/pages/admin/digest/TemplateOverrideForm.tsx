import { useState } from 'react';
import type { TFunction } from 'i18next';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export function TemplateOverrideForm({
  templateId,
  lang,
  initialSubject,
  initialBodyHtml,
  onSave,
  onCancel,
  isSaving,
  t,
}: {
  templateId: string;
  lang: string;
  initialSubject: string;
  initialBodyHtml: string;
  onSave: (subject: string, bodyHtml: string) => void;
  onCancel: () => void;
  isSaving: boolean;
  t: TFunction;
}) {
  const [subject, setSubject] = useState(initialSubject);
  const [bodyHtml, setBodyHtml] = useState(initialBodyHtml);

  return (
    <div className="space-y-4 rounded-lg border border-border bg-muted/30 p-4">
      <div className="flex items-center justify-between gap-2">
        <Button variant="ghost" size="sm" onClick={onCancel} className="gap-1.5 -ml-1">
          <ArrowLeft className="size-4" />
          {t('common.back')}
        </Button>
        <span className="text-sm font-medium text-muted-foreground">
          {templateId} · {lang}
        </span>
      </div>
      <div className="space-y-2">
        <Label htmlFor="override-subject">{t('admin.digest.templateSubject', 'Subject')}</Label>
        <Input
          id="override-subject"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          placeholder="Faber: Digest"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="override-body">{t('admin.digest.templateBody', 'HTML body')}</Label>
        {templateId === 'password-reset' && (
          <p className="text-xs text-muted-foreground rounded-md bg-muted/50 p-2">
            {t(
              'admin.digest.passwordResetPlaceholders',
              'Use {{resetLink}} for the password reset link, {{frontendUrl}} for the site URL.',
            )}
          </p>
        )}
        <Textarea
          id="override-body"
          value={bodyHtml}
          onChange={(e) => setBodyHtml(e.target.value)}
          rows={10}
          className="font-mono text-sm resize-y min-h-[200px]"
          placeholder="<p>Hello...</p>"
        />
      </div>
      <div className="flex gap-2 pt-1">
        <Button onClick={() => onSave(subject, bodyHtml)} disabled={isSaving}>
          {isSaving ? t('common.loading') : t('common.save')}
        </Button>
        <Button variant="outline" onClick={onCancel}>
          {t('common.cancel')}
        </Button>
      </div>
    </div>
  );
}
