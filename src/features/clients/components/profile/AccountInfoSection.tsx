import { useTranslation } from 'react-i18next';
import { Badge, Mail, Phone, User } from 'lucide-react';
import { CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { PhoneVerification } from '@/features/security/components/PhoneVerification';
import AccountInfoField from './AccountInfoField';
import { cn } from '@/lib/utils';
import {
  clientCardStaticCls,
  clientIconWrapCls,
  clientSectionTitleCls,
} from '@/lib/clientCabinetStyles';

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
    <div className={cn(clientCardStaticCls, 'h-full')}>
      <CardContent className="p-6 sm:p-8">
        <h3 className={cn('mb-6 flex items-center gap-3', clientSectionTitleCls)}>
          <span className={clientIconWrapCls}>
            <Badge className="size-4" />
          </span>
          {t('clientProfile.accountInfo', 'Информация аккаунта')}
        </h3>

        <div className="flex flex-col gap-6">
          <AccountInfoField
            icon={
              <span className={clientIconWrapCls}>
                <Mail className="size-4" />
              </span>
            }
            label={t('clientProfile.email', 'EMAIL')}
            value={user?.email ?? '—'}
          />
          <Separator className="bg-[#E9ECEF] dark:bg-white/[0.08]" />
          <AccountInfoField
            icon={
              <span className={clientIconWrapCls}>
                <Phone className="size-4" />
              </span>
            }
            label={t('clientProfile.phone', 'ТЕЛЕФОН')}
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
                  <PhoneVerification
                    onVerified={onPhoneVerified}
                    onAlreadyVerified={onPhoneAlreadyVerified}
                  />
                </div>
              )
            }
          />
          <Separator className="bg-[#E9ECEF] dark:bg-white/[0.08]" />
          <AccountInfoField
            icon={
              <span className={clientIconWrapCls}>
                <User className="size-4" />
              </span>
            }
            label={t('clientProfile.role', 'РОЛЬ')}
            value={user?.role ?? 'CLIENT'}
          />
        </div>
      </CardContent>
    </div>
  );
}
