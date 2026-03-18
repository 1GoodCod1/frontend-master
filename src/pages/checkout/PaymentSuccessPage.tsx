import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link as RouterLink, useSearchParams } from 'react-router-dom';
import { CheckCircle } from 'lucide-react';
import { useAppSelector } from '@/app/hooks';
import { selectIsAuthed, selectRole } from '@/features/auth/selectors';
import { usePaymentsSimulateMiaSandboxMutation } from '@/features/payments/paymentsApi';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { LoadingState } from '@/components/common/States';

export default function PaymentSuccessPage() {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get('orderId');
  const isAuthed = useAppSelector(selectIsAuthed);
  const role = useAppSelector(selectRole);
  const isMaster = isAuthed && role === 'MASTER';
  const [simulateMia] = usePaymentsSimulateMiaSandboxMutation();
  const simulateDoneRef = useRef(false);
  const [simulateSettled, setSimulateSettled] = useState(false);

  const shouldSimulate = Boolean(orderId && isMaster);

  useEffect(() => {
    if (!shouldSimulate || simulateDoneRef.current) return;
    simulateDoneRef.current = true;
    simulateMia({ paymentId: orderId! })
      .unwrap()
      .catch(() => {
        // Not MIA sandbox or already paid — ignore, still show success
      })
      .finally(() => setSimulateSettled(true));
  }, [shouldSimulate, orderId, simulateMia]);

  if (shouldSimulate && !simulateSettled) {
    return (
      <div className="container max-w-md mx-auto py-12 px-4">
        <LoadingState label={t('paymentOptions.loading')} />
      </div>
    );
  }

  return (
    <div className="container max-w-md mx-auto py-12 px-4">
      <Card className="border-2 border-[#f5f4eb] dark:border-white/[0.08] text-center overflow-hidden">
        <CardContent className="p-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 mb-6">
            <CheckCircle className="h-10 w-10" />
          </div>
          <h1 className="text-xl font-bold text-foreground mb-2">
            {t('paymentOptions.successTitle')}
          </h1>
          <p className="text-muted-foreground mb-6">
            {t('paymentOptions.successMessage')}
          </p>
          <Button asChild>
            <RouterLink to="/plans">{t('paymentOptions.backToPlans')}</RouterLink>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
