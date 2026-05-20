import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { PageHeader } from '@/components/ui/PageHeader';
import { masterPageNarrowClassName } from '@/lib/masterCabinetStyles';
import { LoadingState, ErrorState } from '@/components/common/States';
import {
  useGetMyVerificationStatusQuery,
  useSubmitVerificationMutation,
} from '@/features/verification/verificationApi';
import { useGrantConsentMutation } from '@/features/consent/consentApi';
import { CONSENT_TYPE } from '@/constants/consentType';
import { useFilesUploadMutation } from '@/features/files/filesApi';
import { useAuthMeQuery } from '@/features/auth/authApi';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { VerificationVerifiedView } from '@/features/verification/components/VerificationVerifiedView';
import { VerificationPendingView } from '@/features/verification/components/VerificationPendingView';
import { VerificationSubmitFormCard } from '@/features/verification/components/VerificationSubmitFormCard';
import { useVerificationFileUpload } from '@/hooks/verification/useVerificationFileUpload';
import type { VerificationData } from '@/types/verificationPage';

export default function VerificationPage() {
  const { t } = useTranslation();

  const statusQuery = useGetMyVerificationStatusQuery(undefined, {
    refetchOnMountOrArgChange: true,
  });
  const [submitVerification, { isLoading: isSubmitting }] = useSubmitVerificationMutation();
  const [grantConsent] = useGrantConsentMutation();
  const [uploadFile, { isLoading: isUploading }] = useFilesUploadMutation();
  const { data: meData } = useAuthMeQuery();

  const userPhone = ((meData as { phone?: string })?.phone ?? '') as string;

  const handleFileUpload = useVerificationFileUpload(t, uploadFile);

  const statusData = statusQuery.data as { data?: VerificationData } | VerificationData | undefined;
  const actualData: VerificationData | undefined =
    (statusData as { data?: VerificationData })?.data ?? (statusData as VerificationData);
  const isVerified = actualData?.isVerified ?? false;
  const pendingVerification = actualData?.pendingVerification ?? false;
  const verification = actualData?.verification;

  useEffect(() => {
    if (pendingVerification && verification?.status === 'PENDING') {
      const interval = setInterval(() => {
        void statusQuery.refetch();
      }, 10000);
      return () => clearInterval(interval);
    }
  }, [pendingVerification, verification?.status, statusQuery]);

  if (statusQuery.isLoading) return <LoadingState />;
  if (statusQuery.isError) {
    return <ErrorState error={statusQuery.error as Error} onRetry={statusQuery.refetch} />;
  }

  if (isVerified && !pendingVerification) {
    return <VerificationVerifiedView />;
  }

  if (pendingVerification) {
    return <VerificationPendingView verification={verification} />;
  }

  const canSubmit = !pendingVerification || verification?.status === 'REJECTED';

  return (
    <div className={masterPageNarrowClassName}>
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

      <VerificationSubmitFormCard
        verification={verification}
        userPhone={userPhone}
        canSubmit={canSubmit}
        isSubmitting={isSubmitting}
        isUploading={isUploading}
        onGrantConsent={() =>
          grantConsent({
            consentType: CONSENT_TYPE.VERIFICATION_DATA_PROCESSING,
            version: '1.0',
          }).unwrap()
        }
        onSubmitVerification={(args) => submitVerification(args).unwrap()}
        onRefetchStatus={() => statusQuery.refetch()}
        handleFileUpload={handleFileUpload}
      />
    </div>
  );
}
