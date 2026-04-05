import { AuthFormField } from '@/features/auth/components/AuthFormField';
import { AuthFormSelect } from '@/features/auth/components/AuthFormSelect';
import { AuthFormTextarea } from '@/features/auth/components/AuthFormTextarea';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import type { RegisterFormValues } from '@/hooks/auth/register';
import { Mail, Phone, Lock, User, MapPin, Tag, FileText, Eye, EyeOff, ArrowRight, Gift, ChevronLeft } from 'lucide-react';
import { useCallback, useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { Link as RouterLink } from 'react-router-dom';
import { useFormikContext } from 'formik';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';

interface CityOption {
  id?: string;
  slug?: string;
  name: string;
  value?: string;
}
interface CategoryOption {
  id?: string;
  slug?: string;
  name: string;
  value?: string;
}
interface ReferralInfo {
  code: string;
  referrerName?: string;
}

function getStepFieldKeys(step: number, isClient: boolean): (keyof RegisterFormValues)[] {
  if (step === 0) return ['email', 'password'];
  if (step === 1) {
    const base: (keyof RegisterFormValues)[] = ['phone', 'firstName', 'lastName'];
    if (isClient) return [...base, 'acceptedLegal'];
    return base;
  }
  if (step === 2) return ['city', 'category', 'description', 'acceptedLegal'];
  return [];
}

interface RegisterFormProps {
  isClient: boolean;
  isSubmitting: boolean;
  optionsLoading: boolean;
  cities: CityOption[];
  categories: CategoryOption[];
  referralInfo?: ReferralInfo;
  totalSteps: number;
  validateRegistrationStep: (step: number, values: RegisterFormValues) => Promise<Record<string, string>>;
}

export default function RegisterForm({
  isClient,
  isSubmitting,
  optionsLoading,
  cities,
  categories,
  referralInfo,
  totalSteps,
  validateRegistrationStep,
}: RegisterFormProps) {
  const { t } = useTranslation();
  const [showPass, setShowPass] = useState(false);
  const [step, setStep] = useState(0);
  const { values, errors, touched, setErrors, setTouched, setFieldValue, handleSubmit } =
    useFormikContext<RegisterFormValues>();

  const lastStepIndex = totalSteps - 1;

  const getCityLabel = (c: CityOption) => {
    const slug = c.slug ?? c.value;
    return slug ? (t(`cities.${slug}`, { defaultValue: c.name }) || c.name) : (c.name ?? '');
  };
  const getCategoryLabel = (c: CategoryOption) => {
    const slug = c.slug ?? c.value;
    return slug ? (t(`categories.${slug}`, { defaultValue: c.name }) || c.name) : (c.name ?? '');
  };
  const getCityValue = (c: CityOption) => c.value ?? c.slug ?? c.id ?? c.name;
  const getCategoryValue = (c: CategoryOption) => c.value ?? c.slug ?? c.id ?? c.name;

  const cityOptions = cities.map((c) => ({ value: getCityValue(c), label: getCityLabel(c) }));
  const categoryOptions = categories.map((c) => ({ value: getCategoryValue(c), label: getCategoryLabel(c) }));

  const stepTitleKey =
    step === 0
      ? 'auth.register.wizardStepCredentials'
      : step === 1
        ? 'auth.register.wizardStepContact'
        : 'auth.register.wizardStepMasterProfile';

  const handleNext = useCallback(async () => {
    const fieldKeys = getStepFieldKeys(step, isClient);
    const touchMap = fieldKeys.reduce<Record<string, boolean>>((acc, f) => {
      acc[f] = true;
      return acc;
    }, {});
    setTouched(touchMap, false);

    const stepErrors = await validateRegistrationStep(step, values);
    if (Object.keys(stepErrors).length > 0) {
      setErrors(stepErrors);
      return;
    }
    setErrors({});
    setStep((s) => Math.min(s + 1, lastStepIndex));
  }, [step, isClient, values, validateRegistrationStep, setErrors, setTouched, lastStepIndex]);

  const handleBack = useCallback(() => {
    setErrors({});
    setStep((s) => Math.max(0, s - 1));
  }, [setErrors]);

  const onFormSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (step < lastStepIndex) {
      void handleNext();
    } else {
      void handleSubmit(e);
    }
  };

  const showMasterFields = !isClient && step === 2;
  const showNameFields = step === 1;
  const showCredentials = step === 0;

  const legalConsentBlock = (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-start gap-3 rounded-lg border border-slate-200/80 bg-slate-50/50 p-3.5 dark:border-white/[0.08] dark:bg-white/[0.03]">
        <Checkbox
          id="register-accepted-legal"
          checked={values.acceptedLegal}
          onCheckedChange={(v) => setFieldValue('acceptedLegal', v === true)}
          className="mt-0.5"
        />
        <Label
          htmlFor="register-accepted-legal"
          className="cursor-pointer text-left text-[0.8125rem] font-normal leading-relaxed text-muted-foreground"
        >
          <Trans
            i18nKey="auth.register.legalConsent"
            components={{
              privacy: (
                <RouterLink
                  to="/privacy"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-medium text-amber-700 underline underline-offset-2 hover:text-amber-800 dark:text-amber-400 dark:hover:text-amber-300"
                />
              ),
              terms: (
                <RouterLink
                  to="/terms"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-medium text-amber-700 underline underline-offset-2 hover:text-amber-800 dark:text-amber-400 dark:hover:text-amber-300"
                />
              ),
            }}
          />
        </Label>
      </div>
      {touched.acceptedLegal && errors.acceptedLegal && (
        <p className="text-xs text-destructive">{errors.acceptedLegal}</p>
      )}
    </div>
  );

  return (
    <form
      method="post"
      noValidate
      onSubmit={onFormSubmit}
      className="flex flex-col gap-4"
    >
      {referralInfo && (
        <div className="flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2.5 text-sm text-amber-800 dark:border-amber-800/60 dark:bg-amber-950/40 dark:text-amber-200">
          <Gift className="size-4 shrink-0" />
          <span>
            {referralInfo.referrerName
              ? t('auth.register.invitedBy', 'Приглашён пользователем {{name}}', { name: referralInfo.referrerName })
              : t('auth.register.invitedByCode', 'Регистрация по пригласительному коду')}
          </span>
        </div>
      )}

      <div className="space-y-2">
        <div className="flex gap-1.5" role="progressbar" aria-valuenow={step + 1} aria-valuemin={1} aria-valuemax={totalSteps}>
          {Array.from({ length: totalSteps }).map((_, i) => (
            <div
              key={i}
              className={cn(
                'h-1 flex-1 rounded-full transition duration-300 ease-out',
                i <= step ? 'bg-[#f97316] shadow-[0_0_12px_rgba(249,115,22,0.35)]' : 'bg-muted'
              )}
            />
          ))}
        </div>
        <p className="text-center text-[0.78rem] font-medium text-muted-foreground">
          {t(stepTitleKey)}
        </p>
      </div>

      <div
        key={`${step}-${isClient ? 'c' : 'm'}`}
        className="faber-view-swap flex min-h-[1px] flex-col gap-3.5"
      >
          {showCredentials && (
            <>
              <AuthFormField
                name="email"
                label={t('auth.register.email')}
                type="email"
                placeholder="example@mail.com"
                autoComplete="email"
                icon={<Mail size={15} />}
              />
              <AuthFormField
                name="password"
                label={t('auth.register.password')}
                type={showPass ? 'text' : 'password'}
                placeholder={t('auth.register.passwordHintMin')}
                autoComplete="new-password"
                icon={<Lock size={15} />}
                endAdornment={
                  <span className="flex items-center gap-1">
                    <Popover>
                      <PopoverTrigger asChild>
                        <button
                          type="button"
                          className="flex shrink-0 items-center justify-center rounded-full p-1 bg-amber-100 text-amber-700 ring-1 ring-amber-200/60 transition hover:bg-amber-200 dark:bg-amber-900/40 dark:text-amber-400 dark:ring-amber-700/60 dark:hover:bg-amber-800/50 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 dark:focus:ring-offset-[#111111]"
                          aria-label={t('auth.register.passwordHint')}
                        >
                          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                            <circle cx="12" cy="12" r="10" />
                            <path d="M12 16v-4M12 8h.01" strokeLinecap="round" />
                          </svg>
                        </button>
                      </PopoverTrigger>
                      <PopoverContent
                        side="bottom"
                        align="end"
                        sideOffset={8}
                        collisionPadding={16}
                        className="z-[100] w-[min(calc(100vw-2rem),18rem)] max-w-[min(calc(100vw-2rem),18rem)] border border-slate-200 bg-white px-3 py-3 text-slate-800 shadow-lg dark:border-slate-700 dark:bg-[#1a1a1a] dark:text-slate-200"
                      >
                        <p className="mb-2 text-xs font-semibold">
                          {t('auth.register.passwordHintTitle')}
                        </p>
                        <ul className="list-outside list-disc space-y-1 pl-4 text-xs leading-snug text-slate-700 dark:text-slate-300">
                          <li>{t('auth.register.passwordHintMin')}</li>
                          <li>{t('auth.register.passwordHintUppercase')}</li>
                          <li>{t('auth.register.passwordHintLowercase')}</li>
                          <li>{t('auth.register.passwordHintDigit')}</li>
                          <li className="break-words">{t('auth.register.passwordHintSpecial')}</li>
                        </ul>
                      </PopoverContent>
                    </Popover>
                    <button
                      type="button"
                      onClick={() => setShowPass(!showPass)}
                      aria-label={showPass ? 'Hide password' : 'Show password'}
                    >
                      {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </span>
                }
              />
            </>
          )}

          {showNameFields && (
            <>
              <AuthFormField
                name="phone"
                label={t('auth.register.phone')}
                type="tel"
                placeholder="+373 (__) ___-__"
                autoComplete="tel"
                icon={<Phone size={15} />}
              />
              <div className="grid grid-cols-2 gap-3">
                <AuthFormField
                  name="firstName"
                  label={t('auth.register.firstName')}
                  placeholder="Иван"
                  icon={<User size={15} />}
                />
                <AuthFormField
                  name="lastName"
                  label={t('auth.register.lastName')}
                  placeholder="Иванов"
                  icon={<User size={15} />}
                />
              </div>
              {isClient && legalConsentBlock}
            </>
          )}

          {showMasterFields && (
            <>
              <div className="grid grid-cols-2 gap-3">
                <AuthFormSelect
                  name="city"
                  label={t('auth.register.city')}
                  placeholder={t('auth.register.notSelected')}
                  options={cityOptions}
                  icon={<MapPin size={15} />}
                  disabled={optionsLoading || cities.length === 0}
                />
                <AuthFormSelect
                  name="category"
                  label={t('auth.register.category')}
                  placeholder={t('auth.register.notSelected')}
                  options={categoryOptions}
                  icon={<Tag size={15} />}
                  disabled={optionsLoading || categories.length === 0}
                />
              </div>
              <AuthFormTextarea
                name="description"
                label={t('auth.register.description')}
                placeholder="..."
                rows={3}
                icon={<FileText size={15} />}
              />
              {legalConsentBlock}
            </>
          )}
      </div>

      <div className="flex flex-col gap-2.5 pt-0.5">
        <div className="flex gap-2">
          {step > 0 && (
            <button
              type="button"
              onClick={handleBack}
              disabled={isSubmitting}
              className="auth-outline-btn inline-flex flex-1 items-center justify-center gap-1.5 px-3 py-2.5"
            >
              <ChevronLeft size={16} />
              {t('auth.register.wizardBack')}
            </button>
          )}
          <button
            type="submit"
            disabled={isSubmitting}
            className={cn('auth-primary-btn', step > 0 ? 'flex-[1.35]' : 'w-full')}
          >
            {isSubmitting
              ? t('auth.register.creating')
              : step < lastStepIndex
                ? t('auth.register.wizardNext')
                : t('auth.register.submit')}
            {!isSubmitting && <ArrowRight size={15} />}
          </button>
        </div>
      </div>

      <div className="auth-divider text-center">
        <p className="mb-3 text-[0.82rem] text-muted-foreground">
          {t('auth.register.haveAccount')}
        </p>
        <RouterLink to="/login" className="auth-outline-btn inline-flex">
          {t('auth.login.title')}
        </RouterLink>
      </div>
    </form>
  );
}
