import { useTranslation } from 'react-i18next';
import { User, Briefcase } from 'lucide-react';
import { cn } from '@/lib/utils';

interface RoleTabsProps {
  value: number;
  onChange: (role: 'CLIENT' | 'MASTER') => void;
}

export default function RoleTabs({ value, onChange }: RoleTabsProps) {
  const { t } = useTranslation();

  return (
    <div
      className={cn(
        'mb-5 flex rounded-xl p-1',
        'bg-[#efefef] dark:bg-[#1a1a1a]'
      )}
    >
      <button
        type="button"
        onClick={() => onChange('CLIENT')}
        className={cn(
          'flex flex-1 items-center justify-center gap-1.5 rounded-[10px] px-0 py-2.5 text-[0.82rem] font-medium transition-all',
          value === 0
            ? 'bg-white text-[#f97316] font-bold shadow-[0_1px_6px_rgba(0,0,0,0.15)] dark:bg-[#252525] dark:text-[#f97316]'
            : 'bg-transparent text-muted-foreground'
        )}
      >
        <User size={13} />
        {t('auth.registerClient.title')}
      </button>
      <button
        type="button"
        onClick={() => onChange('MASTER')}
        className={cn(
          'flex flex-1 items-center justify-center gap-1.5 rounded-[10px] px-0 py-2.5 text-[0.82rem] font-medium transition-all',
          value === 1
            ? 'bg-white text-[#f97316] font-bold shadow-[0_1px_6px_rgba(0,0,0,0.15)] dark:bg-[#252525] dark:text-[#f97316]'
            : 'bg-transparent text-muted-foreground'
        )}
      >
        <Briefcase size={13} />
        {t('auth.register.masterTitle')}
      </button>
    </div>
  );
}
