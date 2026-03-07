import {
  Users,
  CreditCard,
  LayoutDashboard,
  Shield,
} from 'lucide-react';
import type { AppShellNavItem } from './types';

export const APP_SHELL_NAV_ITEMS: AppShellNavItem[] = [
  { to: '/masters', labelKey: 'nav.masters', icon: Users },
  { to: '/plans', labelKey: 'nav.plans', icon: CreditCard },
  { to: '/dashboard', labelKey: 'nav.dashboard', icon: LayoutDashboard, roles: ['MASTER'] },
  { to: '/client-dashboard', labelKey: 'nav.clientDashboard', icon: LayoutDashboard, roles: ['CLIENT'] },
  { to: '/admin', labelKey: 'nav.admin', icon: Shield, roles: ['ADMIN'] },
];
