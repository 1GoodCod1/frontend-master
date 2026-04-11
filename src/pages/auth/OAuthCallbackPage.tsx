import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAppDispatch } from '@/app/hooks';
import { setTokens } from '@/features/auth/authSlice';
import {
  persistRefreshToken,
  markHttpOnlySessionHint,
} from '@/features/auth/persist';
import { authApi } from '@/features/auth/authApi';
import { env } from '@/services/env';
import { AuthLayout } from '@/features/auth/components/AuthLayout';
import { unwrapEnvelope } from '@/utils/data';
import { isRecord } from '@/utils/guards';
import { USER_ROLE } from '@/constants/roles';

function isRtkAbort(err: unknown): boolean {
  if (!isRecord(err)) return false;
  const name = typeof err.name === 'string' ? err.name : '';
  const message = typeof err.message === 'string' ? err.message : '';
  const error = typeof err.error === 'string' ? err.error : '';
  return (
    name === 'AbortError' ||
    error === 'AbortError' ||
    message.includes('abort') ||
    message.includes('Aborted')
  );
}

export default function OAuthCallbackPage() {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const accessToken = searchParams.get('access_token');
  const urlError = searchParams.get('error');

  useEffect(() => {
    if (urlError || !accessToken?.trim()) {
      const reason = !accessToken?.trim() ? 'missing_token' : 'url_error';
      navigate(`/login?error=oauth_failed&reason=${reason}`, { replace: true });
      return;
    }

    const token = accessToken.trim();

    void (async () => {
      try {
        dispatch(
          setTokens({
            accessToken: token,
            refreshToken: '',
          }),
        );
        if (env.useHttpOnly) markHttpOnlySessionHint(true);
        else persistRefreshToken(null);

        const data = await dispatch(
          authApi.endpoints.authMe.initiate(undefined, {
            forceRefetch: true,
          }),
        ).unwrap();

        const raw = unwrapEnvelope(data);
        const me =
          isRecord(raw) && 'user' in raw && isRecord(raw.user)
            ? raw.user
            : raw;
        const role =
          isRecord(me) && typeof me.role === 'string' ? me.role : undefined;

        if (role === USER_ROLE.MASTER) {
          navigate('/dashboard', { replace: true });
          return;
        }
        if (role === USER_ROLE.ADMIN) {
          navigate('/admin', { replace: true });
          return;
        }
        if (role === USER_ROLE.CLIENT) {
          navigate('/client-dashboard', { replace: true });
          return;
        }

        navigate('/login?error=oauth_failed&reason=unknown_role', {
          replace: true,
        });
      } catch (err: unknown) {
        if (isRtkAbort(err)) return;
        const status =
          isRecord(err) && typeof err.status === 'number' ? err.status : 0;
        const reason =
          status === 401 || status === 403 ? 'me_unauthorized' : 'me_failed';
        navigate(`/login?error=oauth_failed&reason=${reason}`, {
          replace: true,
        });
      }
    })();
  }, [accessToken, dispatch, navigate, urlError]);

  return (
    <AuthLayout view="login">
      <div className="flex flex-1 items-center justify-center">
        <p className="text-sm text-muted-foreground">
          {t('auth.oauthCallback.loading')}
        </p>
      </div>
    </AuthLayout>
  );
}
