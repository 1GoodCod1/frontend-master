import { Formik } from 'formik';
import * as Yup from 'yup';
import { FormikTextField } from '@/components/ui/FormikTextField';
import { FormikTextarea } from '@/components/ui/FormikTextarea';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogBody,
} from '@/components/ui/dialog';
import type { CreateCategoryDto } from '@/types';
import { CATEGORY_LUCIDE_ICON_OPTIONS } from '@/constants/categoryAdminIcons';

/** Radix Select cannot use empty string as an item value; map to real "" in form state. */
const ICON_KEY_EMPTY = '__none__';

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
      <DialogContent className="flex max-h-[min(90vh,calc(100dvh-2rem))] w-[calc(100vw-2rem)] max-w-xl flex-col gap-0 p-0 sm:max-w-xl">
        <DialogHeader className="px-6 pt-6 pb-5">
          <DialogTitle className="text-xl font-bold tracking-tight">
            {mode === 'create' ? 'Create category' : 'Edit category'}
          </DialogTitle>
          <p className="text-sm text-muted-foreground pr-2">
            Names are stored per locale; the slug is used in URLs.
          </p>
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
              <DialogBody className="space-y-6 py-5">
                <section className="space-y-4">
                  <div>
                    <h3 className="text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                      Names &amp; slug
                    </h3>
                    <p className="mt-1 text-xs text-muted-foreground/90">
                      API translations (RO required; RU/EN fall back to RO if empty).
                    </p>
                  </div>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <FormikTextField label="Name (RO) *" name="nameRo" placeholder="Instalații sanitare" />
                    <FormikTextField label="Name (RU)" name="nameRu" placeholder="Сантехника" />
                    <FormikTextField label="Name (EN)" name="nameEn" placeholder="Plumbing" />
                    <FormikTextField label="Slug *" name="slug" placeholder="santehnika" />
                  </div>
                </section>

                <Separator className="bg-border/60" />

                <section className="space-y-3">
                  <h3 className="text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                    Description
                  </h3>
                  <FormikTextarea
                    name="description"
                    placeholder="Optional short description…"
                    rows={3}
                    className="w-full"
                  />
                </section>

                <Separator className="bg-border/60" />

                <section className="space-y-4">
                  <div>
                    <h3 className="text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                      Icon &amp; visibility
                    </h3>
                    <p className="mt-1 text-xs text-muted-foreground/90">
                      Pick a Lucide icon, or leave none and use an emoji or image URL.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-x-4 sm:gap-y-0">
                    <div className="flex flex-col gap-1.5">
                      <Label htmlFor="category-icon-key-trigger">Lucide icon</Label>
                      <Select
                        value={values.iconKey ? values.iconKey : ICON_KEY_EMPTY}
                        onValueChange={(v) =>
                          setFieldValue('iconKey', v === ICON_KEY_EMPTY ? '' : v)
                        }
                      >
                        <SelectTrigger
                          id="category-icon-key-trigger"
                          className="h-9 w-full"
                          aria-label="Lucide icon"
                        >
                          <SelectValue placeholder="None (emoji / default)" />
                        </SelectTrigger>
                        <SelectContent className="z-[70]">
                          <SelectItem value={ICON_KEY_EMPTY}>None (emoji / default)</SelectItem>
                          {CATEGORY_LUCIDE_ICON_OPTIONS.map((opt) => (
                            <SelectItem key={opt} value={opt}>
                              {opt}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <FormikTextField label="Emoji fallback" name="icon" placeholder="🚿" />
                  </div>

                  <FormikTextField label="Icon image URL" name="iconUrl" placeholder="https://…" />

                  <div className="grid grid-cols-1 items-end gap-4 sm:grid-cols-2">
                    <FormikTextField label="Sort order" name="sortOrder" type="number" />
                    <div className="flex min-h-[72px] flex-col justify-center gap-2 rounded-xl border border-slate-200/90 bg-stone-50/60 px-4 py-3 shadow-sm dark:border-white/[0.12] dark:bg-white/[0.04]">
                      <div className="flex items-center justify-between gap-3">
                        <div className="min-w-0 space-y-0.5">
                          <Label htmlFor="category-active" className="text-sm font-medium">
                            Active
                          </Label>
                          <p className="text-xs text-muted-foreground">Shown in listings when on.</p>
                        </div>
                        <Switch
                          id="category-active"
                          checked={Boolean(values.isActive)}
                          onCheckedChange={(checked) => setFieldValue('isActive', checked)}
                        />
                      </div>
                    </div>
                  </div>
                </section>
              </DialogBody>
              <DialogFooter className="gap-2 sm:gap-2.5">
                <Button
                  type="button"
                  variant="outline"
                  onClick={onClose}
                  disabled={isSubmitting}
                  className="min-w-[7rem] border-amber-500/50 bg-transparent text-amber-800 hover:bg-amber-50 dark:border-amber-500/40 dark:text-amber-300 dark:hover:bg-amber-950/40"
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  onClick={() => submitForm()}
                  disabled={isSubmitting}
                  className="min-w-[7rem] border-0 bg-amber-600 text-white shadow-md transition-all hover:bg-amber-700 hover:shadow-lg dark:bg-amber-600 dark:hover:bg-amber-500"
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
