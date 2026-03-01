import { useEffect } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Formik } from 'formik';
import { useTranslation } from 'react-i18next';
import { useAppSelector } from '@/app/hooks';
import { selectIsAuthed } from '@/features/auth/selectors';
import LoginHeader from '@/components/auth/login/LoginHeader';
import LoginForm from '@/components/auth/login/LoginForm';
import { useLoginForm, type LoginFormValues } from '@/hooks/auth/login/useLoginForm';
import { Card, CardContent } from '@/components/ui/card';
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
      <div className="min-h-screen bg-background py-8 md:py-12">
        <div className="container max-w-md mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="border-border shadow-sm">
              <CardContent className="p-6">
                <h2 className="text-xl font-semibold text-foreground mb-1">
                  {t('auth.login.title')}
                </h2>
                <p className="text-sm text-muted-foreground mb-4">
                  {t('auth.login.restoring')}
                </p>
                <Button disabled className="w-full" size="lg">
                  ...
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-8 md:py-12">
      <div className="container max-w-md mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <Card className="border-border dark:border-white/[0.08] shadow-sm overflow-hidden">
            <CardContent className="p-6 md:p-8">
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
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
