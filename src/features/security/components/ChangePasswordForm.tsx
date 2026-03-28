import { useState, useRef, useEffect } from 'react';
import { Formik } from 'formik';
import * as Yup from 'yup';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { Eye, EyeOff, Lock } from 'lucide-react';
import { useChangePasswordMutation } from '@/features/security/securityApi';
import { FormikTextField } from '@/components/ui/FormikTextField';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';

export const ChangePasswordForm: React.FC = () => {
  const { t } = useTranslation();
  const [changePassword, { isLoading }] = useChangePasswordMutation();

  const schema = Yup.object({
    currentPassword: Yup.string()
      .required(t('security.currentPasswordRequired')),
    newPassword: Yup.string()
      .min(6, t('security.passwordMinLength'))
      .required(t('security.newPasswordRequired')),
    confirmPassword: Yup.string()
      .oneOf([Yup.ref('newPassword')], t('security.passwordsMustMatch'))
      .required(t('security.confirmPasswordRequired')),
  });
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [success, setSuccess] = useState(false);
  const successTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (successTimeoutRef.current) clearTimeout(successTimeoutRef.current);
    };
  }, []);

  return (
    <Formik
      initialValues={{
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      }}
      validationSchema={schema}
      onSubmit={async (values, { resetForm, setSubmitting }) => {
        try {
          await changePassword({
            currentPassword: values.currentPassword,
            newPassword: values.newPassword,
          }).unwrap();
          
          toast.success(t('security.passwordChanged'));
          setSuccess(true);
          resetForm();
          if (successTimeoutRef.current) clearTimeout(successTimeoutRef.current);
          successTimeoutRef.current = setTimeout(() => setSuccess(false), 5000);
        } catch (error: unknown) {
          const msg = error && typeof error === 'object' && 'data' in error
            ? (error as { data?: { message?: string } }).data?.message
            : error && typeof error === 'object' && 'message' in error
              ? (error as { message?: string }).message
              : undefined;
          toast.error(msg || t('security.passwordChangeError'));
        } finally {
          setSubmitting(false);
        }
      }}
    >
      {({ handleSubmit, isSubmitting }) => (
        <form onSubmit={handleSubmit} className="space-y-4">
          {success && (
            <Alert className="rounded-lg border-emerald-500/50 bg-emerald-500/10">
              <AlertDescription className="flex items-center justify-between gap-2">
                <span>{t('security.passwordChanged')}</span>
                <button
                  type="button"
                  onClick={() => setSuccess(false)}
                  className="shrink-0 rounded p-1 hover:bg-emerald-500/20"
                  aria-label="Close"
                >
                  ×
                </button>
              </AlertDescription>
            </Alert>
          )}

          <FormikTextField
            name="currentPassword"
            label={t('security.currentPassword')}
            type={showCurrentPassword ? 'text' : 'password'}
            fullWidth
            endAdornment={
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute right-1 top-1/2 size-8 -translate-y-1/2"
                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                aria-label={showCurrentPassword ? 'Hide password' : 'Show password'}
              >
                {showCurrentPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
              </Button>
            }
          />

          <FormikTextField
            name="newPassword"
            label={t('security.newPassword')}
            type={showNewPassword ? 'text' : 'password'}
            fullWidth
            endAdornment={
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute right-1 top-1/2 size-8 -translate-y-1/2"
                onClick={() => setShowNewPassword(!showNewPassword)}
                aria-label={showNewPassword ? 'Hide password' : 'Show password'}
              >
                {showNewPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
              </Button>
            }
          />

          <FormikTextField
            name="confirmPassword"
            label={t('security.confirmPassword')}
            type={showConfirmPassword ? 'text' : 'password'}
            fullWidth
            endAdornment={
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute right-1 top-1/2 size-8 -translate-y-1/2"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
              >
                {showConfirmPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
              </Button>
            }
          />

          <Button
            type="submit"
            disabled={isSubmitting || isLoading}
            className="mt-2 gap-2 rounded-xl bg-amber-600 text-white shadow-lg shadow-amber-500/20 hover:-translate-y-0.5 hover:bg-amber-700 hover:shadow-xl dark:bg-amber-600 dark:hover:bg-amber-700 transition font-semibold"
          >
            <Lock className="size-4" />
            {isSubmitting || isLoading
              ? t('security.changing')
              : t('security.changePassword')
            }
          </Button>
        </form>
      )}
    </Formik>
  );
};
