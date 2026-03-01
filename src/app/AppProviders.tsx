import { useEffect } from 'react';
import { useAppSelector } from '@/app/hooks';

export function AppProviders({ children }: { children: React.ReactNode }) {
  const mode = useAppSelector((s: { ui: { colorMode: string } }) => s.ui.colorMode);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', mode);
    document.documentElement.classList.toggle('dark', mode === 'dark');
  }, [mode]);

  return <>{children}</>;
}
