import { useTranslation } from 'react-i18next';
import { User } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

interface MasterDetailsInfoProps {
  description: string;
  isVerified: boolean;
  tariff?: string;
  isVip?: boolean;
  showContactInfo?: boolean;
  phone?: string;
  email?: string;
  experienceYears?: number;
}

export const MasterDetailsInfo = ({
  description,
  isVerified,
  tariff,
  isVip,
  showContactInfo = false,
  phone,
  email,
  experienceYears,
}: MasterDetailsInfoProps) => {
  const { t } = useTranslation();

  return (
    <Card className="bg-card border-2 border-[#f5f4eb] dark:border-white/[0.08] shadow-xl shadow-amber-900/20 dark:shadow-none">
      <CardHeader>
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400">
            <User className="h-5 w-5" />
          </div>
          <div>
            <CardTitle>{t('masterDetails.about')}</CardTitle>
            <CardDescription>{t('masterDetails.aboutSubtitle')}</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-wrap gap-2">
          {isVerified ? (
            <Badge className="bg-amber-600 text-white dark:bg-amber-500 font-semibold">
              {t('masters.verified')}
            </Badge>
          ) : (
            <Badge variant="secondary">{t('masters.notVerified')}</Badge>
          )}
          {tariff && (
            <Badge variant="outline" className="border-[#e8e6dd] dark:border-amber-500/40 text-amber-700 dark:text-amber-400 font-medium">
              {t('masterDetails.tariffLabel', { name: tariff })}
            </Badge>
          )}
          {isVip && (
            <Badge className="bg-red-600 text-white font-semibold shadow-sm">
              {t('masters.vip')}
            </Badge>
          )}
        </div>

        <p className="text-muted-foreground leading-relaxed">
          {description || t('masterDetails.noDescription')}
        </p>

        {!showContactInfo && (
          <p className="text-sm text-muted-foreground italic">
            {t('masterDetails.contactAfterLead')}
          </p>
        )}

        {showContactInfo && (
          <>
            <Separator />
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              <div className="rounded-lg border border-[#f5f4eb] dark:border-amber-500/20 bg-amber-100/70 dark:bg-amber-900/15 p-3">
                <p className="text-xs uppercase tracking-wider text-muted-foreground mb-0.5">
                  {t('masterDetails.phone')}
                </p>
                <p className="font-semibold text-amber-700 dark:text-amber-400">{phone ?? '—'}</p>
              </div>
              <div className="rounded-lg border border-[#f5f4eb] dark:border-amber-500/20 bg-amber-100/70 dark:bg-amber-900/15 p-3">
                <p className="text-xs uppercase tracking-wider text-muted-foreground mb-0.5">
                  {t('masterDetails.email')}
                </p>
                <p className="font-semibold text-amber-700 dark:text-amber-400">{email ?? '—'}</p>
              </div>
            </div>
          </>
        )}

        {experienceYears !== undefined && experienceYears !== null && (
          <>
            <Separator />
            <div className="rounded-lg border border-[#f5f4eb] dark:border-amber-500/20 bg-amber-100/70 dark:bg-amber-900/15 p-3 max-w-xs">
              <p className="text-xs uppercase tracking-wider text-muted-foreground mb-0.5">
                {t('masterDetails.experience')}
              </p>
              <p className="font-semibold text-amber-700 dark:text-amber-400">
                {experienceYears}{' '}
                {experienceYears === 1
                  ? t('masterDetails.experienceYear')
                  : t('masterDetails.experienceYears')}
              </p>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};
