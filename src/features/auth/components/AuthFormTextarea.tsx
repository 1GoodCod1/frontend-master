import { useField } from 'formik';
import { cn } from '@/lib/utils';
import type { ReactNode } from 'react';

interface AuthFormTextareaProps {
  name: string;
  label: string;
  placeholder?: string;
  rows?: number;
  icon?: ReactNode;
  className?: string;
  id?: string;
}

export function AuthFormTextarea({
  name,
  label,
  placeholder,
  rows = 3,
  icon,
  className,
  id: idProp,
}: AuthFormTextareaProps) {
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
      <div className="auth-input-with-icon relative">
        {icon && (
          <span className="auth-input-icon absolute left-3.5 top-3.5 flex">
            {icon}
          </span>
        )}
        <textarea
          id={id}
          rows={rows}
          placeholder={placeholder}
          {...field}
          className={cn(
            'auth-input w-full resize-none font-inherit',
            icon ? 'pl-[42px] pt-3 pb-3' : 'p-3.5',
            'pr-3.5',
            showError && '!border-red-500 dark:!border-red-400'
          )}
          aria-invalid={showError}
        />
      </div>
      {showError && meta.error && (
        <p className="text-sm font-medium text-red-500 dark:text-red-400">
          {meta.error}
        </p>
      )}
    </div>
  );
}
