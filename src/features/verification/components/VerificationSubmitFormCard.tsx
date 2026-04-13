import { useMemo, useState } from 'react';
import { Formik } from 'formik';
import * as Yup from 'yup';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { Upload, Phone } from 'lucide-react';
import { UnsavedChangesPrompt } from '@/hooks/useUnsavedChangesPrompt';
import { toErrorMessage } from '@/utils/errors';
import { mediaUrl } from '@/utils/media';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { FormikTextField } from '@/components/ui/FormikTextField';
import { FormikSelect } from '@/components/ui/FormikSelect';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { DOCUMENT_TYPE_VALUES } from '@/constants/verificationDocumentType';
import type { VerificationData } from '@/types/verificationPage';

type SubmitVerificationArgs = {
  documentType: string;
  documentNumber: string;
  documentFrontId: string;
  documentBackId?: string;
  selfieId?: string;
  phone: string;
};

type VerificationSubmitFormCardProps = {
  verification: VerificationData['verification'];
  userPhone: string;
  canSubmit: boolean;
  isSubmitting: boolean;
  isUploading: boolean;
  onSubmitVerification: (args: SubmitVerificationArgs) => Promise<unknown>;
  onGrantConsent: () => Promise<unknown>;
  onRefetchStatus: () => Promise<unknown>;
  handleFileUpload: (
    file: File,
    setPreview: (url: string) => void,
    setFileId: (id: string) => void,
  ) => Promise<void>;
};

