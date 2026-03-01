import type { LucideIcon } from 'lucide-react';

export type SupportedLanguage = 'en' | 'ru' | 'ro';

export type Role = 'ADMIN' | 'MASTER' | 'CLIENT';

export interface AppShellNavItem {
  to: string;
  labelKey: string;
  icon: LucideIcon;
  /** When set, link is shown only when user has one of these roles; when undefined, shown when isAuthed (ideas) or always (masters, plans) */
  roles?: Role[] | 'any-authed';
}
