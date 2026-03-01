import { useRef, useEffect } from 'react';
import { RouterProvider } from 'react-router-dom';
import toast from 'react-hot-toast';
import { router } from '@/app/router';
import { useAppSelector } from '@/app/hooks';
import { selectIsAuthed } from '@/features/auth/selectors';
import { useAuthMeQuery } from '@/features/auth/authApi';
import { store } from '@/app/store';
import { api } from '@/services/api';
import { connectSocket, disconnectSocket } from '@/services/socket';

const REFETCH_TAGS_ON_RECONNECT: readonly string[] = [
  'Me', 'Masters', 'Master', 'Leads', 'Reviews', 'Payments', 'Categories', 'Cities',
  'Favorites', 'Recommendations', 'Tariffs', 'Verification', 'Bookings', 'Analytics', 'Files',
];

export function App() {
  const isAuthed = useAppSelector(selectIsAuthed);
  const wasOfflineRef = useRef(false);

  useAuthMeQuery(undefined, {
    skip: !isAuthed,
    refetchOnMountOrArgChange: false,
  });

  useEffect(() => {
    if (isAuthed) connectSocket(store);
    else disconnectSocket();
  }, [isAuthed]);

  useEffect(() => {
    const onOffline = () => { wasOfflineRef.current = true; };
    const onOnline = () => {
      if (wasOfflineRef.current) {
        wasOfflineRef.current = false;
        toast.success('Соединение восстановлено', { duration: 4000 });
        store.dispatch(api.util.invalidateTags(REFETCH_TAGS_ON_RECONNECT as Parameters<typeof api.util.invalidateTags>[0]));
      }
    };
    window.addEventListener('offline', onOffline);
    window.addEventListener('online', onOnline);
    return () => {
      window.removeEventListener('offline', onOffline);
      window.removeEventListener('online', onOnline);
    };
  }, []);

  return <RouterProvider router={router} />;
}
