import { useField } from 'formik';
import { cn } from '@/lib/utils';
import type { ReactNode } from 'react';

interface AuthFormFieldProps {
  name: string;
  label: string;
  type?: string;
  placeholder?: string;
  autoComplete?: string;
  icon?: ReactNode;
  endAdornment?: ReactNode;
  className?: string;
  id?: string;
}

export function AuthFormField({
  name,
  label,
  type = 'text',
  placeholder,
  autoComplete,
  icon,
  endAdornment,
  className,
  id: idProp,
}: AuthFormFieldProps) {
  const [field, meta] = useField(name);
  const showError = Boolean(meta.touched && meta.error);
  const id = idProp ?? `field-${name}`;

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
          <span className="auth-input-icon flex">{icon}</span>
        )}
        <input
          id={id}
          type={type}
          placeholder={placeholder}
          autoComplete={autoComplete}
          {...field}
          className={cn(
            'auth-input w-full outline-none',
            icon ? 'pl-[42px]' : 'pl-3.5',
            endAdornment ? 'pr-14' : 'pr-3.5',
            showError && '!border-red-500 focus:!border-red-500 dark:!border-red-400'
          )}
          aria-invalid={showError}
          aria-describedby={showError ? `${id}-error` : undefined}
        />
        {endAdornment && (
          <span className="absolute right-3 flex cursor-pointer text-muted-foreground">
            {endAdornment}
          </span>
        )}
      </div>
      {showError && meta.error && (
        <p id={`${id}-error`} className="text-sm font-medium text-red-500 dark:text-red-400">
          {meta.error}
        </p>
      )}
    </div>
  );
}
