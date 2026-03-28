import { Navigate, Outlet, useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { useAppSelector } from '@/app/hooks';
import { selectIsAuthed, selectRole, selectRestoring, selectPlan } from './selectors';
import { LoadingState } from '@/components/common/States';
import { TariffPlan, hasMinPlan } from '@/features/auth/plan';
import { useAuthMeQuery } from './authApi';
import { USER_ROLE } from '@/constants/roles';

function WaitingForRole() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <LoadingState label="Loading profile..." />
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
      if (role === USER_ROLE.ADMIN) {
        navigate('/admin', { replace: true });
      } else if (role === USER_ROLE.MASTER) {
        navigate('/dashboard', { replace: true });
      } else if (role === USER_ROLE.CLIENT) {
        navigate('/client-dashboard', { replace: true });
      }
    }
  }, [restoring, isAuthed, role, navigate]);

  if (restoring) return <LoadingState label="Restoring session..." fullScreen />;
  // If authenticated but role not yet loaded, wait (API call in flight)
  if (isAuthed && !role) return <WaitingForRole />;

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
  if (!role || !plan) return <WaitingForRole />;
  if (role !== USER_ROLE.MASTER) return <Navigate to="/" replace />;

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

  const { isLoading: isLoadingMe } = useAuthMeQuery(undefined, {
    skip: !isAuthed,
  });

  if (restoring || (isAuthed && !role && isLoadingMe)) {
    return <LoadingState label="Restoring session..." fullScreen />;
  }
  if (!isAuthed) return <Navigate to="/login" replace />;
  if (!role) return <WaitingForRole />;
  if (role !== USER_ROLE.MASTER) return <Navigate to="/" replace />;

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

  const { isLoading: isLoadingMe } = useAuthMeQuery(undefined, {
    skip: !isAuthed,
  });

  if (restoring || (isAuthed && !role && isLoadingMe)) {
    return <LoadingState label="Restoring session..." fullScreen />;
  }
  if (!isAuthed) return <Navigate to="/login" replace />;
  if (!role) return <WaitingForRole />;
  if (role !== USER_ROLE.ADMIN) return <Navigate to="/" replace />;

  return (
    <div className="animate-in fade-in duration-200">
      <Outlet />
    </div>
  );
}
