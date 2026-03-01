import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import * as yup from 'yup';
import { FormikHelpers } from 'formik';

import { useAuthRegisterMutation, useAuthRegistrationOptionsQuery } from '@/features/auth/authApi';

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

function unwrapEnvelope(raw: unknown): unknown {
  return isRecord(raw) && 'data' in raw ? (raw as { data: unknown }).data : raw;
}

export type RegisterRole = 'CLIENT' | 'MASTER';

export interface RegisterFormValues {
  email: string;
  phone: string;
  password: string;
  role: RegisterRole;
  firstName?: string;
  lastName?: string;
  city?: string;
  category?: string;
  description?: string;
}

export function useRegistrationForm(selectedRole: RegisterRole) {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [register, registerState] = useAuthRegisterMutation();
  const { data: optionsData, isLoading: optionsLoading } = useAuthRegistrationOptionsQuery();

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
      await register(values).unwrap();
      toast.success(t('Account created successfully'));

      if (values.role === 'CLIENT') {
        navigate('/client-dashboard', { replace: true });
      } else {
        navigate('/dashboard', { replace: true });
      }
    } catch (err: unknown) {
      toast.error(toErrorMessage(err) ?? t('Registration failed'));
    } finally {
      helpers.setSubmitting(false);
    }
  };

  return {
    initialValues,
    validationSchema,
    onSubmit: handleSubmit,
    isSubmitting: registerState.isLoading,
    optionsLoading,
    cities,
    categories,
  };
}