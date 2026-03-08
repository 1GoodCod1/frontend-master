import { getInitials } from '@/utils/initials';
import { gradientFromId } from '@/utils/avatarTheme';
import { cn } from '@/lib/utils';

const ROLE_GRADIENT =
  'linear-gradient(145deg, #2d2d2d 0%, #1a1a1a 35%, #0d0d0d 70%, #1a1a1a 100%)';
const ROLE_SHINE =
  'radial-gradient(ellipse 80% 50% at 35% 25%, rgba(255,255,255,0.08) 0%, transparent 55%)';

export function AvatarPlaceholder({
  id,
  name,
  height = 200,
  variant = 'default',
  role,
}: {
  id?: string;
  name?: string;
  height?: number;
  variant?: 'default' | 'vip' | 'premium';
  /** When set, shows a black gradient with "M" (master) or "C" (client) instead of initials */
  role?: 'master' | 'client';
}) {
  const useRoleStyle = role === 'master' || role === 'client';
  const letter = role === 'client' ? 'C' : role === 'master' ? 'M' : getInitials(name);
  const { c1, c2 } = gradientFromId(id);

  const gradient = useRoleStyle
    ? ROLE_GRADIENT
    : variant === 'vip'
      ? 'linear-gradient(135deg, #f6d365 0%, #fda085 100%)'
      : variant === 'premium'
        ? 'linear-gradient(135deg, #89f7fe 0%, #66a6ff 100%)'
        : `linear-gradient(135deg, ${c1} 0%, ${c2} 100%)`;

  const shine = useRoleStyle
    ? ROLE_SHINE
    : 'radial-gradient(circle at 30% 20%, rgba(255,255,255,0.25) 0%, rgba(255,255,255,0) 45%)';

  const fontSize =
    height <= 48
      ? Math.floor(height * 0.5)
      : Math.max(28, Math.floor(height / 3));

  return (
    <div
      className={cn(
        'relative flex h-full w-full select-none items-center justify-center overflow-hidden text-white',
        useRoleStyle && 'rounded-full'
      )}
      style={{ height, background: gradient }}
    >
      <div className="absolute inset-0 rounded-none" style={{ background: shine }} />
      <span
        className="relative font-black tracking-widest text-white"
        style={{
          fontSize,
          textShadow: useRoleStyle
            ? '0 2px 12px rgba(0,0,0,0.5)'
            : '0 6px 18px rgba(0,0,0,0.25)',
        }}
      >
        {letter}
      </span>
    </div>
  );
}
