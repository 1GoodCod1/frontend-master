import { AppShell } from '@/components/layout/AppShell';
import { RouteErrorBoundary } from '@/components/common/RouteErrorBoundary';
import { LazyPage } from './LazyPage';
import * as P from './lazyPages';
import { publicRoutes } from './publicRoutes';
import { authRoutes } from './authRoutes';
import { masterRoutes } from './masterRoutes';
import { clientRoutes } from './clientRoutes';
import { adminRoutes } from './adminRoutes';

export const routeTree = [
  {
    path: '/',
    element: <AppShell />,
    errorElement: <RouteErrorBoundary />,
    children: [
      ...publicRoutes,
      authRoutes,
      masterRoutes,
      clientRoutes,
      adminRoutes,
      { path: '*', element: <LazyPage><P.NotFoundPage /></LazyPage> },
    ],
  },
];
