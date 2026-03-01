import { useEffect } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { Formik } from 'formik';
import * as yup from 'yup';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { useAuthRegisterMutation } from '@/features/auth/authApi';
import { useAppSelector } from '@/app/hooks';
import { selectIsAuthed } from '@/features/auth/selectors';
import { FormCard } from '@/components/ui/FormCard';
import { FormikTextField } from '@/components/ui/FormikTextField';
import { Button } from '@/components/ui/button';

export default function RegisterClientPage() {
  const { t } = useTranslation();
  const nav = useNavigate();
  const isAuthed = useAppSelector(selectIsAuthed);
  const role = useAppSelector((s) => s.auth.role);
  const restoring = useAppSelector((s) => s.auth.restoring);
  const [register, state] = useAuthRegisterMutation();

  const schema = yup.object({
    email: yup
      .string()
      .email(t('auth.login.invalidEmail'))
      .required(t('auth.login.emailRequired')),
    phone: yup.string().required(t('auth.register.phoneRequired')),
    password: yup
      .string()
      .min(6, t('auth.login.minPassword'))
      .required(t('auth.login.passwordRequired')),
    firstName: yup.string().optional(),
    lastName: yup.string().optional(),
  });

  useEffect(() => {
    if (role === 'ADMIN') nav('/admin', { replace: true });
    else if (role === 'MASTER') nav('/dashboard', { replace: true });
    else if (role === 'CLIENT') nav('/client-dashboard', { replace: true });
  }, [role, nav]);

  if (isAuthed) {
    if (role === 'ADMIN') return <Navigate to="/admin" replace />;
    if (role === 'MASTER') return <Navigate to="/dashboard" replace />;
    if (role === 'CLIENT') return <Navigate to="/client-dashboard" replace />;
    return <Navigate to="/" replace />;
  }

  if (restoring) {
    return (
      <FormCard
        title={t('auth.registerClient.title')}
        subtitle={t('auth.register.restoring')}
      >
        <div className="flex flex-col gap-4">
          <Button disabled>...</Button>
        </div>
      </FormCard>
    );
  }

  return (
    <FormCard
      title={t('auth.registerClient.title')}
      subtitle={t('auth.registerClient.subtitle')}
    >
      <Formik
        initialValues={{
          email: '',
          phone: '',
          password: '',
          firstName: '',
          lastName: '',
          role: 'CLIENT' as const,
        }}
        validationSchema={schema}
        onSubmit={async (values) => {
          try {
            await register(values as any).unwrap();
            toast.success(t('auth.register.accountCreated'));
            nav('/client-dashboard');
          } catch (e: any) {
            toast.error(
              e?.data?.message ||
                e?.message ||
                t('auth.register.registrationFailed')
            );
          }
        }}
      >
        {({ handleSubmit }) => (
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <FormikTextField
              name="email"
              label={t('auth.register.email')}
              autoComplete="email"
            />
            <FormikTextField
              name="phone"
              label={t('auth.register.phone')}
              autoComplete="tel"
            />
            <FormikTextField
              name="password"
              label={t('auth.register.password')}
              type="password"
              autoComplete="new-password"
            />
            <div className="flex flex-col gap-4 sm:flex-row">
              <FormikTextField
                name="firstName"
                label={t('auth.register.firstName')}
              />
              <FormikTextField
                name="lastName"
                label={t('auth.register.lastName')}
              />
            </div>
            <Button
              type="submit"
              size="lg"
              disabled={state.isLoading}
              className="w-full py-6 text-base font-semibold rounded-lg shadow-lg transition-all hover:-translate-y-0.5 hover:shadow-xl bg-amber-600 text-white hover:bg-amber-700 dark:bg-amber-700 dark:text-white dark:hover:bg-amber-600"
            >
              {state.isLoading
                ? t('common.loading')
                : t('auth.registerClient.title')}
            </Button>
          </form>
        )}
      </Formik>
    </FormCard>
  );
}
