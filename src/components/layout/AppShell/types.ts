import type { LucideIcon } from 'lucide-react';
import type { UserRole as Role } from '@/constants/roles';

export type SupportedLanguage = 'en' | 'ru' | 'ro';

export type { Role };

export interface AppShellNavItem {
  to: string;
  labelKey: string;
  icon: LucideIcon;
  roles?: Role[] | 'any-authed';
  hideForRoles?: Role[];
}
