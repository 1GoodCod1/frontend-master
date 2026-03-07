import type { ReactNode } from 'react';
import { CheckCircle } from 'lucide-react';

interface AccountInfoFieldProps {
  icon: ReactNode;
  label: string;
  value: string | ReactNode;
  verified?: boolean;
  verificationComponent?: ReactNode;
}

export default function AccountInfoField({
  icon,
  label,
  value,
  verified,
  verificationComponent,
}: AccountInfoFieldProps) {
  return (
    <div>
      <div className="mb-1 flex flex-row items-center gap-2">
        {icon}
        <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          {label}
        </span>
        {verified && <CheckCircle className="size-4 text-emerald-600 dark:text-emerald-400" />}
      </div>
      <div className="pl-9 font-medium text-foreground">{value}</div>
      {verificationComponent}
    </div>
  );
}
