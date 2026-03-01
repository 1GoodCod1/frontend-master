import { FormikTextField } from '@/components/ui/FormikTextField';
import { FormikSelect } from '@/components/ui/FormikSelect';
import { FormikTextarea } from '@/components/ui/FormikTextarea';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Info } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Link as RouterLink } from 'react-router-dom';
import { Button } from '@/components/ui/button';

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
interface RegisterFormProps {
  isClient: boolean;
  isSubmitting: boolean;
  optionsLoading: boolean;
  cities: CityOption[];
  categories: CategoryOption[];
}

export default function RegisterForm({
  isClient,
  isSubmitting,
  optionsLoading,
  cities,
  categories,
}: RegisterFormProps) {
  const { t } = useTranslation();

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

  return (
    <div className="flex flex-col gap-6">
      <FormikTextField
        name="email"
        label={t('auth.register.email')}
        type="email"
        autoComplete="email"
        fullWidth
      />
      <FormikTextField
        name="phone"
        label={t('auth.register.phone')}
        autoComplete="tel"
        fullWidth
      />
      <FormikTextField
        name="password"
        label={t('auth.register.password')}
        type="password"
        autoComplete="new-password"
        fullWidth
        endAdornment={
          <TooltipProvider delayDuration={200}>
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  type="button"
                  className="flex shrink-0 items-center justify-center rounded-full p-1 bg-amber-100 text-amber-700 ring-1 ring-amber-200/60 transition-all hover:bg-amber-200 hover:ring-amber-300 dark:bg-amber-900/40 dark:text-amber-400 dark:ring-amber-700/60 dark:hover:bg-amber-800/50 dark:hover:ring-amber-600 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 dark:focus:ring-offset-background"
                  aria-label={t('auth.register.passwordHint')}
                >
                  <Info className="h-4 w-4" strokeWidth={2.5} />
                </button>
              </TooltipTrigger>
              <TooltipContent
                side="top"
                className="max-w-[240px] border border-slate-200 bg-white px-4 py-3 text-slate-800 shadow-lg dark:border-slate-300 dark:bg-white dark:text-slate-800"
              >
                <p className="mb-2 text-xs font-semibold">
                  {t('auth.register.passwordHintTitle')}
                </p>
                <ul className="list-inside list-disc space-y-1 text-xs text-slate-700 dark:text-slate-700">
                  <li>{t('auth.register.passwordHintMin')}</li>
                  <li>{t('auth.register.passwordHintUppercase')}</li>
                  <li>{t('auth.register.passwordHintLowercase')}</li>
                  <li>{t('auth.register.passwordHintDigit')}</li>
                  <li>{t('auth.register.passwordHintSpecial')}</li>
                </ul>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        }
      />
      <div className="flex flex-col gap-4 sm:flex-row">
        <FormikTextField
          name="firstName"
          label={t('auth.register.firstName')}
          fullWidth
        />
        <FormikTextField
          name="lastName"
          label={t('auth.register.lastName')}
          fullWidth
        />
      </div>

      {!isClient && (
        <>
          <div className="flex flex-col gap-4 sm:flex-row">
            <FormikSelect
              name="city"
              label={t('auth.register.city')}
              placeholder={t('auth.register.notSelected')}
              options={[
                { value: '', label: t('auth.register.notSelected') },
                ...cities.map((c) => ({ value: getCityValue(c), label: getCityLabel(c) })),
              ]}
              disabled={optionsLoading || cities.length === 0}
              fullWidth
            />
            <FormikSelect
              name="category"
              label={t('auth.register.category')}
              placeholder={t('auth.register.notSelected')}
              options={[
                { value: '', label: t('auth.register.notSelected') },
                ...categories.map((c) => ({ value: getCategoryValue(c), label: getCategoryLabel(c) })),
              ]}
              disabled={optionsLoading || categories.length === 0}
              fullWidth
            />
          </div>
          <FormikTextarea
            name="description"
            label={t('auth.register.description')}
            rows={4}
            className="w-full"
          />
        </>
      )}

      <Button
        type="submit"
        size="lg"
        disabled={isSubmitting}
        className="w-full py-6 text-base font-semibold rounded-lg shadow-lg transition-all hover:-translate-y-0.5 hover:shadow-xl bg-amber-600 text-white hover:bg-amber-700 dark:bg-amber-700 dark:text-white dark:hover:bg-amber-600"
      >
        {isSubmitting ? t('auth.register.creating') : t('auth.register.submit')}
      </Button>

      <div className="mt-6 flex flex-col items-center gap-3 border-t border-amber-200/40 dark:border-white/[0.08] pt-6">
        <p className="text-sm text-muted-foreground">
          {t('auth.register.haveAccount')}
        </p>
        <RouterLink
          to="/login"
          className="inline-flex items-center justify-center rounded-lg h-11 px-5 py-2 text-sm font-semibold shadow-lg transition-all hover:-translate-y-0.5 hover:shadow-xl bg-amber-600 text-white hover:bg-amber-700 dark:bg-amber-700 dark:text-white dark:hover:bg-amber-600"
        >
          {t('auth.login.title')}
        </RouterLink>
      </div>
    </div>
  );
}
