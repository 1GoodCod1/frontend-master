import { PublicRoute } from '@/features/auth/guards';
import { routeSeg } from '@/constants/routes';
import { LazyPage } from './LazyPage';
import * as P from './lazyPages';

export const authRoutes = {
  element: <PublicRoute />,
  children: [
    { path: routeSeg.login, element: <LazyPage><P.LoginPage /></LazyPage> },
    { path: routeSeg.register, element: <LazyPage><P.RegisterPage /></LazyPage> },
    {
      path: routeSeg.forgotPassword,
      element: <LazyPage><P.ForgotPasswordPage /></LazyPage>,
    },
    {
      path: routeSeg.resetPassword,
      element: <LazyPage><P.ResetPasswordPage /></LazyPage>,
    },
  ],
};
