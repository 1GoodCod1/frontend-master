import { useRef, useEffect } from 'react';
import { RouterProvider } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { router } from '@/app/router';
import { useAppSelector, useAppStore } from '@/app/hooks';
import { selectIsAuthed } from '@/features/auth/selectors';
import { useAuthMeQuery } from '@/features/auth/authApi';
import { api } from '@/services/api';
import { connectSocket, disconnectSocket } from '@/services/socket';
import { clearAuth } from '@/features/auth/authSlice';
import { REFRESH_TOKEN_KEY } from '@/features/auth/persist';
import toast from 'react-hot-toast';

const REFETCH_TAGS_ON_RECONNECT: readonly string[] = [
  'Me', 'Masters', 'Master', 'Leads', 'Reviews', 'Payments', 'Categories', 'Cities',
  'Favorites', 'Recommendations', 'Tariffs', 'Verification', 'Bookings', 'Analytics', 'Files',
];

export function App() {
  const store = useAppStore();
  const isAuthed = useAppSelector(selectIsAuthed);
  const wasOfflineRef = useRef(false);

  useAuthMeQuery(undefined, {
    skip: !isAuthed,
    refetchOnMountOrArgChange: false,
  });

  useEffect(() => {
    if (isAuthed) void connectSocket(store);
    else disconnectSocket();
  }, [isAuthed, store]);

  // Disconnect WebSocket on pagehide so the page is eligible for bfcache,
  // and reconnect on pageshow when restored from bfcache.
  useEffect(() => {
    const onPageHide = () => { disconnectSocket(); };
    const onPageShow = (e: PageTransitionEvent) => {
      if (e.persisted && isAuthed) void connectSocket(store);
    };
    window.addEventListener('pagehide', onPageHide);
    window.addEventListener('pageshow', onPageShow);
    return () => {
      window.removeEventListener('pagehide', onPageHide);
      window.removeEventListener('pageshow', onPageShow);
    };
  }, [isAuthed, store]);

  // Logout in another tab → clear auth state in this tab
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === REFRESH_TOKEN_KEY && e.newValue === null) {
        store.dispatch(api.util.resetApiState());
        store.dispatch(clearAuth());
        toast('Вы вышли из системы');
      }
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, [store]);

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
  }, [store]);

  return (
    <HelmetProvider>
      <RouterProvider router={router} />
    </HelmetProvider>
  );
}
