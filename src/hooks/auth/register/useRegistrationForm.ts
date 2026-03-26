import { useCallback, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import * as yup from 'yup';
import { FormikHelpers } from 'formik';
import { useAuthRegisterMutation, useAuthRegistrationOptionsQuery } from '@/features/auth/authApi';
import { useReferralsValidateCodeQuery, useConfigReferralsEnabledQuery } from '@/features/referrals/referralsApi';
import { isRecord } from '@/utils/guards';
import { unwrapEnvelope } from '@/utils/data';
import { toErrorMessage } from '@/utils/errors';
import type { RegisterFormValues, RegisterRole } from '.';

function yupErrorsToRecord(err: yup.ValidationError): Record<string, string> {
  const out: Record<string, string> = {};
  if (err.inner.length) {
    err.inner.forEach((e) => {
      if (e.path) out[e.path] = e.message;
    });
  } else if (err.path) {
    out[err.path] = err.message;
  }
  return out;
}

export function useRegistrationForm(selectedRole: RegisterRole) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirectTo = searchParams.get('redirect');
  const refCode = searchParams.get('ref') || undefined;

  const [register, registerState] = useAuthRegisterMutation();
  const { data: optionsData, isLoading: optionsLoading } = useAuthRegistrationOptionsQuery();
  const { data: referralsConfig } = useConfigReferralsEnabledQuery();
  const referralsEnabled = referralsConfig?.enabled ?? false;
  const effectiveRefCode = referralsEnabled ? refCode : undefined;
  const { data: validateData } = useReferralsValidateCodeQuery(effectiveRefCode ?? '', {
    skip: !effectiveRefCode,
  });

  const cities = useMemo(
    () => {
      const u = unwrapEnvelope(optionsData);
      return isRecord(u) && Array.isArray(u.cities) ? u.cities : [];
    },
    [optionsData]
  );

  const categories = useMemo(
    () => {
      const u = unwrapEnvelope(optionsData);
      return isRecord(u) && Array.isArray(u.categories) ? u.categories : [];
    },
    [optionsData]
  );

  const isClient = selectedRole === 'CLIENT';

  const stepSchemas = useMemo(() => {
    const emailPassword = yup.object({
      email: yup.string().email(t('Invalid email')).required(t('Email is required')),
      password: yup
        .string()
        .required(t('Password is required'))
        .min(10, t('auth.register.passwordMinLength'))
        .matches(
          /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&#]{10,}$/,
          t('auth.register.passwordFormat')
        ),
    });
    const phoneName = yup.object({
      phone: yup.string().required(t('Phone is required')),
      firstName: yup.string().optional(),
      lastName: yup.string().optional(),
    });
    const masterProfile = yup.object({
      city: yup.string().optional(),
      category: yup.string().optional(),
      description: yup.string().optional(),
    });
    return { emailPassword, phoneName, masterProfile };
  }, [t]);

  const validationSchema = useMemo(
    () =>
      yup.object({
        email: yup.string().email(t('Invalid email')).required(t('Email is required')),
        phone: yup.string().required(t('Phone is required')),
        password: yup
          .string()
          .required(t('Password is required'))
          .min(10, t('auth.register.passwordMinLength'))
          .matches(
            /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&#]{10,}$/,
            t('auth.register.passwordFormat')
          ),
        role: yup.mixed<RegisterRole>().oneOf(['CLIENT', 'MASTER'] as const).required(),
        firstName: yup.string().optional(),
        lastName: yup.string().optional(),
        ...(isClient
          ? {}
          : {
            city: yup.string().optional(),
            category: yup.string().optional(),
            description: yup.string().optional(),
          }),
      }),
    [t, isClient]
  );

  const totalSteps = isClient ? 2 : 3;

  const validateRegistrationStep = useCallback(
    async (step: number, values: RegisterFormValues): Promise<Record<string, string>> => {
      try {
        if (step === 0) {
          await stepSchemas.emailPassword.validate(values, { abortEarly: false });
        } else if (step === 1) {
          await stepSchemas.phoneName.validate(values, { abortEarly: false });
        } else if (step === 2 && !isClient) {
          await stepSchemas.masterProfile.validate(values, { abortEarly: false });
        }
        return {};
      } catch (e) {
        if (e instanceof yup.ValidationError) {
          return yupErrorsToRecord(e);
        }
        return {};
      }
    },
    [isClient, stepSchemas]
  );

  const initialValues = useMemo<RegisterFormValues>(
    () => ({
      email: '',
      phone: '',
      password: '',
      role: selectedRole,
      firstName: '',
      lastName: '',
      ...(isClient ? {} : { city: '', category: '', description: '' }),
    }),
    [selectedRole, isClient]
  );

  const handleSubmit = async (values: RegisterFormValues, helpers: FormikHelpers<RegisterFormValues>) => {
    try {
      await register({ ...values, referralCode: effectiveRefCode }).unwrap();
      toast.success(t('Account created successfully'));

      if (values.role === 'CLIENT') {
        navigate(redirectTo && redirectTo.startsWith('/') ? redirectTo : '/client-dashboard', { replace: true });
      } else {
        navigate('/dashboard', { replace: true });
      }
    } catch (err: unknown) {
      toast.error(toErrorMessage(err) ?? t('Registration failed'));
    } finally {
      helpers.setSubmitting(false);
    }
  };

  const referralInfo =
    effectiveRefCode && validateData?.valid
      ? { code: effectiveRefCode, referrerName: validateData.referrerName }
      : undefined;

  return {
    initialValues,
    validationSchema,
    onSubmit: handleSubmit,
    isSubmitting: registerState.isLoading,
    optionsLoading,
    cities,
    categories,
    referralInfo,
    totalSteps,
    validateRegistrationStep,
  };
}
