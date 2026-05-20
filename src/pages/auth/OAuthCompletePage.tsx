import { useMemo, useState, useCallback } from 'react';
import { useSearchParams, Navigate, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Formik, Form } from 'formik';
import * as yup from 'yup';
import toast from 'react-hot-toast';
import { Phone, MapPin, Tag, FileText, ArrowRight } from 'lucide-react';
import { AuthLayout } from '@/features/auth/components/AuthLayout';
import { AuthFormField } from '@/features/auth/components/AuthFormField';
import { AuthFormSelect } from '@/features/auth/components/AuthFormSelect';
import { AuthFormTextarea } from '@/features/auth/components/AuthFormTextarea';
import PlusProAfterVerificationBanner from '@/features/auth/components/register/PlusProAfterVerificationBanner';
import RoleTabs from '@/features/auth/components/register/RoleTabs';
import {
  useCompleteOAuthMutation,
  useAuthRegistrationOptionsQuery,
} from '@/features/auth/authApi';
import { useAppSelector } from '@/app/hooks';
import { selectIsAuthed, selectRole } from '@/features/auth/selectors';
import { isRecord } from '@/utils/guards';
import { unwrapEnvelope } from '@/utils/data';
import { cn } from '@/lib/utils';
import { USER_ROLE } from '@/constants/roles';

interface OAuthCompleteFormValues {
  phone: string;
  city: string;
  category: string;
  description: string;
}

const OAUTH_ROLE_STORAGE_KEY = 'faber:oauthComplete:roleChoice';
const OAUTH_ROLE_TTL_MS = 15 * 60 * 1000;

function readStoredRoleChoice(): 'CLIENT' | 'MASTER' | null {
  try {
    const raw = sessionStorage.getItem(OAUTH_ROLE_STORAGE_KEY);
    if (!raw) return null;
    const parsed: unknown = JSON.parse(raw);
    if (!isRecord(parsed)) return null;
    const savedAt = parsed.savedAt;
    const r = parsed.role;
    if (typeof savedAt !== 'number' || Date.now() - savedAt > OAUTH_ROLE_TTL_MS) {
      sessionStorage.removeItem(OAUTH_ROLE_STORAGE_KEY);
      return null;
    }
    if (r === USER_ROLE.CLIENT || r === USER_ROLE.MASTER) return r;
    return null;
  } catch {
    return null;
  }
}

function writeStoredRoleChoice(role: 'CLIENT' | 'MASTER'): void {
  try {
    sessionStorage.setItem(
      OAUTH_ROLE_STORAGE_KEY,
      JSON.stringify({ role, savedAt: Date.now() }),
    );
  } catch {
    /* ignore */
  }
}

function clearStoredRoleChoice(): void {
  try {
    sessionStorage.removeItem(OAUTH_ROLE_STORAGE_KEY);
  } catch {
    /* ignore */
  }
}

