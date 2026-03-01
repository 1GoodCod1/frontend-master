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

export const PageHeader: React.FC<PageHeaderProps> = ({ title, subtitle, crumbs, actions }) => {
  return (
    <div className="mb-6">
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
          <h1 className={cn('text-2xl font-bold tracking-tight md:text-3xl')}>{title}</h1>
          {subtitle && (
            <p className="mt-1 text-base text-muted-foreground">{subtitle}</p>
          )}
        </div>
        {actions && <div className="flex flex-shrink-0 items-center gap-2">{actions}</div>}
      </div>
    </div>
  );
};
