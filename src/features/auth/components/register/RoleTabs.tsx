import { useTranslation } from 'react-i18next';
import { User, Briefcase } from 'lucide-react';
import { cn } from '@/lib/utils';

interface RoleTabsProps {
  value: number;
  onChange: (role: 'CLIENT' | 'MASTER') => void;
  className?: string;
}

export default function RoleTabs({ value, onChange, className }: RoleTabsProps) {
  const { t } = useTranslation();

  const tabs = [
    { role: 'CLIENT' as const, index: 0, icon: User, label: t('auth.registerClient.title') },
    { role: 'MASTER' as const, index: 1, icon: Briefcase, label: t('auth.register.masterTitle') },
  ];

  return (
    <div className={cn('auth-role-tabs', className)} role="tablist">
      {tabs.map(({ role, index, icon: Icon, label }) => (
        <button
          key={role}
          type="button"
          role="tab"
          aria-selected={value === index}
          onClick={() => onChange(role)}
          className={cn('auth-role-tab', value === index && 'auth-role-tab--active')}
        >
          <Icon size={14} strokeWidth={2.25} />
          {label}
        </button>
      ))}
    </div>
  );
}
