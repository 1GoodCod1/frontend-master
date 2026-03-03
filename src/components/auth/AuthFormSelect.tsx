import { useField } from 'formik';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import type { ReactNode } from 'react';

export interface AuthFormSelectOption {
  value: string;
  label: string;
}

interface AuthFormSelectProps {
  name: string;
  label: string;
  placeholder: string;
  options: AuthFormSelectOption[];
  icon?: ReactNode;
  disabled?: boolean;
  className?: string;
  id?: string;
}

const EMPTY_VALUE = '__none__';

export function AuthFormSelect({
  name,
  label,
  placeholder,
  options,
  icon,
  disabled,
  className,
  id: idProp,
}: AuthFormSelectProps) {
  const [field, meta, helpers] = useField<string>(name);
  const showError = Boolean(meta.touched && meta.error);
  const id = idProp ?? `field-${name}`;

  const value = field.value || EMPTY_VALUE;

  return (
    <div className={cn('auth-input-wrapper flex flex-col gap-1.5', className)}>
      <label
        htmlFor={id}
        className={cn(
          'auth-label',
          showError && '!text-red-500 dark:!text-red-400'
        )}
      >
        {label}
      </label>
      <div className="auth-input-with-icon relative flex items-center">
        {icon && (
          <span className="auth-input-icon pointer-events-none absolute left-3.5 top-1/2 z-10 flex -translate-y-1/2">
            {icon}
          </span>
        )}
        <Select
          value={value}
          onValueChange={(v) => helpers.setValue(v === EMPTY_VALUE ? '' : v)}
          onOpenChange={(open) => {
            if (!open) field.onBlur({ target: { name } } as React.FocusEvent<HTMLInputElement>);
          }}
          disabled={disabled}
        >
          <SelectTrigger
            id={id}
            className={cn(
              'auth-input h-auto min-h-[46px] w-full border-[1.5px] bg-[#f5f5f5] py-3 text-[0.875rem] dark:bg-[#1a1a1a]',
              icon ? 'pl-[42px]' : 'pl-3.5',
              'pr-10',
              'border-[#e0e0e0] dark:border-[#2a2a2a]',
              'focus:border-[#f97316] focus:ring-[#f97316]/20 focus:ring-[3px]',
              'dark:focus:border-[#f97316]',
              showError && '!border-red-500 dark:!border-red-400'
            )}
            aria-invalid={showError}
          >
            <SelectValue placeholder={placeholder} />
          </SelectTrigger>
        <SelectContent
          className="max-h-[240px] overflow-y-auto"
          position="popper"
        >
          <SelectItem value={EMPTY_VALUE} className="text-[#b0b0b0] dark:text-[#444444]">
            {placeholder}
          </SelectItem>
          {options.map((opt) => (
            <SelectItem key={opt.value} value={opt.value}>
              {opt.label}
            </SelectItem>
          ))}
        </SelectContent>
        </Select>
      </div>
      {showError && meta.error && (
        <p className="text-sm font-medium text-red-500 dark:text-red-400">
          {meta.error}
        </p>
      )}
    </div>
  );
}
