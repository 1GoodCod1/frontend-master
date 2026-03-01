import { Navigate, Outlet, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useAppSelector } from '@/app/hooks';
import { selectIsAuthed, selectRole, selectRestoring, selectPlan } from './selectors';
import { LoadingState } from '@/components/common/States';
import { TariffPlan, hasMinPlan } from '@/features/auth/plan';
import { useAuthMeQuery } from './authApi';

function LoadingProfileWithReload({ label = 'Loading profile...' }: { label?: string }) {
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    const fadeTimer = setTimeout(() => setFadeOut(true), 800);
    const reloadTimer = setTimeout(() => window.location.reload(), 1000);
    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(reloadTimer);
    };
  }, []);

  return (
    <div className="flex min-h-screen items-center justify-center gap-4 bg-background transition-colors duration-300">
      <div className={fadeOut ? 'opacity-0 transition-opacity duration-200' : 'opacity-100 transition-opacity duration-200'}>
        <LoadingState label={label} />
      </div>
    </div>
  );
}

export function PublicRoute() {
  const restoring = useAppSelector(selectRestoring);
  const isAuthed = useAppSelector(selectIsAuthed);
  const role = useAppSelector(selectRole);
  const navigate = useNavigate();

  useEffect(() => {
    if (!restoring && isAuthed && role) {
      if (role === 'ADMIN') {
        navigate('/admin', { replace: true });
      } else if (role === 'MASTER') {
        navigate('/dashboard', { replace: true });
      } else if (role === 'CLIENT') {
        navigate('/client-dashboard', { replace: true });
      }
    }
  }, [restoring, isAuthed, role, navigate]);

  if (restoring) return <LoadingState label="Restoring session..." fullScreen />;
  if (isAuthed && !role) return <LoadingProfileWithReload />;

  return (
    <div className="animate-in fade-in duration-200">
      <Outlet />
    </div>
  );
}

/**
 * Guard for pages accessible to any authenticated user (client, master, admin).
 * Redirects to /login if not authenticated.
 */
export function AuthRoute() {
  const restoring = useAppSelector(selectRestoring);
  const isAuthed = useAppSelector(selectIsAuthed);

  if (restoring) return <LoadingState label="Restoring session..." fullScreen />;
  if (!isAuthed) return <Navigate to="/login" replace />;

  return (
    <div className="animate-in fade-in duration-200">
      <Outlet />
    </div>
  );
}

export function PlanRoute({ min }: { min: TariffPlan }) {
  const restoring = useAppSelector(selectRestoring);
  const isAuthed = useAppSelector(selectIsAuthed);
  const role = useAppSelector(selectRole);
  const plan = useAppSelector(selectPlan);

  if (restoring) return <LoadingState label="Restoring session..." fullScreen />;
  if (!isAuthed) return <Navigate to="/login" replace />;
  if (!role || !plan) return <LoadingProfileWithReload label="Loading plan..." />;
  if (role !== 'MASTER') return <Navigate to="/" replace />;

  if (!hasMinPlan(plan, min)) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="animate-in fade-in duration-200">
      <Outlet />
    </div>
  );
}

export function MasterRoute() {
  const restoring = useAppSelector(selectRestoring);
  const isAuthed = useAppSelector(selectIsAuthed);
  const role = useAppSelector(selectRole);
  const [showLoading, setShowLoading] = useState(false);

  const { isLoading: isLoadingMe } = useAuthMeQuery(undefined, {
    skip: !isAuthed
  });

  useEffect(() => {
    if (!(isAuthed && !role && isLoadingMe)) {
      queueMicrotask(() => setShowLoading(false));
      return;
    }
    const timer = setTimeout(() => setShowLoading(true), 300);
    return () => clearTimeout(timer);
  }, [isAuthed, role, isLoadingMe]);

  if (restoring || (isAuthed && !role && showLoading)) {
    return <LoadingState label="Restoring session..." fullScreen />;
  }
  if (!isAuthed) return <Navigate to="/login" replace />;
  if (!role) {
    if (isLoadingMe) return <LoadingState label="Loading profile..." fullScreen />;
    return <LoadingProfileWithReload />;
  }

  if (role !== 'MASTER') return <Navigate to="/" replace />;

  return (
    <div className="animate-in fade-in duration-200">
      <Outlet />
    </div>
  );
}

export function AdminRoute() {
  const restoring = useAppSelector(selectRestoring);
  const isAuthed = useAppSelector(selectIsAuthed);
  const role = useAppSelector(selectRole);
  const [showLoading, setShowLoading] = useState(false);

  const { isLoading: isLoadingMe } = useAuthMeQuery(undefined, {
    skip: !isAuthed
  });

  useEffect(() => {
    if (!(isAuthed && !role && isLoadingMe)) {
      queueMicrotask(() => setShowLoading(false));
      return;
    }
    const timer = setTimeout(() => setShowLoading(true), 300);
    return () => clearTimeout(timer);
  }, [isAuthed, role, isLoadingMe]);

  if (restoring || (isAuthed && !role && showLoading)) {
    return <LoadingState label="Restoring session..." fullScreen />;
  }
  if (!isAuthed) return <Navigate to="/login" replace />;

  if (!role) {
    if (isLoadingMe) return <LoadingState label="Loading profile..." fullScreen />;
    return <LoadingProfileWithReload />;
  }

  if (role !== 'ADMIN') return <Navigate to="/" replace />;

  return (
    <div className="animate-in fade-in duration-200">
      <Outlet />
    </div>
  );
}
