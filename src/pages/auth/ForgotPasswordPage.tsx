import { motion } from 'framer-motion';
import { Formik } from 'formik';
import ForgotPasswordHeader from '@/components/auth/forgot-password/ForgotPasswordHeader';
import ForgotPasswordForm from '@/components/auth/forgot-password/ForgotPasswordForm';
import { useForgotPasswordForm, type ForgotPasswordFormValues } from '@/hooks/auth/forgot-password/useForgotPasswordForm';
import { Card, CardContent } from '@/components/ui/card';

export default function ForgotPasswordPage() {
  const form = useForgotPasswordForm();

  return (
    <div className="min-h-screen bg-background py-8 md:py-12">
      <div className="container max-w-md mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <Card className="border-border dark:border-border shadow-sm overflow-hidden">
            <CardContent className="p-6 md:p-8">
              <ForgotPasswordHeader />

              <Formik<ForgotPasswordFormValues>
                initialValues={form.initialValues}
                validationSchema={form.validationSchema}
                onSubmit={form.onSubmit}
                enableReinitialize
              >
                {({ handleSubmit }) => (
                  <form onSubmit={handleSubmit}>
                    <ForgotPasswordForm isSubmitting={form.isSubmitting} />
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
