import React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { cn } from '@/lib/utils';
import type { PageHeaderProps } from '@/types/ui';

export type { PageHeaderProps };

export const PageHeader: React.FC<PageHeaderProps> = ({ title, subtitle, crumbs, actions, className }) => {
  return (
    <div className={cn('mb-6', className)}>
      {crumbs && crumbs.length > 0 && (
        <Breadcrumb className="mb-2 opacity-90">
          <BreadcrumbList>
            {crumbs.map((c, i) => (
              <React.Fragment key={i}>
                {i > 0 && <BreadcrumbSeparator />}
                <BreadcrumbItem>
                  {c.to ? (
                    <BreadcrumbLink asChild>
                      <RouterLink to={c.to}>{c.label}</RouterLink>
                    </BreadcrumbLink>
                  ) : (
                    <BreadcrumbPage>{c.label}</BreadcrumbPage>
                  )}
                </BreadcrumbItem>
              </React.Fragment>
            ))}
          </BreadcrumbList>
        </Breadcrumb>
      )}

      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className={cn('text-[clamp(22px,2.5vw,28px)] font-bold tracking-[-0.025em] text-[#212529] dark:text-white')}>{title}</h1>
          {subtitle && (
            <p className="mt-1 text-[14px] leading-snug text-[#6C757D] dark:text-white/55">{subtitle}</p>
          )}
        </div>
        {actions && <div className="flex flex-shrink-0 items-center gap-2">{actions}</div>}
      </div>
    </div>
  );
};
