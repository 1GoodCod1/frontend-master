import { useTranslation } from 'react-i18next';
import { PageHeader } from '@/components/ui/PageHeader';
import { LoadingState, ErrorState } from '@/components/common/States';
import { useClientProfile } from '@/hooks/client/profile/useClientProfile';
import AvatarSection from '@/components/client/profile/AvatarSection';
import AccountInfoSection from '@/components/client/profile/AccountInfoSection';

function ClientProfilePage() {
  const { t } = useTranslation();
  const {
    user,
    phoneVerified,
    avatarUrl,
    avatarPath,
    avatarFileId,
    isLoading,
    isError,
    error,
    refetch,
    uploadLoading,
    removePhotoLoading,
    handleFileUpload,
    handleRemovePhoto,
    handlePhoneVerified,
    handlePhoneAlreadyVerified,
  } = useClientProfile();

  if (isLoading) return <LoadingState />;
  if (isError) return <ErrorState error={error} onRetry={refetch} />;

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 md:py-8 animate-in fade-in duration-500">
      <PageHeader
        title={t('clientProfile.title')}
        subtitle={t('clientProfile.subtitle')}
      />

      <div className="grid grid-cols-1 gap-8 md:grid-cols-12">
        <div className="md:col-span-5 lg:col-span-4">
          <AvatarSection
            avatarUrl={avatarUrl}
            avatarPath={avatarPath}
            avatarFileId={avatarFileId}
            onUpload={handleFileUpload}
            onRemove={handleRemovePhoto}
            uploadLoading={uploadLoading}
            removeLoading={removePhotoLoading}
            phoneVerified={phoneVerified}
          />
        </div>
        <div className="md:col-span-7 lg:col-span-8">
          <AccountInfoSection
            user={user as any}
            phoneVerified={phoneVerified}
            onPhoneVerified={handlePhoneVerified}
            onPhoneAlreadyVerified={handlePhoneAlreadyVerified}
          />
        </div>
      </div>
    </div>
  );
}

export default ClientProfilePage;
