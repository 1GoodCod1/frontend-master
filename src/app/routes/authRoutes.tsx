import { PublicRoute } from '@/features/auth/guards';
import { LazyPage } from './LazyPage';
import * as P from './lazyPages';

export const authRoutes = {
  element: <PublicRoute />,
  children: [
    { path: 'login', element: <LazyPage><P.LoginPage /></LazyPage> },
    { path: 'register', element: <LazyPage><P.RegisterPage /></LazyPage> },
    { path: 'forgot-password', element: <LazyPage><P.ForgotPasswordPage /></LazyPage> },
    { path: 'reset-password', element: <LazyPage><P.ResetPasswordPage /></LazyPage> },
  ],
};
