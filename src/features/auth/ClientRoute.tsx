import { Navigate, Outlet } from 'react-router-dom';
import { useAppSelector } from '@/app/hooks';
import { selectIsAuthed, selectRestoring, selectRole } from '@/features/auth/selectors';
import { useAuthMeQuery } from '@/features/auth/authApi';
import { LoadingState } from '@/components/common/States';
import { USER_ROLE } from '@/constants/roles';

export function ClientRoute() {
  const isAuthed = useAppSelector(selectIsAuthed);
  const role = useAppSelector(selectRole);
  const restoring = useAppSelector(selectRestoring);
  useAuthMeQuery(undefined, { skip: !isAuthed });

  if (restoring) return <LoadingState fullScreen />;
  if (!isAuthed) return <Navigate to="/login" replace />;
  if (!role) return <LoadingState fullScreen />;

  if (role === USER_ROLE.CLIENT) {
    return (
      <div className="animate-in fade-in duration-200">
        <Outlet />
      </div>
    );
  }
  if (role === USER_ROLE.MASTER) return <Navigate to="/dashboard" replace />;
  if (role === USER_ROLE.ADMIN) return <Navigate to="/admin" replace />;

  return <Navigate to="/" replace />;
}
