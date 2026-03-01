import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import * as yup from 'yup';
import { FormikHelpers } from 'formik';
import { useAuthLoginMutation } from '@/features/auth/authApi';

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

export interface LoginFormValues {
  email: string;
  password: string;
}

export function useLoginForm() {
  const { t } = useTranslation();
  const [login, loginState] = useAuthLoginMutation();

  const validationSchema = useMemo(
    () =>
      yup.object({
        email: yup
          .string()
          .email(t('auth.login.invalidEmail'))
          .required(t('auth.login.emailRequired')),
        password: yup
          .string()
          .min(6, t('auth.login.minPassword'))
          .required(t('auth.login.passwordRequired')),
      }),
    [t]
  );

  const initialValues = useMemo<LoginFormValues>(
    () => ({
      email: '',
      password: '',
    }),
    []
  );

  const handleSubmit = async (
    values: LoginFormValues,
    helpers: FormikHelpers<LoginFormValues>
  ) => {
    try {
      await login(values).unwrap();
      toast.success(t('auth.login.loggedIn'));
    } catch (e: unknown) {
      toast.error(toErrorMessage(e) ?? t('auth.login.loginFailed'));
    } finally {
      helpers.setSubmitting(false);
    }
  };

  return {
    initialValues,
    validationSchema,
    onSubmit: handleSubmit,
    isSubmitting: loginState.isLoading,
  };
}
