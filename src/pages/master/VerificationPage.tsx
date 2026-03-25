import { useState, useEffect } from 'react';
import { Upload, CheckCircle, Hourglass, Phone } from 'lucide-react';
import { Formik } from 'formik';
import * as Yup from 'yup';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { PageHeader } from '@/components/ui/PageHeader';
import { LoadingState, ErrorState } from '@/components/common/States';
import {
  useGetMyVerificationStatusQuery,
  useSubmitVerificationMutation,
} from '@/features/verification/verificationApi';
import { useGrantConsentMutation } from '@/features/consent/consentApi';
import { useFilesUploadMutation } from '@/features/files/filesApi';
import { useAuthMeQuery } from '@/features/auth/authApi';
import { formatDateTimeLong, getLocaleFromLanguage } from '@/utils/date';
import { mediaUrl } from '@/utils/media';
import { UnsavedChangesPrompt } from '@/hooks/useUnsavedChangesPrompt';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { FormikTextField } from '@/components/ui/FormikTextField';
import { FormikSelect } from '@/components/ui/FormikSelect';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';

const documentTypes = [
  { value: 'PASSPORT', label: 'Паспорт' },
  { value: 'ID_CARD', label: 'ID карта' },
  { value: 'DRIVER_LICENSE', label: 'Водительское удостоверение' },
];

const schema = Yup.object({
  documentType: Yup.string().required('Тип документа обязателен'),
  documentNumber: Yup.string().required('Номер документа обязателен'),
  phone: Yup.string().required('Телефон обязателен'),
});

interface VerificationData {
  isVerified?: boolean;
  pendingVerification?: boolean;
  verification?: {
    status?: string;
    documentType?: string;
    documentNumber?: string;
    phone?: string;
    phoneVerified?: boolean;
    submittedAt?: string;
    notes?: string;
    documentFront?: { url?: string; path?: string };
    documentBack?: { url?: string; path?: string };
    selfie?: { url?: string; path?: string };
  };
}

