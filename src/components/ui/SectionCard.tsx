import React from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { cn } from '@/lib/utils';

export interface SectionCardProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: string;
  subtitle?: string;
  actions?: React.ReactNode;
  icon?: React.ReactNode;
}

export const SectionCard: React.FC<SectionCardProps> = ({
  title,
  subtitle,
  actions,
  icon,
  children,
  className,
  ...rest
}) => {
  return (
    <Card
      className={cn(
        'relative overflow-hidden transition duration-250 border-slate-200 dark:border-[#2c2a24] hover:border-violet-500/30 hover:shadow-[0_4px_20px_rgba(139,92,246,0.08)] dark:hover:shadow-[0_4px_20px_rgba(0,0,0,0.3)]',
        icon && 'border-l-4 border-l-violet-500/50',
        className
      )}
      {...rest}
    >
      {(title || actions) && (
        <CardHeader className="flex flex-row items-start justify-between gap-4 pb-2">
          <div className="flex items-start gap-3">
            {icon && (
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-violet-100 dark:bg-violet-950/50 text-violet-600 dark:text-violet-400">
                {icon}
              </span>
            )}
            <div>
              {title && (
                <h3 className="text-lg font-bold tracking-tight">{title}</h3>
              )}
              {subtitle && (
                <p className="mt-0.5 text-sm text-muted-foreground">
                  {subtitle}
                </p>
              )}
            </div>
          </div>
          {actions && <div className="shrink-0">{actions}</div>}
        </CardHeader>
      )}
      <CardContent className={!title && !actions ? 'pt-6' : undefined}>
        {children}
      </CardContent>
    </Card>
  );
};
