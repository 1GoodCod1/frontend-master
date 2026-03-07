import { Badge } from '@/components/ui/badge';
import { getRoleGradient, getRoleColor, formatRole } from '@/utils/user';
import { useIsDark } from '@/hooks/useIsDark';

interface RoleCellProps {
  role: string;
}

export default function RoleCell({ role }: RoleCellProps) {
  const isDark = useIsDark();
  const gradient = getRoleGradient(role, isDark);
  const bg = gradient || getRoleColor(role, isDark);

  return (
    <Badge
      className="font-semibold text-sm h-8 px-3 rounded-lg shadow-md text-white border-0"
      style={{
        background: bg,
        boxShadow: role?.toUpperCase() === 'ADMIN'
          ? '0 3px 10px rgba(220, 20, 60, 0.4)'
          : '0 2px 8px rgba(0, 0, 0, 0.15)',
      }}
    >
      {formatRole(role)}
    </Badge>
  );
}
