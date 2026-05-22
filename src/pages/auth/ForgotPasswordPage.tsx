import { Formik } from 'formik';
import { AuthLayout } from '@/features/auth/components/AuthLayout';
import ForgotPasswordHeader from '@/features/auth/components/forgot-password/ForgotPasswordHeader';
import ForgotPasswordForm from '@/features/auth/components/forgot-password/ForgotPasswordForm';
import { useForgotPasswordForm, type ForgotPasswordFormValues } from '@/hooks/auth/forgot-password';

export default function ForgotPasswordPage() {
  const form = useForgotPasswordForm();

  return (
    <AuthLayout view="forgot">
      <div className="faber-page-enter">
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
      </div>
    </AuthLayout>
  );
}
