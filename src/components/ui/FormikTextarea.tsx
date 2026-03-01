import { useField } from 'formik';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';

interface FormikTextareaProps {
    name: string;
    label?: string;
    placeholder?: string;
    disabled?: boolean;
    className?: string;
    rows?: number;
}

export function FormikTextarea({
    name,
    label,
    placeholder,
    disabled,
    className,
    rows = 4,
}: FormikTextareaProps) {
    const [field, meta] = useField(name);
    const showError = Boolean(meta.touched && meta.error);

    return (
        <div className={cn("space-y-2", className)}>
            {label && (
                <Label
                    htmlFor={name}
                    className={cn(showError && "text-red-500 dark:text-red-400 font-medium")}
                >
                    {label}
                </Label>
            )}
            <Textarea
                id={name}
                placeholder={placeholder}
                disabled={disabled}
                rows={rows}
                {...field}
                className={cn(
                    "rounded-xl border-border/50 bg-background/50 hover:border-primary/30 focus-visible:ring-primary/20 transition-all duration-300",
                    showError && "border-red-500 focus-visible:ring-red-500 dark:border-red-400 dark:focus-visible:ring-red-400"
                )}
            />
            {showError && (
                <p className="text-sm text-red-500 dark:text-red-400 font-medium animate-in fade-in slide-in-from-top-1 duration-200">
                    {meta.error}
                </p>
            )}
        </div>
    );
}
