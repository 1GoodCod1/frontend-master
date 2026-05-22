import { useEffect, useRef } from 'react';
import { useNavigate, Navigate, useSearchParams } from 'react-router-dom';
import { Formik } from 'formik';
import { useTranslation } from 'react-i18next';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { selectIsAuthed } from '@/features/auth/selectors';
import { clearAuth } from '@/features/auth/authSlice';
import {
  markHttpOnlySessionHint,
  persistRefreshToken,
} from '@/features/auth/persist';
import { AuthLayout } from '@/features/auth/components/AuthLayout';
import LoginHeader from '@/features/auth/components/login/LoginHeader';
import LoginForm from '@/features/auth/components/login/LoginForm';
import { useLoginForm, type LoginFormValues } from '@/hooks/auth/login';
import { Button } from '@/components/ui/button';
import { USER_ROLE } from '@/constants/roles';
import { formatOAuthLoginErrorToast } from '@/utils/oauthLoginErrorToast';
import toast from 'react-hot-toast';

export default function LoginPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [searchParams] = useSearchParams();
  const clearedOauthFailRef = useRef(false);
  const isAuthed = useAppSelector(selectIsAuthed);
  const role = useAppSelector((s) => s.auth.role);
  const restoring = useAppSelector((s) => s.auth.restoring);

  const form = useLoginForm();

  useEffect(() => {
    if (clearedOauthFailRef.current) return;
    if (searchParams.get('error') !== 'oauth_failed') return;
    clearedOauthFailRef.current = true;
    const reason = searchParams.get('reason') ?? '';
    toast.error(formatOAuthLoginErrorToast(t, reason), { duration: 9000 });
    dispatch(clearAuth());
    persistRefreshToken(null);
    markHttpOnlySessionHint(false);
    navigate('/login', { replace: true });
  }, [dispatch, navigate, searchParams, t]);

  useEffect(() => {
    if (!isAuthed || !role) return;
    if (role === USER_ROLE.ADMIN) navigate('/admin', { replace: true });
    else if (role === USER_ROLE.MASTER) navigate('/dashboard', { replace: true });
    else if (role === USER_ROLE.CLIENT)
      navigate('/client-dashboard', { replace: true });
  }, [isAuthed, role, navigate]);

  if (isAuthed && role) {
    if (role === USER_ROLE.ADMIN) return <Navigate to="/admin" replace />;
    if (role === USER_ROLE.MASTER) return <Navigate to="/dashboard" replace />;
    if (role === USER_ROLE.CLIENT)
      return <Navigate to="/client-dashboard" replace />;
  }

  if (restoring) {
    return (
      <AuthLayout view="login">
        <div className="faber-page-enter">
          <h2 className="auth-heading">{t('auth.login.title')}</h2>
          <p className="auth-subheading mb-4">{t('auth.login.restoring')}</p>
          <Button disabled className="auth-primary-btn w-full">
            ...
          </Button>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout view="login">
      <div className="faber-page-enter">
        <LoginHeader />
          <Formik<LoginFormValues>
            initialValues={form.initialValues}
            validationSchema={form.validationSchema}
            onSubmit={form.onSubmit}
            enableReinitialize
          >
            {({ handleSubmit }) => (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSubmit(e);
                }}
                method="post"
                noValidate
              >
                <LoginForm isSubmitting={form.isSubmitting} />
              </form>
            )}
          </Formik>
        </div>
      </AuthLayout>
    );
}
