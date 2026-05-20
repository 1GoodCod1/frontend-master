import { useState, useEffect } from 'react';
import { Navigate, useNavigate, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAppSelector } from '@/app/hooks';
import { selectIsAuthed } from '@/features/auth/selectors';
import { Formik } from 'formik';
import { AuthLayout } from '@/features/auth/components/AuthLayout';
import RegisterHeader from '@/features/auth/components/register/RegisterHeader';
import RoleTabs from '@/features/auth/components/register/RoleTabs';
import RegisterForm from '@/features/auth/components/register/RegisterForm';
import PlusProAfterVerificationBanner from '@/features/auth/components/register/PlusProAfterVerificationBanner';
import { useRegistrationForm, type RegisterRole, type RegisterFormValues } from '@/hooks/auth/register';
import { USER_ROLE } from '@/constants/roles';

export default function RegisterPage() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();

  const isAuthed = useAppSelector(selectIsAuthed);
  const role = useAppSelector((s) => s.auth.role);
  const restoring = useAppSelector((s) => s.auth.restoring);

  const [searchParams] = useSearchParams();

  const roleFromQuery = searchParams.get('role')?.toUpperCase();
  const roleFromQueryParam: RegisterRole | null =
    roleFromQuery === 'MASTER'
      ? USER_ROLE.MASTER
      : roleFromQuery === 'CLIENT'
        ? USER_ROLE.CLIENT
        : null;

  const [selectedRole, setSelectedRole] = useState<RegisterRole>(
    () => roleFromQueryParam ?? USER_ROLE.CLIENT,
  );
  const [prevRoleFromQuery, setPrevRoleFromQuery] = useState(roleFromQuery);

  if (roleFromQuery !== prevRoleFromQuery) {
    setPrevRoleFromQuery(roleFromQuery);
    if (roleFromQueryParam) {
      setSelectedRole(roleFromQueryParam);
    }
  }

  const form = useRegistrationForm(selectedRole);

  useEffect(() => {
    if (!isAuthed || !role) return;
    if (role === USER_ROLE.ADMIN) navigate('/admin', { replace: true });
    else if (role === USER_ROLE.MASTER) navigate('/dashboard', { replace: true });
    else if (role === USER_ROLE.CLIENT)
      navigate('/client-dashboard', { replace: true });
  }, [isAuthed, role, navigate]);

  if (restoring) {
    return (
      <AuthLayout view="register">
        <div className="flex flex-1 flex-col justify-center px-8 py-12 md:px-11">
          <p className="mx-auto max-w-[360px] text-muted-foreground">{t('auth.register.restoring')}</p>
        </div>
      </AuthLayout>
    );
  }

  if (isAuthed) return <Navigate to="/" replace />;

  const isClient = selectedRole === USER_ROLE.CLIENT;

  return (
    <AuthLayout view="register">
      <div className="flex flex-1 flex-col overflow-y-auto">
        <div className="mx-auto w-full max-w-[420px] px-6 py-10 md:max-w-[440px] md:px-11 md:py-11">
          <div className="faber-page-enter flex flex-col gap-4">
            <RegisterHeader />
            <RoleTabs
              value={selectedRole === USER_ROLE.CLIENT ? 0 : 1}
              onChange={setSelectedRole}
            />
            {!isClient && (
              <PlusProAfterVerificationBanner />
            )}
            <Formik<RegisterFormValues>
              key={`${selectedRole}-${i18n.language}`}
              initialValues={form.initialValues}
              validationSchema={form.validationSchema}
              onSubmit={form.onSubmit}
              enableReinitialize
              validateOnChange={false}
              validateOnBlur={false}
            >
              <RegisterForm
                isClient={isClient}
                isSubmitting={form.isSubmitting}
                optionsLoading={form.optionsLoading}
                cities={form.cities}
                categories={form.categories}
                referralInfo={form.referralInfo}
                totalSteps={form.totalSteps}
                validateRegistrationStep={form.validateRegistrationStep}
              />
            </Formik>
          </div>
        </div>
      </div>
    </AuthLayout>
  );
}
