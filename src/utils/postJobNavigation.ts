import { paths } from '@/constants/routes';
import { USER_ROLE } from '@/constants/roles';

export function getPostJobNavigationPath(isAuthed: boolean, role: string | null): string {
  if (isAuthed && role === USER_ROLE.MASTER) return paths.jobs.list;
  if (isAuthed && role === USER_ROLE.CLIENT) return paths.clientDashboard.jobsCreate;

  const redirect = encodeURIComponent(paths.clientDashboard.jobsCreate);
  return `${paths.register}?role=client&redirect=${redirect}`;
}
