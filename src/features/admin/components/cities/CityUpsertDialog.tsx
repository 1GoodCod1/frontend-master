import { Formik } from 'formik';
import * as Yup from 'yup';
import { FormikTextField } from '@/components/ui/FormikTextField';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogBody,
} from '@/components/ui/dialog';
import type { CreateCityDto } from '@/types';

const Schema = Yup.object({
  nameRo: Yup.string().trim().required('Required'),
  nameRu: Yup.string().trim().optional(),
  nameEn: Yup.string().trim().optional(),
  slug: Yup.string().trim().required('Required'),
  isActive: Yup.boolean().optional(),
});

export type CityFormValues = {
  nameRo: string;
  nameRu: string;
  nameEn: string;
  slug: string;
  isActive: boolean;
};

interface CityUpsertDialogProps {
  open: boolean;
  mode: 'create' | 'edit';
  initial: CityFormValues;
  onClose: () => void;
  onSubmit: (values: CreateCityDto) => Promise<void>;
}

function toCreateDto(values: CityFormValues): CreateCityDto {
  const ro = values.nameRo.trim();
  const ru = values.nameRu.trim() || ro;
  const en = values.nameEn.trim() || ro;
  return {
    name: ro,
    slug: values.slug.trim(),
    translations: {
      ro: { name: ro },
      ru: { name: ru },
      en: { name: en },
    },
    isActive: values.isActive,
  };
}

export default function CityUpsertDialog({
  open,
  mode,
  initial,
  onClose,
  onSubmit,
}: CityUpsertDialogProps) {
  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="flex max-h-[min(90vh,calc(100dvh-2rem))] w-[calc(100vw-2rem)] max-w-xl flex-col gap-0 p-0 sm:max-w-xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold tracking-tight">
            {mode === 'create' ? 'Create city' : 'Edit city'}
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
                    <FormikTextField label="Name (RO) *" name="nameRo" placeholder="Chișinău" />
                    <FormikTextField label="Name (RU)" name="nameRu" placeholder="Кишинёв" />
                    <FormikTextField label="Name (EN)" name="nameEn" placeholder="Chișinău" />
                    <FormikTextField label="Slug *" name="slug" placeholder="chisinau" />
                  </div>
                </section>

                <Separator className="bg-border/60" />

                <section className="space-y-3">
                  <div>
                    <h3 className="text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                      Visibility
                    </h3>
                    <p className="mt-1 text-xs text-muted-foreground/90">
                      Inactive cities can be hidden from selection lists depending on app rules.
                    </p>
                  </div>
                  <div className="rounded-xl border border-slate-200/90 bg-stone-50/60 px-4 py-3 shadow-sm dark:border-white/[0.12] dark:bg-white/[0.04]">
                    <div className="flex items-center justify-between gap-3">
                      <div className="min-w-0 space-y-0.5">
                        <Label htmlFor="city-active" className="text-sm font-medium">
                          Active
                        </Label>
                        <p className="text-xs text-muted-foreground">Shown in listings when on.</p>
                      </div>
                      <Switch
                        id="city-active"
                        checked={Boolean(values.isActive)}
                        onCheckedChange={(checked) => setFieldValue('isActive', checked)}
                      />
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
