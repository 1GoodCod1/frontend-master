import { Formik } from 'formik';
import * as Yup from 'yup';
import { FormikTextField } from '@/components/ui/FormikTextField';
import { FormikTextarea } from '@/components/ui/FormikTextarea';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import type { CreateCategoryDto } from '@/types';
import { CATEGORY_LUCIDE_ICON_OPTIONS } from '@/constants/categoryAdminIcons';
import { cn } from '@/lib/utils';

const Schema = Yup.object({
  nameRo: Yup.string().trim().required('Required'),
  nameRu: Yup.string().trim().optional(),
  nameEn: Yup.string().trim().optional(),
  slug: Yup.string().trim().required('Required'),
  description: Yup.string().optional(),
  icon: Yup.string().optional(),
  iconKey: Yup.string().optional(),
  iconUrl: Yup.string().optional(),
  sortOrder: Yup.number().nullable().transform((v, o) => (o === '' ? null : v)).optional(),
  isActive: Yup.boolean().optional(),
});

export type CategoryFormValues = {
  nameRo: string;
  nameRu: string;
  nameEn: string;
  slug: string;
  description: string;
  icon: string;
  iconKey: string;
  iconUrl: string;
  sortOrder: number;
  isActive: boolean;
};

interface CategoryUpsertDialogProps {
  open: boolean;
  mode: 'create' | 'edit';
  initial: CategoryFormValues;
  onClose: () => void;
  onSubmit: (values: CreateCategoryDto) => Promise<void>;
}

function toCreateDto(values: CategoryFormValues): CreateCategoryDto {
  const ro = values.nameRo.trim();
  const ru = values.nameRu.trim() || ro;
  const en = values.nameEn.trim() || ro;
  return {
    name: ro,
    slug: values.slug.trim(),
    description: values.description.trim() || undefined,
    icon: values.icon.trim() || undefined,
    iconKey: values.iconKey.trim() || undefined,
    iconUrl: values.iconUrl.trim() || undefined,
    translations: {
      ro: { name: ro },
      ru: { name: ru },
      en: { name: en },
    },
    sortOrder: typeof values.sortOrder === 'number' ? values.sortOrder : 0,
    isActive: values.isActive,
  };
}

export default function CategoryUpsertDialog({
  open,
  mode,
  initial,
  onClose,
  onSubmit,
}: CategoryUpsertDialogProps) {
  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-extrabold">
            {mode === 'create' ? 'Create category' : 'Edit category'}
          </DialogTitle>
        </DialogHeader>
        <Formik
          initialValues={initial}
          enableReinitialize
          validationSchema={Schema}
          onSubmit={async (values, helpers) => {
            try {
              await onSubmit(toCreateDto(values));
              helpers.setSubmitting(false);
              onClose();
            } catch {
              helpers.setSubmitting(false);
            }
          }}
        >
          {({ values, isSubmitting, submitForm, setFieldValue }) => (
            <>
              <div className="flex flex-col gap-3 py-2">
                <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">
                  Names (API translations)
                </p>
                <FormikTextField label="Name (RO) *" name="nameRo" placeholder="Instalații sanitare" />
                <FormikTextField label="Name (RU)" name="nameRu" placeholder="Сантехника" />
                <FormikTextField label="Name (EN)" name="nameEn" placeholder="Plumbing" />
                <FormikTextField label="Slug *" name="slug" placeholder="santehnika" />
                <FormikTextarea
                  label="Description"
                  name="description"
                  placeholder="Optional..."
                  rows={2}
                  className="w-full"
                />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor="iconKey">Lucide icon</Label>
                    <select
                      id="iconKey"
                      className={cn(
                        'flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm',
                        'ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                      )}
                      value={values.iconKey}
                      onChange={(e) => setFieldValue('iconKey', e.target.value)}
                    >
                      <option value="">— None (emoji / default) —</option>
                      {CATEGORY_LUCIDE_ICON_OPTIONS.map((opt) => (
                        <option key={opt} value={opt}>
                          {opt}
                        </option>
                      ))}
                    </select>
                  </div>
                  <FormikTextField label="Emoji fallback" name="icon" placeholder="🚿" />
                </div>
                <FormikTextField
                  label="Icon image URL"
                  name="iconUrl"
                  placeholder="https://..."
                />
                <FormikTextField label="Sort order" name="sortOrder" type="number" />
                <div className="flex items-center space-x-2">
                  <Switch
                    id="category-active"
                    checked={Boolean(values.isActive)}
                    onCheckedChange={(checked) => setFieldValue('isActive', checked)}
                  />
                  <Label htmlFor="category-active">Active</Label>
                </div>
              </div>
              <DialogFooter className="gap-2 sm:gap-0">
                <Button
                  type="button"
                  onClick={onClose}
                  disabled={isSubmitting}
                  className="border-0 bg-amber-50 text-amber-700 shadow-sm transition-all hover:bg-amber-100 dark:bg-amber-900/30 dark:text-amber-400 dark:hover:bg-amber-800/40"
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  onClick={() => submitForm()}
                  disabled={isSubmitting}
                  className="border-0 bg-amber-600 text-white shadow-lg transition-all hover:-translate-y-0.5 hover:bg-amber-700 hover:shadow-xl dark:bg-amber-700 dark:hover:bg-amber-600"
                >
                  {mode === 'create' ? 'Create' : 'Save'}
                </Button>
              </DialogFooter>
            </>
          )}
        </Formik>
      </DialogContent>
    </Dialog>
  );
}
