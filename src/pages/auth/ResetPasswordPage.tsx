import { useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Formik } from 'formik';
import ResetPasswordHeader from '@/components/auth/reset-password/ResetPasswordHeader';
import ResetPasswordForm from '@/components/auth/reset-password/ResetPasswordForm';
import InvalidTokenView from '@/components/auth/reset-password/InvalidTokenView';
import { useResetPasswordForm, type ResetPasswordFormValues } from '@/hooks/auth/reset-password/useResetPasswordForm';
import { Card, CardContent } from '@/components/ui/card';

export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');

  const form = useResetPasswordForm(token || '');

  if (!token) {
    return (
      <div className="min-h-screen bg-background py-8 md:py-12">
        <div className="container max-w-md mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
          >
            <Card className="border-border dark:border-white/[0.08]">
              <CardContent className="p-6 md:p-8">
                <InvalidTokenView />
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
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
        >
          <Card className="border-border">
            <CardContent className="p-6 md:p-8">
              <ResetPasswordHeader />

              <Formik<ResetPasswordFormValues>
                initialValues={form.initialValues}
                validationSchema={form.validationSchema}
                onSubmit={form.onSubmit}
                enableReinitialize
              >
                {({ handleSubmit }) => (
                  <form onSubmit={handleSubmit}>
                    <ResetPasswordForm isSubmitting={form.isSubmitting} />
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
