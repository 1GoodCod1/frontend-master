import { useField } from 'formik';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

export interface FormikSelectOption {
  value: string;
  label: string;
}

type Props = Omit<React.ComponentProps<typeof SelectTrigger>, 'name'> & {
  name: string;
  options: FormikSelectOption[];
  label?: string;
  placeholder?: string;
  fullWidth?: boolean;
};

export function FormikSelect(props: Props) {
  const { name, options, label, placeholder, fullWidth = true, className, id: idProp, disabled } = props;
  const [field, meta, helpers] = useField<string>(name);
  const showError = Boolean(meta.touched && meta.error);
  const id = idProp ?? `field-${name}`;

  return (
    <div className={cn('flex flex-col gap-1.5', fullWidth && 'w-full')}>
      {label && (
        <Label htmlFor={id} className={showError ? 'text-destructive' : undefined}>
          {label}
        </Label>
      )}
      <Select
        value={field.value ?? ''}
        onValueChange={(v) => helpers.setValue(v)}
        onOpenChange={(open) => {
          if (!open) field.onBlur({ target: { name } } as React.FocusEvent<HTMLInputElement>);
        }}
        disabled={disabled}
      >
        <SelectTrigger
          id={id}
          className={cn(
            showError && 'border-destructive focus:ring-destructive',
            className
          )}
          aria-invalid={showError}
          aria-describedby={showError ? `${id}-error` : undefined}
        >
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {options.map((opt) => (
            <SelectItem key={opt.value} value={opt.value}>
              {opt.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {showError && meta.error && (
        <p id={`${id}-error`} className="text-sm text-destructive">
          {meta.error}
        </p>
      )}
    </div>
  );
}
