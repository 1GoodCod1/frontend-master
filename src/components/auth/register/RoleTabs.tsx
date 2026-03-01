import { useTranslation } from 'react-i18next';
import { UserPlus, Briefcase } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface RoleTabsProps {
  value: number;
  onChange: (role: 'CLIENT' | 'MASTER') => void;
}

export default function RoleTabs({ value, onChange }: RoleTabsProps) {
  const { t } = useTranslation();
  const valueStr = value === 0 ? '0' : '1';

  return (
    <div className="mb-6 overflow-hidden rounded-xl border-2 border-amber-400/90 dark:border-white/[0.08] bg-amber-100/90 dark:bg-white/[0.03] shadow-lg shadow-amber-900/10 dark:shadow-none ring-2 ring-amber-200/50 dark:ring-transparent">
      <Tabs
        value={valueStr}
        onValueChange={(v) => onChange(v === '0' ? 'CLIENT' : 'MASTER')}
        className="w-full"
      >
        <TabsList className="h-auto w-full justify-stretch rounded-none border-0 bg-transparent p-1">
          <TabsTrigger
            value="0"
            className="flex-1 gap-2 py-5 text-base font-semibold text-muted-foreground cursor-pointer transition-all duration-500 ease-[cubic-bezier(0.25,0.46,0.45,0.94)] hover:bg-amber-200/70 dark:hover:bg-white/5 data-[state=active]:bg-white data-[state=active]:text-amber-700 data-[state=active]:dark:bg-card data-[state=active]:dark:text-amber-600 data-[state=active]:shadow-md data-[state=active]:rounded-lg"
          >
            <UserPlus className="h-5 w-5 transition-colors duration-500" />
            {t('auth.registerClient.title')}
          </TabsTrigger>
          <TabsTrigger
            value="1"
            className="flex-1 gap-2 py-5 text-base font-semibold text-muted-foreground cursor-pointer transition-all duration-500 ease-[cubic-bezier(0.25,0.46,0.45,0.94)] hover:bg-amber-200/70 dark:hover:bg-white/5 data-[state=active]:bg-white data-[state=active]:text-amber-700 data-[state=active]:dark:bg-card data-[state=active]:dark:text-amber-600 data-[state=active]:shadow-md data-[state=active]:rounded-lg"
          >
            <Briefcase className="h-5 w-5 transition-colors duration-500" />
            {t('auth.register.masterTitle')}
          </TabsTrigger>
        </TabsList>
      </Tabs>
    </div>
  );
}