export default function VerificationPage() {
  const { t, i18n } = useTranslation();
  const statusQuery = useGetMyVerificationStatusQuery(undefined, {
    refetchOnMountOrArgChange: true,
  });
  const [submitVerification, { isLoading: isSubmitting }] = useSubmitVerificationMutation();
  const [grantConsent] = useGrantConsentMutation();
  const [uploadFile, { isLoading: isUploading }] = useFilesUploadMutation();
  const { data: meData } = useAuthMeQuery();

  const userPhone = ((meData as { phone?: string })?.phone ?? '') as string;

  const [consentChecked, setConsentChecked] = useState(false);
  const [documentFrontId, setDocumentFrontId] = useState('');
  const [documentBackId, setDocumentBackId] = useState('');
  const [selfieId, setSelfieId] = useState('');
  const [documentFrontPreview, setDocumentFrontPreview] = useState('');
  const [documentBackPreview, setDocumentBackPreview] = useState('');
  const [selfiePreview, setSelfiePreview] = useState('');

  const handleFileUpload = async (
    file: File,
    setPreview: (url: string) => void,
    setFileId: (id: string) => void
  ) => {
    try {
      const result = await uploadFile({ file }).unwrap();
      const fileData = (result as { data?: { id?: string; fileId?: string; url?: string; path?: string }; id?: string; url?: string; path?: string })?.data ?? result;
      const fileId = fileData?.id ?? (fileData as { fileId?: string })?.fileId ?? '';
      setFileId(fileId);
      const url = (fileData as { url?: string })?.url ?? (fileData as { path?: string })?.path ?? '';
      setPreview(url);
      toast.success(t('verification.fileUploaded'));
    } catch (err: unknown) {
      const msg = err && typeof err === 'object' && 'data' in err && (err as { data?: { message?: string } }).data?.message;
      toast.error((msg as string) || t('verification.fileUploadError'));
    }
  };

  const statusData = statusQuery.data as { data?: VerificationData } | VerificationData | undefined;
  const actualData: VerificationData | undefined = (statusData as { data?: VerificationData })?.data ?? (statusData as VerificationData);
  const isVerified = actualData?.isVerified ?? false;
  const pendingVerification = actualData?.pendingVerification ?? false;
  const verification = actualData?.verification;

  useEffect(() => {
    if (pendingVerification && verification?.status === 'PENDING') {
      const interval = setInterval(() => statusQuery.refetch(), 10000);
      return () => clearInterval(interval);
    }
  }, [pendingVerification, verification?.status, statusQuery]);

  if (statusQuery.isLoading) return <LoadingState />;
  if (statusQuery.isError) return <ErrorState error={statusQuery.error as Error} onRetry={statusQuery.refetch} />;

  if (isVerified && !pendingVerification) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-6 md:py-8 lg:px-8">
        <div className="mb-8">
          <PageHeader title={t('verification.title')} subtitle={t('verification.verifiedSubtitle')} />
        </div>
        <Card className="overflow-hidden border-transparent dark:border-white/[0.08] bg-white dark:bg-black/40 dark:backdrop-blur-xl shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.06)] dark:shadow-none transition-all duration-300 text-center">
          <CardContent className="flex flex-col items-center px-6 pt-10 pb-10">
            <CheckCircle className="mb-4 size-20 text-emerald-600 dark:text-emerald-500" />
            <h2 className="text-xl font-bold">{t('verification.verified')}</h2>
            <p className="mt-2 text-muted-foreground">{t('verification.verifiedMessage')}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (pendingVerification) {
    const docTypeLabel = verification?.documentType
      ? documentTypes.find((d) => d.value === verification.documentType)?.label ?? verification.documentType
      : '-';
    const submittedDate = verification?.submittedAt
      ? formatDateTimeLong(verification.submittedAt, getLocaleFromLanguage(i18n.language))
      : '';

    const getImageUrl = (file: { url?: string; path?: string } | undefined) => {
      if (!file) return null;
      const url = file.url ?? file.path;
      return url?.startsWith('http') ? url : mediaUrl(url);
    };

    return (
      <div className="mx-auto max-w-2xl px-4 py-6 md:py-8 lg:px-8">
        <div className="mb-8">
          <PageHeader title={t('verification.title')} subtitle={t('verification.pendingSubtitle')} />
        </div>

        <Card className="overflow-hidden border-transparent dark:border-white/[0.08] bg-white dark:bg-black/40 dark:backdrop-blur-xl shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.06)] dark:shadow-none transition-all duration-300">
          <CardContent className="space-y-6 p-6">
            <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
              <Hourglass className="size-14 shrink-0 text-amber-500 dark:text-amber-400" />
              <div className="text-center sm:text-left">
                <h2 className="text-xl font-bold">{t('verification.pending')}</h2>
                <Badge className="mt-2" variant="secondary">
                  {t('verification.status.pending')}
                </Badge>
              </div>
            </div>

            <Alert className="rounded-lg border-slate-100 dark:border-white/[0.06] bg-slate-50/50 dark:bg-white/[0.04]">
              <AlertDescription>{t('verification.pendingMessage')}</AlertDescription>
            </Alert>

            <Separator className="bg-slate-100 dark:bg-white/[0.08]" />

            <div className="space-y-4">
              <h3 className="text-base font-semibold">{t('verification.requestDetails')}</h3>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">{t('verification.documentType')}</p>
                  <p className="font-medium">{docTypeLabel}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">{t('verification.documentNumber')}</p>
                  <p className="font-medium">{verification?.documentNumber ?? '-'}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">{t('verification.phone')}</p>
                  <div className="flex items-center gap-2">
                    <p className="font-medium">{verification?.phone ?? '-'}</p>
                    {verification?.phoneVerified && (
                      <Badge variant="default" className="bg-emerald-600">{t('verification.verifiedBadge')}</Badge>
                    )}
                  </div>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">{t('verification.submittedAt')}</p>
                  <p className="font-medium">{submittedDate}</p>
                </div>
              </div>

              <Separator className="bg-slate-100 dark:bg-white/[0.08]" />

              <h3 className="text-base font-semibold">{t('verification.uploadedDocuments')}</h3>
              <div className="grid gap-4 sm:grid-cols-2">
                {verification?.documentFront && (
                  <Card className="overflow-hidden border-transparent dark:border-white/[0.08] bg-white dark:bg-black/30 shadow-[0_2px_10px_-3px_rgba(6,81,237,0.06)] dark:shadow-none">
                    <button
                      type="button"
                      className="block w-full cursor-pointer border-0 bg-transparent p-0"
                      onClick={() => window.open(getImageUrl(verification.documentFront) ?? '', '_blank')}
                    >
                      <img
                        src={getImageUrl(verification.documentFront) ?? ''}
                        alt={t('verification.documentFront')}
                        className="h-48 w-full object-cover"
                      />
                    </button>
                    <div className="p-3">
                      <p className="text-sm font-semibold">{t('verification.documentFront')}</p>
                    </div>
                  </Card>
                )}
                {verification?.documentBack && (
                  <Card className="overflow-hidden border-transparent dark:border-white/[0.08] bg-white dark:bg-black/30 shadow-[0_2px_10px_-3px_rgba(6,81,237,0.06)] dark:shadow-none">
                    <button
                      type="button"
                      className="block w-full cursor-pointer border-0 bg-transparent p-0"
                      onClick={() => window.open(getImageUrl(verification.documentBack) ?? '', '_blank')}
                    >
                      <img
                        src={getImageUrl(verification.documentBack) ?? ''}
                        alt={t('verification.documentBack')}
                        className="h-48 w-full object-cover"
                      />
                    </button>
                    <div className="p-3">
                      <p className="text-sm font-semibold">{t('verification.documentBack')}</p>
                    </div>
                  </Card>
                )}
                {verification?.selfie && (
                  <Card className="overflow-hidden border-transparent dark:border-white/[0.08] bg-white dark:bg-black/30 shadow-[0_2px_10px_-3px_rgba(6,81,237,0.06)] dark:shadow-none">
                    <button
                      type="button"
                      className="block w-full cursor-pointer border-0 bg-transparent p-0"
                      onClick={() => window.open(getImageUrl(verification.selfie) ?? '', '_blank')}
                    >
                      <img
                        src={getImageUrl(verification.selfie) ?? ''}
                        alt={t('verification.selfie')}
                        className="h-48 w-full object-cover"
                      />
                    </button>
                    <div className="p-3">
                      <p className="text-sm font-semibold">{t('verification.selfie')}</p>
                    </div>
                  </Card>
                )}
              </div>

              <Alert variant="destructive" className="rounded-lg">
                <AlertDescription>{t('verification.restrictionsActive')}</AlertDescription>
              </Alert>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const canSubmit = !pendingVerification || verification?.status === 'REJECTED';

  return (
    <div className="mx-auto max-w-2xl px-4 py-6 md:py-8 lg:px-8">
      <div className="mb-8">
        <PageHeader title={t('verification.title')} subtitle={t('verification.subtitle')} />
      </div>

      {verification?.status === 'REJECTED' && (
        <Alert variant="destructive" className="mb-6 rounded-lg">
          <AlertDescription>
            <p className="font-semibold">{t('verification.rejected')}</p>
            {verification.notes && (
              <p className="mt-1">
                {t('verification.rejectionReason')}: {verification.notes}
              </p>
            )}
          </AlertDescription>
        </Alert>
      )}

      <Card className="overflow-hidden border-transparent dark:border-white/[0.08] bg-white dark:bg-black/40 dark:backdrop-blur-xl shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.06)] dark:shadow-none transition-all duration-300">
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
                // Record GDPR consent before submitting verification
                await grantConsent({
                  consentType: 'VERIFICATION_DATA_PROCESSING',
                  version: '1.0',
                }).unwrap();

                await submitVerification({
                  documentType: values.documentType,
                  documentNumber: values.documentNumber,
                  documentFrontId,
                  documentBackId: documentBackId || undefined,
                  selfieId: selfieId || undefined,
                  phone: values.phone,
                }).unwrap();
                toast.success(t('verification.submitted'));
                await statusQuery.refetch();
              } catch (err: unknown) {
                const msg =
                  err && typeof err === 'object' && 'data' in err && (err as { data?: { message?: string } }).data?.message;
                const fallback = err instanceof Error ? err.message : t('verification.submitError');
                toast.error((msg as string) || fallback);
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
                    <FormikTextField name="phone" label={t('verification.phone')} placeholder={t('verification.phone')} className="pl-9" />
                  </div>

                  <FormikSelect
                    name="documentType"
                    label={t('verification.documentType')}
                    placeholder={t('verification.documentType')}
                    options={documentTypes.map((d) => ({ value: d.value, label: d.label }))}
                  />

                  <FormikTextField name="documentNumber" label={t('verification.documentNumber')} placeholder={t('verification.documentNumber')} />

                  <Separator className="bg-slate-100 dark:bg-white/[0.08]" />

                  <div className="space-y-2">
                    <Label className="font-semibold">{t('verification.documentFrontSide')} *</Label>
                    <div className="flex flex-wrap items-center gap-3">
                      <Button type="button" asChild disabled={isUploading} className="gap-2 border-0 bg-amber-50 text-amber-700 shadow-sm transition-all hover:bg-amber-100 dark:bg-amber-900/30 dark:text-amber-400 dark:hover:bg-amber-800/40">
                        <Label className="cursor-pointer">
                          <Upload className="size-4" />
                          {documentFrontId ? t('verification.changeFile') : t('verification.upload')}
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) handleFileUpload(file, setDocumentFrontPreview, setDocumentFrontId);
                            }}
                          />
                        </Label>
                      </Button>
                      {documentFrontPreview && (
                        <div className="size-24 overflow-hidden rounded-md border border-slate-200 dark:border-white/[0.08]">
                          <img
                            src={documentFrontPreview.startsWith('http') ? documentFrontPreview : mediaUrl(documentFrontPreview)}
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
                      <Button type="button" asChild disabled={isUploading} className="gap-2 border-0 bg-amber-50 text-amber-700 shadow-sm transition-all hover:bg-amber-100 dark:bg-amber-900/30 dark:text-amber-400 dark:hover:bg-amber-800/40">
                        <Label className="cursor-pointer">
                          <Upload className="size-4" />
                          {documentBackId ? t('verification.changeFile') : t('verification.upload')}
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) handleFileUpload(file, setDocumentBackPreview, setDocumentBackId);
                            }}
                          />
                        </Label>
                      </Button>
                      {documentBackPreview && (
                        <div className="size-24 overflow-hidden rounded-md border border-slate-200 dark:border-white/[0.08]">
                          <img
                            src={documentBackPreview.startsWith('http') ? documentBackPreview : mediaUrl(documentBackPreview)}
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
                      <Button type="button" asChild disabled={isUploading} className="gap-2 border-0 bg-amber-50 text-amber-700 shadow-sm transition-all hover:bg-amber-100 dark:bg-amber-900/30 dark:text-amber-400 dark:hover:bg-amber-800/40">
                        <Label className="cursor-pointer">
                          <Upload className="size-4" />
                          {selfieId ? t('verification.changeFile') : t('verification.upload')}
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) handleFileUpload(file, setSelfiePreview, setSelfieId);
                            }}
                          />
                        </Label>
                      </Button>
                      {selfiePreview && (
                        <div className="size-24 overflow-hidden rounded-md border border-slate-200 dark:border-white/[0.08]">
                          <img
                            src={selfiePreview.startsWith('http') ? selfiePreview : mediaUrl(selfiePreview)}
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
    </div>
  );
}
