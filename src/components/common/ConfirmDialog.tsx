import { useTranslation } from 'react-i18next';
import { AlertTriangle, CheckCircle, Info } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export type ConfirmDialogProps = {
  open: boolean;
  title: string;
  description?: string;
  confirmText?: string;
  cancelText?: string;
  confirmColor?: 'primary' | 'secondary' | 'inherit' | 'error' | 'success' | 'warning' | 'info';
  isLoading?: boolean;
  contentClassName?: string;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
};

const iconMap = {
  error: { Icon: AlertTriangle, bg: 'bg-destructive/10', text: 'text-destructive', border: 'border-destructive/20' },
  warning: { Icon: AlertTriangle, bg: 'bg-amber-500/10', text: 'text-amber-600 dark:text-amber-400', border: 'border-amber-500/20' },
  success: { Icon: CheckCircle, bg: 'bg-emerald-500/10', text: 'text-emerald-600 dark:text-emerald-400', border: 'border-emerald-500/20' },
  primary: { Icon: Info, bg: 'bg-primary/10', text: 'text-primary', border: 'border-primary/20' },
  secondary: { Icon: Info, bg: 'bg-muted', text: 'text-muted-foreground', border: 'border-border' },
  inherit: { Icon: Info, bg: 'bg-muted', text: 'text-muted-foreground', border: 'border-border' },
  info: { Icon: Info, bg: 'bg-sky-500/10', text: 'text-sky-600 dark:text-sky-400', border: 'border-sky-500/20' },
};

export function ConfirmDialog(props: ConfirmDialogProps) {
  const { t } = useTranslation();
  const {
    open,
    title,
    description,
    confirmText = t('common.confirm'),
    cancelText = t('common.cancel'),
    confirmColor = 'primary',
    isLoading,
    contentClassName,
    onClose,
    onConfirm,
  } = props;

  const confirmVariant =
    confirmColor === 'error' ? 'destructive' : 'default';
  const confirmClassName =
    confirmColor === 'warning'
      ? 'bg-amber-600 hover:bg-amber-700 shadow-amber-500/20 shadow-md'
      : confirmColor === 'success'
        ? 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-500/20 shadow-md'
        : undefined;

  const handleOpenChange = (v: boolean) => {
    if (!v && !isLoading) onClose();
  };

  const { Icon, bg, text, border } = iconMap[confirmColor] ?? iconMap.primary;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent
        className={cn('max-w-[calc(100vw-2rem)] sm:max-w-sm min-w-0', contentClassName)}
        onPointerDownOutside={(e) => isLoading && e.preventDefault()}
        onEscapeKeyDown={(e) => isLoading && e.preventDefault()}
      >
        <DialogHeader>
          <div className="flex items-start gap-4">
            <div className={cn('flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border', bg, border)}>
              <Icon className={cn('size-5', text)} />
            </div>
            <div className="min-w-0 flex-1 pt-0.5">
              <DialogTitle className="break-words min-w-0 leading-snug">
                {title}
              </DialogTitle>
              {description && (
                <p className="text-sm text-muted-foreground break-words min-w-0 leading-relaxed mt-1.5">
                  {description}
                </p>
              )}
            </div>
          </div>
        </DialogHeader>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={onClose}
            disabled={Boolean(isLoading)}
            className="min-w-0 shrink-0"
          >
            {cancelText}
          </Button>
          <Button
            variant={confirmVariant}
            className={cn(confirmClassName, 'min-w-0')}
            onClick={onConfirm}
            disabled={Boolean(isLoading)}
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <span className="size-4 rounded-full border-2 border-current border-t-transparent animate-spin" />
                {t('common.loading')}
              </span>
            ) : (
              confirmText
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
