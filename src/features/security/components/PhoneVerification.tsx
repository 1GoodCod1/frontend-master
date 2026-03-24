import { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Loader2 } from 'lucide-react';
import { formatTimeOnly, getLocaleFromLanguage } from '@/utils/date';
import {
  usePhoneVerificationSendCodeMutation,
  usePhoneVerificationVerifyMutation,
} from '@/features/security/securityApi';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { isRecord } from '@/utils/guards';

interface PhoneVerificationProps {
  onVerified?: () => void;
  onAlreadyVerified?: () => void;
}

export function PhoneVerification({ onVerified, onAlreadyVerified }: PhoneVerificationProps) {
  const { t, i18n } = useTranslation();
  const [step, setStep] = useState<'initial' | 'code'>('initial');
  const [code, setCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [expiresAt, setExpiresAt] = useState<Date | null>(null);
  const verifiedTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [sendCodeMutation, { isLoading: isSending }] = usePhoneVerificationSendCodeMutation();
  const [verifyCodeMutation, { isLoading: isVerifying }] = usePhoneVerificationVerifyMutation();

  useEffect(() => {
    return () => {
      if (verifiedTimeoutRef.current) clearTimeout(verifiedTimeoutRef.current);
    };
  }, []);

  const loading = isSending || isVerifying;

  const sendCode = async () => {
    setError(null);
    setSuccess(null);
    try {
      const response = await sendCodeMutation().unwrap();
      const expRaw = isRecord(response) ? response.expiresAt : undefined;
      const exp =
        typeof expRaw === 'string' || typeof expRaw === 'number'
          ? new Date(expRaw)
          : null;
      setExpiresAt(exp && !Number.isNaN(exp.getTime()) ? exp : null);
      setStep('code');
      setSuccess(t('security.codeSent'));
    } catch (err: unknown) {
      const dataMsg = err && typeof err === 'object' && 'data' in err
        ? (err as { data?: { message?: string } }).data?.message
        : null;
      const msg = String(dataMsg ?? (err instanceof Error ? err.message : ''));
      if (msg.toLowerCase().includes('already verified')) {
        onAlreadyVerified?.();
        return;
      }
      let displayError = dataMsg ?? t('security.sendCodeError');
      if (typeof displayError === 'string' && displayError.toLowerCase().includes('please wait before requesting a new code')) {
        displayError = t('security.pleaseWaitBeforeNewCode');
      }
      setError(displayError);
    }
  };

  const verifyCode = async () => {
    if (!code || code.length !== 6) {
      setError(t('security.enterCodeError'));
      return;
    }
    setError(null);
    try {
      await verifyCodeMutation({ code }).unwrap();
      setSuccess(t('security.phoneVerified'));
      if (verifiedTimeoutRef.current) clearTimeout(verifiedTimeoutRef.current);
      verifiedTimeoutRef.current = setTimeout(() => {
        onVerified?.();
      }, 1500);
    } catch (err: unknown) {
      const dataMsg = err && typeof err === 'object' && 'data' in err
        ? (err as { data?: { message?: string } }).data?.message
        : null;
      const msg = String(dataMsg ?? (err instanceof Error ? err.message : ''));
      if (msg.toLowerCase().includes('already verified')) {
        onAlreadyVerified?.();
        return;
      }
      let displayError = dataMsg ?? t('security.invalidCode');
      if (typeof displayError === 'string' && displayError.toLowerCase().includes('please wait before requesting a new code')) {
        displayError = t('security.pleaseWaitBeforeNewCode');
      }
      setError(displayError);
    }
  };

  return (
    <div className="mx-auto mt-8 max-w-md">
      <h3 className="mb-4 text-xl font-semibold">{t('security.phoneVerification')}</h3>

      {error && (
        <Alert variant="warning" className="mb-4">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert className="mb-4 border-emerald-500/30 bg-emerald-500/10">
          <AlertDescription>{success}</AlertDescription>
        </Alert>
      )}

      {step === 'initial' && (
        <div>
          <p className="mb-4 text-sm text-muted-foreground">
            {t('security.phoneVerificationDescription')}
          </p>
          <Button className="w-full" onClick={sendCode} disabled={loading}>
            {loading ? <Loader2 className="size-6 animate-spin" /> : t('security.sendCode')}
          </Button>
        </div>
      )}

      {step === 'code' && (
        <div>
          <p className="mb-4 text-sm text-muted-foreground">
            {t('security.enterCodeDescription')}
          </p>
          {expiresAt && (
            <p className="mb-4 block text-xs text-muted-foreground">
              {t('security.codeValidUntil')} {formatTimeOnly(expiresAt, getLocaleFromLanguage(i18n.language))}
            </p>
          )}
          <Label htmlFor="phone-code" className="mb-2 block">
            {t('security.codeLabel')}
          </Label>
          <Input
            id="phone-code"
            className="mb-4"
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
            placeholder="123456"
            maxLength={6}
            inputMode="numeric"
            autoComplete="one-time-code"
          />
          <Button
            className="mb-2 w-full"
            onClick={verifyCode}
            disabled={loading || code.length !== 6}
          >
            {loading ? <Loader2 className="size-6 animate-spin" /> : t('security.verify')}
          </Button>
          <Button variant="ghost" className="w-full" onClick={sendCode} disabled={loading}>
            {t('security.resendCode')}
          </Button>
        </div>
      )}
    </div>
  );
}
