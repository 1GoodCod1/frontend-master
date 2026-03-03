import { useEffect } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Formik } from 'formik';
import { useTranslation } from 'react-i18next';
import { useAppSelector } from '@/app/hooks';
import { selectIsAuthed } from '@/features/auth/selectors';
import { AuthLayout } from '@/components/auth/AuthLayout';
import LoginHeader from '@/components/auth/login/LoginHeader';
import LoginForm from '@/components/auth/login/LoginForm';
import { useLoginForm, type LoginFormValues } from '@/hooks/auth/login/useLoginForm';
import { Button } from '@/components/ui/button';

export default function LoginPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const isAuthed = useAppSelector(selectIsAuthed);
  const role = useAppSelector((s) => s.auth.role);
  const restoring = useAppSelector((s) => s.auth.restoring);

  const form = useLoginForm();

  useEffect(() => {
    if (!isAuthed || !role) return;
    if (role === 'ADMIN') navigate('/admin', { replace: true });
    else if (role === 'MASTER') navigate('/dashboard', { replace: true });
    else if (role === 'CLIENT') navigate('/client-dashboard', { replace: true });
  }, [isAuthed, role, navigate]);

  if (isAuthed && role) {
    if (role === 'ADMIN') return <Navigate to="/admin" replace />;
    if (role === 'MASTER') return <Navigate to="/dashboard" replace />;
    if (role === 'CLIENT') return <Navigate to="/client-dashboard" replace />;
  }

  if (restoring) {
    return (
      <AuthLayout view="login">
        <div className="flex flex-1 flex-col justify-center px-8 py-12 md:px-11 md:py-12">
          <div className="mx-auto w-full max-w-[360px]">
            <h2 className="mb-1 text-xl font-semibold text-foreground">
              {t('auth.login.title')}
            </h2>
            <p className="mb-4 text-sm text-muted-foreground">
              {t('auth.login.restoring')}
            </p>
            <Button disabled className="auth-primary-btn w-full py-3.5">
              ...
            </Button>
          </div>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout view="login">
      <div className="flex flex-1 flex-col justify-center px-6 py-10 md:px-11 md:py-12">
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mx-auto w-full max-w-[360px]"
        >
          <LoginHeader />
          <Formik<LoginFormValues>
            initialValues={form.initialValues}
            validationSchema={form.validationSchema}
            onSubmit={form.onSubmit}
            enableReinitialize
          >
            {({ handleSubmit }) => (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSubmit(e);
                }}
                method="post"
                noValidate
              >
                <LoginForm isSubmitting={form.isSubmitting} />
              </form>
            )}
          </Formik>
        </motion.div>
      </div>
    </AuthLayout>
  );
}
