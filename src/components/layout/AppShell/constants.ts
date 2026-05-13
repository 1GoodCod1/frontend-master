import {
  Users,
  CreditCard,
  LayoutDashboard,
  Shield,
  Briefcase,
} from 'lucide-react';
import { USER_ROLE } from '@/constants/roles';
import type { AppShellNavItem } from './types';

export const APP_SHELL_NAV_ITEMS: AppShellNavItem[] = [
  { to: '/masters', labelKey: 'nav.masters', icon: Users },
  {
    to: '/jobs',
    labelKey: 'nav.jobs',
    icon: Briefcase,
    hideForRoles: [USER_ROLE.ADMIN],
  },
  {
    to: '/plans',
    labelKey: 'nav.plans',
    icon: CreditCard,
    hideForRoles: [USER_ROLE.CLIENT],
  },
  {
    to: '/dashboard',
    labelKey: 'nav.dashboard',
    icon: LayoutDashboard,
    roles: [USER_ROLE.MASTER],
  },
  {
    to: '/client-dashboard',
    labelKey: 'nav.clientDashboard',
    icon: LayoutDashboard,
    roles: [USER_ROLE.CLIENT],
  },
  { to: '/admin', labelKey: 'nav.admin', icon: Shield, roles: [USER_ROLE.ADMIN] },
];
