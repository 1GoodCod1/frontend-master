import { useTranslation } from 'react-i18next';
import { Badge, Mail, Phone, User } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { PhoneVerification } from '@/features/security/components/PhoneVerification';
import AccountInfoField from './AccountInfoField';

const iconClass = 'size-5 text-primary shrink-0';

interface AccountInfoSectionProps {
  user: { email?: string; phone?: string; role?: string } | null;
  phoneVerified: boolean;
  onPhoneVerified: () => void;
  onPhoneAlreadyVerified: () => void;
}

export default function AccountInfoSection({
  user,
  phoneVerified,
  onPhoneVerified,
  onPhoneAlreadyVerified,
}: AccountInfoSectionProps) {
  const { t } = useTranslation();

  return (
    <Card className="h-full border-border bg-card transition-shadow hover:shadow-lg">
      <CardContent className="p-6">
        <h3 className="mb-6 flex items-center gap-2 text-lg font-bold text-foreground">
          <Badge className={iconClass} />
          {t('clientProfile.accountInfo')}
        </h3>

        <div className="flex flex-col gap-6">
          <AccountInfoField
            icon={<Mail className={iconClass} />}
            label={t('clientProfile.email')}
            value={user?.email ?? '—'}
          />
          <Separator className="bg-border" />
          <AccountInfoField
            icon={<Phone className={iconClass} />}
            label={t('clientProfile.phone')}
            value={user?.phone ?? '—'}
            verified={phoneVerified}
            verificationComponent={
              phoneVerified ? (
                <Alert className="mt-4 border-emerald-500/30 bg-emerald-500/10">
                  <AlertDescription className="pl-9">
                    {t('clientProfile.youAreVerified')}
                  </AlertDescription>
                </Alert>
              ) : (
                <div className="mt-4 pl-9">
                  <Alert variant="destructive" className="mb-4">
                    <AlertDescription>{t('clientProfile.phoneNotVerified')}</AlertDescription>
                  </Alert>
                  <PhoneVerification
                    onVerified={onPhoneVerified}
                    onAlreadyVerified={onPhoneAlreadyVerified}
                  />
                </div>
              )
            }
          />
          <Separator className="bg-border" />
          <AccountInfoField
            icon={<User className={iconClass} />}
            label={t('clientProfile.role')}
            value={user?.role ?? 'CLIENT'}
          />
        </div>
      </CardContent>
    </Card>
  );
}
