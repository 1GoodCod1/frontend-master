import { useTranslation } from 'react-i18next';
import { PageHeader } from '@/components/ui/PageHeader';
import { SecurityManagement } from '@/features/security/components/SecurityManagement';

export default function SecurityPage() {
  const { t } = useTranslation();
  return (
    <div className="mx-auto max-w-5xl px-4 py-6 md:py-8">
      <PageHeader
        title={t('admin.security.title')}
        subtitle={t('admin.security.subtitle')}
      />
      <SecurityManagement />
    </div>
  );
}
