import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import * as yup from 'yup';
import { FormikHelpers } from 'formik';
import { useForgotPasswordMutation } from '@/features/auth/authApi';

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null;
}

function toErrorMessage(e: unknown): string | undefined {
  if (!isRecord(e)) return undefined;
  const data = isRecord(e.data) ? e.data : undefined;
  return (
    (typeof data?.message === 'string' ? data.message : undefined) ??
    (typeof e.message === 'string' ? e.message : undefined)
  );
}

export interface ForgotPasswordFormValues {
  email: string;
}

export function useForgotPasswordForm() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [forgotPassword, forgotPasswordState] = useForgotPasswordMutation();

  const validationSchema = useMemo(
    () =>
      yup.object({
        email: yup
          .string()
          .email(t('auth.login.invalidEmail'))
          .required(t('auth.login.emailRequired')),
      }),
    [t]
  );

  const initialValues = useMemo<ForgotPasswordFormValues>(
    () => ({
      email: '',
    }),
    []
  );

  const handleSubmit = async (
    values: ForgotPasswordFormValues,
    helpers: FormikHelpers<ForgotPasswordFormValues>
  ) => {
    try {
      await forgotPassword(values).unwrap();
      toast.success(t('auth.forgotPassword.success'));
      navigate('/login');
    } catch (e: unknown) {
      toast.error(
        toErrorMessage(e) ||
          t('auth.forgotPassword.error')
      );
    } finally {
      helpers.setSubmitting(false);
    }
  };

  return {
    initialValues,
    validationSchema,
    onSubmit: handleSubmit,
    isSubmitting: forgotPasswordState.isLoading,
  };
}
