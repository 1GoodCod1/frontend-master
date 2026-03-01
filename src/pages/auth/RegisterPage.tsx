import { useState, useEffect } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useAppSelector } from '@/app/hooks';
import { selectIsAuthed } from '@/features/auth/selectors';
import { Formik } from 'formik';
import RegisterHeader from '../../components/auth/register/RegisterHeader';
import RoleTabs from '../../components/auth/register/RoleTabs';
import RegisterForm from '../../components/auth/register/RegisterForm';
import PremiumAfterVerificationBanner from '../../components/auth/register/PremiumAfterVerificationBanner';
import { useRegistrationForm, type RegisterRole, type RegisterFormValues } from '../../hooks/auth/register/useRegistrationForm';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

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
      <div className="min-h-screen bg-background py-12 md:py-16">
        <div className="container max-w-md mx-auto px-4">
          <Card className="border-amber-200/50 dark:border-white/[0.08] shadow-xl shadow-amber-900/5">
            <CardContent className="p-8">
              <p className="text-muted-foreground">{t('auth.register.restoring')}</p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (isAuthed) return <Navigate to="/" replace />;

  const isClient = selectedRole === 'CLIENT';

  return (
    <div className="min-h-screen bg-background py-8 md:py-12">
      <div className={cn('container mx-auto px-4', isClient ? 'max-w-md' : 'max-w-4xl')}>
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className={cn(
            'flex flex-col gap-6',
            !isClient && 'lg:flex-row lg:items-start lg:gap-8'
          )}
        >
          <Card className={cn('border border-amber-200/50 dark:border-white/[0.08] shadow-xl shadow-amber-900/5 overflow-hidden', !isClient && 'flex-1 min-w-0')}>
            <CardContent className="p-6 md:p-8">
              <RegisterHeader />

              <RoleTabs
                value={selectedRole === 'CLIENT' ? 0 : 1}
                onChange={setSelectedRole}
              />

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
                    >
                      <RegisterForm
                        isClient={isClient}
                        isSubmitting={form.isSubmitting}
                        optionsLoading={form.optionsLoading}
                        cities={form.cities}
                        categories={form.categories}
                      />
                    </motion.form>
                  )}
                </Formik>
              </AnimatePresence>
            </CardContent>
          </Card>

          {!isClient && (
            <aside className="lg:w-80 shrink-0 space-y-6">
              <PremiumAfterVerificationBanner />
            </aside>
          )}
        </motion.div>
      </div>
    </div>
  );
}
