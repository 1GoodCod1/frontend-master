import type { AppShellNavItem } from './types';
import type { Role } from './types';
import { APP_SHELL_NAV_ITEMS } from './constants';

export function getVisibleNavItems(
  isAuthed: boolean,
  role: Role | null
): AppShellNavItem[] {
  return APP_SHELL_NAV_ITEMS.filter((item) => {
    if (role != null && item.hideForRoles?.includes(role)) return false;
    if (!item.roles) return true;
    if (item.roles === 'any-authed') return isAuthed;
    return role != null && item.roles.includes(role);
  });
}