export function VerificationSubmitFormCard({
  verification,
  userPhone,
  canSubmit,
  isSubmitting,
  isUploading,
  onSubmitVerification,
  onGrantConsent,
  onRefetchStatus,
  handleFileUpload,
}: VerificationSubmitFormCardProps) {
  const { t } = useTranslation();

  const documentTypes = useMemo(
    () =>
      DOCUMENT_TYPE_VALUES.map((value) => ({
        value,
        label: t(`verification.documentTypes.${value}`),
      })),
    [t],
  );

  const schema = useMemo(
    () =>
      Yup.object({
        documentType: Yup.string().required(t('verification.validation.documentTypeRequired')),
        documentNumber: Yup.string().required(t('verification.validation.documentNumberRequired')),
        phone: Yup.string().required(t('verification.validation.phoneRequired')),
      }),
    [t],
  );

  const [consentChecked, setConsentChecked] = useState(false);
  const [documentFrontId, setDocumentFrontId] = useState('');
  const [documentBackId, setDocumentBackId] = useState('');
  const [selfieId, setSelfieId] = useState('');
  const [documentFrontPreview, setDocumentFrontPreview] = useState('');
  const [documentBackPreview, setDocumentBackPreview] = useState('');
  const [selfiePreview, setSelfiePreview] = useState('');

  return (
    <Card className="overflow-hidden border-transparent dark:border-white/[0.08] bg-white dark:bg-black/40 dark:backdrop-blur-xl shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.06)] dark:shadow-none transition duration-300">
      <CardContent className="p-6">
        <Formik
          initialValues={{
            documentType: verification?.documentType ?? '',
            documentNumber: verification?.documentNumber ?? '',
            phone: userPhone,
          }}
          validationSchema={schema}
          enableReinitialize
          onSubmit={async (values) => {
            if (!documentFrontId) {
              toast.error(t('verification.documentFrontRequired'));
              return;
            }
            if (!consentChecked) {
              toast.error(t('verification.consentRequired'));
              return;
            }
            try {
              await onGrantConsent();
              await onSubmitVerification({
                documentType: values.documentType,
                documentNumber: values.documentNumber,
                documentFrontId,
                documentBackId: documentBackId || undefined,
                selfieId: selfieId || undefined,
                phone: values.phone,
              });
              toast.success(t('verification.submitted'));
              await onRefetchStatus();
            } catch (err: unknown) {
              toast.error(toErrorMessage(err) ?? t('verification.submitError'));
            }
          }}
        >
          {({ handleSubmit, dirty }) => (
            <>
              <UnsavedChangesPrompt when={dirty} message={t('unsaved.leaveConfirm')} />
              <form onSubmit={handleSubmit} className="space-y-6">
                <Alert className="rounded-lg border-slate-100 dark:border-white/[0.06] bg-slate-50/50 dark:bg-white/[0.04]">
                  <AlertDescription>{t('verification.info')}</AlertDescription>
                </Alert>

                <div className="relative">
                  <Phone className="absolute left-3 top-10 z-10 size-4 text-muted-foreground" />
                  <FormikTextField
                    name="phone"
                    label={t('verification.phone')}
                    placeholder={t('verification.phone')}
                    className="pl-9"
                  />
                </div>

                <FormikSelect
                  name="documentType"
                  label={t('verification.documentType')}
                  placeholder={t('verification.documentType')}
                  options={documentTypes.map((d) => ({ value: d.value, label: d.label }))}
                />

                <FormikTextField
                  name="documentNumber"
                  label={t('verification.documentNumber')}
                  placeholder={t('verification.documentNumber')}
                />

                <Separator className="bg-slate-100 dark:bg-white/[0.08]" />

                <div className="space-y-2">
                  <Label className="font-semibold">{t('verification.documentFrontSide')} *</Label>
                  <div className="flex flex-wrap items-center gap-3">
                    <Button
                      type="button"
                      asChild
                      disabled={isUploading}
                      className="gap-2 border-0 bg-amber-50 text-amber-700 shadow-sm transition hover:bg-amber-100 dark:bg-amber-900/30 dark:text-amber-400 dark:hover:bg-amber-800/40"
                    >
                      <Label className="cursor-pointer">
                        <Upload className="size-4" />
                        {documentFrontId ? t('verification.changeFile') : t('verification.upload')}
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) void handleFileUpload(file, setDocumentFrontPreview, setDocumentFrontId);
                          }}
                        />
                      </Label>
                    </Button>
                    {documentFrontPreview && (
                      <div className="size-24 overflow-hidden rounded-md border border-slate-200 dark:border-white/[0.08]">
                        <img
                          src={
                            documentFrontPreview.startsWith('blob:') || documentFrontPreview.startsWith('http')
                              ? documentFrontPreview
                              : mediaUrl(documentFrontPreview)
                          }
                          alt="Document front"
                          className="size-full object-cover"
                        />
                      </div>
                    )}
                  </div>
                  {!documentFrontId && (
                    <p className="text-xs text-destructive">{t('verification.documentFrontRequired')}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label className="font-semibold">
                    {t('verification.documentBackSide')} ({t('verification.optional')})
                  </Label>
                  <div className="flex flex-wrap items-center gap-3">
                    <Button
                      type="button"
                      asChild
                      disabled={isUploading}
                      className="gap-2 border-0 bg-amber-50 text-amber-700 shadow-sm transition hover:bg-amber-100 dark:bg-amber-900/30 dark:text-amber-400 dark:hover:bg-amber-800/40"
                    >
                      <Label className="cursor-pointer">
                        <Upload className="size-4" />
                        {documentBackId ? t('verification.changeFile') : t('verification.upload')}
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) void handleFileUpload(file, setDocumentBackPreview, setDocumentBackId);
                          }}
                        />
                      </Label>
                    </Button>
                    {documentBackPreview && (
                      <div className="size-24 overflow-hidden rounded-md border border-slate-200 dark:border-white/[0.08]">
                        <img
                          src={
                            documentBackPreview.startsWith('blob:') || documentBackPreview.startsWith('http')
                              ? documentBackPreview
                              : mediaUrl(documentBackPreview)
                          }
                          alt="Document back"
                          className="size-full object-cover"
                        />
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="font-semibold">
                    {t('verification.selfie')} ({t('verification.optional')})
                  </Label>
                  <div className="flex flex-wrap items-center gap-3">
                    <Button
                      type="button"
                      asChild
                      disabled={isUploading}
                      className="gap-2 border-0 bg-amber-50 text-amber-700 shadow-sm transition hover:bg-amber-100 dark:bg-amber-900/30 dark:text-amber-400 dark:hover:bg-amber-800/40"
                    >
                      <Label className="cursor-pointer">
                        <Upload className="size-4" />
                        {selfieId ? t('verification.changeFile') : t('verification.upload')}
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) void handleFileUpload(file, setSelfiePreview, setSelfieId);
                          }}
                        />
                      </Label>
                    </Button>
                    {selfiePreview && (
                      <div className="size-24 overflow-hidden rounded-md border border-slate-200 dark:border-white/[0.08]">
                        <img
                          src={
                            selfiePreview.startsWith('blob:') || selfiePreview.startsWith('http')
                              ? selfiePreview
                              : mediaUrl(selfiePreview)
                          }
                          alt="Selfie"
                          className="size-full object-cover"
                        />
                      </div>
                    )}
                  </div>
                </div>

                <Separator className="bg-slate-100 dark:bg-white/[0.08]" />

                <div className="flex items-start gap-3 rounded-lg border border-slate-200 bg-slate-50/50 p-4 dark:border-white/[0.08] dark:bg-white/[0.04]">
                  <Checkbox
                    id="consent"
                    checked={consentChecked}
                    onCheckedChange={(v) => setConsentChecked(v === true)}
                    className="mt-0.5"
                  />
                  <Label htmlFor="consent" className="cursor-pointer text-sm leading-relaxed text-muted-foreground">
                    {t('verification.consentText')}
                  </Label>
                </div>
                {!consentChecked && (
                  <p className="text-xs text-destructive">{t('verification.consentRequired')}</p>
                )}

                <Button
                  type="submit"
                  size="lg"
                  disabled={!canSubmit || isSubmitting || isUploading || !documentFrontId || !consentChecked}
                  className="w-full py-6"
                >
                  {isSubmitting ? t('verification.submitting') : t('verification.submit')}
                </Button>
              </form>
            </>
          )}
        </Formik>
      </CardContent>
    </Card>
  );
}
