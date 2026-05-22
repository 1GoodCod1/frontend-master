import { useTranslation } from 'react-i18next';
import { Shield, ChevronRight } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { masterDetailCardCls, masterDetailIconWrapCls, masterDetailInsetCls } from '@/features/masters/components/masterDetailsUi';
import { cn } from '@/lib/utils';

type ServiceItem = { title?: string };

interface MasterDetailsInfoProps {
  description: string;
  isVerified: boolean;
  tariff?: string;
  isPlus?: boolean;
  showContactInfo?: boolean;
  phone?: string;
  email?: string;
  experienceYears?: number;
  masterId?: string;
  services?: ServiceItem[];
  onNavigateToServices?: () => void;
}

export const MasterDetailsInfo = ({
  description,
  isVerified,
  tariff,
  isPlus,
  showContactInfo = false,
  phone,
  email,
  experienceYears: _experienceYears,
  masterId: _masterId,
  services,
  onNavigateToServices,
}: MasterDetailsInfoProps) => {
  const { t } = useTranslation();

  return (
    <Card className={masterDetailCardCls}>
      <CardHeader className="pb-3">
        <div className="flex items-center gap-3">
          <div className={masterDetailIconWrapCls}>
            <Shield className="h-5 w-5" />
          </div>
          <div className="flex-1">
            <CardTitle className="text-gray-900 dark:text-gray-100 font-semibold">{t('masterDetails.profileDetails', 'Profile details')}</CardTitle>
            <CardDescription className="text-gray-500 dark:text-gray-400 text-sm">{t('masterDetails.verifiedInfo', 'Verified information')}</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className={cn('flex items-start gap-3 p-3 border border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/20', masterDetailInsetCls)}>
          <span className="text-blue-600 dark:text-blue-400 text-lg">ℹ️</span>
          <p className="text-blue-800 dark:text-blue-300 text-sm">
            {t('masterDetails.contactAfterLead')}
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          {!isVerified && (
            <Badge variant="secondary">{t('masters.notVerified')}</Badge>
          )}
          {tariff && (
            <Badge variant="outline" className="border-gray-200 dark:border-amber-500/40 text-amber-700 dark:text-amber-400 font-medium">
              {t('masterDetails.tariffLabel', { name: tariff })}
            </Badge>
          )}
          {isPlus && (
            <Badge className="bg-red-600 text-white font-semibold shadow-sm">
              {t('masters.plus')}
            </Badge>
          )}
        </div>

        <div className={cn('min-w-0 max-w-full border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 p-3 overflow-hidden', masterDetailInsetCls)}>
          <p className="text-xs uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2 font-medium">
            {t('masterDetails.descriptionLabel')}
          </p>
          <p className="text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap break-words [overflow-wrap:anywhere]">
            {description || t('masterDetails.noDescription')}
          </p>
        </div>

        {Array.isArray(services) && services.length > 0 && (
          <div className="space-y-2">
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {t('masterDetails.servicesOffered')}
            </p>
            <div className="flex flex-wrap gap-2">
              {services
                .filter((s) => s && typeof s.title === 'string' && s.title.trim())
                .map((s, idx) => (
                  <Badge
                    key={`${s.title}-${idx}`}
                    variant="secondary"
                    className="rounded-lg px-3 py-1.5 font-normal bg-gray-100 dark:bg-white/10 text-gray-700 dark:text-gray-300 border-0"
                  >
                    {s.title!.trim()}
                  </Badge>
                ))}
            </div>
            {onNavigateToServices && (
              <button
                type="button"
                onClick={onNavigateToServices}
                className="inline-flex items-center gap-1 text-sm font-medium text-amber-600 dark:text-amber-400 hover:text-amber-700 dark:hover:text-amber-300 hover:underline"
              >
                {t('masterDetails.moreAboutServices')}
                <ChevronRight className="h-4 w-4" />
              </button>
            )}
          </div>
        )}

        {showContactInfo && (
          <>
            <Separator />
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
              <div className={cn('border border-gray-200 dark:border-amber-500/20 bg-amber-50/70 dark:bg-amber-900/15 p-3', masterDetailInsetCls)}>
                <p className="text-xs uppercase tracking-wider text-muted-foreground mb-0.5">
                  {t('masterDetails.phone')}
                </p>
                <p className="font-semibold text-amber-700 dark:text-amber-400">{phone ?? '—'}</p>
              </div>
              <div className={cn('border border-gray-200 dark:border-amber-500/20 bg-amber-50/70 dark:bg-amber-900/15 p-3', masterDetailInsetCls)}>
                <p className="text-xs uppercase tracking-wider text-muted-foreground mb-0.5">
                  {t('masterDetails.email')}
                </p>
                <p className="font-semibold text-amber-700 dark:text-amber-400">{email ?? '—'}</p>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};
