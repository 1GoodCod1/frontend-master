import { Link as RouterLink } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { ReactNode } from 'react';

type SectionHeadLink = {
  label: string;
  href: string;
};

type SectionHeadProps = {
  kicker: string;
  title: string;
  accent: string;
  link?: SectionHeadLink;
  trailing?: ReactNode;
  className?: string;
};

export function SectionHead({
  kicker,
  title,
  accent,
  link,
  trailing,
  className,
}: SectionHeadProps) {
  return (
    <div className={cn('mb-[26px]', className)}>
      <div className="flex items-center gap-3 mb-2.5">
        <span
          className="inline-block w-1 h-[18px] rounded-full shrink-0"
          style={{ backgroundColor: accent }}
          aria-hidden
        />
        <span
          className="text-[11px] font-semibold uppercase tracking-[0.16em]"
          style={{ color: accent }}
        >
          {kicker}
        </span>
        {trailing ? <div className="ml-auto shrink-0">{trailing}</div> : null}
      </div>

      <div className="flex justify-between items-end gap-4">
        <h2 className="m-0 text-[clamp(26px,3vw,36px)] font-bold tracking-[-0.025em] leading-[1.1] text-foreground">
          {title}
        </h2>
        {link ? (
          <RouterLink
            to={link.href}
            className="inline-flex items-center gap-1 text-[13px] font-medium text-foreground whitespace-nowrap hover:opacity-80 transition-opacity shrink-0"
          >
            {link.label}
            <ArrowRight size={13} strokeWidth={2} />
          </RouterLink>
        ) : null}
      </div>
    </div>
  );
}
