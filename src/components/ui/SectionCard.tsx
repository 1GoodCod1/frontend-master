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
        'relative overflow-hidden transition-all duration-250 border-slate-200 dark:border-white/[0.08] hover:border-amber-500/20 hover:shadow-[0_4px_20px_hsl(var(--primary)/0.06)]',
        icon && 'border-l-4 border-l-amber-500/50',
        className
      )}
      {...rest}
    >
      {(title || actions) && (
        <CardHeader className="flex flex-row items-start justify-between gap-4 pb-2">
          <div className="flex items-start gap-3">
            {icon && (
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-amber-500/15 text-amber-600 dark:text-amber-400">
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
