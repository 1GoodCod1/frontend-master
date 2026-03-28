import { useTranslation } from 'react-i18next';
import { Badge, Mail, Phone, User } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { PhoneVerification } from '@/features/security/components/PhoneVerification';
import AccountInfoField from './AccountInfoField';

const iconClass = 'size-5 text-amber-500 shrink-0';

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
    <Card className="group relative h-full overflow-hidden rounded-2xl border border-black/5 bg-card shadow-sm transition duration-300 hover:border-amber-500/30 hover:shadow-md dark:border-white/5 dark:bg-card/40 dark:hover:border-amber-500/30">
      <div className="absolute inset-0 bg-gradient-to-br from-amber-500/0 via-transparent to-amber-500/0 opacity-0 transition-opacity duration-300 group-hover:from-amber-500/5 group-hover:to-transparent group-hover:opacity-100 pointer-events-none z-0" />
      <CardContent className="relative z-10 p-6 sm:p-8">
        <h3 className="mb-6 flex items-center gap-3 text-xl font-bold text-foreground">
          <div className="flex size-10 flex-shrink-0 items-center justify-center rounded-full bg-amber-100/60 dark:bg-amber-500/10">
            <Badge className={iconClass} />
          </div>
          {t('clientProfile.accountInfo', 'Информация аккаунта')}
        </h3>

        <div className="flex flex-col gap-6">
          <AccountInfoField
            icon={
              <div className="flex size-10 items-center justify-center rounded-xl bg-black/5 dark:bg-white/5 group-hover:bg-amber-100/50 dark:group-hover:bg-amber-500/20 transition-colors">
                <Mail className={iconClass} />
              </div>
            }
            label={t('clientProfile.email', 'EMAIL')}
            value={user?.email ?? '—'}
          />
          <Separator className="bg-border/50 dark:bg-white/5" />
          <AccountInfoField
            icon={
              <div className="flex size-10 items-center justify-center rounded-xl bg-black/5 dark:bg-white/5 group-hover:bg-amber-100/50 dark:group-hover:bg-amber-500/20 transition-colors">
                <Phone className={iconClass} />
              </div>
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
          <Separator className="bg-border/50 dark:bg-white/5" />
          <AccountInfoField
            icon={
              <div className="flex size-10 items-center justify-center rounded-xl bg-black/5 dark:bg-white/5 group-hover:bg-amber-100/50 dark:group-hover:bg-amber-500/20 transition-colors">
                <User className={iconClass} />
              </div>
            }
            label={t('clientProfile.role', 'РОЛЬ')}
            value={user?.role ?? 'CLIENT'}
          />
        </div>
      </CardContent>
    </Card>
  );
}
