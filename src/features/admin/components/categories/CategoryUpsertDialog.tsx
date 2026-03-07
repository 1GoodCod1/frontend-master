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

const Schema = Yup.object({
  name: Yup.string().trim().required('Required'),
  slug: Yup.string().trim().required('Required'),
  description: Yup.string().optional(),
  icon: Yup.string().optional(),
  sortOrder: Yup.number().nullable().transform((v, o) => (o === '' ? null : v)).optional(),
  isActive: Yup.boolean().optional(),
});

interface CategoryUpsertDialogProps {
  open: boolean;
  mode: 'create' | 'edit';
  initial: CreateCategoryDto & { sortOrder?: number | null };
  onClose: () => void;
  onSubmit: (values: CreateCategoryDto) => Promise<void>;
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
      <DialogContent className="sm:max-w-md">
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
              await onSubmit(values);
              helpers.setSubmitting(false);
              onClose();
            } catch {
              helpers.setSubmitting(false);
            }
          }}
        >
          {({ values, isSubmitting, submitForm, setFieldValue }) => (
            <>
              <div className="flex flex-col gap-4 py-2">
                <FormikTextField label="Name" name="name" placeholder="Plumber" />
                <FormikTextField label="Slug" name="slug" placeholder="plumber" />
                <FormikTextarea
                  label="Description"
                  name="description"
                  placeholder="Optional description..."
                  rows={3}
                  className="w-full"
                />
                <FormikTextField label="Icon" name="icon" placeholder="Optional icon url/name" />
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
                  onClick={onClose}
                  disabled={isSubmitting}
                  className="border-0 bg-amber-50 text-amber-700 shadow-sm transition-all hover:bg-amber-100 dark:bg-amber-900/30 dark:text-amber-400 dark:hover:bg-amber-800/40"
                >
                  Cancel
                </Button>
                <Button
                  onClick={submitForm}
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