export default function OAuthCompletePage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const isAuthed = useAppSelector(selectIsAuthed);
  const role = useAppSelector(selectRole);

  const roleParam = params.get('role');
  const routeRole =
    roleParam === 'CLIENT' || roleParam === 'MASTER' ? roleParam : null;
  const [pickedRole, setPickedRole] = useState<'CLIENT' | 'MASTER'>(() => {
    const stored = readStoredRoleChoice();
    return stored ?? USER_ROLE.CLIENT;
  });
  const effectiveRole = routeRole ?? pickedRole;
  const isMaster = effectiveRole === 'MASTER';
  const showRolePicker = routeRole === null;

  const persistPickedRole = useCallback(
    (r: 'CLIENT' | 'MASTER') => {
      setPickedRole(r);
      if (routeRole === null) {
        writeStoredRoleChoice(r);
      }
    },
    [routeRole],
  );

  const [completeOAuth, { isLoading }] = useCompleteOAuthMutation();
  const { data: optionsData, isLoading: optionsLoading } =
    useAuthRegistrationOptionsQuery(undefined, { skip: !isMaster });

  const cities = useMemo(() => {
    const u = unwrapEnvelope(optionsData);
    return isRecord(u) && Array.isArray(u.cities)
      ? (u.cities as { name: string; slug: string }[])
      : [];
  }, [optionsData]);

  const categories = useMemo(() => {
    const u = unwrapEnvelope(optionsData);
    return isRecord(u) && Array.isArray(u.categories)
      ? (u.categories as { name: string; slug: string }[])
      : [];
  }, [optionsData]);

  const cityOptions = useMemo(
    () =>
      cities.map((c) => {
        const slug = c.slug ?? '';
        const label = slug
          ? t(`cities.${slug}`, { defaultValue: c.name }) || c.name
          : c.name;
        return { value: slug, label };
      }),
    [cities, t],
  );

  const categoryOptions = useMemo(
    () =>
      categories.map((c) => {
        const slug = c.slug ?? '';
        const label = slug
          ? t(`categories.${slug}`, { defaultValue: c.name }) || c.name
          : c.name;
        return { value: slug, label };
      }),
    [categories, t],
  );

  const validationSchema = useMemo(() => {
    const phoneField = yup
      .string()
      .required(t('auth.register.phoneRequired'))
      .matches(/^\+373\d{8}$/, t('auth.oauthComplete.phoneError'));

    if (!isMaster) {
      return yup.object({
        phone: phoneField,
        city: yup.string(),
        category: yup.string(),
        description: yup.string(),
      });
    }

    return yup.object({
      phone: phoneField,
      city: yup.string().required(t('auth.oauthComplete.cityRequired')),
      category: yup.string().required(t('auth.oauthComplete.categoryRequired')),
      description: yup.string(),
    });
  }, [isMaster, t]);

  const initialValues: OAuthCompleteFormValues = {
    phone: '',
    city: '',
    category: '',
    description: '',
  };

  if (isAuthed && role) {
    if (role === 'MASTER') return <Navigate to="/dashboard" replace />;
    if (role === 'ADMIN') return <Navigate to="/admin" replace />;
    return <Navigate to="/client-dashboard" replace />;
  }

  return (
    <AuthLayout view="register">
      <div className="flex flex-1 flex-col overflow-y-auto">
        <div className="mx-auto w-full max-w-[420px] px-6 py-10 md:max-w-[440px] md:px-11 md:py-11">
          <div className="faber-page-enter flex flex-col gap-4">
            {showRolePicker && (
              <div className="flex flex-col gap-2">
                <RoleTabs
                  className="mb-1"
                  value={pickedRole === USER_ROLE.CLIENT ? 0 : 1}
                  onChange={persistPickedRole}
                />
              </div>
            )}
            <div className="mb-3">
              <p className="auth-section-label">{t('auth.register.sectionLabel')}</p>
              <h1 className="auth-heading">
                {isMaster
                  ? t('auth.oauthComplete.masterTitle')
                  : t('auth.oauthComplete.clientTitle')}
              </h1>
              <p className="auth-subheading !mb-0">
                {isMaster
                  ? t('auth.oauthComplete.masterSub')
                  : t('auth.oauthComplete.clientSub')}
              </p>
            </div>

            {isMaster && <PlusProAfterVerificationBanner />}

            <Formik<OAuthCompleteFormValues>
              initialValues={initialValues}
              validationSchema={validationSchema}
              validateOnChange={false}
              validateOnBlur={false}
              onSubmit={async (values) => {
                try {
                  await completeOAuth({
                    phone: values.phone,
                    ...(showRolePicker ? { role: pickedRole } : {}),
                    ...(isMaster && {
                      city: values.city,
                      category: values.category,
                      description: values.description || undefined,
                    }),
                  }).unwrap();
                  clearStoredRoleChoice();
                  navigate(
                    effectiveRole === 'MASTER' ? '/dashboard' : '/client-dashboard',
                    { replace: true },
                  );
                } catch (err: unknown) {
                  const msg =
                    isRecord(err) &&
                    isRecord(err.data) &&
                    typeof err.data.message === 'string'
                      ? err.data.message
                      : t('auth.oauthComplete.errorGeneric');
                  toast.error(msg);
                }
              }}
            >
              {({ isSubmitting }) => (
                <Form method="post" noValidate className="flex flex-col gap-3.5">
                  <AuthFormField
                    name="phone"
                    label={t('auth.register.phone')}
                    type="tel"
                    placeholder="+373 (__) ___-__"
                    autoComplete="tel"
                    icon={<Phone size={15} />}
                  />

                  {isMaster && (
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

                  <div className="flex flex-col gap-2.5 pt-0.5">
                    <button
                      type="submit"
                      disabled={isSubmitting || isLoading}
                      className={cn('auth-primary-btn w-full')}
                    >
                      {isSubmitting || isLoading
                        ? t('auth.register.creating')
                        : t('auth.oauthComplete.submit')}
                      {!(isSubmitting || isLoading) && <ArrowRight size={15} />}
                    </button>
                  </div>
                </Form>
              )}
            </Formik>
          </div>
        </div>
      </div>
    </AuthLayout>
  );
}
