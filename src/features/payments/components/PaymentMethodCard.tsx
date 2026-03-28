import type { ReactNode } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export interface PaymentMethodCardProps {
  icon: ReactNode;
  title: string;
  description: string;
  /** Optional hint below description (e.g. Sandbox test info) */
  hint?: string;
  buttonLabel: string;
  loadingLabel?: string;
  disabled?: boolean;
  loading?: boolean;
  onClick?: () => void;
  className?: string;
}

export function PaymentMethodCard({
  icon,
  title,
  description,
  hint,
  buttonLabel,
  loadingLabel = '...',
  disabled = false,
  loading = false,
  onClick,
  className,
}: PaymentMethodCardProps) {
  const isAction = Boolean(onClick) && !disabled;

  return (
    <Card
      className={cn(
        'relative h-full rounded-2xl border-2 p-6 transition border-[#f5f4eb] dark:border-white/[0.08]',
        isAction && 'hover:border-primary/50 dark:hover:border-primary/50',
        className
      )}
    >
      <CardContent className="flex flex-col gap-4 p-0">
        <div className="flex flex-row items-center gap-2">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-muted text-muted-foreground">
            {icon}
          </div>
          <h3 className="text-lg font-extrabold text-foreground">{title}</h3>
        </div>
        <p className="text-sm text-muted-foreground">{description}</p>
        {hint && (
          <p className="text-xs text-muted-foreground/90 -mt-2">{hint}</p>
        )}
        <Button
          variant={isAction ? 'default' : 'outline'}
          size="lg"
          className="w-full font-semibold mt-auto"
          disabled={disabled || loading}
          onClick={onClick}
        >
          {loading ? loadingLabel : buttonLabel}
        </Button>
      </CardContent>
    </Card>
  );
}
