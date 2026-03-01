import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import * as yup from 'yup';
import { FormikHelpers } from 'formik';
import { useResetPasswordMutation } from '@/features/auth/authApi';

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

export interface ResetPasswordFormValues {
  password: string;
  confirmPassword: string;
}

export function useResetPasswordForm(token: string) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [resetPassword, resetPasswordState] = useResetPasswordMutation();

  const validationSchema = useMemo(
    () =>
      yup.object({
        password: yup
          .string()
          .min(6, t('auth.login.minPassword'))
          .required(t('auth.login.passwordRequired')),
        confirmPassword: yup
          .string()
          .oneOf(
            [yup.ref('password')],
            t('auth.resetPassword.passwordsMustMatch')
          )
          .required(t('auth.resetPassword.confirmPasswordRequired')),
      }),
    [t]
  );

  const initialValues = useMemo<ResetPasswordFormValues>(
    () => ({
      password: '',
      confirmPassword: '',
    }),
    []
  );

  const handleSubmit = async (
    values: ResetPasswordFormValues,
    helpers: FormikHelpers<ResetPasswordFormValues>
  ) => {
    try {
      await resetPassword({ token, password: values.password }).unwrap();
      toast.success(t('auth.resetPassword.success'));
      navigate('/login');
    } catch (e: unknown) {
      toast.error(
        toErrorMessage(e) ||
          t('auth.resetPassword.error')
      );
    } finally {
      helpers.setSubmitting(false);
    }
  };

  return {
    initialValues,
    validationSchema,
    onSubmit: handleSubmit,
    isSubmitting: resetPasswordState.isLoading,
  };
}
