import type { LucideIcon } from 'lucide-react';

export type SupportedLanguage = 'en' | 'ru' | 'ro';

export type Role = 'ADMIN' | 'MASTER' | 'CLIENT';

export interface AppShellNavItem {
  to: string;
  labelKey: string;
  icon: LucideIcon;
  roles?: Role[] | 'any-authed';
}
