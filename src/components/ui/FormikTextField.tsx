import { useField } from 'formik';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

type Props = Omit<React.ComponentProps<typeof Input>, 'name'> & {
  name: string;
  label?: string;
  helperText?: string;
  fullWidth?: boolean;
  /** Right-side slot (e.g. password visibility toggle) */
  endAdornment?: React.ReactNode;
};

export function FormikTextField(props: Props) {
  const { name, label, helperText, fullWidth = true, className, id: idProp, endAdornment, ...rest } = props;
  const [field, meta] = useField(name);
  const showError = Boolean(meta.touched && meta.error);
  const id = idProp ?? `field-${name}`;

  return (
    <div className={cn('flex flex-col gap-1.5', fullWidth && 'w-full')}>
      {label && (
        <Label htmlFor={id} className={showError ? 'text-red-500 dark:text-red-400' : undefined}>
          {label}
        </Label>
      )}
      <div className="relative">
        <Input
          id={id}
          {...field}
          {...rest}
          className={cn(
            showError && 'border-red-500 focus-visible:ring-red-500 dark:border-red-400 dark:focus-visible:ring-red-400',
            endAdornment && 'pr-10',
            className
          )}
          aria-invalid={showError}
          aria-describedby={showError ? `${id}-error` : undefined}
        />
        {endAdornment && <div className="absolute right-2 top-1/2 -translate-y-1/2">{endAdornment}</div>}
      </div>
      {(showError ? meta.error : helperText) && (
        <p
          id={showError ? `${id}-error` : undefined}
          className={cn('text-sm font-medium', showError ? 'text-red-500 dark:text-red-400' : 'text-muted-foreground')}
        >
          {showError ? meta.error : helperText}
        </p>
      )}
    </div>
  );
}
