import { AuthFormField } from '@/features/auth/components/AuthFormField';
import { AuthFormSelect } from '@/features/auth/components/AuthFormSelect';
import { AuthFormTextarea } from '@/features/auth/components/AuthFormTextarea';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Mail, Phone, Lock, User, MapPin, Tag, FileText, Eye, EyeOff, ArrowRight, Gift } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link as RouterLink } from 'react-router-dom';

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

interface RegisterFormProps {
  isClient: boolean;
  isSubmitting: boolean;
  optionsLoading: boolean;
  cities: CityOption[];
  categories: CategoryOption[];
  referralInfo?: ReferralInfo;
}

export default function RegisterForm({
  isClient,
  isSubmitting,
  optionsLoading,
  cities,
  categories,
  referralInfo,
}: RegisterFormProps) {
  const { t } = useTranslation();
  const [showPass, setShowPass] = useState(false);

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

  return (
    <div className="flex flex-col gap-3.5">
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
      <AuthFormField
        name="email"
        label={t('auth.register.email')}
        type="email"
        placeholder="example@mail.com"
        autoComplete="email"
        icon={<Mail size={15} />}
      />
      <AuthFormField
        name="phone"
        label={t('auth.register.phone')}
        type="tel"
        placeholder="+373 (__) ___-__"
        autoComplete="tel"
        icon={<Phone size={15} />}
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
            <TooltipProvider delayDuration={200}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    type="button"
                    className="flex shrink-0 items-center justify-center rounded-full p-1 bg-amber-100 text-amber-700 ring-1 ring-amber-200/60 transition-all hover:bg-amber-200 dark:bg-amber-900/40 dark:text-amber-400 dark:ring-amber-700/60 dark:hover:bg-amber-800/50 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 dark:focus:ring-offset-[#111111]"
                    aria-label={t('auth.register.passwordHint')}
                  >
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <circle cx="12" cy="12" r="10" />
                      <path d="M12 16v-4M12 8h.01" strokeLinecap="round" />
                    </svg>
                  </button>
                </TooltipTrigger>
                <TooltipContent
                  side="top"
                  className="max-w-[240px] border border-slate-200 bg-white px-4 py-3 text-slate-800 shadow-lg dark:border-slate-700 dark:bg-[#1a1a1a] dark:text-slate-200"
                >
                  <p className="mb-2 text-xs font-semibold">
                    {t('auth.register.passwordHintTitle')}
                  </p>
                  <ul className="list-inside list-disc space-y-1 text-xs text-slate-700 dark:text-slate-300">
                    <li>{t('auth.register.passwordHintMin')}</li>
                    <li>{t('auth.register.passwordHintUppercase')}</li>
                    <li>{t('auth.register.passwordHintLowercase')}</li>
                    <li>{t('auth.register.passwordHintDigit')}</li>
                    <li>{t('auth.register.passwordHintSpecial')}</li>
                  </ul>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
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

      {!isClient && (
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
        </>
      )}

      <button
        type="submit"
        disabled={isSubmitting}
        className="auth-primary-btn"
      >
        {isSubmitting ? t('auth.register.creating') : t('auth.register.submit')}
        <ArrowRight size={15} />
      </button>

      <div className="auth-divider text-center">
        <p className="mb-3 text-[0.82rem] text-muted-foreground">
          {t('auth.register.haveAccount')}
        </p>
        <RouterLink to="/login" className="auth-outline-btn inline-flex">
          {t('auth.login.title')}
        </RouterLink>
      </div>
    </div>
  );
}
