import { Formik } from 'formik';
import * as Yup from 'yup';
import { FormikTextField } from '@/components/ui/FormikTextField';
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
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-extrabold">
            {mode === 'create' ? 'Create city' : 'Edit city'}
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
                <FormikTextField label="Name (RO) *" name="nameRo" placeholder="Chișinău" />
                <FormikTextField label="Name (RU)" name="nameRu" placeholder="Кишинёв" />
                <FormikTextField label="Name (EN)" name="nameEn" placeholder="Chișinău" />
                <FormikTextField label="Slug *" name="slug" placeholder="chisinau" />
                <div className="flex items-center space-x-2">
                  <Switch
                    id="city-active"
                    checked={Boolean(values.isActive)}
                    onCheckedChange={(checked) => setFieldValue('isActive', checked)}
                  />
                  <Label htmlFor="city-active">Active</Label>
                </div>
              </div>
              <DialogFooter className="gap-2">
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
