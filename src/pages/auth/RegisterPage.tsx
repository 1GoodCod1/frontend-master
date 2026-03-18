import { useState, useEffect } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useAppSelector } from '@/app/hooks';
import { selectIsAuthed } from '@/features/auth/selectors';
import { Formik } from 'formik';
import { AuthLayout } from '@/features/auth/components/AuthLayout';
import RegisterHeader from '@/features/auth/components/register/RegisterHeader';
import RoleTabs from '@/features/auth/components/register/RoleTabs';
import RegisterForm from '@/features/auth/components/register/RegisterForm';
import PremiumAfterVerificationBanner from '@/features/auth/components/register/PremiumAfterVerificationBanner';
import { useRegistrationForm, type RegisterRole, type RegisterFormValues } from '@/hooks/auth/register';

export default function RegisterPage() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();

  const isAuthed = useAppSelector(selectIsAuthed);
  const role = useAppSelector((s) => s.auth.role);
  const restoring = useAppSelector((s) => s.auth.restoring);

  const [selectedRole, setSelectedRole] = useState<RegisterRole>('CLIENT');

  const form = useRegistrationForm(selectedRole);

  useEffect(() => {
    if (!isAuthed || !role) return;
    if (role === 'ADMIN') navigate('/admin', { replace: true });
    else if (role === 'MASTER') navigate('/dashboard', { replace: true });
    else if (role === 'CLIENT') navigate('/client-dashboard', { replace: true });
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

  const isClient = selectedRole === 'CLIENT';

  return (
    <AuthLayout view="register">
      <div className="flex flex-1 flex-col overflow-y-auto">
        <div className="mx-auto w-full max-w-[420px] px-6 py-10 md:max-w-[440px] md:px-11 md:py-11">
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="flex flex-col gap-4"
          >
            <RegisterHeader />
            <RoleTabs
              value={selectedRole === 'CLIENT' ? 0 : 1}
              onChange={setSelectedRole}
            />
            {!isClient && (
              <PremiumAfterVerificationBanner />
            )}
            <AnimatePresence mode="wait">
              <Formik<RegisterFormValues>
                key={`${selectedRole}-${i18n.language}`}
                initialValues={form.initialValues}
                validationSchema={form.validationSchema}
                onSubmit={form.onSubmit}
                enableReinitialize
              >
                {({ handleSubmit }) => (
                  <motion.form
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
                    onSubmit={(e) => {
                      e.preventDefault();
                      handleSubmit(e);
                    }}
                    method="post"
                    noValidate
                    className="flex flex-col gap-3.5"
                  >
                    <RegisterForm
                      isClient={isClient}
                      isSubmitting={form.isSubmitting}
                      optionsLoading={form.optionsLoading}
                      cities={form.cities}
                      categories={form.categories}
                      referralInfo={form.referralInfo}
                    />
                  </motion.form>
                )}
              </Formik>
            </AnimatePresence>
          </motion.div>
        </div>
      </div>
    </AuthLayout>
  );
}
