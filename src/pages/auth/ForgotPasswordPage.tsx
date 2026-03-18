import { motion } from 'framer-motion';
import { Formik } from 'formik';
import { AuthLayout } from '@/features/auth/components/AuthLayout';
import ForgotPasswordHeader from '@/features/auth/components/forgot-password/ForgotPasswordHeader';
import ForgotPasswordForm from '@/features/auth/components/forgot-password/ForgotPasswordForm';
import { useForgotPasswordForm, type ForgotPasswordFormValues } from '@/hooks/auth/forgot-password';

export default function ForgotPasswordPage() {
  const form = useForgotPasswordForm();

  return (
    <AuthLayout view="forgot">
      <div className="flex flex-1 flex-col justify-center px-6 py-10 md:px-11 md:py-12">
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mx-auto w-full max-w-[360px]"
        >
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
        </motion.div>
      </div>
    </AuthLayout>
  );
}
